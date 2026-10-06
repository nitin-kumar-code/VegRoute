import { create } from 'zustand';

export const useMapStore = create((set, get) => ({
  startNode: null,
  targetNode: null,
  targetRestaurant: null,
  
  activeRoute: null, // Full route nodes
  routeInfo: null,
  rawRouteData: null,
  previewRoute: null,
  
  mapCenter: [23.8315, 91.2868],
  mapZoom: 14,
  
  restaurants: [],
  
  // Navigation State
  isNavigating: false,
  userLocation: null,
  userAccuracy: 0,
  maxRouteProgressKm: 0,
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
    previewRoute: { activeRoute: routeData.route || [], routeInfo: { time: routeData.estimatedTimeMinutes * 60, distance: routeData.distanceKm, algorithm: routeData.algorithm, nodesExplored: routeData.nodesExplored }, rawRouteData: routeData },
    isNavigating: false,
    userLocation: null,
    userAccuracy: 0,
    maxRouteProgressKm: 0,
    mapCenter: [23.8315, 91.2868],
    mapZoom: 14,
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
    previewRoute: null,
    isNavigating: false,
  }),

  // Navigation actions
  startNavigation: () => {
    set({
      isNavigating: true,
      userLocation: null,
      maxRouteProgressKm: 0,
      navState: { ...get().navState, status: 'locating', error: null },
    });
  },
  setLiveRoute: (routeData, lat, lng, accuracy) => {
    const route = routeData.route || [];
    set({
      activeRoute: route,
      routeInfo: {
        time: routeData.estimatedTimeMinutes * 60,
        distance: routeData.distanceKm,
        algorithm: routeData.algorithm,
        nodesExplored: routeData.nodesExplored,
      },
      rawRouteData: routeData,
      userLocation: [lat, lng],
      userAccuracy: accuracy,
      mapCenter: [lat, lng],
      mapZoom: 17,
      maxRouteProgressKm: 0,
      navState: {
        travelledRoute: [],
        remainingRoute: route,
        remainingDistanceKm: routeData.distanceKm,
        remainingTimeMin: routeData.estimatedTimeMinutes,
        status: 'navigating',
        error: null,
      },
    });
  },
  stopNavigation: () => {
    const state = get();
    const preview = state.previewRoute;
    set({
      isNavigating: false,
      userLocation: null,
      maxRouteProgressKm: 0,
      ...(preview ? { activeRoute: preview.activeRoute, routeInfo: preview.routeInfo, rawRouteData: preview.rawRouteData } : {}),
      mapCenter: preview?.activeRoute?.length ? [preview.activeRoute[0].lat, preview.activeRoute[0].lng] : state.mapCenter,
      mapZoom: 14,
      navState: { ...state.navState, status: 'idle', travelledRoute: [], remainingRoute: preview?.activeRoute || state.activeRoute },
    });
  },
  setNavError: (err) => set({ navState: { ...get().navState, status: 'denied', error: err } }),
  
  updateUserLocation: (lat, lng, accuracy) => {
    const state = get();
    set({
      userLocation: [lat, lng],
      userAccuracy: accuracy,
      ...(state.navState.status === 'locating' ? { mapCenter: [lat, lng], mapZoom: 17 } : {}),
    });
    
    if (!state.isNavigating || !state.activeRoute) return;
    
    if (state.navState.status !== 'navigating') return;
    // Project the GPS fix onto the road polyline, then retain only forward
    // progress so normal GPS jitter cannot make distance increase.
    const route = state.activeRoute;
    const dest = route[route.length - 1];
    
    // Distance to destination for arrival check
    const distToDest = haversineDistance(lat, lng, dest.lat, dest.lng);
    if (distToDest <= (40 + Math.min(accuracy || 0, 20)) / 1000) {
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
        const d = haversineDistance(lat, lng, pt.lat, pt.lng);
        if (d < minDist) {
            minDist = d;
            closestPt = pt;
            segmentIndex = i;
        }
    }
    
    if (closestPt) {
        let progressKm = 0;
        for (let i = 0; i < segmentIndex; i++) {
          progressKm += haversineDistance(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
        }
        progressKm += haversineDistance(route[segmentIndex].lat, route[segmentIndex].lng, closestPt.lat, closestPt.lng);
        const maxProgressKm = Math.max(state.maxRouteProgressKm, progressKm);

        // Derive the displayed point from monotonic progress, not the latest
        // possibly-jittery GPS projection.
        let progressSegment = 0;
        let distanceBeforeSegment = 0;
        for (let i = 0; i < route.length - 1; i++) {
          const segmentKm = haversineDistance(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
          if (distanceBeforeSegment + segmentKm >= maxProgressKm) {
            progressSegment = i;
            break;
          }
          distanceBeforeSegment += segmentKm;
          progressSegment = i;
        }
        const segmentLength = haversineDistance(route[progressSegment].lat, route[progressSegment].lng, route[progressSegment + 1].lat, route[progressSegment + 1].lng) || 1;
        const fraction = Math.min(1, Math.max(0, (maxProgressKm - distanceBeforeSegment) / segmentLength));
        const progressPoint = {
          lat: route[progressSegment].lat + fraction * (route[progressSegment + 1].lat - route[progressSegment].lat),
          lng: route[progressSegment].lng + fraction * (route[progressSegment + 1].lng - route[progressSegment].lng),
        };

        const remaining = [progressPoint];
        for (let i = progressSegment + 1; i < route.length; i++) {
            remaining.push(route[i]);
        }
        
        // Calculate travelled route
        const travelled = [];
        for (let i = 0; i <= progressSegment; i++) {
            travelled.push(route[i]);
        }
        travelled.push(progressPoint);
        
        // Calculate remaining distance in km
        let remDist = 0;
        for (let i = 0; i < remaining.length - 1; i++) {
            remDist += haversineDistance(remaining[i].lat, remaining[i].lng, remaining[i+1].lat, remaining[i+1].lng);
        }
        
        remDist = Math.max(0, (state.routeInfo?.distance || remDist) - maxProgressKm);
        // The local graph has travel-time weights; scale its original estimate
        // by remaining route distance (no real-time traffic data is available).
        const remTime = state.routeInfo?.distance > 0
          ? Math.ceil((remDist / state.routeInfo.distance) * (state.routeInfo.time / 60))
          : Math.ceil(remDist / 30 * 60); // documented fallback estimate: 30 km/h
        
        set({
            navState: {
                ...state.navState,
                travelledRoute: travelled,
                remainingRoute: remaining,
                remainingDistanceKm: remDist,
                remainingTimeMin: remTime,
                status: 'navigating',
            },
            maxRouteProgressKm: maxProgressKm,
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

function getClosestPointOnSegment(p, p1, p2) {
    const meanLat = (p1.lat + p2.lat + p.lat) / 3 * Math.PI / 180;
    const sx = 111320 * Math.cos(meanLat);
    const sy = 110540;
    const x1 = p1.lng * sx, y1 = p1.lat * sy;
    const x2 = p2.lng * sx, y2 = p2.lat * sy;
    const px = p.lng * sx, py = p.lat * sy;
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return p1;
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return { lat: p1.lat + t * (p2.lat - p1.lat), lng: p1.lng + t * (p2.lng - p1.lng) };
}
