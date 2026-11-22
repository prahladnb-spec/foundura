import { Body, Controller, HttpCode, Inject, Post, Query } from "@nestjs/common";
import { scanInputSchema } from "@foundura/shared";
import { parseBody } from "../common/zod";
import { ScanService } from "./scan.service";

@Controller("scan")
export class ScanController {
  constructor(@Inject(ScanService) private readonly scans: ScanService) {}

  /** Anonymous Scheme Scan: answers in, ranked matches with reasons out. Nothing is stored. */
  @Post()
  @HttpCode(200)
  scan(@Body() body: unknown, @Query("lang") lang?: string) {
    return this.scans.scan(parseBody(scanInputSchema, body), undefined, lang === "hi" ? "hi" : "en");
  }
}
