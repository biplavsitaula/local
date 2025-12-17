import { IStatCardProps } from "@/interface/iStatCardProps";
import { cn } from "@/lib/utils";

const variantStyles: Record<NonNullable<IStatCardProps["variant"]>, string> = {
  default: "border-border/50",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-destructive/30 bg-destructive/5",
  success: "border-success/30 bg-success/5",
};

const iconVariantStyles: Record<
  NonNullable<IStatCardProps["variant"]>,
  string
> = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  success: "bg-success/20 text-success",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  delay = 0,
}: IStatCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg opacity-0 animate-fade-in",
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
              month
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconVariantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
