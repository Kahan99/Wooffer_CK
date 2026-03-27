import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Bug, 
  Bell, 
  Activity, 
  Zap,
  ShieldCheck,
  Code,
  ChevronRight,
  Clock,
  Shield,
  Search,
  Monitor,
  GitBranch,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const Features = () => {
  const [selectedId, setSelectedId] = useState(null);
  const { openAuthModal, user } = useAuth();
  const navigate = useNavigate();
  const titleRef = React.useRef(null);

  const handleTryFeature = () => {
    if (user) {
      setSelectedId(null);
      navigate("/dashboard");
    } else {
      openAuthModal();
    }
  };

  const features = [
    {
      id: 1,
      icon: Activity,
      title: "Server Monitoring",
      description: "Real-time capability tracking, CPU/Memory usage, and uptime monitoring across all your instances.",
      details: "Get granular visibility into every aspect of your server's health. Monitor CPU load, memory consumption, disk I/O, and network traffic in real-time. Set up custom dashboards to visualize the metrics that matter most to your infrastructure team.",
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      id: 2,
      icon: Code,
      title: "Application Integration",
      description: "Seamless integration with Node.js, Python, Go, and more using our lightweight SDKs.",
      details: "Our SDKs are designed to be drop-in replacements for standard loggers. With just a few lines of code, you can start streaming application events, errors, and performance data directly to Wooffer. We support all major frameworks and runtimes.",
      color: "text-secondary",
      bg: "bg-secondary/5",
    },
    {
      id: 3,
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified via Slack, Discord, Email, or SMS instantly when anomalies are detected.",
      details: "Configure complex alerting rules based on thresholds, anomaly detection, or composite metrics. Route alerts to the right team members via their preferred communication channels (Slack, PagerDuty, Discord, SMS, Email) to ensure rapid incident response.",
      color: "text-text",
      bg: "bg-white/5",
    },
    {
      id: 4,
      icon: Activity,
      title: "API Performance",
      description: "Deep dive into API latency, throughput, and error rates to optimize end-user experience.",
      details: "Trace every request as it travels through your distributed system. Identify bottlenecks, slow database queries, and failing downstream services. View detailed waterfalls and aggregate statistics to optimize your API performance.",
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      id: 5,
      icon: ShieldCheck,
      title: "Security Audits",
      description: "Automated security scanning and vulnerability detection for your dependencies.",
      details: "Automatically scan your application dependencies for known vulnerabilities (CVEs). Get alerts when new vulnerabilities are discovered and receive remediation advice. Ensure your application remains secure and compliant.",
      color: "text-secondary",
      bg: "bg-secondary/5",
    },
    {
      id: 6,
      icon: Bug,
      title: "Log Management",
      description: "Centralized log aggregation with powerful search and filtering capabilities.",
      details: "Aggregate logs from all your services in one place. Use our powerful query language to search, filter, and analyze logs in real-time. Correlate logs with metrics and traces to debug issues faster than ever before.",
      color: "text-text",
      bg: "bg-white/5",
    },
    {
      id: 7,
      icon: Monitor,
      title: "Custom Dashboards",
      description: "Create beautiful, data-rich dashboards to visualize your infrastructure and application metrics.",
      details: "Build custom dashboards with our drag-and-drop editor. Choose from a wide range of visualization widgets, including line charts, bar charts, heatmaps, and more. Share dashboards with your team or embed them in external applications.",
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      id: 8,
      icon: GitBranch,
      title: "CI/CD Integration",
      description: "Integrate with your CI/CD pipeline to automatically deploy monitoring configuration and alerts.",
      details: "Automate your monitoring setup with our CI/CD integrations. define your monitoring configuration as code and deploy it alongside your application. ensure that your monitoring is always up-to-date and consistent across environments.",
      color: "text-secondary",
      bg: "bg-secondary/5",
    },
  ];

  return (
    <div className="min-h-screen bg-base pt-32 pb-20 relative overflow-hidden selection:bg-primary/20">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
        {/* Editorial Header */}
        <header className="py-20 mb-20 border-b border-border">
          <motion.nav 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em] mb-12"
          >
            <span>Ecosystem</span>
            <ChevronRight className="w-3 h-3 text-primary" />
            <span className="text-text">Features</span>
          </motion.nav>
          
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                ref={titleRef}
                tabIndex={-1}
                className="text-7xl md:text-8xl font-heading font-extrabold tracking-[-0.05em] text-text uppercase leading-none mb-0 outline-none"
              >
                Powerful Features for<br/>
                <span className="text-primary">Modern Devs.</span>
              </motion.h1>
            </div>
            <div className="lg:col-span-4">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-text-muted text-lg leading-relaxed font-body"
              >
                Everything you need to keep your infrastructure healthy and your users happy. Unified platform for diagnostic depth and architectural clarity.
              </motion.p>
            </div>
          </div>
        </header>

        {/* Bento Grid Features - Precision Layout */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-40 relative">
          {features.map((f, i) => (
            <motion.div
              layoutId={f.id}
              onClick={() => setSelectedId(f.id)}
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, cursor: "pointer" }}
              className="bg-surface/20 border border-border p-12 rounded-[2.5rem] group hover:bg-surface/40 transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-border group-hover:border-primary/30 transition-colors", f.bg, f.color)}>
                <f.icon className="w-6 h-6" />
              </div>
              <motion.h3 className="text-2xl font-heading font-extrabold mb-4 text-text uppercase tracking-tight group-hover:text-primary transition-colors">
                {f.title}
              </motion.h3>
              <motion.p className="text-text-muted text-sm leading-relaxed font-body">
                {f.description}
              </motion.p>
              <div className="mt-8 flex justify-end">
                <span className="text-primary text-[10px] font-heading font-extrabold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  Learn more →
                </span>
              </div>
            </motion.div>
          ))}
        </section>

        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base/80 backdrop-blur-md"
              onClick={() => setSelectedId(null)}
            >
              <motion.div
                layoutId={selectedId}
                className="bg-surface border border-border w-full max-w-2xl rounded-[3rem] overflow-hidden relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {features
                  .filter((f) => f.id === selectedId)
                  .map((feature) => (
                    <div key={feature.id} className="relative">
                      <div className={cn("h-48 w-full flex items-center justify-center border-b border-border", feature.bg)}>
                        <feature.icon className={cn("w-20 h-20 opacity-90", feature.color)} strokeWidth={1} />
                        <button 
                          className="absolute top-8 right-8 text-text-muted hover:text-text transition-colors"
                          onClick={() => setSelectedId(null)}
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="p-12 space-y-8">
                        <div>
                          <motion.h2 className="text-5xl font-heading font-extrabold text-text uppercase tracking-tight leading-[0.9] mb-4">
                            {feature.title}
                          </motion.h2>
                          <div className="w-12 h-1 bg-primary" />
                        </div>
                        <motion.p className="text-text-muted text-lg leading-relaxed font-body italic mb-8 border-l-2 border-border pl-6">
                          {feature.details}
                        </motion.p>
                        <div className="flex justify-end gap-6 pt-4">
                          <Button 
                            variant="secondary" 
                            className="bg-elevated border-border font-heading font-extrabold uppercase text-[10px] tracking-widest"
                            onClick={() => setSelectedId(null)}
                          >
                            Close Protocol
                          </Button>
                          <Button 
                            variant="primary" 
                            className="bg-brand-gradient hover:scale-105 transition-transform shadow-lg font-heading font-extrabold uppercase text-[10px] tracking-widest"
                            onClick={handleTryFeature}
                          >
                            Initialize Module
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Technical Deep Dives */}
        <div className="space-y-60 mb-40">
          {/* Log Management */}
          <section className="grid lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7">
              <div className="stitch-glass bg-elevated/40 border border-border rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-8 py-4 bg-base/50 border-b border-border">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                  <span className="technical-data text-[10px] text-text-muted uppercase font-bold tracking-widest">WOOFFER-LOG-ORCHESTRATOR v2.4</span>
                </div>
                <div className="p-10 technical-data text-[12px] text-text-muted leading-relaxed min-h-[350px]">
                  <div className="flex gap-6 mb-3"><span className="opacity-30">12:04:31</span><span className="text-primary font-black uppercase">INFO</span><span className="text-text/80">NODE_COMM_STILL_ACTIVE_CLUSTER_01</span></div>
                  <div className="flex gap-6 mb-3"><span className="opacity-30">12:04:35</span><span className="text-secondary font-black uppercase">DEBUG</span><span className="text-text/80">PARSING_TELEMETRY_PAYLOAD_READY</span></div>
                  <div className="flex gap-6 mb-3"><span className="opacity-30">12:04:42</span><span className="text-primary font-black uppercase underline decoration-primary/30">ERROR</span><span className="bg-primary/10 text-primary px-2 rounded">TIMEOUT_EXCEPTION: DB_WRITE_SHARD_FAIL</span></div>
                  <div className="flex gap-6 mb-3"><span className="opacity-30">12:04:45</span><span className="opacity-30 italic">TRACE_ID: 0x45F92_RETRYING_ATTEMPT_1/3</span></div>
                  <div className="flex gap-6"><span className="opacity-30">12:04:50</span><span className="text-primary font-black uppercase">INFO</span><span className="text-text/80">WRITE_SUCCESS_SECONDARY_SHARD</span></div>
                  <div className="mt-8 animate-pulse text-primary font-bold">_</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-primary text-[10px] font-heading font-extrabold uppercase tracking-[0.4em]">
                  <div className="w-12 h-[1px] bg-primary" />
                  Log Management
                </div>
                <h2 className="text-5xl font-heading font-extrabold text-text uppercase tracking-tight leading-[0.9]">Architectural Telemetry.</h2>
              </div>
              <div className="space-y-10">
                {[
                  { title: "Sub-second Ingestion", desc: "Index and query billions of telemetry streams in milliseconds.", icon: Clock },
                  { title: "Technical Syntax", desc: "JSON, Regex, or Grok—transform messy strings into structured, actionable units.", icon: Code },
                  { title: "Retention Protocols", desc: "Archival protocols for architectural compliance with instant hydration.", icon: Shield },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-heading font-extrabold text-xl text-text uppercase tracking-tight mb-2">{item.title}</p>
                      <p className="text-text-muted text-sm leading-relaxed font-body">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Error Tracking */}
          <section className="grid lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-secondary text-[10px] font-heading font-extrabold uppercase tracking-[0.4em]">
                  <div className="w-12 h-[1px] bg-secondary" />
                  Error Tracking
                </div>
                <h2 className="text-5xl font-heading font-extrabold text-text uppercase tracking-tight leading-[0.9]">Reliability Engineering.</h2>
              </div>
              <div className="space-y-10">
                {[
                  { title: "Contextual Traces", desc: "View the exact system state at the moment of architectural failure.", icon: Search },
                  { title: "Cluster Grouping", desc: "Fingerprint logic merges millions of events into actionable regressions.", icon: Activity },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-secondary group-hover:border-secondary/30 transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-heading font-extrabold text-xl text-text uppercase tracking-tight mb-2">{item.title}</p>
                      <p className="text-text-muted text-sm leading-relaxed font-body">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="bg-surface/20 border border-border rounded-[3rem] p-16 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-10">
                  <div className="flex items-center gap-3 bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-md text-[9px] font-extrabold tracking-[0.3em] uppercase">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-ping"></span>
                    Live Regression
                  </div>
                </div>
                <div className="mb-12">
                  <h4 className="text-secondary text-5xl font-heading font-extrabold leading-none uppercase tracking-tight">TYPE_ERROR: UNDEFINED_NODE_ACCESS_POINT</h4>
                  <p className="technical-data text-[10px] text-text-muted mt-6 font-bold tracking-widest opacity-60">WOOFFER-NODE: DASHBOARD.TSX_L42_C18</p>
                </div>
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] items-center font-heading font-extrabold text-text-muted uppercase tracking-widest">
                      <span>Regression Volume</span>
                      <span className="text-text technical-data text-xl">12,482</span>
                    </div>
                    <div className="h-1.5 w-full bg-base rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "75%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-secondary"
                      ></motion.div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] items-center border-t border-border pt-8 font-heading font-extrabold text-text-muted uppercase tracking-widest">
                    <span>Node Exposure</span>
                    <span className="text-text technical-data text-xl">892 IDENTIFIERS</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Closing CTA - Editorial Command Section */}
        <section className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-20 lg:p-32 rounded-[4rem] bg-surface/20 border border-border relative overflow-hidden"
          >
            <div className="relative z-10 space-y-12">
              <h2 className="text-6xl md:text-7xl font-heading font-extrabold text-text uppercase tracking-tight leading-none mb-0">Initialize<br/><span className="text-primary">Wooffer.</span></h2>
              <p className="text-text-muted text-xl max-w-xl mx-auto font-body italic">
                "Wooffer didn't just give us more data. It gave us architectural clarity."
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button className="bg-brand-gradient text-white px-16 py-7 rounded-md font-heading font-extrabold uppercase text-[12px] tracking-widest hover:scale-105 transition-all shadow-2xl">
                  Deploy Registry
                </button>
                <button className="bg-elevated text-text border border-border px-16 py-7 rounded-md font-heading font-extrabold uppercase text-[12px] tracking-widest hover:bg-surface transition-all">
                  Contact Protocol
                </button>
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02]">
              <ShieldCheck className="w-[600px] h-[600px] text-primary" strokeWidth={0.5} />
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Features;
