import { Inject, Injectable, Logger } from "@nestjs/common";
import { CONFIG, type AppConfig } from "../config";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  headers?: Record<string, string>;
}

/**
 * Transactional email. In dev mode nothing is sent: messages are logged and kept in
 * an in-memory outbox (used by tests). In email mode they go through Resend.
 */
@Injectable()
export class MailerService {
  private readonly log = new Logger(MailerService.name);
  readonly outbox: Mail[] = [];

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  get isDev() {
    return this.config.OTP_DELIVERY === "dev";
  }

  get siteUrl() {
    return this.config.SITE_URL.replace(/\/$/, "");
  }

  /** Throws on failure; callers decide whether a failed email should fail the request. */
  async send(mail: Mail): Promise<void> {
    if (this.config.OTP_DELIVERY === "dev") {
      this.outbox.push(mail);
      if (this.outbox.length > 100) this.outbox.shift();
      this.log.log(`DEV email to ${mail.to}: ${mail.subject}`);
      return;
    }
    if (!this.config.RESEND_API_KEY) throw new Error("RESEND_API_KEY is required when OTP_DELIVERY=email");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.config.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: this.config.OTP_FROM_EMAIL,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        ...(mail.headers ? { headers: mail.headers } : {}),
      }),
    });
    if (!res.ok) throw new Error(`Email send failed with status ${res.status}`);
  }

  /** Fire-and-forget for notifications: a failed email must not undo the action. */
  notify(mail: Mail): void {
    this.send(mail).catch((e) => this.log.error(`Notification to ${mail.to} failed: ${(e as Error).message}`));
  }
}
