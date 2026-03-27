import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LineChart, User, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const AppTopNavbar = () => {
  const { user, profilePic, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border/10 shadow-2xl shadow-primary/5">
      <div className="flex justify-between items-center px-6 py-3 w-full">
        <div className="flex-1">
          <Link to="/app" className="flex items-center gap-3 w-fit group">
            <div className="text-primary group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-heading font-black tracking-tighter text-text uppercase italic">
              WOOFFER<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        <div className="flex-none flex items-center gap-4">
          <Link
            to="/app/usage"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all font-display ${
              location.pathname === "/app/usage"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-transparent text-text-muted hover:bg-surface-container-high hover:text-text border border-transparent"
            }`}
          >
            <LineChart className="w-4 h-4" />
            Usage
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none"
            >
              {profilePic ? (
                <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-56 bg-surface-container-highest border border-outline-variant/20 rounded-2xl shadow-[0_24px_64px_rgba(6,14,32,0.4)] overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-outline-variant/10 bg-surface-container-low/50">
                    <span className="font-bold text-text block truncate font-display">
                      {user?.name || "Developer"}
                    </span>
                    <span className="text-xs text-text-muted font-body truncate block mt-0.5">
                      {user?.email}
                    </span>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <Link
                      to="/app/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface-container-high rounded-xl transition-colors font-body"
                    >
                      <User className="w-4 h-4 opacity-70" />
                      Profile details
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 hover:text-error rounded-xl transition-colors font-body w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppTopNavbar;
