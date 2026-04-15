import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  wrapperClassName?: string;
}

export function Input({ icon, wrapperClassName, className, ...rest }: InputProps) {
  return (
    <div className={cn("relative flex items-center", wrapperClassName)}>
      {icon && (
        <span className="pointer-events-none absolute left-3 flex items-center text-text-tertiary">
          {icon}
        </span>
      )}
      <input
        {...rest}
        className={cn(
          "w-full rounded-md border border-border bg-bg-surface px-3 py-2 font-body text-sm text-text-primary",
          "placeholder:text-text-tertiary",
          "transition-colors duration-200",
          "focus-visible:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
          icon && "pl-9",
          className,
        )}
      />
    </div>
  );
}
