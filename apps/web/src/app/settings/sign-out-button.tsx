"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const t = useTranslations("security");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" type="button" onClick={handleClick} disabled={loading}>
      {loading ? t("signingOut") : t("signOut")}
    </Button>
  );
}
