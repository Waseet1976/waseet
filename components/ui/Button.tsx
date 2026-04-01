"use client";

import { cn }                           from "@/lib/utils/cn";
import { Loader2 }                      from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?:     "sm" | "md" | "lg";
  loading?:  boolean;
  fullWidth?: boolean;
  /** Icône à gauche du texte */
  leftIcon?:  React.ReactNode;
  /** Icône à droite du texte */
  rightIcon?: React.ReactNode;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: [
    "bg-[#635BFF] hover:bg-[#4C45E0] active:bg-[#635BFF]-dark",
    "text-white font-semibold",
    "shadow-[0_2px_12px_rgba(201,151,58,0.35)] hover:shadow-[0_4px_20px_rgba(201,151,58,0.45)]",
    "border border-transparent",
  ].join(" "),

  secondary: [
    "bg-obsidian hover:bg-charcoal-light active:bg-charcoal",
    "text-white font-semibold",
    "border border-transparent",
  ].join(" "),

  outline: [
    "bg-transparent hover:bg-[#635BFF]/5 active:bg-[#635BFF]/10",
    "text-[#635BFF] font-semibold",
    "border-2 border-[#635BFF]/70 hover:border-[#635BFF]",
  ].join(" "),

  ghost: [
    "bg-transparent hover:bg-sand-dark active:bg-sand",
    "text-charcoal hover:text-obsidian font-medium",
    "border border-transparent",
  ].join(" "),

  danger: [
    "bg-danger hover:bg-danger-dark active:bg-danger-dark",
    "text-white font-semibold",
    "border border-transparent",
  ].join(" "),
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8  px-4  text-xs  rounded-lg  gap-1.5",
  md: "h-11 px-6  text-sm  rounded-xl  gap-2",
  lg: "h-13 px-8  text-base rounded-xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size    = "md",
      loading,
      fullWidth,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF]/50 focus-visible:ring-offset-1",
          "active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          // Variant & size
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
        ) : (
          leftIcon && (
            <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{leftIcon}</span>
          )
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && (
          <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
