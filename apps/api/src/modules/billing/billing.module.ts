import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { StartCheckoutUseCase } from "./application/use-cases/start-checkout.use-case";
import { OpenPortalUseCase } from "./application/use-cases/open-portal.use-case";
import { GetBillingStatusUseCase } from "./application/use-cases/get-billing-status.use-case";
import { HandleWebhookUseCase } from "./application/use-cases/handle-webhook.use-case";
import { BILLING_PROVIDER, BILLING_REPOSITORY } from "./application/tokens";
import { PrismaBillingRepository } from "./infrastructure/persistence/prisma-billing.repository";
import { StripeAdapter } from "./infrastructure/external/stripe.adapter";
import { BillingController } from "./infrastructure/http/billing.controller";

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [
    StartCheckoutUseCase,
    OpenPortalUseCase,
    GetBillingStatusUseCase,
    HandleWebhookUseCase,
    { provide: BILLING_REPOSITORY, useClass: PrismaBillingRepository },
    { provide: BILLING_PROVIDER, useClass: StripeAdapter },
  ],
  exports: [GetBillingStatusUseCase],
})
export class BillingModule {}
