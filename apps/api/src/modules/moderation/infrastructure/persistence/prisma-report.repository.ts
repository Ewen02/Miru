import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  ReportCreateInput,
  ReportRepositoryPort,
} from "../../domain/ports/report-repository.port";
import {
  ReportEntity,
  ReportReason,
  ReportTargetKind,
  ReportWithPreview,
} from "../../domain/entities/report.entity";

function mapReport(row: {
  id: string;
  reporterId: string;
  resolvedById: string | null;
  targetKind: string;
  targetId: string;
  reason: string;
  details: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
}): ReportEntity {
  return {
    id: row.id,
    reporterId: row.reporterId,
    resolvedById: row.resolvedById,
    targetKind: row.targetKind as ReportTargetKind,
    targetId: row.targetId,
    reason: row.reason as ReportReason,
    details: row.details,
    resolved: row.resolved,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class PrismaReportRepository implements ReportRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: ReportCreateInput): Promise<ReportEntity> {
    const row = await this.prisma.report.create({
      data: {
        reporterId: input.reporterId,
        targetKind: input.targetKind,
        targetId: input.targetId,
        reason: input.reason,
        details: input.details,
      },
    });
    return mapReport(row);
  }

  async listPending(limit: number): Promise<ReportWithPreview[]> {
    const rows = await this.prisma.report.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { reporter: { select: { name: true } } },
    });
    if (rows.length === 0) return [];

    const reviewIds = rows.filter((r) => r.targetKind === "REVIEW").map((r) => r.targetId);
    const listIds = rows.filter((r) => r.targetKind === "LIST").map((r) => r.targetId);

    const [reviews, lists] = await Promise.all([
      reviewIds.length
        ? this.prisma.review.findMany({
            where: { id: { in: reviewIds } },
            select: {
              id: true,
              body: true,
              user: { select: { name: true } },
              anime: { select: { slug: true } },
            },
          })
        : Promise.resolve([]),
      listIds.length
        ? this.prisma.list.findMany({
            where: { id: { in: listIds } },
            select: {
              id: true,
              slug: true,
              title: true,
              user: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    const reviewById = new Map(reviews.map((r) => [r.id, r]));
    const listById = new Map(lists.map((l) => [l.id, l]));

    return rows.map((row) => {
      const base = mapReport(row);
      let label = "(supprimé)";
      let href: string | null = null;
      let authorName: string | null = null;
      if (row.targetKind === "REVIEW") {
        const r = reviewById.get(row.targetId);
        if (r) {
          label = (r.body ?? "").slice(0, 120) || "(sans contenu)";
          href = `/anime/${r.anime.slug}`;
          authorName = r.user.name;
        }
      } else if (row.targetKind === "LIST") {
        const l = listById.get(row.targetId);
        if (l) {
          label = l.title;
          href = `/lists/${l.slug}`;
          authorName = l.user.name;
        }
      }
      return { ...base, reporterName: row.reporter.name, target: { label, href, authorName } };
    });
  }

  async resolve(reportId: string, adminId: string): Promise<void> {
    await this.prisma.report.update({
      where: { id: reportId },
      data: { resolved: true, resolvedAt: new Date(), resolvedById: adminId },
    });
  }

  async deleteTarget(kind: ReportTargetKind, targetId: string): Promise<boolean> {
    if (kind === "REVIEW") {
      const r = await this.prisma.review.deleteMany({ where: { id: targetId } });
      return r.count > 0;
    }
    if (kind === "LIST") {
      const r = await this.prisma.list.deleteMany({ where: { id: targetId } });
      return r.count > 0;
    }
    return false;
  }
}
