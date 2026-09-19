import { Polyline } from 'react-leaflet';
import { useMapStore } from '../../context/useMapStore';

/**
 * RouteLayer — Clean Navigation Visualization
 * Renders the route polylines cleanly. No graph nodes shown!
 */
export default function RouteLayer() {
  const activeRoute = useMapStore((state) => state.activeRoute);
  const isNavigating = useMapStore((state) => state.isNavigating);
  const navState = useMapStore((state) => state.navState);

  if (!activeRoute) return null;

  // When not navigating, just show the whole route cleanly.
  if (!isNavigating) {
    const routeCoords = activeRoute.map((node) => [node.lat, node.lng]);
    return (
      <>
        {/* Route shadow glow */}
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: '#007AFF', weight: 8, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }}
        />
        {/* Route main line */}
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: '#007AFF', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
        />
      </>
    );
  }

  // When navigating, show travelled vs remaining
  const travelledCoords = navState.travelledRoute.map(n => [n.lat, n.lng]);
  const remainingCoords = navState.remainingRoute.map(n => [n.lat, n.lng]);

  return (
    <>
      {/* Travelled Route (Grey/Faded) */}
      {travelledCoords.length > 1 && (
        <Polyline
          positions={travelledCoords}
          pathOptions={{ color: '#9CA3AF', weight: 5, opacity: 0.8, lineCap: 'round', lineJoin: 'round', dashArray: '5, 10' }}
        />
      )}

      {/* Remaining Route (Active Blue) */}
      {remainingCoords.length > 1 && (
        <>
          <Polyline
            positions={remainingCoords}
            pathOptions={{ color: '#007AFF', weight: 8, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }}
          />
          <Polyline
            positions={remainingCoords}
            pathOptions={{ color: '#007AFF', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
          />
        </>
      )}
    </>
  );
}
