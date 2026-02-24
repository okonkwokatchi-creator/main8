import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, trend, trendUp, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trendUp 
              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" 
              : "text-rose-600 bg-rose-50 dark:bg-rose-950/30"
          )}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold font-display mt-1 text-foreground tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
