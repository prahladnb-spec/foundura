import { type ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { Request } from "express";
import type { OpsService } from "./ops.service";

/**
 * Unexpected errors (anything that would be a 500) are reported to the operator, then answered
 * the usual way, without details. Expected errors (400, 401, 404 and so on) are not reported.
 */
@Catch()
export class AlertingExceptionFilter extends BaseExceptionFilter {
  constructor(
    private readonly ops: OpsService,
    ...args: ConstructorParameters<typeof BaseExceptionFilter>
  ) {
    super(...args);
  }

  override catch(e: unknown, host: ArgumentsHost) {
    if (!(e instanceof HttpException) || e.getStatus() >= 500) {
      const req = host.switchToHttp().getRequest<Request>();
      // Path without the query string: queries can carry personal data such as unsubscribe tokens.
      const where = req ? `${req.method} ${req.path}` : "unknown request";
      const err = e instanceof Error ? e : new Error(String(e));
      void this.ops.alert(`API error: ${err.message.slice(0, 80)}`, `${where}\n\n${err.stack ?? err.message}`, `api-${err.message.slice(0, 120)}`);
    }
    super.catch(e, host);
  }
}
