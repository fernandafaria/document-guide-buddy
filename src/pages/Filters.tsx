import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface FilterState {
  intentions: string[];
  genders: string[];
  ageRange: [number, number];
  education: string[];
  alcohol: string[];
  musicStyles: string[];
  languages: string[];
}

const INTENTIONS = ["Date", "Amizade", "Networking"];
const GENDERS = ["Homem", "Mulher", "Homem trans", "Mulher trans", "Não-binário", "Gênero fluido", "Agênero", "Bigênero", "Queer", "Questionando", "Prefiro não informar", "Outro"];
const EDUCATION_LEVELS = ["Ensino Médio", "Superior Incompleto", "Superior Completo", "Pós-graduação", "Mestrado", "Doutorado"];
const ALCOHOL_OPTIONS = ["Não bebo", "Socialmente", "Frequentemente", "Prefiro não dizer"];
const MUSIC_STYLES = ["Pop", "Rock", "MPB", "Sertanejo", "Funk", "Hip Hop", "Eletrônica", "Jazz", "Clássica", "Samba", "Forró"];
const LANGUAGES = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Japonês", "Mandarim"];

const Filters = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFilters = (location.state?.filters as FilterState) || {
    intentions: [],
    genders: [],
    ageRange: [18, 50] as [number, number],
    education: [],
    alcohol: [],
    musicStyles: [],
    languages: [],
  };

  const [showCategory, setShowCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleClear = () => {
    setFilters({
      intentions: [],
      genders: [],
      ageRange: [18, 50],
      education: [],
      alcohol: [],
      musicStyles: [],
      languages: [],
    });
  };

  const handleApply = () => {
    navigate("/discovery", { state: { filters } });
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
    { id: "intention", name: "Intenção", icon: "❤️", color: "bg-coral" },
    { id: "gender", name: "Gênero", icon: "👥", color: "bg-turquoise" },
    { id: "age", name: "Faixa Etária", icon: "📅", color: "bg-lavender" },
    { id: "education", name: "Educação", icon: "🎓", color: "bg-coral" },
    { id: "alcohol", name: "Álcool", icon: "🍷", color: "bg-pink-deep" },
    { id: "music", name: "Estilo Musical", icon: "🎸", color: "bg-coral" },
    { id: "languages", name: "Idiomas", icon: "🌍", color: "bg-turquoise" },
  ];

  if (showCategory) {
    return (
      <div className="min-h-screen bg-white safe-area-top">
        {/* Header */}
        <div 
          className="sticky top-0 bg-white border-b border-gray-light px-6 pb-4 z-10"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          }}
        >
          <div className="flex items-center">
            <button
              onClick={() => setShowCategory(null)}
              className="text-gray-medium hover:text-black-soft active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center text-xl font-bold text-black-soft">
              {categories.find((c) => c.id === showCategory)?.name}
            </h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {showCategory === "intention" && (
            <div className="space-y-4">
              {INTENTIONS.map((intention) => (
                <label key={intention} className="flex items-center gap-3 cursor-pointer py-3">
                  <Checkbox
                    checked={filters.intentions.includes(intention)}
                    onCheckedChange={() => toggleArrayFilter("intentions", intention)}
                  />
                  <span className="text-lg text-gray-dark">{intention}</span>
                </label>
              ))}
            </div>
          )}

          {showCategory === "gender" && (
            <div className="space-y-4">
              {GENDERS.map((gender) => (
                <label key={gender} className="flex items-center gap-3 cursor-pointer py-3">
                  <Checkbox
                    checked={filters.genders.includes(gender)}
                    onCheckedChange={() => toggleArrayFilter("genders", gender)}
                  />
                  <span className="text-lg text-gray-dark">{gender}</span>
                </label>
              ))}
            </div>
          )}

          {showCategory === "age" && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between text-2xl font-bold text-black-soft">
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
            <div className="space-y-4">
              {EDUCATION_LEVELS.map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer py-3">
                  <Checkbox
                    checked={filters.education.includes(level)}
                    onCheckedChange={() => toggleArrayFilter("education", level)}
                  />
                  <span className="text-lg text-gray-dark">{level}</span>
                </label>
              ))}
            </div>
          )}


          {showCategory === "alcohol" && (
            <div className="flex flex-wrap gap-3">
              {ALCOHOL_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  onClick={() => toggleArrayFilter("alcohol", option)}
                  className={`cursor-pointer px-5 py-3 text-lg ${
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
            <div className="flex flex-wrap gap-3">
              {MUSIC_STYLES.map((style) => (
                <Badge
                  key={style}
                  onClick={() => toggleArrayFilter("musicStyles", style)}
                  className={`cursor-pointer px-5 py-3 text-lg ${
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
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((language) => (
                <Badge
                  key={language}
                  onClick={() => toggleArrayFilter("languages", language)}
                  className={`cursor-pointer px-5 py-3 text-lg ${
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

        {/* Bottom Actions */}
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-light px-6 pt-4 flex gap-4"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          }}
        >
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-14 text-lg"
          >
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1 h-14 text-lg">
            Aplicar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white safe-area-top">
      {/* Header */}
      <div 
        className="sticky top-0 bg-white border-b border-gray-light px-6 pb-4 z-10"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        }}
      >
        <div className="flex items-center">
          <button
            onClick={() => navigate("/discovery")}
            className="text-gray-medium hover:text-black-soft active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-black-soft">Filtros</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-6 space-y-3 pb-32">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setShowCategory(category.id)}
            className="w-full flex items-center gap-4 py-5 px-4 hover:bg-gray-light/50 rounded-lg transition-colors"
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

      {/* Bottom Actions */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-light px-6 pt-4 flex gap-4"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        <Button
          variant="outline"
          onClick={handleClear}
          className="flex-1 h-14 text-lg"
        >
          Limpar
        </Button>
        <Button onClick={handleApply} className="flex-1 h-14 text-lg">
          Aplicar
        </Button>
      </div>
    </div>
  );
};

export default Filters;
