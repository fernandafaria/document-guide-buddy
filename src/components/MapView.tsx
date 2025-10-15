import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { LocationUsersSheet } from './LocationUsersSheet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  active_users_count: number;
  type?: string;
  cuisine?: string;
  opening_hours?: string;
}

interface MapViewProps {
  locations: Location[];
  userLocation: { latitude: number; longitude: number } | null;
  onCheckIn: (location: Location) => void;
}

export const MapView = ({ locations, userLocation, onCheckIn }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; name: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiInitialized, setApiInitialized] = useState(false);
  const { toast } = useToast();

  const defaultCenter: google.maps.LatLngLiteral = userLocation 
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : { lat: -23.5505, lng: -46.6333 };

  // Initialize Google Maps API
  useEffect(() => {
    const initApi = async () => {
      if (apiInitialized) return;

      try {
        console.log('🔧 Fetching Google Maps API key...');
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) {
          console.error('❌ Error fetching API key:', error);
          toast({
            title: "Erro ao carregar mapa",
            description: "Não foi possível obter a chave da API",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const apiKey = data?.apiKey;
        if (!apiKey) {
          console.error('❌ No API key returned');
          setIsLoading(false);
          return;
        }

        console.log('✅ API key obtained, setting options...');
        setOptions({ 
          key: apiKey,
          v: 'weekly'
        });

        setApiInitialized(true);
        console.log('✅ Google Maps API initialized');
      } catch (error) {
        console.error('❌ Error initializing API:', error);
        toast({
          title: "Erro ao carregar mapa",
          description: "Ocorreu um erro ao inicializar o Google Maps",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    initApi();
  }, [apiInitialized, toast]);

  // Create map instance
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current || map.current || !apiInitialized) {
        console.log('⏭️ Skipping map creation:', { 
          hasContainer: !!mapContainer.current, 
          hasMap: !!map.current, 
          apiInitialized 
        });
        return;
      }

      try {
        console.log('🗺️ Loading maps library...');
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        console.log('✅ Maps library loaded');

        console.log('🗺️ Creating map instance at:', defaultCenter);
        map.current = new Map(mapContainer.current, {
          center: defaultCenter,
          zoom: 14,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setIsLoading(false);
        console.log('✅ Map created successfully');
      } catch (error) {
        console.error('❌ Error creating map:', error);
        toast({
          title: "Erro ao criar mapa",
          description: "Ocorreu um erro ao criar o mapa",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    initMap();
  }, [apiInitialized, defaultCenter.lat, defaultCenter.lng, toast]);

  // Update map center when user location changes
  useEffect(() => {
    if (map.current && userLocation) {
      console.log('📍 Updating map center to user location:', userLocation);
      map.current.panTo({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation || isLoading) {
      console.log('⏭️ Skipping user marker:', { 
        hasMap: !!map.current, 
        hasLocation: !!userLocation, 
        isLoading 
      });
      return;
    }

    console.log('👤 Creating user marker at:', userLocation);

    const userMarker = new google.maps.Marker({
      map: map.current,
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      title: 'Você está aqui',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4ECDC4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      zIndex: 2000
    });

    console.log('✅ User marker created');
    markers.current.push(userMarker);

    return () => {
      console.log('🧹 Cleaning up user marker');
      userMarker.setMap(null);
      markers.current = markers.current.filter(m => m !== userMarker);
    };
  }, [userLocation, isLoading]);

  // Add location markers
  useEffect(() => {
    if (!map.current || locations.length === 0 || isLoading) {
      console.log('⏭️ Skipping location markers:', { 
        hasMap: !!map.current, 
        locationCount: locations.length, 
        isLoading 
      });
      return;
    }

    console.log(`📍 Creating ${locations.length} markers...`);
    const newMarkers: google.maps.Marker[] = [];

    locations.forEach((location, index) => {
      if (!map.current) return;
      
      const isPOI = location.type && location.type !== 'user_location';
      const hasActiveUsers = location.active_users_count > 0;
      
      // Determine marker appearance
      let fillColor = '#9b87f5'; // Default POI color
      let scale = 8;
      let label = undefined;
      
      if (hasActiveUsers) {
        fillColor = '#FF5722'; // Active users color
        scale = 12;
        label = {
          text: location.active_users_count.toString(),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        };
      }

      const marker = new google.maps.Marker({
        map: map.current,
        position: { lat: location.latitude, lng: location.longitude },
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: fillColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        label: label,
        zIndex: hasActiveUsers ? 1500 : 1000
      });

      // Simple InfoWindow
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${location.name}</h3>
            ${location.address ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${location.address}</p>` : ''}
            ${hasActiveUsers ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: #FF5722; font-weight: 600;">👥 ${location.active_users_count} ${location.active_users_count === 1 ? 'pessoa' : 'pessoas'}</p>` : ''}
            <button 
              id="checkin-btn-${location.id}" 
              style="width: 100%; padding: 10px; background: linear-gradient(135deg, #FF5722, #E91E63); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"
            >
              Fazer Check-in
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        console.log('📍 Marker clicked:', location.name);
        infoWindow.open(map.current, marker);
        
        // Add click listener to check-in button after InfoWindow opens
        setTimeout(() => {
          const btn = document.getElementById(`checkin-btn-${location.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              console.log('✅ Check-in button clicked for:', location.name);
              onCheckIn(location);
              infoWindow.close();
            });
          }
        }, 100);
      });

      newMarkers.push(marker);
      
      if ((index + 1) % 50 === 0) {
        console.log(`  ✓ Created ${index + 1}/${locations.length} markers`);
      }
    });

    markers.current = [...markers.current, ...newMarkers];
    console.log(`✅ All ${newMarkers.length} markers created successfully`);

    return () => {
      console.log('🧹 Cleaning up location markers');
      newMarkers.forEach(marker => marker.setMap(null));
      markers.current = markers.current.filter(m => !newMarkers.includes(m));
    };
  }, [locations, isLoading, onCheckIn]);

  return (
    <>
      <div 
        ref={mapContainer} 
        className="absolute inset-0 z-0 rounded-lg"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-dark font-medium">Carregando mapa...</p>
          </div>
        </div>
      )}
      {selectedLocation && (
        <LocationUsersSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
        />
      )}
    </>
  );
};
