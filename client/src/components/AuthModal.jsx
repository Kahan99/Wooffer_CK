import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  KeyRound,
  X,
  Fingerprint
} from "lucide-react";
import OTPInput from "./OTPInput";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Checkbox } from "@chakra-ui/react"; // Pure UI logic preserved where needed, but styled via CSS
import { cn } from "../lib/utils";

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, forgotPassword, verifyOTP, isLoading } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [isOtpView, setIsOtpView] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(loginEmail, loginPassword, rememberMe);
    if (success) {
      if (location.pathname === "/" || location.pathname === "/login") {
        navigate("/dashboard");
      }
      onClose();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const success = await register(regName, regEmail, regPassword);
    if (success) setIsOtpView(true);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const success = await verifyOTP(regEmail, otpValue);
    if (success) {
      setIsOtpView(false);
      setTabIndex(0);
      setLoginEmail(regEmail);
      onClose();
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    await forgotPassword(forgotEmail);
  };

  const toggleForgotView = () => {
    setIsForgotView(!isForgotView);
    setForgotEmail(loginEmail);
  };

  const getTitle = () => {
    if (isOtpView) return "Verification Required";
    if (isForgotView) return "Recovery Protocol";
    return tabIndex === 0 ? "Authorized Entry" : "New Node Registry";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-base/80 backdrop-blur-2xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl bg-elevated/40 border border-border shadow-2xl rounded-[3rem] overflow-hidden stitch-glass"
        >
          {/* Brand Wooffer Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-brand-gradient" />
          
          <button 
            onClick={onClose}
            className="absolute top-10 right-10 p-3 rounded-md text-text-muted hover:text-text hover:bg-elevated/50 transition-all z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-10 sm:p-20">
            <div className="space-y-16">
              {/* Registry Header */}
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center p-5 shadow-lg relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/40 transition-all" />
                  <Fingerprint className="text-primary w-full h-full relative z-10" strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-5xl font-heading font-extrabold uppercase tracking-tight text-text italic">
                    {getTitle()}
                  </h2>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] leading-none">
                    Wooffer Protocol Gateway
                  </p>
                </div>
              </div>

              {/* Protocol Switcher */}
              {!isOtpView && !isForgotView && (
                <div className="flex p-2 bg-base/50 rounded-lg space-x-2 border border-border/50 shadow-inner">
                  {["Secure Login", "Registry"].map((label, idx) => (
                    <button
                      key={label}
                      onClick={() => setTabIndex(idx)}
                      className={cn(
                        "flex-1 py-4 text-[11px] font-heading font-black uppercase tracking-widest rounded-md transition-all duration-500",
                        tabIndex === idx 
                          ? "bg-elevated text-primary shadow-lg border border-primary/20" 
                          : "text-text-muted hover:text-text"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Dynamic Viewport */}
              <AnimatePresence mode="wait">
                {isOtpView ? (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12 text-center"
                  >
                    <div className="space-y-2">
                      <p className="text-xl italic text-text-muted leading-relaxed">Identity confirmation requested.</p>
                      <p className="font-heading font-black text-primary text-[11px] uppercase tracking-widest">Target: {regEmail}</p>
                    </div>
                    <OTPInput length={6} onChange={setOtpValue} isLoading={isLoading} />
                    <div className="flex flex-col gap-6">
                      <Button onClick={handleVerifyOTP} isLoading={isLoading} size="lg" className="w-full">
                        Authorize Identity
                      </Button>
                      <button onClick={() => setIsOtpView(false)} className="text-[11px] font-heading font-black text-text-muted uppercase tracking-widest hover:text-text transition-colors italic">
                        Abort Verification
                      </button>
                    </div>
                  </motion.div>
                ) : isForgotView ? (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-12"
                  >
                    <p className="text-center text-xl italic text-text-muted leading-relaxed">
                      Enter registered identifier to initiate restoration sequence.
                    </p>
                    <form onSubmit={handleForgot} className="space-y-10">
                      <Input 
                        icon={Mail} 
                        value={forgotEmail} 
                        onChange={(e) => setForgotEmail(e.target.value)} 
                        placeholder="Registry Email Address" 
                      />
                      <div className="flex flex-col gap-6">
                        <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
                          Initiate Recovery
                        </Button>
                        <button onClick={toggleForgotView} className="text-[11px] font-heading font-black text-text-muted uppercase tracking-widest hover:text-text transition-colors italic">
                          Return to Gateway
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key={tabIndex === 0 ? "login" : "register"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    {tabIndex === 0 ? (
                      <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-6">
                          <Input 
                            icon={Mail} 
                            value={loginEmail} 
                            onChange={(e) => setLoginEmail(e.target.value)} 
                            placeholder="Email Identifier" 
                          />
                          <div className="space-y-4">
                            <Input 
                              type={showLoginPassword ? "text" : "password"}
                              icon={Lock} 
                              value={loginPassword} 
                              onChange={(e) => setLoginPassword(e.target.value)} 
                              placeholder="Access Key" 
                            />
                            <div className="flex justify-between items-center px-4">
                               <label className="flex items-center gap-3 cursor-pointer group">
                                 <div className="relative w-5 h-5 bg-elevated border border-border rounded flex items-center justify-center transition-all group-hover:border-primary/50">
                                   <input 
                                     type="checkbox" 
                                     className="sr-only" 
                                     checked={rememberMe} 
                                     onChange={(e) => setRememberMe(e.target.checked)} 
                                   />
                                   {rememberMe && <div className="w-2.5 h-2.5 bg-primary rounded-sm shadow-[0_0_8px_rgba(255,100,0,0.5)]" />}
                                 </div>
                                 <span className="text-[10px] font-heading font-black text-text-muted uppercase tracking-widest leading-none">Persistent</span>
                               </label>
                               <button 
                                 type="button" 
                                 onClick={toggleForgotView} 
                                 className="text-[10px] font-heading font-black text-primary uppercase tracking-widest hover:italic transition-all"
                               >
                                 Lost Access?
                               </button>
                            </div>
                          </div>
                        </div>
                        <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
                          Establish Authoritative Session
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleRegister} className="space-y-8">
                        <div className="space-y-6">
                          <Input 
                            icon={User} 
                            value={regName} 
                            onChange={(e) => setRegName(e.target.value)} 
                            placeholder="Authorized Name" 
                          />
                          <Input 
                            icon={Mail} 
                            value={regEmail} 
                            onChange={(e) => setRegEmail(e.target.value)} 
                            placeholder="Registry Email" 
                          />
                          <Input 
                            type={showRegPassword ? "text" : "password"}
                            icon={KeyRound} 
                            value={regPassword} 
                            onChange={(e) => setRegPassword(e.target.value)} 
                            placeholder="Define Access Key" 
                          />
                        </div>
                        <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
                          Initialize New Registry Node
                        </Button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Registry Footer Decorations */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-border/20 pointer-events-none" />
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-primary/5 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/5 blur-[100px] pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
