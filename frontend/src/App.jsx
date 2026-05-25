import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  Cloud,
  Code2,
  Container,
  GitBranch,
  GitCommitVertical,
  Globe,
  LoaderCircle,
  Menu,
  MonitorCheck,
  MoonStar,
  Rocket,
  Server,
  ShieldCheck,
  TerminalSquare,
  X,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

const BACKEND_URL = 'http://65.0.86.103:5000'

const navItems = [
  { label: 'Overview', href: '#hero' },
  { label: 'Infrastructure', href: '#infrastructure' },
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Deployment', href: '#deployment' },
]

const infrastructureCards = [
  {
    title: 'Frontend Running',
    description: 'React + Vite dashboard live and responsive.',
    icon: MonitorCheck,
  },
  {
    title: 'Backend Running',
    description: 'Express API online on port 5000.',
    icon: Server,
  },
  {
    title: 'Docker Active',
    description: 'Containerized deployment flow is engaged.',
    icon: Container,
  },
  {
    title: 'GitHub Actions CI/CD Active',
    description: 'Automated build and deployment pipeline is ready.',
    icon: GitBranch,
  },
  {
    title: 'AWS EC2 Connected',
    description: 'Production host is linked to the cloud runtime.',
    icon: Cloud,
  },
]

const techStack = [
  { name: 'React', description: 'Component-led UI', icon: Code2 },
  { name: 'Node.js', description: 'API runtime', icon: Server },
  { name: 'Docker', description: 'Container orchestration', icon: Container },
  { name: 'AWS EC2', description: 'Cloud compute host', icon: Cloud },
  { name: 'GitHub Actions', description: 'CI/CD automation', icon: GitBranch },
  { name: 'Git', description: 'Version control', icon: GitCommitVertical },
  { name: 'Linux', description: 'Server environment', icon: TerminalSquare },
]

const pipelineStages = [
  { label: 'Developer Push', icon: GitCommitVertical },
  { label: 'GitHub', icon: GitBranch },
  { label: 'GitHub Actions', icon: Bot },
  { label: 'AWS EC2', icon: Cloud },
  { label: 'Docker Deployment', icon: Container },
]

const deploymentDefaults = {
  publicServerIp: '65.0.86.103',
  backendUrl: BACKEND_URL,
  frontendUrl: '',
  deploymentStatus: 'Awaiting live verification',
  dockerStatus: 'Active',
  lastDeploymentTime: 'Pending first live check',
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200 shadow-neon">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{subtitle}</p>
    </div>
  )
}

