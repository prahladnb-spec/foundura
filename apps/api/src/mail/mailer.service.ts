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
 * an in-memory outbox (used by tests). In email mode they go through Zoho ZeptoMail
 * (India data centre by default, ZEPTOMAIL_API_URL).
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
    if (!this.config.ZEPTOMAIL_TOKEN) throw new Error("ZEPTOMAIL_TOKEN is required when OTP_DELIVERY=email");
    const from = parseAddress(this.config.OTP_FROM_EMAIL);
    const res = await fetch(this.config.ZEPTOMAIL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${this.config.ZEPTOMAIL_TOKEN.replace(/^Zoho-enczapikey\s+/i, "")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [{ email_address: { address: mail.to } }],
        subject: mail.subject,
        textbody: mail.text,
        ...(mail.headers ? { mime_headers: mail.headers } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Email send failed with status ${res.status}`);
  }

  /** Fire-and-forget for notifications: a failed email must not undo the action. */
  notify(mail: Mail): void {
    this.send(mail).catch((e) => this.log.error(`Notification to ${mail.to} failed: ${(e as Error).message}`));
  }
}

/** "Foundura <login@foundura.org>" or "login@foundura.org" → ZeptoMail's { address, name }. */
export function parseAddress(value: string): { address: string; name?: string } {
  const m = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (!m) return { address: value.trim() };
  const name = m[1].replace(/^"|"$/g, "").trim();
  return name ? { address: m[2].trim(), name } : { address: m[2].trim() };
}
