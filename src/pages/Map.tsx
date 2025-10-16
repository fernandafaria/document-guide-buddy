import { Input } from "@/components/ui/input";
import { Search, MapPin, LogOut, Users, History, Heart, User } from "lucide-react";
import Header from "@/components/Header";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapView } from "@/components/MapView";
import { MapControls } from "@/components/MapControls";
import { MapLegend } from "@/components/MapLegend";
import { MapFilters } from "@/components/MapFilters";
import { CheckInConfirmDialog } from "@/components/CheckInConfirmDialog";
import { PlaceSearch } from "@/components/PlaceSearch";

import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";

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

const Map = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [filters, setFilters] = useState({
    bars: true,
    restaurants: true,
    parks: true,
    sports: true,
    activeUsers: true,
  });
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (geoError) {
      toast({
        title: "Localização desativada",
        description: "Mostrando locais próximos de São Paulo. Ative sua localização para ver locais perto de você.",
      });
    }
  }, [geoError]);

  useEffect(() => {
    // Fetch Google Maps API key
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) throw error;
        setGoogleMapsApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
      }
    };
    
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch locations even without geolocation
      if (latitude && longitude) {
        fetchNearbyLocations();
      } else {
        // Use default location (São Paulo) if geolocation is not available
        fetchNearbyLocationsDefault();
      }
      checkUserCheckInStatus();
    }
  }, [latitude, longitude, user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates on locations table
    const channel = supabase
      .channel('locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
        },
        () => {
          if (latitude && longitude) {
            fetchNearbyLocations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, latitude, longitude]);

  const checkUserCheckInStatus = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_check_in')
      .eq('id', user.id)
      .maybeSingle();

    setIsCheckedIn(!!profile?.current_check_in);
  };

  const fetchNearbyLocations = async () => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-nearby-locations', {
        body: { latitude, longitude, radius: 10, limit: 200 },
      });

      if (error) throw error;

      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os locais próximos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyLocationsDefault = async () => {
    // Use São Paulo coordinates as default
    const defaultLat = -23.5505;
    const defaultLng = -46.6333;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-nearby-locations', {
        body: { latitude: defaultLat, longitude: defaultLng, radius: 50, limit: 200 },
      });

      if (error) throw error;

      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os locais próximos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedLocationForCheckIn, setSelectedLocationForCheckIn] = useState<Location | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleCheckInRequest = useCallback((location: Location) => {
    console.log('handleCheckInRequest called with location:', location);
    
    // Validate user is within 100 meters
    if (latitude && longitude) {
      const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
      console.log('Distance to location:', distance, 'meters');
      
      if (distance > 100) {
        toast({
          title: "Muito longe",
          description: "Você precisa estar a no máximo 100 metros do local para fazer check-in.",
          variant: "destructive",
        });
        return;
      }
    } else {
      toast({
        title: "Localização não disponível",
        description: "Ative sua localização para fazer check-in.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedLocationForCheckIn(location);
    setConfirmDialogOpen(true);
    console.log('Dialog should open now');
  }, [latitude, longitude, toast]);

  const handleCheckInConfirm = async () => {
    if (!selectedLocationForCheckIn || !latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Localização não disponível",
        variant: "destructive",
      });
      return;
    }

    try {
      setCheckingIn(true);
      const { data, error } = await supabase.functions.invoke('check-in', {
        body: {
          latitude: selectedLocationForCheckIn.latitude,
          longitude: selectedLocationForCheckIn.longitude,
          name: selectedLocationForCheckIn.name,
          address: selectedLocationForCheckIn.address,
          userLatitude: latitude,
          userLongitude: longitude,
        },
      });

      if (error) throw error;

      toast({
        title: "✨ Check-in realizado!",
        description: `Você está em ${selectedLocationForCheckIn.name}`,
      });

      setIsCheckedIn(true);
      setConfirmDialogOpen(false);
      
      // Small delay for better UX
      setTimeout(() => {
        navigate("/check-in-success");
      }, 300);
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer check-in. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      const { error } = await supabase.functions.invoke('checkout');

      if (error) throw error;

      toast({
        title: "Check-out realizado!",
        description: "Você saiu do local",
      });

      setIsCheckedIn(false);
      fetchNearbyLocations();
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer check-out. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: string, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePlaceSelect = useCallback((place: { lat: number; lng: number; name: string; address?: string }) => {
    setMapCenter({ lat: place.lat, lng: place.lng });
    
    // Calculate distance to validate if within 100 meters
    if (latitude && longitude) {
      const distance = calculateDistance(latitude, longitude, place.lat, place.lng);
      console.log('Distance to searched place:', distance, 'meters');
      
      if (distance <= 100) {
        // Within range - show check-in button
        setSearchMarker(place);
        toast({
          title: "Local encontrado",
          description: `${place.name} está a ${distance.toFixed(0)}m de você. Você pode fazer check-in!`,
        });
      } else {
        // Too far - show marker but inform user
        setSearchMarker(place);
        toast({
          title: "Local muito distante",
          description: `${place.name} está a ${(distance / 1000).toFixed(2)}km de você. Aproxime-se para fazer check-in.`,
          variant: "destructive",
        });
      }
    } else {
      setSearchMarker(place);
    }
    
    // Clear marker after 8 seconds
    setTimeout(() => {
      setSearchMarker(null);
    }, 8000);
  }, [latitude, longitude, toast]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      // Search filter
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Type filters
      const type = location.type;
      
      if (location.active_users_count > 0 && !filters.activeUsers) return false;
      
      if (type === 'bar' || type === 'pub' || type === 'nightclub') {
        return filters.bars;
      }
      if (type === 'restaurant' || type === 'cafe') {
        return filters.restaurants;
      }
      if (type === 'park') {
        return filters.parks;
      }
      if (type === 'sports_centre') {
        return filters.sports;
      }
      
      return true;
    });
  }, [locations, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Controls Header */}
      <div className="px-4 md:px-6 py-3 bg-gradient-header shadow-elevated border-b-0 relative z-10">
        <div className="flex gap-2 justify-end mb-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate('/check-in-history')}
            className="h-10 w-10 text-white hover:bg-white/20"
          >
            <History className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              supabase.auth.signOut();
              navigate('/login');
            }}
            className="h-10 w-10 text-white hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Place Search */}
        {googleMapsApiKey && (
          <PlaceSearch
            onPlaceSelect={handlePlaceSelect}
            googleMapsApiKey={googleMapsApiKey}
          />
        )}

        {isCheckedIn ? (
          <div className="mt-3 flex items-center justify-between bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/30">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint-green animate-pulse-soft"></span>
              Check-in ativo
            </span>
            <Button onClick={handleCheckOut} variant="secondary" size="sm" className="shadow-button">
              <LogOut className="mr-2 h-4 w-4" />
              Check-out
            </Button>
          </div>
        ) : (
          <div className="mt-3 bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-white/50 text-gray-dark">
            Toque em um local do mapa e selecione “Fazer Check-in”.
          </div>
        )}

      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {geoLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <MapView
              locations={filteredLocations}
              userLocation={latitude && longitude ? { latitude, longitude } : null}
              onCheckIn={handleCheckInRequest}
              center={mapCenter}
              searchMarker={searchMarker}
            />
            
            <MapLegend />
            <MapFilters filters={filters} onFilterChange={handleFilterChange} />
            <MapControls
              onZoomIn={() => {
                // Will be implemented in MapView
                console.log('Zoom in');
              }}
              onZoomOut={() => {
                console.log('Zoom out');
              }}
              onCenterUser={() => {
                console.log('Center on user');
              }}
            />

            {/* Acesso rápido ao check-in do local pesquisado */}
            {searchMarker && !confirmDialogOpen && latitude && longitude && (
              (() => {
                const distance = calculateDistance(latitude, longitude, searchMarker.lat, searchMarker.lng);
                const isWithinRange = distance <= 100;
                
                return (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-10 flex flex-col items-center gap-2">
                    {isWithinRange ? (
                      <Button
                        onClick={() =>
                          handleCheckInRequest({
                            id: `search_${searchMarker.lat}_${searchMarker.lng}`,
                            name: searchMarker.name,
                            address: null,
                            latitude: searchMarker.lat,
                            longitude: searchMarker.lng,
                            active_users_count: 0,
                            type: 'other',
                          } as unknown as Location)
                        }
                        className="shadow-button"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Check-in em {searchMarker.name}
                      </Button>
                    ) : (
                      <div className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-4 py-2 rounded-lg shadow-button">
                        <p className="text-sm font-medium">
                          📍 {(distance / 1000).toFixed(2)}km de distância
                        </p>
                        <p className="text-xs opacity-90">
                          Aproxime-se para fazer check-in
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </>
        )}
        
        {/* Check-in Confirmation Dialog */}
        {selectedLocationForCheckIn && (
          <CheckInConfirmDialog
            open={confirmDialogOpen}
            onOpenChange={setConfirmDialogOpen}
            onConfirm={handleCheckInConfirm}
            locationName={selectedLocationForCheckIn.name}
            locationAddress={selectedLocationForCheckIn.address}
            activeUsersCount={selectedLocationForCheckIn.active_users_count}
            locationType={selectedLocationForCheckIn.type}
            isLoading={checkingIn}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Map;
