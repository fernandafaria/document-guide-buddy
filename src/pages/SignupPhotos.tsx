import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SignupPhotos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (photos.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 5 fotos",
        variant: "destructive",
      });
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos([...photos, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (photos.length === 0) {
      toast({
        title: "Adicione uma foto",
        description: "Você precisa adicionar pelo menos uma foto para continuar",
        variant: "destructive",
      });
      return;
    }
    navigate("/signup-info");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-light rounded-full mb-8">
        <div className="h-full w-1/4 bg-coral rounded-full transition-all duration-300" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black-soft mb-2">
          Add your photos
        </h1>
        <p className="text-lg text-gray-medium">Choose up to 5 photos</p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="relative">
            {photos[index] ? (
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img
                  src={photos[index]}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <label className="aspect-square bg-gray-light rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-medium/20 transition-colors">
                <Camera className="w-8 h-8 text-coral mb-2" />
                <span className="text-sm text-gray-medium">Add photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 bg-gray-light rounded-2xl mb-8">
        <span className="text-2xl">💡</span>
        <p className="text-base text-gray-dark">
          <span className="font-semibold">Tip:</span> Use clear photos showing
          your face
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue Button */}
      <Button className="w-full h-14" onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
};

export default SignupPhotos;
