import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface MapFiltersProps {
  filters: {
    bars: boolean;
    restaurants: boolean;
    parks: boolean;
    sports: boolean;
    activeUsers: boolean;
  };
  onFilterChange: (key: string, value: boolean) => void;
}

export const MapFilters = ({ filters, onFilterChange }: MapFiltersProps) => {
  const [open, setOpen] = useState(false);

  const filterItems = [
    { key: 'bars', icon: '🍺', label: 'Bares/Pubs' },
    { key: 'restaurants', icon: '🍽️', label: 'Restaurantes' },
    { key: 'parks', icon: '🌳', label: 'Parques' },
    { key: 'sports', icon: '⚽', label: 'Centros Esportivos' },
  ];

  return (
    <>
      {/* Desktop: Card com filtros */}
      <Card className="hidden md:block absolute top-4 right-4 z-20 p-4 shadow-lg w-64">
        <h3 className="text-sm font-semibold mb-3">Filtros</h3>
        <div className="space-y-3">
          {filterItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <Label htmlFor={`filter-${item.key}`} className="text-sm cursor-pointer">
                {item.icon} {item.label}
              </Label>
              <Switch
                id={`filter-${item.key}`}
                checked={filters[item.key as keyof typeof filters]}
                onCheckedChange={(checked) => onFilterChange(item.key, checked)}
              />
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3">
            <Label htmlFor="filter-users" className="text-sm font-semibold cursor-pointer">
              👥 Check-ins Ativos
            </Label>
            <Switch
              id="filter-users"
              checked={filters.activeUsers}
              onCheckedChange={(checked) => onFilterChange('activeUsers', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Mobile: Botão flutuante + Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="md:hidden absolute top-4 right-4 z-20 h-12 w-12 rounded-full shadow-lg bg-white hover:bg-gray-100 text-black-soft"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">Filtros do Mapa</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Filtros de locais */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-medium uppercase tracking-wide">
                Tipos de Locais
              </h4>
              {filterItems.map((item) => (
                <div 
                  key={item.key} 
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-light/50 transition-colors"
                >
                  <Label 
                    htmlFor={`filter-mobile-${item.key}`} 
                    className="text-lg cursor-pointer flex items-center gap-3 flex-1"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Label>
                  <Switch
                    id={`filter-mobile-${item.key}`}
                    checked={filters[item.key as keyof typeof filters]}
                    onCheckedChange={(checked) => onFilterChange(item.key, checked)}
                    className="scale-125"
                  />
                </div>
              ))}
            </div>

            {/* Check-ins ativos */}
            <div className="pt-4 border-t border-gray-light">
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-coral/5">
                <Label 
                  htmlFor="filter-mobile-users" 
                  className="text-lg font-semibold cursor-pointer flex items-center gap-3 flex-1"
                >
                  <span className="text-2xl">👥</span>
                  <span>Check-ins Ativos</span>
                </Label>
                <Switch
                  id="filter-mobile-users"
                  checked={filters.activeUsers}
                  onCheckedChange={(checked) => onFilterChange('activeUsers', checked)}
                  className="scale-125"
                />
              </div>
            </div>

            {/* Botão de aplicar */}
            <Button 
              className="w-full h-14 text-lg"
              onClick={() => setOpen(false)}
            >
              Aplicar Filtros
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
