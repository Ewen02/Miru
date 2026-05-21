import { Module } from "@nestjs/common";
import { PrismaModule } from "@shared/infrastructure/prisma/prisma.module";
import { AdminRequiredGuard } from "@auth/admin-required.guard";
import { CreateReportUseCase } from "./application/use-cases/create-report.use-case";
import { ListPendingReportsUseCase } from "./application/use-cases/list-pending-reports.use-case";
import { ResolveReportUseCase } from "./application/use-cases/resolve-report.use-case";
import { REPORT_REPOSITORY } from "./application/tokens";
import { PrismaReportRepository } from "./infrastructure/persistence/prisma-report.repository";
import { ModerationController } from "./infrastructure/http/moderation.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ModerationController],
  providers: [
    CreateReportUseCase,
    ListPendingReportsUseCase,
    ResolveReportUseCase,
    AdminRequiredGuard,
    { provide: REPORT_REPOSITORY, useClass: PrismaReportRepository },
  ],
})
export class ModerationModule {}
