import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Search,
  ChevronRight,
  Copy,
  Info,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Terminal,
  Library,
  Code,
  Check
} from "lucide-react"; // Using corrected Lucide names
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const CustomCodeBlock = ({ filename, code, language = "python" }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden bg-elevated border border-border my-12 group shadow-2xl">
      <div className="flex items-center justify-between px-6 py-3 bg-base/50 border-b border-border">
        <span className="technical-data text-[10px] text-text-muted uppercase font-bold tracking-widest">{filename}</span>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-2 text-[10px] font-heading font-extrabold uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-8 bg-elevated/40">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: 0,
            fontSize: "13px",
            backgroundColor: "transparent",
            fontFamily: "'Fira Code', monospace",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    {
      title: "Getting Started",
      items: [
        { id: "introduction", label: "Introduction" },
      ]
    }
  ];

  const tocItems = [
    { id: "intro", label: "Introduction" },
    { id: "connecting", label: "Connecting to the API" },
    { id: "endpoints-ref", label: "Endpoint Reference" },
  ];

  return (
    <div className="min-h-screen bg-base flex flex-col md:flex-row max-w-[1600px] mx-auto selection:bg-primary/20 pt-24">
      {/* Left Sidebar - Navigation Protocol */}
      <aside className="w-full md:w-64 lg:w-80 md:sticky md:top-24 h-[calc(100vh-6rem)] overflow-y-auto border-r border-border bg-base/80 backdrop-blur-xl px-8 py-12 custom-scrollbar">
        <div className="mb-12">
          <div className="relative flex items-center bg-elevated border border-border rounded-md px-4 py-3 transition-all focus-within:border-primary/50">
            <Search className="text-text-muted w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="SEARCH PROTOCOL..." 
              className="bg-transparent border-none text-[10px] font-heading font-extrabold uppercase tracking-widest w-full focus:ring-0 text-text placeholder:text-text-muted/40 ml-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="technical-data text-[9px] text-text-muted/40 border border-border px-1.5 py-0.5 rounded ml-2">⌘K</span>
          </div>
        </div>

        <nav className="space-y-10">
          {navigation.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em] mb-6 px-2">{group.title}</h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[11px] font-heading font-extrabold uppercase tracking-widest transition-all duration-300",
                        activeSection === item.id 
                          ? "text-primary bg-primary/5 border-l-2 border-primary" 
                          : "text-text-muted hover:text-text hover:bg-surface"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content - Technical Whitepaper */}
      <main className="flex-1 px-8 lg:px-24 py-16 overflow-hidden relative min-h-screen border-r border-border/30">
        <div className="max-w-4xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-4 text-[10px] font-heading font-extrabold uppercase tracking-[0.3em] text-text-muted mb-16 border-b border-border pb-8">
            <span className="hover:text-primary cursor-pointer transition-colors">ARCHIVE</span>
            <ChevronRight className="w-3 h-3 text-primary/40" />
            <span className="hover:text-primary cursor-pointer transition-colors">GETTING STARTED</span>
            <ChevronRight className="w-3 h-3 text-primary/40" />
            <span className="text-text">INTRODUCTION</span>
          </nav>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            <div id="intro" className="space-y-4 mb-16 scroll-mt-32">
              <span className="text-primary technical-data text-[10px] font-bold tracking-[0.4em] uppercase">Status: Production Ready</span>
              <h1 className="text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-text uppercase leading-[0.9] mb-0">
                Introduction to<br/><span className="text-primary italic">Wooffer.</span>
              </h1>
            </div>
            
            <p className="text-xl text-text-muted leading-relaxed mb-20 font-body max-w-2xl italic border-l-2 border-primary/20 pl-8">
              Wooffer is a high-performance observability platform built for high-precision engineering. Monitor stack traces, manage architectural telemetry, and optimize node performance with real-time diagnostic depth.
            </p>

            <section className="space-y-32">
              <div id="connecting" className="group scroll-mt-32">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-12 h-[1px] bg-border" />
                  <h2 className="text-3xl font-heading font-extrabold text-text uppercase tracking-tight flex items-center gap-4">
                    Connecting Protocol
                    <a href="#connecting" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-light text-xl">#</a>
                  </h2>
                </div>
                <p className="text-text-muted mb-10 leading-relaxed font-body">
                  To begin streaming telemetry to Wooffer, initialize the Wooffer SDK using your node's unique <code className="technical-data text-primary bg-primary/5 px-2 py-1 rounded text-xs border border-primary/10 font-bold uppercase">DSN_PROTOCOL_TOKEN</code>.
                </p>

                <CustomCodeBlock 
                  filename="main.py"
                  language="python"
                  code={`import wooffer

# Initialize the Wooffer Client
wooffer.init(
    dsn="https://arch_token@wooffer.io/123456",
    environment="production",
    traces_sample_rate=1.0
)

try:
    execute_architectural_loop()
except Exception as e:
    # Capture telemetry exception
    wooffer.capture_exception(e)`}
                />
              </div>

              <div id="endpoints-ref" className="group scroll-mt-32">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-12 h-[1px] bg-border" />
                  <h2 className="text-3xl font-heading font-extrabold text-text uppercase tracking-tight flex items-center gap-4">
                    Endpoint Reference
                    <a href="#endpoints-ref" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-light text-xl">#</a>
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { method: "GET", path: "/api/v1/projects", desc: "List all active architectural projects", color: "text-primary bg-primary/5 border-primary/20" },
                    { method: "POST", path: "/api/v1/events", desc: "Capture a new diagnostic event", color: "text-secondary bg-secondary/5 border-secondary/20" },
                    { method: "DELETE", path: "/api/v1/issues/{id}", desc: "Permanently delete an issue trace", color: "text-text-muted bg-surface border-border" }
                  ].map((endpoint, i) => (
                    <div key={i} className="p-6 bg-surface border border-border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 group/item hover:bg-elevated transition-all duration-300">
                      <div className="flex items-center gap-6">
                        <span className={cn("px-3 py-1 rounded text-[9px] font-heading font-extrabold tracking-widest uppercase border", endpoint.color)}>
                          {endpoint.method}
                        </span>
                        <code className="technical-data text-sm text-text-muted group-hover/item:text-text transition-colors">{endpoint.path}</code>
                      </div>
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-text-muted/60">{endpoint.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editorial Callout */}
              <div className="p-10 bg-surface border border-border rounded-3xl relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                  <Info className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-[0.3em] text-primary">Protocol Insight</span>
                </div>
                <p className="text-lg text-text leading-relaxed relative z-10 font-body italic">
                  Utilize the <code className="technical-data text-primary font-black">wooffer-cli</code> tool to validate node configuration locally before deploying to production environments.
                </p>
              </div>
            </section>

            {/* Pagination Protocol */}
            <div className="mt-40 pt-16 border-t border-border flex items-center justify-between mb-32">
              <button className="group text-left space-y-4">
                <span className="block text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em]">Previous Registry</span>
                <span className="flex items-center gap-4 text-text font-heading font-extrabold text-xl uppercase tracking-tight group-hover:text-primary transition-colors">
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                  Philosophy
                </span>
              </button>
              <button className="group text-right space-y-4">
                <span className="block text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.3em]">Next Registry</span>
                <span className="flex items-center gap-4 text-text font-heading font-extrabold text-xl uppercase tracking-tight group-hover:text-primary transition-colors">
                  Quickstart
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Right Sidebar - TOC Protocol */}
      <aside className="hidden xl:block w-80 sticky top-24 h-[calc(100vh-6rem)] px-10 py-16 overflow-y-auto custom-scrollbar">
        <h4 className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.4em] mb-12">On This Page</h4>
        <nav className="space-y-6">
          {tocItems.map((item) => (
            <a 
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block text-[11px] font-heading font-extrabold uppercase tracking-widest transition-all duration-300 border-l-2 pl-6",
                activeSection === item.id 
                  ? "text-primary border-primary" 
                  : "text-text-muted/40 hover:text-text border-transparent"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
        
        <div className="mt-32 p-10 bg-surface border border-border rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.2em] mb-8 relative z-10 leading-relaxed">
            Need Expert<br/>Consultation?
          </p>
          <button className="w-full bg-elevated text-[10px] font-heading font-extrabold uppercase tracking-widest py-4 rounded-md hover:bg-surface transition-all border border-border relative z-10 active:scale-95 shadow-xl">
            Contact Support
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Documentation;
