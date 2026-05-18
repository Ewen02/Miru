import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthRequiredGuard } from "@auth/auth-required.guard";
import { CurrentUserId } from "@auth/current-user.decorator";
import { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case";

interface UserDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
}

@Controller("users")
export class UserController {
  constructor(private readonly getCurrentUser: GetCurrentUserUseCase) {}

  @Get("me")
  @UseGuards(AuthRequiredGuard)
  async me(@CurrentUserId() userId: string): Promise<UserDto> {
    const user = await this.getCurrentUser.execute(userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image,
    };
  }
}
