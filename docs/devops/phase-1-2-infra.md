# Infrastructure & Containerization (Phase 1 → Phase 2)

This document describes the infrastructure setup and containerization strategy implemented before introducing CI pipelines. It covers Dockerization, service orchestration, externalized services, and environment management.

---

# Phase 1 — Local Containerization

---

## 1. Go Backend Containerization

### Backend Location

- `apps/api-go`

### Dockerfile Strategy

A multi-stage Dockerfile is implemented.

#### Stage 1 — Builder

- Base Image: `golang:1.22-alpine`
- Installs build dependencies
- Copies `go.mod` and `go.sum`
- Downloads modules
- Compiles the Go binary

Purpose:
- Reduce final image size
- Ensure reproducible builds

#### Stage 2 — Runtime

- Minimal base image (Alpine)
- Copies compiled binary from builder stage
- Exposes required port
- Sets entrypoint

Outcome:
- Lightweight production-ready container
- No build tools included in runtime image

---

## 2. Docker Compose Orchestration

Docker Compose is used to orchestrate multi-service local environments.

Two modes are maintained:

---

### 2.1 Local Infrastructure Mode

File:
- `docker-compose.yml`

Services:

- `postgres`
- `redis`
- `api`
- `worker-monitoring`
- `worker-status-change`
- `worker-notification`

Characteristics:

- Postgres runs inside container
- Redis runs inside container
- All services communicate via internal Docker network
- Ports exposed for local development

Command:

docker compose up -d --build

Purpose:

- Simplify local development
- Ensure full system runs with one command
- Enable end-to-end testing

---

### 2.2 Internal Networking Design

- All services share Docker network
- Containers reference each other by service name
  - Example:
    - `postgres:5432`
    - `redis:6379`

Benefits:

- No hardcoded localhost dependencies
- Production-like internal service resolution

---

# Phase 2 — Externalized Services

Phase 2 replaces containerized infrastructure with managed cloud services.

---

## 3. External Database (Neon)

Instead of running Postgres locally:

- Uses managed Postgres (Neon)
- Connection string passed via:

DATABASE_URL

Example format:

postgresql://user:password@host/database?sslmode=require

Benefits:

- Production-like database
- No local container dependency
- Enables real-world SSL configurations

---

## 4. External Redis (Upstash)

Instead of local Redis container:

- Uses managed Redis instance (Upstash)

Configuration options:

- `REDIS_URL` (recommended)
- `REDIS_ADDR`

Connection logic:

- If `REDIS_URL` exists → parse URL
- Else → fallback to `REDIS_ADDR`

Benefits:

- Serverless Redis
- Production-grade latency testing
- No local Redis dependency

---

## 5. External Infrastructure Compose Mode

File:
- `docker-compose.external.yml`

Differences from local mode:

- No Postgres container
- No Redis container
- API and workers connect to cloud services

Command:

docker compose -f docker-compose.external.yml up -d --build

Purpose:

- Simulate production environment locally
- Validate cloud connectivity
- Test TLS configurations

---

## 6. Environment Configuration Strategy

Environment variables are separated per mode.

Files:

- `.env.local` → Local infra mode
- `.env` → Cloud infra mode

Common variables:

- DATABASE_URL
- REDIS_URL
- REDIS_ADDR
- Worker configuration values

This enables:

- Environment isolation
- Clean separation between dev and production configs
- Safe switching between modes

---

## 7. Service Isolation & Worker Architecture

Workers are separated into independent containers.

Examples:

- monitoring worker
- status-change worker
- notification worker

Each worker:

- Connects to Redis streams
- Processes events independently
- Has isolated lifecycle
- Can be horizontally scaled

Benefits:

- Fault isolation
- Production-like architecture
- Scalable worker model

---

## 8. Health Checks & Startup Dependencies

Compose configuration includes:

- Postgres healthcheck using `pg_isready`
- Services wait for dependencies before starting

Purpose:

- Prevent race conditions during startup
- Ensure DB readiness before API connects

---

## 9. Development Workflow Summary

### Local Mode

docker compose up -d --build

- All services run in Docker
- Full stack simulation

### External Mode

docker compose -f docker-compose.external.yml up -d --build

- Uses managed services
- Tests real-world connectivity

---

# Phase 1 & 2 Outcome

After completing Phase 1 and Phase 2:

- The Go backend is fully containerized.
- Services are isolated and orchestrated via Docker Compose.
- Infrastructure can run in two modes:
  - Fully local
  - Production-like cloud-managed
- Environment variables cleanly separate configurations.
- Workers are independently scalable.
- The system architecture mirrors production service separation.

This establishes a stable infrastructure foundation.

Next Phase:
- Continuous Integration (CI)
- Image publishing
- Branch protection
- Container registry workflows