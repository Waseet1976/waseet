import { cn } from "@/lib/utils/cn";

// ── Card ──────────────────────────────────────────────────────
interface CardProps {
  children:   React.ReactNode;
  className?: string;
  hover?:     boolean;
  onClick?:   () => void;
  padding?:   "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "p-0",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export function Card({ children, className, hover, onClick, padding = "md" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-gray-200",
        "shadow-sm",
        hover && "hover:shadow-[0_4px_24px_rgba(15,15,14,0.10)] transition-shadow duration-200 cursor-pointer",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// ── CardHeader ────────────────────────────────────────────────
interface SectionProps {
  children:   React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: SectionProps) {
  return (
    <div className={cn("flex items-center justify-between mb-5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: SectionProps) {
  return (
    <h3 className={cn("text-base font-semibold text-black leading-snug", className)}>
      {children}
    </h3>
  );
}

// ── CardBody ──────────────────────────────────────────────────
export function CardBody({ children, className }: SectionProps) {
  return <div className={cn("", className)}>{children}</div>;
}

// ── CardContent (alias CardBody) ──────────────────────────────
export const CardContent = CardBody;

// ── CardFooter ────────────────────────────────────────────────
export function CardFooter({ children, className }: SectionProps) {
  return (
    <div className={cn("mt-5 pt-4 border-t border-gray-100", className)}>
      {children}
    </div>
  );
}
