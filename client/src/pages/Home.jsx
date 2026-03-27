import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import {
  Rocket,
  Book,
  Server,
  Bell,
  Code,
  Terminal,
  Settings,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Bug,
  List,
  Activity,
  ChevronRight,
  Globe,
  Quote,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const Home = () => {
  const { openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");

  const servers = [
    { name: "api-prod-01", status: "online", cpu: "45%", mem: "1.2GB" },
    { name: "api-prod-02", status: "online", cpu: "38%", mem: "1.1GB" },
    { name: "db-primary", status: "online", cpu: "62%", mem: "8.4GB" },
    { name: "worker-01", status: "warning", cpu: "89%", mem: "3.1GB" },
  ];

  const logs = [
    { time: "10:42:01", level: "INFO", msg: "Request processed in 42ms" },
    { time: "10:42:05", level: "INFO", msg: "User login: admin" },
    {
      time: "10:42:12",
      level: "WARN",
      msg: "High latency detected on worker-01",
    },
    { time: "10:42:15", level: "INFO", msg: "Database backup completed" },
  ];

  const partners = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCmhyywAIRUnkxVcb74WxuBWQIHtMq7l8Q0XwLMnGf8nljI3uRFVkuJfKoBx3sL9CCceba-SDCegeT8Vh3dXbe-7tXDqPUp3fjCJKeGGlwYYjeY2CKm2Pst4QRdg_YNq-5bF0IXhYnG2qvyKSn34cnIKNJPIBRV83drHxCnqMQgMp23ip2TNzmK-3VZuXc_2EneXB5IvGkOrHjH4oZGos9e1_FMEuYcolP8aTAvV7kTxQvvjjil0q-E8OfiCLIufSh-zQin7zwrZis",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBU3fyLiYo2IDyh0Chm9dEY5b6Ub5g6uj-2Wn4-WIVuutQE1VRgxwgwn6MirohvyVzTUTazTAYMavdqUnQle0AQ4SzRQT78wsJiuTD-_xLTfFQL9IH4Kh7EkNNAGLuVfVlJ-SA-9f9Ri5_Dh6198YiQ1wzdsT61G_Ne2qhJKztm-9zZDJoNUHVpO0BJam014dvymezVdKILXcBzsWTjfcYKiJdnt1se-F1pEzeTtaXsaq19xU07ktCyNih5ZjgVgggxDNF8Ia71rD4",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKfqeMbrQHun0iyC8IlvM_39af072p316hR2bf2nX8cB2Pgtpwy5Hcd0WEvOc7csBXqWpPP8aVdEPv5nrCIxbcuHkAHKf3mPWE-VD-JN7ozPneAtPtv11aQn13o8UaGZ6_zDNZVuNaUJtSx25LlUiCUb71CVmTbGH9seFgyzAWODI0RnWEBvzOr7rBNGsDN9PeX57CgGoR2ZSE8LnywOdYiqTL24UCV-j-60pEspha_U1JrnPPokhW5b3DbddL89rfM16KQov3cMg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCWcGr94xgW-pHkkfmCbehHQA-hxYzcPgwC59Hav3TeaEz08FKlN2YPtdiXHoUL9LitKkZqbJs-XGPUj_wjC_Ml7SA4iO9NVCesQSMDdLoXY69xcj2Dn2dhpKuDS9pq4LLpv-xvts8zmXXlirsZaCIAIwi2YWnm-nqb7LPicCVUdQ_KHj4TEzKzo_FS8PKc12OQSBjcULJUGMzicH1jwaMVncpY4cPcKdUOPog3ssME9kKfYethx4YNypDsiB1Ldt7MMwLxZ2-mcSE",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB8v_a89yNxIT7i6ixZq-iGzBcQTgCqDjK-279lSPFB1EP-cYMuqnsvQJ6rIeUu1Oqwrjkp8zgBq1K_bQSVSaAp7ZBDCZNbVjD1_1RksNlsTWYbY9ytGP3YMgJQLNSZLi5NFxZayTkjZKXcvOqLxlhfrJQ5Rr0Td7rCGXImlN7xGVow-hfknikUhFnAh2wQXBZ50vI75mpIXXwspej0X90UqfAuU2g-3bcWtjUtBwIub0q0qqyVuT07eRUesXx1l5vNmHOTvT8McwM",
  ];

  return (
    <div className="min-h-screen bg-base selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-48 pb-40 mesh-gradient-animated overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-base to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-10 flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-elevated/40 border border-border mb-12"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] technical-data font-bold tracking-[0.2em] uppercase text-primary">v2.0 Performance Node</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-[64px] md:text-[96px] font-heading font-extrabold tracking-[-0.05em] text-text max-w-5xl leading-[0.95] mb-12"
          >
            Catch Every Bug. <br className="hidden lg:block" />
            Before Your <span className="italic text-transparent bg-clip-text bg-brand-gradient">Users Do.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-text-muted max-w-2xl mb-16 leading-relaxed font-body"
          >
            High-fidelity observability for modern engineering teams. Monitor, trace, and debug distributed systems with the precision of a master hunter.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-8 mb-32"
          >
            <Button size="lg" onClick={openAuthModal} className="px-12 py-8 text-lg bg-brand-gradient text-white border-none rounded-md font-heading font-extrabold shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
              Start Free Trial
            </Button>
            <Button size="lg" variant="secondary" className="px-12 py-8 text-lg bg-elevated border-border text-text rounded-md font-heading font-bold hover:bg-surface transition-all active:scale-95 group">
              Request a Demo
            </Button>
          </motion.div>

          {/* Perspective Dashboard Mockup - Redesigned to Stitch */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1.2 }}
            className="perspective-view w-full max-w-6xl mx-auto"
          >
            <div className="rotate-hero-dashboard bg-elevated rounded-[2.5rem] border border-border shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex flex-col h-[650px] w-full bg-surface/40 backdrop-blur-2xl">
                {/* Editorial Toolbar */}
                <div className="flex items-center gap-6 p-5 border-b border-border bg-base/30">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-base px-6 py-2 rounded-md text-[10px] technical-data text-text-muted/60 border border-border">
                      instance_01.prod.wooffer.io/{activeTab.toLowerCase()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Sidebar - Tonal architecture */}
                  <div className="w-72 border-r border-border p-8 hidden md:flex flex-col gap-3 bg-base/20">
                    <p className="text-[10px] font-heading font-extrabold text-text-muted mb-4 tracking-[0.3em] uppercase">The Watchtower</p>
                    {["Overview", "Servers", "Logs", "Alerts", "Settings"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setActiveTab(item)}
                        className={`px-5 py-4 rounded-md text-xs font-heading font-extrabold text-left uppercase tracking-widest transition-all ${
                          activeTab === item
                            ? "bg-primary/5 text-primary border-l-4 border-primary pl-4"
                            : "text-text-muted hover:text-text hover:bg-elevated/30"
                        }`}
                      >
                        {item}
                      </button>
                    ))}

                    <div className="mt-auto p-6 rounded-xl bg-elevated/40 border border-border">
                      <div className="text-[9px] font-heading font-extrabold text-text-muted mb-4 tracking-[0.3em] uppercase">Confidence Registry</div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_12px_rgba(251,191,36,0.4)]"></div>
                        <span className="text-[11px] font-heading font-extrabold text-secondary uppercase tracking-wider">99.9% Uptime Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Content Layer */}
                  <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-surface/10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-start mb-12">
                          <div>
                            <h2 className="text-4xl font-heading font-extrabold text-text tracking-[-0.04em] mb-2 leading-none uppercase">
                              {activeTab === "Overview" ? "Engine Status" : activeTab}
                            </h2>
                            <p className="technical-data text-[11px] text-text-muted uppercase tracking-widest">Temporal Signature: {new Date().toLocaleTimeString()}</p>
                          </div>
                          <div className="px-4 py-2 rounded-md bg-primary/10 text-primary technical-data text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                            Fidelity Pulse
                          </div>
                        </div>

                        {activeTab === "Overview" && (
                          <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-border py-4">
                              {[
                                { label: "Nodes Active", val: "482", color: "text-secondary" },
                                { label: "Execution Time", val: "42ms", color: "text-primary" },
                                { label: "Log Volume", val: "12.4M", color: "text-text" },
                              ].map((stat, i) => (
                                <div key={i} className={cn("p-8", i < 2 && "md:border-r border-border")}>
                                  <div className="text-[10px] font-heading font-extrabold text-text-muted mb-4 tracking-[0.3em] uppercase">{stat.label}</div>
                                  <div className={cn("text-5xl font-heading font-extrabold tracking-tighter", stat.color)}>{stat.val}</div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Prohibiting divider lines - using white space and tonal shifts */}
                            <div className="p-10 rounded-[2rem] bg-elevated/60 border border-border/10 relative overflow-hidden">
                              <div className="text-[10px] font-heading font-extrabold text-text-muted mb-10 tracking-[0.3em] uppercase">Traffic Architecture</div>
                              <div className="flex items-end justify-between gap-2.5 h-32">
                                {[40, 65, 55, 80, 70, 90, 85, 95, 80, 70, 60, 75, 85, 95, 100, 90, 80, 60, 50, 65, 75, 85, 95, 80].map((h, i) => (
                                  <div key={i} style={{ height: `${h}%` }} className="w-full bg-primary/20 rounded-sm transition-all hover:bg-primary/50 cursor-pointer"></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "Servers" && (
                          <div className="rounded-xl bg-elevated/40 border-border border overflow-hidden">
                            <table className="w-full text-left">
                              <thead className="bg-base/50 text-[10px] uppercase font-heading font-extrabold text-text-muted tracking-[0.3em]">
                                <tr>
                                  <th className="p-6">Technical Resource</th>
                                  <th className="p-6">Registry Status</th>
                                  <th className="p-6 text-right">CPU Node</th>
                                  <th className="p-6 text-right">Memory Stack</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/5">
                                {servers.map((s, i) => (
                                  <tr key={i} className="hover:bg-primary/5 transition-all group">
                                    <td className="p-6 technical-data text-[11px] font-bold tracking-tight text-text-muted group-hover:text-primary">{s.name}</td>
                                    <td className="p-6">
                                      <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[9px] technical-data font-extrabold uppercase tracking-widest",
                                        s.status === "online" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                                      )}>
                                        {s.status}
                                      </span>
                                    </td>
                                    <td className="p-6 text-right technical-data text-[11px]">{s.cpu}</td>
                                    <td className="p-6 text-right technical-data text-[11px]">{s.mem}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {activeTab === "Logs" && (
                           <div className="bg-base/60 rounded-[2rem] p-10 technical-data text-[11px] text-text-muted/80 h-[400px] overflow-y-auto border border-border shadow-inner custom-scrollbar">
                            {logs.map((log, i) => (
                              <div key={i} className="mb-4 flex gap-6 hover:translate-x-1 transition-transform p-1.5 group">
                                <span className="opacity-20 text-[9px]">{log.time}</span>
                                <span className={cn("font-extrabold w-14 tracking-widest text-[9px]", log.level === "INFO" ? "text-secondary" : "text-primary")}>{log.level}</span>
                                <span className="text-text/70 group-hover:text-text transition-colors">{log.msg}</span>
                              </div>
                            ))}
                            <div className="animate-pulse text-primary mt-6 tracking-widest">_READY</div>
                          </div>
                        )}
                        
                        {/* More tabs follow the same editorial/tonal pattern... */}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Hierarchy */}
      <section className="py-24 bg-elevated/30 border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 text-center mb-16">
          <p className="text-[10px] font-heading font-extrabold text-text-muted tracking-[0.4em] uppercase">Trusted and Verified Tier 1 Partners</p>
        </div>
        <div className="marquee-container relative flex h-14">
          <div className="animate-marquee gap-24 md:gap-40 items-center px-12">
            {partners.concat(partners).map((url, i) => (
              <img key={i} alt="Partner" className="h-6 opacity-20 grayscale brightness-200 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer" src={url} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Sections - Editorial Precision */}
      <section className="py-56 bg-base">
        <div className="max-w-7xl mx-auto px-10 space-y-64">
           {/* Feature - Asymmetric Left */}
          <div className="grid md:grid-cols-2 gap-32 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="w-16 h-16 bg-brand-gradient p-[1px] rounded-xl overflow-hidden">
                <div className="w-full h-full bg-base rounded-[11px] flex items-center justify-center">
                  <Bug className="text-primary w-8 h-8" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-heading font-extrabold text-text tracking-[-0.05em] leading-[1.05] uppercase">Real-time Error <br/>Monitoring</h2>
                <p className="text-text-muted leading-relaxed text-xl max-w-lg font-body font-medium">
                  Identify root causes in seconds. Our agent captures full-stack traces and contextually metadata without impacting your production performance.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-4">
                <div className="flex items-center gap-4 technical-data text-[11px] font-extrabold text-text uppercase tracking-widest">
                  <div className="w-4 h-[1px] bg-primary" /> Temporal Sequence Tracking
                </div>
                <div className="flex items-center gap-4 technical-data text-[11px] font-extrabold text-text uppercase tracking-widest">
                  <div className="w-4 h-[1px] bg-primary" /> Multi-Source Map Resolution
                </div>
              </div>
            </motion.div>
            <motion.div 
               initial={{ opacity: 0, rotateY: -10 }}
               whileInView={{ opacity: 1, rotateY: 0 }}
               className="relative"
            >
               <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full translate-x-12" />
               <div className="relative z-10 p-1 bg-elevated rounded-[2.5rem] shadow-3xl">
                  <img className="rounded-[2.2rem]" alt="Error Data" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASh0zMLXQbszkRKG5a_sEWHs52U-K0h9MAwjjlXiiWgKlvZztTxiUjWj2Qbpc9-17UBisuiXAVP0jYoCoBl8_aIjTaTQvni5hP4Na_gXSReaBXMouGxjQUuhssxMpD-3zsblrBHBUKw1vh-pAfsn_jzTwty6sBXCGsA36FyHxPfjh3YIYqJlU-Vgyv3-01O0f9vJyuCF-2UuBk_1l6sxGhyZDJTMm2TR9qgfXRg04JZ4R4UT4Pes54VwiVSiyOdZSKwrjaXNd0XCQ" />
               </div>
            </motion.div>
          </div>

          {/* Feature - Asymmetric Right */}
          <div className="grid md:grid-cols-2 gap-32 items-center">
            <motion.div 
               initial={{ opacity: 0, rotateY: 10 }}
               whileInView={{ opacity: 1, rotateY: 0 }}
               className="order-2 md:order-1 relative"
            >
               <div className="absolute inset-0 bg-secondary/15 blur-[100px] rounded-full -translate-x-12" />
               <div className="relative z-10 p-1 bg-elevated rounded-[2.5rem] shadow-3xl">
                  <img className="rounded-[2.2rem]" alt="Logs Data" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYjMhcI8lgUbqdXUOJguFXki2DM6ICMS_JiM8Ysz_UH8-ok5hckZNOi_0vxs6MSgwKlEQR4cR5Qn5PeJblAbYPkp5Jme3uqDqwGzm9vE98Ot28Vm3mLkLLsx1S5nJLxX_k1X_xWXMHNsXjGSQnJolSYHcE7-tnMJsTYba48F6Yd_7MTthgTPKhiLFXDSx_b7qEfMd6GL8zZ6d-qVoDFjR5orQktbEIjDoDuVA0SC3HyHmtqrqa5i9FRHNhmeq5BXgFfn3L-qRSyRQ" />
               </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="order-1 md:order-2 space-y-12"
            >
              <div className="w-16 h-16 bg-brand-gradient p-[1px] rounded-xl overflow-hidden">
                <div className="w-full h-full bg-base rounded-[11px] flex items-center justify-center">
                  <List className="text-primary w-8 h-8" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-heading font-extrabold text-text tracking-[-0.05em] leading-[1.05] uppercase">Structured Log <br/>Orchestration</h2>
                <p className="text-text-muted leading-relaxed text-xl max-w-lg font-body font-medium">
                  The end of unmanageable text blobs. Our system parses trillions of events into queryable objects. Filter by service, node, or custom correlation ID.
                </p>
              </div>
              <div className="p-10 bg-base/80 rounded-[2rem] border border-border shadow-inner group transition-all hover:bg-elevated/40">
                <div className="flex gap-3 mb-8">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary/40 group-hover:bg-secondary transition-colors" />
                  <span className="text-[10px] technical-data text-text-muted group-hover:text-text ml-4 uppercase tracking-[0.2em]">Engine Query Protocol</span>
                </div>
                <code className="text-base text-secondary flex flex-col gap-1.5 technical-data font-bold">
                  <span className="text-primary">SELECT</span> aggregate(*) <span className="text-primary">FROM</span> event_nodes
                  <span className="text-text-muted opacity-50">WHERE signature = 'error'</span>
                  <span className="text-text-muted opacity-50">AND cluster_id = 'prod-ops-1'</span>
                </code>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Uptime Protection - Image Parity Section */}
      <section className="py-56 bg-base relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-10 relative z-10 grid md:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <div className="w-16 h-16 bg-brand-gradient p-[1px] rounded-xl overflow-hidden">
              <div className="w-full h-full bg-base rounded-[11px] flex items-center justify-center">
                <Globe className="text-primary w-8 h-8" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-6">
              <p className="technical-data text-[10px] font-extrabold text-primary tracking-[0.4em] uppercase">Global Node Registry</p>
              <h2 className="text-5xl font-heading font-extrabold text-text tracking-[-0.05em] leading-[1.05] uppercase">Global Uptime <br/>Protection</h2>
              <p className="text-text-muted leading-relaxed text-xl max-w-lg font-body font-medium">
                Preventive synthetic monitoring from 50+ global edge locations. Get notified via Slack, PagerDuty, or Webhook before the first user notices.
              </p>
            </div>
            <div className="flex gap-12 pt-8">
              <div>
                <p className="text-4xl font-heading font-extrabold text-secondary mb-1">99.99%</p>
                <p className="technical-data text-[10px] text-text-muted uppercase tracking-widest">SLA Guarantee</p>
              </div>
              <div>
                <p className="text-4xl font-heading font-extrabold text-text mb-1">&lt;1 min</p>
                <p className="technical-data text-[10px] text-text-muted uppercase tracking-widest">Incident Response</p>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
            <div className="relative z-10 p-1 bg-elevated rounded-[3rem] border border-border/20 shadow-4xl overflow-hidden">
              <svg viewBox="0 0 1000 500" className="w-full h-auto opacity-80">
                <path fill="var(--color-text-muted)" opacity="0.1" d="M150,100 Q200,50 250,100 T350,150 T450,100 T550,150 T650,100 T750,150 T850,100" />
                <path fill="var(--color-text-muted)" opacity="0.1" d="M100,250 Q150,200 200,250 T300,300 T400,250 T500,300 T600,250 T700,300 T800,250" />
                {/* Simplified World Points */}
                {[
                  { x: 180, y: 150 }, { x: 250, y: 180 }, { x: 420, y: 120 }, 
                  { x: 550, y: 160 }, { x: 780, y: 140 }, { x: 850, y: 280 },
                  { x: 520, y: 350 }, { x: 280, y: 380 }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="var(--color-primary)" className="animate-pulse" />
                    <circle cx={pt.x} cy={pt.y} r="12" fill="none" stroke="var(--color-primary)" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Pure Tonal Authority (Updated to 4-column parity) */}
      <section className="py-48 bg-base relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="max-w-7xl mx-auto px-12 relative z-10">
          <div className="bg-elevated/40 rounded-[3rem] border border-border p-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {[
              { label: "Uptime Protection", val: "99.99%", color: "text-secondary" },
              { label: "People & Latency", val: "<200ms", color: "text-primary" },
              { label: "Logs / Day / Avg", val: "10M+", color: "text-text" },
              { label: "Mean Time to Recover", val: "<1min", color: "text-text" },
            ].map((item, i) => (
              <div key={i} className="py-12 md:py-0 px-12 text-center">
                <p className={cn("text-5xl font-heading font-extrabold mb-4 tracking-[-0.05em]", item.color)}>{item.val}</p>
                <div className="w-12 h-1 bg-primary/20 mx-auto mb-6" />
                <p className="text-[10px] technical-data font-extrabold uppercase tracking-[0.3em] text-text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voices of Precision - Testimonials Section */}
      <section className="py-56 bg-base">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-32 space-y-6">
            <h2 className="text-5xl font-heading font-extrabold text-text tracking-[-0.05em] leading-tight uppercase">Voices of Precision</h2>
            <div className="w-24 h-1 bg-brand-gradient mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                quote: "Wooffer transformed how we handle environment-driven debugging. The 3D trace visualization is a game changer for complex microservices.",
                name: "Advait Deshpande",
                role: "CTO @ PRISM AI"
              },
              {
                quote: "The logging latency is non-existent. Our response times improved by 40% since switching to the automated root-cause detection. Absolute clarity.",
                name: "Ananya Iyer",
                role: "Lead Engineer @ SYNTH VX"
              },
              {
                quote: "We don't just monitor at scale anymore—we observe with intent. The Precision Hearth aesthetic makes debugging feel like high-end research.",
                name: "Rohan Mehra",
                role: "SRE @ BLOCK LAYER"
              }
            ].map((t, i) => (
              <div key={i} className="p-12 bg-elevated/40 rounded-[2.5rem] border border-border group hover:bg-elevated/60 transition-all">
                <Quote className="text-primary/20 w-12 h-12 mb-8 group-hover:text-primary transition-colors" fill="currentColor" />
                <p className="text-text/90 text-lg leading-relaxed font-body italic mb-12">"{t.quote}"</p>
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
                     {t.name.charAt(0)}
                   </div>
                   <div>
                     <p className="text-sm font-heading font-black text-text uppercase tracking-wider">{t.name}</p>
                     <p className="text-[10px] technical-data text-text-muted uppercase tracking-widest">{t.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner - Image Parity Copy */}
      <section className="max-w-7xl mx-auto px-10 py-56">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="relative rounded-[4rem] overflow-hidden bg-brand-gradient p-1 bg-elevated shadow-4xl"
        >
          <div className="w-full h-full bg-base rounded-[3.9rem] flex flex-col items-center py-32 px-10 text-center space-y-16">
            <h2 className="text-5xl md:text-8xl font-heading font-extrabold text-text tracking-[-0.05em] leading-[0.9] max-w-4xl uppercase">
              Stop guessing. <br/> Start <span className="text-transparent bg-clip-text bg-brand-gradient">observing.</span>
            </h2>
            <p className="text-text-muted text-xl max-w-2xl leading-relaxed">
              Join 2,000+ teams engineering the future with absolute visibility. High-fidelity monitoring for high-tier engineering. NO credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-8">
               <Button size="lg" onClick={openAuthModal} className="bg-brand-gradient text-white px-14 py-8 text-xl font-heading font-extrabold uppercase rounded-md shadow-2xl hover:scale-105 transition-all">
                  Get Started Now
               </Button>
               <Button size="lg" variant="ghost" className="bg-elevated border border-border text-text px-14 py-8 text-xl font-heading font-extrabold uppercase rounded-md hover:bg-surface transition-all">
                  Talk to Sales
               </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
