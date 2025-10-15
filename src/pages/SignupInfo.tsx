import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const INTENTIONS = ["Date", "Amizade", "Networking", "Música"];
const MUSICAL_STYLES = ["Pop", "Rock", "MPB", "Sertanejo", "Funk", "Hip Hop", "Eletrônica", "Jazz", "Clássica"];
const LANGUAGES = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Japonês", "Mandarim"];
const EDUCATION_LEVELS = ["Ensino Médio", "Superior Incompleto", "Superior Completo", "Pós-graduação", "Mestrado", "Doutorado"];
const ALCOHOL_OPTIONS = ["Não bebo", "Socialmente", "Frequentemente", "Prefiro não dizer"];
const ZODIAC_SIGNS = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];

const SignupInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    state: "",
    profession: "",
    education: "",
    alcohol: "",
    religion: "",
    zodiac_sign: "",
    about_me: "",
    intentions: [] as string[],
    musical_styles: [] as string[],
    languages: [] as string[],
  });

  const { email, password } = location.state || {};

  const toggleArrayItem = (array: string[], item: string, field: 'intentions' | 'musical_styles' | 'languages') => {
    setFormData({
      ...formData,
      [field]: array.includes(item)
        ? array.filter((i) => i !== item)
        : [...array, item],
    });
  };

  const handleContinue = () => {
    console.log("handleContinue called", { email, password, formData });
    
    if (!email || !password) {
      console.error("Missing email or password");
      toast({
        title: "Erro",
        description: "Dados de autenticação não encontrados",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!formData.name || !formData.age || !formData.gender || formData.intentions.length === 0) {
      console.error("Validation failed", {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        intentions: formData.intentions
      });
      toast({
        title: "Preencha todos os campos obrigatórios",
        description: "Nome, idade, gênero e pelo menos uma intenção são necessários",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Navigating to signup-photos");
    navigate("/signup-photos", { 
      state: { 
        email, 
        password, 
        ...formData,
        age: parseInt(formData.age)
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-8">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-light rounded-full mb-8">
        <div className="h-full w-1/3 bg-coral rounded-full transition-all duration-300" />
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black-soft mb-2">
          Informações do Perfil
        </h1>
        <p className="text-lg text-gray-medium">Conte-nos sobre você</p>
      </div>

      {/* Form */}
      <div className="space-y-6 mb-8">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold text-black-soft">
            Nome *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-base font-semibold text-black-soft">
            Idade *
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Sua idade"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
            min="18"
            max="99"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-base font-semibold text-black-soft">
            Gênero *
          </Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger className="h-14 bg-gray-light border-0 rounded-2xl text-base">
              <SelectValue placeholder="Selecione seu gênero" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Feminino">Feminino</SelectItem>
              <SelectItem value="Não-binário">Não-binário</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-semibold text-black-soft">
              Cidade
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="h-14 bg-gray-light border-0 rounded-2xl text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-base font-semibold text-black-soft">
              Estado
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
            placeholder="Sua profissão"
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* About Me */}
        <div className="space-y-2">
          <Label htmlFor="about_me" className="text-base font-semibold text-black-soft">
            Sobre Mim
          </Label>
          <Textarea
            id="about_me"
            placeholder="Conte um pouco sobre você..."
            value={formData.about_me}
            onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
            className="min-h-[100px] bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* Intentions */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-black-soft">
            Procurando por *
          </Label>
          <div className="flex flex-wrap gap-2">
            {INTENTIONS.map((intention) => (
              <Badge
                key={intention}
                onClick={() => toggleArrayItem(formData.intentions, intention, 'intentions')}
                className={`h-10 px-4 cursor-pointer transition-all ${
                  formData.intentions.includes(intention)
                    ? "bg-coral text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium/20"
                }`}
              >
                {intention}
              </Badge>
            ))}
          </div>
        </div>

        {/* Musical Styles */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-black-soft">
            Estilos Musicais
          </Label>
          <div className="flex flex-wrap gap-2">
            {MUSICAL_STYLES.map((style) => (
              <Badge
                key={style}
                onClick={() => toggleArrayItem(formData.musical_styles, style, 'musical_styles')}
                className={`h-10 px-4 cursor-pointer transition-all ${
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

        {/* Languages */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-black-soft">
            Idiomas
          </Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((language) => (
              <Badge
                key={language}
                onClick={() => toggleArrayItem(formData.languages, language, 'languages')}
                className={`h-10 px-4 cursor-pointer transition-all ${
                  formData.languages.includes(language)
                    ? "bg-coral text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium/20"
                }`}
              >
                {language}
              </Badge>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <Label htmlFor="education" className="text-base font-semibold text-black-soft">
            Escolaridade
          </Label>
          <Select value={formData.education} onValueChange={(value) => setFormData({ ...formData, education: value })}>
            <SelectTrigger className="h-14 bg-gray-light border-0 rounded-2xl text-base">
              <SelectValue placeholder="Selecione sua escolaridade" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alcohol */}
        <div className="space-y-2">
          <Label htmlFor="alcohol" className="text-base font-semibold text-black-soft">
            Álcool
          </Label>
          <Select value={formData.alcohol} onValueChange={(value) => setFormData({ ...formData, alcohol: value })}>
            <SelectTrigger className="h-14 bg-gray-light border-0 rounded-2xl text-base">
              <SelectValue placeholder="Com que frequência você bebe?" />
            </SelectTrigger>
            <SelectContent>
              {ALCOHOL_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Religion */}
        <div className="space-y-2">
          <Label htmlFor="religion" className="text-base font-semibold text-black-soft">
            Religião
          </Label>
          <Input
            id="religion"
            type="text"
            placeholder="Sua religião (opcional)"
            value={formData.religion}
            onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
            className="h-14 bg-gray-light border-0 rounded-2xl text-base"
          />
        </div>

        {/* Zodiac Sign */}
        <div className="space-y-2">
          <Label htmlFor="zodiac_sign" className="text-base font-semibold text-black-soft">
            Signo
          </Label>
          <Select value={formData.zodiac_sign} onValueChange={(value) => setFormData({ ...formData, zodiac_sign: value })}>
            <SelectTrigger className="h-14 bg-gray-light border-0 rounded-2xl text-base">
              <SelectValue placeholder="Selecione seu signo" />
            </SelectTrigger>
            <SelectContent>
              {ZODIAC_SIGNS.map((sign) => (
                <SelectItem key={sign} value={sign}>{sign}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue Button */}
      <Button className="w-full h-14" onClick={handleContinue}>
        Continuar
      </Button>
    </div>
  );
};

export default SignupInfo;
