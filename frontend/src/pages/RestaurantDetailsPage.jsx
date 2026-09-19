import { useParams, Link } from 'react-router-dom';
import { useMapStore } from '../context/useMapStore';
import { MapPin, Navigation, Star, Clock, Info, ShieldCheck, Leaf } from 'lucide-react';
import restaurantImages from '../features/restaurants/data/restaurantImages';
import { useState } from 'react';

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const restaurants = useMapStore((state) => state.restaurants);
  
  const restaurant = restaurants.find(r => r.id === id);

  const [imageError, setImageError] = useState(false);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Restaurant not found.</p>
      </div>
    );
  }

  const purity = restaurant.pure_veg ? 'pure_veg' : restaurant.jain_available ? 'jain_friendly' : 'veg';
  const isJainVerified = purity === 'pure_veg' && (restaurant.name === 'Swastik Veg' || restaurant.name === 'JAGANNATHS PRASADAM');
  const cuisine = restaurant.south_indian ? 'South Indian' : restaurant.north_indian ? 'North Indian' : restaurant.bengali_tripuri ? 'Bengali' : 'Indian';

  const imageUrl = restaurantImages[restaurant.id] || restaurant.image || '/assets/restaurants/fallback.jpg';

  return (
    <div className="min-h-screen py-12 bg-surface-warm">
      <div className="section-container max-w-4xl">
        <Link to="/explore" className="text-sm font-semibold text-brand-900 mb-6 inline-flex items-center gap-2 hover:underline">
          &larr; Back to Explore
        </Link>
        
        {/* Header Image */}
        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-sm">
          {!imageError ? (
            <img src={imageUrl} alt={restaurant.name} onError={() => setImageError(true)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-secondary flex items-center justify-center text-content-secondary/30">
              <MapPin size={64} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${purity === 'pure_veg' ? 'bg-status-success text-white' : 'bg-status-warning text-white'}`}>
                {purity === 'pure_veg' ? 'Pure Veg' : 'Veg Friendly'}
              </span>
              <span className="flex items-center gap-1 text-sm bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                <Star size={14} className="text-status-warning fill-status-warning" />
                {restaurant.rating} ({restaurant.rating_count || 0} reviews)
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">{restaurant.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-8">
            <section className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info size={20} className="text-brand-900" /> About
              </h2>
              <p className="text-content-secondary leading-relaxed mb-4">
                {restaurant.description || "Not available"}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {cuisine.split(' / ').map(c => (
                  <span key={c} className="bg-brand-accent/10 text-brand-900 px-3 py-1 rounded-full text-sm font-medium">
                    {c}
                  </span>
                ))}
                {restaurant.other_cuisines && restaurant.other_cuisines.split(',').map(c => (
                  <span key={c} className="bg-brand-accent/10 text-brand-900 px-3 py-1 rounded-full text-sm font-medium">
                    {c.trim ? c.trim() : c}
                  </span>
                ))}
              </div>
              
              <div className="bg-surface-secondary/50 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck size={20} className={isJainVerified ? "text-status-success" : "text-status-warning"} />
                <div>
                  <h4 className="font-semibold text-sm">Jain Options</h4>
                  <p className="text-sm text-content-secondary">
                    {isJainVerified ? "Verified no onion/garlic options available." : "Not verified"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="card p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin size={18} className="text-content-secondary shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{restaurant.address || 'Not specified'}</div>
                    <div className="text-xs text-content-secondary mt-1">{restaurant.locality || 'Agartala'}</div>
                    <div className="text-xs text-content-secondary mt-1">Graph Node: {restaurant.nearest_node_id}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock size={18} className="text-content-secondary shrink-0" />
                  <div className="text-sm font-semibold whitespace-pre-wrap">{restaurant.opening_hours || 'Not specified'}</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-[18px] text-center font-bold text-content-secondary shrink-0">₹</div>
                  <div className="text-sm font-semibold">{restaurant.price || 'Mid-range'}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link to={`/map?destination=${restaurant.id}`} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Navigation size={18} />
                  Route from NIT Agartala
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
