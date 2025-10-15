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
    : { lat: -23.5505, lng: -46.6333 }; // São Paulo as default

  // Initialize Google Maps API
  useEffect(() => {
    const initApi = async () => {
      if (apiInitialized) return;

      try {
        console.log('Fetching Google Maps API key...');
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) {
          console.error('Error fetching Google Maps API key:', error);
          toast({
            title: "Erro ao carregar mapa",
            description: "Não foi possível obter a chave da API do Google Maps",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const apiKey = data?.apiKey;
        if (!apiKey) {
          console.error('No API key returned');
          setIsLoading(false);
          return;
        }

        console.log('Setting Google Maps options...');
        setOptions({ 
          key: apiKey,
          v: 'weekly'
        });

        setApiInitialized(true);
        console.log('Google Maps API initialized');
      } catch (error) {
        console.error('Error initializing Google Maps API:', error);
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
      if (!mapContainer.current || map.current || !apiInitialized) return;

      try {
        console.log('Loading maps and marker libraries...');
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        await importLibrary('marker');
        console.log('Google Maps libraries loaded');

        console.log('Creating map instance...');
        map.current = new Map(mapContainer.current, {
          center: defaultCenter,
          zoom: 13,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false, // Disable native POI clicks
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }] // Hide all POIs
            }
          ]
        });

        setIsLoading(false);
        console.log('Google Maps created successfully');
      } catch (error) {
        console.error('Error creating map:', error);
        toast({
          title: "Erro ao criar mapa",
          description: "Ocorreu um erro ao criar a instância do mapa",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      // no-op cleanup; keep map instance across re-renders
      // Markers are cleaned up by their own effects
    };
  }, [apiInitialized]);

  // Update map center when user location changes
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.panTo({ lat: userLocation.latitude, lng: userLocation.longitude });
      map.current.setZoom(13);
    }
  }, [userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    console.log('Creating user location marker...');

    // Create user marker with custom icon
    const userMarker = new google.maps.Marker({
      map: map.current,
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      title: 'Você está aqui',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#4ECDC4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      zIndex: 1000
    });

    // Create InfoWindow for user location
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-4 text-center">
          <div class="text-3xl mb-2">📍</div>
          <p class="font-semibold text-base text-gray-dark">Você está aqui</p>
          <p class="text-xs text-gray-medium mt-1">Sua localização atual</p>
        </div>
      `
    });

    // Add click listener to marker
    userMarker.addListener('click', () => {
      console.log('User marker clicked');
      infoWindow.open(map.current, userMarker);
    });

    markers.current.push(userMarker);

    return () => {
      userMarker.setMap(null);
    };
  }, [userLocation, isLoading]);

  // Add location markers
  useEffect(() => {
    if (!map.current || locations.length === 0) return;

    console.log(`Creating ${locations.length} location markers...`);

    // Clear existing location markers (keep user marker)
    const userMarkerCount = userLocation ? 1 : 0;
    while (markers.current.length > userMarkerCount) {
      const marker = markers.current.pop();
      if (marker) marker.setMap(null);
    }

    locations.forEach((location, index) => {
      if (!map.current) return;
      
      const isPOI = location.type && location.type !== 'user_location';
      const isBar = location.type === 'bar' || location.type === 'pub' || location.type === 'nightclub';
      const isRestaurant = location.type === 'restaurant' || location.type === 'cafe';
      
      // Determine icon/label for marker
      let markerIcon;
      let markerLabel;
      
      if (isPOI) {
        // POI markers with emoji labels
        let emoji = '📍';
        if (isBar) emoji = '🍺';
        else if (isRestaurant) emoji = '🍽️';
        else if (location.type === 'park') emoji = '🌳';
        else if (location.type === 'sports_centre') emoji = '⚽';
        
        markerLabel = {
          text: emoji,
          fontSize: '24px',
          fontFamily: 'Arial'
        };
        markerIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#ffffff',
          fillOpacity: 1,
          strokeColor: '#9b87f5',
          strokeWeight: 3
        };
      } else {
        // User location markers with count
        markerLabel = {
          text: location.active_users_count.toString(),
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 'bold'
        };
        markerIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 22,
          fillColor: '#FF5722',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        };
      }

      const popupContent = document.createElement('div');
      popupContent.className = 'overflow-hidden';
      
      let popupHTML = '';
      
      if (isPOI) {
        // POI popup with beautiful design
        let categoryColor = 'hsl(var(--primary))';
        let categoryIcon = '📍';
        let categoryName = 'Local';
        
        if (isBar) {
          categoryColor = 'hsl(var(--lavender))';
          categoryIcon = '🍺';
          categoryName = 'Bar/Pub';
        } else if (isRestaurant) {
          categoryColor = 'hsl(var(--turquoise))';
          categoryIcon = '🍽️';
          categoryName = 'Restaurante';
        } else if (location.type === 'park') {
          categoryColor = 'hsl(var(--mint-green))';
          categoryIcon = '🌳';
          categoryName = 'Parque';
        } else if (location.type === 'sports_centre') {
          categoryColor = 'hsl(var(--yellow-soft))';
          categoryIcon = '⚽';
          categoryName = 'Centro Esportivo';
        }
        
        popupHTML = `
          <div class="p-5">
            <div class="flex items-start gap-3 mb-3">
              <div class="text-4xl">${categoryIcon}</div>
              <div class="flex-1">
                <h3 class="font-bold text-lg text-gray-dark mb-1">${location.name}</h3>
                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full" 
                      style="background: ${categoryColor}20; color: ${categoryColor};">
                  ${categoryName}
                </span>
              </div>
            </div>
            ${location.address ? `
              <div class="flex items-center gap-2 text-sm text-gray-medium mb-2">
                <span>📍</span>
                <span>${location.address}</span>
              </div>
            ` : ''}
            ${location.cuisine ? `
              <div class="flex items-center gap-2 text-sm text-gray-medium mb-2">
                <span>🍴</span>
                <span>${location.cuisine}</span>
              </div>
            ` : ''}
            ${location.opening_hours ? `
              <div class="flex items-center gap-2 text-sm text-gray-medium mb-3">
                <span>🕐</span>
                <span class="text-xs">${location.opening_hours}</span>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // User location popup with vibrant design
        popupHTML = `
          <div class="p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center justify-center w-12 h-12 rounded-full text-2xl"
                   style="background: linear-gradient(135deg, hsl(var(--coral-vibrant)), hsl(var(--pink-deep)));">
                👋
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-lg text-gray-dark mb-1">${location.name}</h3>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold rounded-full bg-gradient-primary text-white">
                    <span>${location.active_users_count}</span>
                    <span>${location.active_users_count === 1 ? 'pessoa' : 'pessoas'}</span>
                  </span>
                </div>
              </div>
            </div>
            ${location.address ? `
              <div class="flex items-center gap-2 text-sm text-gray-medium mb-3">
                <span>📍</span>
                <span>${location.address}</span>
              </div>
            ` : ''}
          </div>
        `;
      }
      
      popupContent.innerHTML = popupHTML;

      const button = document.createElement('button');
      button.className = 'checkin-button w-full flex items-center justify-center gap-2 px-5 py-4 text-base font-semibold transition-all border-t hover:opacity-90';
      button.style.cssText = `
        background: linear-gradient(135deg, hsl(var(--coral-vibrant)), hsl(var(--pink-deep)));
        color: white;
        border: none;
        cursor: pointer;
      `;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>Fazer Check-in</span>
      `;
      
      popupContent.appendChild(button);

      // Add "Ver Pessoas" button if there are active users
      if (location.active_users_count && location.active_users_count > 0) {
        const viewUsersButton = document.createElement('button');
        viewUsersButton.className = 'view-users-button w-full flex items-center justify-center gap-2 px-5 py-4 text-base font-semibold transition-all border-t hover:opacity-90';
        viewUsersButton.style.cssText = `
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
          color: white;
          border: none;
          cursor: pointer;
        `;
        viewUsersButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Ver ${location.active_users_count} ${location.active_users_count === 1 ? 'Pessoa' : 'Pessoas'}</span>
        `;
        
        popupContent.appendChild(viewUsersButton);
      }

      const infoWindow = new google.maps.InfoWindow({
        content: popupContent,
        maxWidth: 320
      });

      // Add event listeners after InfoWindow is created
      google.maps.event.addListener(infoWindow, 'domready', () => {
        const checkinBtn = popupContent.querySelector('.checkin-button');
        if (checkinBtn) {
          checkinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Check-in button clicked for:', location.name);
            onCheckIn(location);
            infoWindow.close();
          });
        }

        const viewBtn = popupContent.querySelector('.view-users-button');
        if (viewBtn) {
          viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('View users button clicked for:', location.name);
            setSelectedLocation({ id: location.id, name: location.name });
            setSheetOpen(true);
            infoWindow.close();
          });
        }
      });

      // Create marker with classic google.maps.Marker
      const marker = new google.maps.Marker({
        map: map.current,
        position: { lat: location.latitude, lng: location.longitude },
        title: location.name,
        icon: markerIcon,
        label: markerLabel,
        zIndex: isPOI ? 900 : 1000
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        console.log('Marker clicked:', location.name);
        infoWindow.open(map.current, marker);
      });

      markers.current.push(marker);
    });

    return () => {
      // Cleanup handled by main cleanup
    };
  }, [locations, onCheckIn, userLocation, isLoading]);

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
