import { Body, Controller, Delete, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { SubscribePushUseCase } from "../../application/use-cases/subscribe-push.use-case";
import { UnsubscribePushUseCase } from "../../application/use-cases/unsubscribe-push.use-case";
import { SubscribePushDto } from "../../application/dtos/subscribe-push.dto";

@Controller("push")
export class PushController {
  constructor(
    private readonly subscribe: SubscribePushUseCase,
    private readonly unsubscribe: UnsubscribePushUseCase,
  ) {}

  /**
   * Public — the web client needs the VAPID public key to call
   * `pushManager.subscribe({ applicationServerKey })`. Returns null when push
   * is not configured in this environment, so the UI can hide the toggle.
   */
  @Get("public-key")
  publicKey(): { publicKey: string | null } {
    return { publicKey: process.env.VAPID_PUBLIC_KEY ?? null };
  }

  @Post("subscribe")
  @UseGuards(AuthRequiredGuard)
  async sub(
    @CurrentUserId() userId: string,
    @Body() body: SubscribePushDto,
    @Headers("user-agent") userAgent: string | undefined,
  ): Promise<{ ok: true }> {
    await this.subscribe.execute({
      userId,
      subscription: { endpoint: body.endpoint, p256dh: body.p256dh, auth: body.auth },
      userAgent: userAgent ?? null,
    });
    return { ok: true };
  }

  @Delete("subscribe")
  @UseGuards(AuthRequiredGuard)
  async unsub(@Body() body: { endpoint: string }): Promise<{ ok: true }> {
    await this.unsubscribe.execute({ endpoint: body.endpoint });
    return { ok: true };
  }
}
