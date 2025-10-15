import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { LocationUsersSheet } from './LocationUsersSheet';

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
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; name: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.longitude, userLocation.latitude] 
    : [-46.6333, -23.5505]; // São Paulo as default (lng, lat)

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: defaultCenter,
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      // Clean up markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Remove map
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map center when user location changes
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13,
        essential: true
      });
    }
  }, [userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

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

    const userMarker = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 30, closeButton: false })
          .setHTML(`
            <div class="p-4 text-center">
              <div class="text-3xl mb-2">📍</div>
              <p class="font-semibold text-base text-gray-dark">Você está aqui</p>
              <p class="text-xs text-gray-medium mt-1">Sua localização atual</p>
            </div>
          `)
      )
      .addTo(map.current);

    markers.current.push(userMarker);

    return () => {
      userMarker.remove();
    };
  }, [userLocation]);

  // Add location markers
  useEffect(() => {
    if (!map.current || locations.length === 0) return;

    // Clear existing location markers (keep user marker)
    const userMarkerCount = userLocation ? 1 : 0;
    while (markers.current.length > userMarkerCount) {
      markers.current.pop()?.remove();
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
      button.className = 'w-full flex items-center justify-center gap-2 px-5 py-4 text-base font-semibold transition-all border-t hover:opacity-90';
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
      
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCheckIn(location);
      };
      
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
          popup.remove();
        };
        
        popupContent.appendChild(viewUsersButton);
      }
      

      const popup = new maplibregl.Popup({ 
        offset: 30,
        maxWidth: '320px',
        closeButton: true,
        closeOnClick: false,
        className: 'modern-popup'
      }).setDOMContent(popupContent);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });

    return () => {
      // Cleanup handled by main cleanup
    };
  }, [locations, onCheckIn, userLocation]);

  return (
    <>
      <div 
        ref={mapContainer} 
        className="absolute inset-0 z-0 rounded-lg"
      />
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
