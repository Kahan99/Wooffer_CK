import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaInfoCircle,
  FaPlug,
  FaCog,
  FaTachometerAlt,
  FaCogs,
  FaMicrochip,
  FaNetworkWired,
  FaBan,
  FaWrench,
  FaArrowLeft,
} from "react-icons/fa";

const FloatingVerticalNavbar = ({ scope, projectId, serviceId }) => {
  const location = useLocation();

  // Define tabs based on scope (project vs service)
  const projectTabs = [
    {
      label: "Overview",
      path: `/project/${projectId}`,
      icon: <FaInfoCircle />,
    },
    {
      label: "Integration",
      path: `/project/${projectId}/integration`,
      icon: <FaPlug />,
    },
    {
      label: "Settings",
      path: `/project/${projectId}/settings`,
      icon: <FaCog />,
    },
  ];

  const serviceTabs = [
    {
      label: "Dashboard",
      path: `/project/service/${projectId}/${serviceId}`,
      icon: <FaTachometerAlt />,
    },
    {
      label: "Log",
      path: `/project/service/${projectId}/${serviceId}/log`,
      icon: <FaNetworkWired />,
    },
    {
      label: "Process Usage",
      path: `/project/service/${projectId}/${serviceId}/process`,
      icon: <FaCogs />,
    },
    {
      label: "CPU Usage",
      path: `/project/service/${projectId}/${serviceId}/cpu`,
      icon: <FaMicrochip />,
    },
    {
      label: "API Usage",
      path: `/project/service/${projectId}/${serviceId}/api`,
      icon: <FaNetworkWired />,
    },
    {
      label: "Blocked API",
      path: `/project/service/${projectId}/${serviceId}/blocked`,
      icon: <FaBan />,
    },
    {
      label: "Setup",
      path: `/project/service/${projectId}/${serviceId}/setup`,
      icon: <FaWrench />,
    },
    {
      label: "Settings",
      path: `/project/service/${projectId}/${serviceId}/settings`,
      icon: <FaCog />,
    },
  ];

  const tabs = scope === "service" ? serviceTabs : projectTabs;

  const isActive = (path) => {
    // Exact match for base paths, otherwise startsWith for sub-routes
    if (
      path === `/project/${projectId}` ||
      path === `/project/service/${projectId}/${serviceId}`
    ) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-14 lg:w-44 flex-shrink-0 relative">
      <div className="fixed top-20 bottom-4 w-14 lg:w-44 ml-3 lg:ml-4 text-base-content overflow-y-auto z-40">
        {/* Glassmorphism Container */}
        <div className="bg-base-100/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl h-full flex flex-col py-4 overflow-hidden">
          {/* Back Button */}
          {scope === "service" && (
            <div className="px-2 lg:px-3 mb-4">
              <Link
                to={`/project/${projectId}`}
                className="btn btn-ghost btn-xs w-full justify-center lg:justify-start gap-2 bg-base-200/50 hover:bg-base-200"
              >
                <FaArrowLeft className="text-xs" />
                <span className="hidden lg:inline text-xs">
                  Back to Project
                </span>
              </Link>
            </div>
          )}

          {scope === "project" && (
            <div className="px-2 lg:px-3 mb-4">
              <Link
                to="/app"
                className="btn btn-ghost btn-xs w-full justify-center lg:justify-start gap-2 bg-base-200/50 hover:bg-base-200"
              >
                <FaArrowLeft className="text-xs" />
                <span className="hidden lg:inline text-xs">Back to App</span>
              </Link>
            </div>
          )}

          <div className="flex-1 px-2 space-y-1">
            {tabs.map((tab) => {
              const active = isActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                      : "hover:bg-primary/10 text-base-content/70 hover:text-base-content"
                  }`}
                  title={tab.label}
                >
                  <div
                    className={`text-base flex-shrink-0 ${active ? "text-primary-content" : "text-primary"}`}
                  >
                    {tab.icon}
                  </div>
                  <span
                    className={`hidden lg:block text-sm font-medium ${active ? "text-primary-content" : ""}`}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingVerticalNavbar;
