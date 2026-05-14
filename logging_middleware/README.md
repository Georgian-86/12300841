# Logging Middleware

Reusable logging function for the Notification System evaluation.

## Requirements
- `ACCESS_TOKEN` must be present in the root `.env` file.

## Usage
```typescript
import { Log } from './logger';

await Log('backend', 'info', 'service', 'Notification service started');
```

## API Endpoint
`POST http://4.224.186.213/evaluation-service/logs`

## Payload Structure
```json
{
  "stack": "backend",
  "level": "info",
  "packageName": "service",
  "message": "message"
}
```
