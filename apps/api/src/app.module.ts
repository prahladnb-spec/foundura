import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AdminConsoleController } from "./admin/admin-console.controller";
import { AdminController } from "./admin/admin.controller";
import { AdminGuard } from "./admin/admin.guard";
import { AuditService } from "./admin/audit.service";
import { MailerService } from "./mail/mailer.service";
import { HealthController } from "./health/health.controller";
import { AdminDigestController, DigestController } from "./digest/digest.controller";
import { DigestScheduler } from "./digest/digest.scheduler";
import { DigestService } from "./digest/digest.service";
import { AuthController } from "./auth/auth.controller";
import { AuthGuard } from "./auth/auth.guard";
import { AuthService } from "./auth/auth.service";
import { type AppConfig, CONFIG } from "./config";
import { ConsentService } from "./consent/consent.service";
import { ContentController } from "./content/content.controller";
import { DbModule } from "./db/db.module";
import { IntrosService } from "./investors/intros.service";
import { InvestorsController } from "./investors/investors.controller";
import { InvestorsService } from "./investors/investors.service";
import { MeController } from "./me/me.controller";
import { ScanController } from "./scan/scan.controller";
import { ScanService } from "./scan/scan.service";
import { StartupsService } from "./startups/startups.service";

export function buildAppModule(config: AppConfig) {
  @Module({
    imports: [
      { module: class ConfigModule {}, global: true, providers: [{ provide: CONFIG, useValue: config }], exports: [CONFIG] },
      DbModule,
      JwtModule.register({ global: true, secret: config.JWT_SECRET, signOptions: { expiresIn: "30d" } }),
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ],
    controllers: [AuthController, MeController, ScanController, ContentController, InvestorsController, AdminController, AdminConsoleController, DigestController, AdminDigestController, HealthController],
    providers: [
      AuthService,
      AdminGuard,
      AuditService,
      MailerService,
      DigestService,
      DigestScheduler,
      InvestorsService,
      IntrosService,
      AuthGuard,
      ConsentService,
      ScanService,
      StartupsService,
      { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
  })
  class AppModule {}
  return AppModule;
}
