import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, X } from "lucide-react";
import { useState } from "react";

interface AdvancedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  intentions: string[];
  genders: string[];
  ageRange: [number, number];
  education: string[];
  profession: string;
  alcohol: string[];
  musicStyles: string[];
  languages: string[];
}

const INTENTIONS = ["Date", "Amizade"];
const GENDERS = ["Masculino", "Feminino", "Não-binário"];
const EDUCATION_LEVELS = ["Fundamental", "Médio", "Superior", "Pós", "Mestrado", "Doutorado"];
const ALCOHOL_OPTIONS = ["Não bebo", "Socialmente", "Frequentemente"];
const MUSIC_STYLES = ["Rock", "Pop", "Sertanejo", "Funk", "MPB", "Eletrônica", "Jazz", "Blues", "Clássica"];
const LANGUAGES = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Mandarim"];

export const AdvancedFiltersModal = ({ open, onOpenChange, onApply }: AdvancedFiltersModalProps) => {
  const [showCategory, setShowCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    intentions: [],
    genders: [],
    ageRange: [18, 50],
    education: [],
    profession: "",
    alcohol: [],
    musicStyles: [],
    languages: [],
  });

  const handleClear = () => {
    setFilters({
      intentions: [],
      genders: [],
      ageRange: [18, 50],
      education: [],
      profession: "",
      alcohol: [],
      musicStyles: [],
      languages: [],
    });
  };

  const handleApply = () => {
    onApply(filters);
    onOpenChange(false);
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    setFilters({
      ...filters,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  const categories = [
    { id: "intention", name: "Intenção", icon: "🤝", color: "bg-coral" },
    { id: "gender", name: "Gênero", icon: "👥", color: "bg-turquoise" },
    { id: "age", name: "Faixa Etária", icon: "📅", color: "bg-lavender" },
    { id: "education", name: "Educação", icon: "🎓", color: "bg-coral" },
    { id: "profession", name: "Profissão", icon: "💼", color: "bg-turquoise" },
    { id: "alcohol", name: "Álcool", icon: "🍷", color: "bg-pink-deep" },
    { id: "music", name: "Estilo Musical", icon: "🎸", color: "bg-coral" },
    { id: "languages", name: "Idiomas", icon: "🌍", color: "bg-turquoise" },
  ];

  if (showCategory) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md h-full sm:h-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <button
              onClick={() => setShowCategory(null)}
              className="absolute left-4 top-4 text-gray-medium hover:text-black-soft"
            >
              <X className="w-6 h-6" />
            </button>
            <DialogTitle className="text-center text-xl font-bold">
              {categories.find((c) => c.id === showCategory)?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {showCategory === "intention" && (
              <div className="space-y-3">
                {INTENTIONS.map((intention) => (
                  <label key={intention} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.intentions.includes(intention)}
                      onCheckedChange={() => toggleArrayFilter("intentions", intention)}
                    />
                    <span className="text-base text-gray-dark">{intention}</span>
                  </label>
                ))}
              </div>
            )}

            {showCategory === "gender" && (
              <div className="space-y-3">
                {GENDERS.map((gender) => (
                  <label key={gender} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.genders.includes(gender)}
                      onCheckedChange={() => toggleArrayFilter("genders", gender)}
                    />
                    <span className="text-base text-gray-dark">{gender}</span>
                  </label>
                ))}
              </div>
            )}

            {showCategory === "age" && (
              <div className="space-y-4">
                <div className="flex justify-between text-lg font-bold text-black-soft">
                  <span>{filters.ageRange[0]}</span>
                  <span>{filters.ageRange[1]}</span>
                </div>
                <Slider
                  min={18}
                  max={50}
                  step={1}
                  value={filters.ageRange}
                  onValueChange={(value) => setFilters({ ...filters, ageRange: value as [number, number] })}
                  className="w-full"
                />
              </div>
            )}

            {showCategory === "education" && (
              <div className="space-y-3">
                {EDUCATION_LEVELS.map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.education.includes(level)}
                      onCheckedChange={() => toggleArrayFilter("education", level)}
                    />
                    <span className="text-base text-gray-dark">{level}</span>
                  </label>
                ))}
              </div>
            )}

            {showCategory === "profession" && (
              <Input
                placeholder="Buscar profissão..."
                value={filters.profession}
                onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                className="text-base"
              />
            )}

            {showCategory === "alcohol" && (
              <div className="flex flex-wrap gap-2">
                {ALCOHOL_OPTIONS.map((option) => (
                  <Badge
                    key={option}
                    onClick={() => toggleArrayFilter("alcohol", option)}
                    className={`cursor-pointer px-4 py-2 text-base ${
                      filters.alcohol.includes(option)
                        ? "bg-pink-deep text-white"
                        : "bg-gray-light text-gray-dark"
                    }`}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            )}

            {showCategory === "music" && (
              <div className="flex flex-wrap gap-2">
                {MUSIC_STYLES.map((style) => (
                  <Badge
                    key={style}
                    onClick={() => toggleArrayFilter("musicStyles", style)}
                    className={`cursor-pointer px-4 py-2 text-base ${
                      filters.musicStyles.includes(style)
                        ? "bg-coral text-white"
                        : "bg-gray-light text-gray-dark"
                    }`}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            )}

            {showCategory === "languages" && (
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((language) => (
                  <Badge
                    key={language}
                    onClick={() => toggleArrayFilter("languages", language)}
                    className={`cursor-pointer px-4 py-2 text-base ${
                      filters.languages.includes(language)
                        ? "bg-turquoise text-white"
                        : "bg-gray-light text-gray-dark"
                    }`}
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1 h-14 text-base"
            >
              Limpar
            </Button>
            <Button onClick={handleApply} className="flex-1 h-14 text-base">
              Aplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-full sm:h-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute left-4 top-4 text-gray-medium hover:text-black-soft"
          >
            <X className="w-6 h-6" />
          </button>
          <DialogTitle className="text-center text-xl font-bold">Filtros</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setShowCategory(category.id)}
              className="w-full flex items-center gap-4 py-5 px-2 hover:bg-gray-light/50 rounded-lg transition-colors"
            >
              <div className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
                {category.icon}
              </div>
              <span className="flex-1 text-left text-lg font-bold text-black-soft">
                {category.name}
              </span>
              <ChevronRight className="w-6 h-6 text-gray-medium" />
            </button>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-14 text-base"
          >
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1 h-14 text-base">
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
