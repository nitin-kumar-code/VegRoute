import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import FilterPill from '../components/ui/FilterPill';
import RestaurantCard from '../features/restaurants/RestaurantCard';
import { useMapStore } from '../context/useMapStore';

const FILTERS = ['All', 'Pure Veg', 'Veg Friendly', 'Jain', 'North Indian', 'South Indian', 'Bengali', 'Tripuri', 'Budget', 'Mid-range', 'Highly Rated', 'Open Now'];
const SORTS = ['Default', 'Nearest', 'Highest Rated', 'Most Reviewed', 'Lowest Price', 'Name A-Z'];

export default function ExplorePage() {
  const restaurants = useMapStore((state) => state.restaurants);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Default');
  const [searchQuery, setSearchQuery] = useState('');

  // useMemo ensures we only recalculate filtering and sorting when the dependencies change
  const processedRestaurants = useMemo(() => {
    // 1. FILTERING LOGIC
    let results = restaurants.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const purity = r.pure_veg ? 'pure_veg' : r.jain_available ? 'jain_friendly' : 'veg';

      switch (activeFilter) {
        case 'Pure Veg': return purity === 'pure_veg';
        case 'Veg Friendly': return purity === 'veg';
        case 'Jain': return purity === 'jain_friendly';
        case 'South Indian': return r.south_indian;
        case 'North Indian': return r.north_indian;
        case 'Bengali': return r.bengali_tripuri;
        case 'Tripuri': return r.bengali_tripuri;
        case 'Budget': return r.price?.toLowerCase() === 'budget' || r.price === '₹';
        case 'Mid-range': return r.price?.toLowerCase() === 'mid-range' || r.price === '₹₹';
        case 'Highly Rated': return r.rating >= 4.3;
        case 'Open Now': return true; // Mock implementation for Open Now
        default: return true; // 'All'
      }
    });

    // 2. SORTING LOGIC
    results.sort((a, b) => {
      switch (activeSort) {
        case 'Nearest':
          return (a.distance_value || 0) - (b.distance_value || 0);
        case 'Highest Rated':
          return (b.rating || 0) - (a.rating || 0);
        case 'Most Reviewed':
          return (b.rating_count || 0) - (a.rating_count || 0);
        case 'Lowest Price':
          return (a.price ? a.price.length : 0) - (b.price ? b.price.length : 0);
        case 'Name A-Z':
          return a.name.localeCompare(b.name);
        default:
          return 0; // 'Default' maintains original array order
      }
    });

    return results;
  }, [restaurants, activeFilter, activeSort, searchQuery]);

  return (
    <div className="min-h-screen py-12">
      <div className="section-container">
        <SectionHeading
          badge="Discover"
          title="Explore vegetarian spots in Agartala"
          subtitle="Find the right place based on distance, rating, cuisine, and budget."
        />

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-secondary" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-border
                         text-content-primary placeholder:text-content-secondary/50
                         focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900/30
                         transition-all text-sm"
            />
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="bg-surface-secondary/50 rounded-2xl p-6 mb-10 border border-border">
          <div className="mb-6">
            <h4 className="text-xs font-bold text-content-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Filter By
            </h4>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <FilterPill
                  key={f}
                  label={f}
                  active={activeFilter === f}
                  onClick={() => setActiveFilter(f)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-content-secondary uppercase tracking-wider mb-3">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <FilterPill
                  key={s}
                  label={s}
                  active={activeSort === s}
                  onClick={() => setActiveSort(s)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Restaurant Grid */}
        {processedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-content-secondary">
            <p className="text-lg">No restaurants found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
