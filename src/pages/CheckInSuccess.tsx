import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CheckInSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto navigate after 3 seconds
    const timer = setTimeout(() => {
      navigate("/discovery");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Confetti Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <span className="text-2xl">
              {['🎉', '✨', '💫', '⭐'][Math.floor(Math.random() * 4)]}
            </span>
          </div>
        ))}
      </div>

      {/* Logo */}
      <h1 className="text-5xl font-bold text-coral mb-12">YO!</h1>

      {/* Success Illustration */}
      <div className="w-[300px] h-[300px] mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-coral via-turquoise to-lavender rounded-full animate-pulse opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-9xl animate-bounce">🎉</span>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-black-soft mb-3 text-center">
        Check-in successful!
      </h2>
      <p className="text-lg text-gray-medium text-center mb-12 max-w-sm">
        You are visible to other users for 30 minutes
      </p>

      {/* CTA Button */}
      <Button
        className="w-full max-w-md h-14"
        onClick={() => navigate("/discovery")}
      >
        View Profiles
      </Button>
    </div>
  );
};

export default CheckInSuccess;
