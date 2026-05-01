"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer",
  {
    variants: {
      variant: {
        default:   "bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md",
        accent:    "bg-accent text-text shadow-sm hover:bg-accent-dark hover:shadow-md",
        outline:   "border-2 border-primary text-primary bg-transparent hover:bg-surface-alt",
        ghost:     "text-text-muted hover:bg-surface-alt hover:text-text",
        danger:    "bg-danger text-white hover:brightness-90",
        lime:      "bg-lime text-text shadow-sm hover:brightness-95",
      },
      size: {
        sm:   "h-8 px-3 text-xs",
        md:   "h-10 px-5",
        lg:   "h-12 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
