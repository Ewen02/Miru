import Image from "next/image";
import { cn } from "@miru/ui";

const MONOGRAM_GRADIENT = "linear-gradient(160deg, #2d1844, #4a1d6b)";

const SIZE_CLASS = {
  sm: "h-9 w-9 text-sm rounded-full",
  md: "h-12 w-12 text-lg rounded-full",
  lg: "h-20 w-20 text-3xl rounded-2xl",
  xl: "h-24 w-24 text-4xl rounded-full",
} as const;

const PX = { sm: "36px", md: "48px", lg: "80px", xl: "96px" } as const;

interface MonogramAvatarProps {
  /** Display name — first char becomes the fallback initial. */
  name: string;
  /** Optional image; falls back to the gradient monogram when absent. */
  image?: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/**
 * The canonical avatar surface across Miru: a user/club image when available,
 * otherwise a deterministic gradient monogram. Replaces the gradient that was
 * hand-duplicated on profiles, the inbox, clubs, and forum posts.
 *
 * `lg` uses a rounded-2xl square (club identity badge); the others are round.
 */
export function MonogramAvatar({ name, image, size = "sm", className }: MonogramAvatarProps) {
  const sizeClass = SIZE_CLASS[size];
  if (image) {
    return (
      <div
        className={cn("relative shrink-0 overflow-hidden border border-border-subtle", sizeClass, className)}
      >
        <Image src={image} alt={name} fill sizes={PX[size]} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-border-subtle font-display text-text-primary",
        sizeClass,
        className,
      )}
      style={{ background: MONOGRAM_GRADIENT }}
      role="img"
      aria-label={name}
    >
      <span aria-hidden>{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}
