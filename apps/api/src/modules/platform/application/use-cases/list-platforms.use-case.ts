import { Injectable, Inject } from "@nestjs/common";
import { UseCase } from "@shared/domain/use-case.base";
import { PlatformEntity } from "../../domain/entities/platform.entity";
import { PlatformRepositoryPort } from "../../domain/ports/platform-repository.port";
import { PLATFORM_REPOSITORY } from "../tokens";

@Injectable()
export class ListPlatformsUseCase implements UseCase<void, PlatformEntity[]> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly repo: PlatformRepositoryPort,
  ) {}

  async execute(): Promise<PlatformEntity[]> {
    return this.repo.findAll();
  }
}
