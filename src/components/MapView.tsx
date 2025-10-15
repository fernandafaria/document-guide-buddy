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
  const markers = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
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
        console.log('Loading maps library...');
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        
        console.log('Loading marker library...');
        const { AdvancedMarkerElement } = await importLibrary('marker') as google.maps.MarkerLibrary;
        
        // Store AdvancedMarkerElement in window for later use
        (window as any).AdvancedMarkerElement = AdvancedMarkerElement;

        console.log('Creating map instance...');
        map.current = new Map(mapContainer.current, {
          center: defaultCenter,
          zoom: 13,
          mapId: 'YO_MAP', // Required for AdvancedMarkerElement
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy'
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
      // Clean up markers
      markers.current.forEach(marker => {
        marker.map = null;
      });
      markers.current = [];
      map.current = null;
    };
  }, [apiInitialized, defaultCenter, toast]);

  // Update map center when user location changes
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.panTo({ lat: userLocation.latitude, lng: userLocation.longitude });
      map.current.setZoom(13);
    }
  }, [userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation || isLoading) return;

    const AdvancedMarkerElement = (window as any).AdvancedMarkerElement;
    if (!AdvancedMarkerElement) return;

    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, hsl(var(--turquoise)), hsl(var(--mint-green)));
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(78, 205, 196, 0.4);
      cursor: pointer;
      position: relative;
      animation: pulse-soft 2s ease-in-out infinite;
    `;
    
    // Add inner dot
    const innerDot = document.createElement('div');
    innerDot.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: white;
    `;
    el.appendChild(innerDot);

    const userMarker = new AdvancedMarkerElement({
      map: map.current,
      position: { lat: userLocation.latitude, lng: userLocation.longitude },
      content: el,
      title: 'Você está aqui'
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

    el.addEventListener('click', () => {
      infoWindow.open(map.current, userMarker);
    });

    markers.current.push(userMarker);

    return () => {
      userMarker.map = null;
    };
  }, [userLocation, isLoading]);

  // Add location markers
  useEffect(() => {
    if (!map.current || locations.length === 0 || isLoading) return;

    const AdvancedMarkerElement = (window as any).AdvancedMarkerElement;
    if (!AdvancedMarkerElement) return;

    // Clear existing location markers (keep user marker)
    const userMarkerCount = userLocation ? 1 : 0;
    while (markers.current.length > userMarkerCount) {
      const marker = markers.current.pop();
      if (marker) marker.map = null;
    }

    locations.forEach((location) => {
      if (!map.current) return;

      const el = document.createElement('div');
      el.className = 'location-marker';
      
      const isPOI = location.type && location.type !== 'user_location';
      const isBar = location.type === 'bar' || location.type === 'pub' || location.type === 'nightclub';
      const isRestaurant = location.type === 'restaurant' || location.type === 'cafe';
      
      if (isPOI) {
        // POI markers with modern design
        el.style.cssText = `
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          border: 3px solid hsl(var(--primary));
          box-shadow: var(--shadow-marker);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          transition: var(--transition-smooth);
        `;
        
        if (isBar) {
          el.textContent = '🍺';
          el.style.borderColor = 'hsl(var(--lavender))';
        } else if (isRestaurant) {
          el.textContent = '🍽️';
          el.style.borderColor = 'hsl(var(--turquoise))';
        } else if (location.type === 'park') {
          el.textContent = '🌳';
          el.style.borderColor = 'hsl(var(--mint-green))';
        } else if (location.type === 'sports_centre') {
          el.textContent = '⚽';
          el.style.borderColor = 'hsl(var(--yellow-soft))';
        } else {
          el.textContent = '📍';
        }
        
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.15)';
          el.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = 'var(--shadow-marker)';
        });
      } else {
        // User location markers with gradient
        el.style.cssText = `
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(var(--coral-vibrant)), hsl(var(--pink-deep)));
          border: 3px solid white;
          box-shadow: var(--shadow-elevated);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          transition: var(--transition-smooth);
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        el.textContent = location.active_users_count.toString();
        
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.15)';
          el.style.boxShadow = '0 8px 32px rgba(255, 87, 34, 0.4)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = 'var(--shadow-elevated)';
        });
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
        viewUsersButton.className = 'w-full flex items-center justify-center gap-2 px-5 py-4 text-base font-semibold transition-all border-t hover:opacity-90';
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
        
        viewUsersButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedLocation({ id: location.id, name: location.name });
          setSheetOpen(true);
          infoWindow.close();
        };
        
        popupContent.appendChild(viewUsersButton);
      }

      const infoWindow = new google.maps.InfoWindow({
        content: popupContent,
        maxWidth: 320
      });

      // Add event listener after InfoWindow is created
      google.maps.event.addListener(infoWindow, 'domready', () => {
        const checkinBtn = popupContent.querySelector('.checkin-button');
        if (checkinBtn) {
          checkinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Check-in button clicked (via domready) for:', location.name);
            onCheckIn(location);
            infoWindow.close();
          });
        }
      });

      const marker = new AdvancedMarkerElement({
        map: map.current,
        position: { lat: location.latitude, lng: location.longitude },
        content: el,
        title: location.name
      });

      el.addEventListener('click', () => {
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
