import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Features from "../pages/Features";
import NeedOfWooffer from "../pages/NeedOfWooffer";
import Documentation from "../pages/Documentation";
import Contact from "../pages/Contact";
import ResetPassword from "../pages/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import SSOCallback from "./SSOCallback";
import LogoutSync from "./LogoutSync";
import AppLayout from "./app/AppLayout";
import AppDashboard from "../pages/app/AppDashboard";
import ProjectLayout from "../pages/app/ProjectLayout";
import ServiceLayout from "../pages/app/ServiceLayout";
import UsageSummary from "../pages/app/UsageSummary";
import UserProfile from "../pages/app/UserProfile";
import Navbar from "./Navbar";

const SubdomainRouter = () => {
  const hostname = window.location.hostname;
  // Check if we are on the 'app' subdomain
  const isAppSubdomain = hostname.startsWith("app.");

  if (isAppSubdomain) {
    return (
      <Routes>
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route index element={<AppDashboard />} />
                  <Route path="usage" element={<UsageSummary />} />
                  <Route path="profile" element={<UserProfile />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectLayout />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/service/:projectId/:serviceId/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ServiceLayout />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    );
  }

  // Marketing Site Routes
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/why-wooffer" element={<NeedOfWooffer />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/logout-sync" element={<LogoutSync />} />
        <Route
          path="/dashboard"
          element={
            <Navigate
              to={`http://app.${window.location.hostname.replace("www.", "")}${
                window.location.port ? `:${window.location.port}` : ""
              }/app`}
              replace
            />
          }
        />
      </Routes>
    </>
  );
};

export default SubdomainRouter;
