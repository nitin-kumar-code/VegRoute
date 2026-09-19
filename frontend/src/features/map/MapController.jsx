import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapStore } from '../../context/useMapStore';
import L from 'leaflet';

export default function MapController() {
  const map = useMap();
  const mapCenter = useMapStore((state) => state.mapCenter);
  const mapZoom = useMapStore((state) => state.mapZoom);
  const activeRoute = useMapStore((state) => state.activeRoute);

  useEffect(() => {
    if (mapCenter && mapZoom) {
      map.flyTo(mapCenter, mapZoom, { duration: 1.2 });
    }
  }, [map, mapCenter, mapZoom]);

  // When a new route is calculated, fit the map bounds to show the entire path!
  useEffect(() => {
    if (activeRoute && activeRoute.length > 0) {
      const latlngs = activeRoute.map(node => [node.lat, node.lng]);
      const bounds = L.latLngBounds(latlngs);
      
      // Calculate padding based on screen size (prevent UI overlap)
      const paddingOptions = window.innerWidth > 1024 
        ? { paddingBottomRight: [50, 50], paddingTopLeft: [450, 50] } // Sidebar is on the left
        : { paddingBottomRight: [50, 150], paddingTopLeft: [50, 50] }; // DistancePanel is at the bottom

      map.flyToBounds(bounds, { duration: 1.5, ...paddingOptions });
    }
  }, [map, activeRoute]);

  return null;
}
