import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
  {
    variants: {
      variant: {
        default:  "bg-primary/15 text-primary border-primary/20",
        accent:   "bg-accent/20 text-olive border-accent/30",
        sage:     "bg-sage/20 text-text border-sage/30",
        lime:     "bg-lime/40 text-text border-lime/50",
        danger:   "bg-danger/15 text-danger border-danger/20",
        outline:  "bg-transparent text-text-muted border-border",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
