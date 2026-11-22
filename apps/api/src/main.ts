import "reflect-metadata";
import { type INestApplication, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { buildAppModule } from "./app.module";
import { type AppConfig, loadConfig } from "./config";

export async function createApp(config: AppConfig): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(buildAppModule(config), {
    logger: config.NODE_ENV === "test" ? false : undefined,
    rawBody: false,
  });
  app.use(helmet());
  app.useBodyParser("json", { limit: "200kb" });
  app.useBodyParser("text", { type: ["text/csv", "text/plain"], limit: "2mb" });
  app.enableCors({ origin: config.CORS_ORIGINS.split(",").map((s) => s.trim()), credentials: false });
  app.setGlobalPrefix("v1");
  app.enableShutdownHooks();
  return app;
}

async function bootstrap() {
  const config = loadConfig();
  const app = await createApp(config);
  await app.listen(config.API_PORT);
  Logger.log(`Foundura API listening on http://localhost:${config.API_PORT}/v1`, "Bootstrap");
}

if (require.main === module) {
  bootstrap();
}
