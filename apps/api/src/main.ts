import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DomainExceptionFilter } from "@shared/infrastructure/filters/domain-exception.filter";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

async function bootstrap() {
  // Better Auth needs to read the raw request body on /api/auth/*, so we
  // disable the global Nest body parser; @thallesp/nestjs-better-auth wires
  // a scoped JSON parser for the rest of the app.
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({
    origin: WEB_ORIGIN,
    credentials: true,
  });

  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
