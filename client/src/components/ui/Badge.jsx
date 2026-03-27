import React from "react";
import { cn } from "../../lib/utils";

export const Badge = React.forwardRef(
  ({ className, variant = "default", showDot = false, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-[9px] font-heading font-black uppercase tracking-[0.3em] transition-all border shadow-sm";

    const variants = {
      default:
        "bg-elevated/50 border-border text-text-muted",
      success:
        "bg-secondary/10 border-secondary/30 text-secondary italic",
      error: "bg-error/10 border-error/30 text-error italic",
      warning: "bg-primary/10 border-primary/30 text-primary italic",
      info: "bg-blue-400/10 border-blue-400/30 text-blue-400",
    };

    const dotColors = {
      default: "bg-text-muted/50",
      success: "bg-secondary animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]",
      error: "bg-error animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      warning: "bg-primary shadow-[0_0_8px_rgba(255,100,0,0.5)]",
      info: "bg-blue-400",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {showDot && (
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />
        )}
        <span className="leading-none">{props.children}</span>
      </div>
    );
  }
);
Badge.displayName = "Badge";
