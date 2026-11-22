import { timingSafeEqual } from "node:crypto";
import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { CONFIG, type AppConfig } from "../config";

export interface AdminActor {
  actorId: string | null;
  label: "admin" | "api-key";
}

type AdminRequest = Request & { admin?: AdminActor };

/**
 * Admin access: a signed-in user whose email is in ADMIN_EMAILS, or the ADMIN_API_KEY header
 * (for scripts such as the scheduled sheet imports).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly admins: Set<string>;

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {
    this.admins = new Set(
      config.ADMIN_EMAILS.split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  isAdminEmail(email: string): boolean {
    return this.admins.has(email.toLowerCase());
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AdminRequest>();

    const key = req.headers["x-admin-key"];
    if (typeof key === "string" && key) {
      const given = Buffer.from(key);
      const expected = Buffer.from(this.config.ADMIN_API_KEY);
      if (given.length === expected.length && timingSafeEqual(given, expected)) {
        req.admin = { actorId: null, label: "api-key" };
        return true;
      }
      throw new UnauthorizedException();
    }

    const header = req.headers.authorization ?? "";
    if (!header.startsWith("Bearer ")) throw new UnauthorizedException("Please sign in.");
    const user = await this.auth.userFromToken(header.slice(7));
    if (!this.isAdminEmail(user.email)) throw new ForbiddenException("Admins only.");
    req.admin = { actorId: user.id, label: "admin" };
    return true;
  }
}

export const Admin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AdminActor => ctx.switchToHttp().getRequest<AdminRequest>().admin!,
);
