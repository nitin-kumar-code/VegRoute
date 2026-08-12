import { useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import LeafletMap from '../features/map/LeafletMap';
import DistancePanel from '../features/map/DistancePanel';
import { useMapStore } from '../context/useMapStore';
import { MOCK_RESTAURANTS } from '../features/restaurants/restaurantData';

/**
 * MapPage — Full-screen professional navigation interface.
 * Left floating panel with search/restaurant list + right map area.
 */
export default function MapPage() {
  const setActiveRoute = useMapStore((state) => state.setActiveRoute);
  const activeRoute = useMapStore((state) => state.activeRoute);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_RESTAURANTS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFindRoute = (restaurant) => {
    setActiveRoute({
      route: ['N_001', 'N_003', 'N_005', 'N_007', restaurant.nearest_node],
      visited_nodes: ['N_001', 'N_020', 'N_003', 'N_012', 'N_005', 'N_015', 'N_007', restaurant.nearest_node],
    });
  };

  return (
    <div className="flex-1 flex relative" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Left Sidebar Panel */}
      <div className="w-96 bg-white border-r border-border flex flex-col z-10 relative hidden lg:flex">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-content-primary mb-1">Find Restaurants</h2>
          <p className="text-xs text-content-secondary">Search and navigate to vegetarian spots</p>
        </div>

        {/* Search */}
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

        {/* Restaurant List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((r) => (
            <div key={r.id}
              className="p-4 border-b border-border/50 hover:bg-surface-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="text-sm font-semibold text-content-primary leading-snug">{r.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                  r.purity === 'pure_veg' ? 'bg-status-success/10 text-status-success' :
                  r.purity === 'jain_friendly' ? 'bg-status-warning/10 text-status-warning' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {r.purity === 'pure_veg' ? 'Pure Veg' : r.purity === 'jain_friendly' ? 'Jain' : 'Veg'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-content-secondary mb-3">
                <span>⭐ {r.rating}</span>
                <span>·</span>
                <span>{r.cuisine}</span>
                <span>·</span>
                <span>{r.distance}</span>
              </div>
              <button
                onClick={() => handleFindRoute(r)}
                className="w-full text-xs font-semibold text-brand-900 bg-brand-accent/10 hover:bg-brand-accent/20
                           px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation size={12} />
                Calculate Route
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <DistancePanel />
        <LeafletMap />
      </div>
    </div>
  );
}
