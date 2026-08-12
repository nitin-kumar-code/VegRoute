export default function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
        active
          ? 'bg-brand-900 text-white shadow-sm'
          : 'bg-white text-content-secondary border border-border hover:border-brand-900/30 hover:text-brand-900'
      }`}
    >
      {label}
    </button>
  );
}
