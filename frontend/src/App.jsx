import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components until we build out the pages
const LandingPage = () => <div className="p-8 text-center"><h1 className="text-4xl font-bold text-green-400">VegRoute</h1><p className="mt-4">Navigate pure veg trails in Agartala.</p></div>;
const MapPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Interactive Map</h1><p>Leaflet map will go here.</p></div>;
const AlgorithmVisualizerPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Algorithm Visualizer</h1><p>Dijkstra visitation animations will go here.</p></div>;
const AdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold text-red-400">Admin Only</h1><p>Graph reload controls go here.</p></div>;

function App() {
  return (
    <BrowserRouter>
      {/* 
        This is the global shell. The glassmorphism sidebar and map 
        will eventually live inside the specific page components.
      */}
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        {/* Simple Global Nav (Temporary until Layout component is built) */}
        <nav className="glass sticky top-0 z-50 p-4 flex gap-4 px-8 items-center border-b border-gray-700/50">
          <div className="font-bold text-xl text-green-400">VegRoute</div>
          <div className="flex-1"></div>
          <a href="/" className="hover:text-green-300 transition-colors">Home</a>
          <a href="/map" className="hover:text-green-300 transition-colors">Explore Map</a>
          <a href="/visualizer" className="hover:text-green-300 transition-colors">How it Works</a>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/visualizer" element={<AlgorithmVisualizerPage />} />
            
            {/* Protected/Hidden Admin Route */}
            <Route path="/admin_secret_dashboard" element={<AdminDashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
