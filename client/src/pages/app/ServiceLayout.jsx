import React, { useState, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  useParams,
  Navigate,
  useNavigate,
  useLocation,
  Link
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import axios from "axios";
import {
  Server,
  Activity,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Network,
  Bug,
  Trash2,
  Copy,
  Check,
  Terminal,
  Lightbulb,
  Rocket,
  Key,
  ChevronRight,
  Shield,
  ArrowLeft,
  Cpu,
  BarChart3,
  Settings
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const fmtBytes = (mb) => {
  if (!mb && mb !== 0) return "â€”";
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
};

const fmtUptime = (secs) => {
  if (!secs && secs !== 0) return "â€”";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// â”€â”€â”€ Copy Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CopyBtn = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-md text-[9px] font-heading font-extrabold uppercase tracking-widest transition-all border",
        copied 
          ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20" 
          : "bg-surface text-text-muted border-border hover:border-text-muted/40",
        className
      )}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

// â”€â”€â”€ Step Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const StepCard = ({ number, title, children }) => (
  <Card className="overflow-hidden border-border bg-elevated/20 p-0 shadow-3xl">
    <div className="flex items-center gap-4 px-8 py-5 border-b border-border bg-base/30">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-[10px] font-heading font-extrabold flex-shrink-0 shadow-lg shadow-primary/20">
        {number}
      </div>
      <h3 className="text-[11px] font-heading font-extrabold text-text uppercase tracking-widest">{title}</h3>
    </div>
    <div className="p-8">{children}</div>
  </Card>
);

// â”€â”€â”€ Setup Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SetupTab = ({ service }) => {
  const integrationCode = `const wooffer = require("wooffer-monitoring");

// Initialize Telemetry â€” place at origin (app.js / server.js)
wooffer.init({
  projectToken: "${service?.project_token || "AUTH_PROJECT_TOKEN"}",
  serviceToken: "${service?.service_token || "AUTH_SERVICE_TOKEN"}",
  backendUrl: "${API_BASE.replace("/api/v1", "")}"
});`;

  return (
    <div className="animate-fade-in max-w-4xl space-y-12">
      <div className="stitch-glass bg-primary/5 p-8 rounded-[2rem] border border-primary/20 flex items-start gap-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <Rocket className="text-primary w-6 h-6" />
        </div>
        <div className="space-y-2">
           <h2 className="text-xl font-heading font-extrabold text-text uppercase tracking-tight">Integration Protocol</h2>
           <p className="text-[12px] text-text-muted font-body italic leading-relaxed">
             Syncronize <span className="text-primary font-bold not-italic">{service?.service_name}</span> with the Wooffer Registry. Once initialized, real-time telemetry will stream to this dashboard automatically.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <StepCard number="01" title="Install Dependency">
          <div className="flex items-center justify-between gap-4 bg-base/50 p-6 rounded-md border border-border group">
            <div className="flex items-center gap-4">
              <Terminal className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
              <code className="technical-data text-[12px] font-bold text-text-muted group-hover:text-text transition-colors">npm install wooffer-monitoring</code>
            </div>
            <CopyBtn text="npm install wooffer-monitoring" />
          </div>
        </StepCard>

        <StepCard number="02" title="Source Initialization">
          <div className="space-y-6">
            <div className="bg-[#1e1e1e] rounded-md border border-border overflow-hidden">
               <div className="flex items-center justify-between px-6 py-3 bg-[#252526] border-b border-border">
                  <span className="technical-data text-[9px] text-text-muted uppercase tracking-widest">entry_point.js</span>
                  <CopyBtn text={integrationCode} />
               </div>
               <SyntaxHighlighter
                language="javascript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "1.5rem",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  background: "transparent",
                  fontFamily: 'Fira Code'
                }}
              >
                {integrationCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </StepCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="p-8 space-y-6 bg-elevated/20 transition-all hover:bg-elevated/40">
           <div className="flex items-center gap-4">
             <Key className="text-primary w-5 h-5" />
             <span className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em]">Project Authority Token</span>
           </div>
           <div className="flex items-center justify-between gap-4 bg-base/50 p-5 rounded-md border border-border">
             <code className="technical-data text-[11px] font-bold text-text-muted truncate">{service?.project_token}</code>
             <CopyBtn text={service?.project_token || ""} />
           </div>
        </Card>
        <Card className="p-8 space-y-6 bg-elevated/20 transition-all hover:bg-elevated/40">
           <div className="flex items-center gap-4">
             <Key className="text-secondary w-5 h-5" />
             <span className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em]">Service Probe Token</span>
           </div>
           <div className="flex items-center justify-between gap-4 bg-base/50 p-5 rounded-md border border-border">
             <code className="technical-data text-[11px] font-bold text-text-muted truncate">{service?.service_token}</code>
             <CopyBtn text={service?.service_token || ""} />
           </div>
        </Card>
      </div>

      <div className="flex items-center gap-4 p-6 rounded-xl bg-surface border border-border opacity-60">
        <Lightbulb className="text-secondary w-4 h-4 shrink-0" />
        <p className="technical-data text-[9px] text-text-muted/60 uppercase tracking-widest italic">
          Encryption Caution: Safeguard these credentials. Tokens allow direct telemetry streaming to your registry.
        </p>
      </div>
    </div>
  );
};

