import { makeReportRepoMock } from "../../domain/__fixtures__/report-mocks";
import { ReportRepositoryPort } from "../../domain/ports/report-repository.port";
import { ListPendingReportsUseCase } from "./list-pending-reports.use-case";

describe("ListPendingReportsUseCase", () => {
  let repo: jest.Mocked<ReportRepositoryPort>;
  let useCase: ListPendingReportsUseCase;

  beforeEach(() => {
    repo = makeReportRepoMock();
    useCase = new ListPendingReportsUseCase(repo);
    repo.listPending.mockResolvedValue([]);
  });

  it("applies the default limit of 50 when none is given", async () => {
    await useCase.execute({});
    expect(repo.listPending).toHaveBeenCalledWith(50);
  });

  it("forwards an explicit limit", async () => {
    await useCase.execute({ limit: 10 });
    expect(repo.listPending).toHaveBeenCalledWith(10);
  });
});
