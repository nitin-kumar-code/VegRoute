import { create } from 'zustand';

export const useMapStore = create((set, get) => ({
  startNode: null,
  targetNode: null,
  targetRestaurant: null,
  
  activeRoute: null, // Full route nodes
  routeInfo: null,
  rawRouteData: null,
  
  mapCenter: [23.8315, 91.2868],
  mapZoom: 14,
  
  restaurants: [],
  
  // Navigation State
  isNavigating: false,
  userLocation: null,
  userAccuracy: 0,
  navState: {
    travelledRoute: [],
    remainingRoute: [],
    remainingDistanceKm: 0,
    remainingTimeMin: 0,
    status: 'idle', // 'idle', 'navigating', 'arrived', 'denied'
  },
  
  fetchRestaurants: async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/restaurants/');
      const data = await res.json();
      set({ restaurants: data });
    } catch (err) {}
  },

  setStartNode: (node) => set({ startNode: node }),
  setTargetNode: (node) => set({ targetNode: node }),
  setTargetRestaurant: (restaurant) => set({ targetRestaurant: restaurant }),
  
  setActiveRoute: (routeData) => set({ 
    activeRoute: routeData.route, 
    routeInfo: {
      time: routeData.estimatedTimeMinutes * 60,
      distance: routeData.distanceKm,
      algorithm: routeData.algorithm,
      nodesExplored: routeData.nodesExplored,
    },
    rawRouteData: routeData,
    isNavigating: false,
    navState: {
      travelledRoute: [],
      remainingRoute: routeData.route || [],
      remainingDistanceKm: routeData.distanceKm,
      remainingTimeMin: routeData.estimatedTimeMinutes,
      status: 'idle',
    }
  }),
  
  setMapCamera: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
  
  resetRoute: () => set({ 
    startNode: null, 
    targetNode: null, 
    targetRestaurant: null,
    activeRoute: null, 
    routeInfo: null,
    rawRouteData: null,
    isNavigating: false,
  }),

  // Navigation actions
  startNavigation: () => {
    const route = get().activeRoute;
    if (route && route.length > 0) {
      set({ mapCenter: [route[0].lat, route[0].lng], mapZoom: 17 });
    }
    set({ isNavigating: true, navState: { ...get().navState, status: 'navigating' } });
  },
  stopNavigation: () => set({ isNavigating: false, navState: { ...get().navState, status: 'idle', travelledRoute: [], remainingRoute: get().activeRoute } }),
  setNavError: (err) => set({ navState: { ...get().navState, status: 'denied' } }),
  
  updateUserLocation: (lat, lng, accuracy) => {
    const state = get();
    set({ userLocation: [lat, lng], userAccuracy: accuracy });
    
    if (!state.isNavigating || !state.activeRoute) return;
    
    // Project GPS onto route and update progress
    const route = state.activeRoute;
    const dest = route[route.length - 1];
    
    // Distance to destination for arrival check
    const distToDest = haversineDistance(lat, lng, dest.lat, dest.lng);
    if (distToDest < 0.05) { // 50 meters
       set({ navState: { ...state.navState, status: 'arrived', remainingDistanceKm: 0, remainingTimeMin: 0 } });
       return;
    }
    
    // Find closest segment
    let minDist = Infinity;
    let closestPt = null;
    let segmentIndex = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
        const p1 = route[i];
        const p2 = route[i+1];
        const pt = getClosestPointOnSegment({lat, lng}, p1, p2);
        const d = distSq(lat, lng, pt.lat, pt.lng);
        if (d < minDist) {
            minDist = d;
            closestPt = pt;
            segmentIndex = i;
        }
    }
    
    if (closestPt) {
        // Calculate remaining route from closestPt
        const remaining = [{ lat: closestPt.lat, lng: closestPt.lng }];
        for (let i = segmentIndex + 1; i < route.length; i++) {
            remaining.push(route[i]);
        }
        
        // Calculate travelled route
        const travelled = [];
        for (let i = 0; i <= segmentIndex; i++) {
            travelled.push(route[i]);
        }
        travelled.push({ lat: closestPt.lat, lng: closestPt.lng });
        
        // Calculate remaining distance in km
        let remDist = 0;
        for (let i = 0; i < remaining.length - 1; i++) {
            remDist += haversineDistance(remaining[i].lat, remaining[i].lng, remaining[i+1].lat, remaining[i+1].lng);
        }
        
        // Assume avg speed of 30km/h (8.33 m/s) to calculate remaining time
        // Or ratio it based on original time/distance
        let remTime = 0;
        if (state.routeInfo && state.routeInfo.distance > 0) {
            remTime = Math.ceil((remDist / state.routeInfo.distance) * (state.routeInfo.time / 60));
        } else {
            remTime = Math.ceil(remDist / 30 * 60);
        }
        
        set({
            navState: {
                ...state.navState,
                travelledRoute: travelled,
                remainingRoute: remaining,
                remainingDistanceKm: remDist,
                remainingTimeMin: remTime
            }
        });
    }
  },
  
  recenterOnUser: () => {
    const loc = get().userLocation;
    if (loc) {
        set({ mapCenter: loc, mapZoom: 17 });
    }
  }
}));

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function distSq(lat1, lon1, lat2, lon2) {
    return (lat1 - lat2)*(lat1 - lat2) + (lon1 - lon2)*(lon1 - lon2);
}

function getClosestPointOnSegment(p, p1, p2) {
    const l2 = distSq(p1.lat, p1.lng, p2.lat, p2.lng);
    if (l2 === 0) return p1;
    let t = ((p.lng - p1.lng) * (p2.lng - p1.lng) + (p.lat - p1.lat) * (p2.lat - p1.lat)) / l2;
    t = Math.max(0, Math.min(1, t));
    return { lat: p1.lat + t * (p2.lat - p1.lat), lng: p1.lng + t * (p2.lng - p1.lng) };
}
