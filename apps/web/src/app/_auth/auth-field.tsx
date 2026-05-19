"use client";

import { Input, cn } from "@miru/ui";

interface AuthFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  invalid?: boolean;
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  hint,
  invalid,
}: AuthFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
        {label}
      </span>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        aria-invalid={invalid}
        className={cn(invalid && "border-error/40 bg-error-muted")}
      />
      {hint && (
        <span
          className={cn(
            "font-body text-xs",
            invalid ? "text-error" : "text-text-tertiary",
          )}
        >
          {hint}
        </span>
      )}
    </label>
  );
}
