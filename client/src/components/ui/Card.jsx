import React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "stitch-glass bg-elevated/20 rounded-[3rem] border border-border shadow-2xl overflow-hidden relative group transition-all duration-700 hover:bg-elevated/40 hover:border-primary/20",
      className
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <div className="relative z-10 h-full flex flex-col">
      {children}
    </div>
  </div>
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-10 pb-4 flex flex-col space-y-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-heading font-extrabold tracking-tight text-text uppercase leading-none",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-10 pt-4 text-text font-body leading-relaxed flex-grow", className)} 
    {...props} 
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-10 pt-4 flex items-center justify-between border-t border-border/10 mt-auto", className)} 
    {...props} 
  />
));
CardFooter.displayName = "CardFooter";
