import { Entity } from "@shared/domain/entity.base";

interface UserProps {
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
}

export class UserEntity extends Entity<UserProps> {
  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get image(): string | null {
    return this.props.image;
  }

  static create(id: string, props: UserProps): UserEntity {
    return new UserEntity(id, props);
  }
}
