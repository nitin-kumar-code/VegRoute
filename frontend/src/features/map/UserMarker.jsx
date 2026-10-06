import { useEffect } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../context/useMapStore';

const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative; width:20px; height:20px;">
      <div style="
        width: 16px; height: 16px; 
        background: #007AFF; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 0 12px rgba(0,122,255,0.5);
        position: absolute; top: 0; left: 0;
        z-index: 2;
      "></div>
      <div style="
        width: 40px; height: 40px; 
        background: rgba(0,122,255,0.2); 
        border-radius: 50%; 
        position: absolute; top: -12px; left: -12px;
        animation: pulse 2s ease-out infinite;
        z-index: 1;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function UserMarker() {
  const userLocation = useMapStore(state => state.userLocation);
  const userAccuracy = useMapStore(state => state.userAccuracy);
  const isNavigating = useMapStore(state => state.isNavigating);
  const updateUserLocation = useMapStore(state => state.updateUserLocation);
  const setNavError = useMapStore(state => state.setNavError);
  const setLiveRoute = useMapStore(state => state.setLiveRoute);
  const targetRestaurant = useMapStore(state => state.targetRestaurant);
  const navStatus = useMapStore(state => state.navState.status);

  useEffect(() => {
    if (!isNavigating || navStatus !== 'locating') return undefined;
    if (!navigator.geolocation) {
      setNavError('Unable to obtain your current location. Please enable location services and try again.');
      return undefined;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng, accuracy } = position.coords;
      updateUserLocation(lat, lng, accuracy);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/route/shortest?destination=${encodeURIComponent(targetRestaurant.id)}&lat=${lat}&lng=${lng}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || 'Unable to calculate a route from your current location.');
        setLiveRoute(data, lat, lng, accuracy);
      } catch (error) {
        setNavError(error.message || 'Unable to calculate a route from your current location.');
      }
    }, (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'Location access is required for live navigation.'
        : 'Unable to obtain your current location. Please enable location services and try again.';
      setNavError(message);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
  }, [isNavigating, navStatus, targetRestaurant, setNavError, setLiveRoute, updateUserLocation]);

  useEffect(() => {
    if (!isNavigating || navStatus !== 'navigating' || !navigator.geolocation) return undefined;
    const watchId = navigator.geolocation.watchPosition(
      (position) => updateUserLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy),
      (error) => {
        console.warn('Geolocation error:', error.message);
        if (error.code === error.PERMISSION_DENIED) setNavError('Location access is required for live navigation.');
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, navStatus, updateUserLocation, setNavError]);

  if (!userLocation) return null;

  return (
    <>
      <Marker position={userLocation} icon={userIcon} zIndexOffset={1000}>
        <Popup>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: '13px' }}>
            <strong>📍 Your Location</strong><br />
            Accuracy: ~{Math.round(userAccuracy)}m
          </div>
        </Popup>
      </Marker>
      {isNavigating && userAccuracy < 100 && (
        <Circle
          center={userLocation}
          radius={userAccuracy}
          pathOptions={{ color: '#007AFF', fillColor: '#007AFF', fillOpacity: 0.1, weight: 1 }}
        />
      )}
    </>
  );
}
