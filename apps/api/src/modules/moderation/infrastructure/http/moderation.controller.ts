import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { AdminRequiredGuard } from "@auth/admin-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { CreateReportUseCase } from "../../application/use-cases/create-report.use-case";
import { ListPendingReportsUseCase } from "../../application/use-cases/list-pending-reports.use-case";
import { ResolveReportUseCase } from "../../application/use-cases/resolve-report.use-case";
import { CreateReportDto } from "../../application/dtos/create-report.dto";
import { ReportTargetKind } from "../../domain/entities/report.entity";

@Controller()
export class ModerationController {
  constructor(
    private readonly createReport: CreateReportUseCase,
    private readonly listPending: ListPendingReportsUseCase,
    private readonly resolveReport: ResolveReportUseCase,
  ) {}

  /** Any authenticated user can file a report. */
  @Post("reports")
  @UseGuards(AuthRequiredGuard)
  async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateReportDto,
  ): Promise<{ id: string }> {
    const report = await this.createReport.execute({
      reporterId: userId,
      targetKind: body.targetKind,
      targetId: body.targetId,
      reason: body.reason,
      details: body.details ?? null,
    });
    return { id: report.id };
  }

  /** Admin queue. */
  @Get("admin/reports")
  @UseGuards(AuthRequiredGuard, AdminRequiredGuard)
  async queue(@Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number) {
    const reports = await this.listPending.execute({ limit });
    return reports.map((r) => ({
      id: r.id,
      targetKind: r.targetKind,
      targetId: r.targetId,
      reason: r.reason,
      details: r.details,
      createdAt: r.createdAt.toISOString(),
      reporterName: r.reporterName,
      target: r.target,
    }));
  }

  /** Resolve without deleting the target. */
  @Post("admin/reports/:id/dismiss")
  @UseGuards(AuthRequiredGuard, AdminRequiredGuard)
  async dismiss(
    @Param("id") id: string,
    @CurrentUserId() adminId: string,
  ): Promise<{ ok: true }> {
    await this.resolveReport.execute({ reportId: id, adminId });
    return { ok: true };
  }

  /** Resolve AND delete the offending target. */
  @Post("admin/reports/:id/delete-target")
  @UseGuards(AuthRequiredGuard, AdminRequiredGuard)
  async deleteTarget(
    @Param("id") id: string,
    @Body() body: { targetKind: ReportTargetKind; targetId: string },
    @CurrentUserId() adminId: string,
  ): Promise<{ ok: true }> {
    await this.resolveReport.execute({
      reportId: id,
      adminId,
      deleteTarget: { kind: body.targetKind, targetId: body.targetId },
    });
    return { ok: true };
  }
}
