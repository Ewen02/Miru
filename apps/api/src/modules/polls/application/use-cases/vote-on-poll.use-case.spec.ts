import { NotFoundException, ValidationException } from "@shared/domain/domain-exception";
import { PollRepositoryPort, PollWithViewerVote } from "../../domain/ports/poll-repository.port";
import { VoteOnPollUseCase } from "./vote-on-poll.use-case";

function makeRepoMock(): jest.Mocked<PollRepositoryPort> {
  return {
    listPolls: jest.fn(),
    getPoll: jest.fn(),
    vote: jest.fn(),
  };
}

function makePoll(overrides: Partial<PollWithViewerVote["poll"]> = {}): PollWithViewerVote {
  return {
    poll: {
      id: "p1",
      question: "Best 2025 anime?",
      authorName: "Tester",
      closesAt: null,
      totalVotes: 0,
      options: [
        { id: "o1", label: "A", votes: 0 },
        { id: "o2", label: "B", votes: 0 },
      ],
      ...overrides,
    },
    votedOptionId: null,
  };
}

describe("VoteOnPollUseCase", () => {
  let repo: jest.Mocked<PollRepositoryPort>;
  let useCase: VoteOnPollUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    useCase = new VoteOnPollUseCase(repo);
  });

  it("throws NotFound when the poll does not exist", async () => {
    repo.getPoll.mockResolvedValue(null);
    await expect(
      useCase.execute({ pollId: "p1", optionId: "o1", userId: "u1" }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.vote).not.toHaveBeenCalled();
  });

  it("throws Validation when the poll is closed", async () => {
    repo.getPoll.mockResolvedValue(makePoll({ closesAt: new Date(Date.now() - 1000) }));
    await expect(
      useCase.execute({ pollId: "p1", optionId: "o1", userId: "u1" }),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(repo.vote).not.toHaveBeenCalled();
  });

  it("throws NotFound when the option is not part of the poll", async () => {
    repo.getPoll.mockResolvedValue(makePoll());
    await expect(
      useCase.execute({ pollId: "p1", optionId: "nope", userId: "u1" }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.vote).not.toHaveBeenCalled();
  });

  it("records the vote and returns the refreshed poll", async () => {
    const after: PollWithViewerVote = {
      poll: {
        ...makePoll().poll,
        totalVotes: 1,
        options: [
          { id: "o1", label: "A", votes: 1 },
          { id: "o2", label: "B", votes: 0 },
        ],
      },
      votedOptionId: "o1",
    };
    repo.getPoll.mockResolvedValueOnce(makePoll()).mockResolvedValueOnce(after);

    const result = await useCase.execute({ pollId: "p1", optionId: "o1", userId: "u1" });

    expect(repo.vote).toHaveBeenCalledWith("p1", "o1", "u1");
    expect(result.votedOptionId).toBe("o1");
    expect(result.poll.totalVotes).toBe(1);
  });
});
