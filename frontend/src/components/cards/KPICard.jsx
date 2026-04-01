export default function KPICard({ title, value, change, icon, trend, variant = 'default' }) {
  const variantClasses = {
    default: 'bg-neutral-800 border-neutral-700',
    critical: 'bg-danger/10 border-danger/30',
    success: 'bg-success/10 border-success/30',
  };

  return (
    <div className={`rounded-lg border p-6 ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      
      {change && (
        <div className="mt-4">
          <span className={`text-sm font-semibold ${
            trend === 'up' ? 'text-danger' : 'text-success'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
          <span className="text-xs text-neutral-400 ml-2">vs last period</span>
        </div>
      )}
    </div>
  );
}
