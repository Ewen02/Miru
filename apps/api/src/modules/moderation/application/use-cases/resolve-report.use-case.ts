import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { ReportRepositoryPort } from "../../domain/ports/report-repository.port";
import { ReportTargetKind } from "../../domain/entities/report.entity";
import { REPORT_REPOSITORY } from "../tokens";

interface Input {
  reportId: string;
  adminId: string;
  /** When true, the offending target is deleted alongside resolving. */
  deleteTarget?: { kind: ReportTargetKind; targetId: string };
}

@Injectable()
export class ResolveReportUseCase implements UseCase<Input, void> {
  constructor(
    @Inject(REPORT_REPOSITORY) private readonly repo: ReportRepositoryPort,
  ) {}

  async execute({ reportId, adminId, deleteTarget }: Input): Promise<void> {
    if (deleteTarget) {
      await this.repo.deleteTarget(deleteTarget.kind, deleteTarget.targetId);
    }
    await this.repo.resolve(reportId, adminId);
  }
}
