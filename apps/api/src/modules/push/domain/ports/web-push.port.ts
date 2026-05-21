import { PushSubscriptionRecord } from "./push-subscription.port";

export interface PushPayload {
  title: string;
  body: string | null;
  url: string | null;
  icon: string | null;
}

/**
 * Out port — actually delivers a payload to a subscription endpoint via VAPID.
 * Implementations should swallow 410 "gone" responses and let the use case
 * react by deleting the stale subscription.
 */
export interface WebPushSenderPort {
  send(sub: PushSubscriptionRecord, payload: PushPayload): Promise<"ok" | "gone" | "error">;
}
