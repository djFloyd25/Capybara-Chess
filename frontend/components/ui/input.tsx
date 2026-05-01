import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
