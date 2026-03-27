import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Center, Spinner } from "@chakra-ui/react";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  if (!user) {
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : "";
    if (hostname.startsWith("app.")) {
      // Redirect to marketing site login/home
      window.location.href = `http://${hostname.replace("app.", "")}${port}`;
      return null;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
