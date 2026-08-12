import { useState, useEffect } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

/**
 * UserMarker — GPS position marker with pulsing animation and accuracy circle.
 * Updated to use brand-900 deep green instead of blue.
 */

const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative; width:20px; height:20px;">
      <div style="
        width: 16px; height: 16px; 
        background: #12372A; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 0 12px rgba(18,55,42,0.5);
        position: absolute; top: 0; left: 0;
      "></div>
      <div style="
        width: 40px; height: 40px; 
        background: rgba(18,55,42,0.12); 
        border-radius: 50%; 
        position: absolute; top: -12px; left: -12px;
        animation: pulse 2s ease-out infinite;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function UserMarker() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
      },
      (err) => console.warn('Geolocation error:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!position) return null;

  return (
    <>
      <Marker position={position} icon={userIcon}>
        <Popup>
          <div style={{ fontFamily: 'Inter, system-ui', fontSize: '13px' }}>
            <strong>📍 Your Location</strong><br />
            Accuracy: ~{Math.round(accuracy)}m
          </div>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{ color: '#12372A', fillColor: '#12372A', fillOpacity: 0.06, weight: 1 }}
      />
    </>
  );
}
