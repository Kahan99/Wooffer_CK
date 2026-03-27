import React from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="drawer lg:drawer-open selection:bg-primary/20 bg-base min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-base overflow-hidden relative">
        {/* Mobile Header - Glassmorphic Sentinel */}
        <div className="w-full navbar stitch-glass border-b border-border lg:hidden sticky top-0 z-40 px-6 py-4">
          <div className="flex-none">
            <label htmlFor="my-drawer-2" className="p-3 bg-surface/40 rounded-xl hover:bg-surface/60 transition-colors cursor-pointer block">
              <Menu className="w-5 h-5 text-text" />
            </label>
          </div>
          <div className="flex-1 px-4 text-xl font-heading font-extrabold text-text uppercase tracking-tighter italic">
            WOOFFER<span className="text-primary italic">.</span>
          </div>
        </div>

        {/* Page Content - Architectural Canvas */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
      <Sidebar />
    </div>
  );
};

export default AppLayout;
