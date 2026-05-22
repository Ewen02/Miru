// Sentry instrumentation must be the very first import.
import "./instrument";

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import { raw } from "express";
import { AppModule } from "./app.module";
import { DomainExceptionFilter } from "@shared/infrastructure/filters/domain-exception.filter";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

async function bootstrap() {
  // Better Auth needs to read the raw request body on /api/auth/*, so we
  // disable the global Nest body parser; @thallesp/nestjs-better-auth wires
  // a scoped JSON parser for the rest of the app.
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: WEB_ORIGIN,
    credentials: true,
  });

  // Stripe webhook needs the raw body to verify the signature. Must be
  // mounted before the better-auth module wires its JSON parser elsewhere.
  app.use("/billing/webhook", raw({ type: "application/json" }));

  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger — `/api/docs` in dev and staging. Disabled in production unless
  // ENABLE_SWAGGER=true is set (so the schema doesn't leak by default once
  // the app is publicly deployed).
  const swaggerExposed = !IS_PRODUCTION || process.env.ENABLE_SWAGGER === "true";
  if (swaggerExposed) {
    const config = new DocumentBuilder()
      .setTitle("Miru API")
      .setDescription(
        "Backend NestJS hexagonal pour Miru. Auth via cookie Better Auth — utilise " +
          '`/login` côté web pour obtenir une session, puis "Try it out" depuis cette UI.',
      )
      .setVersion("0.5.0")
      .addCookieAuth("better-auth.session_token", { type: "apiKey", in: "cookie" })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
      customSiteTitle: "Miru API — docs",
    });
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
