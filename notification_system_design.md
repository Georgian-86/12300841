# Notification System Design Docs

## Stage 1 — Notification API

Here are the core REST endpoints we need to display notifications for logged-in students. The approach is to keep it standard REST, paginated, and include filtering for different types.

### 1. Get Notifications
- **Endpoint**: `GET /notifications`
- **What it does**: Gets the notification feed for the current user. Supports pagination and type filtering.
- **Query Params**:
  - `page`: default 1
  - `limit`: default 10
  - `notification_type`: e.g. "Placement", "Result", "Event" (optional)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "notifications": [
    {
      "ID": "uuid",
      "Type": "Placement",
      "Message": "Google is visiting campus",
      "Timestamp": "2026-04-22 17:51:30"
    }
  ]
}
```

### 2. Mark as Read (Optional but usually needed)
- **Endpoint**: `PATCH /notifications/:id/read`
- **What it does**: Marks a specific notification as viewed.
- **Response**: `200 OK`

### Real-time mechanism
For real-time updates, we can just use WebSockets (like Socket.io). When a backend event triggers a new notification, it emits a `new_notification` event to the specific user's socket room so the UI updates instantly without polling.

---

## Stage 2 — Database Selection

I'd suggest going with **PostgreSQL** for this. Notifications are structured, relational data (linked to students), and Postgres handles concurrent writes and complex indexing really well. If data volume gets completely out of hand (like billions of rows), we could look at NoSQL like Cassandra or DynamoDB, but Postgres can easily scale to hundreds of millions with proper partitioning.

### Schema Idea
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Dealing with scale
As the table grows, the main problem will be slow read queries. To fix this:
1. We can create an index on `(student_id, is_read, created_at DESC)`.
2. Setup table partitioning by month so old notifications don't slow down current queries.

---

## Stage 3 — Query Optimization

The developer's old query:
```sql
SELECT * FROM notifications 
WHERE studentID = 1042 AND isRead = false 
ORDER BY createdAt ASC;
```

**Why it's slow:**
1. It has no `LIMIT`. If a student hasn't logged in for a year, it might pull thousands of rows into memory.
2. `ORDER BY createdAt ASC` is usually not what you want (users want newest first, so `DESC`), and doing a massive sort without a matching index is expensive.
3. `SELECT *` pulls unnecessary data.

**The Fix:**
```sql
SELECT id, type, message, created_at 
FROM notifications 
WHERE student_id = 1042 AND is_read = false 
ORDER BY created_at DESC 
LIMIT 50;
```

**Adding indexes everywhere?**
No, adding indexes on every column is a bad idea. Every index slows down `INSERT` and `UPDATE` operations because the database has to update the index tree. It also eats up disk space. We only need indexes on columns we frequently filter or sort by.

**Query for recent placement notifications:**
```sql
SELECT DISTINCT student_id 
FROM notifications 
WHERE type = 'Placement' 
AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4 — Handling High Load

Fetching notifications directly from the DB on every single page load will definitely crush the database. 

**My suggestions to improve this:**
1. **Redis Caching**: Cache the top 50 notifications for active users in Redis. When the page loads, hit Redis first. It's an in-memory store so it's blazing fast.
   - *Tradeoff*: We have to write logic to keep the cache and DB in sync (cache invalidation).
2. **WebSocket Push**: Instead of the client polling or fetching on every route change, just push updates over a WebSocket connection.
   - *Tradeoff*: Managing persistent WebSocket connections requires more server memory and infrastructure setup.
3. **Cursor Pagination**: Use cursor-based pagination instead of offset pagination for the infinite scroll, which is much faster on large tables.

---

## Stage 5 — Reliable "Notify All"

The pseudocode fails 200 students midway, meaning the rest of the students in the loop never get their notification. 

**Shortcomings:**
1. It's a synchronous loop. It blocks the main thread.
2. If `send_email` throws an error, the loop crashes.
3. Saving to DB and sending emails should not happen in the same synchronous flow because email APIs are slow and prone to timeouts.

**How to fix it:**
We should decouple the process using a Message Queue (like RabbitMQ or AWS SQS) and background workers.

```python
# API Endpoint just queues the job and returns 200 OK immediately
function notify_all(student_ids, message):
    for batch in chunk(student_ids, 1000):
        enqueue_job("bulk_notification_job", { ids: batch, message: message })
    return "Processing started"

# Background Worker (can run on multiple servers)
function process_bulk_notification_job(data):
    # 1. Bulk insert into DB first (fast)
    db.bulk_insert_notifications(data.ids, data.message)
    
    # 2. Queue individual email jobs so failures are isolated
    for student_id in data.ids:
        enqueue_job("send_email_job", { id: student_id, message: data.message })

# Separate Background Worker just for emails
function process_send_email_job(data):
    try:
        send_email(data.id, data.message)
    except Error:
        # If email fails, the queue will automatically retry it later
        throw RetryError()
```
This way, a failed email doesn't stop the whole batch, and the database updates instantly.

---

## Stage 6 — Priority Inbox Approach

<img width="1746" height="942" alt="image" src="https://github.com/user-attachments/assets/131ba235-ebd8-44bd-a61b-58134ebda9b9" />
<img width="1398" height="904" alt="image" src="https://github.com/user-attachments/assets/bec64dfd-0958-493c-8a44-11ab5b4818d1" />


For the priority inbox, I built a custom sorting algorithm on the frontend (since the prompt said "DB query is not expected"). 

**How it works:**
1. I assigned a weight dictionary: `Placement = 3`, `Result = 2`, `Event = 1`.
2. I fetch a batch of recent notifications from the API.
3. The JavaScript `sort()` function compares the weights of two notifications. If they have the same weight, it falls back to comparing their `Timestamp` so the newer one wins.
4. I then `.slice(0, n)` to grab just the top $N$ items.

**Handling new incoming notifications efficiently:**
Instead of re-sorting the entire array every time a single new WebSocket notification arrives, we can just use an insertion sort approach. We find the correct index for the new notification based on its weight/timestamp and splice it into the array, then pop off the last item if the array exceeds $N$. This keeps the operation at O(N) instead of O(N log N).

---

## Stage 7 — API Verification

To ensure the backend-to-frontend integration and the Next.js API proxies are functioning correctly, we verified the output of our local endpoints.

**Example Response from `GET /api/notifications`:**
```json
{
  "notifications": [
    {
      "ID": "fef2079e-4ade-4773-ad59-0d937090ae5e",
      "Type": "Placement",
      "Message": "Marvell Technology Inc. hiring",
      "Timestamp": "2026-05-13 20:37:58"
    },
    {
      "ID": "3ce3617f-eeb5-49db-9911-2297af832fd1",
      "Type": "Result",
      "Message": "internal",
      "Timestamp": "2026-05-14 01:07:41"
    },
    {
      "ID": "269301a5-9107-452d-9047-e8e80cc29c37",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-05-13 23:07:24"
    }
  ]
}
```
This confirms our server-side proxy is correctly handling the Bearer token authorization and formatting the response for the frontend components.

