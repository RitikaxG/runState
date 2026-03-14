# Phase 5 --- Monitoring, Observability, Autoscaling, and Image Automation

This phase adds **observability, autoscaling, and deployment
automation** to the RunState platform.

## Key Goals

-   Add monitoring with **Prometheus + Grafana**
-   Instrument the Go API with **Prometheus metrics**
-   Enable **Horizontal Pod Autoscaling**
-   Configure **Cluster Autoscaler**
-   Automate deployments with **ArgoCD Image Updater**

------------------------------------------------------------------------

## Monitoring Stack

Installed using **kube-prometheus-stack** via ArgoCD.

Components:

-   Prometheus
-   Grafana
-   Alertmanager
-   Node Exporter
-   kube-state-metrics

Grafana is exposed via:

    grafana.runstate.ritikaxg.co.in

------------------------------------------------------------------------

## API Metrics

The Go API exposes a `/metrics` endpoint using the Prometheus client
library.

Metrics include:

-   `http_requests_total`
-   `http_requests_errors_total`
-   `http_request_duration_seconds`
-   `http_requests_in_flight`

Example metric:

    http_requests_total{method="GET",route="/health",status="200"} 150

------------------------------------------------------------------------

## ServiceMonitor

Prometheus scrapes the API using a `ServiceMonitor`.

    ServiceMonitor
          ↓
    Prometheus
          ↓
    RunState API /metrics

This allows automatic discovery of metrics endpoints.

------------------------------------------------------------------------

## Grafana Dashboards

Custom dashboard panels:

**API Request Rate**

    sum(rate(http_requests_total[5m]))

**P95 Latency**

    histogram_quantile(
      0.95,
      sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
    )

**Active Requests**

    sum(http_requests_in_flight)

**Ingress Request Rate**

    sum(rate(nginx_ingress_controller_requests[5m]))

------------------------------------------------------------------------

## Horizontal Pod Autoscaler

API automatically scales based on CPU utilization.

Example configuration:

-   Min replicas: 2
-   Max replicas: 6
-   Target CPU: 70%

``` bash
kubectl get hpa -n runstate
```

------------------------------------------------------------------------

## Cluster Autoscaler

Cluster Autoscaler automatically scales **EKS node groups** when pods
cannot be scheduled.

Responsibilities:

-   detect unschedulable pods
-   increase node count
-   remove idle nodes

Autoscaling is enabled through:

-   IAM role via IRSA
-   Kubernetes RBAC
-   Autoscaler deployment in `kube-system`

------------------------------------------------------------------------

## Image Automation

**ArgoCD Image Updater** automatically deploys new container images.

Workflow:

CI Pipeline → Push image to GHCR\
↓\
Image Updater detects new tag\
↓\
Updates GitOps repository\
↓\
ArgoCD syncs cluster

This removes the need to manually update image tags.

------------------------------------------------------------------------

## Result

By the end of Phase 5 the platform includes:

-   Full **monitoring and observability**
-   Production dashboards in **Grafana**
-   **Pod autoscaling** via HPA
-   **Cluster autoscaling** via Cluster Autoscaler
-   **Automated deployments** using ArgoCD Image Updater

RunState now operates with a **production-grade DevOps workflow**.
