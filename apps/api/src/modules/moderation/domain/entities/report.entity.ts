export type ReportTargetKind = "REVIEW" | "LIST";
export type ReportReason = "SPAM" | "ABUSE" | "OFFTOPIC" | "OTHER";

export interface ReportEntity {
  id: string;
  reporterId: string;
  resolvedById: string | null;
  targetKind: ReportTargetKind;
  targetId: string;
  reason: ReportReason;
  details: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
}

export interface ReportTargetPreview {
  /** Short label shown in the queue (review body excerpt or list title). */
  label: string;
  /** Deep-link to the target so the moderator can inspect it. */
  href: string | null;
  /** Display name of the offending user. */
  authorName: string | null;
}

export interface ReportWithPreview extends ReportEntity {
  target: ReportTargetPreview;
  reporterName: string;
}
