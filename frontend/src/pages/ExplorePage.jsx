import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import FilterPill from '../components/ui/FilterPill';
import RestaurantCard from '../features/restaurants/RestaurantCard';
import { MOCK_RESTAURANTS } from '../features/restaurants/restaurantData';

const FILTERS = ['All', 'Pure Veg', 'South Indian', 'North Indian', 'Jain', 'Budget (₹)', 'Highly Rated (4.3+)'];
const SORTS = ['Default', 'Nearest', 'Highest Rated', 'Cheapest'];

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Default');
  const [searchQuery, setSearchQuery] = useState('');

  // useMemo ensures we only recalculate filtering and sorting when the dependencies change
  const processedRestaurants = useMemo(() => {
    // 1. FILTERING LOGIC
    let results = MOCK_RESTAURANTS.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'Pure Veg': return r.purity === 'pure_veg';
        case 'Jain': return r.purity === 'jain_friendly';
        case 'South Indian': return r.cuisine === 'South Indian';
        case 'North Indian': return r.cuisine === 'North Indian';
        case 'Budget (₹)': return r.price === '₹';
        case 'Highly Rated (4.3+)': return r.rating >= 4.3;
        default: return true; // 'All'
      }
    });

    // 2. SORTING LOGIC
    results.sort((a, b) => {
      switch (activeSort) {
        case 'Nearest':
          // Extract float from strings like "1.2 km"
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'Highest Rated':
          // Descending order for rating
          return b.rating - a.rating;
        case 'Cheapest':
          // Compare price string length ('₹' < '₹₹' < '₹₹₹')
          return a.price.length - b.price.length;
        default:
          return 0; // 'Default' maintains original array order
      }
    });

    return results;
  }, [activeFilter, activeSort, searchQuery]);

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
