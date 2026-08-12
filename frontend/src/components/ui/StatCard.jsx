export default function StatCard({ icon: Icon, number, label, description }) {
  return (
    <div className="card p-6 text-left">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="text-brand-900" />
        </div>
        <div>
          {number && (
            <span className="text-xs font-semibold text-brand-accent mb-1 block">{number}</span>
          )}
          <h3 className="text-base font-semibold text-content-primary mb-1">{label}</h3>
          <p className="text-sm text-content-secondary leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
