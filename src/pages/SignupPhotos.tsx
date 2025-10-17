import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Camera, X, ArrowLeft } from "lucide-react";

const SignupPhotos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const userData = location.state || {};

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

  const handleContinue = async () => {
    if (photos.length === 0) {
      toast({
        title: "Adicione pelo menos uma foto",
        description: "Você precisa adicionar pelo menos uma foto para continuar",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { 
        email, 
        password, 
        name, 
        age, 
        gender, 
        intentions,
        profession,
        education,
        city,
        state,
        languages,
        alcohol,
        religion,
        zodiac_sign,
        political_position,
        musical_styles,
        about_me
      } = userData;

      if (!email || !password) {
        toast({
          title: "Erro",
          description: "Dados de cadastro incompletos",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Create account
      const { data: authData, error: signUpError } = await signUp(email, password, {
        name,
        age,
        gender,
        intentions,
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("Este email já está cadastrado");
        }
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("Erro ao criar conta");
      }

      // Upload photos to storage
      const uploadedPhotoUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const fileName = `${authData.user.id}/photo-${i}-${Date.now()}.jpg`;
        
        const base64Data = photo.split(',')[1];
        const blob = await fetch(photo).then(res => res.blob());
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, blob);

        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);
          uploadedPhotoUrls.push(urlData.publicUrl);
        }
      }

      // Upsert profile with photos and additional data (insert if missing)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name,
          age,
          gender,
          intentions,
          photos: uploadedPhotoUrls,
          profession: profession || null,
          education: education || null,
          city: city || null,
          state: state || null,
          languages: languages || [],
          alcohol: alcohol || null,
          religion: religion || null,
          zodiac_sign: zodiac_sign || null,
          musical_styles: musical_styles || [],
          about_me: about_me || null,
        });

      if (profileError) {
        console.error("Error upserting profile:", profileError);
        throw profileError;
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao YO!",
      });

      // Clear saved data after successful signup
      sessionStorage.removeItem('signupData');

      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-dark hover:text-coral transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-base font-medium">Voltar</span>
      </button>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-light rounded-full mb-8">
        <div className="h-full w-1/4 bg-coral rounded-full transition-all duration-300" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black-soft mb-2">
          Adicione suas fotos
        </h1>
        <p className="text-lg text-gray-medium">Escolha até 5 fotos</p>
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
                <span className="text-sm text-gray-medium">Adicionar foto</span>
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
          <span className="font-semibold">Dica:</span> Use fotos claras mostrando
          seu rosto
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue Button */}
      <Button className="w-full h-14" onClick={handleContinue} disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </div>
  );
};

export default SignupPhotos;
