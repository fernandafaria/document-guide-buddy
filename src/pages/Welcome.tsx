import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-12">
      {/* Logo */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-[72px] font-bold text-coral tracking-tight">
          YO!
        </h1>
      </div>

      {/* Illustration Placeholder */}
      <div className="w-full max-w-[300px] aspect-square mb-12 rounded-3xl bg-gradient-to-br from-coral via-turquoise to-lavender flex items-center justify-center">
        <div className="text-white text-6xl">👋</div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-md space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Login
        </Button>
        <Button
          variant="default"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
