import Link from 'next/link'
import type { ReactNode } from 'react'
import { ROUTES } from '../lib/constants'

const platformPillars = [
  {
    badge: 'API',
    title: 'Go API + Auth',
    description:
      'Layered backend with JWT authentication, refresh tokens, admin endpoints, website management, and frontend-facing monitoring APIs.',
  },
  {
    badge: 'RS',
    title: 'Redis Stream Pipeline',
    description:
      'Event-driven workers move checks through monitoring, status-change, and notification streams instead of blocking request handlers.',
  },
  {
    badge: 'DB',
    title: 'Postgres History',
    description:
      'Checks, response times, incidents, and notification logs are persisted so the frontend can expose the full operational story.',
  },
  {
    badge: 'AWS',
    title: 'AWS + GitOps',
    description:
      'CI-built images, ArgoCD sync, EKS deployment, ingress, TLS, secrets, observability, and autoscaling complete the delivery path.',
  },
]

const architectureSteps = [
  {
    step: '01',
    title: 'API manages monitors',
    description:
      'Handles authentication, website CRUD, admin endpoints, and frontend-facing monitoring APIs.',
  },
  {
    step: '02',
    title: 'Monitoring pusher fans out work',
    description:
      'Periodically pushes registered websites into the monitoring pipeline via Redis Streams in controlled batches.',
  },
  {
    step: '03',
    title: 'Workers execute checks',
    description:
      'Workers consume jobs, perform HTTP health checks, measure response time, persist website ticks, and compare against previous status.',
  },
  {
    step: '04',
    title: 'Status-change worker isolates transitions',
    description:
      'Detects real transitions like up→down or down→up and manages incident and status-change events.',
  },
  {
    step: '05',
    title: 'Notification worker handles delivery',
    description:
      'Processes alert events with idempotency, retry logic, rate limiting, pending-message reclamation, and delivery persistence.',
  },
  {
    step: '06',
    title: 'Frontend surfaces the full story',
    description:
      'User dashboards, admin views, response-time charts, recent checks, incidents, and notification history are all backed by persisted worker output.',
  },
]

const productViews = [
  {
    badge: 'UD',
    title: 'User Dashboard',
    description:
      'Personal dashboard showing monitored websites, current status, latest response time, and last check time.',
  },
  {
    badge: 'WS',
    title: 'Website Status Page',
    description:
      'Detail page with current status, response-time chart, recent checks, incidents, and notifications.',
  },
  {
    badge: 'AC',
    title: 'Admin Console',
    description:
      'Shows registered users, their roles, and monitored websites visible across the system.',
  },
  {
    badge: 'AD',
    title: 'Admin Dashboard',
    description:
      'Global monitoring view across all users and all monitored websites.',
  },
]

const deploymentSteps = [
  {
    step: '01',
    badge: 'DC',
    title: 'Local Docker Compose',
    description:
      'Multi-service setup runs the API, Redis, Postgres, and workers together.',
  },
  {
    step: '02',
    badge: 'CI',
    title: 'CI + Image Publishing',
    description:
      'PRs run formatting, vet, and build gates. Main publishes immutable GHCR images with sha tags.',
  },
  {
    step: '03',
    badge: 'EKS',
    title: 'GitOps on EKS',
    description:
      'ArgoCD drives EKS deployment. Kubernetes runs the system while Git remains the source of truth.',
  },
  {
    step: '04',
    badge: 'TLS',
    title: 'TLS & Secrets',
    description:
      'NGINX Ingress, cert-manager TLS, and External Secrets inject runtime credentials securely.',
  },
  {
    step: '05',
    badge: 'OBS',
    title: 'Monitoring & Autoscaling',
    description:
      'Prometheus + Grafana provide observability, while HPA + Cluster Autoscaler handle scale.',
  },
]

const stack = [
  'Next.js',
  'Go',
  'Redis Streams',
  'Postgres',
  'Docker',
  'GitHub Actions',
  'GHCR',
  'AWS EKS',
  'ArgoCD',
  'Prometheus',
]

const pipelineFlow = [
  'API',
  'Pusher',
  'Monitoring Stream',
  'Workers',
  'Status Change',
  'Notification',
  'Dashboard',
]

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 sm:text-sm">
      {children}
    </p>
  )
}

