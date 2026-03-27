import React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(
  ({ className, type = "text", icon: Icon, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/50 pointer-events-none group-focus-within:text-primary transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 sm:h-14 w-full rounded-md bg-base/50 border border-border px-6 py-4 text-[12px] font-heading font-extrabold uppercase tracking-widest text-text transition-all duration-300",
            "placeholder:text-text-muted/30 placeholder:italic placeholder:normal-case placeholder:font-body",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 hover:border-text-muted/50 shadow-inner",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-14",
            className
          )}
          style={{ fontFamily: type === "password" ? "inherit" : "'Fira Code', monospace" }}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    );
  }
);
Input.displayName = "Input";
