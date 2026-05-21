import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { StartCheckoutUseCase } from "../../application/use-cases/start-checkout.use-case";
import { OpenPortalUseCase } from "../../application/use-cases/open-portal.use-case";
import {
  GetBillingStatusUseCase,
  BillingStatusOutput,
} from "../../application/use-cases/get-billing-status.use-case";
import { HandleWebhookUseCase } from "../../application/use-cases/handle-webhook.use-case";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

@Controller("billing")
export class BillingController {
  constructor(
    private readonly startCheckout: StartCheckoutUseCase,
    private readonly openPortal: OpenPortalUseCase,
    private readonly getStatus: GetBillingStatusUseCase,
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
  ) {}

  @Get("status")
  @UseGuards(AuthRequiredGuard)
  status(@CurrentUserId() userId: string): Promise<BillingStatusOutput> {
    return this.getStatus.execute({ userId });
  }

  @Post("checkout")
  @UseGuards(AuthRequiredGuard)
  async checkout(@Session() session: UserSession): Promise<{ url: string }> {
    return this.startCheckout.execute({
      userId: session.user.id,
      email: session.user.email,
      successUrl: `${WEB_ORIGIN}/settings?upgraded=1`,
      cancelUrl: `${WEB_ORIGIN}/pricing?canceled=1`,
    });
  }

  @Post("portal")
  @UseGuards(AuthRequiredGuard)
  async portal(@CurrentUserId() userId: string): Promise<{ url: string }> {
    return this.openPortal.execute({
      userId,
      returnUrl: `${WEB_ORIGIN}/settings`,
    });
  }

  /**
   * Stripe webhook — signature verification protects this endpoint; no auth
   * guard. Raw body is mounted via express.raw() in main.ts.
   */
  @Post("webhook")
  @HttpCode(200)
  async webhook(
    @Req() req: Request & { rawBody?: Buffer; body: Buffer | unknown },
    @Headers("stripe-signature") signature: string,
  ): Promise<{ received: true }> {
    const raw = (req.rawBody ?? req.body) as Buffer;
    await this.handleWebhookUseCase.execute({ rawBody: raw, signature });
    return { received: true };
  }
}
