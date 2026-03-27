import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import axios from "axios";
import { 
  Plus, 
  Folder, 
  Calendar, 
  Search, 
  History, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  Bug, 
  Activity,
  Terminal,
  Shield,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";

/* ─── Log type helpers ─── */
const LOG_TYPES = ["all", "info", "warn", "error", "debug", "crash"];
const LOG_THEMES = {
  info: "text-secondary bg-secondary/10 border-secondary/20",
  warn: "text-primary bg-primary/10 border-primary/20",
  error: "text-text bg-red-500/10 border-red-500/20",
  crash: "text-text bg-red-600/20 border-red-600/30",
  debug: "text-text-muted bg-surface border-border",
  custom: "text-primary bg-primary/10 border-primary/20",
};

/* ─── Overall Logs Tab ─── */
const OverallLogs = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      const projectsRes = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!projectsRes.data.success) return;

      const projects = projectsRes.data.data;
      const allLogs = [];

      await Promise.all(
        projects.map(async (proj) => {
          try {
            const svcRes = await axios.get(
              `${API_BASE}/services/project/${proj._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (!svcRes.data.success) return;

            await Promise.all(
              svcRes.data.data.map(async (svc) => {
                try {
                  const logsRes = await axios.get(
                    `${API_BASE}/services/${svc._id}/logs?limit=100`,
                    { headers: { Authorization: `Bearer ${token}` } },
                  );
                  if (
                    logsRes.data.success &&
                    Array.isArray(logsRes.data.data)
                  ) {
                    logsRes.data.data.forEach((log) =>
                      allLogs.push({
                        ...log,
                        _projectName: proj.project_name,
                        _serviceName: svc.service_name,
                      }),
                    );
                  }
                } catch {}
              }),
            );
          } catch {}
        }),
      );

      allLogs.sort(
        (a, b) =>
          new Date(b.timestamp || b.createdAt) -
          new Date(a.timestamp || a.createdAt),
      );
      setLogs(allLogs);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Log fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 15000);
    return () => clearInterval(id);
  }, [fetchLogs]);

  const filtered = logs.filter((l) => {
    const typeMatch =
      filterType === "all" || (l.log_type || l.type || "info") === filterType;
    const searchMatch =
      !search ||
      (l.message || "").toLowerCase().includes(search.toLowerCase()) ||
      (l._serviceName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l._projectName || "").toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Toolbar */}
      <div className="flex flex-wrap gap-6 items-center bg-elevated/20 p-6 rounded-2xl border border-border/50">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Input
            type="text"
            placeholder="Search telemetry archive..."
            icon={<Search className="w-3.5 h-3.5" />}
            className="w-full bg-base/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {LOG_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "px-4 py-2 rounded-md text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all border",
                filterType === t 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-surface text-text-muted border-border hover:border-text-muted/40"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-6">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 text-[10px] font-heading font-extrabold uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            Sync
          </button>
          {lastRefresh && (
            <span className="technical-data text-[9px] text-text-muted/40 uppercase tracking-widest">
              Last Pulse: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Log Terminal View */}
      <div className="bg-elevated/40 rounded-[2.5rem] border border-border overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Terminal className="w-64 h-64" />
        </div>
        
        <div className="p-8 border-b border-border bg-base/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-heading font-extrabold uppercase tracking-[0.3em] text-text-muted">Archives: Wooffer Protocol</span>
          </div>
          <div className="technical-data text-[10px] text-text-muted/40 uppercase tracking-widest">
            {filtered.length} entries streaming
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="technical-data text-[10px] text-text-muted uppercase tracking-widest">Initializing Registry Sync...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 space-y-8">
            <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mx-auto border border-border">
              <History className="text-text-muted/20 w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-extrabold text-text uppercase">Zero Regressions.</h3>
              <p className="text-text-muted font-body italic">No logs found matching the current search parameters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[500px] max-h-[700px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-base/20 text-[10px] uppercase font-heading font-extrabold text-text-muted tracking-[0.3em] border-b border-border">
                  <th className="p-6 pl-10">Temporal Signature</th>
                  <th className="p-6">Type</th>
                  <th className="p-6">Message Stream</th>
                  <th className="p-6 hidden md:table-cell">Registry Node</th>
                  <th className="p-6 pr-10 hidden sm:table-cell">Service Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filtered.slice(0, 200).map((log, i) => {
                  const logType = log.log_type || log.type || "info";
                  return (
                    <tr key={log._id || i} className="hover:bg-primary/5 transition-all group">
                      <td className="p-6 pl-10 technical-data text-[11px] font-bold text-text-muted/60">
                        {new Date(log.timestamp || log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-6">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] technical-data font-extrabold uppercase tracking-widest border",
                          LOG_THEMES[logType] || LOG_THEMES.debug
                        )}>
                          {logType}
                        </span>
                      </td>
                      <td className="p-6 technical-data text-[12px] text-text-muted group-hover:text-text transition-colors max-w-md truncate">
                        {log.message || log.msg || "—"}
                      </td>
                      <td className="p-6 technical-data text-[11px] hidden md:table-cell text-text-muted/40 uppercase tracking-tighter">
                        {log._projectName}
                      </td>
                      <td className="p-6 pr-10 technical-data text-[11px] hidden sm:table-cell text-primary font-bold tracking-tight">
                        {log._serviceName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="technical-data text-[9px] text-text-muted/40 uppercase tracking-widest italic">Live Telemetry Active</span>
        </div>
        <p className="technical-data text-[9px] text-text-muted/30 uppercase tracking-[0.2em]">
          Entry Count: {Math.min(filtered.length, 200)} / {filtered.length} entries · 15s Pulse Sync
        </p>
      </div>
    </div>
  );
};

/* ─── App Dashboard ─── */
const AppDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    project_name: "",
    description: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setProjects(res.data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/projects/create`, newProject, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const created = res.data.data;
        setProjects([created, ...projects]);
        setIsModalOpen(false);
        setNewProject({ project_name: "", description: "" });
        navigate(`/project/${created._id}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="p-8 lg:p-20 max-w-[1600px] mx-auto w-full selection:bg-primary/20">
      {/* Editorial Header - No-Line Tonal Separation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-12 pb-12">
        <div className="space-y-6">
          <motion.nav 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.4em]"
          >
            <span>Telemetry</span>
            <ChevronRight className="w-3 h-3 text-primary" />
            <span className="text-text">Registry</span>
          </motion.nav>
          <h1 className="text-6xl font-heading font-extrabold text-text uppercase tracking-tight leading-none mb-0">Project<br/><span className="text-primary italic">Archive.</span></h1>
        </div>

        <div className="flex flex-col gap-6 w-full md:w-auto">
          <div className="flex bg-elevated/40 p-1.5 rounded-xl border border-border shadow-inner">
            <button
              className={cn(
                "px-8 py-3 rounded-lg text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all",
                activeTab === "projects" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-text-muted hover:text-text"
              )}
              onClick={() => setActiveTab("projects")}
            >
              Registry
            </button>
            <button
              className={cn(
                "px-8 py-3 rounded-lg text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all",
                activeTab === "logs" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-text-muted hover:text-text"
              )}
              onClick={() => setActiveTab("logs")}
            >
              Overall Logs
            </button>
          </div>
          
          {activeTab === "projects" && (
            <div className="flex gap-4">
              <div className="relative flex-1 md:w-80">
                <Input
                  type="text"
                  placeholder="Registry search..."
                  className="w-full bg-base/50"
                  icon={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-3 px-8 py-6 rounded-md bg-brand-gradient text-white border-none"
              >
                <Plus className="w-4 h-4" /> Node Initialization
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Projects tab */}
      {activeTab === "projects" && (
        <div className="space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-40 space-y-8 animate-pulse">
               <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
               <p className="technical-data text-[11px] text-text-muted uppercase tracking-widest">Hydrating Registry Nodes...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-40 text-center space-y-10 border-dashed border-2">
              <div className="w-24 h-24 bg-surface rounded-[2rem] flex items-center justify-center border border-border">
                <Folder className="text-text-muted/20 w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-heading font-extrabold text-text uppercase">Archive Empty.</h3>
                <p className="text-text-muted max-w-md mx-auto italic">
                  {searchQuery
                    ? "No registry nodes found matching your query protocol."
                    : "Initialize your first project to begin structural monitoring."}
                </p>
              </div>
              {!searchQuery && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-gradient text-white rounded-md px-12"
                >
                  Create Deployment
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/project/${project._id}`}
                    className="group block relative"
                  >
                    <Card className="h-full p-10 space-y-8 group-hover:bg-elevated/60 transition-all duration-500 shadow-3xl bg-elevated/20">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-surface/80 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-all">
                          <Folder className="text-text-muted group-hover:text-primary transition-colors w-6 h-6" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <div className="space-y-4">
                        <h2 className="text-2xl font-heading font-extrabold text-text uppercase tracking-tight group-hover:text-primary transition-colors">
                          {project.project_name}
                        </h2>
                        <p className="text-text-muted font-body italic text-sm line-clamp-2 leading-relaxed h-10 group-hover:text-text/70 transition-colors">
                          {project.description || "System metadata not provided."}
                        </p>
                      </div>

                      <div className="pt-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-text-muted/40 technical-data text-[9px] uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="px-3 py-1 bg-surface/80 rounded text-[9px] technical-data font-bold text-text-muted group-hover:text-primary transition-all">
                          ID: {project._id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Logs tab */}
      {activeTab === "logs" && <OverallLogs />}

      {/* Create Modal - Editorial Protocol */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-base/80 backdrop-blur-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-elevated/40 rounded-[3rem] border border-border shadow-4xl w-full max-w-2xl overflow-hidden relative z-10"
            >
              <div className="p-12 border-b border-border bg-base/30 text-center relative">
                <div className="flex items-center justify-center gap-4 text-primary text-[10px] font-heading font-extrabold uppercase tracking-[0.4em] mb-8">
                  <div className="w-8 h-[1px] bg-primary" />
                  Initialization Protocol
                </div>
                <h3 className="text-4xl font-heading font-extrabold text-text uppercase tracking-tight">New Project Node</h3>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mt-4 italic opacity-40">Wooffer Registry v2.0</p>
              </div>

              <form onSubmit={handleCreateProject} className="p-16 space-y-12 bg-surface/20">
                <div className="space-y-10">
                  <div className="group space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Project Identity</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. ARCH_CLUSTER_PROD"
                      className="w-full bg-base/40 p-6 rounded-md"
                      value={newProject.project_name}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          project_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  
                  <div className="group space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Description Protocol</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Define the scope and architectural context of this node..."
                      className="w-full bg-base/40 p-6 rounded-md border border-border focus:border-primary transition-all font-body text-sm text-text outline-none shadow-inner italic"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 py-8 text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] bg-surface hover:bg-elevated border border-border text-text-muted"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 py-8 text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] bg-brand-gradient text-white border-none shadow-2xl"
                  >
                    Deploy Node
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppDashboard;
