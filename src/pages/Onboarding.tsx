import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Meet people nearby",
      subtitle: "Check-in at events and locations to discover who's around",
      emoji: "👥",
      gradient: "from-coral via-turquoise to-lavender",
    },
    {
      title: "Real-time check-in",
      subtitle: "You only appear to others when you check-in at the same location",
      emoji: "📍",
      gradient: "from-turquoise via-mint to-lavender",
    },
    {
      title: "You're in control",
      subtitle: "Women decide when to start the conversation after a match",
      emoji: "✨",
      gradient: "from-pink-deep via-coral to-lavender",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/signup-photos");
    }
  };

  const handleSkip = () => {
    navigate("/signup-photos");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-12">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="self-end text-gray-medium hover:text-black-soft transition-colors"
      >
        Skip
      </button>

      {/* Logo */}
      <h1 className="text-5xl font-bold text-coral">YO!</h1>

      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`w-72 h-72 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center animate-scale-in`}>
          <span className="text-9xl">{slides[currentSlide].emoji}</span>
        </div>
      </div>

      {/* Content */}
      <div className="text-center mb-8 space-y-4">
        <h2 className="text-3xl font-bold text-black-soft">
          {slides[currentSlide].title}
        </h2>
        <p className="text-lg text-gray-medium max-w-sm mx-auto">
          {slides[currentSlide].subtitle}
        </p>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? "w-8 bg-coral" : "w-2 bg-gray-light"
            }`}
          />
        ))}
      </div>

      {/* Action Button */}
      <Button className="w-full max-w-md h-14" onClick={handleNext}>
        {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
      </Button>
    </div>
  );
};

export default Onboarding;
