import React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-heading font-extrabold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-[11px]";

    const variants = {
      primary:
        "bg-brand-gradient text-white shadow-2xl shadow-primary/20 bg-[length:200%_200%] animate-gradient-slow hover:scale-[1.02]",
      secondary:
        "bg-elevated text-text border border-border hover:bg-surface hover:border-primary/30",
      ghost:
        "bg-transparent hover:bg-elevated/50 text-text-muted hover:text-text hover:italic",
      danger: "bg-error/10 text-error hover:bg-error/20 border border-error/20",
    };

    const sizes = {
      default: "h-12 px-8",
      sm: "h-8 px-4 text-[9px]",
      lg: "h-16 px-12 text-[13px] tracking-[0.3em]",
      icon: "h-12 w-12",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
