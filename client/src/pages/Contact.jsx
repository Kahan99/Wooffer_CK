import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Github,
  MessageSquare,
  Globe
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const ContactCard = ({ city, address, phone, email, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-12 rounded-[2.5rem] bg-surface/20 border border-border relative overflow-hidden group hover:border-primary/30 transition-all duration-700 shadow-xl"
  >
    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative z-10 space-y-8">
      <div className="w-16 h-16 rounded-md bg-elevated border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-700 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h4 className="text-2xl font-heading font-extrabold text-text tracking-tight uppercase leading-none mb-6">{city}</h4>
        <div className="space-y-4 text-[12px] font-heading font-extrabold uppercase tracking-widest text-text-muted leading-relaxed">
          <p className="flex items-center gap-4 transition-colors hover:text-text"><MapPin className="w-4 h-4 text-primary" /> {address}</p>
          <p className="flex items-center gap-4 transition-colors hover:text-text"><Phone className="w-4 h-4 text-primary" /> {phone}</p>
          <p className="flex items-center gap-4 transition-colors hover:text-text"><Mail className="w-4 h-4 text-primary" /> {email}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  const offices = [
    {
      city: "Hyderabad",
      address: "Plot No. 12, Hitech City, Phase 2, Hyderabad, Telangana 500081",
      phone: "+91 40 6789 0123",
      email: "hyd@wooffer.io",
      icon: Globe
    },
    {
      city: "Surat",
      address: "Office No. 403, PRAGATI IT Park, Mota Varachha, Surat, Gujarat 395006",
      phone: "+91 261 412 3456",
      email: "support@wooffer.io",
      icon: MapPin
    }
  ];

  return (
    <div className="min-h-screen bg-base selection:bg-primary/20 pt-32 pb-20 overflow-x-hidden">
      <main className="max-w-[1400px] mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-24 items-start py-20">
          {/* Content & Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-16"
          >
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-primary text-[10px] font-heading font-extrabold uppercase tracking-[0.4em]">
                <div className="w-12 h-[1px] bg-primary" />
                Communication Protocol
              </div>
              <h1 className="text-7xl lg:text-8xl font-heading font-extrabold tracking-[-0.05em] text-text uppercase leading-[0.9]">
                Connect with our<br /><span className="text-primary italic">Engineers.</span>
              </h1>
              <p className="text-xl text-text-muted leading-relaxed max-w-xl font-body italic border-l-2 border-primary/20 pl-8">
                Stop fighting alerts alone. Our core engineering team is ready to help you optimize your tracking, debug your traces, or just chat about system architecture.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {offices.map((office, idx) => (
                <ContactCard key={idx} {...office} />
              ))}
            </div>

            <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-10">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=eng${i}`}
                    alt="Engineer"
                    className="w-14 h-14 rounded-md border-2 border-base bg-elevated shadow-xl ring-1 ring-border"
                  />
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Wooffer Response Team</p>
                <div className="flex items-center gap-4 text-[12px] font-heading font-extrabold uppercase text-text-muted italic">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                  Active Registry Status: Online
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-primary/5 blur-[120px] rounded-full opacity-50"></div>
            <div className="stitch-glass bg-elevated/20 p-12 lg:p-20 rounded-[4rem] border border-border shadow-2xl relative">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Protocol: Name</label>
                    <input
                      placeholder="Input data..."
                      className="w-full bg-base/50 p-6 rounded-md border border-border focus:border-primary transition-all font-heading font-extrabold uppercase text-[12px] tracking-widest text-text outline-none shadow-inner"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Protocol: Email</label>
                    <input
                      type="email"
                      placeholder="Secure address..."
                      className="w-full bg-base/50 p-6 rounded-md border border-border focus:border-primary transition-all font-heading font-extrabold uppercase text-[12px] tracking-widest text-text outline-none shadow-inner"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Protocol: Subject</label>
                  <input
                    placeholder="Implementation support..."
                    className="w-full bg-base/50 p-6 rounded-md border border-border focus:border-primary transition-all font-heading font-extrabold uppercase text-[12px] tracking-widest text-text outline-none shadow-inner"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Protocol: Diagnostic Intent</label>
                  <textarea
                    placeholder="Provide architectural context..."
                    className="w-full bg-base/50 p-8 rounded-md border border-border focus:border-primary transition-all font-body text-lg italic text-text min-h-[200px] resize-none outline-none shadow-inner"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="space-y-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-gradient text-white py-10 rounded-md font-heading font-extrabold uppercase text-[12px] tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 shadow-2xl disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Initialize Dispatch
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between px-2">
                    <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em] flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      TLS 1.3 Encryption
                    </p>
                    <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em] italic">
                      Response Matrix: ~4h
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
