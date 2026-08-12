import { useState } from 'react';
import { Search } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import FilterPill from '../components/ui/FilterPill';
import RestaurantCard from '../features/restaurants/RestaurantCard';
import { MOCK_RESTAURANTS } from '../features/restaurants/restaurantData';

const FILTERS = ['All', 'Pure Veg', 'South Indian', 'North Indian', 'Jain', 'Budget', 'Highly Rated'];

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_RESTAURANTS.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Pure Veg') return matchesSearch && r.purity === 'pure_veg';
    if (activeFilter === 'Jain') return matchesSearch && r.purity === 'jain_friendly';
    if (activeFilter === 'South Indian') return matchesSearch && r.cuisine === 'South Indian';
    if (activeFilter === 'North Indian') return matchesSearch && r.cuisine === 'North Indian';
    if (activeFilter === 'Budget') return matchesSearch && r.price === '₹';
    if (activeFilter === 'Highly Rated') return matchesSearch && r.rating >= 4.3;
    return matchesSearch;
  });

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

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map((f) => (
            <FilterPill
              key={f}
              label={f}
              active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            />
          ))}
        </div>

        {/* Restaurant Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
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
