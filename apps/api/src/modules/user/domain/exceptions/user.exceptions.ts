import { NotFoundException } from "@shared/domain/domain-exception";

export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super("User", id);
  }
}
