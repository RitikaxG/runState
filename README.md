# RunState

**A BetterUptime-inspired uptime monitoring platform built with Go, workers, Redis, Postgres, Docker, and Kubernetes GitOps.**

RunState is a production-style monitoring system that periodically checks websites, records uptime and response-time history, tracks incidents, and stores notification events. I first built and fully tested the backend in TypeScript, then rewrote it in Go to deepen my understanding of backend engineering through a real, end-to-end system.

![RunState Architecture](./docs/architecture/architecture.md)

---

## What it is

RunState is an uptime monitoring platform inspired by BetterUptime.

It allows users to:

- add and manage websites to monitor,
- run periodic health checks,
- store historical check and response-time data,
- detect incidents when a website goes down,
- persist notification logs,
- expose monitoring data through API endpoints,
- deploy the system using Docker, Kubernetes, and GitOps.

---

## Core highlights

- **Go backend** with layered architecture
- **Worker-based system** for monitoring and event processing
- **Redis-backed event pipeline**
- **Postgres persistence** for websites, checks, incidents, and logs
- **JWT + refresh-token authentication**
- **Prometheus metrics** for observability
- **Dockerized services**
- **GitHub Actions CI/CD**
- **Argo CD GitOps deployment**
- **External Secrets integration**
- **Horizontal Pod Autoscaling (HPA)**

---

## Architecture

RunState is split into multiple services and workers:

- **API server**  
  Handles authentication, website management, and frontend-facing monitoring endpoints.

- **monitoring-pusher**  
  Periodically pushes websites into the monitoring pipeline.

- **worker-monitoring**  
  Performs website checks and records monitoring results.

- **worker-status-change**  
  Detects state transitions such as `up -> down` or `down -> up` and creates status-change / incident events.

- **worker-notification**  
  Processes notification events and stores or sends notification history.

- **Redis**  
  Used as the event backbone between workers.

- **Postgres**  
  Stores users, websites, checks, incidents, response-time history, and notification logs.

- **GitOps repo**  
  Deployment manifests are managed separately in [`runstate-gitops`](https://github.com/RitikaxG/runstate-gitops).

---

## Key features

- Authentication with JWT and refresh tokens
- Add, list, and delete monitored websites
- Periodic uptime checks
- Incident tracking
- Response-time history
- Notification logs
- Prometheus metrics and health endpoints
- Dockerized local setup
- Kubernetes + Argo CD deployment pipeline

---

## Repo structure

```txt
runState/
├── apps/
│   ├── api-go/        # Main Go backend, workers, migrations
│   └── web/           # Next.js frontend
├── docs/
│   ├── architecture/  # System diagrams
│   ├── devops/        # DevOps and deployment notes
│   └── workers/       # Worker architecture documentation
├── packages/          # Shared monorepo packages
└── .github/workflows/ # CI/CD workflows
```

---

## Local development

### Start the API server

```bash
cd apps/api-go
go run ./cmd/server/main.go
```

### Run the monitoring pusher

```bash
cd apps/api-go
go run ./cmd/monitoring-pusher/main.go
```

### Run the monitoring worker

```bash
cd apps/api-go
go run ./cmd/worker-monitoring/main.go
```

### Run the status-change worker

```bash
cd apps/api-go
go run ./cmd/worker-status-change/main.go
```

### Run the notification worker

```bash
cd apps/api-go
go run ./cmd/worker-notification/main.go
```

### Run with Docker

```bash
docker compose up --build
```

---

## Screenshots / demo

Frontend screenshots and demo flows will be added here.

Planned showcase screens:

- Login
- Dashboard
- Website details
- Checks history
- Response-time chart
- Incidents
- Notifications

---

## Related repos

- **GitOps repo:** [runstate-gitops](https://github.com/RitikaxG/runstate-gitops)

---

## What I learned

RunState is the project through which I transitioned from writing backend systems in TypeScript to writing them in Go.

Through this project, I:

- rewrote a legacy TypeScript backend into Go,
- learned Go backend structure and service/repository layering,
- implemented worker-based event processing,
- worked with Redis and Postgres in a production-style architecture,
- containerized services with Docker,
- built CI/CD pipelines with GitHub Actions,
- deployed the system to Kubernetes using GitOps with Argo CD.

This project was not just about building a monitoring platform. It was also my way of learning how to design, implement, deploy, and operate backend systems more professionally.

---

## Status

- Backend: **implemented**
- Workers: **implemented**
- CI/CD: **implemented**
- GitOps: **implemented**
- Frontend: **in progress**
