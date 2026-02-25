# syntax=docker/dockerfile:1

############################
# 1) Build stage
############################
FROM golang:1.25-alpine AS builder

WORKDIR /src

# Install build-time dependencies
RUN apk add --no-cache ca-certificates git

# Copy only go.mod/go.sum first for caching
COPY apps/api-go/go.mod apps/api-go/go.sum ./
RUN go mod download

# Copy the Go service source
COPY apps/api-go ./

# Build all executables (static, linux)
RUN mkdir -p /out && \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server && \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/monitoring-pusher ./cmd/monitoring-pusher && \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/worker-monitoring ./cmd/worker-monitoring && \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/worker-status-change ./cmd/worker-status-change && \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/worker-notification ./cmd/worker-notification

############################
# 2) Runtime stage
############################
FROM gcr.io/distroless/static:nonroot

WORKDIR /

# Copy binaries
COPY --from=builder /out/server /server
COPY --from=builder /out/monitoring-pusher /monitoring-pusher
COPY --from=builder /out/worker-monitoring /worker-monitoring
COPY --from=builder /out/worker-status-change /worker-status-change
COPY --from=builder /out/worker-notification /worker-notification

# (Optional but recommended) copy CA certs if you call HTTPS endpoints
# Distroless static usually includes certs, but keeping this line commented
# is fine unless you hit TLS errors.
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# API server port (documentation only; publishing happens in compose/k8s)
EXPOSE 8080

USER nonroot:nonroot

# Default container runs the API server.
# In docker-compose/k8s you will override command to run workers.
ENTRYPOINT ["/server"]
