import { Navigation, MapPin, X, Clock, ArrowLeft, LocateFixed } from 'lucide-react';
import { useMapStore } from '../../context/useMapStore';

export default function DistancePanel() {
  const activeRoute = useMapStore((state) => state.activeRoute);
  const routeInfo = useMapStore((state) => state.routeInfo);
  const rawRouteData = useMapStore((state) => state.rawRouteData);
  const resetRoute = useMapStore((state) => state.resetRoute);
  
  const isNavigating = useMapStore((state) => state.isNavigating);
  const navState = useMapStore((state) => state.navState);
  const startNavigation = useMapStore((state) => state.startNavigation);
  const stopNavigation = useMapStore((state) => state.stopNavigation);
  const recenterOnUser = useMapStore((state) => state.recenterOnUser);
  const locationError = navState.error;

  if (!activeRoute || !rawRouteData) return null;

  if (isNavigating) {
    if (navState.status === 'arrived') {
      return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]
                        bg-status-success text-white border border-status-success/20 rounded-2xl shadow-xl
                        px-8 py-6 flex flex-col items-center gap-2 min-w-[320px]">
          <h2 className="text-xl font-bold">You have arrived at {rawRouteData.destination.name} 🎉</h2>
          <p className="text-sm opacity-90">Your route is complete.</p>
          <button
            onClick={stopNavigation}
            className="mt-4 px-6 py-2 bg-white text-status-success rounded-xl font-semibold hover:bg-surface-warm transition-colors"
          >
            Exit Navigation
          </button>
        </div>
      );
    }

    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
        {/* Top Floating Instruction could go here, but prompt asked for a bottom panel mainly, let's build the integrated panel */}
        <div className="bg-brand-900 text-white rounded-t-2xl shadow-xl px-6 py-4 flex items-center gap-4">
          <button onClick={stopNavigation} className="hover:opacity-100 transition-opacity">
            <ArrowLeft size={24} className="opacity-80" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{rawRouteData.destination.name}</h2>
          </div>
        </div>
        
        <div className="bg-white border-x border-b border-border rounded-b-2xl shadow-xl px-6 py-5">
          <div className="flex justify-between items-end mb-5">
            <div>
              <div className="text-3xl font-extrabold text-brand-900">
                {navState.status === 'locating' ? 'Locating…' : `${navState.remainingDistanceKm.toFixed(2)} km`}
              </div>
              <div className="text-lg font-semibold text-status-warning mt-1">
                ~{navState.remainingTimeMin} min
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={recenterOnUser}
              className="flex-1 flex items-center justify-center gap-2 bg-surface-secondary text-brand-900 font-semibold py-3 rounded-xl hover:bg-surface-secondary/80 transition-colors"
            >
              <LocateFixed size={18} />
              Recenter
            </button>
            <button
              onClick={stopNavigation}
              className="flex-1 flex items-center justify-center gap-2 bg-status-error/10 text-status-error font-semibold py-3 rounded-xl hover:bg-status-error/20 transition-colors"
            >
              <X size={18} />
              Exit
            </button>
          </div>
          
          {locationError && (
            <div className="mt-4 p-3 bg-status-warning/10 text-status-warning text-xs font-semibold rounded-lg text-center">
              {locationError} The route preview is still available; press Exit to return to it.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]
                    bg-white border border-border rounded-2xl shadow-lg
                    px-6 py-5 flex flex-col gap-4 text-sm min-w-[340px]">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] text-content-secondary uppercase font-bold tracking-wider mb-0.5">Start</span>
          <span className="font-semibold text-content-primary">{rawRouteData.source.name}</span>
        </div>
        <Navigation size={14} className="text-brand-light mx-4" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-content-secondary uppercase font-bold tracking-wider mb-0.5">Destination</span>
          <span className="font-semibold text-brand-900">{rawRouteData.destination.name}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <div className="text-xl font-bold text-content-primary">
            {routeInfo?.distance?.toFixed(2) || '0.00'} km
          </div>
          <div className="text-sm font-semibold text-brand-accent mt-0.5">
            ~{Math.ceil((routeInfo?.time || 0) / 60)} min
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={resetRoute}
            className="p-2 rounded-xl hover:bg-surface-secondary text-content-secondary transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
          <button
            onClick={startNavigation}
            className="px-5 py-2.5 bg-brand-900 text-white rounded-xl font-semibold shadow-md hover:bg-brand-900/90 transition-colors flex items-center gap-2"
          >
            <Navigation size={16} />
            START
          </button>
        </div>
      </div>
    </div>
  );
}
