/**
 * Starter articles. Original text; daily drafts from the content engine are added
 * through the same table once an editor approves them.
 */
export interface ArticleSeed {
  slug: string;
  title: string;
  theme: string;
  excerpt: string;
  focusKeyphrase: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  body: string;
  readMinutes: number;
  publishedAt: string;
}

export const ARTICLES: ArticleSeed[] = [
  {
    slug: "dpiit-recognition-2026-rules",
    title: "DPIIT recognition under the 2026 rules: who qualifies now",
    theme: "Funding Thursday",
    excerpt:
      "The startup definition changed on 4 February 2026. Here is what the new limits mean for your company, in plain words.",
    focusKeyphrase: "DPIIT recognition",
    seoTitle: "DPIIT recognition 2026: who qualifies now | Foundura",
    metaDescription:
      "DPIIT recognition rules changed in February 2026: a ₹200 crore turnover limit, a Deep Tech category and cooperatives. See if your startup now qualifies.",
    keywords: [
      "DPIIT recognition",
      "DPIIT recognition 2026",
      "startup definition 2026",
      "DPIIT eligibility",
      "₹200 crore turnover limit",
      "Deep Tech startup",
      "Deep Tech recognition DPIIT",
      "cooperative society startup",
      "Startup India recognition",
      "how to get DPIIT recognition",
      "DPIIT certificate",
      "startup recognition benefits",
      "Section 80-IAC",
      "startup age limit",
      "Startup India registration",
    ],
    readMinutes: 4,
    publishedAt: "2026-11-22",
    body: `On 4 February 2026 the government replaced the 2019 rules that decide who counts as a "startup" in India, and so who can get DPIIT recognition. If you were told you were too old, too big or the wrong kind of entity, it is worth checking again.

## Key takeaways

- The turnover limit is now **₹200 crore** in any financial year, up from ₹100 crore.
- A new **Deep Tech** category allows up to **20 years** from incorporation and **₹300 crore** turnover.
- **Cooperative societies** can now be recognised, alongside companies, LLPs and partnership firms.
- Recognition is still the gateway to most central benefits, so it is usually the first form to file.

## What did not change

You still need to be working on something new or improved — a product, process, service or business model that can scale. A company formed by splitting up or restructuring an existing business does not qualify.

## Who should look again

- **Older companies doing hard science.** If you are 11–20 years old and build on new science or engineering, the Deep Tech window may now cover you.
- **Fast growers.** If you crossed ₹100 crore turnover and lost your status, the new ₹200 crore limit may bring you back in.
- **Cooperatives** in agri, dairy or crafts that run innovative models.

## Try this today

Run the free [Scheme Scan](/scan). It checks the new limits against your answers in under a minute and lists the other schemes your recognition unlocks.

*This is general information, not legal or tax advice. Confirm details on the official Startup India portal or with a CA/CS.*

**Sources:** [Lakshmikumaran & Sridharan summary of G.S.R. 108(E)](https://www.lkslaw.com/insights/articles/india-s-new-startup-and-deep-tech-startup-framework-why-the-2026-dpiit-notification-matters)`,
  },
  {
    slug: "startup-idea-problem-first",
    title: "Finding a startup idea worth solving: the problem-first method",
    theme: "Idea Tuesday",
    excerpt:
      "Most failed ideas start with a solution. Start with a painful, frequent problem that someone already pays to fix.",
    focusKeyphrase: "startup idea",
    seoTitle: "How to find a startup idea: problem-first method | Foundura",
    metaDescription:
      "How to find a startup idea worth building: start with a painful, frequent problem people already pay to fix, score it, and talk to 10 people first.",
    keywords: [
      "startup idea",
      "how to find a startup idea",
      "startup idea validation",
      "problem-first method",
      "problem worth solving",
      "business idea India",
      "customer problem interview",
      "validate a startup idea",
      "idea scoring",
      "customer discovery",
      "product-market fit",
      "lean startup",
      "first-time founder",
      "ideation",
      "startup ideas India",
    ],
    readMinutes: 5,
    publishedAt: "2026-11-22",
    body: `When looking for a startup idea, many founders fall in love with a solution and then go looking for people who need it. The problem-first method flips that order.

## Key takeaways

- Look for problems that are **painful**, **frequent** and **already costing money**.
- Write problems down for two weeks before judging any of them.
- Score each problem, then talk to at least 10 people who have it before building anything.

## Step 1: Keep a problem journal

For 14 days, note every time you or someone around you is annoyed, slowed down or overcharged. Write what happened, who was affected and what they did about it. Do not write solutions yet.

## Step 2: Score each problem

Give each problem 1–5 points on three questions:

| Question | What a 5 looks like |
| --- | --- |
| How painful is it? | People complain about it without being asked |
| How often does it happen? | Daily or weekly |
| Do people already pay to fix it? | They spend money or hours on a workaround |

Keep the problems scoring 12 or more.

## Step 3: Talk to people who have the problem

Ask about the last time it happened, what they did and what it cost them. Avoid asking "Would you use my app?" — people are polite and will say yes.

## Try this today

Start your problem journal now: one note in your phone, three lines per problem.

**Next:** when you have a shortlist, test demand with a simple landing page before you build.`,
  },
];
