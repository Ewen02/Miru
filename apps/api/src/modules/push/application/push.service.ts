import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  PushSubscriptionRepositoryPort,
} from "../domain/ports/push-subscription.port";
import { PushPayload, WebPushSenderPort } from "../domain/ports/web-push.port";
import { PUSH_SUBSCRIPTION_REPOSITORY, WEB_PUSH_SENDER } from "./tokens";

/**
 * Facade exposed to other modules (notably notification) to fan out a payload
 * to every push subscription a user has. Stale (410 Gone) subscriptions are
 * pruned on the fly. Failures are swallowed — push must never block the
 * originating action.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @Inject(PUSH_SUBSCRIPTION_REPOSITORY)
    private readonly repo: PushSubscriptionRepositoryPort,
    @Inject(WEB_PUSH_SENDER) private readonly sender: WebPushSenderPort,
  ) {}

  async pushToUser(userId: string, payload: PushPayload): Promise<void> {
    let subs;
    try {
      subs = await this.repo.findByUserId(userId);
    } catch (err) {
      this.logger.warn(`push: lookup failed for ${userId}: ${(err as Error).message}`);
      return;
    }
    if (subs.length === 0) return;

    await Promise.all(
      subs.map(async (sub) => {
        const outcome = await this.sender.send(sub, payload);
        if (outcome === "gone") {
          await this.repo.deleteByEndpoint(sub.endpoint).catch(() => undefined);
        }
      }),
    );
  }
}
