# Phase 4 --- AWS Deployment, GitOps, Secrets, and TLS

This phase moves **RunState** from local/containerized development to a
**production-style deployment on AWS EKS** using Kubernetes and GitOps.

## Key Goals

-   Deploy the application to **AWS EKS**
-   Secure traffic using **Ingress + TLS**
-   Introduce **GitOps using ArgoCD**
-   Manage secrets with **AWS Secrets Manager + External Secrets
    Operator**

------------------------------------------------------------------------

## Architecture Overview

Client → DNS → NGINX Ingress → Kubernetes Services → Pods (API +
Workers)

GitHub → ArgoCD → Kubernetes Cluster

AWS Secrets Manager → External Secrets Operator → Kubernetes Secrets

------------------------------------------------------------------------

## 1. Create EKS Cluster

``` bash
eksctl create cluster   --name runstate-cluster-1   --region ap-south-1   --managed   --nodes 3   --nodes-min 2   --nodes-max 4   --node-type t3.medium
```

Configure kubectl:

``` bash
aws eks update-kubeconfig   --region ap-south-1   --name runstate-cluster-1
```

Verify:

``` bash
kubectl get nodes
```

------------------------------------------------------------------------

## 2. Enable OIDC (Required for IRSA)

``` bash
eksctl utils associate-iam-oidc-provider   --cluster runstate-cluster-1   --region ap-south-1   --approve
```

This enables **IAM Roles for Service Accounts**, allowing workloads to
access AWS APIs securely.

------------------------------------------------------------------------

## 3. Install Ingress Controller

``` bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx   --namespace ingress-nginx   --create-namespace
```

Verify:

``` bash
kubectl get svc -n ingress-nginx
```

------------------------------------------------------------------------

## 4. Install cert-manager (TLS)

``` bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

Create a `ClusterIssuer` backed by **Let's Encrypt**.

This allows automatic TLS certificate generation for Kubernetes Ingress
resources.

------------------------------------------------------------------------

## 5. Install ArgoCD

``` bash
kubectl create namespace argocd

kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Retrieve login password:

``` bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

ArgoCD enables **GitOps deployments** where Git becomes the source of
truth.

------------------------------------------------------------------------

## 6. GitOps Repository

A separate repository stores Kubernetes manifests:

    runstate-gitops
    ├── apps/
    │   └── runstate/
    ├── bootstrap/
    ├── infra/

ArgoCD continuously syncs the cluster with this repository.

------------------------------------------------------------------------

## 7. Secrets Management

Secrets are stored in **AWS Secrets Manager**.

External Secrets Operator syncs them into Kubernetes.

Flow:

AWS Secrets Manager\
↓\
External Secrets Operator\
↓\
Kubernetes Secret (`runstate-app-secret`)\
↓\
Pods consume secrets via environment variables

------------------------------------------------------------------------

## 8. DNS + TLS

Domains routed through the ingress controller:

-   api.runstate.ritikaxg.co.in
-   argocd.runstate.ritikaxg.co.in

TLS certificates are issued automatically via **cert-manager + Let's
Encrypt**.

------------------------------------------------------------------------

## Result

By the end of Phase 4:

-   RunState is deployed on **AWS EKS**
-   Infrastructure is managed with **GitOps (ArgoCD)**
-   Traffic is secured with **TLS**
-   Secrets are managed through **AWS Secrets Manager**
