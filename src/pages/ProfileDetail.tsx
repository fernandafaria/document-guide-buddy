import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const ProfileDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const mockUser = {
    id: 1,
    name: "Carlos",
    age: 32,
    profession: "Engineer",
    photos: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos2",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos3",
    ],
    about: "Love exploring new places and meeting interesting people. Always up for good conversation over coffee! ☕✨",
    interests: ["Music", "Travel", "Sports", "Technology"],
    lifestyle: {
      alcohol: "Socialmente",
      education: "Superior",
      religion: "Católico",
      zodiac: "Aquário",
    },
    lookingFor: "Date",
  };

  const handleLike = () => {
    // TODO: Implement like logic
    navigate("/match");
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-10 w-12 h-12 bg-white rounded-full shadow-elevated flex items-center justify-center hover:scale-105 transition-transform"
      >
        <ArrowLeft className="w-6 h-6 text-black-soft" />
      </button>

      {/* Photo Gallery */}
      <div className="relative h-[400px] bg-gray-light">
        <img
          src={mockUser.photos[currentPhoto]}
          alt={mockUser.name}
          className="w-full h-full object-cover"
        />
        
        {/* Photo Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {mockUser.photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPhoto(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentPhoto
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-8">
        {/* Basic Info */}
        <div>
          <h1 className="text-3xl font-bold text-black-soft mb-1">
            {mockUser.name}, {mockUser.age}
          </h1>
          <p className="text-lg text-gray-medium">{mockUser.profession}</p>
        </div>

        {/* About Me */}
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-coral to-pink-deep rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">☕</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-black-soft mb-2">
              About me
            </h3>
            <p className="text-gray-dark leading-relaxed">{mockUser.about}</p>
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="text-xl font-bold text-black-soft mb-4">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {mockUser.interests.map((interest, idx) => (
              <Badge
                key={idx}
                className={`px-4 py-2 text-base ${
                  idx === 0
                    ? "bg-coral"
                    : idx === 1
                    ? "bg-turquoise"
                    : idx === 2
                    ? "bg-lavender"
                    : "bg-mint"
                } text-white`}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lifestyle */}
        <div>
          <h3 className="text-xl font-bold text-black-soft mb-4">Lifestyle</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍷</span>
              <span className="text-gray-dark">{mockUser.lifestyle.alcohol}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-gray-dark">{mockUser.lifestyle.education}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✝️</span>
              <span className="text-gray-dark">{mockUser.lifestyle.religion}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♒</span>
              <span className="text-gray-dark">{mockUser.lifestyle.zodiac}</span>
            </div>
          </div>
        </div>

        {/* Looking For */}
        <div>
          <h3 className="text-xl font-bold text-black-soft mb-4">
            Procurando por
          </h3>
          <Badge className="px-4 py-2 bg-pink-deep text-white text-base">
            🔍 {mockUser.lookingFor}
          </Badge>
        </div>
      </div>

      {/* Like Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-light">
        <Button className="w-full h-14" onClick={handleLike}>
          <Heart className="mr-2 fill-white" />
          Like
        </Button>
      </div>
    </div>
  );
};

export default ProfileDetail;
