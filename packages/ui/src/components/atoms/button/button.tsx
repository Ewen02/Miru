import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "border border-accent/40 bg-accent-muted text-text-primary hover:border-accent/60",
  ghost:
    "border border-border bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export function Button({ variant = "ghost", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-body",
        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    />
  );
}
