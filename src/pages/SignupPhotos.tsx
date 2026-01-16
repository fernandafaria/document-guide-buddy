import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Camera, X, ArrowLeft } from "lucide-react";

interface PhotoItem {
  file: File;
  preview: string;
}

// Helper function to convert DataURL to Blob efficiently (without fetch)
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Helper function to add timeout to promises
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms)
    )
  ]);
};

const SignupPhotos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
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
      setPhotos([...photos, { file, preview: reader.result as string }]);
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

      // Tenta criar a conta com timeout de 30 segundos
      const { data: signUpData, error: signUpError } = await withTimeout(
        signUp(email, password, {
          name,
          age,
          gender,
          intentions,
        }),
        30000,
        'Tempo limite excedido ao criar conta. Verifique sua conexão.'
      );

      let authUser = signUpData?.user || null;

      if (signUpError) {
        const msg = String(signUpError.message || "").toLowerCase();
        if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
          toast({ title: "Conta já existe", description: "Entrando com suas credenciais..." });
          // SignIn também com timeout de 30 segundos
          const { data: signInData, error: signInError } = await withTimeout(
            signIn(email, password),
            30000,
            'Tempo limite excedido ao entrar. Verifique sua conexão.'
          );
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

      // Upload das fotos em paralelo com timeout e melhor tratamento de erros
      const uploadErrors: string[] = [];
      const uploadPromises = photos.map(async (photoItem, i) => {
        const fileName = `${authUser.id}/photo-${i}-${Date.now()}.jpg`;

        // Use the original File object directly for better performance
        // Fall back to converting DataURL to Blob if File is not available
        const uploadData = photoItem.file || dataURLtoBlob(photoItem.preview);

        try {
          const uploadPromise = supabase.storage
            .from('profile-photos')
            .upload(fileName, uploadData);

          // Add 30 second timeout for each upload
          const { error: uploadError } = await withTimeout(
            uploadPromise,
            30000,
            `Upload da foto ${i + 1} excedeu o tempo limite`
          );

          if (uploadError) {
            console.error(`Error uploading photo ${i + 1}:`, uploadError);
            uploadErrors.push(`Foto ${i + 1}: ${uploadError.message}`);
            return null;
          }

          const { data: urlData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);
          return urlData.publicUrl;
        } catch (error: any) {
          console.error(`Error uploading photo ${i + 1}:`, error);
          uploadErrors.push(`Foto ${i + 1}: ${error.message || 'Erro desconhecido'}`);
          return null;
        }
      });

      const uploadedPhotoUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];

      // Validate that at least one photo was uploaded successfully
      if (uploadedPhotoUrls.length === 0) {
        throw new Error(
          uploadErrors.length > 0
            ? `Nenhuma foto foi enviada. Erros: ${uploadErrors.join('; ')}`
            : 'Nenhuma foto foi enviada. Verifique sua conexão e tente novamente.'
        );
      }

      // Warn user if some photos failed but at least one succeeded
      if (uploadErrors.length > 0 && uploadedPhotoUrls.length > 0) {
        toast({
          title: "Algumas fotos não foram enviadas",
          description: `${uploadedPhotoUrls.length} de ${photos.length} fotos foram enviadas com sucesso.`,
          variant: "destructive",
        });
      }

      // Upsert do perfil com timeout de 30 segundos
      const normalizedGender = normalizeGender(gender);
      const profileUpsertPromise = supabase
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

      const { error: profileError } = await withTimeout(
        profileUpsertPromise,
        30000,
        'Tempo limite excedido ao salvar perfil. Verifique sua conexão.'
      );

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
                  src={photos[index].preview}
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
