"use client";

import { API_URL } from "./env";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function fetchPushPublicKey(): Promise<string | null> {
  const res = await fetch(new URL("/push/public-key", API_URL), { credentials: "include" });
  if (!res.ok) return null;
  const { publicKey } = (await res.json()) as { publicKey: string | null };
  return publicKey;
}

export async function getActivePushSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function enablePush(): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isPushSupported()) return { ok: false, reason: "Navigateur non compatible." };

  const publicKey = await fetchPushPublicKey();
  if (!publicKey) return { ok: false, reason: "Push non configuré côté serveur." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "Permission refusée." };

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const key = urlBase64ToUint8Array(publicKey);
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      // Cast: the runtime accepts Uint8Array, but TS lib.dom narrows to
      // BufferSource which excludes SharedArrayBuffer-backed views.
      applicationServerKey: key.buffer as ArrayBuffer,
    });
  }

  const json = sub.toJSON();
  const res = await fetch(new URL("/push/subscribe", API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    }),
  });
  if (!res.ok) return { ok: false, reason: `API ${res.status}` };
  return { ok: true };
}

export async function disablePush(): Promise<void> {
  const sub = await getActivePushSubscription();
  if (!sub) return;
  await fetch(new URL("/push/subscribe", API_URL), {
    method: "DELETE",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
}
