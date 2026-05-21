import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import webpush from "web-push";
import { PushSubscriptionRecord } from "../../domain/ports/push-subscription.port";
import { PushPayload, WebPushSenderPort } from "../../domain/ports/web-push.port";

@Injectable()
export class WebPushAdapter implements WebPushSenderPort, OnModuleInit {
  private readonly logger = new Logger(WebPushAdapter.name);
  private enabled = false;

  onModuleInit(): void {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@miru.app";
    if (!publicKey || !privateKey) {
      this.logger.warn("VAPID keys missing — push notifications are disabled.");
      return;
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.enabled = true;
  }

  async send(
    sub: PushSubscriptionRecord,
    payload: PushPayload,
  ): Promise<"ok" | "gone" | "error"> {
    if (!this.enabled) return "error";
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 24 },
      );
      return "ok";
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) return "gone";
      this.logger.warn(`web-push failed (${status ?? "n/a"}): ${(err as Error).message}`);
      return "error";
    }
  }
}
