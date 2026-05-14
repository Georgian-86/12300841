interface Notification {
  id: string;
  type: 'Placement' | 'Result' | 'Event';
  message: string;
  createdAt: Date;
  priorityScore: number;
}

const PriorityMap: Record<string, number> = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

class MinHeap {
  private heap: Notification[] = [];

  constructor(private capacity: number) {}

  insert(notif: Notification) {
    if (this.heap.length < this.capacity) {
      this.heap.push(notif);
      this.bubbleUp(this.heap.length - 1);
    } else if (this.compare(notif, this.heap[0]) > 0) {
      this.heap[0] = notif;
      this.bubbleDown(0);
    }
  }

  private compare(a: Notification, b: Notification): number {
    // Returns > 0 if a is "greater" (higher priority/newer) than b
    if (a.priorityScore !== b.priorityScore) {
      return a.priorityScore - b.priorityScore;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else break;
    }
  }

  private bubbleDown(index: number) {
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else break;
    }
  }

  getSortedResults(): Notification[] {
    return this.heap.sort((a, b) => this.compare(b, a));
  }
}

/**
 * Stage 6: Find TOP 10 notifications based on Priority and Recency.
 * Complexity: O(n log k) where k is the number of results to find.
 */
export function getTopNotifications(notifications: any[], k: number = 10): Notification[] {
  const heap = new MinHeap(k);

  notifications.forEach(n => {
    const notif: Notification = {
      ...n,
      priorityScore: PriorityMap[n.type] || 0,
      createdAt: new Date(n.createdAt)
    };
    heap.insert(notif);
  });

  return heap.getSortedResults();
}

// Example usage and demonstration
const sampleNotifications = [
  { id: '1', type: 'Event', message: 'Old Event', createdAt: '2024-05-01' },
  { id: '2', type: 'Placement', message: 'New Placement', createdAt: '2024-05-14' },
  { id: '3', type: 'Result', message: 'Old Result', createdAt: '2024-05-05' },
  { id: '4', type: 'Placement', message: 'Old Placement', createdAt: '2024-05-10' },
  { id: '5', type: 'Result', message: 'New Result', createdAt: '2024-05-12' },
  // ... more
];

console.log('Top 3 Notifications:', getTopNotifications(sampleNotifications, 3));
