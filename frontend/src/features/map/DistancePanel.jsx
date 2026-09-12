import { Navigation, MapPin, X, Clock } from 'lucide-react';
import { useMapStore } from '../../context/useMapStore';

/**
 * DistancePanel — Floating route info card with the new brand styling.
 */
export default function DistancePanel() {
  const activeRoute = useMapStore((state) => state.activeRoute);
  const visitedNodes = useMapStore((state) => state.visitedNodes);
  const routeInfo = useMapStore((state) => state.routeInfo);
  const targetRestaurant = useMapStore((state) => state.targetRestaurant);
  const resetRoute = useMapStore((state) => state.resetRoute);

  if (!activeRoute) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]
                    bg-white border border-border rounded-2xl shadow-lg
                    px-6 py-4 flex flex-col gap-3 text-sm min-w-[300px]">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <div className="flex flex-col">
          <span className="text-xs text-content-secondary uppercase font-bold tracking-wider">From</span>
          <span className="font-semibold text-brand-900">NIT Agartala</span>
        </div>
        <Navigation size={14} className="text-content-secondary/50 mx-4" />
        <div className="flex flex-col text-right">
          <span className="text-xs text-content-secondary uppercase font-bold tracking-wider">To</span>
          <span className="font-semibold text-brand-900">{targetRestaurant?.name || 'Destination'}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-content-primary">
            <Navigation size={14} className="text-brand-accent" />
            <span className="font-semibold">{routeInfo?.distance?.toFixed(1) || '0.0'} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-content-primary">
            <Clock size={14} className="text-brand-light" />
            <span className="font-semibold">{Math.ceil((routeInfo?.time || 0) / 60)} min</span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-6 text-xs text-content-secondary">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{visitedNodes.length} nodes explored</span>
          </div>
          <span className="bg-brand-accent/10 text-brand-900 px-2 py-0.5 rounded text-[10px] font-bold">Dijkstra</span>
        </div>

        <button
          onClick={resetRoute}
          className="ml-4 p-1.5 rounded-full hover:bg-status-error/10 transition-colors cursor-pointer shrink-0"
          title="Clear route"
        >
          <X size={14} className="text-content-secondary hover:text-status-error" />
        </button>
      </div>
    </div>
  );
}
