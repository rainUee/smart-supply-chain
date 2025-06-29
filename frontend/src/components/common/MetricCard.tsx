interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  trendColor?: 'green' | 'red' | 'blue' | 'gray';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendColor = 'blue' 
}) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value">{value}</div>
      {trend && (
        <div className={`metric-trend ${trendColor}`}>
          {trend}
        </div>
      )}
    </div>
  );
};