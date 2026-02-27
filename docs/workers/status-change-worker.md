# Worker: Status Change Worker

## Overview

The status change worker consumes website status transition events and forwards them to the notification pipeline..

This worker is triggered only when a website’s status changes, which is a relatively infrequent event.

---

## Flow

### Consumer Group Initialization

- Ensures the consumer group for STATUS_CHANGE_STREAM exists.
- Creates it if it does not already exist.

---

### Read From Status Change Stream

- Continuously reads messages from STATUS_CHANGE_STREAM.
- Each message represents a single website status change.

---

### Event Processing

- Iterates over each stream response.
- For each message, creates an async task.
- All tasks are executed concurrently.

---

### Push to Notification Stream

- For every status change event, a corresponding message is pushed to NOTIFICATION_STREAM.

---

### STATUS_CHANGE_STREAM payload

- websiteId  
- prevStatus  
- currentStatus  
- occurredAt  

---

### NOTIFICATION_STREAM payload

- websiteId  
- regionId (empty string if not available)  
- prevStatus  
- currentStatus  
- occurredAt  

---

### Acknowledgement

- Collects ackIds for messages that were successfully processed.
- Acknowledges only those messages back to Redis.

---

### Concurrency Model

- Events are processed concurrently.
- No batching is used since status change events are rare and do not create Redis pressure.

---

### Failure Handling

- Messages that fail during processing are not acknowledged.
- Unacknowledged messages remain pending and can be retried.
