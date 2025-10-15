import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  active_users_count: number;
}

interface MapViewProps {
  locations: Location[];
  userLocation: { latitude: number; longitude: number } | null;
  onCheckIn: (location: Location) => void;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.setView([lat, lng], 13);
  return null;
}

export const MapView = ({ locations, userLocation, onCheckIn }: MapViewProps) => {
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude] 
    : [-23.5505, -46.6333]; // São Paulo as default

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {userLocation && (
        <>
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-sm">Você está aqui</p>
              </div>
            </Popup>
          </Marker>
          <RecenterMap lat={userLocation.latitude} lng={userLocation.longitude} />
        </>
      )}

      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-base mb-1">{location.name}</h3>
              {location.address && (
                <p className="text-sm text-gray-600 mb-2">{location.address}</p>
              )}
              <p className="text-sm mb-3">
                👋 <span className="font-semibold">{location.active_users_count}</span> {location.active_users_count === 1 ? 'pessoa ativa' : 'pessoas ativas'}
              </p>
              <button
                onClick={() => onCheckIn(location)}
                className="w-full inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Check-in
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
