import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Center, Spinner } from "@chakra-ui/react";

const LogoutSync = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout to clear localhost cookie
    // We can directly call the logout API or the context logout.
    // However, context logout redirects. We need to avoid infinite loop.
    // So we'll fetch directly or use a modified logout that doesn't redirect if we are already syncing.

    const performSync = async () => {
      try {
        await fetch("/api/v1/users/logout", { method: "POST" });
        // After clearing cookie, redirect to home
        window.location.href = "/";
      } catch (err) {
        console.error("Logout Sync Failed", err);
        window.location.href = "/";
      }
    };

    performSync();
  }, []);

  return (
    <Center h="100vh">
      <Spinner size="xl" color="red.500" />
    </Center>
  );
};

export default LogoutSync;
