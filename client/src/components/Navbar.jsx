import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Rocket, LogOut, Menu, X, Sun, Moon, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useColorMode } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { openAuthModal, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Retain chakra-ui compatibility while adding custom token sync
    document.documentElement.setAttribute("data-theme", colorMode);
    if (colorMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [colorMode]);

  const navClass = `fixed top-0 w-full z-50 transition-all duration-500 ${
    scrolled 
      ? "bg-base/80 backdrop-blur-[24px] border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-3" 
      : "bg-transparent py-5"
  }`;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Need of Wooffer", path: "/why-wooffer" },
    { name: "Docs", path: "/docs" },
    { name: "Contact", path: "/contact" },
  ];

  if (location.pathname === "/dashboard") return null;

  return (
    <>
      <header className={navClass}>
        <div className="flex justify-between items-center px-8 py-1 w-full max-w-7xl mx-auto">
          {/* Leading Group */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-primary group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-heading font-black tracking-tighter text-text uppercase italic">
              WOOFFER<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-body font-medium text-[13px] tracking-wide uppercase transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-primary border-b-2 border-primary pb-0.5"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions Group */}
          <div className="flex items-center gap-5">
            {/* Theme Toggle */}
            <button
              onClick={toggleColorMode}
              className="text-text-muted hover:text-primary transition-all duration-300 active:scale-90 transform p-2.5 rounded-full hover:bg-elevated/50"
            >
              {colorMode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Desktop CTA */}
            <div className="hidden sm:block">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-elevated text-text border border-border px-6 py-2.5 rounded-md font-heading font-bold tracking-tight hover:bg-surface transition-all active:scale-95 flex items-center gap-2 text-xs uppercase"
                >
                  Logout <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="bg-brand-gradient text-white px-7 py-3 rounded-md font-heading font-extrabold tracking-tight hover:shadow-[0_0_32px_rgba(249,115,22,0.3)] transition-all active:scale-[0.98] flex items-center gap-2 text-xs uppercase"
                >
                  Start Now <Rocket className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Navigation Trigger (Hamburger) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-text-muted hover:text-text transition-colors p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-base/80 backdrop-blur-md z-[55] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed inset-y-0 left-0 z-[60] w-80 flex flex-col p-8 stitch-glass h-full border-r border-border shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-2xl font-heading font-black text-text uppercase tracking-tighter italic">WOOFFER<span className="text-primary">.</span></span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-text-muted hover:text-text p-1.5 rounded-full hover:bg-elevated/50 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-xl px-5 py-4 flex items-center gap-4 font-heading font-bold text-xs uppercase tracking-wider transition-all ${
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-text-muted hover:bg-elevated hover:text-text"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-8 border-t border-border">
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full bg-elevated text-text border border-border px-6 py-4 rounded-md font-heading font-extrabold flex items-center justify-center gap-3 uppercase text-xs"
                  >
                    Logout <LogOut className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                    className="w-full bg-brand-gradient text-white px-6 py-4 rounded-md font-heading font-extrabold flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(249,115,22,0.2)] uppercase text-xs"
                  >
                    Start Now <Rocket className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
