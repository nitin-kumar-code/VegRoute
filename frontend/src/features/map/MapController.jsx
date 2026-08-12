import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapStore } from '../../context/useMapStore';

/**
 * MapController — The Bridge Between Zustand and Leaflet
 * 
 * Leaflet maintains its OWN internal state (center, zoom) that is completely
 * separate from React's state system. If the Sidebar sets a new `mapCenter`
 * in Zustand, Leaflet won't magically move — something has to call 
 * `map.flyTo()` explicitly.
 * 
 * This component does that. It:
 * 1. Uses `useMap()` — a react-leaflet hook that gives direct access to the 
 *    underlying Leaflet `L.map` instance.
 * 2. Subscribes to Zustand's `mapCenter` and `mapZoom` using selectors.
 * 3. Whenever those values change (e.g., user clicks "Go to restaurant"),
 *    it calls `map.flyTo()` to smoothly animate the camera.
 * 
 * Why a separate component? Because `useMap()` can ONLY be called inside a 
 * child of `<MapContainer>`. You cannot call it in MapPage or App.jsx.
 */
export default function MapController() {
  const map = useMap();
  const mapCenter = useMapStore((state) => state.mapCenter);
  const mapZoom = useMapStore((state) => state.mapZoom);

  useEffect(() => {
    if (mapCenter && mapZoom) {
      map.flyTo(mapCenter, mapZoom, { duration: 1.2 });
    }
  }, [map, mapCenter, mapZoom]);

  return null; // This component renders nothing — it's a pure side-effect bridge
}
