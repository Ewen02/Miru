import { ReportEntity } from "../entities/report.entity";
import { ReportRepositoryPort } from "../ports/report-repository.port";

export function makeReportRepoMock(): jest.Mocked<ReportRepositoryPort> {
  return {
    create: jest.fn(),
    listPending: jest.fn(),
    resolve: jest.fn(),
    deleteTarget: jest.fn(),
  };
}

export function makeReportEntity(overrides: Partial<ReportEntity> = {}): ReportEntity {
  return {
    id: "r1",
    reporterId: "u1",
    resolvedById: null,
    targetKind: "REVIEW",
    targetId: "rev1",
    reason: "SPAM",
    details: null,
    resolved: false,
    resolvedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
