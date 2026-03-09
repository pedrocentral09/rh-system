
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange border-b-2",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-surface-secondary text-text-primary shadow-sm",
        secondary:
          "border-brand-blue/20 bg-brand-blue/10 text-brand-blue",
        destructive:
          "border-rose-500/20 bg-rose-500/10 text-rose-500",
        outline: "border-border text-text-muted hover:border-brand-orange/30",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
        warning: "border-brand-orange/20 bg-brand-orange/10 text-brand-orange shadow-[0_0_15px_rgba(249,115,22,0.1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
