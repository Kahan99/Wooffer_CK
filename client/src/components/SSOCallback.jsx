import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Center, Spinner, useToast } from "@chakra-ui/react";

const SSOCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkUser } = useAuth(); // We might need to refresh user state
  const toast = useToast();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Call backend to set cookie
      fetch("/api/v1/users/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success) {
            // Successfully set cookie.
            // Also store token in localStorage for Bearer auth (Cross-Origin support)
            localStorage.setItem("token", token);

            // Force reload to ensure AuthContext picks up the token/cookie state
            window.location.href = "/dashboard";
          } else {
            throw new Error(data.message || "SSO Failed");
          }
        })
        .catch((err) => {
          console.error("SSO Error", err);
          toast({
            title: "Login Failed",
            description: "Could not verify session.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate("/");
        });
    } else {
      navigate("/");
    }
  }, [searchParams, navigate, toast]);

  return (
    <Center h="100vh">
      <Spinner size="xl" color="purple.500" />
    </Center>
  );
};

export default SSOCallback;
