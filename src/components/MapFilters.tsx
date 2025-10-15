import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  return (
    <Card className="absolute top-4 right-4 z-20 p-4 shadow-lg w-64">
      <h3 className="text-sm font-semibold mb-3">Filtros</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="filter-bars" className="text-sm cursor-pointer">
            🍺 Bares/Pubs
          </Label>
          <Switch
            id="filter-bars"
            checked={filters.bars}
            onCheckedChange={(checked) => onFilterChange('bars', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="filter-restaurants" className="text-sm cursor-pointer">
            🍽️ Restaurantes
          </Label>
          <Switch
            id="filter-restaurants"
            checked={filters.restaurants}
            onCheckedChange={(checked) => onFilterChange('restaurants', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="filter-parks" className="text-sm cursor-pointer">
            🌳 Parques
          </Label>
          <Switch
            id="filter-parks"
            checked={filters.parks}
            onCheckedChange={(checked) => onFilterChange('parks', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="filter-sports" className="text-sm cursor-pointer">
            ⚽ Centros Esportivos
          </Label>
          <Switch
            id="filter-sports"
            checked={filters.sports}
            onCheckedChange={(checked) => onFilterChange('sports', checked)}
          />
        </div>
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
  );
};
