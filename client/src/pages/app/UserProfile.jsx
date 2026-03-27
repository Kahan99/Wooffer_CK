import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  User, 
  Mail, 
  LogOut, 
  Settings, 
  AlertTriangle, 
  Camera, 
  ShieldCheck, 
  X,
  Building2,
  Phone,
  Lock,
  ChevronRight,
  Shield,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../lib/utils";

const TABS = [
  { id: "personal", label: "Registry Info", icon: User },
  { id: "preferences", label: "Node Controls", icon: Settings },
  {
    id: "delete",
    label: "Purge Credentials",
    icon: AlertTriangle,
    danger: true,
  },
];

const UserProfile = () => {
  const { user, profilePic, profileExtras, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    company: profileExtras?.company || "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      company: profileExtras?.company || "",
    });
  }, [user?.name, profileExtras?.company]);

  const prefKey = `sentinel_prefs_${user?._id || "guest"}`;
  const [prefs, setPrefs] = useState(() =>
    JSON.parse(
      localStorage.getItem(prefKey) ||
        '{"pushNotifications":true,"emailReports":true,"highContrast":false}',
    ),
  );

  const savePref = (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(prefKey, JSON.stringify(next));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await updateProfile({ avatar: ev.target.result });
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: formData.name, company: formData.company });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex-1 bg-base min-h-screen relative overflow-hidden selection:bg-primary/20">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] -z-10 pointer-events-none">
        <Fingerprint className="w-[800px] h-[800px]" strokeWidth={0.5} />
      </div>

      <input
        type="file"
        className="hidden"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      <div className="flex flex-col lg:flex-row gap-16 px-8 lg:px-20 py-12 lg:py-24 max-w-[1400px] mx-auto items-start">
        {/* Editorial Profile Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-12 sticky top-24">
          <div className="space-y-4">
             <nav className="flex items-center gap-4 text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-[0.4em]">
                <span>Wooffer</span>
                <ChevronRight className="w-3 h-3 text-primary" />
                <span className="text-text">Profile</span>
             </nav>
             <h1 className="text-4xl font-heading font-extrabold text-text uppercase tracking-tight">Identity<br/><span className="text-primary italic">Security.</span></h1>
          </div>

          <div className="stitch-glass bg-elevated/20 p-8 rounded-[2.5rem] border border-border space-y-8 shadow-3xl">
            <div 
              className="relative group cursor-pointer mx-auto w-32 h-32"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden bg-surface border-4 border-border transition-all group-hover:border-primary group-hover:rotate-3 shadow-2xl">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                <Camera className="text-white w-6 h-6" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-heading font-extrabold text-text uppercase tracking-tight truncate px-4">
                {user?.name || "Developer"}
              </h3>
              <p className="technical-data text-[10px] text-text-muted/60 uppercase tracking-widest truncate">
                {user?.email}
              </p>
            </div>

            <div className="space-y-2">
              {TABS.map(({ id, label, icon: Icon, danger }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-xl text-[10px] font-heading font-extrabold uppercase tracking-widest transition-all border",
                    activeTab === id
                      ? danger
                        ? "bg-red-500 text-white border-red-500 shadow-xl shadow-red-500/20"
                        : "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                      : "bg-transparent text-text-muted border-transparent hover:border-border hover:bg-surface/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  {activeTab === id && <ChevronRight className="w-3 h-3 opacity-50" />}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-border/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-heading font-extrabold uppercase tracking-widest text-text-muted/60 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Deregister Node
              </button>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Protocol */}
        <main className="flex-1 w-full pt-16 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              <div className="space-y-6">
                <Badge variant="outline" className="text-[10px] font-heading font-extrabold border-primary/20 text-primary uppercase tracking-[0.2em] px-4 py-1.5 rounded-md">
                   {TABS.find(t => t.id === activeTab)?.label}
                </Badge>
                <h2 className="text-6xl font-heading font-extrabold text-text uppercase tracking-tight leading-none">
                  {activeTab === "personal" && <>Maintain<br/><span className="text-secondary italic">Credentials.</span></>}
                  {activeTab === "preferences" && <>Protocol<br/><span className="text-secondary italic">Settings.</span></>}
                  {activeTab === "delete" && <>Security<br/><span className="text-red-500 italic">Redline.</span></>}
                </h2>
              </div>

              {/* Personal Info Protocol */}
              {activeTab === "personal" && (
                <form onSubmit={handleSave} className="space-y-12 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="group space-y-4">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Registry Name</label>
                      <Input
                        type="text"
                        className="w-full bg-elevated/20 p-6 rounded-md"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="group space-y-4">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Corporate Node</label>
                      <Input
                        type="text"
                        className="w-full bg-elevated/20 p-6 rounded-md"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Organization Alpha"
                      />
                    </div>
                  </div>

                  <div className="group space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1 group-focus-within:text-primary transition-colors">Verified Identifier</label>
                    <div className="relative">
                      <Input
                        type="email"
                        className="w-full bg-surface/30 p-6 rounded-md border-dashed opacity-50 cursor-not-allowed"
                        value={user?.email || ""}
                        readOnly
                      />
                      <Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-30" />
                    </div>
                    <p className="technical-data text-[9px] text-text-muted/40 uppercase tracking-[0.2em] italic">Encryption identifier is immutable. Contact security for re-indexing.</p>
                  </div>

                  <div className="pt-8 flex justify-end items-center gap-8">
                    <div className="flex items-center gap-3 animate-pulse">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                       <span className="technical-data text-[9px] text-text-muted/40 uppercase tracking-widest">Awaiting Commit</span>
                    </div>
                    <Button
                      type="submit"
                      loading={saving}
                      className="bg-brand-gradient text-white px-12 py-8 rounded-md"
                    >
                      Commit Changes
                    </Button>
                  </div>
                </form>
              )}

              {/* Preferences Protocol */}
              {activeTab === "preferences" && (
                <div className="space-y-10 max-w-2xl">
                  {[
                    {
                      key: "pushNotifications",
                      label: "Pulse Alerts",
                      desc: "Broadcast browser notifications upon threshold violations.",
                      icon: Activity
                    },
                    {
                      key: "emailReports",
                      label: "Telemetry Digest",
                      desc: "Weekly analytical dispatch delivered to your primary node.",
                      icon: Mail
                    },
                    {
                      key: "highContrast",
                      label: "Visual Baseline",
                      desc: "Enhance analytical clarity by minimizing glassmorphic effects.",
                      icon: ShieldCheck
                    },
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <div
                      key={key}
                      onClick={() => savePref(key, !prefs[key])}
                      className={cn(
                        "group flex items-center justify-between p-8 rounded-[2rem] border transition-all cursor-pointer shadow-2xl",
                        prefs[key] ? "bg-primary/5 border-primary/20" : "bg-elevated/20 border-border hover:border-text-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-8">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                          prefs[key] ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-surface text-text-muted border-border"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-heading font-extrabold text-text uppercase tracking-widest text-[12px]">{label}</p>
                          <p className="text-[11px] text-text-muted italic opacity-60 max-w-xs">{desc}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-12 h-6 rounded-full relative transition-all border p-1",
                        prefs[key] ? "bg-primary border-primary" : "bg-surface border-border"
                      )}>
                        <motion.div
                          animate={{ x: prefs[key] ? 24 : 0 }}
                          className="w-4 h-4 rounded-full bg-white shadow-md"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Purge Protocol */}
              {activeTab === "delete" && (
                <div className="max-w-2xl space-y-12">
                   <div className="p-12 border border-red-500/30 bg-red-500/5 rounded-[3rem] space-y-10 shadow-3xl">
                      <div className="flex items-start gap-8">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shrink-0">
                          <AlertTriangle className="text-red-500 w-8 h-8" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-heading font-extrabold text-red-500 uppercase tracking-tight">Terminal Deletion.</h3>
                          <p className="text-[12px] text-text-muted font-body leading-relaxed italic">
                            Initializing deregistration will permanently erase your encryption keys, registry nodes, and historical telemetry data. <span className="text-red-500 font-bold uppercase tracking-widest not-italic">This protocol is irreversible.</span>
                          </p>
                        </div>
                      </div>

                      <div className="group space-y-4 pt-4">
                        <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] pl-1">Confirm Identity Protocol</label>
                        <Input
                          type="text"
                          className="w-full bg-base/50 p-6 rounded-md border-red-500/20 focus:border-red-500"
                          placeholder={user?.email}
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                        <p className="technical-data text-[9px] text-red-500/40 uppercase tracking-[0.2em] italic">Type your verified node ID above to authorize purge.</p>
                      </div>

                      <Button
                        disabled={deleteConfirm !== user?.email}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-10 rounded-md shadow-2xl shadow-red-500/30 disabled:opacity-20"
                      >
                         Execute Purge Protocol
                      </Button>
                   </div>

                   <div className="flex items-center gap-6 opacity-20 hover:opacity-100 transition-opacity">
                      <Shield className="w-5 h-5 text-text-muted" />
                      <p className="technical-data text-[9px] text-text-muted uppercase tracking-[0.3em] font-bold">Wooffer Security Guard • Redline Mode Active</p>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
