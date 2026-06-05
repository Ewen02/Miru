"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@miru/ui";
import { openConversation } from "@/lib/messages-api";

interface MessageButtonProps {
  /** The user to start (or resume) a conversation with. */
  userId: string;
  isAuthenticated: boolean;
}

/**
 * Profile CTA that opens (idempotently) a DM conversation with the given user
 * and routes to it. This is the primary entry point for starting a chat — the
 * /messages inbox itself has no "new conversation" affordance by design.
 */
export function MessageButton({ userId, isAuthenticated }: MessageButtonProps) {
  const t = useTranslations("social");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const res = await openConversation(userId);
      if ("error" in res) return;
      router.push(`/messages/${res.id}`);
    });
  };

  return (
    <Button variant="outline" onClick={onClick} disabled={pending}>
      {t("message")}
    </Button>
  );
}
