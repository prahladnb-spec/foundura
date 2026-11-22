# Launch checklist

Everything between "the code works" and "open to the public". Tick items off in a PR as they're done.

## Domain and email

- [ ] Register **foundura.org**. If foundura.in is free, register it too and redirect it to .org, so nobody else can take it.
- [ ] Point the DNS records at the server (see [DEPLOY.md](../DEPLOY.md)).
- [ ] Verify the domain in Resend (SPF, DKIM, DMARC), then send yourself a sign-in code to check it lands in the inbox, not spam.
- [ ] Decide on a support address (for example `help@foundura.org`) and make sure someone reads it.

## Server

- [ ] Server in an Indian region. The privacy page says account data is stored in India.
- [ ] `.env.production` filled in with fresh random secrets, and the API starts without "Unsafe production settings" errors.
- [ ] `ADMIN_EMAILS` set to the editors' emails.
- [ ] `SCHEDULED_EMAILS=true` (weekly scheme alerts and the yearly terms reminder).
- [ ] Nightly backups running, copied off the server, and **one restore tested**.
- [ ] Uptime monitor on `https://foundura.org/api/health`.

## Legal and privacy (India)

The DPDP Act's main duties (notice, consent, security safeguards, breach notification, grievance redressal) apply from **13 May 2027**, 18 months after the DPDP Rules were notified on 13 November 2025. Foundura is built to meet them already; these items are the non-code part.

- [ ] **Grievance officer and company details.** Fill in `LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS`, `LEGAL_JURISDICTION_CITY`, `GRIEVANCE_OFFICER_NAME` and `GRIEVANCE_EMAIL` in `.env.production`. Until they're set, `/privacy` and `/terms` show "to be added before launch" and the web server logs a warning at start-up. The officer must acknowledge complaints within 24 hours and resolve them within 15 days (IT Rules 2021). That is stricter than the DPDP Rules' 90-day limit, so plan to meet the 24 hours and 15 days.
- [ ] Make sure someone reads the grievance and support mailboxes every day.
- [ ] **Name the processors** in the privacy notice. It currently says "our hosting provider" and "our email delivery provider"; add their names (for example the cloud provider and region, and Resend) once chosen.
- [x] Privacy notice covers what the DPDP notice must: data and purposes, withdrawing consent, rights (including nomination) and complaining to the Data Protection Board.
- [x] Terms of use at `/terms`, including the content users must not post (IT Rules 2021), the 18+ rule, "not advice", "not a government site", "never handles money", and that Investor Connect isn't a SEBI-registered service.
- [x] New accounts confirm they're 18 or older and accept the terms; the consent ledger records the version.
- [x] Yearly reminder of the terms and privacy notice to every account holder (IT Rules 2021), sent by the scheduler.
- [x] Access logs (IP, time, request) kept 180 days by Caddy, matching the privacy page and CERT-In directions.
- [ ] Have a lawyer read the privacy notice and terms once, especially the investor section and limitation of liability.
- [ ] **Breach plan.** CERT-In directions require reporting specified cyber incidents within **6 hours** of noticing them, and keeping system logs for a rolling **180 days** in India. Write down:
  - who reports incidents
  - how to reach CERT-In
  - where logs are kept
  - how affected users are told
- [ ] Keep a short record of what personal data Foundura holds and why: account email, startup and investor profiles, intro messages, consent ledger, alert history, and the editor audit log (which stores user IDs, never emails).

## Content

- [ ] **Check all 14 schemes** against their official sources in `/admin/schemes`. Until then every scheme page, and the alert emails, tell founders to confirm on the official page.
- [ ] Confirm or remove the events marked "To verify".
- [ ] Publish 5 to 10 founder guides from the content calendar, so `/learn` doesn't look empty.
- [ ] Invite the first investors personally and verify each one in `/admin/investors`. Don't add sample investors.

## Search and sharing

- [ ] Add foundura.org to Google Search Console and submit `https://foundura.org/sitemap.xml`.
- [ ] Paste a scheme link into WhatsApp and LinkedIn and check the preview image and title.
- [ ] Run the scheme pages and a guide through Google's Rich Results Test.

## Final walkthrough on the live site

- [ ] Run a Scheme Scan without signing in.
- [ ] Sign in, create a startup profile and run the scan from it.
- [ ] As a second account, create an investor profile; then request an intro, accept it, and check that both sides get their emails.
- [ ] From an alert email, unsubscribe using the link and confirm alerts show as off on the dashboard.
- [ ] Download "My data", then delete a test account.
- [ ] Embed the scan on a test page with the `/partners` snippet.
- [ ] Open `/admin` as a non-editor and confirm it says "This area is for editors".
