import { Controller, Get, Header, Inject, NotFoundException, Param } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { shareTokenSchema } from "@foundura/shared";
import { SharesService } from "./shares.service";

/** Opening a private profile link. No sign-in; the token is the key. */
@Controller("shared")
export class SharesController {
  constructor(@Inject(SharesService) private readonly shares: SharesService) {}

  @Get(":token")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Header("Cache-Control", "private, no-store")
  open(@Param("token") token: string) {
    if (!shareTokenSchema.safeParse(token).success) throw new NotFoundException("This link has expired or been switched off.");
    return this.shares.open(token);
  }
}