function GlassCard({ children, className = '' }) {
  return <div className={`glass-card rounded-3xl ${className}`}>{children}</div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isBooting, setIsBooting] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [health, setHealth] = useState({
    backendOnline: false,
    apiConnected: false,
    serverReachable: false,
    statusText: 'Click to verify the live backend connection.',
    checkedAt: null,
    latencyMs: null,
    error: '',
  })
  const [deploymentInfo, setDeploymentInfo] = useState(deploymentDefaults)

  const frontendUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return window.location.origin
  }, [])

  const runBackendCheck = useCallback(async () => {
    const startedAt = performance.now()

    setIsChecking(true)
    setHealth((current) => ({
      ...current,
      statusText: 'Checking backend connectivity...',
      error: '',
    }))

    try {
      const response = await fetch(BACKEND_URL, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      })
      const elapsed = Math.round(performance.now() - startedAt)
      const payloadText = await response.text()

      let payload = null
      try {
        payload = JSON.parse(payloadText)
      } catch {
        payload = null
      }

      const backendOnline = response.ok && payloadText.length > 0
      const statusText = backendOnline
        ? payload?.message ?? 'Backend online and responding from AWS EC2.'
        : `Backend returned status ${response.status}`

      setHealth({
        backendOnline,
        apiConnected: response.ok,
        serverReachable: true,
        statusText,
        checkedAt: new Date().toISOString(),
        latencyMs: elapsed,
        error: response.ok ? '' : `Unexpected HTTP status ${response.status}`,
      })

      setDeploymentInfo((current) => ({
        ...current,
        frontendUrl,
        deploymentStatus: backendOnline ? 'Live on AWS EC2' : 'Live verification failed',
        lastDeploymentTime: new Date().toLocaleString(),
        dockerStatus: backendOnline ? 'Active and deployed' : 'Needs attention',
      }))
    } catch (error) {
      setHealth({
        backendOnline: false,
        apiConnected: false,
        serverReachable: false,
        statusText: 'Backend is unreachable right now.',
        checkedAt: new Date().toISOString(),
        latencyMs: null,
        error: error instanceof Error ? error.message : 'Network error',
      })

      setDeploymentInfo((current) => ({
        ...current,
        frontendUrl,
        deploymentStatus: 'Backend unreachable',
        lastDeploymentTime: new Date().toLocaleString(),
        dockerStatus: 'Check live container status',
      }))
    } finally {
      setIsChecking(false)
    }
  }, [frontendUrl])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsBooting(false)
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isBooting) {
      runBackendCheck()
    }
  }, [isBooting, runBackendCheck])

  useEffect(() => {
    setDeploymentInfo((current) => ({
      ...current,
      frontendUrl,
    }))
  }, [frontendUrl])

  const healthPills = [
    { label: 'Backend Online', active: health.backendOnline },
    { label: 'API Connected', active: health.apiConnected },
    { label: 'Server Reachable', active: health.serverReachable },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          className="animate-drift absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.28, 0.55, 0.28], y: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          className="animate-float-slow absolute right-0 top-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl"
        />
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.2),transparent_22%)]" />
        <div className="grid-fade absolute inset-0 opacity-[0.16]" />
      </div>

      <AnimatePresence>
        {isBooting ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 px-6 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ y: 18, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="glass-card w-full max-w-md rounded-[28px] p-8 text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 shadow-neon">
                <LoaderCircle className="h-8 w-8 animate-spin text-emerald-300" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Initializing dashboard</p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-50">Cloud DevOps Automation Platform</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Preparing the live infrastructure view, backend health checks, and deployment telemetry.
              </p>
              <div className="mt-6 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    animate={{ x: ['-40%', '140%'] }}
                    transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-sky-400"
                  />
                </div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Connecting AWS EC2, Docker, and GitHub Actions</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#hero" className="flex items-center gap-3 text-slate-50 no-underline">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 shadow-neon">
              <Rocket className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">Cloud DevOps</p>
              <p className="text-xs text-slate-400">Automation Platform</p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="rounded-full px-4 py-2 text-sm text-slate-300 no-underline transition hover:bg-white/8 hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(34,197,94,0.75)]" />
              Live AWS EC2
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 md:hidden"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 bg-slate-950/90 md:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200 no-underline transition hover:bg-white/10"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-20 px-4 py-8 pb-16 sm:px-6 lg:px-8 lg:py-12">
        <section id="hero" className="scroll-mt-28">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                <MoonStar className="h-3.5 w-3.5" />
                AWS DevOps Control Center
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Cloud DevOps Automation Platform
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  A premium AWS-ready dashboard for monitoring React frontend delivery, Node.js backend health,
                  Docker execution, and GitHub Actions CI/CD across your EC2 deployment.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={runBackendCheck}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_20px_50px_rgba(16,185,129,0.28)] transition"
                >
                  {isChecking ? <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> : <Activity className="h-4.5 w-4.5" />}
                  Check Backend Status
                </motion.button>
                <motion.a
                  whileHover={{ y: -2 }}
                  href="#deployment"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-100 no-underline transition hover:bg-white/10"
                >
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
                  View Deployment Status
                </motion.a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'AWS EC2 Host', value: 'Online' },
                  { label: 'Container Runtime', value: 'Docker Active' },
                  { label: 'CI/CD Mode', value: 'GitHub Actions' },
                ].map((stat) => (
                  <GlassCard key={stat.label} className="p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-lg font-semibold text-white">{stat.value}</p>
                  </GlassCard>
                ))}
              </div>
            </div>

            <GlassCard className="relative overflow-hidden p-5 sm:p-6 lg:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_25%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-200">Live deployment panel</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Infrastructure telemetry</h2>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">
                    Everything is styled to feel like a premium cloud console while remaining lightweight enough for
                    your existing Docker and Vite deployment.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-200 shadow-neon">
                  <Globe className="h-5 w-5" />
                </div>
              </div>

              <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  className="glass-card rounded-2xl p-4"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Backend status</p>
                  <p className="mt-3 text-lg font-semibold text-white">{health.statusText}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className={`h-4.5 w-4.5 ${health.backendOnline ? 'text-emerald-300' : 'text-rose-300'}`} />
                    {health.backendOnline ? 'Live and responsive' : 'Waiting for a successful live response'}
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  className="glass-card rounded-2xl p-4"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Latency</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{health.latencyMs != null ? `${health.latencyMs} ms` : '—'}</p>
                  <p className="mt-2 text-sm text-slate-300">Response from {BACKEND_URL} recorded by the live health check.</p>
                </motion.div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section id="infrastructure" className="scroll-mt-28 space-y-8">
          <SectionHeader
            eyebrow="Live Infrastructure Status"
            title="Operational visibility across the stack"
            subtitle="High-signal status cards highlight the live frontend, backend, Docker runtime, GitHub Actions pipeline, and AWS EC2 connectivity with glowing states and fast visual scanning."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {infrastructureCards.map((card, index) => {
              const Icon = card.icon

              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="glass-card group rounded-3xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 shadow-neon transition group-hover:shadow-[0_0_30px_rgba(34,197,94,0.28)]">
                        <span className="absolute h-3 w-3 rounded-full bg-emerald-400 animate-pulse-glow" />
                        <Icon className="relative h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeader
            eyebrow="Tech Stack"
            title="Built for modern cloud operations"
            subtitle="The stack cards balance clarity and motion so the platform feels like a production-grade AWS control plane rather than a generic app shell."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {techStack.map((tech, index) => {
              const Icon = tech.icon

              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  whileHover={{ y: -5 }}
                  className="glass-card rounded-2xl p-4 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{tech.name}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{tech.description}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section id="pipeline" className="scroll-mt-28 space-y-8">
          <SectionHeader
            eyebrow="CI/CD Flow"
            title="Automated delivery path from commit to container"
            subtitle="The workflow is rendered as a readable pipeline so teams can instantly understand how code moves from developer push to Docker deployment on AWS EC2."
          />

          <GlassCard className="overflow-hidden p-5 sm:p-6 lg:p-8">
            <div className="relative">
              <div className="absolute inset-x-8 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-emerald-400/0 via-emerald-300/60 to-sky-400/0 lg:block" />
              <div className="grid gap-4 lg:grid-cols-9 lg:items-center">
                {pipelineStages.map((stage, index) => {
                  const Icon = stage.icon

                  return (
                    <div key={stage.label} className="flex items-center gap-4 lg:col-span-1 lg:flex-col lg:gap-3">
                      <motion.div
                        animate={{ y: [0, -6, 0], boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 24px rgba(34,197,94,0.2)', '0 0 0 rgba(0,0,0,0)'] }}
                        transition={{ duration: 3.2 + index * 0.25, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-emerald-300 shadow-[0_0_24px_rgba(34,197,94,0.12)]"
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                      <div className="flex-1 lg:flex-none lg:text-center">
                        <p className="text-sm font-semibold text-white">{stage.label}</p>
                        <p className="mt-1 text-xs text-slate-400">Step {index + 1}</p>
                      </div>
                      {index < pipelineStages.length - 1 ? <ArrowRight className="hidden h-5 w-5 text-slate-500 lg:block" /> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </GlassCard>
        </section>

        <section id="deployment" className="scroll-mt-28 space-y-8">
          <SectionHeader
            eyebrow="Deployment Information"
            title="Live environment metadata"
            subtitle="This panel reflects the current AWS EC2 host, frontend origin, backend API, deployment status, Docker state, and the latest successful live verification timestamp."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {[
              { label: 'Public Server IP', value: deploymentInfo.publicServerIp, icon: Cloud },
              { label: 'Frontend URL', value: deploymentInfo.frontendUrl || frontendUrl || 'Live session pending', icon: Globe },
              { label: 'Backend URL', value: deploymentInfo.backendUrl, icon: Server },
              { label: 'Deployment Status', value: deploymentInfo.deploymentStatus, icon: BadgeCheck },
              { label: 'Last Deployment Time', value: deploymentInfo.lastDeploymentTime, icon: Activity },
              { label: 'Docker Container Status', value: deploymentInfo.dockerStatus, icon: Container },
            ].map((item) => {
              const Icon = item.icon

              return (
                <motion.div key={item.label} whileHover={{ y: -4 }} className="glass-card rounded-3xl p-5">
                  <div className="flex items-center gap-3 text-slate-200">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                  </div>
                  <p className="mt-4 break-words text-sm leading-7 text-slate-300">{item.value}</p>
                </motion.div>
              )
            })}
          </div>

          <GlassCard className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200">Backend Health Check</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{health.backendOnline ? 'Backend online and stable' : 'Health check requires a live response'}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  The frontend calls the live backend at {BACKEND_URL}. Success updates the deployment panel and confirms
                  API reachability from the browser runtime.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={runBackendCheck}
                disabled={isChecking}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isChecking ? <LoaderCircle className="h-4.5 w-4.5 animate-spin" /> : <CheckCircle2 className="h-4.5 w-4.5" />}
                Check Backend Status
              </motion.button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {healthPills.map((pill) => (
                <div
                  key={pill.label}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${pill.active ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-rose-400/20 bg-rose-400/10'}`}
                >
                  <p className="text-sm font-medium text-white">{pill.label}</p>
                  <span className={`h-3 w-3 rounded-full ${pill.active ? 'bg-emerald-400 shadow-[0_0_18px_rgba(34,197,94,0.8)]' : 'bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.65)]'}`} />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {health.error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100"
                >
                  Backend health check failed: {health.error}
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100"
                >
                  {health.statusText}
                  {health.latencyMs != null ? ` · ${health.latencyMs} ms` : ''}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-white">Cloud DevOps Automation Platform</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
              Modern AWS cloud dashboard with React, Tailwind CSS, Framer Motion, Docker, and GitHub Actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: 'GitHub', href: 'https://github.com', icon: GitBranch },
              { label: 'AWS', href: 'https://aws.amazon.com', icon: Cloud },
              { label: 'Docker', href: 'https://www.docker.com', icon: Container },
            ].map((link) => {
              const Icon = link.icon

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 no-underline transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-emerald-300" />
                  {link.label}
                </a>
              )
            })}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
