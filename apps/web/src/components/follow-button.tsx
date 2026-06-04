"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@miru/ui";
import { followUser, unfollowUser } from "@/lib/social-api";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  isAuthenticated: boolean;
}

/**
 * Follow/unfollow toggle for a public profile. Optimistically flips the label,
 * reverts on error, and refreshes the route so follower counts re-render.
 */
export function FollowButton({ userId, initialIsFollowing, isAuthenticated }: FollowButtonProps) {
  const t = useTranslations("social");
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => router.push("/login")}>
        {t("followCta")}
      </Button>
    );
  }

  const toggle = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    startTransition(async () => {
      const result = next ? await followUser(userId) : await unfollowUser(userId);
      if ("error" in result) {
        setIsFollowing(!next);
        return;
      }
      router.refresh();
    });
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={toggle}
      disabled={pending}
      aria-pressed={isFollowing}
    >
      {isFollowing ? t("following") : t("follow")}
    </Button>
  );
}
