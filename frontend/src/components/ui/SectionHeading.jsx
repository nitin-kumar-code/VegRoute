export default function SectionHeading({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-12">
      {badge && (
        <span className="inline-block text-xs font-semibold uppercase tracking-wider
                         text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-3">{title}</h2>
      {subtitle && (
        <p className="text-base md:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
