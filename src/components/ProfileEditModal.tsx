import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onSave: () => void;
}

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

export const ProfileEditModal = ({ open, onOpenChange, profile, onSave }: ProfileEditModalProps) => {
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
    if (profile) {
      setFormData({
        name: profile.name || "",
        age: profile.age || 18,
        profession: profile.profession || "",
        city: profile.city || "",
        state: profile.state || "",
        about_me: profile.about_me || "",
        intentions: profile.intentions || [],
        musical_styles: profile.musical_styles || [],
        languages: profile.languages || [],
        education: profile.education || "",
        alcohol: profile.alcohol || "",
        religion: profile.religion || "",
        zodiac_sign: profile.zodiac_sign || "",
      });
      setExistingPhotos(profile.photos || []);
    }
  }, [profile]);

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
      await supabase.storage.from("profile-photos").remove([photoPath]);
      setExistingPhotos(existingPhotos.filter(p => p !== photoPath));
    } catch (error) {
      console.error("Error removing photo:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Upload new photos
      const uploadedPhotoPaths = [...existingPhotos];
      
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;
        uploadedPhotoPaths.push(fileName);
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          photos: uploadedPhotoPaths,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      onSave();
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black-soft">
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Photos */}
          <div>
            <Label className="text-lg font-semibold mb-3 block">Fotos (máx. 6)</Label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {existingPhotos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-light">
                  <img
                    src={supabase.storage.from("profile-photos").getPublicUrl(photo).data.publicUrl}
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
              />
            </div>
          </div>

          <div>
            <Label>Profissão</Label>
            <Input
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Sua profissão"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cidade</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Estado"
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
                <SelectTrigger>
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
                <SelectTrigger>
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
              />
            </div>
            <div>
              <Label>Signo</Label>
              <Select value={formData.zodiac_sign} onValueChange={(value) => setFormData({ ...formData, zodiac_sign: value })}>
                <SelectTrigger>
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
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
