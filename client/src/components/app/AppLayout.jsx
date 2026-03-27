import React from "react";
import AppTopNavbar from "./AppTopNavbar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans transition-colors duration-300">
      {/* Major Horizontal Navbar */}
      <AppTopNavbar />

      {/* Main Content Area */}
      <main className="flex-grow w-full">{children}</main>
    </div>
  );
};

export default AppLayout;
