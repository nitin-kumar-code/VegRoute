import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import ExplorePage from './pages/ExplorePage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import AlgorithmVisualizerPage from './pages/AlgorithmVisualizerPage';
import { useMapStore } from './context/useMapStore';

/**
 * App — Root shell. Navbar is persistent, Footer shows on all pages except /map.
 * MapPage gets special treatment: no footer, full-height layout.
 */
function App() {
  const fetchRestaurants = useMapStore((state) => state.fetchRestaurants);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-warm text-content-primary flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<><LandingPage /><Footer /></>} />
            <Route path="/explore" element={<><ExplorePage /><Footer /></>} />
            <Route path="/restaurant/:id" element={<><RestaurantDetailsPage /><Footer /></>} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/visualizer" element={<><AlgorithmVisualizerPage /><Footer /></>} />
            <Route path="/admin_secret_dashboard" element={
              <div className="section-container py-20 text-center">
                <h1 className="text-2xl font-bold text-status-error">Admin Dashboard</h1>
                <p className="text-content-secondary mt-2">Graph reload controls — restricted access.</p>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
