import { AlertTriangle } from 'lucide-react';

interface OutOfStockAlertProps {
  delay?: number;
}

export function OutOfStockAlert({ delay = 0 }: OutOfStockAlertProps) {
  const alerts = [
    { product: 'Chivas Regal 12', days: 3 },
    { product: 'Grey Goose Premium', days: 5 },
    { product: 'Bacardi Superior', days: 2 },
  ];

  return (
    <div 
      className="glass-card rounded-xl p-6 border border-destructive/30 bg-destructive/5 opacity-0 animate-fade-in" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold text-foreground">Out of Stock Alerts</h3>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <span className="text-sm text-foreground font-medium">{alert.product}</span>
            <span className="text-xs text-destructive font-semibold">{alert.days} days</span>
          </div>
        ))}
      </div>
    </div>
  );
}

