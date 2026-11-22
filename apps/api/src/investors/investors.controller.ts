import { SkipThrottle } from "@nestjs/throttler";
import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { InvestorsService, investorPublicView } from "./investors.service";

/** Public investor directory. */
/** Public, cacheable reads. The web server caches these, so they are not rate limited per visitor. */
@SkipThrottle()
@Controller("investors")
export class InvestorsController {
  constructor(@Inject(InvestorsService) private readonly investors: InvestorsService) {}

  @Get()
  async list(@Query("sector") sector?: string, @Query("stage") stage?: string) {
    const list = await this.investors.listListed({ sector, stage });
    const stats = await this.investors.stats(list.map((i) => i.id));
    return list
      .map((i) => investorPublicView(i, stats.get(i.id)))
      .sort((a, b) => Number(b.verified) - Number(a.verified) || a.name.localeCompare(b.name));
  }

  @Get(":slug")
  get(@Param("slug") slug: string) {
    return this.investors.getListedBySlug(slug);
  }
}
