import { Injectable } from "@nestjs/common";
import { ConflictException } from "@shared/domain/domain-exception";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ListEntity } from "../../domain/entities/list.entity";
import {
  CreateListInput,
  ListAnimeItem,
  ListRepositoryPort,
  ListSummary,
  ListWithItems,
  UpdateListInput,
} from "../../domain/ports/list-repository.port";

const PREVIEW_COVER_COUNT = 4;

@Injectable()
export class PrismaListRepository implements ListRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ListSummary[]> {
    const records = await this.prisma.list.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: this.summaryInclude(),
    });
    return records.map((r) => this.toSummary(r));
  }

  async findLikedByUserId(userId: string): Promise<ListSummary[]> {
    const records = await this.prisma.list.findMany({
      where: { likes: { some: { userId } }, isPublic: true },
      orderBy: { updatedAt: "desc" },
      include: this.summaryInclude(),
    });
    return records.map((r) => this.toSummary(r));
  }

  async findPublic(limit: number): Promise<ListSummary[]> {
    const records = await this.prisma.list.findMany({
      where: { isPublic: true },
      orderBy: [{ likes: { _count: "desc" } }, { updatedAt: "desc" }],
      take: limit,
      include: this.summaryInclude(),
    });
    return records.map((r) => this.toSummary(r));
  }

  async findById(id: string): Promise<ListEntity | null> {
    const record = await this.prisma.list.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findWithItems(id: string): Promise<ListWithItems | null> {
    const record = await this.prisma.list.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        items: {
          orderBy: { order: "asc" },
          include: {
            anime: {
              select: {
                id: true,
                slug: true,
                title: true,
                year: true,
                coverUrl: true,
                averageRating: true,
              },
            },
          },
        },
        _count: { select: { likes: true } },
      },
    });
    if (!record) return null;

    const items: ListAnimeItem[] = record.items.map((it) => ({
      animeId: it.anime.id,
      animeSlug: it.anime.slug,
      animeTitle: it.anime.title,
      animeYear: it.anime.year,
      animeCoverUrl: it.anime.coverUrl,
      animeAverageRating: it.anime.averageRating,
      order: it.order,
      note: it.note,
      addedAt: it.addedAt,
    }));

    return {
      list: this.toEntity(record),
      ownerName: record.user.name,
      itemCount: items.length,
      likeCount: record._count.likes,
      items,
    };
  }

  async create(input: CreateListInput): Promise<ListEntity> {
    try {
      const record = await this.prisma.list.create({
        data: {
          userId: input.userId,
          title: input.title,
          description: input.description ?? null,
          slug: input.slug,
          isPublic: input.isPublic ?? true,
        },
      });
      return this.toEntity(record);
    } catch (err) {
      if ((err as { code?: string }).code === "P2002") {
        throw new ConflictException("You already have a list with that name");
      }
      throw err;
    }
  }

  async update(id: string, input: UpdateListInput): Promise<ListEntity> {
    const record = await this.prisma.list.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
      },
    });
    return this.toEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.list.delete({ where: { id } });
  }

  async addItem(listId: string, animeId: string, note?: string | null): Promise<void> {
    // Append at the end — next order = current max + 1.
    const last = await this.prisma.listItem.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    await this.prisma.listItem.create({
      data: {
        listId,
        animeId,
        order: (last?.order ?? 0) + 1,
        note: note ?? null,
      },
    });
  }

  async removeItem(listId: string, animeId: string): Promise<void> {
    await this.prisma.listItem.delete({
      where: { listId_animeId: { listId, animeId } },
    });
  }

  async reorderItems(listId: string, animeIdsInOrder: string[]): Promise<void> {
    // Rewrite the order column for each item. Wrapped in a transaction so the
    // table never sits with duplicate `order` values while updating.
    await this.prisma.$transaction(
      animeIdsInOrder.map((animeId, idx) =>
        this.prisma.listItem.update({
          where: { listId_animeId: { listId, animeId } },
          data: { order: idx + 1 },
        }),
      ),
    );
  }

  async like(userId: string, listId: string): Promise<void> {
    await this.prisma.listLike.upsert({
      where: { userId_listId: { userId, listId } },
      update: {},
      create: { userId, listId },
    });
  }

  async unlike(userId: string, listId: string): Promise<void> {
    await this.prisma.listLike.deleteMany({ where: { userId, listId } });
  }

  async isLikedBy(userId: string, listId: string): Promise<boolean> {
    const row = await this.prisma.listLike.findUnique({
      where: { userId_listId: { userId, listId } },
    });
    return row != null;
  }

  private summaryInclude() {
    return {
      user: { select: { name: true } },
      items: {
        orderBy: { order: "asc" as const },
        take: PREVIEW_COVER_COUNT,
        select: { anime: { select: { coverUrl: true } } },
      },
      _count: { select: { items: true, likes: true } },
    };
  }

  private toSummary(
    record: {
      id: string;
      userId: string;
      title: string;
      description: string | null;
      slug: string;
      isPublic: boolean;
      coverArtSeed: number | null;
      updatedAt: Date;
      user: { name: string };
      items: Array<{ anime: { coverUrl: string | null } }>;
      _count: { items: number; likes: number };
    },
  ): ListSummary {
    return {
      id: record.id,
      userId: record.userId,
      ownerName: record.user.name,
      title: record.title,
      description: record.description,
      slug: record.slug,
      isPublic: record.isPublic,
      coverArtSeed: record.coverArtSeed,
      previewCovers: record.items.map((it) => it.anime.coverUrl),
      itemCount: record._count.items,
      likeCount: record._count.likes,
      updatedAt: record.updatedAt,
    };
  }

  private toEntity(record: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    slug: string;
    isPublic: boolean;
    coverArtSeed: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): ListEntity {
    return ListEntity.create(record.id, {
      userId: record.userId,
      title: record.title,
      description: record.description,
      slug: record.slug,
      isPublic: record.isPublic,
      coverArtSeed: record.coverArtSeed,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
