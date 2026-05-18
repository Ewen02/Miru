import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { PlatformEntity } from "../../domain/entities/platform.entity";
import {
  PlatformRepositoryPort,
  PlatformUpsertInput,
} from "../../domain/ports/platform-repository.port";

@Injectable()
export class PrismaPlatformRepository implements PlatformRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PlatformEntity[]> {
    const records = await this.prisma.platform.findMany({
      orderBy: { name: "asc" },
    });
    return records.map((r) =>
      PlatformEntity.create(r.id, {
        name: r.name,
        slug: r.slug,
        iconUrl: r.iconUrl,
        color: r.color,
        baseUrl: r.baseUrl,
      }),
    );
  }

  async upsertBySlug(input: PlatformUpsertInput): Promise<PlatformEntity> {
    const record = await this.prisma.platform.upsert({
      where: { slug: input.slug },
      create: input,
      update: {
        name: input.name,
        iconUrl: input.iconUrl,
        color: input.color,
        baseUrl: input.baseUrl,
      },
    });
    return PlatformEntity.create(record.id, {
      name: record.name,
      slug: record.slug,
      iconUrl: record.iconUrl,
      color: record.color,
      baseUrl: record.baseUrl,
    });
  }
}
