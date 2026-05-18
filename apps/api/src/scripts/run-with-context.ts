import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplicationContext } from "@nestjs/common";
import { AppModule } from "../app.module";

/**
 * Bootstrap a NestJS application context for one-shot CLI scripts.
 * Handles the boilerplate (logger config, try/finally close, process.exit on error)
 * so each script can focus on its actual logic.
 */
export async function runWithContext(
  label: string,
  task: (app: INestApplicationContext) => Promise<void>,
): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "warn", "error"],
  });

  try {
    await task(app);
  } catch (err) {
    console.error(`✗ ${label} failed:`, err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}
