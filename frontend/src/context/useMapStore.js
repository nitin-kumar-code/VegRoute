import { create } from 'zustand';

export const useMapStore = create((set) => ({
  // Core Selection State
  startNode: null,
  targetNode: null,
  
  // Routing State
  activeRoute: null,
  visitedNodes: [],
  isRouting: false,
  
  // Camera State
  mapCenter: [23.8315, 91.2868], // Default to Agartala
  mapZoom: 14,
  
  // Global Data State
  restaurants: [],
  
  // Actions
  fetchRestaurants: async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/restaurants/');
      const data = await res.json();
      set({ restaurants: data });
    } catch (err) {
      console.error("Failed to load restaurants:", err);
    }
  },

  setStartNode: (node) => set({ startNode: node }),
  setTargetNode: (node) => set({ targetNode: node }),
  
  setActiveRoute: (routeData) => set({ 
    activeRoute: routeData.route, 
    visitedNodes: routeData.visited_nodes || [] 
  }),
  
  setIsRouting: (status) => set({ isRouting: status }),
  
  setMapCamera: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
  
  resetRoute: () => set({ 
    startNode: null, 
    targetNode: null, 
    activeRoute: null, 
    visitedNodes: [] 
  })
}));
