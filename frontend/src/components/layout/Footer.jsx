import { Link } from 'react-router-dom';


export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white/70 mt-auto">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="VegRoute Logo" className="h-12" />
            </div>
            <p className="text-sm leading-relaxed">
              Graph-based vegetarian restaurant discovery<br />
              and navigation for Agartala.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Navigation</h4>
            <div className="space-y-2">
              {[['/', 'Home'], ['/explore', 'Explore'], ['/map', 'Map'], ['/visualizer', 'How It Works']].map(([to, label]) => (
                <Link key={to} to={to} className="block text-sm hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Academic */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Academic Project</h4>
            <p className="text-sm leading-relaxed">
              Built as a Graph Theory semester project.<br />
              Demonstrates BFS, DFS, Dijkstra's algorithm<br />
              on real-world geographic data.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/30">
          © 2026 VegRoute. Graph Theory &amp; Data Structures Project.
        </div>
      </div>
    </footer>
  );
}
