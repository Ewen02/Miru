import { Injectable } from "@nestjs/common";
import { Prisma } from "@miru/db";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import {
  ClubDetailView,
  ClubRepositoryPort,
  ClubSummaryView,
} from "../../domain/ports/club-repository.port";

const CLUB_DETAIL_INCLUDE = {
  owner: { select: { name: true } },
  _count: { select: { members: true } },
  posts: {
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { id: true, name: true, image: true } } },
  },
} satisfies Prisma.ClubInclude;

type ClubDetailRow = Prisma.ClubGetPayload<{ include: typeof CLUB_DETAIL_INCLUDE }>;

@Injectable()
export class PrismaClubRepository implements ClubRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listClubs(viewerId: string | null, limit: number): Promise<ClubSummaryView[]> {
    const rows = await this.prisma.club.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { _count: { select: { members: true } } },
    });

    let memberClubIds = new Set<string>();
    if (viewerId) {
      const memberships = await this.prisma.clubMember.findMany({
        where: { userId: viewerId, clubId: { in: rows.map((row) => row.id) } },
        select: { clubId: true },
      });
      memberClubIds = new Set(memberships.map((m) => m.clubId));
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      memberCount: row._count.members,
      isMember: memberClubIds.has(row.id),
    }));
  }

  async getClub(slug: string, viewerId: string | null): Promise<ClubDetailView | null> {
    const row = await this.prisma.club.findUnique({
      where: { slug },
      include: CLUB_DETAIL_INCLUDE,
    });
    if (!row) return null;

    let isMember = false;
    if (viewerId) {
      const membership = await this.prisma.clubMember.findUnique({
        where: { clubId_userId: { clubId: row.id, userId: viewerId } },
        select: { id: true },
      });
      isMember = membership !== null;
    }

    return this.toDetailView(row, isMember);
  }

  async createClub(input: {
    name: string;
    slug: string;
    description: string | null;
    ownerId: string;
  }): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      const club = await tx.club.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          ownerId: input.ownerId,
        },
      });
      await tx.clubMember.create({
        data: { clubId: club.id, userId: input.ownerId },
      });
      return club.slug;
    });
  }

  async join(clubId: string, userId: string): Promise<void> {
    await this.prisma.clubMember.upsert({
      where: { clubId_userId: { clubId, userId } },
      create: { clubId, userId },
      update: {},
    });
  }

  async leave(clubId: string, userId: string): Promise<void> {
    await this.prisma.clubMember.deleteMany({ where: { clubId, userId } });
  }

  async addPost(clubId: string, authorId: string, body: string): Promise<void> {
    await this.prisma.clubPost.create({ data: { clubId, authorId, body } });
  }

  async findIdBySlug(slug: string): Promise<string | null> {
    const row = await this.prisma.club.findUnique({
      where: { slug },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private toDetailView(row: ClubDetailRow, isMember: boolean): ClubDetailView {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      memberCount: row._count.members,
      isMember,
      ownerName: row.owner.name,
      posts: row.posts.map((post) => ({
        id: post.id,
        body: post.body,
        createdAt: post.createdAt,
        author: {
          id: post.author.id,
          name: post.author.name,
          image: post.author.image,
        },
      })),
    };
  }
}
