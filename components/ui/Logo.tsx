import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: "text-xl",  sub: "text-[10px]" },
  md: { icon: 32, text: "text-2xl", sub: "text-xs"     },
  lg: { icon: 44, text: "text-4xl", sub: "text-sm"     },
};

export function Logo({ variant = "dark", size = "md", href = "/", className }: LogoProps) {
  const s       = sizes[size];
  const isLight = variant === "light";

  const content = (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Icône maison stylisée */}
      <span
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl"
        style={{
          width:      s.icon,
          height:     s.icon,
          background: isLight
            ? "rgba(201,151,58,0.15)"
            : "linear-gradient(135deg,#C9973A 0%,#E5B85C 100%)",
        }}
      >
        <svg
          width={s.icon * 0.55}
          height={s.icon * 0.55}
          viewBox="0 0 20 18"
          fill="none"
          aria-hidden
        >
          {/* Toit */}
          <path
            d="M10 1 L19 8 L17 8 L17 17 L3 17 L3 8 L1 8 Z"
            fill={isLight ? "#C9973A" : "#fff"}
            fillOpacity={isLight ? 1 : 0.95}
          />
          {/* Porte */}
          <rect x="7.5" y="11" width="5" height="6" rx="1" fill={isLight ? "#fff" : "rgba(15,15,14,0.35)"} />
        </svg>
      </span>

      {/* Texte */}
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-bold tracking-tight",
            s.text,
            isLight ? "text-white" : "text-obsidian"
          )}
          style={isLight ? {} : {
            background: "linear-gradient(135deg,#C9973A,#E5B85C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
          }}
        >
          Waseet
        </span>
        <span className={cn(s.sub, isLight ? "text-white/50" : "text-charcoal-muted", "font-normal mt-0.5")}>
          Plateforme Immobilière
        </span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF]/50 rounded-xl">
      {content}
    </Link>
  );
}
