# worker-notification

The notification worker is responsible for delivering user-facing notifications (email/webhook) when a website’s status changes (DOWN / RECOVERY).

It consumes events from NOTIFICATION_STREAM, applies notification rules, ensures idempotency, retries on failure, and safely acknowledges messages only after successful handling.

---

## Responsibilities

- Consume status-change events from NOTIFICATION_STREAM
- Decide whether a notification should be sent
- Deliver notifications via configured channels
- Guarantee at-least-once processing with idempotency
- Retry failures and move unrecoverable messages to DLQ
- Reclaim stuck messages from pending queue
- Emit heartbeat logs and shut down gracefully

---

## Worker Flow

### Ensure Consumer Group

- Creates notification-group on NOTIFICATION_STREAM if it does not exist.

---

### Reclaim Pending Messages

- Periodically reclaims stale pending messages using XAUTOCLAIM.
- Prevents message loss if a worker crashes mid-processing.

---

### Read From Stream

- Reads messages using XREADGROUP.
- If no messages are available, the worker sleeps and retries.

---

### Concurrent Processing

- Each stream message is processed concurrently.
- Each message represents one status-change notification task.

---

### Send Notification

- Delegates processing to sendNotification(messageId, message).

---

### ACK Strategy

Messages are acknowledged only if:

- Notification was successfully sent (SENT)
- Message was moved to DLQ (DLQ)

Failed or retried messages remain pending.

---

## Message Contract

worker-notification consumes:

NotificationMessage  
- websiteId  
- prevStatus  
- currentStatus  
- occurredAt  

---

## Notification Decision Logic

For each message:

### Detect Status Transition

- UP → DOWN → DOWN
- DOWN → UP → RECOVERY
- Anything else → NO_OP

---

### Idempotency Check

Uses Redis key:

notification:sent:<websiteId>:<statusEventType>

Prevents duplicate notifications for the same transition.

---

### Apply Notification Rules

Rules define:

- Channel (email / webhook)
- When to notify (DOWN / RECOVERY / BOTH)
- Target (email, webhook URL)
- Enabled flag

---

### Rate Limiting

Per website, per channel, per event:

rate:<websiteId>:<channel>:<statusEventType>

Prevents spamming during flapping.

---

### Channel Dispatch

- Sends notification via the configured channel abstraction.

---

## Retry & Failure Handling

Retry count stored in Redis:

notification:retry:<messageId>

- Exponential backoff between retries.

After MAX_TRIES:

- Message is pushed to Dead Letter Queue:
  <NOTIFICATION_STREAM>:dlq

DLQ payload includes:

- messageId
- websiteId
- prevStatus
- currentStatus
- occurredAt
- retry count
- failure reason

---

## Reliability Guarantees

- At-least-once delivery
- Idempotent notification sending
- Crash-safe message recovery
- Channel failure isolation
- No ACK without successful handling

---

## Operational Features

- Heartbeat logs emitted periodically
- Graceful shutdown
  - Stops accepting new work
  - Waits for inflight jobs
  - Prevents partial processing
- Pending queue reclamation
  - Ensures no stuck messages
