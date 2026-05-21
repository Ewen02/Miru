import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { ReportRepositoryPort } from "../../domain/ports/report-repository.port";
import { ReportWithPreview } from "../../domain/entities/report.entity";
import { REPORT_REPOSITORY } from "../tokens";

interface Input {
  limit?: number;
}

const DEFAULT_LIMIT = 50;

@Injectable()
export class ListPendingReportsUseCase implements UseCase<Input, ReportWithPreview[]> {
  constructor(
    @Inject(REPORT_REPOSITORY) private readonly repo: ReportRepositoryPort,
  ) {}

  execute({ limit }: Input): Promise<ReportWithPreview[]> {
    return this.repo.listPending(limit ?? DEFAULT_LIMIT);
  }
}
