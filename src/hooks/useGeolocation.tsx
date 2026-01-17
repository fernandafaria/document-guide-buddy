import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

const getErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permissão de localização negada. Ative nas configurações do seu dispositivo.';
    case error.POSITION_UNAVAILABLE:
      return 'Localização indisponível. Verifique se o GPS está ativado.';
    case error.TIMEOUT:
      return 'Tempo esgotado ao obter localização. Tente novamente.';
    default:
      return 'Erro ao obter localização. Tente novamente.';
  }
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    permissionDenied: false,
  });

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      error: null,
      loading: false,
      permissionDenied: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setLocation({
      latitude: null,
      longitude: null,
      error: getErrorMessage(error),
      loading: false,
      permissionDenied: error.code === error.PERMISSION_DENIED,
    });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocalização não é suportada pelo seu navegador',
        loading: false,
        permissionDenied: false,
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000, // Cache position for 1 minute
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      options
    );

    // Watch for position changes
    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      handleError,
      {
        ...options,
        maximumAge: 30000, // More frequent updates when watching
      }
    );

    // Cleanup on unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [updatePosition, handleError]);

  return location;
};
