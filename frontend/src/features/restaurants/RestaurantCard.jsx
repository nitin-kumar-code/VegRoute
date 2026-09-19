import React, { useState } from 'react';
import { Star, MapPin, Clock, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import restaurantImages, { restaurantImagePositions } from './data/restaurantImages';

const PURITY_BADGE = {
  pure_veg: { label: 'Pure Veg', color: 'bg-status-success text-white shadow-sm border border-status-success/20' },
  jain_friendly: { label: 'Jain Friendly', color: 'bg-status-warning text-white shadow-sm border border-status-warning/20' },
  veg: { label: 'Veg', color: 'bg-blue-600 text-white shadow-sm border border-blue-600/20' },
};

const RestaurantCard = React.memo(function RestaurantCard({ restaurant }) {
  const purity = restaurant.pure_veg ? 'pure_veg' : restaurant.jain_available ? 'jain_friendly' : 'veg';
  const badge = PURITY_BADGE[purity] || PURITY_BADGE.pure_veg;
  const cuisine = restaurant.south_indian ? 'South Indian' : restaurant.north_indian ? 'North Indian' : restaurant.bengali_tripuri ? 'Bengali' : 'Indian';

  const [imageError, setImageError] = useState(false);
  const imageUrl = restaurantImages[restaurant.id] || restaurant.image || '/assets/restaurants/fallback.jpg';
  const objectPosition = restaurantImagePositions[restaurant.id] || 'center';

  return (
    <div className="card overflow-hidden group">
      {/* Image */}
      <div className="relative h-44 bg-surface-secondary overflow-hidden">
        {!imageError ? (
          <img 
            src={imageUrl} 
            alt={restaurant.name}
            loading="lazy"
            onError={() => setImageError(true)}
            style={{ objectPosition }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-content-secondary/30">
            <MapPin size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        {/* Purity Badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
        {/* Status */}
        <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-status-success">
          <span className="inline-block w-1.5 h-1.5 bg-status-success rounded-full mr-1.5 align-middle" />
          Open
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-content-primary mb-1.5 group-hover:text-brand-900 transition-colors">
          {restaurant.name}
        </h3>

        <div className="flex items-center gap-3 text-sm text-content-secondary mb-3">
          <span className="flex items-center gap-1">
            <Star size={14} className="text-status-warning fill-status-warning" />
            {restaurant.rating}
          </span>
          <span>•</span>
          <span>{cuisine}</span>
          <span>•</span>
          <span>{restaurant.price?.toLowerCase() === 'budget' ? '₹' : restaurant.price?.toLowerCase() === 'mid-range' ? '₹₹' : (restaurant.price || '₹₹')}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-content-secondary mb-4">
          <Navigation size={12} />
          <span>{restaurant.distance || '1.2 km'}</span>
          <span className="mx-1">·</span>
          <Clock size={12} />
          <span>{restaurant.time || '5 min'}</span>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/map?destination=${restaurant.id}`}
            className="btn-primary text-xs px-4 py-2 flex-1 text-center"
          >
            Find Route
          </Link>
          <Link
            to={`/restaurant/${restaurant.id}`}
            className="btn-secondary text-xs px-4 py-2 text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
});

export default RestaurantCard;
