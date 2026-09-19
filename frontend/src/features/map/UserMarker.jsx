import { useEffect } from 'react';
import { Marker, Popup, Circle, useMap } from 'react-leaflet';
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
  const map = useMap();
  const userLocation = useMapStore(state => state.userLocation);
  const userAccuracy = useMapStore(state => state.userAccuracy);
  const isNavigating = useMapStore(state => state.isNavigating);
  const updateUserLocation = useMapStore(state => state.updateUserLocation);
  const setNavError = useMapStore(state => state.setNavError);

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Use a high-accuracy watcher for navigation
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateUserLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setNavError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updateUserLocation, setNavError]);

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
