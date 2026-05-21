"use client";

import { useEffect, useState } from "react";
import {
  disablePush,
  enablePush,
  getActivePushSubscription,
  isPushSupported,
} from "@/lib/push-api";

type Status = "loading" | "unsupported" | "off" | "on" | "denied";

/**
 * Browser-side push opt-in. Surfaces the real state (granted/denied/default,
 * subscription presence) instead of a fake toggle.
 */
export function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function probe() {
      if (!isPushSupported()) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      const sub = await getActivePushSubscription().catch(() => null);
      if (!cancelled) setStatus(sub ? "on" : "off");
    }
    void probe();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle() {
    setBusy(true);
    setError(null);
    try {
      if (status === "on") {
        await disablePush();
        setStatus("off");
      } else {
        const res = await enablePush();
        if (res.ok) {
          setStatus("on");
        } else {
          setError(res.reason);
          if (res.reason === "Permission refusée.") setStatus("denied");
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const enabled = status === "on";
  const disabled = busy || status === "loading" || status === "unsupported" || status === "denied";

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-body text-sm font-medium text-text-primary">
          Notifications push
        </p>
        <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">
          {status === "unsupported"
            ? "Ton navigateur ne prend pas en charge les notifications push."
            : status === "denied"
              ? "Permission refusée. Active-les depuis les réglages du site dans ton navigateur."
              : "Reçois une notif quand un épisode de ta watchlist sort."}
        </p>
        {error && (
          <p className="m-0 mt-1 font-body text-xs text-error">{error}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={enabled}
        aria-label={enabled ? "Désactiver les notifications push" : "Activer les notifications push"}
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        style={{
          backgroundColor: enabled ? "var(--color-accent)" : "var(--color-bg-elevated)",
        }}
      >
        <span
          className="inline-block h-3.5 w-3.5 transform rounded-sm bg-white transition-transform duration-200"
          style={{ transform: enabled ? "translateX(20px)" : "translateX(3px)" }}
        />
      </button>
    </div>
  );
}
