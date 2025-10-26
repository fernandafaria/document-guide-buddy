import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Welcome from "./Welcome";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect logged-in users directly to map
  useEffect(() => {
    if (user) {
      navigate("/map", { replace: true });
    }
  }, [user, navigate]);

  return <Welcome />;
};

export default Index;
