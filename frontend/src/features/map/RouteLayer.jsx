import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { useMapStore } from '../../context/useMapStore';

/**
 * RouteLayer — Renders the Dijkstra algorithm output on the map.
 * Color language:
 *   - #B8C5BB (graph-edge): Unvisited
 *   - #12372A (graph-node/brand-900): Currently processing
 *   - #A8D66D (brand-light): Visited/explored
 *   - #7CB342 (brand-accent): Final shortest path
 */

export default function RouteLayer() {
  const activeRoute = useMapStore((state) => state.activeRoute);
  const visitedNodes = useMapStore((state) => state.visitedNodes);

  // routeCoords should be an array of [lat, lng] arrays for Polyline
  const routeCoords = activeRoute
    ? activeRoute.map((node) => [node.lat, node.lng])
    : [];

  const visitedCoords = visitedNodes
    ? visitedNodes.map((node) => ({ id: node.id, coords: [node.lat, node.lng] }))
    : [];

  if (routeCoords.length === 0 && visitedCoords.length === 0) return null;

  return (
    <>
      {/* Visited nodes — lime green circles */}
      {visitedCoords.map((node, index) => (
        <CircleMarker
          key={`visited-${node.id}`}
          center={node.coords}
          radius={5}
          pathOptions={{
            color: '#A8D66D',
            fillColor: '#A8D66D',
            fillOpacity: 0.7,
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} permanent={false}>
            <span style={{ fontSize: '11px', fontFamily: 'Inter, system-ui' }}>
              Step {index + 1}: <strong>{node.id}</strong>
            </span>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Route shadow glow */}
      {routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: '#7CB342', weight: 10, opacity: 0.25, lineCap: 'round', lineJoin: 'round' }}
        />
      )}

      {/* Route main line */}
      {routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: '#7CB342', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
        />
      )}
    </>
  );
}
