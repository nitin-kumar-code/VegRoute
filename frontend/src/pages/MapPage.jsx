import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Navigation } from 'lucide-react';
import LeafletMap from '../features/map/LeafletMap';
import DistancePanel from '../features/map/DistancePanel';
import { useMapStore } from '../context/useMapStore';

export default function MapPage() {
  const setActiveRoute = useMapStore((state) => state.setActiveRoute);
  const activeRoute = useMapStore((state) => state.activeRoute);
  const isNavigating = useMapStore((state) => state.isNavigating);
  const targetRestaurant = useMapStore((state) => state.targetRestaurant);
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [searchParams] = useSearchParams();
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/restaurants/')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        const destId = searchParams.get('destination');
        if (destId) {
          const destRestaurant = data.find(r => r.id === destId);
          if (destRestaurant) {
            handleFindRoute(destRestaurant);
          }
        }
      })
      .catch(err => console.error("Failed to load restaurants:", err));
  }, [searchParams]);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFindRoute = async (restaurant) => {
    setIsCalculating(true);
    setErrorMsg(null);
    useMapStore.getState().setTargetRestaurant(restaurant);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/route/shortest?destination=${restaurant.id}&source=NIT`);
      if (response.ok) {
        const data = await response.json();
        setActiveRoute(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.detail || "Failed to fetch route";
        console.error(errMsg);
        setErrorMsg(errMsg);
        useMapStore.getState().resetRoute();
      }
    } catch (e) {
      console.error("Network error:", e);
      setErrorMsg("Network error trying to contact the backend.");
      useMapStore.getState().resetRoute();
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex-1 flex relative" style={{ height: 'calc(100vh - 64px)' }}>
      {!isNavigating && (
        <div className="w-96 bg-white border-r border-border flex flex-col z-10 relative hidden lg:flex">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-content-primary mb-1">Find Restaurants</h2>
          <p className="text-xs text-content-secondary">Search and navigate to vegetarian spots</p>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-secondary" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-border
                         text-sm text-content-primary placeholder:text-content-secondary/50
                         focus:outline-none focus:ring-2 focus:ring-brand-900/15 focus:border-brand-900/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isCalculating && (
            <div className="p-4 bg-brand-accent/10 border-b border-border/50 text-brand-900 text-sm font-semibold flex items-center justify-center gap-2">
               <div className="animate-spin h-4 w-4 border-2 border-brand-900 border-t-transparent rounded-full" />
               Calculating shortest path...
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-status-error/10 border-b border-status-error/20 text-status-error text-sm font-semibold text-center">
               {errorMsg}
            </div>
          )}
          {filtered.map((r) => {
            const purity = r.pure_veg ? 'pure_veg' : r.jain_available ? 'jain_friendly' : 'veg';
            return (
            <div key={r.id}
              className="p-4 border-b border-border/50 hover:bg-surface-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="text-sm font-semibold text-content-primary leading-snug">{r.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                  purity === 'pure_veg' ? 'bg-status-success/10 text-status-success' :
                  purity === 'jain_friendly' ? 'bg-status-warning/10 text-status-warning' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {purity === 'pure_veg' ? 'Pure Veg' : purity === 'jain_friendly' ? 'Jain' : 'Veg'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-content-secondary mb-3">
                <span>⭐ {r.rating}</span>
                <span>·</span>
                <span>{r.distance ? r.distance : "3.2 km"}</span>
              </div>
              
              {activeRoute && targetRestaurant && targetRestaurant.id === r.id ? (
                <button
                  className="w-full text-xs font-semibold text-white bg-brand-900 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-default"
                >
                  <Navigation size={12} />
                  Route Displayed
                </button>
              ) : (
                <button
                  onClick={() => handleFindRoute(r)}
                  disabled={isCalculating}
                  className="w-full text-xs font-semibold text-brand-900 bg-brand-accent/10 hover:bg-brand-accent/20
                             px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Navigation size={12} />
                  Calculate Route
                </button>
              )}
            </div>
          )})}
        </div>
      </div>
      )}

      <div className="flex-1 relative">
        <DistancePanel />
        <LeafletMap />
      </div>
    </div>
  );
}
