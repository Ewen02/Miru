"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" type="button" onClick={handleClick} disabled={loading}>
      {loading ? "Déconnexion…" : "Se déconnecter"}
    </Button>
  );
}
