import React, { createContext, useContext, useState, useEffect } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Purge legacy per-site (not per-user) localStorage profile keys
    localStorage.removeItem("wooffer_profilePic");
    localStorage.removeItem("wooffer_profileExtras");
    localStorage.removeItem("wooffer_prefs");
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await fetch("/api/v1/users/profile", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * updateProfile - persists name / company / avatar (base64) to MongoDB.
   * Returns { success, user } or throws on error.
   */
  const updateProfile = async ({ name, company, avatar } = {}) => {
    const body = {};
    if (name !== undefined) body.name = name;
    if (company !== undefined) body.company = company;
    if (avatar !== undefined) body.avatar = avatar;

    const res = await fetch("/api/v1/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    setUser(data.user); // user in-memory is now the DB truth
    return data;
  };

  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      toast({
        title: "Welcome back! 🐾",
        description: "Successfully logged in.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      onClose();

      // Check if we are on the marketing site and redirect to app subdomain
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : "";
      if (!hostname.startsWith("app.")) {
        // SSO Redirect: Pass token in URL
        window.location.href = `http://app.${hostname}${port}/sso-callback?token=${data.token}`;
      } else {
        // If already on app, maybe just navigate or do nothing (router handles it)
        // But since we use window.location.href for cross-domain, here we might want to use navigate() if we had it,
        // but AuthContext doesn't have useNavigate usually unless passed or imported.
        // Since we are likely on a modal, simply closing it might be enough if the router listening to auth state updates.
        // However, simply reloading or letting the state update trigger re-render is fine.
        // But wait, if we are on 'app.localhost' and login, we want to go to /dashboard.
        // The SubdomainRouter renders based on path.
        // If we are at /, it redirects to /dashboard.
        // So we just need to ensure the user state update triggers a re-render.
      }
      return true;
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast({
        title: "Verification Code Sent!",
        description: "Please check your email for the OTP.",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      return true;
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      toast({
        title: "Account Verified!",
        description: "Please login with your credentials.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return true;
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/v1/users/logout", { method: "POST" });
      setUser(null);
      localStorage.removeItem("token");
      toast({
        title: "Logged Out",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : "";
      if (hostname.startsWith("app.")) {
        // Redirect to marketing site logout-sync to clear that cookie too
        window.location.href = `http://${hostname.replace("app.", "")}${port}/logout-sync`;
      }
    }
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      toast({
        title: "Email Sent",
        description: "Check your inbox for password reset instructions.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/users/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      setUser(data.user);
      toast({
        title: "Password Reset Successful!",
        description: "You are now logged in with your new password.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token: localStorage.getItem("token"),
        user,
        // profilePic and company now live directly on the user object from DB
        profilePic: user?.avatar || "",
        profileExtras: { company: user?.company || "" },
        updateProfile,
        openAuthModal: onOpen,
        login,
        register,
        verifyOTP,
        logout,
        forgotPassword,
        resetPassword,
        isLoading,
        isOpen,
        closeAuthModal: onClose,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
