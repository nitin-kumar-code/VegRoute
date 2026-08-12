import { Link } from 'react-router-dom';
import { MapPin, Route as RouteIcon, Network, Search, Leaf, Navigation, Clock, Star, GitBranch, ArrowRight, Microscope } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import RestaurantCard from '../features/restaurants/RestaurantCard';
import { MOCK_RESTAURANTS } from '../features/restaurants/restaurantData';

/**
 * LandingPage — The premium first impression of VegRoute.
 * Warm off-white background, forest green accents, no glassmorphism.
 * Composed of: Hero → Features → Restaurant Preview → How It Works → About
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ====== HERO SECTION ====== */}
      <section className="section-container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="animate-fade-in-up">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider
                             text-brand-accent bg-brand-accent/10 px-3 py-1.5 rounded-full mb-6">
              Agartala's Veggie Route
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-content-primary leading-tight mb-6">
              Find your next{' '}
              <span className="text-brand-900">vegetarian destination.</span>
            </h1>

            <p className="text-lg text-content-secondary leading-relaxed mb-8 max-w-lg">
              Discover vegetarian restaurants around Agartala and find the shortest route 
              to your table using graph-based navigation.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Link to="/explore" className="btn-primary text-base flex items-center gap-2">
                <Search size={18} />
                Explore Restaurants
              </Link>
              <Link to="/map" className="btn-secondary text-base flex items-center gap-2">
                <MapPin size={18} />
                Open Map
              </Link>
            </div>

            <p className="text-sm text-content-secondary flex items-center gap-1.5">
              <Network size={14} className="text-brand-accent" />
              Powered by Graph Algorithms
            </p>
          </div>

          {/* Right: Stylized Map/Graph Visual */}
          <div className="hidden lg:block relative animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Background Grid */}
              <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Road grid */}
                <line x1="80" y1="100" x2="320" y2="100" stroke="#B8C5BB" strokeWidth="2" />
                <line x1="80" y1="200" x2="320" y2="200" stroke="#B8C5BB" strokeWidth="2" />
                <line x1="80" y1="300" x2="320" y2="300" stroke="#B8C5BB" strokeWidth="2" />
                <line x1="100" y1="80" x2="100" y2="320" stroke="#B8C5BB" strokeWidth="2" />
                <line x1="200" y1="80" x2="200" y2="320" stroke="#B8C5BB" strokeWidth="2" />
                <line x1="300" y1="80" x2="300" y2="320" stroke="#B8C5BB" strokeWidth="2" />
                
                {/* Route highlight */}
                <polyline points="100,300 100,200 200,200 200,100 300,100" 
                          stroke="#7CB342" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                          strokeDasharray="8,4" />
                
                {/* Intersection nodes */}
                <circle cx="100" cy="100" r="6" fill="#B8C5BB" />
                <circle cx="200" cy="100" r="8" fill="#12372A" stroke="white" strokeWidth="3" />
                <circle cx="300" cy="100" r="8" fill="#7CB342" stroke="white" strokeWidth="3" />
                <circle cx="100" cy="200" r="6" fill="#A8D66D" />
                <circle cx="200" cy="200" r="6" fill="#A8D66D" />
                <circle cx="300" cy="200" r="6" fill="#B8C5BB" />
                <circle cx="100" cy="300" r="10" fill="#12372A" stroke="white" strokeWidth="3" />
                <circle cx="200" cy="300" r="6" fill="#B8C5BB" />
                <circle cx="300" cy="300" r="6" fill="#B8C5BB" />
                
                {/* Start label */}
                <text x="100" y="340" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12372A">START</text>
                
                {/* Restaurant icon at destination */}
                <text x="300" y="85" textAnchor="middle" fontSize="16">🍽️</text>
              </svg>

              {/* Floating Route Card */}
              <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-lg border border-border p-4 w-48">
                <div className="text-xs text-content-secondary mb-1">Shortest Route</div>
                <div className="text-xl font-bold text-brand-900 mb-0.5">2.4 km</div>
                <div className="flex items-center gap-2 text-sm text-content-secondary">
                  <Clock size={13} />
                  <span>8 min</span>
                  <span className="text-brand-accent">• Dijkstra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES / TRUST SECTION ====== */}
      <section className="section-container py-16 md:py-20">
        <SectionHeading
          badge="Why VegRoute"
          title="Smart navigation for vegetarian diners"
          subtitle="Built on real graph algorithms, not generic map APIs."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={GitBranch}
            number="01"
            label="Graph-Based Routing"
            description="Find efficient routes using shortest-path algorithms on Agartala's real road network."
          />
          <StatCard
            icon={Leaf}
            number="02"
            label="Vegetarian Focused"
            description="Discover restaurants specifically suited for vegetarian and Jain dietary preferences."
          />
          <StatCard
            icon={MapPin}
            number="03"
            label="Local Discovery"
            description="Built around real restaurants and verified routes in Agartala, Tripura."
          />
          <StatCard
            icon={Microscope}
            number="04"
            label="Algorithm Transparency"
            description="See how BFS, DFS, and Dijkstra actually explore the graph, step by step."
          />
        </div>
      </section>

      {/* ====== RESTAURANT PREVIEW ====== */}
      <section className="bg-surface-secondary py-16 md:py-20">
        <div className="section-container">
          <SectionHeading
            badge="Explore"
            title="Vegetarian spots in Agartala"
            subtitle="Find the right place based on distance, rating, cuisine, and budget."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_RESTAURANTS.slice(0, 3).map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/explore" className="btn-secondary inline-flex items-center gap-2">
              View All Restaurants <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="section-container py-16 md:py-20">
        <SectionHeading
          badge="How It Works"
          title="From location to destination"
          subtitle="A 4-step journey powered by graph theory."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-graph-edge z-0" />
          
          {[
            { step: '01', icon: MapPin, title: 'Choose Location', desc: 'Select your starting point on the map or use GPS.' },
            { step: '02', icon: Search, title: 'Select Restaurant', desc: 'Browse and pick a vegetarian destination.' },
            { step: '03', icon: Network, title: 'Build Graph', desc: 'The road network loads as a weighted graph in memory.' },
            { step: '04', icon: Navigation, title: 'Find Shortest Path', desc: 'Dijkstra computes the optimal route instantly.' },
          ].map((item) => (
            <div key={item.step} className="relative z-10 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-900 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                <item.icon size={20} />
              </div>
              <span className="text-xs font-semibold text-brand-accent">{item.step}</span>
              <h3 className="text-base font-semibold text-content-primary mt-1 mb-1.5">{item.title}</h3>
              <p className="text-sm text-content-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====== ABOUT / ACADEMIC SECTION ====== */}
      <section className="bg-brand-900 text-white py-16 md:py-20">
        <div className="section-container text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider
                           text-brand-light/70 bg-white/10 px-3 py-1.5 rounded-full mb-6">
            Academic Foundation
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built with Graph Theory</h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            VegRoute models Agartala's road network as a weighted graph. 
            Locations are vertices, roads are edges, and travel time is the edge weight.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center text-sm font-medium">
            {['Weighted Graph', 'Adjacency List', 'Dijkstra\'s Algorithm', 'Shortest Path'].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                <span className="bg-white/10 px-4 py-2 rounded-xl text-brand-light">{item}</span>
                {i < 3 && <ArrowRight size={16} className="text-white/30 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
