import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config/api";
import axios from "axios";
import { FaPlus, FaFolder, FaCalendarAlt } from "react-icons/fa";

import { Plus, Folder, Calendar, Search, ArrowRight, Layers, Layout, Globe, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Projects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
      if (res.data.success) {
        setProjects(res.data.data);
      }
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
        setProjects([res.data.data, ...projects]);
        setIsModalOpen(false);
        setNewProject({ project_name: "", description: "" });
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-base p-8 lg:p-16 selection:bg-primary/20">
      <div className="max-w-[1400px] mx-auto">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border pb-16 mb-20">
          <div className="space-y-6">
            <h1 className="text-6xl font-heading font-extrabold text-text tracking-[-0.05em] uppercase leading-none">
              Registries
            </h1>
            <div className="flex items-center gap-4 text-text-muted text-[10px] font-heading font-extrabold uppercase tracking-[0.3em]">
              <div className="w-12 h-[1px] bg-primary" />
              Node Architecture Management
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-4 bg-brand-gradient text-white px-10 py-5 rounded-md font-heading font-extrabold uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Initialize Registry
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 bg-elevated/20 rounded-[3rem] border border-border border-dashed"
          >
            <Layers className="text-text-muted w-20 h-20 mx-auto mb-8 opacity-20" strokeWidth={1} />
            <h3 className="text-2xl font-heading font-extrabold text-text uppercase mb-4 tracking-tight">No Active Registries</h3>
            <p className="text-text-muted font-body mb-10 max-w-md mx-auto">
              Initialize your first architectural node to begin deployment and monitoring orchestration.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 bg-elevated border border-border rounded-md text-[10px] font-heading font-extrabold uppercase tracking-widest text-text hover:bg-surface transition-all"
            >
              Start Implementation
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/services/${project._id}`}
                  className="group block bg-surface/20 border border-border p-12 rounded-[2.5rem] transition-all hover:bg-surface/40 hover:-translate-y-2"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="p-4 bg-base rounded-2xl text-primary group-hover:bg-primary/10 transition-colors">
                      <Layout className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className="bg-primary/5 text-primary border border-primary/20 px-3 py-1 rounded-md technical-data text-[9px] font-bold uppercase tracking-widest">
                      Node {index + 1}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-12">
                    <h2 className="text-3xl font-heading font-extrabold text-text uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {project.project_name}
                    </h2>
                    <p className="text-text-muted text-sm font-body leading-relaxed line-clamp-2 min-h-[3rem]">
                      {project.description || "Architectural parameters not specified for this registry node."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-10">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      <span className="technical-data text-[10px] text-text-muted uppercase font-bold tracking-widest">
                        EST: {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-black">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* High-End Design System Modal */}
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
                className="bg-elevated border border-border rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-10"
              >
                <div className="bg-brand-gradient h-3" />
                <div className="p-16">
                  <h3 className="text-4xl font-heading font-extrabold text-text uppercase mb-4 tracking-tight">Initialize Node</h3>
                  <p className="text-text-muted font-body mb-10 text-sm">Define the registry parameters for your new architectural instance.</p>
                  
                  <form onSubmit={handleCreateProject} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-widest pl-2">Registry Identifier</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-surface/40 border border-border p-6 rounded-xl text-text font-heading text-lg focus:outline-none focus:border-primary transition-colors uppercase tracking-tight font-bold"
                        placeholder="E.G. CORE-INFRASTRUCTURE"
                        value={newProject.project_name}
                        onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-widest pl-2">Architecture Description</label>
                      <textarea
                        className="w-full bg-surface/40 border border-border p-6 rounded-xl text-text font-body text-sm focus:outline-none focus:border-primary transition-colors h-40 resize-none"
                        placeholder="Technical scope of this node..."
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-6 pt-6 align-middle">
                      <button
                        type="button"
                        className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-widest hover:text-white transition-colors"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Abort
                      </button>
                      <button 
                        type="submit" 
                        className="bg-white text-black px-12 py-5 rounded-md font-heading font-extrabold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                      >
                        Confirm Initialization
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

export default Projects;
