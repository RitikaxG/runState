# Pusher Node (Monitoring Stream Producer)

The pusher service is responsible for periodically enqueueing website monitoring jobs into Redis so that monitoring workers can process them in parallel..

---

## 1. Periodic Website Fetch

At every fixed interval (for example, every 3 seconds or every 3 minutes depending on configuration), the pusher fetches all registered websites from the database.

Each website record contains:
- websiteId
- url

---

## 2. Batch-Based Stream Insertion

Websites are not pushed to Redis all at once.

Instead, they are pushed in controlled batches to avoid overwhelming Redis and downstream consumers.

- BATCH_SIZE = 200

Example:
- Total websites = 5000
- Number of batches = 5000 / 200 = 25 batches

---

## 3. How Batching Works

For each batch, the pusher performs the following steps:

- Takes 200 websites at a time
- Pushes each website as an individual event into MONITORING_STREAM using XADD

Each batch results in:
- 200 XADD calls
- 200 monitoring jobs

These jobs are immediately available for monitoring workers to consume.

Example:

- Batch 1 → websites 1–200 → 200 XADD calls
- Batch 2 → websites 201–400 → 200 XADD calls
- ...
- Batch 25 → websites 4801–5000 → 200 XADD calls

---

## 4. Why Batching Is Required

Batching ensures load control and overall system stability.

It provides the following benefits:

- Prevents overwhelming Redis with thousands of simultaneous XADD calls
- Avoids sudden spikes in memory usage and network traffic
- Allows monitoring workers to start consuming events while pushing is still in progress
- Ensures smooth backpressure handling when consumers are slower than producers

Without batching, pushing thousands of events at once could:

- Spike Redis CPU usage
- Block the Node.js event loop
- Delay monitoring workers
- Cause instability under scale

---

## 5. Stream Trimming (Memory Safety)

Each XADD operation uses Redis stream trimming with a configured MAXLEN threshold.

This ensures:

- The monitoring stream does not grow unbounded
- Old monitoring jobs are automatically evicted
- Redis memory usage remains predictable and controlled
