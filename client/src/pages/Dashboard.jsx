import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config/api";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FaServer,
  FaMemory,
  FaHdd,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

import { 
  Server, 
  Cpu, 
  Activity, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Settings, 
  LayoutDashboard,
  HardDrive
} from "lucide-react";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const { token } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (serviceId) {
      fetchServiceAndMetrics();
      const interval = setInterval(fetchServiceAndMetrics, 5000); // Polling 5s
      return () => clearInterval(interval);
    }
  }, [serviceId]);

  const fetchServiceAndMetrics = async () => {
    try {
      if (!service) setLoading(true);
      const [serviceRes, metricsRes] = await Promise.all([
        axios.get(`${API_BASE}/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/monitoring/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (serviceRes.data.success) setService(serviceRes.data.data);
      if (metricsRes.data.success) setMetrics([...metricsRes.data.data].reverse());
      setError(null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Registry lookup failed. Verify agent node connection.");
    } finally {
      setLoading(false);
    }
  };

  const currentMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  if (!serviceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] bg-base text-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-elevated p-16 rounded-[2.5rem] border border-border max-w-xl w-full"
        >
          <Server className="text-primary w-20 h-20 mx-auto mb-10" strokeWidth={1} />
          <h1 className="text-4xl font-heading font-extrabold mb-6 uppercase tracking-tight">Select Node</h1>
          <p className="text-text-muted mb-10 font-body leading-relaxed">
            Initialize a registry connection to view real-time architectural telemetry.
          </p>
          <Link to="/projects" className="inline-block bg-brand-gradient text-white px-10 py-5 rounded-md font-heading font-extrabold uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">
            Open Registries
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-base selection:bg-primary/20">
      {loading && !service ? (
        <div className="flex justify-center items-center h-[70vh]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary/10 border border-primary/20 p-8 rounded-xl flex items-center gap-6 text-primary">
            <AlertCircle className="w-8 h-8" />
            <span className="font-heading font-bold uppercase tracking-widest text-xs">{error}</span>
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto space-y-12">
          {/* Digital Curator Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border pb-12">
            <div>
              <div className="flex items-center gap-5 mb-4">
                <h1 className="text-5xl font-heading font-extrabold text-text tracking-[-0.04em] uppercase">
                  {service?.service_name}
                </h1>
                <div className="bg-primary/5 text-primary border border-primary/20 px-4 py-1.5 rounded-md technical-data text-[10px] font-bold uppercase tracking-[0.2em]">
                  {service?.environment}
                </div>
              </div>
              <div className="flex items-center gap-6 text-text-muted technical-data text-[11px] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Registry Connection Active
                </div>
                <div className="w-[1px] h-3 bg-border" />
                <span>Sig: {currentMetric ? new Date(currentMetric.timestamp).toLocaleTimeString() : "Syncing..."}</span>
              </div>
            </div>
            <Link
              to={`/services/${service?.project_id?._id || service?.project_id}`}
              className="px-8 py-3.5 bg-elevated border border-border rounded-md text-[10px] font-heading font-extrabold uppercase tracking-widest text-text hover:bg-surface transition-all"
            >
              Registry Parameters
            </Link>
          </div>

          {!currentMetric ? (
            <div className="flex flex-col items-center justify-center h-96 bg-elevated/20 rounded-[2rem] border border-border border-dashed">
              <Clock className="text-text-muted w-12 h-12 mb-6 animate-spin-slow" />
              <p className="technical-data text-[10px] uppercase tracking-[0.3em] text-text-muted">Awaiting Telemetry Stream...</p>
            </div>
          ) : (
            <>
              {/* Curator Stats - Asymmetric Precision */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border rounded-[2rem] overflow-hidden bg-elevated/20">
                <StatCard
                  title="Compute Load"
                  value={`${currentMetric.cpu_usage}%`}
                  icon={<Cpu className="w-6 h-6" />}
                  color="text-secondary"
                  border
                />
                <StatCard
                  title="Memory Saturation"
                  value={`${currentMetric.memory_usage}%`}
                  icon={<Activity className="w-6 h-6" />}
                  color="text-primary"
                  border
                />
                <StatCard
                  title="Temporal Uptime"
                  value={`${Math.floor(currentMetric.uptime / 60)}m`}
                  desc={`Sig: ${Math.floor(currentMetric.uptime / 3600)}h ${Math.floor((currentMetric.uptime % 3600) / 60)}m`}
                  icon={<ShieldCheck className="w-6 h-6" />}
                  color="text-secondary"
                  border
                />
                <StatCard
                  title="Architecture"
                  value={currentMetric.platform || "Linux"}
                  icon={<HardDrive className="w-6 h-6" />}
                  color="text-text"
                />
              </div>

              {/* Functional Precision Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <ChartCard title="Compute Registry History">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={metrics}>
                      <defs>
                        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#584237" strokeOpacity={0.1} />
                      <XAxis
                        dataKey="timestamp"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A1998F", fontSize: 10, fontFamily: "Fira Code" }}
                        tickFormatter={(str) =>
                          new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A1998F", fontSize: 10, fontFamily: "Fira Code" }}
                        domain={[0, 100]} 
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpu_usage"
                        stroke="#F97316"
                        strokeWidth={2.5}
                        fill="url(#cpuGradient)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Memory Allocation History">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={metrics}>
                      <defs>
                        <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#584237" strokeOpacity={0.1} />
                      <XAxis
                        dataKey="timestamp"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A1998F", fontSize: 10, fontFamily: "Fira Code" }}
                        tickFormatter={(str) =>
                          new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A1998F", fontSize: 10, fontFamily: "Fira Code" }}
                        domain={[0, 100]} 
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                      />
                      <Area
                        type="monotone"
                        dataKey="memory_usage"
                        stroke="#FBBF24"
                        strokeWidth={2.5}
                        fill="url(#memGradient)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-elevated border border-border p-5 rounded-md shadow-2xl backdrop-blur-xl">
        <p className="technical-data text-[10px] text-text-muted mb-2 uppercase tracking-widest">{new Date(label).toLocaleString()}</p>
        <p className="technical-data text-2xl font-bold text-primary">
          {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, desc, icon, color, border }) => (
  <div className={cn("p-10 bg-surface/20 hover:bg-surface/40 transition-all group", border && "md:border-r border-border")}>
    <div className="flex justify-between items-start mb-6">
      <div className={cn("p-3 rounded-lg bg-base", color)}>{icon}</div>
      <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
    </div>
    <div className="text-[10px] font-heading font-extrabold text-text-muted mb-2 tracking-[0.3em] uppercase">{title}</div>
    <div className="text-4xl font-heading font-extrabold tracking-[-0.05em] text-text technical-data leading-none">
      {value}
    </div>
    {desc && <div className="mt-4 text-[10px] technical-data text-text-muted font-bold opacity-60 uppercase tracking-widest">{desc}</div>}
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-elevated/40 rounded-[2.5rem] border border-border p-12 hover:bg-elevated/60 transition-all">
    <div className="flex justify-between items-center mb-12">
      <h2 className="text-xs font-heading font-extrabold text-text uppercase tracking-[0.4em]">{title}</h2>
      <div className="flex gap-2">
        <div className="w-1 h-1 rounded-full bg-border" />
        <div className="w-1 h-1 rounded-full bg-border" />
        <div className="w-1 h-1 rounded-full bg-border" />
      </div>
    </div>
    {children}
  </div>
);

export default Dashboard;
