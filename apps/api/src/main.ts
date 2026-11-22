import "reflect-metadata";
import { type INestApplication, Logger } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { buildAppModule } from "./app.module";
import { type AppConfig, loadConfig } from "./config";
import { AlertingExceptionFilter } from "./ops/alerting-exception.filter";
import { OpsService } from "./ops/ops.service";

export async function createApp(config: AppConfig): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(buildAppModule(config), {
    logger: config.NODE_ENV === "test" ? false : undefined,
    rawBody: false,
  });
  // Rate limits key on the visitor's IP, which the web server forwards in X-Forwarded-For.
  if (config.TRUST_PROXY > 0) app.set("trust proxy", config.TRUST_PROXY);
  app.use(helmet());
  app.useBodyParser("json", { limit: "200kb" });
  app.useBodyParser("text", { type: ["text/csv", "text/plain"], limit: "2mb" });
  app.enableCors({ origin: config.CORS_ORIGINS.split(",").map((s) => s.trim()), credentials: false });
  app.setGlobalPrefix("v1");
  app.useGlobalFilters(new AlertingExceptionFilter(app.get(OpsService), app.get(HttpAdapterHost).httpAdapter));
  app.enableShutdownHooks();
  return app;
}

async function bootstrap() {
  const config = loadConfig();
  const app = await createApp(config);
  await app.listen(config.API_PORT, "0.0.0.0");
  if (!config.ADMIN_EMAILS.trim()) Logger.warn("ADMIN_EMAILS is empty: nobody can open the editor console", "Bootstrap");
  if (config.NODE_ENV === "production" && !config.OPS_ALERT_EMAIL) Logger.warn("OPS_ALERT_EMAIL is empty: server errors and stalled jobs won't be emailed to anyone", "Bootstrap");
  Logger.log(`Foundura API listening on http://localhost:${config.API_PORT}/v1`, "Bootstrap");
}

if (require.main === module) {
  bootstrap();
}
