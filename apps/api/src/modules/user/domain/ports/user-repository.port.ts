import { UserEntity } from "../entities/user.entity";

export interface UserRepositoryPort {
  findById(id: string): Promise<UserEntity | null>;
}
