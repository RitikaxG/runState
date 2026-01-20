# Monitoring Worker

This document describes how the Monitoring Worker processes website monitoring tasks using Redis Streams, performs concurrent health checks, persists monitoring data, and emits status-change events.

---

## 1. Consumer Group Initialization

- On startup, the worker ensures that a Redis consumer group exists for the `MONITORING_STREAM`.

- If the consumer group does not exist, it is created automatically.

- This allows multiple workers (same or different regions) to safely consume from the same stream without duplicating work.

---

## 2. Reading Events from the Monitoring Stream

- Each worker continuously reads events from `MONITORING_STREAM` using `XREADGROUP`.

- A single worker reads up to **N** events at a time (e.g., 5 events per read).

- Each event represents a single website check task, containing:
  - `websiteId`
  - `url`

---

## 3. Concurrent Website Checks

- For every batch of stream messages:
  - The worker creates an array of promises.

- Each promise represents one website health check.

- All website checks in the batch are executed concurrently.

---

## 4. Website Health Check (`checkAndUpdateStatus`)

- For each website event:

### HTTP Check
- An HTTP request is sent to the website URL using Axios.
- Response time is measured.
- A timeout is enforced to avoid hanging requests.

### Determine Website Status
- The HTTP response is mapped to a logical website status  
  (up, down, unknown, etc.).

### Fetch Previous Status
- The previous status is first fetched from Redis using the key: `website:<websiteId>:status`
- If not found in Redis, the status is fetched from the database and cached in Redis.

### Persist Monitoring Data
- A new record is inserted into the `websiteTicks` table containing:
- `status`
- `responseTimeMs`
- `websiteId`
- `regionId`

---

## 5. Handling First-Time Status

- If no previous status exists:
- The website’s `currentStatus` is updated in the database.
- The status is cached in Redis.
- No status-change event is emitted for first-time initialization.

---

## 6. Detecting and Emitting Status Changes

- If the current status differs from the previous status:
- The website’s `currentStatus` is updated in the database.
- Redis cache is updated with the new status.
- A status-change event is emitted to the `STATUS_CHANGE_STREAM` containing:
  - `websiteId`
  - `prevStatus`
  - `currentStatus`
  - `occurredAt`

- This stream is later consumed by downstream workers (`worker-status-change`).

---

## 7. Message Acknowledgement

- Only messages that are successfully processed are acknowledged.

- After all concurrent checks complete:
- The worker filters successful tasks.
- Corresponding message IDs are acknowledged using `XACK`.

- This guarantees at-least-once processing.

---

## 8. In-Flight Job Tracking

- The worker maintains an `inFlight` counter:
- Incremented when a task starts.
- Decremented when the task completes.

- This helps track active work during shutdown.

---

## 9. Graceful Shutdown

- On receiving a shutdown signal:
- The worker stops reading new messages.
- It waits for all in-flight jobs to complete.

- A configurable shutdown timeout prevents hanging indefinitely.

- If the timeout is exceeded, the worker exits forcefully.
