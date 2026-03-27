import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  useParams,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import axios from "axios";
import {
  Plus,
  Server,
  CheckCircle2,
  Settings,
  Trash2,
  X,
  Check,
  ChevronRight,
  Shield,
  ShieldCheck,
  LayoutGrid,
  Users,
  Search,
  Activity,
  History,
  Lock,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { cn } from "../../lib/utils";

/* ─── Project Overview Tab ─── */
const ProjectOverview = ({ project, services, fetchServices, showToast }) => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    service_name: "",
    environment: "development",
  });
  const [creating, setCreating] = useState(false);

  const handleCreateService = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post(
        `${API_BASE}/services/create`,
        { ...newService, project_id: project._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setIsModalOpen(false);
        setNewService({ service_name: "", environment: "development" });
        fetchServices();
        showToast(`Service "${newService.service_name}" initialized!`, "success");
      }
    } catch (error) {
      showToast("Failed to initialize service.", "error");
    } finally {
      setCreating(false);
    }
  };

  const envBadge = {
    production: "bg-red-500/10 text-red-500 border-red-500/20",
    staging: "bg-secondary/10 text-secondary border-secondary/20",
    development: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Section Header */}
      <div className="flex justify-between items-end border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.4em]">
            <Server className="w-3 h-3" />
            <span>Service Registry</span>
          </div>
          <p className="text-text-muted/60 text-[11px] font-body italic">
            Monitoring {services.length} active service node{services.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-gradient text-white px-8 py-6 rounded-md shadow-2xl"
        >
          <Plus className="w-4 h-4 mr-3" /> Node Initialization
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="py-32 flex flex-col items-center justify-center text-center space-y-8 border-dashed">
          <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center border border-border">
            <Server className="text-text-muted/20 w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-heading font-extrabold text-text uppercase">Registry Empty.</h3>
            <p className="text-text-muted max-w-sm mx-auto italic">Initialize your first service node to begin technical telemetry monitoring.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="px-12 py-6">
            Begin Setup
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {services.map((service) => (
            <Link
              to={`/project/service/${project._id}/${service._id}`}
              key={service._id}
              className="group block relative"
            >
              <Card className="p-8 space-y-8 group-hover:bg-elevated/40 transition-all duration-500 border-border group-hover:border-primary/30 shadow-3xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                  <Activity className="w-24 h-24" />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-4">
                    <Badge variant="outline" className={cn("text-[9px] font-heading font-extrabold uppercase tracking-widest px-3 py-1 rounded-md", envBadge[service.environment] || "bg-surface border-border")}>
                      {service.environment}
                    </Badge>
                    <h3 className="text-xl font-heading font-extrabold text-text uppercase group-hover:text-primary transition-colors">
                      {service.service_name}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center border border-border group-hover:border-primary/20 transition-all">
                    <Server className="text-text-muted group-hover:text-primary transition-colors w-5 h-5" />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 flex items-center justify-between technical-data text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-secondary font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Connected
                  </div>
                  <div className="text-text-muted/40 italic">Last Pulse: Recently</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Initialize Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
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
              className="bg-elevated/40 rounded-[3rem] border border-border shadow-4xl w-full max-w-lg overflow-hidden relative z-10"
            >
              <div className="p-10 border-b border-border bg-base/30 text-center">
                <div className="flex items-center justify-center gap-4 text-primary text-[10px] font-heading font-extrabold uppercase tracking-[0.4em] mb-6">
                  <div className="w-6 h-[1px] bg-primary" />
                  Node Setup
                </div>
                <h3 className="text-3xl font-heading font-extrabold text-text uppercase tracking-tight">System Node</h3>
              </div>

              <form onSubmit={handleCreateService} className="p-12 space-y-10">
                <div className="space-y-8">
                  <div className="group space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Node Identity</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Master Backend API"
                      className="w-full bg-base/40 p-6 rounded-md"
                      value={newService.service_name}
                      onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                    />
                  </div>
                  <div className="group space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Operational Environment</label>
                    <select
                      className="w-full bg-base/40 p-6 rounded-md border border-border focus:border-primary transition-all font-heading font-extrabold uppercase text-[11px] tracking-widest text-text outline-none appearance-none cursor-pointer"
                      value={newService.environment}
                      onChange={(e) => setNewService({ ...newService, environment: e.target.value })}
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 py-7 uppercase text-[10px] tracking-widest font-heading font-extrabold border-border"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Abort
                  </Button>
                  <Button type="submit" className="flex-1 py-7 bg-brand-gradient text-white uppercase text-[10px] tracking-widest font-heading font-extrabold border-none shadow-2xl">
                    Deploy
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

/* ─── Project Settings Tab ─── */
const ProjectSettings = ({ project, callerRole, showToast, onProjectDeleted, onProjectUpdated }) => {
  const { token } = useAuth();
  const isOwner = callerRole === "owner";
  const canWrite = callerRole === "owner" || callerRole === "full";
  const [activeTab, setActiveTab] = useState("info");
  const [form, setForm] = useState({ project_name: project?.project_name, description: project?.description });
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [contributors, setContributors] = useState(project?.contributors || []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/projects/${project._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        onProjectUpdated(res.data.data);
        showToast("Project registry updated.", "success");
      }
    } catch {
      showToast("Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const [deleteInput, setDeleteInput] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-16 animate-fade-in items-start">
      <aside className="w-full lg:w-64 space-y-4">
        <div className="stitch-glass bg-elevated/20 p-4 rounded-3xl border border-border shadow-2xl flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
          {[
            { id: "info", label: "Registry Info", icon: Info },
            { id: "contributors", label: "Contributors", icon: Users, locked: !isOwner },
            { id: "delete", label: "Terminate Node", icon: Trash2, danger: true, locked: !isOwner }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => !t.locked && setActiveTab(t.id)}
              className={cn(
                "flex-1 lg:w-full flex items-center justify-between px-6 py-4 rounded-xl text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all whitespace-nowrap lg:whitespace-normal",
                activeTab === t.id && !t.locked
                  ? t.danger ? "bg-red-500 text-white shadow-xl shadow-red-500/20" : "bg-primary text-white shadow-xl shadow-primary/20"
                  : t.locked ? "opacity-20 cursor-not-allowed grayscale" : "text-text-muted hover:bg-surface/50"
              )}
            >
              <div className="flex items-center gap-4">
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </div>
              {t.locked && <Lock className="w-2.5 h-2.5 opacity-40" />}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 w-full space-y-12">
        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="space-y-4">
                 <h3 className="text-2xl font-heading font-extrabold text-text uppercase tracking-tight leading-none">Metadata<br/><span className="text-secondary italic">Profile.</span></h3>
                 <p className="text-[11px] text-text-muted font-body italic">Current operational parameters for this registry node.</p>
              </div>

              <Card className="p-8 space-y-6 bg-surface/30">
                 {[
                   { label: "Registry UID", value: project._id },
                   { label: "Temporal Origin", value: new Date(project.created_at).toLocaleString() },
                   { label: "Authority Node", value: project.user_id?.name || "Verified Admin" }
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-none">
                     <span className="text-[9px] font-heading font-extrabold text-text-muted uppercase tracking-[0.2em]">{item.label}</span>
                     <span className="technical-data text-[11px] text-text font-bold">{item.value}</span>
                   </div>
                 ))}
              </Card>

              {canWrite && (
                <form onSubmit={handleUpdate} className="space-y-8 bg-elevated/20 p-10 rounded-[2.5rem] border border-border shadow-3xl">
                  <div className="group space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Registry Alias</label>
                    <Input
                      type="text"
                      className="w-full bg-base/40 p-6 rounded-md"
                      value={form.project_name}
                      onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                    />
                  </div>
                  <div className="group space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Scope Definition</label>
                    <textarea
                      rows={4}
                      className="w-full bg-base/40 p-6 rounded-md border border-border focus:border-primary transition-all font-body text-sm text-text outline-none italic"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" loading={saving} className="bg-primary text-white px-12 py-6 rounded-md shadow-2xl shadow-primary/20">
                      Update Metadata
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === "delete" && isOwner && (
            <motion.div key="delete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="p-10 border border-red-500/30 bg-red-500/5 rounded-[3rem] space-y-10 shadow-3xl max-w-2xl">
                  <div className="flex items-start gap-8">
                     <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shrink-0">
                        <Trash2 className="text-red-500 w-8 h-8" />
                     </div>
                     <div className="space-y-3">
                        <h3 className="text-2xl font-heading font-extrabold text-red-500 uppercase tracking-tight">Full Deregistration.</h3>
                        <p className="text-[12px] text-text-muted font-body leading-relaxed italic">
                           All associated service nodes and telemetry streams will be <span className="text-red-500 font-bold uppercase tracking-widest not-italic">permanently expunged</span>. Recovery protocols are unavailable.
                        </p>
                     </div>
                  </div>

                  <div className="group space-y-4 pt-4">
                     <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] pl-1">Confirm Target Node</label>
                     <Input
                        className="w-full bg-base/50 p-6 rounded-md border-red-500/20 focus:border-red-500"
                        placeholder={project.project_name}
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                     />
                  </div>

                  <Button
                    disabled={deleteInput !== project.project_name}
                    className="w-full bg-red-500 text-white py-8 rounded-md shadow-2xl shadow-red-500/20 uppercase text-[10px] font-heading font-extrabold tracking-widest disabled:opacity-20"
                  >
                     Authorize Purge
                  </Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ─── Main Project Layout ─── */
const ProjectLayout = () => {
  const { projectId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const fetchProjectData = useCallback(async () => {
    try {
      const pRes = await axios.get(`${API_BASE}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pRes.data.success) setProject(pRes.data.data);

      const sRes = await axios.get(`${API_BASE}/services/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sRes.data.success) setServices(sRes.data.data);
    } catch (error) {
      console.error(error);
      navigate("/app");
    } finally {
      setLoading(false);
    }
  }, [projectId, token, navigate]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-64 space-y-12 animate-pulse min-h-screen bg-base">
        <div className="w-20 h-20 border-2 border-primary/20 border-t-primary rounded-[2rem] animate-spin" />
        <p className="technical-data text-[12px] text-text-muted uppercase tracking-[0.4em]">Hydrating Component Registry...</p>
      </div>
    );
  }

  const callerRole = project?.user_id?._id === user?._id ? "owner" : (project?.contributors?.find(c => (c.user?._id || c.user) === user?._id)?.role || "limited");

  return (
    <div className="flex-1 bg-base min-h-screen relative overflow-hidden selection:bg-primary/20 pb-40">
      <div className="absolute inset-x-0 top-0 h-[800px] bg-brand-gradient opacity-[0.03] pointer-events-none -z-10 blur-3xl opacity-30" />
      
      <div className="max-w-[1600px] mx-auto px-8 lg:px-20 pt-16 lg:pt-32 space-y-16">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border pb-12">
          <div className="space-y-8">
            <button 
              onClick={() => navigate("/app")}
              className="group flex items-center gap-4 text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.4em] hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Return Registry
            </button>
            <div className="space-y-4">
               <h1 className="text-7xl font-heading font-extrabold text-text uppercase tracking-tight leading-none">
                 {project.project_name}<br/><span className="text-primary italic">Command.</span>
               </h1>
               <div className="flex items-center gap-6">
                 <Badge variant="outline" className="technical-data text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md border-primary/20 text-primary">
                    Node ID: {project._id.slice(-8).toUpperCase()}
                 </Badge>
                 <span className="technical-data text-[10px] text-text-muted/40 uppercase tracking-widest italic">Verification Level: {callerRole}</span>
               </div>
            </div>
          </div>

          <div className="flex bg-elevated/40 p-1.5 rounded-xl border border-border shadow-inner relative z-10">
             {[
               { id: "overview", label: "Overview", icon: LayoutGrid },
               { id: "analytics", label: "Analytics", icon: Activity },
               { id: "settings", label: "Configuration", icon: Settings }
             ].map(tab => {
               const isActive = location.pathname.endsWith(tab.id) || (tab.id === 'overview' && location.pathname.endsWith(projectId));
               return (
                 <Link
                   key={tab.id}
                   to={tab.id === 'overview' ? `/project/${projectId}` : `/project/${projectId}/${tab.id}`}
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

        {/* Dynamic Route Content */}
        <main className="min-h-[600px]">
          <Routes>
            <Route index element={<ProjectOverview project={project} services={services} fetchServices={fetchProjectData} showToast={showToast} />} />
            <Route path="analytics" element={<Navigate to={`/project/usage/${projectId}`} replace />} />
            <Route path="settings" element={<ProjectSettings project={project} callerRole={callerRole} showToast={showToast} onProjectDeleted={() => navigate("/app")} onProjectUpdated={setProject} />} />
          </Routes>
        </main>
      </div>

      {/* Global Security Toasts */}
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 rounded-2xl stitch-glass bg-elevated/80 border border-primary/30 shadow-4xl pointer-events-none"
          >
            {t.type === 'success' ? <ShieldCheck className="text-secondary w-5 h-5" /> : <AlertTriangle className="text-red-500 w-5 h-5" />}
            <span className="text-[11px] font-heading font-extrabold text-text uppercase tracking-widest">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProjectLayout;
