import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const INTENTIONS = [
  { value: "date", label: "🔍 Date" },
  { value: "friends", label: "👋 Amizades" },
  { value: "networking", label: "💼 Networking" },
  { value: "travel", label: "✈️ Viagens" }
];

const MUSICAL_STYLES = [
  "Rock", "Pop", "Sertanejo", "Funk", "MPB", "Eletrônica", 
  "Jazz", "Hip Hop", "Reggae", "Clássica", "Samba", "Forró"
];

const LANGUAGES = [
  "Português", "Inglês", "Espanhol", "Francês", "Alemão", 
  "Italiano", "Japonês", "Mandarim", "Coreano"
];

const EDUCATION_LEVELS = [
  "Fundamental", "Médio", "Superior", "Pós-graduação", "Mestrado", "Doutorado"
];

const ALCOHOL_OPTIONS = [
  "Não bebo", "Socialmente", "Frequentemente"
];

const ZODIAC_SIGNS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
];

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    age: 18,
    profession: "",
    city: "",
    state: "",
    about_me: "",
    intentions: [] as string[],
    musical_styles: [] as string[],
    languages: [] as string[],
    education: "",
    alcohol: "",
    religion: "",
    zodiac_sign: "",
  });
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setFormData({
          name: data.name || "",
          age: data.age || 18,
          profession: data.profession || "",
          city: data.city || "",
          state: data.state || "",
          about_me: data.about_me || "",
          intentions: data.intentions || [],
          musical_styles: data.musical_styles || [],
          languages: data.languages || [],
          education: data.education || "",
          alcohol: data.alcohol || "",
          religion: data.religion || "",
          zodiac_sign: data.zodiac_sign || "",
        });
        setExistingPhotos(data.photos || []);
      }
    };

    fetchProfile();
  }, [user]);

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + existingPhotos.length + photos.length > 6) {
      toast({
        title: "Limite de fotos",
        description: "Você pode adicionar no máximo 6 fotos",
        variant: "destructive",
      });
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removeNewPhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = async (photoPath: string) => {
    try {
      // Se for URL completa, extrair o caminho
      let path = photoPath;
      if (photoPath.startsWith('http')) {
        const url = new URL(photoPath);
        path = url.pathname.split('/').slice(-2).join('/');
      }
      
      await supabase.storage.from("profile-photos").remove([path]);
      setExistingPhotos(existingPhotos.filter(p => p !== photoPath));
    } catch (error) {
      console.error("Error removing photo:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Upload new photos in parallel
      const uploadPromises = photos.map(async (photo) => {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, photo);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }
        
        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);
        return urlData.publicUrl;
      });

      const newPhotoPaths = await Promise.all(uploadPromises);
      const allPhotos = [...existingPhotos, ...newPhotoPaths];

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          photos: allPhotos,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      navigate("/profile");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoPath: string) => {
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    return supabase.storage.from("profile-photos").getPublicUrl(photoPath).data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-light px-6 py-4 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate("/profile")}
          className="text-gray-dark hover:text-black-soft transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-black-soft">Editar Perfil</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Photos */}
        <div>
          <Label className="text-lg font-semibold mb-3 block">Fotos (máx. 6)</Label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {existingPhotos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-light">
                <img
                  src={getPhotoUrl(photo)}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeExistingPhoto(photo)}
                  className="absolute top-2 right-2 w-8 h-8 bg-error rounded-full flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {photos.map((photo, idx) => (
              <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-light">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`New photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeNewPhoto(idx)}
                  className="absolute top-2 right-2 w-8 h-8 bg-error rounded-full flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {existingPhotos.length + photos.length < 6 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-medium flex items-center justify-center cursor-pointer hover:border-coral transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-medium" />
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome"
              className="h-12"
            />
          </div>
          <div>
            <Label>Idade</Label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              min={18}
              max={100}
              className="h-12"
            />
          </div>
        </div>

        <div>
          <Label>Profissão</Label>
          <Input
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            placeholder="Sua profissão"
            className="h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cidade</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Cidade"
              className="h-12"
            />
          </div>
          <div>
            <Label>Estado</Label>
            <Input
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Estado"
              className="h-12"
            />
          </div>
        </div>

        {/* About Me */}
        <div>
          <Label>Sobre mim</Label>
          <Textarea
            value={formData.about_me}
            onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
            placeholder="Conte um pouco sobre você..."
            rows={4}
          />
        </div>

        {/* Intentions */}
        <div>
          <Label className="mb-3 block">Procurando por</Label>
          <div className="flex flex-wrap gap-2">
            {INTENTIONS.map((intention) => (
              <Badge
                key={intention.value}
                onClick={() => setFormData({
                  ...formData,
                  intentions: toggleArrayItem(formData.intentions, intention.value)
                })}
                className={`cursor-pointer px-4 py-2 text-base ${
                  formData.intentions.includes(intention.value)
                    ? "bg-pink-deep text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium"
                }`}
              >
                {intention.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Musical Styles */}
        <div>
          <Label className="mb-3 block">Estilos Musicais</Label>
          <div className="flex flex-wrap gap-2">
            {MUSICAL_STYLES.map((style) => (
              <Badge
                key={style}
                onClick={() => setFormData({
                  ...formData,
                  musical_styles: toggleArrayItem(formData.musical_styles, style)
                })}
                className={`cursor-pointer px-4 py-2 text-base ${
                  formData.musical_styles.includes(style)
                    ? "bg-lavender text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium"
                }`}
              >
                {style}
              </Badge>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <Label className="mb-3 block">Idiomas</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((language) => (
              <Badge
                key={language}
                onClick={() => setFormData({
                  ...formData,
                  languages: toggleArrayItem(formData.languages, language)
                })}
                className={`cursor-pointer px-4 py-2 text-base ${
                  formData.languages.includes(language)
                    ? "bg-turquoise text-white"
                    : "bg-gray-light text-gray-dark hover:bg-gray-medium"
                }`}
              >
                {language}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lifestyle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Educação</Label>
            <Select value={formData.education} onValueChange={(value) => setFormData({ ...formData, education: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Álcool</Label>
            <Select value={formData.alcohol} onValueChange={(value) => setFormData({ ...formData, alcohol: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ALCOHOL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Religião</Label>
            <Input
              value={formData.religion}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              placeholder="Sua religião"
              className="h-12"
            />
          </div>
          <div>
            <Label>Signo</Label>
            <Select value={formData.zodiac_sign} onValueChange={(value) => setFormData({ ...formData, zodiac_sign: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((sign) => (
                  <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="flex-1 h-12"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
