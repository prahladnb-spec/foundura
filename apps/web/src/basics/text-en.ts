import type { ChapterText } from "./types";

/** Funding basics in English. Keep each fact in step with text-hi.ts; rules last checked on CHECKED_ON. */
export const EN: Record<string, ChapterText> = {
  stages: {
    title: "Startup stages, from idea to scale",
    summary: "Every startup moves through the same stages. Knowing yours tells you what to prove next and which money fits.",
    keywords: ["startup stages", "stages of a startup", "idea stage startup", "product-market fit", "startup growth stage"],
    sections: [
      {
        h: "Each stage has one question to answer",
        blocks: [
          { t: "p", x: "A startup is a search for a business that can grow fast. Each stage ends when you have answered its question with evidence, not opinion. Investors and grant panels ask the same thing: what have you proved, and what will the money prove next?" },
          {
            t: "table",
            head: ["Stage", "The question", "What counts as proof"],
            rows: [
              ["Idea", "Is the problem real and painful?", "Interviews with 20 to 50 likely customers who describe the problem in their own words"],
              ["Validation", "Will people pay for a solution?", "Pre-orders, letters of intent, a paid pilot, a waitlist that converts"],
              ["Prototype or MVP", "Can we build something that works?", "A working product used by real users, even if rough"],
              ["Product-market fit", "Do customers keep coming back?", "Repeat use, low churn, customers who would be very disappointed without you"],
              ["Growth", "Can we find customers profitably and repeatedly?", "A channel where cost to acquire a customer is well below what they pay you over time"],
              ["Scale", "Can we grow across cities, segments or countries?", "Teams and systems that work without the founders doing everything"],
              ["Maturity or exit", "What happens to the company and its owners?", "Steady profits, a sale to another company, or a stock market listing"],
            ],
          },
        ],
      },
      {
        h: "Don't skip ahead",
        blocks: [
          { t: "p", x: "The most common way to waste money is to spend it on a later stage before the earlier question is answered: hiring a sales team before product-market fit, or building a big product before anyone has agreed to pay." },
          { t: "tip", x: "Write down which stage you are in and the one piece of evidence that would move you to the next. That sentence is the core of your pitch and of most grant applications." },
        ],
      },
      {
        h: "Stages and money go together",
        blocks: [
          { t: "ul", x: [
            "Idea and validation: your own savings, friends and family, small grants, incubators.",
            "Prototype: idea and prototype grants, angel investors, pre-seed funds.",
            "Product-market fit: seed rounds from angels, angel funds and early-stage VCs.",
            "Growth and scale: Series A and later VC rounds, venture debt, bank loans once revenue is steady.",
          ] },
          { t: "p", x: "The next chapter walks through each funding round in turn." },
        ],
      },
    ],
  },
  rounds: {
    title: "Funding stages, from bootstrapping to IPO",
    summary: "Pre-seed, seed, Series A, B and beyond: what each round is for, who invests and what they expect to see.",
    keywords: ["funding stages", "startup funding rounds", "pre-seed seed series A", "series A meaning", "bootstrapping"],
    sections: [
      {
        h: "The usual order",
        blocks: [
          {
            t: "table",
            head: ["Round", "Usually funds", "Who usually invests", "What they want to see"],
            rows: [
              ["Bootstrapping", "The first experiments", "You, from savings or revenue", "Nothing: you keep full control"],
              ["Friends and family", "A prototype, early costs", "People who know you", "Trust in you; treat it as a real investment with paperwork"],
              ["Grants and incubators", "Proof of concept, prototype, pilots", "Government schemes, incubators, foundations", "A clear plan, milestones, eligibility"],
              ["Pre-seed", "An MVP and first customers", "Angels, angel networks, pre-seed funds, accelerators", "A strong team and early signs of demand"],
              ["Seed", "Reaching product-market fit", "Angel funds, seed funds, early-stage VCs", "Real users, early revenue or strong engagement"],
              ["Series A", "A repeatable way to grow", "Venture capital funds", "Product-market fit and a channel that works"],
              ["Series B, C and later", "Scaling: new cities, products, countries", "Larger VC and growth funds", "Growth with improving unit economics"],
              ["Pre-IPO and IPO", "Listing on a stock exchange", "Growth funds, public investors", "Profits or a clear path to them, strong governance"],
            ],
          },
          { t: "p", x: "Round sizes vary hugely by sector and year, so take any figure you hear as a rough guide, not a rule. What matters is that each round buys enough runway, usually 18 to 24 months, to reach the milestones the next investors will look for." },
        ],
      },
      {
        h: "Not every startup needs every round",
        blocks: [
          { t: "p", x: "Many good businesses never raise venture capital. A services firm, a profitable small manufacturer or a local brand can grow on revenue, grants and bank loans. Venture capital suits businesses that could become very large, quickly, because that is the only way a VC fund makes its returns (chapter 6 explains why)." },
          { t: "tip", x: "Ask yourself before each round: what will this money let us prove, and would we be better off proving it with less?" },
        ],
      },
      {
        h: "Bridge rounds and extensions",
        blocks: [
          { t: "p", x: "When a company needs more time before its next round, existing investors may put in a smaller bridge, often as a convertible note or on the same terms as the last round. It buys time, but ask what will be different when the bridge runs out." },
        ],
      },
    ],
  },
  equity: {
    title: "Equity: selling part of your company",
    summary: "Equity means investors buy a share of your company. Learn the instruments used in India: equity shares, CCPS, convertible notes and iSAFE.",
    keywords: ["equity funding", "what is equity", "CCPS meaning", "convertible note India", "iSAFE"],
    sections: [
      {
        h: "What you give and what you get",
        blocks: [
          { t: "p", x: "With equity, investors pay money for shares. You don't repay it and pay no interest. In return they own part of the company, share in its future value, and usually get rights over big decisions. If the company fails, they lose their money; if it does well, their share can be worth many times what they paid." },
          { t: "p", x: "Equity is expensive in a different way from debt: every share you sell is a share of all future profits and of the price if the company is sold. That is why founders try to raise only what they need at each stage." },
        ],
      },
      {
        h: "The instruments used in India",
        blocks: [
          {
            t: "table",
            head: ["Instrument", "What it is", "Typical use"],
            rows: [
              ["Equity shares", "Ordinary shares with voting rights", "Founders, ESOPs, some angels"],
              ["CCPS (compulsorily convertible preference shares)", "Preference shares that must convert into equity shares later, at an agreed ratio. They carry investor rights such as liquidation preference", "Most angel, seed and VC rounds"],
              ["Convertible note", "Money that starts as debt and converts into shares at the next priced round, usually at a discount or under a valuation cap", "Quick early rounds, bridges"],
              ["iSAFE", "An Indian version of the SAFE, issued as a type of CCPS: the investor gets shares at the next priced round", "Pre-seed rounds, accelerators"],
            ],
          },
        ],
      },
      {
        h: "Convertible note rules",
        blocks: [
          { t: "ul", x: [
            "Only a startup recognised by DPIIT can issue convertible notes.",
            "Each investor must put in at least ₹25 lakh in a single tranche.",
            "The note must convert into shares or be repaid within 10 years.",
            "Foreign investors can subscribe in sectors open to foreign investment, and the startup files a report with its bank.",
          ] },
          { t: "p", x: "Below ₹25 lakh per investor, a convertible note would count as a deposit, which a private company may not take from the public. That is one reason small pre-seed cheques often use iSAFE or CCPS instead." },
        ],
      },
      {
        h: "Priced and unpriced rounds",
        blocks: [
          { t: "p", x: "In a priced round you agree a valuation now and issue shares at that price. With a convertible note or iSAFE you postpone the price to the next round; the investor gets a discount or a cap as a reward for coming in early. Unpriced rounds are quicker and cheaper, but they make the cap table harder to read, so model what each note will convert into." },
        ],
      },
    ],
  },
  debt: {
    title: "Debt: borrowing without giving up shares",
    summary: "Loans keep your ownership intact but must be repaid whatever happens. Bank loans, credit guarantees, venture debt and revenue-based finance explained.",
    keywords: ["startup debt funding", "venture debt India", "startup loans India", "revenue-based financing", "CGSS loan"],
    sections: [
      {
        h: "How debt differs from equity",
        blocks: [
          { t: "p", x: "A lender gives you money now and you repay it with interest, on a fixed schedule, whether or not the business does well. The lender owns nothing, so you keep your shares. The risk moves to you: missed repayments hurt your credit and can lead to the lender taking secured assets." },
          { t: "tip", x: "Borrow against something that will produce cash to repay it: confirmed orders, equipment that earns, receivables. Don't borrow to fund losses you can't see the end of." },
        ],
      },
      {
        h: "The main kinds",
        blocks: [
          {
            t: "table",
            head: ["Kind", "How it works", "Good for"],
            rows: [
              ["Bank and NBFC term loans", "Fixed repayments over years; often need collateral or a guarantee", "Equipment, a factory, working capital once revenue is steady"],
              ["Credit guarantee schemes", "The government guarantees most of the loan so the bank needs less collateral: CGTMSE for micro and small enterprises, CGSS for DPIIT-recognised startups", "First loans for young companies without property to pledge"],
              ["MUDRA loans", "Small loans to micro enterprises through banks and NBFCs", "Small businesses and early trading"],
              ["Venture debt", "Loans to VC-backed startups, usually for 2 to 4 years, often with warrants (a small right to buy shares)", "Extending runway between equity rounds"],
              ["Revenue-based financing", "An advance repaid as a share of monthly revenue until a fixed amount is paid back", "Businesses with steady, predictable revenue, such as subscriptions and online brands"],
              ["Invoice discounting (TReDS)", "Selling unpaid invoices from large buyers to get cash now, at a discount", "Suppliers waiting on big customers to pay"],
            ],
          },
        ],
      },
      {
        h: "Questions to ask any lender",
        blocks: [
          { t: "ul", x: [
            "What is the total cost: interest, fees, warrants and any prepayment penalty?",
            "What security or personal guarantee is needed?",
            "What covenants apply, such as minimum cash or revenue, and what happens if we miss one?",
            "Can we repay early, and at what cost?",
          ] },
        ],
      },
    ],
  },
  grants: {
    title: "Grants: money you don't pay back",
    summary: "Grants pay for specific work without taking shares. How they work in India, how they are paid, and how to win and keep one.",
    keywords: ["startup grants India", "government grants for startups", "non-dilutive funding", "seed grant", "grant application tips"],
    sections: [
      {
        h: "What a grant is",
        blocks: [
          { t: "p", x: "A grant is money given for a defined purpose: building a prototype, running a pilot, a clinical study, or reaching new markets. You don't repay it and you don't give up shares, which is why grants are called non-dilutive. In return you must spend it as agreed, reach the milestones and report on it." },
          { t: "p", x: "Some government support looks like a grant but isn't: equity-linked grants, soft loans that convert to grants, matching support that needs your own money first, and reimbursements paid only after you have spent." },
        ],
      },
      {
        h: "How grants are usually paid",
        blocks: [
          { t: "ul", x: [
            "In tranches, each released after a milestone is reported and checked.",
            "Often through an incubator, which also mentors and monitors you.",
            "As reimbursement of costs already paid, for patents, certification or trade shows.",
            "With a share you fund yourself, sometimes 10 to 50% of the project cost.",
          ] },
          { t: "tip", x: "Plan your cash for the gap between spending and reimbursement. Grants rarely arrive in advance of the work." },
        ],
      },
      {
        h: "Winning a grant",
        blocks: [
          { t: "ol", x: [
            "Check eligibility first: entity type, age, DPIIT recognition, state of registration, sector.",
            "Match the call's purpose. A prototype grant wants a prototype plan, not a growth story.",
            "Set milestones that are specific, measurable and dated.",
            "Budget only costs the scheme allows, and show your own contribution.",
            "Keep records from day one: invoices, bank statements, progress photos and reports.",
          ] },
          { t: "p", x: "Central schemes such as BIRAC BIG and NIDHI, and state programmes such as Karnataka's ELEVATE or Kerala Startup Mission grants, open calls at set times. Foundura's scheme scan shows which you qualify for, and the funding directory lists them by state." },
        ],
      },
    ],
  },
  vc: {
    title: "How venture capital works",
    summary: "Where VC money comes from, why funds back only a few big bets, how angels and angel funds fit in, and what a fundraise looks like.",
    keywords: ["how venture capital works", "VC fund structure", "AIF India", "angel fund SEBI", "how to raise venture capital", "venture capital India", "VC funding process"],
    sections: [
      {
        h: "Where the money comes from",
        blocks: [
          { t: "p", x: "A VC fund raises money from limited partners (LPs): wealthy families, pension funds, banks, corporations and government funds of funds such as Startup India's. The fund's managers, the general partners (GPs), invest it in startups. In India most VC funds are Alternative Investment Funds (AIFs) registered with SEBI." },
          { t: "p", x: "A fund usually lives about ten years: a few years making new investments, then years helping companies grow and selling stakes. Managers are paid an annual fee, often around 2% of the fund, and a share of profits, often around 20%, called carry." },
        ],
      },
      {
        h: "Why VCs need very big outcomes",
        blocks: [
          { t: "p", x: "Most startups fail or return little. A fund makes its money from the few that become very large; one great company can return the whole fund. So a VC asks of every pitch: could this become big enough to matter to our fund? A good, steady business can still be the wrong fit for venture capital." },
        ],
      },
      {
        h: "Angels and angel funds",
        blocks: [
          { t: "p", x: "Angels are individuals investing their own money, often alone or through networks and syndicates. Angel funds are a SEBI-registered kind of AIF that pool angels' money. Since September 2025, new angel funds may take money only from accredited investors, and each investment needs at least two of them." },
        ],
      },
      {
        h: "What a fundraise looks like",
        blocks: [
          { t: "ol", x: [
            "Build a list of investors who fund your stage and sector.",
            "Get introductions where you can; warm intros get more replies than cold emails.",
            "First meeting, then follow-ups and a partner meeting.",
            "A term sheet: the main terms, mostly non-binding.",
            "Due diligence: legal, financial and business checks on your company.",
            "Final agreements and closing: share subscription and shareholders' agreements, allotment and filings.",
          ] },
          { t: "p", x: "Expect a round to take three to six months from first meeting to money in the bank. Start before you need it." },
          { t: "tip", x: "Never pay anyone to introduce you to investors or to guarantee funding. Real investors don't charge founders to pitch." },
        ],
      },
    ],
  },
  valuation: {
    title: "Valuation and dilution",
    summary: "Pre-money, post-money, price per share and how each round shrinks your stake. Work through an example and try the calculator.",
    keywords: ["pre-money and post-money valuation", "startup dilution", "how dilution works", "ESOP pool dilution", "startup valuation India"],
    sections: [
      {
        h: "Pre-money and post-money",
        blocks: [
          { t: "p", x: "Pre-money valuation is what the company is agreed to be worth just before the new money comes in. Post-money is pre-money plus the new money. The new investors own the amount they put in divided by the post-money valuation." },
          { t: "table", head: ["Example", "Amount"], rows: [
            ["Pre-money valuation", "₹16 crore"],
            ["New investment", "₹4 crore"],
            ["Post-money valuation", "₹20 crore"],
            ["New investors own", "₹4 crore ÷ ₹20 crore = 20%"],
            ["Founders, who owned 100% before", "80% after"],
          ] },
        ],
      },
      {
        h: "Dilution",
        blocks: [
          { t: "p", x: "Dilution is the fall in your percentage when new shares are issued. You own a smaller slice, but of a bigger and better-funded company, so the value of your stake can still rise. Founders often give up 10 to 25% in each round; after seed, Series A and Series B, two founders may each own well under a third." },
          { t: "p", x: "Always look at the fully diluted count: all shares plus every option, convertible note and iSAFE that will become shares." },
        ],
      },
      {
        h: "The ESOP pool",
        blocks: [
          { t: "p", x: "Investors often ask for an ESOP pool, shares set aside for future employees, to be created or topped up before their money comes in. Because it is created pre-money, it dilutes the existing shareholders, not the new investors. A 10% pool can cost founders as much as several points of valuation, so negotiate its size against a real hiring plan." },
          { t: "tip", x: "Keep your cap table in a spreadsheet and model every round before you agree to it. Foundura's cap table template does the arithmetic." },
        ],
      },
      {
        h: "How valuation is agreed",
        blocks: [
          { t: "p", x: "Early valuations are negotiated, not calculated. They depend on team, traction, market size, how much competition there is for the round, and recent deals in the sector. For legal filings a formal valuation report is still needed: from a registered valuer under the Companies Act, and following FEMA pricing rules when foreign investors subscribe." },
        ],
      },
    ],
  },
  "term-sheet": {
    title: "Reading a term sheet",
    summary: "The terms that decide who gets what and who decides what: liquidation preference, anti-dilution, board seats, vesting and more, in plain words.",
    keywords: ["term sheet explained", "liquidation preference", "anti-dilution clause", "founder vesting", "term sheet India"],
    sections: [
      {
        h: "What a term sheet is",
        blocks: [
          { t: "p", x: "A short document listing the main terms of an investment before lawyers draft the full agreements. Most of it is not legally binding, but confidentiality, exclusivity (a no-shop period) and sometimes costs are. Once signed, changing the main terms is hard, so read it with a lawyer before you sign." },
        ],
      },
      {
        h: "Economic terms: who gets what",
        blocks: [
          { t: "table", head: ["Term", "What it means", "Founder-friendly version"], rows: [
            ["Valuation and amount", "Pre-money valuation and how much is invested", "Clear pre-money with the ESOP pool counted fairly"],
            ["Liquidation preference", "If the company is sold or wound up, investors get their money back first, before others share the rest", "1x, non-participating: investors take their money back or their share, not both"],
            ["Anti-dilution", "Protects investors if a later round is at a lower price", "Broad-based weighted average, not full ratchet"],
            ["ESOP pool", "Shares reserved for employees", "Sized to an 18 to 24 month hiring plan"],
            ["Dividends", "Payouts on preference shares", "Non-cumulative and nominal"],
          ] },
        ],
      },
      {
        h: "Control terms: who decides what",
        blocks: [
          { t: "table", head: ["Term", "What it means"], rows: [
            ["Board seats", "How many directors investors appoint; keep founder control of the board as long as you can"],
            ["Affirmative votes", "Decisions that need investor approval, such as new rounds, selling the company or changing the business"],
            ["Founder vesting and lock-in", "Founders' shares are earned over time, often four years with a one-year cliff, so a co-founder who leaves early doesn't keep everything"],
            ["Pro rata right", "Investors can buy enough of the next round to keep their percentage"],
            ["ROFR, tag-along, drag-along", "Rules for when shareholders sell: first offer to others, the right to join a sale, and the power to make minorities join a sale"],
            ["Information rights", "Monthly or quarterly reports and accounts"],
          ] },
          { t: "tip", x: "Compare terms against what is normal for your stage. Ask your investors which terms they always insist on and which they are flexible on." },
        ],
      },
    ],
  },
  "india-rules": {
    title: "Indian rules every fundraiser should know",
    summary: "DPIIT recognition, private placement, valuation reports, FEMA for foreign money, the end of angel tax, and the startup tax holiday.",
    keywords: ["startup fundraising rules India", "private placement Companies Act", "FEMA startup investment", "angel tax abolished", "80-IAC tax holiday"],
    sections: [
      {
        h: "Get recognised first",
        blocks: [
          { t: "p", x: "DPIIT recognition is free and unlocks most startup benefits: convertible notes, many central and state schemes, self-certification for some labour and environment laws, faster patent examination with lower fees, and eligibility for the tax holiday." },
        ],
      },
      {
        h: "Raising money as a private company",
        blocks: [
          { t: "ul", x: [
            "Shares are offered by private placement under the Companies Act: to named people, approved by a special resolution, with an offer letter in form PAS-4.",
            "Investors pay from their own bank accounts into a separate bank account; cash is not allowed.",
            "Shares must be allotted within 60 days of receiving the money, and the return of allotment (PAS-3) filed afterwards.",
            "Never take money from the public or call it a deposit. Private companies may only accept deposits in narrow cases.",
          ] },
        ],
      },
      {
        h: "Valuation and foreign investors",
        blocks: [
          { t: "p", x: "Shares issued for cash need a valuation report from a registered valuer. When a non-resident invests, FEMA rules apply: shares can't be issued below fair value, the money must come through banking channels, and the allotment is reported to the RBI through the bank, in form FC-GPR within 30 days. Foreign investment is allowed only in sectors open to it, some only with approval." },
        ],
      },
      {
        h: "Tax",
        blocks: [
          { t: "ul", x: [
            "Angel tax is gone: the rule that taxed share premium above fair value no longer applies from 1 April 2025, for every company and investor. Valuation reports are still needed under company law and FEMA.",
            "Tax holiday: an eligible DPIIT-recognised startup incorporated before 1 April 2030 can claim a full deduction of profits for three consecutive years out of its first ten, after certification by the Inter-Ministerial Board (Section 80-IAC).",
            "ESOPs: employees of startups eligible for the tax holiday can defer the tax on their ESOP shares until they sell them, leave the company, or about five years pass, whichever comes first.",
          ] },
          { t: "p", x: "Section numbers refer to the Income-tax Act, 1961. The Income-tax Act, 2025, which replaced it from April 2026, renumbers them; ask your CA for the current references." },
        ],
      },
      {
        h: "Angel funds",
        blocks: [
          { t: "p", x: "Under SEBI's 2025 rules, angel funds take money only from accredited investors, invest directly in startups rather than through separate schemes, and need at least two accredited investors in each investment." },
        ],
      },
    ],
  },
  choosing: {
    title: "Choosing the right money for your startup",
    summary: "A practical guide to matching your stage and business to grants, loans or investors, with the warning signs to watch for.",
    keywords: ["which funding is right for my startup", "equity vs debt vs grant", "startup funding options India", "how to fund a startup", "startup funding guide"],
    sections: [
      {
        h: "Match the money to the job",
        blocks: [
          { t: "table", head: ["If you need to…", "Look first at"], rows: [
            ["Test an idea or build a first prototype", "Your savings, prototype grants, incubators, idea competitions"],
            ["Run a pilot with a government or large customer", "Pilot programmes, matching grants, the customer's own budget"],
            ["Build a deep-tech or medical product over years", "Research grants (BIRAC, DST, state deep-tech grants), patient investors, the RDI Scheme"],
            ["Grow a business with steady revenue", "Revenue, bank loans with a credit guarantee, revenue-based financing"],
            ["Grow very fast in a large market", "Angels, angel funds and venture capital"],
            ["Stretch runway between VC rounds", "Venture debt from lenders who back VC-funded companies"],
            ["Buy equipment or fund working capital", "Term loans, equipment finance, invoice discounting"],
          ] },
        ],
      },
      {
        h: "Questions to settle before you raise",
        blocks: [
          { t: "ol", x: [
            "How much do we need to reach the next milestone, plus a buffer?",
            "How long will it last at our current spending (runway)?",
            "What will we own after this round, and after the next two?",
            "What will we have to report, and to whom?",
            "Can we combine sources, such as a grant for research and equity for hiring?",
          ] },
        ],
      },
      {
        h: "Warning signs",
        blocks: [
          { t: "ul", x: [
            "Anyone asking for a fee to pitch, to apply, or to guarantee a grant or investment.",
            "Investors who want a majority stake at the earliest stage.",
            "Loans with unclear total cost or a personal guarantee you don't understand.",
            "Pressure to sign quickly, before your lawyer or CA has read the documents.",
          ] },
          { t: "tip", x: "Keep investors informed with a short monthly update, keep your cap table current, and start your next raise with at least six months of runway left." },
        ],
      },
    ],
  },
};
