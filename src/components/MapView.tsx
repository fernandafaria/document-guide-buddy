import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

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
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = 'hsl(var(--primary))';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';

    const userMarker = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2 text-center">
              <p class="font-semibold text-sm">Você está aqui</p>
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
      
      // Determine marker style based on type
      const isPOI = location.type && location.type !== 'user_location';
      const isBar = location.type === 'bar' || location.type === 'pub' || location.type === 'nightclub';
      const isRestaurant = location.type === 'restaurant' || location.type === 'cafe';
      
      el.style.width = isPOI ? '28px' : '32px';
      el.style.height = isPOI ? '28px' : '32px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = isPOI ? '16px' : '12px';
      
      if (isPOI) {
        // POI markers with emoji
        if (isBar) {
          el.textContent = '🍺';
        } else if (isRestaurant) {
          el.textContent = '🍽️';
        } else if (location.type === 'park') {
          el.textContent = '🌳';
        } else if (location.type === 'sports_centre') {
          el.textContent = '⚽';
        } else {
          el.textContent = '📍';
        }
        el.style.backgroundColor = 'white';
      } else {
        // User location markers
        el.style.backgroundColor = 'hsl(var(--destructive))';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.textContent = location.active_users_count.toString();
      }

      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 min-w-[200px]';
      
      let popupHTML = `
        <h3 class="font-bold text-base mb-1">${location.name}</h3>
        ${location.address ? `<p class="text-sm text-gray-600 mb-1">${location.address}</p>` : ''}
      `;
      
      if (isPOI) {
        // POI info
        if (location.cuisine) {
          popupHTML += `<p class="text-sm text-gray-600 mb-1">🍴 ${location.cuisine}</p>`;
        }
        if (location.opening_hours) {
          popupHTML += `<p class="text-sm text-gray-600 mb-2">🕐 ${location.opening_hours}</p>`;
        }
        popupHTML += `<p class="text-sm text-gray-500 mb-3">📍 Ponto de interesse</p>`;
      } else {
        // User location info
        popupHTML += `
          <p class="text-sm mb-3">
            👋 <span class="font-semibold">${location.active_users_count}</span> ${location.active_users_count === 1 ? 'pessoa ativa' : 'pessoas ativas'}
          </p>
        `;
      }
      
      popupContent.innerHTML = popupHTML;

      const button = document.createElement('button');
      button.className = 'w-full inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        Check-in
      `;
      button.onclick = () => onCheckIn(location);
      
      popupContent.appendChild(button);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setDOMContent(popupContent)
        )
        .addTo(map.current);

      markers.current.push(marker);
    });

    return () => {
      // Cleanup handled by main cleanup
    };
  }, [locations, onCheckIn, userLocation]);

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0 z-0 rounded-lg"
    />
  );
};
