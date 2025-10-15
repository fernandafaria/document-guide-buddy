import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PlaceSearchProps {
  onPlaceSelect: (place: { lat: number; lng: number; name: string; address?: string }) => void;
  googleMapsApiKey: string;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const PlaceSearch = ({ onPlaceSelect, googleMapsApiKey }: PlaceSearchProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize Google Places services
    if (googleMapsApiKey && window.google?.maps) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div');
      const map = new google.maps.Map(dummyDiv);
      placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [googleMapsApiKey]);

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim() || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    try {
      const request = {
        input: searchQuery,
        componentRestrictions: { country: "br" }, // Restrict to Brazil
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          setLoading(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions as PlaceSuggestion[]);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error("Error searching places:", error);
      setLoading(false);
      setSuggestions([]);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const handlePlaceSelect = async (placeId: string) => {
    if (!placesService.current) return;

    setLoading(true);
    
    try {
      const request = {
        placeId,
        fields: ['name', 'geometry', 'formatted_address'],
      };

      placesService.current.getDetails(request, (place, status) => {
        setLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = place.geometry.location;
          
          onPlaceSelect({
            lat: location.lat(),
            lng: location.lng(),
            name: place.name || "",
            address: place.formatted_address,
          });

          setQuery(place.name || "");
          setShowSuggestions(false);
          setSuggestions([]);

          toast({
            title: "Local encontrado!",
            description: `Navegando para ${place.name}`,
          });
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível encontrar este local",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error getting place details:", error);
      setLoading(false);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar o local",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-medium pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar lugares..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-10 h-12 text-base bg-white shadow-md border-gray-light focus:border-coral"
        />
        {query && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto z-50 shadow-lg">
          <div className="p-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handlePlaceSelect(suggestion.place_id)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-light transition-colors flex items-start gap-3"
              >
                <MapPin className="h-5 w-5 text-coral flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black-soft truncate">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-gray-medium truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Click outside to close */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};
