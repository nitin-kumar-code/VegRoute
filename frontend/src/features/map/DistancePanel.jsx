import { Navigation, MapPin, X, Clock } from 'lucide-react';
import { useMapStore } from '../../context/useMapStore';

/**
 * DistancePanel — Floating route info card with the new brand styling.
 */
export default function DistancePanel() {
  const activeRoute = useMapStore((state) => state.activeRoute);
  const visitedNodes = useMapStore((state) => state.visitedNodes);
  const resetRoute = useMapStore((state) => state.resetRoute);

  if (!activeRoute) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]
                    bg-white border border-border rounded-2xl shadow-lg
                    px-6 py-4 flex items-center gap-5 text-sm">
      <div className="flex items-center gap-2 text-brand-900">
        <Navigation size={16} className="text-brand-accent" />
        <span className="font-semibold">{activeRoute.length} stops</span>
      </div>
      <div className="w-px h-5 bg-border" />
      <div className="flex items-center gap-2 text-content-secondary">
        <MapPin size={16} className="text-brand-light" />
        <span>{visitedNodes.length} nodes explored</span>
      </div>
      <div className="w-px h-5 bg-border" />
      <div className="flex items-center gap-2 text-content-secondary">
        <Clock size={16} />
        <span>Dijkstra</span>
      </div>
      <button
        onClick={resetRoute}
        className="ml-1 p-1.5 rounded-full hover:bg-status-error/10 transition-colors cursor-pointer"
        title="Clear route"
      >
        <X size={14} className="text-content-secondary hover:text-status-error" />
      </button>
    </div>
  );
}
