import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import restaurantImages from '../restaurants/data/restaurantImages';
import { useMapStore } from '../../context/useMapStore';
import { useState } from 'react';

/**
 * RestaurantMarkers — Color-coded restaurant pins on the Leaflet map.
 * Uses SVG divIcon markers colored by purity level per the new brand palette.
 */

const PURITY_COLORS = {
  pure_veg: '#3E8E5B',
  jain_friendly: '#D99A2B',
  veg: '#1F5D45',
};

function createRestaurantIcon(purityLevel) {
  const color = PURITY_COLORS[purityLevel] || '#3E8E5B';
  return L.divIcon({
    className: '',
    html: `
      <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" 
              fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="13" r="6" fill="white" opacity="0.9"/>
        <text x="14" y="16" text-anchor="middle" font-size="10" fill="${color}">🌿</text>
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const PURITY_LABELS = {
  pure_veg: 'Pure Veg',
  jain_friendly: 'Jain Friendly',
  veg: 'Veg',
};

const RestaurantPopup = ({ restaurant, purity }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = restaurantImages[restaurant.id] || restaurant.image || '/assets/restaurants/fallback.jpg';

  return (
    <Popup>
      <div style={{ minWidth: '180px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ width: '100%', height: '100px', marginBottom: '8px', borderRadius: '8px', overflow: 'hidden', background: '#f4f4f4' }}>
          {!imageError ? (
             <img src={imageUrl} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImageError(true)} loading="lazy" />
          ) : (
             <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</div>
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#17201B', marginBottom: '4px' }}>
          {restaurant.name}
        </div>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            background: purity === 'pure_veg' ? '#3E8E5B20' : '#D99A2B20',
            color: purity === 'pure_veg' ? '#3E8E5B' : '#D99A2B',
          }}>
            {PURITY_LABELS[purity]}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#66736A' }}>
          ⭐ {restaurant.rating} &nbsp;·&nbsp; 🛡️ {restaurant.trust_score || 0} verifications
        </div>
        <div style={{ fontSize: '11px', color: '#66736A', marginTop: '6px' }}>
          Graph Node: <code style={{ background: '#EEF3EC', padding: '1px 4px', borderRadius: '4px' }}>{restaurant.nearest_node_id}</code>
        </div>
      </div>
    </Popup>
  );
};

export default function RestaurantMarkers() {
  const restaurants = useMapStore((state) => state.restaurants);
  const targetRestaurant = useMapStore((state) => state.targetRestaurant);
  const activeRoute = useMapStore((state) => state.activeRoute);
  
  const markersToRender = (activeRoute && targetRestaurant) 
    ? restaurants.filter(r => r.id === targetRestaurant.id)
    : restaurants;
  
  return (
    <>
      {markersToRender.map((restaurant) => {
        const purity = restaurant.pure_veg ? 'pure_veg' : restaurant.jain_available ? 'jain_friendly' : 'veg';
        return (
        <Marker
          key={restaurant.id}
          position={[restaurant.lat, restaurant.lng]}
          icon={createRestaurantIcon(purity)}
        >
          <RestaurantPopup restaurant={restaurant} purity={purity} />
        </Marker>
      )})}
    </>
  );
}
