import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Key, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isSuccess = await resetPassword(token, password, confirmPassword);
    if (isSuccess) {
      setSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-16 rounded-[3rem] bg-elevated/20 border border-success/30 backdrop-blur-3xl shadow-4xl"
        >
          <div className="w-20 h-20 bg-success/10 rounded-2xl flex items-center justify-center mx-auto border border-success/20">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-heading font-extrabold text-text uppercase tracking-tight">Access Restored.</h2>
            <p className="text-text-muted font-body leading-relaxed">Your security credentials have been successfully updated. Redirecting to the command center...</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] font-heading font-extrabold text-success uppercase tracking-[0.4em]">
            <div className="w-2 h-2 rounded-full bg-success animate-ping" />
            Registry Updated
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base pt-32 pb-20 relative overflow-hidden flex items-center justify-center selection:bg-primary/20">
      {/* Background Sentinel Element */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] -z-10">
        <Shield className="w-[600px] h-[600px]" strokeWidth={0.5} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl px-8"
      >
        <div className="stitch-glass bg-elevated/20 p-12 lg:p-20 rounded-[4rem] border border-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Lock className="w-24 h-24 text-text" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center gap-4 text-primary text-[10px] font-heading font-extrabold uppercase tracking-[0.4em]">
                <div className="w-8 h-[1px] bg-primary" />
                Security Protocol
              </div>
              <h1 className="text-5xl font-heading font-extrabold tracking-tight text-text uppercase leading-none">
                Reset<br/><span className="text-primary italic">Password.</span>
              </h1>
              <p className="text-[12px] text-text-muted font-heading font-extrabold uppercase tracking-widest italic tracking-[0.2em]">
                Initialize new access credentials
              </p>
            </div>

            <div className="space-y-8">
              <div className="group space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">New Credential</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new credential"
                    className="w-full bg-base/50 p-6 rounded-md border border-border focus:border-primary transition-all font-heading font-extrabold uppercase text-[12px] tracking-[0.2em] text-text outline-none shadow-inner"
                    required
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-20">
                    <Key className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="group space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Confirm Credential</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new credential"
                    className="w-full bg-base/50 p-6 rounded-md border border-border focus:border-primary transition-all font-heading font-extrabold uppercase text-[12px] tracking-[0.2em] text-text outline-none shadow-inner"
                    required
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-20">
                    <Key className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <Button
                type="submit"
                loading={isLoading}
                className="w-full bg-brand-gradient text-white py-10 rounded-md font-heading font-extrabold uppercase text-[12px] tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 shadow-2xl"
              >
                {!isLoading && <Key className="w-5 h-5" />}
                Update Protocol
              </Button>

              <button 
                type="button"
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center gap-4 text-[9px] text-text-muted font-black uppercase tracking-[0.4em] hover:text-text transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Return to Entry Node
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
