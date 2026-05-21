import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import {
  ReportCreateInput,
  ReportRepositoryPort,
} from "../../domain/ports/report-repository.port";
import { ReportEntity } from "../../domain/entities/report.entity";
import { REPORT_REPOSITORY } from "../tokens";

@Injectable()
export class CreateReportUseCase implements UseCase<ReportCreateInput, ReportEntity> {
  constructor(
    @Inject(REPORT_REPOSITORY) private readonly repo: ReportRepositoryPort,
  ) {}

  execute(input: ReportCreateInput): Promise<ReportEntity> {
    return this.repo.create(input);
  }
}
