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
  const { signUp, signIn } = useAuth();
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

  const normalizeGender = (g: string): string => {
    const map: Record<string, string> = {
      'Homem': 'Masculino',
      'Mulher': 'Feminino',
      'Homem trans': 'Masculino',
      'Mulher trans': 'Feminino',
      'Não-binário': 'Não-binário',
      'Gênero fluido': 'Não-binário',
      'Agênero': 'Não-binário',
      'Bigênero': 'Não-binário',
      'Queer': 'Outro',
      'Questioning': 'Outro',
      'Prefiro não informar': 'Outro',
      'Outro': 'Outro',
    };
    return map[g] ?? 'Outro';
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

      // Tenta criar a conta; se já existir, faz login automaticamente
      const { data: signUpData, error: signUpError } = await signUp(email, password, {
        name,
        age,
        gender,
        intentions,
      });

      let authUser = signUpData?.user || null;

      if (signUpError) {
        const msg = String(signUpError.message || "").toLowerCase();
        if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
          toast({ title: "Conta já existe", description: "Entrando com suas credenciais..." });
          const { data: signInData, error: signInError } = await signIn(email, password);
          if (signInError) {
            throw new Error(`Não foi possível entrar: ${signInError.message}`);
          }
          authUser = signInData.user;
        } else {
          throw signUpError;
        }
      }

      if (!authUser) {
        throw new Error("Erro ao autenticar usuário");
      }

      // Upload das fotos
      const uploadedPhotoUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const fileName = `${authUser.id}/photo-${i}-${Date.now()}.jpg`;
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

      // Upsert do perfil (com normalização de gênero)
      const normalizedGender = normalizeGender(gender);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          name,
          age,
          gender: normalizedGender,
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
        toast({
          title: "Aviso",
          description: "Conta criada, mas houve um problema ao salvar o perfil. Você pode completar depois.",
          variant: "destructive",
        });
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao YO!",
      });

      // Limpa dados salvos após sucesso
      sessionStorage.removeItem('signupData');

      navigate("/profile");
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
        <div className="h-full w-full bg-coral rounded-full transition-all duration-300" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black-soft mb-2">
          Adicione suas fotos
        </h1>
        <p className="text-lg text-gray-medium">Pelo menos 1 foto é obrigatória (máx. 5)</p>
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
