import { MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Location {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  active_users_count: number;
  distance?: number;
  type?: string;
}

interface TopLocationsCardProps {
  locations: Location[];
  onLocationClick: (location: Location) => void;
}

export const TopLocationsCard = ({ locations, onLocationClick }: TopLocationsCardProps) => {
  // Filter locations with active users and sort by active_users_count
  const topLocations = locations
    .filter(loc => loc.active_users_count > 0)
    .sort((a, b) => b.active_users_count - a.active_users_count)
    .slice(0, 5);

  if (topLocations.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-24 left-4 z-10 w-80 bg-background/95 backdrop-blur-sm border-border shadow-elevated">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Locais mais populares
        </h3>
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {topLocations.map((location, index) => (
              <button
                key={location.id}
                onClick={() => onLocationClick(location)}
                className="w-full text-left p-3 rounded-lg bg-card hover:bg-accent transition-colors border border-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-bold text-primary">#{index + 1}</span>
                      <p className="font-medium truncate text-foreground">{location.name}</p>
                    </div>
                    {location.address && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {location.address}
                      </p>
                    )}
                    {location.distance !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {location.distance < 1000 
                          ? `${Math.round(location.distance)}m de você` 
                          : `${(location.distance / 1000).toFixed(1)}km de você`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {location.active_users_count}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
