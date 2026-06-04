import { makeReportEntity, makeReportRepoMock } from "../../domain/__fixtures__/report-mocks";
import { ReportRepositoryPort } from "../../domain/ports/report-repository.port";
import { CreateReportUseCase } from "./create-report.use-case";

describe("CreateReportUseCase", () => {
  let repo: jest.Mocked<ReportRepositoryPort>;
  let useCase: CreateReportUseCase;

  beforeEach(() => {
    repo = makeReportRepoMock();
    useCase = new CreateReportUseCase(repo);
  });

  it("delegates the report to the repository and returns the created entity", async () => {
    const created = makeReportEntity({ reason: "ABUSE", details: "rude" });
    repo.create.mockResolvedValue(created);

    const input = {
      reporterId: "u1",
      targetKind: "REVIEW" as const,
      targetId: "rev1",
      reason: "ABUSE" as const,
      details: "rude",
    };
    const result = await useCase.execute(input);

    expect(repo.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
