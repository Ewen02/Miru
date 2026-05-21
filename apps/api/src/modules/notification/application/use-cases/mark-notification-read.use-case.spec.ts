import { NotificationRepositoryPort } from "../../domain/ports/notification-repository.port";
import { makeNotificationRepoMock } from "../../domain/__fixtures__/notification-repo.mock";
import { MarkNotificationReadUseCase } from "./mark-notification-read.use-case";

describe("MarkNotificationReadUseCase", () => {
  let repo: jest.Mocked<NotificationRepositoryPort>;
  let useCase: MarkNotificationReadUseCase;

  beforeEach(() => {
    repo = makeNotificationRepoMock();
    useCase = new MarkNotificationReadUseCase(repo);
  });

  it("forwards the scoped (notificationId, userId) tuple to the repository", async () => {
    await useCase.execute({ userId: "u1", notificationId: "notif-1" });
    expect(repo.markRead).toHaveBeenCalledWith("notif-1", "u1");
  });
});
