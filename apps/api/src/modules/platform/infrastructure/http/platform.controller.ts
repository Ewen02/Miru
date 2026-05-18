import { Controller, Get } from "@nestjs/common";
import { ListPlatformsUseCase } from "../../application/use-cases/list-platforms.use-case";

interface PlatformDto {
  slug: string;
  name: string;
  iconUrl: string | null;
  color: string | null;
}

@Controller("platforms")
export class PlatformController {
  constructor(private readonly listPlatforms: ListPlatformsUseCase) {}

  @Get()
  async list(): Promise<PlatformDto[]> {
    const platforms = await this.listPlatforms.execute();
    return platforms.map((p) => ({
      slug: p.slug,
      name: p.name,
      iconUrl: p.iconUrl,
      color: p.color,
    }));
  }
}
