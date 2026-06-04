import { makeReportRepoMock } from "../../domain/__fixtures__/report-mocks";
import { ReportRepositoryPort } from "../../domain/ports/report-repository.port";
import { ResolveReportUseCase } from "./resolve-report.use-case";

describe("ResolveReportUseCase", () => {
  let repo: jest.Mocked<ReportRepositoryPort>;
  let useCase: ResolveReportUseCase;

  beforeEach(() => {
    repo = makeReportRepoMock();
    useCase = new ResolveReportUseCase(repo);
  });

  it("resolves without deleting when no target is given", async () => {
    await useCase.execute({ reportId: "r1", adminId: "admin1" });
    expect(repo.deleteTarget).not.toHaveBeenCalled();
    expect(repo.resolve).toHaveBeenCalledWith("r1", "admin1");
  });

  it("deletes the target before resolving when requested", async () => {
    const order: string[] = [];
    repo.deleteTarget.mockImplementation(() => {
      order.push("delete");
      return Promise.resolve(true);
    });
    repo.resolve.mockImplementation(() => {
      order.push("resolve");
      return Promise.resolve();
    });

    await useCase.execute({
      reportId: "r1",
      adminId: "admin1",
      deleteTarget: { kind: "REVIEW", targetId: "rev1" },
    });

    expect(repo.deleteTarget).toHaveBeenCalledWith("REVIEW", "rev1");
    expect(repo.resolve).toHaveBeenCalledWith("r1", "admin1");
    expect(order).toEqual(["delete", "resolve"]);
  });
});