function BadgeIcon({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600 sm:h-14 sm:w-14 sm:text-base">
      {children}
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#eef3f7] text-slate-900">
      <div className="w-full">
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex w-full items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white sm:h-14 sm:w-14 sm:text-xl">
                ∿
              </div>
              <div className="text-lg font-bold tracking-tight sm:text-[1.3rem]">
                RunState
              </div>
            </div>

            <nav className="hidden items-center gap-10 lg:flex">
              <a
                href="#architecture"
                className="text-base font-medium text-slate-500 transition hover:text-slate-900"
              >
                Architecture
              </a>
              <a
                href="#deployment"
                className="text-base font-medium text-slate-500 transition hover:text-slate-900"
              >
                Deployment
              </a>
              <a
                href="#product"
                className="text-base font-medium text-slate-500 transition hover:text-slate-900"
              >
                Product
              </a>
            </nav>

            <div className="flex items-center gap-4 sm:gap-5">
              <Link
                href={ROUTES.SIGNIN}
                className="hidden text-base font-semibold text-slate-900 transition hover:text-blue-600 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href={ROUTES.SIGNUP}
                className="rounded-[18px] bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:px-6 sm:py-3.5 sm:text-base"
              >
                Create account
              </Link>
            </div>
          </div>
        </header>

        <section className="w-full px-5 pb-14 pt-14 sm:px-8 lg:px-12 lg:pb-20 lg:pt-18 xl:px-16">
          <div className="w-full rounded-[32px] border border-slate-200 bg-[#f7fbfd] px-6 py-14 shadow-[0_12px_50px_rgba(15,23,42,0.06)] sm:px-8 lg:px-12 lg:py-18 xl:px-16">
            <div className="mx-auto max-w-6xl text-center">
              <div className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 sm:px-5 sm:text-[0.95rem]">
                • Full-stack backend + DevOps showcase
              </div>

              <h1 className="mx-auto mt-8 max-w-5xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-[4.25rem] xl:leading-[1.05]">
                Website monitoring powered
                <br />
                by a real worker pipeline
              </h1>

              <p className="mx-auto mt-6 max-w-5xl text-lg leading-8 text-slate-500 sm:text-xl sm:leading-9 lg:text-[1.35rem] lg:leading-10">
                RunState monitors websites at regular intervals, stores uptime and
                response-time history, tracks incidents, persists notification
                events, and exposes dashboards for both users and admins — built
                with Go, Redis Streams, Postgres, Next.js, Docker, and
                Kubernetes/GitOps.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={ROUTES.SIGNIN}
                  className="rounded-[20px] bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_16px_30px_rgba(37,99,235,0.20)] transition hover:bg-blue-500 sm:px-9"
                >
                  Sign in
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="rounded-[20px] border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 sm:px-9"
                >
                  Create account
                </Link>
              </div>

              <div className="mx-auto mt-12 flex max-w-5xl flex-wrap items-center justify-center gap-3">
                {stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-500 sm:text-[0.95rem]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-7xl gap-6 lg:grid-cols-2">
              {platformPillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"
                >
                  <BadgeIcon>{pillar.badge}</BadgeIcon>
                  <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.8rem]">
                    {pillar.title}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-500 sm:text-[1.02rem] sm:leading-8">
                    {pillar.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="architecture"
          className="w-full px-5 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-16"
        >
          <div className="w-full rounded-[32px] border border-slate-200 bg-white px-6 py-14 shadow-sm sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto max-w-7xl">
              <SectionEyebrow>Backend Architecture</SectionEyebrow>

              <h2 className="mx-auto mt-6 max-w-5xl text-center text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-tight">
                Redis Stream pipeline turns
                <br />
                monitoring into an event system
              </h2>

              <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-8 text-slate-500 sm:text-xl sm:leading-9">
                Work is separated into workers: pushing jobs, performing checks,
                detecting transitions, and delivering notifications.
              </p>

              <div className="mt-12 rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-6 shadow-sm sm:p-8 lg:p-10">
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
                        Pipeline Flow
                      </p>
                      <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Designed as a real backend workflow,
                        <br className="hidden sm:block" />
                        not a single request-response loop
                      </h3>
                    </div>

                    <div className="hidden rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 lg:block">
                      Redis Streams + workers + persisted output
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-7">
                    {pipelineFlow.map((item, index) => (
                      <div
                        key={item}
                        className="relative rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="mt-4 text-lg font-bold text-slate-900">
                          {item}
                        </div>

                        {index < pipelineFlow.length - 1 ? (
                          <div className="pointer-events-none hidden xl:block">
                            <div className="absolute right-[-20px] top-1/2 h-[2px] w-10 -translate-y-1/2 bg-gradient-to-r from-blue-200 to-transparent" />
                            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-blue-400">
                              →
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Monitoring stream
                      </p>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        Registered websites are pushed into Redis Streams in
                        batches so checks can run asynchronously.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Status isolation
                      </p>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        Transition handling is separated into a dedicated worker
                        so incidents and notifications stay clean and reliable.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Persisted frontend story
                      </p>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        Checks, incidents, response-time history, and
                        notifications become visible as product UI, not hidden
                        backend work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {architectureSteps.map((item) => (
                  <article
                    key={item.step}
                    className="rounded-[28px] border border-slate-200 bg-[#f9fbfd] p-7 shadow-sm sm:p-8"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-xl font-bold text-blue-600 sm:h-16 sm:w-16 sm:text-2xl">
                        {item.step}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-900 sm:text-[1.45rem]">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-base leading-8 text-slate-500 sm:text-[1.02rem]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="product"
          className="w-full px-5 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-16"
        >
          <div className="w-full rounded-[32px] border border-slate-200 bg-[#f7fbfd] px-6 py-14 shadow-sm sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto max-w-7xl">
              <SectionEyebrow>Product Views</SectionEyebrow>

              <h2 className="mx-auto mt-6 max-w-5xl text-center text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-tight">
                Both the user story
                <br />
                and operator story, in one UI
              </h2>

              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {productViews.map((view) => (
                  <article
                    key={view.title}
                    className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-emerald-50 text-base font-bold text-emerald-600 sm:h-16 sm:w-16 sm:text-lg">
                      {view.badge}
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-slate-900 sm:text-[1.45rem]">
                      {view.title}
                    </h3>

                    <p className="mt-4 text-base leading-8 text-slate-500 sm:text-[1.02rem]">
                      {view.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="deployment"
          className="w-full px-5 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-16"
        >
          <div className="w-full rounded-[32px] border border-slate-200 bg-white px-6 py-14 shadow-sm sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto max-w-7xl">
              <SectionEyebrow>Deployment Workflow</SectionEyebrow>

              <h2 className="mx-auto mt-6 max-w-5xl text-center text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-tight">
                From Docker Compose
                <br />
                to production EKS
              </h2>

              <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-8 text-slate-500 sm:text-xl sm:leading-9">
                The same system progresses from local containers to CI-built
                images, GitOps-managed Kubernetes, secure ingress, and
                autoscaling.
              </p>

              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {deploymentSteps.map((step) => (
                  <article
                    key={step.step}
                    className="rounded-[28px] border border-slate-200 bg-[#f9fbfd] p-7 shadow-sm sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <BadgeIcon>{step.badge}</BadgeIcon>
                      <span className="text-2xl font-light text-slate-300 sm:text-3xl">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-slate-900 sm:text-[1.45rem]">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-base leading-8 text-slate-500 sm:text-[1.02rem]">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-5 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-16">
          <div className="w-full rounded-[32px] border border-slate-200 bg-[linear-gradient(90deg,rgba(239,246,255,0.92),rgba(240,253,250,0.88))] px-6 py-14 shadow-sm sm:px-8 lg:px-12 xl:px-16">
            <div className="mx-auto max-w-6xl text-center">
              <SectionEyebrow>Ready to explore</SectionEyebrow>

              <h2 className="mx-auto mt-6 max-w-5xl text-center text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-tight">
                Inspect the system from both
                <br />
                the user and admin side
              </h2>

              <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-8 text-slate-500 sm:text-xl sm:leading-9">
                Use the user dashboard for personal monitors, or sign in as admin
                to review global monitor inventory across accounts.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#architecture"
                  className="rounded-[20px] bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_16px_30px_rgba(37,99,235,0.20)] transition hover:bg-blue-500"
                >
                  View architecture
                </a>
                <a
                  href="https://github.com/RitikaxG/runstate-gitops"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[20px] border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  GitOps repo
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="w-full border-t border-slate-200 bg-white">
          <div className="flex w-full flex-col gap-5 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-16">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-base font-bold text-white sm:h-12 sm:w-12 sm:text-lg">
                ∿
              </div>
              <div className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                RunState
              </div>
            </div>

            <p className="max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
              A full-stack monitoring platform showcasing backend architecture,
              worker orchestration, and DevOps delivery.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}