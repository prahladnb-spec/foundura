import { Body, Controller, HttpCode, Inject, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { requestOtpSchema, verifyOtpSchema } from "@foundura/shared";
import { parseBody } from "../common/zod";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("request-otp")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  requestOtp(@Body() body: unknown) {
    const { email } = parseBody(requestOtpSchema, body);
    return this.auth.requestOtp(email);
  }

  @Post("verify-otp")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyOtp(@Body() body: unknown) {
    const { email, code, consents } = parseBody(verifyOtpSchema, body);
    return this.auth.verifyOtp(email, code, consents);
  }
}
