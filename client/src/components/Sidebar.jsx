import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Layers, 
  LogOut, 
  Box, 
  Activity,
  Shield,
  Settings
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { name: "Projects", path: "/projects", icon: Layers },
    { name: "Services", path: "/services", icon: Activity },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="drawer-side z-40">
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      <div className="w-72 h-full bg-base border-r border-border flex flex-col p-10 space-y-12">
        {/* Registry Logo Area */}
        <Link
          to="/dashboard"
          className="flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-md bg-brand-gradient flex items-center justify-center p-2.5 shadow-lg group-hover:scale-110 transition-transform">
            <Shield className="text-white w-full h-full" />
          </div>
          <span className="text-2xl font-heading font-extrabold text-text tracking-tighter uppercase leading-none">
            WOOFFER<span className="text-primary italic">.</span>
          </span>
        </Link>

        {/* Navigation Protocol */}
        <div className="flex-grow space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] pl-4">Registry Layers</span>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-5 px-6 py-5 rounded-md text-[11px] font-heading font-extrabold uppercase tracking-widest transition-all duration-300 group relative overflow-hidden",
                    isActive(item.path) 
                      ? "bg-elevated text-primary border border-primary/20 shadow-lg" 
                      : "text-text-muted hover:text-text hover:bg-elevated/50"
                  )}
                >
                  {isActive(item.path) && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-full" 
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive(item.path) ? "text-primary" : "text-text-muted/50"
                  )} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] pl-4">System Utilities</span>
            <nav className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center gap-5 px-6 py-5 rounded-md text-[11px] font-heading font-extrabold uppercase tracking-widest text-text-muted hover:text-text hover:bg-elevated/50 transition-all group"
              >
                <Settings className="w-5 h-5 text-text-muted/50 group-hover:scale-110 transition-transform" />
                Security Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* User Protocol / Termination */}
        <div className="pt-8 border-t border-border mt-auto">
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-between px-6 py-5 rounded-md bg-elevated/20 border border-border/50 text-error hover:bg-error/5 hover:border-error/20 transition-all group"
          >
            <div className="flex items-center gap-5 text-[11px] font-heading font-extrabold uppercase tracking-widest">
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Terminate Session
            </div>
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
