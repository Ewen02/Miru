import { NotFoundException } from "@shared/domain/domain-exception";
import { CharacterEntity } from "../../domain/entities/character.entity";
import { CharacterRepositoryPort } from "../../domain/ports/character-repository.port";
import { GetCharacterDetailUseCase } from "./get-character-detail.use-case";

function makeRepoMock(): jest.Mocked<CharacterRepositoryPort> {
  return {
    findById: jest.fn(),
    appearancesByCharacterId: jest.fn(),
    voiceCreditsByCharacterId: jest.fn(),
  };
}

describe("GetCharacterDetailUseCase", () => {
  let repo: jest.Mocked<CharacterRepositoryPort>;
  let useCase: GetCharacterDetailUseCase;

  beforeEach(() => {
    repo = makeRepoMock();
    useCase = new GetCharacterDetailUseCase(repo);
  });

  it("throws 404 when the character does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ id: "missing" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("aggregates appearances and voice credits in parallel", async () => {
    const character = CharacterEntity.create("c1", {
      name: "Yor Forger",
      nameJp: null,
      imageUrl: null,
    });
    repo.findById.mockResolvedValue(character);
    repo.appearancesByCharacterId.mockResolvedValue([]);
    repo.voiceCreditsByCharacterId.mockResolvedValue([]);

    const result = await useCase.execute({ id: "c1" });

    expect(repo.findById).toHaveBeenCalledWith("c1");
    expect(repo.appearancesByCharacterId).toHaveBeenCalledWith("c1");
    expect(repo.voiceCreditsByCharacterId).toHaveBeenCalledWith("c1");
    expect(result.character).toBe(character);
  });
});
