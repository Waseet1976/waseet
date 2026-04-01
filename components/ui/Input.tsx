"use client";

import { cn }                                   from "@/lib/utils/cn";
import { Eye, EyeOff }                          from "lucide-react";
import { InputHTMLAttributes, forwardRef, useState } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  /** Icône affichée à gauche dans l'input */
  icon?:      React.ReactNode;
  /** Icône / bouton affiché à droite (ignoré pour type="password" — le toggle prend sa place) */
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightIcon, className, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputId     = id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const isPassword  = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const hasLeft  = !!icon;
    const hasRight = isPassword || !!rightIcon;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Icône gauche */}
          {hasLeft && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              // Base
              "w-full h-11 bg-white text-obsidian text-sm",
              "border rounded-xl px-4",
              "placeholder:text-charcoal-muted",
              "transition-all duration-200",
              // Focus
              "focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40 focus:border-[#635BFF]",
              // States
              error
                ? "border-danger focus:ring-danger/30 focus:border-danger"
                : "border-sand-dark hover:border-charcoal-muted/50",
              "disabled:opacity-50 disabled:bg-sand disabled:cursor-not-allowed",
              // Padding conditionnel
              hasLeft  && "pl-10",
              hasRight && "pr-11",
              className
            )}
            {...props}
          />

          {/* Toggle password */}
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal transition-colors focus:outline-none"
              aria-label={showPassword ? "Masquer" : "Afficher"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Icône droite custom */}
          {!isPassword && hasRight && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted [&>svg]:w-4 [&>svg]:h-4">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-danger flex-shrink-0" />
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-charcoal-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

