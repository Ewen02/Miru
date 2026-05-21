import { NotFoundException } from "@shared/domain/domain-exception";
import { VoiceActorEntity } from "../../domain/entities/voice-actor.entity";
import { VoiceActorRepositoryPort } from "../../domain/ports/voice-actor-repository.port";
import { GetVoiceActorDetailUseCase } from "./get-voice-actor-detail.use-case";

function makeRepoMock(): jest.Mocked<VoiceActorRepositoryPort> {
  return {
    findById: jest.fn(),
    rolesByVoiceActorId: jest.fn(),
    statsByVoiceActorId: jest.fn(),
  };
}

describe("GetVoiceActorDetailUseCase", () => {
  let repo: jest.Mocked<VoiceActorRepositoryPort>;
  let useCase: GetVoiceActorDetailUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    useCase = new GetVoiceActorDetailUseCase(repo);
  });

  it("throws 404 when the voice actor does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: "missing" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("returns voice actor + stats + roles for a known id", async () => {
    const va = VoiceActorEntity.create("va1", { name: "Saori Hayami" });
    repo.findById.mockResolvedValue(va);
    repo.statsByVoiceActorId.mockResolvedValue({ animeCount: 84, roleCount: 127 });
    repo.rolesByVoiceActorId.mockResolvedValue([]);

    const result = await useCase.execute({ id: "va1" });

    expect(result.voiceActor).toBe(va);
    expect(result.stats.animeCount).toBe(84);
  });
});
