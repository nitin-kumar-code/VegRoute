import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, MapPin } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/map', label: 'Map' },
  { to: '/visualizer', label: 'How It Works' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
      <div className="section-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
            <Leaf size={18} className="text-brand-light" />
          </div>
          <span className="text-lg font-bold text-brand-900">VegRoute</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-brand-900'
                  : 'text-content-secondary hover:text-brand-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link to="/explore" className="btn-primary text-sm flex items-center gap-2">
            <MapPin size={16} />
            Explore Restaurants
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-content-primary"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block text-base font-medium py-2 ${
                location.pathname === link.to
                  ? 'text-brand-900'
                  : 'text-content-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/explore"
            onClick={() => setMobileOpen(false)}
            className="btn-primary text-sm text-center block mt-4"
          >
            Explore Restaurants
          </Link>
        </div>
      )}
    </nav>
  );
}
