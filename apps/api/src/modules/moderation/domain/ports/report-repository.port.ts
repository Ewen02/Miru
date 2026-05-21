import {
  ReportEntity,
  ReportReason,
  ReportTargetKind,
  ReportWithPreview,
} from "../entities/report.entity";

export interface ReportCreateInput {
  reporterId: string;
  targetKind: ReportTargetKind;
  targetId: string;
  reason: ReportReason;
  details: string | null;
}

export interface ReportRepositoryPort {
  create(input: ReportCreateInput): Promise<ReportEntity>;
  /** Pending queue, newest first. Joins reporter + target preview. */
  listPending(limit: number): Promise<ReportWithPreview[]>;
  resolve(reportId: string, adminId: string): Promise<void>;
  /** Hard delete of the offending target. Returns true when the row existed. */
  deleteTarget(kind: ReportTargetKind, targetId: string): Promise<boolean>;
}
