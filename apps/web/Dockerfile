# apps/web/Dockerfile

FROM oven/bun:1.3.2 AS builder
WORKDIR /app

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN bun install --frozen-lockfile
RUN cd apps/web && bun run build

FROM oven/bun:1.3.2 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/turbo.json ./turbo.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["bun", "run", "start"]