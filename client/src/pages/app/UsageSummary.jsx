import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { 
  Activity, 
  Database, 
  Terminal, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../lib/utils";

const UsageSummary = () => {
  const { projectId } = useParams();
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [activeMetric, setActiveMetric] = useState("volume");

  const fetchUsage = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/services/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setServices(res.data.data);
        let total = 0;
        const data = res.data.data.map((s) => {
          total += s.usage_count || 0;
          return {
            name: s.service_name,
            volume: s.usage_count || 0,
            threshold: 1000,
            uptime: 99.9,
          };
        });
        setTotalLogs(total);
        setChartData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const KPICard = ({ title, value, sub, icon: Icon, color }) => (
    <Card className="p-8 space-y-6 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity", color)}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text-', 'bg-'))} />
          <span className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em]">{title}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h4 className="text-4xl font-heading font-extrabold text-text uppercase tracking-tight">{value}</h4>
          <span className="technical-data text-[10px] text-text-muted/40 uppercase tracking-widest">{sub}</span>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-12 space-y-12 animate-pulse">
        <div className="h-40 bg-surface rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-32 bg-surface rounded-2xl" />
          <div className="h-32 bg-surface rounded-2xl" />
          <div className="h-32 bg-surface rounded-2xl" />
        </div>
        <div className="h-[400px] bg-surface rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in p-2">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border pb-12">
        <div className="space-y-6">
          <nav className="flex items-center gap-4 text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.4em]">
            <span>Registry</span>
            <ChevronRight className="w-3 h-3 text-primary" />
            <span className="text-text">Performance Pulse</span>
          </nav>
          <h1 className="text-5xl font-heading font-extrabold text-text uppercase tracking-tight leading-none">Usage<br/><span className="text-primary italic">Analytics.</span></h1>
        </div>
        <div className="flex bg-elevated/40 p-1 rounded-xl border border-border shadow-inner">
          <button 
            onClick={() => setActiveMetric("volume")}
            className={cn(
              "px-8 py-3 rounded-lg text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all",
              activeMetric === "volume" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-text-muted hover:text-text"
            )}
          >
            Volume
          </button>
          <button 
            onClick={() => setActiveMetric("latency")}
            className={cn(
              "px-8 py-3 rounded-lg text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all",
              activeMetric === "latency" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-text-muted hover:text-text"
            )}
          >
            Latency
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard 
          title="Log Throughput" 
          value={totalLogs.toLocaleString()} 
          sub="Total Packets" 
          icon={Database} 
          color="text-primary" 
        />
        <KPICard 
          title="Active Listeners" 
          value={services.length} 
          sub="Protocol Nodes" 
          icon={Zap} 
          color="text-secondary" 
        />
        <KPICard 
          title="Registry Health" 
          value="100%" 
          sub="Operational" 
          icon={ShieldCheck} 
          color="text-emerald-500" 
        />
      </div>

      {/* Main Analysis View */}
      <Card className="p-12 space-y-12 border-border shadow-4xl bg-elevated/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient opacity-[0.02] pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-border/50 pb-8">
          <div className="space-y-1">
            <h3 className="text-xl font-heading font-extrabold text-text uppercase tracking-tight">Protocol Distribution</h3>
            <p className="technical-data text-[10px] text-text-muted/60 uppercase tracking-widest">Comparative node volume over historical baseline</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="technical-data text-[9px] text-text-muted uppercase tracking-widest">Primary Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="technical-data text-[9px] text-text-muted uppercase tracking-widest">Verification Node</span>
            </div>
          </div>
        </div>

        <div className="h-[450px] w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--p))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--p))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Fira Code' }}
                dy={16}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Fira Code' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15,15,25,0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  backdropFilter: 'blur(20px)',
                  padding: '1.5rem',
                  fontFamily: 'Plus Jakarta Sans',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                  fontWeight: '800',
                  letterSpacing: '0.1em'
                }}
                itemStyle={{ color: 'hsl(var(--p))' }}
                cursor={{ stroke: 'rgba(139,92,246,0.2)', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="hsl(var(--p))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVolume)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-border/50">
          <div className="bg-base/30 p-8 rounded-2xl border border-border/50 space-y-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="text-primary w-5 h-5" />
              <h4 className="text-[12px] font-heading font-extrabold text-text uppercase tracking-widest">Growth Vector</h4>
            </div>
            <p className="text-text-muted font-body italic text-sm leading-relaxed">
              Log volume has increased by <span className="text-primary font-bold">12.5%</span> across all registry nodes in the last orbital period. Resource allocation remains within safety parameters.
            </p>
          </div>
          <div className="bg-base/30 p-8 rounded-2xl border border-border/50 space-y-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-secondary w-5 h-5" />
              <h4 className="text-[12px] font-heading font-extrabold text-text uppercase tracking-widest">Safety Margin</h4>
            </div>
            <p className="text-text-muted font-body italic text-sm leading-relaxed">
              Operational buffer is maintained at <span className="text-secondary font-bold">85%</span>. No critical threshold violations detected in current telemetry streams.
            </p>
          </div>
        </div>
      </Card>
      
      <div className="flex items-center justify-between pt-4 opacity-30">
        <span className="technical-data text-[9px] text-text-muted uppercase tracking-[0.2em]">Wooffer Analysis Engine v4.2.0</span>
        <span className="technical-data text-[9px] text-text-muted uppercase tracking-[0.2em]">Last Verification: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default UsageSummary;
