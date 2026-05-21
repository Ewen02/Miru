import { NotificationRepositoryPort } from "../../domain/ports/notification-repository.port";
import { makeNotificationRepoMock } from "../../domain/__fixtures__/notification-repo.mock";
import { MarkAllNotificationsReadUseCase } from "./mark-all-notifications-read.use-case";

describe("MarkAllNotificationsReadUseCase", () => {
  let repo: jest.Mocked<NotificationRepositoryPort>;
  let useCase: MarkAllNotificationsReadUseCase;

  beforeEach(() => {
    repo = makeNotificationRepoMock();
    useCase = new MarkAllNotificationsReadUseCase(repo);
  });

  it("returns the number of rows updated by the repository", async () => {
    repo.markAllRead.mockResolvedValue(7);
    const result = await useCase.execute({ userId: "u1" });
    expect(repo.markAllRead).toHaveBeenCalledWith("u1");
    expect(result.updated).toBe(7);
  });
});
