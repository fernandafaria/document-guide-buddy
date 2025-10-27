import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
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
  location_id?: string;
  type?: string;
  cuisine?: string;
  opening_hours?: string;
}

interface MapViewProps {
  locations: Location[];
  userLocation: { latitude: number; longitude: number } | null;
  onCheckIn: (location: Location) => void;
  center?: { lat: number; lng: number } | null;
  searchMarker?: { lat: number; lng: number; name: string } | null;
  currentCheckInLocationId?: string | null;
  currentCheckInCoords?: { lat: number; lng: number } | null;
}

export const MapView = React.memo(({ locations, userLocation, onCheckIn, center, searchMarker, currentCheckInLocationId, currentCheckInCoords }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const currentInfoWindow = useRef<google.maps.InfoWindow | null>(null);
  const markerClusterer = useRef<MarkerClusterer | null>(null);
  const initialViewSetRef = useRef(false);
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; name: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiInitialized, setApiInitialized] = useState(false);
  const { toast } = useToast();

  const defaultCenter: google.maps.LatLngLiteral = useMemo(() => 
    center || (userLocation 
      ? { lat: userLocation.latitude, lng: userLocation.longitude }
      : { lat: -23.5505, lng: -46.6333 }),
    [center, userLocation]
  );

  // Initialize Google Maps API
  useEffect(() => {
    const initApi = async () => {
      if (apiInitialized) return;

      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) {
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
          setIsLoading(false);
          return;
        }

        setOptions({
          key: apiKey,
          v: 'weekly'
        });

        setApiInitialized(true);
      } catch (error) {
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
      console.log('📍 Updating map view to user location (<=500m radius):', userLocation);
      const center = { lat: userLocation.latitude, lng: userLocation.longitude };
      if (!initialViewSetRef.current) {
        map.current.setCenter(center);
        map.current.setZoom(16); // ~500m view
        initialViewSetRef.current = true;
      } else {
        map.current.panTo(center);
      }
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

  // Add location markers with clustering
  useEffect(() => {
    if (!map.current || locations.length === 0 || isLoading) {
      return;
    }

    console.log(`📍 Creating ${locations.length} markers with clustering...`);
    
    // Clear existing clusterer
    if (markerClusterer.current) {
      markerClusterer.current.clearMarkers();
    }

    // Clear existing location markers (keep user marker)
    const userMarkerColor = '#4ECDC4';
    const existingUserMarkers: google.maps.Marker[] = [];
    
    markers.current.forEach(marker => {
      const icon = marker.getIcon();
      if (icon && typeof icon === 'object' && 'fillColor' in icon && icon.fillColor === userMarkerColor) {
        existingUserMarkers.push(marker);
      } else {
        marker.setMap(null);
      }
    });
    markers.current = existingUserMarkers;

    const newMarkers: google.maps.Marker[] = [];

    // Create all markers at once
    locations.forEach((location) => {
      if (!map.current) return;
      
      // Check if this is the current check-in location using location_id only
      let isCurrentCheckIn = false;
      if (currentCheckInLocationId) {
        isCurrentCheckIn = (location.location_id === currentCheckInLocationId || 
          `${location.latitude.toFixed(6)}_${location.longitude.toFixed(6)}` === currentCheckInLocationId);
      }

      const hasActiveUsers = location.active_users_count > 0;
      
      const marker = new google.maps.Marker({
        map: map.current,
        position: { lat: location.latitude, lng: location.longitude },
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isCurrentCheckIn ? 12 : 8,
          fillColor: isCurrentCheckIn ? '#FF8C00' : '#9b87f5',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        label: undefined,
        zIndex: isCurrentCheckIn ? 2000 : (hasActiveUsers ? 1500 : 1000)
      });

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
        // Close previous InfoWindow if exists
        if (currentInfoWindow.current) {
          currentInfoWindow.current.close();
        }
        
        infoWindow.open(map.current, marker);
        currentInfoWindow.current = infoWindow;
        
        setTimeout(() => {
          const btn = document.getElementById(`checkin-btn-${location.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              onCheckIn(location);
              infoWindow.close();
              currentInfoWindow.current = null;
            });
          }
        }, 100);
      });

      newMarkers.push(marker);
    });

    // Initialize marker clusterer
    markerClusterer.current = new MarkerClusterer({
      map: map.current,
      markers: newMarkers,
      algorithmOptions: {
        maxZoom: 15,
      },
      renderer: {
        render: ({ count, position }) => {
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: '#9b87f5',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 3
            },
            label: {
              text: String(count),
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold'
            },
            zIndex: 1000,
          });
        }
      }
    });

    markers.current = [...markers.current, ...newMarkers];
    console.log(`✅ Created ${newMarkers.length} markers with clustering`);

    return () => {
      if (markerClusterer.current) {
        markerClusterer.current.clearMarkers();
      }
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [locations, isLoading, currentCheckInLocationId, currentCheckInCoords]);

  // Handle map center changes
  useEffect(() => {
    if (map.current && center) {
      map.current.setCenter(center);
      map.current.setZoom(16);
    }
  }, [center]);

  // Handle search marker
  useEffect(() => {
    if (!map.current) return;

    // Remove previous search marker
    if (searchMarkerRef.current) {
      searchMarkerRef.current.setMap(null);
      searchMarkerRef.current = null;
    }

    // Add new search marker
    if (searchMarker) {
      searchMarkerRef.current = new google.maps.Marker({
        map: map.current,
        position: { lat: searchMarker.lat, lng: searchMarker.lng },
        title: searchMarker.name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 180,
        },
        zIndex: 2000,
        animation: google.maps.Animation.BOUNCE,
      });

      // Stop animation after 2 seconds
      setTimeout(() => {
        if (searchMarkerRef.current) {
          searchMarkerRef.current.setAnimation(null);
        }
      }, 2000);
    }

    return () => {
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
      }
    };
  }, [searchMarker]);

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
});
