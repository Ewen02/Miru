import { cn } from "../../../utils/cn";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-bg-elevated",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-linear-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className,
      )}
    />
  );
}
