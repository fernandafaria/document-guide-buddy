import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Illustration */}
      <div className="w-72 h-72 mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-light via-white to-mint/10 rounded-full animate-pulse opacity-20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-9xl mb-4">🤔</span>
          <span className="text-6xl">❓</span>
        </div>
      </div>

      {/* Message */}
      <h2 className="text-3xl font-bold text-black-soft mb-3 text-center">
        No users nearby
      </h2>
      <p className="text-lg text-gray-medium text-center max-w-sm mb-12">
        Check-in at a location to start meeting people
      </p>

      {/* Action Button */}
      <Button
        className="w-full max-w-md h-14"
        onClick={() => navigate("/map")}
      >
        Find Events
      </Button>
    </div>
  );
};

export default EmptyState;
