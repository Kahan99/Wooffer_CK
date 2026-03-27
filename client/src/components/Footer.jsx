import React from "react";
import { Twitter, Github, Linkedin, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="relative bg-surface/40 text-text pt-32 pb-16 overflow-hidden">
      {/* Tonal Separation - No explicit top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-5 space-y-12">
            <div className="flex items-center gap-4 group w-fit">
              <div className="p-3 bg-elevated border border-border rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <ShieldCheck className="text-primary group-hover:text-white w-6 h-6" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-black tracking-tighter text-3xl text-text uppercase italic">WOOFFER</span>
            </div>
            <p className="text-text-muted font-body max-w-sm leading-relaxed text-sm">
              The precision platform for architectural telemetry. Monitoring your nodes with absolute loyalty and editorial clarity. Always observing, always protecting.
            </p>
            <div className="flex gap-6 pt-4">
              <SocialLink href="#" icon={<Github className="w-4 h-4" />} />
              <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} />
              <SocialLink href="#" icon={<Linkedin className="w-4 h-4" />} />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h3 className="uppercase font-heading font-extrabold tracking-[0.2em] text-text-muted text-[10px]">
                Ecosystem
              </h3>
              <ul className="space-y-5">
                <li><FooterLink href="/features">Features</FooterLink></li>
                <li><FooterLink href="/why-wooffer">Philosophy</FooterLink></li>
                <li><FooterLink href="/docs">Docs</FooterLink></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h3 className="uppercase font-heading font-extrabold tracking-[0.2em] text-text-muted text-[10px]">
                Registry
              </h3>
              <ul className="space-y-5">
                <li><FooterLink href="/projects">Registries</FooterLink></li>
                <li><FooterLink href="/contact">Support</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8 md:hidden" />
          <div className="flex items-center gap-6">
            <p className="technical-data text-[10px] text-text-muted uppercase font-bold tracking-widest">
              © {new Date().getFullYear()} WOOFFER — High-Fidelity Observability Platform
            </p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="technical-data text-[9px] text-text-muted hover:text-primary transition-all uppercase font-bold tracking-widest">Privacy Policy</a>
            <a href="#" className="technical-data text-[9px] text-text-muted hover:text-primary transition-all uppercase font-bold tracking-widest">Terms of Registry</a>
          </div>
        </div>
      </div>
      
      {/* Decorative Gradient Sentinel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
    </footer>
  );
};

const SocialLink = ({ href, icon }) => (
  <motion.a
    href={href}
    whileHover={{ y: -3 }}
    className="w-10 h-10 rounded-full bg-surface-container text-text-muted flex items-center justify-center hover:bg-primary border border-outline-variant/10 hover:border-transparent hover:text-background transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)]"
  >
    {icon}
  </motion.a>
);

const FooterLink = ({ href, children }) => (
  <a
    href={href}
    className="text-sm font-medium font-body text-text-muted hover:text-primary transition-colors flex items-center gap-2 group"
  >
    {children}
    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
      →
    </span>
  </a>
);

export default Footer;
