import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config/api";
import axios from "axios";
import {
  FaPlus,
  FaServer,
  FaCode,
  FaArrowLeft,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Plus, Server, Code, ArrowLeft, Copy, CheckCircle, ShieldCheck, Terminal, Cpu, Activity, Globe, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Services = () => {
  const { projectId } = useParams();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    service_name: "",
    environment: "development",
  });
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, servicesRes] = await Promise.all([
        axios.get(`${API_BASE}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/services/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (projectRes.data.success) setProject(projectRes.data.data);
      if (servicesRes.data.success) setServices(servicesRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE}/services/create`,
        {
          ...newService,
          project_id: projectId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        setServices([...services, res.data.data]);
        setIsModalOpen(false);
        setNewService({ service_name: "", environment: "development" });
      }
    } catch (error) {
      console.error("Error creating service:", error);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-base p-8 lg:p-16 selection:bg-primary/20">
      <div className="max-w-[1400px] mx-auto">
        <Link
          to="/projects"
          className="group flex items-center gap-2 text-[10px] font-heading font-extrabold uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Back to Registries
        </Link>

        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border pb-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-text-muted text-[10px] font-heading font-extrabold uppercase tracking-[0.3em]">
              Node Index: {project?.project_name}
            </div>
            <h1 className="text-6xl font-heading font-extrabold text-text tracking-[-0.05em] uppercase leading-none">
              Services
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-4 bg-brand-gradient text-white px-10 py-5 rounded-md font-heading font-extrabold uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Provision Service
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-elevated/20 rounded-[3rem] border border-border border-dashed"
          >
            <Server className="text-text-muted w-20 h-20 mx-auto mb-8 opacity-20" strokeWidth={1} />
            <h3 className="text-2xl font-heading font-extrabold text-text uppercase mb-4 tracking-tight">No Active Services</h3>
            <p className="text-text-muted font-body mb-10 max-w-md mx-auto">
              Provision your first service instance to generate integration credentials and begin architectural telemetry.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 bg-elevated border border-border rounded-md text-[10px] font-heading font-extrabold uppercase tracking-widest text-text hover:bg-surface transition-all"
            >
              Initialize Provisioning
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Services List */}
            <div className="lg:col-span-7 space-y-10">
              {services.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface/20 border border-border p-12 rounded-[2.5rem] transition-all hover:bg-surface/40"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          service.environment === 'production' ? "bg-primary" : "bg-secondary"
                        )} />
                        <span className="technical-data text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
                          {service.environment} Instance
                        </span>
                      </div>
                      <h2 className="text-3xl font-heading font-extrabold text-text uppercase tracking-tight group-hover:text-primary transition-colors">
                        {service.service_name}
                      </h2>
                    </div>
                    <Link
                      to={`/dashboard?serviceId=${service._id}`}
                      className="px-6 py-2.5 bg-elevated border border-border rounded-md text-[9px] font-heading font-extrabold uppercase tracking-widest text-text hover:bg-primary hover:text-white transition-all"
                    >
                      View Logic
                    </Link>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-heading font-extrabold text-text-muted uppercase tracking-[0.2em]">Registry Signature</label>
                        <span className="text-[8px] technical-data text-primary hidden group-hover:block transition-all">SENSITIVE DATA</span>
                      </div>
                      <div className="flex items-center gap-4 bg-base p-5 rounded-xl border border-border group/token">
                        <code className="technical-data text-[10px] flex-1 text-text-muted truncate overflow-hidden">
                          {service.project_token}
                        </code>
                        <button
                          onClick={() => copyToClipboard(service.project_token, `pt-${service._id}`)}
                          className="p-2.5 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-white"
                        >
                          {copiedToken === `pt-${service._id}` ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-heading font-extrabold text-text-muted uppercase tracking-[0.2em]">Access Credentials</label>
                        <span className="text-[8px] technical-data text-secondary hidden group-hover:block transition-all">SESSION DYNAMICS</span>
                      </div>
                      <div className="flex items-center gap-4 bg-base p-5 rounded-xl border border-border group/token">
                        <code className="technical-data text-[10px] flex-1 text-text-muted truncate overflow-hidden">
                          {service.service_token}
                        </code>
                        <button
                          onClick={() => copyToClipboard(service.service_token, `st-${service._id}`)}
                          className="p-2.5 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-white"
                        >
                          {copiedToken === `st-${service._id}` ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Integration Guide - Digital Curator Style */}
            <div className="lg:col-span-5">
              <div className="sticky top-12">
                <div className="stitch-glass bg-elevated/40 border border-border rounded-[3rem] p-12 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Terminal className="w-40 h-40" strokeWidth={1} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Code className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-heading font-extrabold text-text uppercase tracking-tight">Manual Implementation</h3>
                    </div>

                    <div className="space-y-10">
                      <div className="space-y-5">
                        <p className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Step 01: Core Installation
                        </p>
                        <div className="bg-black/40 rounded-xl p-6 border border-border">
                          <pre className="technical-data text-[11px] text-primary">
                            <code>$ npm install server-monitoring-tool</code>
                          </pre>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <p className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          Step 02: Node Injection
                        </p>
                        <div className="rounded-xl overflow-hidden border border-border">
                          <SyntaxHighlighter
                            language="javascript"
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, padding: '24px', backgroundColor: 'rgba(0,0,0,0.4)', fontSize: '11px', fontFamily: 'Fira Code' }}
                          >
                            {`const stitch = require("monitor-tool");

// Initialize Telemetry
stitch.init({
  projectToken: "${services[0]?.project_token || "REGISTRY_ID"}",
  serviceToken: "${services[0]?.service_token || "ACCESS_KEY"}",
  backendUrl: "https://api.stitch.io"
});`}
                          </SyntaxHighlighter>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border flex items-center gap-6">
                        <ShieldCheck className="text-primary w-5 h-5 opacity-50" />
                        <p className="text-[9px] font-body text-text-muted italic">All telemetry streams are encrypted via architectural node parameters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Provision Service Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-elevated border border-border rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
              >
                <div className="bg-brand-gradient h-3 text-right pr-12">
                  <div className="inline-block px-4 py-1.5 bg-black text-[#F97316] text-[8px] font-bold uppercase tracking-[0.4em] rounded-b-lg">provisioning-node-active</div>
                </div>
                <div className="p-16">
                  <h3 className="text-4xl font-heading font-extrabold text-text uppercase mb-4 tracking-tight">Provision Instance</h3>
                  <p className="text-text-muted font-body mb-10 text-sm">Define the operational parameters for your new service instance.</p>
                  
                  <form onSubmit={handleCreateService} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-widest pl-2">Service Identifier</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-surface/40 border border-border p-6 rounded-xl text-text font-heading text-lg focus:outline-none focus:border-primary transition-colors uppercase tracking-tight font-bold"
                        placeholder="E.G. API-GATEWAY-01"
                        value={newService.service_name}
                        onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-widest pl-2">Environment Cluster</label>
                      <select
                        className="w-full bg-surface/40 border border-border p-6 rounded-xl text-text font-heading text-sm focus:outline-none focus:border-primary transition-colors uppercase tracking-widest font-bold appearance-none"
                        value={newService.environment}
                        onChange={(e) => setNewService({ ...newService, environment: e.target.value })}
                      >
                        <option value="development">Sandbox (Development)</option>
                        <option value="staging">Verification (Staging)</option>
                        <option value="production">Primary (Production)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-6 pt-6 align-middle">
                      <button
                        type="button"
                        className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-widest hover:text-white transition-colors"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-brand-gradient text-white px-12 py-5 rounded-md font-heading font-extrabold uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl"
                      >
                        Initialize Provisioning
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Services;
