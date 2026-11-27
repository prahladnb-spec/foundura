import { Body, Controller, Get, HttpCode, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { Admin, type AdminActor, AdminGuard } from "../admin/admin.guard";
import { AuditService } from "../admin/audit.service";
import { parseBody } from "../common/zod";
import { StoriesService } from "./stories.service";

/** Published founder stories, for anyone. */
@Controller("stories")
export class StoriesController {
  constructor(@Inject(StoriesService) private readonly stories: StoriesService) {}

  @Get()
  list() {
    return this.stories.listPublished();
  }

  @Get(":slug")
  get(@Param("slug") slug: string) {
    return this.stories.getPublished(slug);
  }
}

/** Editors read submitted stories and publish them or send them back; they never rewrite them. */
@Controller("admin/stories")
@UseGuards(AdminGuard)
export class AdminStoriesController {
  constructor(
    @Inject(StoriesService) private readonly stories: StoriesService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  @Get()
  list() {
    return this.stories.adminList();
  }

  @Post(":id/publish")
  @HttpCode(200)
  async publish(@Admin() actor: AdminActor, @Param("id") id: string) {
    const row = await this.stories.publish(id);
    await this.audit.record(actor, "story.publish", "story", id);
    return row;
  }

  @Post(":id/return")
  @HttpCode(200)
  async sendBack(@Admin() actor: AdminActor, @Param("id") id: string, @Body() body: unknown) {
    const { note } = parseBody(z.object({ note: z.string().trim().min(5).max(1000) }), body);
    const row = await this.stories.sendBack(id, note);
    await this.audit.record(actor, "story.return", "story", id);
    return row;
  }
}
