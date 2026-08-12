import { Link } from 'react-router-dom';

export function Button({ children, variant = 'primary', href, className = '', ...props }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const cls = `${base} inline-flex items-center justify-center gap-2 ${className}`;

  if (href) {
    return <Link to={href} className={cls}>{children}</Link>;
  }
  return <button className={cls} {...props}>{children}</button>;
}