// â”€â”€â”€ Dashboard Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DashboardTab = ({ metrics }) => {
  const current = metrics.length > 0 ? metrics[0] : null;

  if (!current) return (
     <Card className="py-40 flex flex-col items-center justify-center text-center space-y-8 border-dashed">
        <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center border border-border">
          <Network className="text-text-muted/20 w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-heading font-extrabold text-text uppercase">Probe Inactive.</h3>
          <p className="text-text-muted max-w-sm mx-auto italic">Initialization required. Navigate to the Setup protocol to begin telemetry streaming.</p>
        </div>
        <Button variant="outline" className="px-12 py-6">
          Access Setup
        </Button>
      </Card>
  );

  const cpu = current.cpu_usage ?? 0;
  const mem = current.memory_usage ?? 0;
  const disk = current.disk_usage ?? 0;
  const uptime = current.uptime ?? 0;

  const MetricCard = ({ title, value, pct, icon: Icon, color }) => (
    <Card className="p-8 space-y-8 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity", color)}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text-', 'bg-'))} />
          <span className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em]">{title}</span>
        </div>
        <div className="space-y-2">
          <h4 className="text-4xl font-heading font-extrabold text-text uppercase tracking-tight">{value}</h4>
          <div className="w-full h-1.5 bg-base/50 rounded-full overflow-hidden border border-border">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${pct}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className={cn("h-full rounded-full transition-all duration-300", color.replace('text-', 'bg-'))} 
             />
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="animate-fade-in space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <MetricCard title="CPU Core Load" value={`${cpu}%`} pct={cpu} icon={Cpu} color="text-primary" />
        <MetricCard title="Memory Index" value={`${mem}%`} pct={mem} icon={Database} color="text-secondary" />
        <MetricCard title="Disk Partition" value={`${disk}%`} pct={disk} icon={Server} color="text-accent" />
        <MetricCard title="Service Pulsar" value={fmtUptime(uptime)} pct={100} icon={Clock} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 p-12 space-y-10 border-border bg-elevated/20 shadow-4xl relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-gradient opacity-[0.01] pointer-events-none" />
           <div className="flex items-center justify-between border-b border-border/50 pb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-heading font-extrabold text-text uppercase tracking-tight">Active Telemetry</h3>
                <p className="technical-data text-[10px] text-text-muted/60 uppercase tracking-widest italic">Live operational baseline from node probe</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="technical-data text-[10px] text-text font-bold uppercase tracking-widest">Pulse Active</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-4 text-text-muted/40">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest">Host Parameters</span>
                 </div>
                 <div className="space-y-4">
                    {[
                      { l: "Hostname", v: current.process_usage?.hostname || "Unknown" },
                      { l: "Platform", v: current.process_usage?.platform || "Linux/Unix" },
                      { l: "PID Index", v: current.pid || current.process_usage?.pid || "â€”" },
                      { l: "Architecture", v: "x64 / ARMv8" }
                    ].map(i => (
                      <div key={i.l} className="flex justify-between items-center py-2 border-b border-border/20 last:border-none">
                         <span className="technical-data text-[9px] text-text-muted/60 uppercase tracking-widest">{i.l}</span>
                         <span className="technical-data text-[11px] text-text font-bold uppercase tracking-tighter">{i.v}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center gap-4 text-text-muted/40">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest">Processor Cache</span>
                 </div>
                 <div className="space-y-4">
                    {[
                      { l: "Model", v: current.process_usage?.cpuModel?.split(' ')[0] || "Intel / AMD" },
                      { l: "Logical Cores", v: current.process_usage?.cpuCores || "â€”" },
                      { l: "Max Freq", v: `${current.process_usage?.cpuSpeed || "â€”"} GHz` },
                      { l: "Total Physical", v: fmtBytes(current.process_usage?.totalMem / (1024*1024)) || "â€”" }
                    ].map(i => (
                      <div key={i.l} className="flex justify-between items-center py-2 border-b border-border/20 last:border-none">
                         <span className="technical-data text-[9px] text-text-muted/60 uppercase tracking-widest">{i.l}</span>
                         <span className="technical-data text-[11px] text-text font-bold uppercase tracking-tighter">{i.v}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </Card>

        <Card className="p-12 space-y-10 bg-surface/30 border-border relative overflow-hidden">
           <div className="flex items-center gap-4 text-text-muted/40 absolute top-12 left-12">
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest">Pulse History</span>
           </div>
           <div className="pt-12 h-full overflow-y-auto custom-scrollbar space-y-4">
              {metrics.slice(0, 10).map((m, i) => (
                <div key={i} className="flex items-center justify-between group">
                   <div className="technical-data text-[10px] text-text-muted/40 group-hover:text-primary transition-colors">
                      {new Date(m.timestamp || m.createdAt).toLocaleTimeString()}
                   </div>
                   <div className="flex gap-4">
                      <span className="technical-data text-[10px] text-text-muted group-hover:text-text">{m.cpu_usage}% CPU</span>
                      <span className="technical-data text-[10px] text-text-muted group-hover:text-text">{m.memory_usage}% RAM</span>
                   </div>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );
};

// â”€â”€â”€ Main Service Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ServiceLayout = () => {
  const { projectId, serviceId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [service, setService] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchData = useCallback(async () => {
    try {
      const sRes = await axios.get(`${API_BASE}/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sRes.data.success) setService(sRes.data.data);

      const mRes = await axios.get(`${API_BASE}/services/${serviceId}/metrics?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (mRes.data.success) setMetrics(mRes.data.data);
    } catch (error) {
      console.error(error);
      navigate(`/project/${projectId}`);
    } finally {
      setLoading(false);
    }
  }, [serviceId, projectId, token, navigate]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    if (location.pathname.endsWith("setup")) setActiveTab("setup");
    else if (location.pathname.endsWith("settings")) setActiveTab("settings");
    else setActiveTab("dashboard");
  }, [location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-64 space-y-12 animate-pulse min-h-screen bg-base">
        <div className="w-20 h-20 border-2 border-primary/20 border-t-primary rounded-[2rem] animate-spin" />
        <p className="technical-data text-[12px] text-text-muted uppercase tracking-[0.4em]">Calibrating Probe Handshake...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base min-h-screen relative overflow-hidden selection:bg-primary/20 pb-40">
      <div className="absolute inset-x-0 top-0 h-[800px] bg-brand-gradient opacity-[0.03] pointer-events-none -z-10 blur-3xl opacity-30" />
      
      <div className="max-w-[1600px] mx-auto px-8 lg:px-20 pt-16 lg:pt-32 space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border pb-12">
          <div className="space-y-8">
            <Link 
              to={`/project/${projectId}`}
              className="group flex items-center gap-4 text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.4em] hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Return Controller
            </Link>
            <div className="space-y-4">
               <h1 className="text-7xl font-heading font-extrabold text-text uppercase tracking-tight leading-none">
                 {service.service_name}<br/><span className="text-secondary italic">Probe.</span>
               </h1>
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <span className="technical-data text-[10px] text-text font-bold uppercase tracking-widest">Online</span>
                 </div>
                 <Badge variant="outline" className="technical-data text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md border-secondary/20 text-secondary">
                    ENV: {service.environment}
                 </Badge>
               </div>
            </div>
          </div>

          <div className="flex bg-elevated/40 p-1.5 rounded-xl border border-border shadow-inner relative z-10">
             {[
               { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "" },
               { id: "setup", label: "Protocol Setup", icon: Terminal, path: "/setup" },
               { id: "settings", label: "Config", icon: Settings, path: "/settings" }
             ].map(tab => {
               const isActive = activeTab === tab.id;
               return (
                 <Link
                   key={tab.id}
                   to={`/project/service/${projectId}/${serviceId}${tab.path}`}
                   className={cn(
                     "flex items-center gap-3 px-8 py-3.5 rounded-lg text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all",
                     isActive ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-text-muted hover:text-text"
                   )}
                 >
                   <tab.icon className="w-3.5 h-3.5" />
                   {tab.label}
                 </Link>
               );
             })}
          </div>
        </div>

        <main className="min-h-[500px]">
           {activeTab === "dashboard" && <DashboardTab metrics={metrics} />}
           {activeTab === "setup" && <SetupTab service={service} />}
           {activeTab === "settings" && (
             <Card className="p-16 border-border flex flex-col items-center justify-center text-center space-y-10">
                <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center border border-border">
                  <Settings className="text-text-muted/20 w-10 h-10" />
                </div>
                <div className="space-y-4">
                   <h3 className="text-3xl font-heading font-extrabold uppercase text-text">Configuration Lock.</h3>
                   <p className="text-text-muted max-w-sm italic">Service parameters are currently managed by the master registry controller. Advanced probe tuning is coming soon.</p>
                </div>
             </Card>
           )}
        </main>
      </div>
    </div>
  );
};

export default ServiceLayout;

