import React from "react";
import { motion } from "framer-motion";
import { 
  Search,
  Code,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Quote
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";

const NeedOfWooffer = () => {
  const comparisonData = [
    { feature: "Tonal Depth UI", wooffer: true, datadog: false, sentry: false },
    { feature: "Predictive Cost Caps", wooffer: true, datadog: true, sentry: false },
    { feature: "Native Fira Code Support", wooffer: true, datadog: false, sentry: false },
    { feature: "Adaptive Data Indexing", wooffer: true, datadog: "Partial", sentry: true },
    { feature: "Wooffer Architecture", wooffer: true, datadog: false, sentry: false },
  ];

  const testimonials = [
    {
      name: "Felix Vance",
      role: "Principal Engineer, Linear",
      quote: "Wooffer has completely changed how we handle post-mortems. The tonal layering UI makes spikes in latency immediately obvious without digging through logs.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    },
    {
      name: "Sarah Chen",
      role: "CTO, Vercel",
      quote: "Finally, a monitoring tool that respects the developer's focus. No cluttered dashboards—just the data we need, styled with absolute precision.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Marcus Thorne",
      role: "DevOps Lead, Stripe",
      quote: "The cost-capping alone saved us thousands. But the real value is in the 'Wooffer Archive' approach to data storage. It's a game changer.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    }
  ];

  return (
    <div className="min-h-screen bg-base selection:bg-primary/20 overflow-x-hidden">
      <main className="pt-32 pb-20">
        {/* Hero Section - The Narrative */}
        <section className="max-w-[1400px] mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-20 items-center p-16 lg:p-24 rounded-[4rem] bg-surface/20 border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-4 text-primary text-[10px] font-heading font-extrabold uppercase tracking-[0.4em] mb-12">
                <div className="w-12 h-[1px] bg-primary" />
                The Wooffer Protocol
              </div>
              <h1 className="text-7xl lg:text-8xl font-heading font-extrabold tracking-[-0.05em] text-text uppercase leading-[0.9] mb-12">
                Diagnostic<br/><span className="text-primary italic">Clarity.</span>
              </h1>
              <p className="text-xl text-text-muted leading-relaxed mb-16 max-w-xl font-body italic border-l-2 border-primary/20 pl-8">
                Existing observability tools prioritize storage over understanding. Wooffer is built as a living archive, turning chaotic telemetry into actionable structural insight.
              </p>
              
              <div className="space-y-6 max-w-lg">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-8 p-10 rounded-[2.5rem] bg-elevated/40 border border-border group hover:bg-elevated/60 transition-all shadow-xl"
                >
                  <AlertTriangle className="text-primary w-8 h-8 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-[10px] font-heading font-extrabold text-primary uppercase tracking-[0.3em] mb-4">The Regression</h4>
                    <p className="text-lg text-text font-body leading-relaxed">High-cardinality data causes billing spikes and alert fatigue in legacy systems.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-8 p-10 rounded-[2.5rem] bg-elevated/40 border border-border group hover:bg-elevated/60 transition-all shadow-xl"
                >
                  <CheckCircle2 className="text-secondary w-8 h-8 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-[10px] font-heading font-extrabold text-secondary uppercase tracking-[0.3em] mb-4">The Wooffer Solution</h4>
                    <p className="text-lg text-text font-body leading-relaxed">Adaptive indexing and tonal layering focus your eye on the outliers that matter.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="stitch-glass bg-elevated/30 aspect-square rounded-[4rem] border border-border p-16 flex items-center justify-center shadow-2xl">
                <div className="w-full space-y-12">
                  <div className="technical-data text-[10px] text-primary font-bold tracking-[0.4em] uppercase">SYSTEM_STATE: MONITORING</div>
                  <div className="grid grid-cols-4 gap-6">
                    {[50, 80, 40, 70].map((h, i) => (
                      <div key={i} className="h-48 bg-base/50 rounded-2xl flex flex-col justify-end p-4 border border-border">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 1.5, ease: "circOut" }}
                          className={cn("w-full rounded-md", i % 2 === 0 ? "bg-primary" : "bg-secondary")}
                        ></motion.div>
                      </div>
                    ))}
                  </div>
                  <div className="p-10 bg-base/50 rounded-3xl border border-border space-y-6 relative overflow-hidden group/card shadow-inner">
                    <div className="absolute top-0 right-0 p-8">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-2 w-1/4 bg-primary/20 rounded-full"></div>
                      <div className="h-4 w-16 bg-secondary/10 rounded-sm border border-secondary/20"></div>
                    </div>
                    <div className="h-[1px] w-full bg-border" />
                    <div className="space-y-4">
                      <div className="h-2 w-full bg-text-muted/10 rounded-full"></div>
                      <div className="h-2 w-5/6 bg-text-muted/10 rounded-full"></div>
                      <div className="h-2 w-4/6 bg-text-muted/10 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comparison Matrix - Precision Engineering */}
        <section className="max-w-[1400px] mx-auto px-8 py-40">
          <div className="text-center mb-32 space-y-8">
            <span className="text-primary technical-data text-[10px] font-bold tracking-[0.5em] uppercase">Comparative Analysis</span>
            <h2 className="text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-text uppercase leading-none">Precision over Volume.</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto italic font-body leading-relaxed">See how the Wooffer Protocol stacks up against industry incumbents.</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[3rem] bg-surface/10 border border-border shadow-2xl"
          >
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-elevated/50 text-text-muted uppercase tracking-[0.3em] text-[10px] font-heading font-black">
                  <th className="p-12 border-b border-border">Technical Layer</th>
                  <th className="p-12 border-b border-border text-primary italic">Wooffer (WOOFFER)</th>
                  <th className="p-12 border-b border-border opacity-40">Datadog</th>
                  <th className="p-12 border-b border-border opacity-40">Sentry</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-heading font-extrabold uppercase tracking-widest text-text-muted">
                {comparisonData.map((row, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors duration-500 group border-b border-border/50">
                    <td className="p-12 text-text tracking-tighter text-lg normal-case font-heading font-extrabold">{row.feature}</td>
                    <td className="p-12">
                      <div className="w-10 h-10 rounded-md bg-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="p-12">
                      {typeof row.datadog === "string" ? (
                        <span className="text-[9px] font-black tracking-[0.3em]">{row.datadog}</span>
                      ) : row.datadog ? (
                        <CheckCircle2 className="w-5 h-5 text-text-muted/20" />
                      ) : (
                        <X className="w-5 h-5 text-error/20" />
                      )}
                    </td>
                    <td className="p-12">
                      {row.sentry ? (
                        <CheckCircle2 className="w-5 h-5 text-text-muted/20" />
                      ) : (
                        <X className="w-5 h-5 text-error/20" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>

        {/* Global Registry Testimonials */}
        <section className="max-w-[1400px] mx-auto px-8 py-40">
          <div className="grid lg:grid-cols-3 gap-12">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface/20 p-16 rounded-[3rem] relative overflow-hidden group border border-border hover:bg-surface/40 hover:border-primary/30 transition-all duration-700 shadow-xl"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity rotate-12">
                  <Quote className="w-32 h-32 text-text" />
                </div>
                <div className="flex items-center gap-6 mb-12">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-brand-gradient rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-700"></div>
                    <img src={t.avatar} alt={t.name} className="relative w-16 h-16 rounded-md bg-elevated border border-border p-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-extrabold text-text tracking-tight uppercase leading-none">{t.name}</h4>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-2">{t.role}</p>
                  </div>
                </div>
                <p className="text-xl text-text leading-relaxed font-body italic">"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final Architectural CTA */}
        <section className="max-w-[1400px] mx-auto px-8 py-20 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-surface p-24 lg:p-40 rounded-[5rem] border border-border overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-16">
              <h2 className="text-7xl lg:text-8xl font-heading font-extrabold tracking-tighter text-text uppercase leading-[0.9] mb-0">Initialize<br/><span className="text-primary italic">Scale.</span></h2>
              <p className="text-2xl text-text-muted font-body max-w-xl mx-auto italic leading-relaxed">Join 1,200+ engineering teams using Wooffer to secure their diagnostic future.</p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                <button className="bg-brand-gradient text-white px-20 py-8 rounded-md font-heading font-extrabold uppercase text-[12px] tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">
                  Deploy Protocol
                </button>
                <button className="bg-elevated text-text border border-border px-20 py-8 rounded-md font-heading font-extrabold uppercase text-[12px] tracking-[0.2em] hover:bg-surface transition-all">
                  Contact Support
                </button>
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] -z-10">
              <ShieldCheck className="w-[800px] h-[800px] text-primary" strokeWidth={0.5} />
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default NeedOfWooffer;
