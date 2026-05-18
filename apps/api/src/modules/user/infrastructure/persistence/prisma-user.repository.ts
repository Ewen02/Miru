import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return UserEntity.create(record.id, {
      email: record.email,
      name: record.name,
      emailVerified: record.emailVerified,
      image: record.image,
    });
  }
}
