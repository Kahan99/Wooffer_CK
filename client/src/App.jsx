import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import SubdomainRouter from "./components/SubdomainRouter";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const { isOpen, closeAuthModal } = useAuth();
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col font-sans text-base-content bg-base-100 transition-colors duration-300">
      <ScrollToTop />
      <main className="flex-grow">
        <SubdomainRouter />
      </main>
      {["/", "/features", "/why-wooffer", "/docs", "/contact"].includes(
        location.pathname,
      ) && <Footer />}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} />
    </div>
  );
}

export default App;
