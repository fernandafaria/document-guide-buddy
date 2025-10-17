import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const SignupInterests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    profession: "",
    education: "",
    city: "",
    state: "",
    languages: [] as string[],
    alcohol: "",
    religion: "",
    zodiac_sign: "",
    musical_styles: [] as string[],
    about_me: "",
  });

  const userData = location.state || {};

  const alcoholOptions = ["Não bebo", "Socialmente", "Regularmente"];
  const musicalStyles = ["Pop", "Rock", "Hip Hop", "Eletrônica", "Sertanejo", "MPB", "Jazz", "Funk", "Rap", "Indie"];
  const languageOptions = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano"];

  const toggleArrayItem = (array: string[], item: string, field: 'languages' | 'musical_styles') => {
    setFormData({
      ...formData,
      [field]: array.includes(item)
        ? array.filter((i) => i !== item)
        : [...array, item],
    });
  };

  const handleContinue = () => {
    if (!formData.city || !formData.state) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha cidade e estado",
        variant: "destructive",
      });
      return;
    }

    navigate("/signup-photos", {
      state: {
        ...userData,
        ...formData,
      },
    });
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
        <div className="h-full w-3/4 bg-coral rounded-full transition-all duration-300" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black-soft mb-2">
          Interesses & Lifestyle
        </h1>
        <p className="text-lg text-gray-medium">Conte mais sobre você</p>
      </div>

      {/* Form */}
      <div className="space-y-6 mb-8 flex-1 overflow-y-auto">
        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-semibold text-black-soft">
              Cidade *
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Sua cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="h-14 bg-gray-light border-0 rounded-2xl text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-base font-semibold text-black-soft">
              Estado *
            </Label>
            <Input
              id="state"
              type="text"
              placeholder="UF"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="h-14 bg-gray-light border-0 rounded-2xl text-base"
              maxLength={2}
            />
          </div>
        </div>

        {/* Profession */}
        <div className="space-y-2">
          <Label htmlFor="profession" className="text-base font-semibold text-black-soft">
            Profissão
          </Label>
          <Input
            id="profession"
            type="text"
            placeholder="O que você faz?"
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* Education */}
        <div className="space-y-2">
          <Label htmlFor="education" className="text-base font-semibold text-black-soft">
            Formação
          </Label>
          <Input
            id="education"
            type="text"
            placeholder="Sua formação acadêmica"
            value={formData.education}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-black-soft">
            Idiomas
          </Label>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((lang) => (
              <Badge
                key={lang}
                onClick={() => toggleArrayItem(formData.languages, lang, 'languages')}
                className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                  formData.languages.includes(lang)
                    ? "bg-coral text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium/20"
                }`}
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        {/* Musical Styles */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-black-soft">
            Estilos musicais
          </Label>
          <div className="flex flex-wrap gap-2">
            {musicalStyles.map((style) => (
              <Badge
                key={style}
                onClick={() => toggleArrayItem(formData.musical_styles, style, 'musical_styles')}
                className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                  formData.musical_styles.includes(style)
                    ? "bg-coral text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium/20"
                }`}
              >
                {style}
              </Badge>
            ))}
          </div>
        </div>

        {/* Alcohol */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-black-soft">
            Bebidas
          </Label>
          <div className="flex gap-3">
            {alcoholOptions.map((option) => (
              <Badge
                key={option}
                onClick={() => setFormData({ ...formData, alcohol: option })}
                className={`flex-1 h-14 justify-center text-sm cursor-pointer transition-all ${
                  formData.alcohol === option
                    ? "bg-coral text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium/20"
                }`}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        {/* Religion */}
        <div className="space-y-2">
          <Label htmlFor="religion" className="text-base font-semibold text-black-soft">
            Religião (opcional)
          </Label>
          <Input
            id="religion"
            type="text"
            placeholder="Sua religião ou espiritualidade"
            value={formData.religion}
            onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* Zodiac Sign */}
        <div className="space-y-2">
          <Label htmlFor="zodiac" className="text-base font-semibold text-black-soft">
            Signo (opcional)
          </Label>
          <Input
            id="zodiac"
            type="text"
            placeholder="Seu signo"
            value={formData.zodiac_sign}
            onChange={(e) => setFormData({ ...formData, zodiac_sign: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* About Me */}
        <div className="space-y-2">
          <Label htmlFor="about" className="text-base font-semibold text-black-soft">
            Sobre mim
          </Label>
          <textarea
            id="about"
            placeholder="Conte um pouco sobre você..."
            value={formData.about_me}
            onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
            className="w-full min-h-[120px] p-4 bg-gray-light border-0 rounded-2xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-coral"
            maxLength={500}
          />
          <p className="text-xs text-gray-medium text-right">
            {formData.about_me.length}/500
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <Button className="w-full h-14" onClick={handleContinue}>
        Continuar
      </Button>
    </div>
  );
};

export default SignupInterests;
