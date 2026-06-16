import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Signature pastel-gradient button with ink text.
  primary:
    "bg-grad text-foreground shadow-soft-sm hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(150,140,210,0.32)] active:translate-y-0",
  secondary:
    "bg-surface-2 text-foreground border border-border shadow-soft-sm hover:border-border-strong hover:bg-white active:translate-y-px",
  ghost: "bg-transparent text-ink-2 hover:bg-bg-tint hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-[30px] px-3 text-[11px] rounded-lg",
  md: "h-[38px] px-4 text-[13px] rounded-lg",
  lg: "h-[46px] px-[22px] text-[15px] rounded-lg",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold leading-none whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
