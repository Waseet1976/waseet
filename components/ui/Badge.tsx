import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

interface BadgeProps {
  variant?:  BadgeVariant;
  children:  React.ReactNode;
  className?: string;
  /** Petite pastille ronde — affiche uniquement un chiffre */
  dot?:      boolean;
}

const styles: Record<BadgeVariant, string> = {
  gold:    "bg-[#635BFF]/12    text-[#4C45E0]   border-[#635BFF]/20",
  success: "bg-success/10 text-success-dark border-success/20",
  warning: "bg-warning-bg  text-warning      border-warning/30",
  danger:  "bg-danger/10  text-danger-dark  border-danger/20",
  info:    "bg-[#635BFF]/10    text-[#4C45E0]    border-[#635BFF]/20",
  muted:   "bg-sand-dark  text-charcoal-muted border-sand-dark",
};

export function Badge({ variant = "muted", children, className, dot }: BadgeProps) {
  if (dot) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
          "border",
          styles[variant],
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "px-2.5 py-0.5 rounded-full text-xs font-medium",
        "border",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
