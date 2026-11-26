import { SUPPORT, type SupportEntry } from "@/support/directory";

/**
 * Five short founder guides built around the support directory: finding a mentor (/mentors),
 * a desk (/coworking), help for student founders (/students) and women founders (/women), and
 * selling to government and large companies (/selling). Written from official sources on CHECKED_ON;
 * English and Hindi only, other languages show the English. When a rule changes, update both
 * languages and CHECKED_ON. General information, never advice.
 */
export const CHECKED_ON = "2026-11-26";

export const FOUNDER_GUIDES = ["mentors", "coworking", "students", "women", "selling"] as const;
export type FounderGuide = (typeof FOUNDER_GUIDES)[number];

export const GUIDE_PATH: Record<FounderGuide, string> = {
  mentors: "/mentors",
  coworking: "/coworking",
  students: "/students",
  women: "/women",
  selling: "/selling",
};

/** Which support directory entries each guide lists. */
export const GUIDE_ENTRIES: Record<FounderGuide, (e: SupportEntry) => boolean> = {
  mentors: (e) => e.kind === "mentoring",
  coworking: (e) => !!e.desks,
  students: (e) => e.kind === "campus" || !!e.for?.includes("students"),
  women: (e) => !!e.for?.includes("women"),
  selling: (e) => e.kind === "corporate",
};

export const guideEntries = (g: FounderGuide) => SUPPORT.filter(GUIDE_ENTRIES[g]);

/** Schemes, templates and guides each page links to, in this order. */
export const GUIDE_LINKS: Record<FounderGuide, { schemes: string[]; docs: string[]; guides: string[] }> = {
  mentors: { schemes: [], docs: ["advisor-agreement", "nda", "investor-update", "one-pager"], guides: ["investor-update-email-guide", "pitch-deck-guide-investors"] },
  coworking: { schemes: ["dpiit-startup-recognition"], docs: ["incubation-agreement-checklist", "incorporation-checklist", "vendor-agreement"], guides: ["gst-registration-for-startups", "company-compliance-calendar-india"] },
  students: { schemes: ["dpiit-startup-recognition", "nidhi-prayas", "startup-india-seed-fund"], docs: ["lean-canvas", "customer-interview-script", "founders-agreement", "ip-assignment", "pitch-deck"], guides: ["startup-idea-problem-first", "customer-interviews-startup-guide", "founders-agreement-vesting-guide"] },
  women: { schemes: ["stand-up-india", "dpiit-startup-recognition", "startup-india-seed-fund", "credit-guarantee-scheme-startups"], docs: ["founders-agreement", "cap-table", "pitch-deck", "financial-model"], guides: ["bootstrapping-or-raising-money", "pitch-deck-guide-investors"] },
  selling: { schemes: ["public-procurement-relaxations", "dpiit-startup-recognition"], docs: ["letter-of-intent", "nda", "customer-agreement", "quotation-and-invoice", "case-study", "one-pager"], guides: ["first-customers-startup-sales", "gst-registration-for-startups", "startup-pricing-first-product"] },
};

export const GUIDE_SOURCES: Record<FounderGuide, { name: string; url: string }[]> = {
  mentors: [
    { name: "MAARG, Startup India's mentorship portal", url: "https://maarg.startupindia.gov.in" },
    { name: "Startup India", url: "https://www.startupindia.gov.in" },
  ],
  coworking: [
    { name: "Startup India: list of recognised incubators", url: "https://www.startupindia.gov.in" },
    { name: "Atal Innovation Mission incubation centres", url: "https://aim.gov.in" },
  ],
  students: [
    { name: "Smart India Hackathon", url: "https://sih.gov.in" },
    { name: "Student Start-up and Innovation Policy, Gujarat", url: "https://ssipgujarat.in" },
    { name: "Kerala Startup Mission: IEDCs", url: "https://iedc.startupmission.in" },
    { name: "Atal Innovation Mission", url: "https://aim.gov.in" },
  ],
  women: [
    { name: "Women Entrepreneurship Platform, NITI Aayog", url: "https://wep.gov.in" },
    { name: "Stand-Up India", url: "https://www.standupmitra.in" },
    { name: "Startup India", url: "https://www.startupindia.gov.in" },
  ],
  selling: [
    { name: "Startup India: procurement by government", url: "https://www.startupindia.gov.in/content/sih/en/public_procurement.html" },
    { name: "Government e-Marketplace (GeM)", url: "https://gem.gov.in" },
    { name: "Central Public Procurement Portal", url: "https://eprocure.gov.in" },
    { name: "Udyam registration for MSMEs", url: "https://udyamregistration.gov.in" },
  ],
};

type Step = { title: string; body: string };
export type GuideText = {
  title: string;
  lead: string;
  stepsTitle: string;
  steps: Step[];
  /** Heading over the directory entries. */
  listTitle: string;
  listLead: string;
  /** Heading for the national entries, then state-by-state ones. */
  listNational: string;
  listStates: string;
};

export type SharedText = {
  breadcrumb: string;
  checked: string;
  unchecked: string;
  schemesTitle: string;
  scanLink: string;
  schemesLead: string;
  docsTitle: string;
  guidesTitle: string;
  sourcesTitle: string;
  related: string;
  missing: string;
};

const sharedEn: SharedText = {
  breadcrumb: "Founder guides",
  checked: "Written from official sources on {date}. This is general information, not legal or financial advice: programmes and rules change, so confirm on the official site before you act.",
  unchecked: "The organisations listed here were gathered on {date} and haven't been checked by an editor yet. Confirm details on each organisation's own site.",
  schemesTitle: "Schemes to check",
  scanLink: "Run the Scheme Scan",
  schemesLead: "See which ones you qualify for.",
  docsTitle: "Templates that help",
  guidesTitle: "Guides to read next",
  sourcesTitle: "Official sources",
  related: "More founder guides",
  missing: "Know a programme that should be here? Email us and we'll check it.",
};

const sharedHi: SharedText = {
  breadcrumb: "संस्थापकों के लिए गाइड",
  checked: "{date} को आधिकारिक स्रोतों से लिखा गया। यह सामान्य जानकारी है, क़ानूनी या वित्तीय सलाह नहीं: कार्यक्रम और नियम बदलते रहते हैं, इसलिए कुछ भी करने से पहले आधिकारिक साइट पर पुष्टि करें।",
  unchecked: "यहाँ दी गई संस्थाएँ {date} को जुटाई गईं और किसी संपादक ने अभी इनकी जाँच नहीं की है। हर संस्था की अपनी साइट पर ब्योरे की पुष्टि करें।",
  schemesTitle: "जाँचने लायक़ योजनाएँ",
  scanLink: "योजना जाँच चलाएँ",
  schemesLead: "देखें कि आप किनके पात्र हैं।",
  docsTitle: "काम आने वाले टेम्पलेट",
  guidesTitle: "आगे पढ़ने लायक़ गाइड (अंग्रेज़ी में)",
  sourcesTitle: "आधिकारिक स्रोत",
  related: "संस्थापकों के लिए और गाइड",
  missing: "कोई कार्यक्रम जो यहाँ होना चाहिए? हमें ईमेल करें, हम जाँच लेंगे।",
};

const en: Record<FounderGuide, GuideText> = {
  mentors: {
    title: "Find a mentor for your startup",
    lead: "Free mentoring programmes run by the government, foundations and founder networks, and how to get real help from a mentor once you have one.",
    stepsTitle: "Getting the most from a mentor",
    steps: [
      { title: "Know what you need help with", body: "Mentors are most useful on a specific problem: pricing your first product, a hire, a fundraise, a regulatory question. Write down the two or three questions you want answered before you ask anyone." },
      { title: "Pick people who have done it", body: "Look for someone who has solved your problem in your sector, not just someone senior. A founder two or three years ahead of you is often more useful than a famous name." },
      { title: "Start with the free programmes", body: "MAARG, the government's mentorship portal, matches startups registered on Startup India with mentors by sector, stage and skill. Incubators, TiE chapters and foundations also run free mentoring." },
      { title: "Agree how you'll work together", body: "Agree how often you'll meet, how you'll share updates and what each of you expects. A short monthly update keeps a busy mentor involved." },
      { title: "Put any equity in writing", body: "If a mentor becomes an advisor in return for shares, sign an advisor agreement that says what they'll do, how many shares vest and over what period." },
      { title: "Be careful with fees for introductions", body: "Be wary of anyone who charges a fee to introduce you to investors or promises funding in return for payment. Good mentoring programmes and investor networks don't sell access." },
    ],
    listTitle: "Mentoring programmes and networks",
    listLead: "Organisations only: Foundura doesn't list individual mentors.",
    listNational: "Across India",
    listStates: "By state",
  },
  coworking: {
    title: "Co-working space for startups",
    lead: "Desks, cabins and labs for startups at government hubs and incubators, and state schemes that pay part of the rent.",
    stepsTitle: "Before you take a desk",
    steps: [
      { title: "Start with your state's startup hub", body: "Many state governments run startup buildings with subsidised desks, often for startups registered with the state's startup cell or backed by a state scheme." },
      { title: "Look at incubators too", body: "Most incubators include a desk with their programme, along with mentoring and help with grants. If you're applying to one anyway, you may not need a separate co-working space." },
      { title: "Check for a seat subsidy", body: "Some state startup policies pay back part of the seat cost at co-working spaces on their list. Look in your state's policy on the states page before you sign." },
      { title: "Ask what's included", body: "Ask about internet, meeting rooms, access hours, labs or test equipment, and whether you can use the address for GST registration and as the company's registered office." },
      { title: "Read the agreement", body: "Check the notice period, deposit, price rises and what happens to your desk if the programme ends. Keep a copy of the signed agreement and the rent receipts for your accounts." },
    ],
    listTitle: "Workspace at hubs, incubators and state schemes",
    listLead: "Government and non-profit spaces only: no paid listings.",
    listNational: "Across India",
    listStates: "By state",
  },
  students: {
    title: "Starting up as a student in India",
    lead: "Campus innovation councils, hackathons, student startup policies and the paperwork student founders need to know about.",
    stepsTitle: "The path for student founders",
    steps: [
      { title: "Start on your own campus", body: "Most colleges have an Institution's Innovation Council, an entrepreneurship cell or an incubator. They run ideation sessions, connect you with mentors and can nominate you for grants and hackathons." },
      { title: "Enter hackathons and challenges", body: "The Smart India Hackathon sets real problems from ministries and companies. Teams enter through their college's internal hackathon, which is also a good way to find co-founders." },
      { title: "Check your state's student policy", body: "Some states fund student ideas directly: Gujarat's Student Start-up and Innovation Policy gives grants for proofs of concept, and Kerala Startup Mission runs innovation centres in hundreds of colleges." },
      { title: "Settle who owns the idea", body: "If you build with your college's labs, money or staff, its IP policy may give it a share. Read the policy, and agree in writing with your co-founders who owns what before you start." },
      { title: "If you're under 18", body: "In India a contract signed by someone under 18 can't be enforced, so younger founders usually can't sign agreements or become company directors themselves. A parent or an adult co-founder handles the paperwork until then: ask a CA or lawyer how to set it up." },
      { title: "Register when it's real", body: "You don't need a company to test an idea. Register one when you're about to take money, sign customers or hire, then apply for DPIIT recognition, which is free." },
    ],
    listTitle: "Programmes for students and colleges",
    listLead: "National programmes, then state ones.",
    listNational: "Across India",
    listStates: "By state",
  },
  women: {
    title: "Support for women founders in India",
    lead: "Schemes, programmes and networks for women-led startups, and what counts as women-led when you apply.",
    stepsTitle: "Where to start",
    steps: [
      { title: "Run the Scheme Scan", body: "The scan asks whether your startup is led by a woman. Some schemes, such as Stand-Up India bank loans for new enterprises, are only for women-led or other specified enterprises." },
      { title: "Check what women-led means", body: "Each scheme defines it in its own words, often as a woman holding at least 51% of the shares and leading the business. Check the rule before you apply, and keep your cap table up to date." },
      { title: "Look at your state's policy", body: "Many state startup policies give extra or higher support to startups led by women, from grants to incubation. Your state's page lists its policy and programmes." },
      { title: "Join a women founders' programme", body: "Telangana's WE Hub, NITI Aayog's Women Entrepreneurship Platform and TiE Women run programmes, mentoring and pitch events for women-led startups." },
      { title: "Use the general schemes too", body: "Women-led startups can also use every general scheme, from DPIIT recognition to the Seed Fund. Women-only programmes are a start, not a limit." },
    ],
    listTitle: "Programmes and networks for women founders",
    listLead: "Organisations and public programmes only.",
    listNational: "Across India",
    listStates: "By state",
  },
  selling: {
    title: "Selling to government and large companies",
    lead: "How startups sell to government buyers through GeM and tenders, the relaxations DPIIT recognition gives you, and how to win a pilot with a large company.",
    stepsTitle: "Selling to government",
    steps: [
      { title: "Get DPIIT recognition", body: "Most procurement relaxations are only for startups recognised by DPIIT. It's free and done online on Startup India." },
      { title: "Register as a seller on GeM", body: "The Government e-Marketplace is the main channel for central government buying. Register as a seller and add your DPIIT recognition, which marks your listing as a startup." },
      { title: "List new products through Startup Runway", body: "If your product doesn't fit an existing GeM category, GeM Startup Runway lets recognised startups list innovative products so buyers can find them." },
      { title: "Use the tender relaxations", body: "Under the General Financial Rules, recognised startups can be exempted from prior turnover and prior experience conditions, and from paying earnest money (bid security). The quality and technical specifications of each tender still apply. Tenders on the Central Public Procurement Portal follow the same rules." },
      { title: "Check your state's rules", body: "States buy through their own portals and rules, and many startup policies add relaxations for local startups. Look up your state's policy on the states page." },
      { title: "Raise a grievance if a buyer ignores the rules", body: "If a public buyer refuses the relaxations, a recognised startup can file a procurement grievance on Startup India, which DPIIT reviews with the department." },
    ],
    listTitle: "Programmes large companies run for startups",
    listLead: "Accelerators, challenges and pilot programmes: often the quickest route to a first big customer.",
    listNational: "Across India",
    listStates: "By state",
  },
};

/** Extra steps for the selling page: large companies. */
export const corporateStepsEn: { title: string; steps: Step[] } = {
  title: "Selling to large companies",
  steps: [
    { title: "Start with a paid pilot", body: "Large companies often begin with a small pilot. Agree the scope, the length, the price and what success looks like before you start, and how a pilot becomes a contract." },
    { title: "Protect what you share", body: "Sign a non-disclosure agreement before you show anything confidential, and agree who owns anything built during the pilot." },
    { title: "Get ready for vendor onboarding", body: "Expect to provide your PAN, GST registration, bank details and often Udyam registration. By law, buyers must pay registered micro and small enterprises by the agreed date, which can't be more than 45 days after acceptance (15 days if no date was agreed), so registering on Udyam can help you get paid on time." },
    { title: "Turn the pilot into proof", body: "Write up what changed for the customer, with their permission, and use it to win the next one." },
  ],
};

const corporateStepsHi: typeof corporateStepsEn = {
  title: "बड़ी कंपनियों को बेचना",
  steps: [
    { title: "पेड पायलट से शुरू करें", body: "बड़ी कंपनियाँ अक्सर छोटे पायलट से शुरुआत करती हैं। शुरू करने से पहले दायरा, अवधि, क़ीमत और सफलता का पैमाना तय करें, और यह भी कि पायलट अनुबंध में कैसे बदलेगा।" },
    { title: "जो साझा करें उसे सुरक्षित रखें", body: "कुछ भी गोपनीय दिखाने से पहले गोपनीयता समझौते (NDA) पर हस्ताक्षर करें, और तय करें कि पायलट के दौरान बनी चीज़ों का मालिक कौन होगा।" },
    { title: "वेंडर ऑनबोर्डिंग की तैयारी रखें", body: "अपना PAN, GST रजिस्ट्रेशन, बैंक ब्योरा और अक्सर उद्यम रजिस्ट्रेशन देने के लिए तैयार रहें। क़ानून के मुताबिक़ ख़रीदारों को रजिस्टर्ड सूक्ष्म और लघु उद्यमों को तय तारीख़ तक भुगतान करना होता है, जो स्वीकृति के 45 दिनों से ज़्यादा नहीं हो सकती (तारीख़ तय न हो तो 15 दिन), इसलिए उद्यम रजिस्ट्रेशन समय पर भुगतान पाने में मदद कर सकता है।" },
    { title: "पायलट को सबूत बनाएँ", body: "ग्राहक की अनुमति से लिखें कि उनके लिए क्या बदला, और अगला ग्राहक जीतने में उसका इस्तेमाल करें।" },
  ],
};

const hi: Record<FounderGuide, GuideText> = {
  mentors: {
    title: "अपने स्टार्टअप के लिए मेंटर खोजें",
    lead: "सरकार, फ़ाउंडेशन और संस्थापकों के नेटवर्क के मुफ़्त मेंटरिंग कार्यक्रम, और मेंटर मिल जाने के बाद उनसे असली मदद कैसे लें।",
    stepsTitle: "मेंटर से सबसे ज़्यादा फ़ायदा कैसे लें",
    steps: [
      { title: "जानें कि किस बात में मदद चाहिए", body: "मेंटर किसी ख़ास समस्या पर सबसे ज़्यादा काम आते हैं: पहले प्रोडक्ट की क़ीमत, कोई भर्ती, फ़ंड जुटाना, कोई नियामक सवाल। किसी से पूछने से पहले वे दो-तीन सवाल लिख लें जिनके जवाब आपको चाहिए।" },
      { title: "ऐसे लोग चुनें जिन्होंने यह किया हो", body: "ऐसे व्यक्ति को खोजें जिसने आपके सेक्टर में आपकी जैसी समस्या सुलझाई हो, सिर्फ़ किसी वरिष्ठ व्यक्ति को नहीं। आपसे दो-तीन साल आगे का संस्थापक अक्सर किसी मशहूर नाम से ज़्यादा काम आता है।" },
      { title: "मुफ़्त कार्यक्रमों से शुरुआत करें", body: "सरकार का मेंटरशिप पोर्टल MAARG, Startup India पर रजिस्टर्ड स्टार्टअप को सेक्टर, चरण और कौशल के हिसाब से मेंटर से जोड़ता है। इनक्यूबेटर, TiE चैप्टर और फ़ाउंडेशन भी मुफ़्त मेंटरिंग चलाते हैं।" },
      { title: "तय करें कि साथ कैसे काम करेंगे", body: "तय करें कि कितनी बार मिलेंगे, अपडेट कैसे साझा करेंगे और दोनों एक-दूसरे से क्या उम्मीद रखते हैं। हर महीने का छोटा अपडेट व्यस्त मेंटर को भी जोड़े रखता है।" },
      { title: "इक्विटी हो तो लिखित में रखें", body: "अगर कोई मेंटर शेयर के बदले सलाहकार बनता है, तो सलाहकार समझौते पर हस्ताक्षर करें, जिसमें लिखा हो कि वे क्या करेंगे, कितने शेयर किस अवधि में मिलेंगे।" },
      { title: "परिचय के लिए फ़ीस से सावधान रहें", body: "निवेशकों से मिलवाने के लिए फ़ीस माँगने वाले या पैसे के बदले फ़ंडिंग का वादा करने वाले किसी भी व्यक्ति से सावधान रहें। अच्छे मेंटरिंग कार्यक्रम और निवेशक नेटवर्क पहुँच नहीं बेचते।" },
    ],
    listTitle: "मेंटरिंग कार्यक्रम और नेटवर्क",
    listLead: "सिर्फ़ संस्थाएँ: Foundura अलग-अलग मेंटर की सूची नहीं देता।",
    listNational: "पूरे भारत में",
    listStates: "राज्य के हिसाब से",
  },
  coworking: {
    title: "स्टार्टअप के लिए को-वर्किंग जगह",
    lead: "सरकारी हब और इनक्यूबेटर में स्टार्टअप के लिए डेस्क, केबिन और लैब, और वे राज्य योजनाएँ जो किराए का कुछ हिस्सा लौटाती हैं।",
    stepsTitle: "डेस्क लेने से पहले",
    steps: [
      { title: "अपने राज्य के स्टार्टअप हब से शुरू करें", body: "कई राज्य सरकारें रियायती डेस्क वाली स्टार्टअप इमारतें चलाती हैं, अक्सर राज्य के स्टार्टअप सेल में रजिस्टर्ड या किसी राज्य योजना से जुड़े स्टार्टअप के लिए।" },
      { title: "इनक्यूबेटर भी देखें", body: "ज़्यादातर इनक्यूबेटर अपने कार्यक्रम के साथ डेस्क भी देते हैं, साथ में मेंटरिंग और ग्रांट में मदद। अगर आप वैसे भी किसी में आवेदन कर रहे हैं, तो शायद अलग को-वर्किंग जगह की ज़रूरत न पड़े।" },
      { title: "सीट सब्सिडी देखें", body: "कुछ राज्यों की स्टार्टअप नीतियाँ अपनी सूची वाली को-वर्किंग जगहों पर सीट की लागत का कुछ हिस्सा लौटाती हैं। हस्ताक्षर से पहले राज्यों वाले पेज पर अपने राज्य की नीति देखें।" },
      { title: "पूछें कि क्या-क्या शामिल है", body: "इंटरनेट, मीटिंग रूम, आने-जाने के घंटे, लैब या जाँच उपकरण के बारे में पूछें, और यह भी कि क्या यह पता GST रजिस्ट्रेशन और कंपनी के रजिस्टर्ड दफ़्तर के लिए इस्तेमाल हो सकता है।" },
      { title: "समझौता पढ़ें", body: "नोटिस अवधि, जमा राशि, क़ीमत बढ़ने और कार्यक्रम ख़त्म होने पर डेस्क का क्या होगा, यह देखें। हस्ताक्षर किया समझौता और किराए की रसीदें अपने हिसाब-किताब के लिए रखें।" },
    ],
    listTitle: "हब, इनक्यूबेटर और राज्य योजनाओं में काम की जगह",
    listLead: "सिर्फ़ सरकारी और गैर-लाभकारी जगहें: कोई पेड लिस्टिंग नहीं।",
    listNational: "पूरे भारत में",
    listStates: "राज्य के हिसाब से",
  },
  students: {
    title: "भारत में छात्र के तौर पर स्टार्टअप शुरू करना",
    lead: "कैंपस इनोवेशन काउंसिल, हैकाथॉन, छात्र स्टार्टअप नीतियाँ और वे काग़ज़ी काम जो छात्र संस्थापकों को जानने चाहिए।",
    stepsTitle: "छात्र संस्थापकों का रास्ता",
    steps: [
      { title: "अपने कैंपस से शुरू करें", body: "ज़्यादातर कॉलेजों में इंस्टिट्यूशन इनोवेशन काउंसिल, उद्यमिता सेल या इनक्यूबेटर होता है। वे आइडिया सत्र चलाते हैं, मेंटर से जोड़ते हैं और आपको ग्रांट और हैकाथॉन के लिए नामित कर सकते हैं।" },
      { title: "हैकाथॉन और चुनौतियों में हिस्सा लें", body: "स्मार्ट इंडिया हैकाथॉन में मंत्रालयों और कंपनियों की असली समस्याएँ होती हैं। टीमें अपने कॉलेज के आंतरिक हैकाथॉन से आगे जाती हैं, और यह सह-संस्थापक खोजने का भी अच्छा तरीक़ा है।" },
      { title: "अपने राज्य की छात्र नीति देखें", body: "कुछ राज्य छात्रों के आइडिया को सीधे फ़ंड देते हैं: गुजरात की स्टूडेंट स्टार्ट-अप एंड इनोवेशन पॉलिसी प्रूफ़ ऑफ़ कॉन्सेप्ट के लिए ग्रांट देती है, और केरल स्टार्टअप मिशन सैकड़ों कॉलेजों में इनोवेशन केंद्र चलाता है।" },
      { title: "तय करें कि आइडिया किसका है", body: "अगर आप कॉलेज की लैब, पैसे या स्टाफ़ से कुछ बनाते हैं, तो उसकी IP नीति उसे हिस्सा दे सकती है। नीति पढ़ें, और शुरू करने से पहले अपने सह-संस्थापकों के साथ लिखित में तय करें कि किसका क्या है।" },
      { title: "अगर आपकी उम्र 18 से कम है", body: "भारत में 18 साल से कम उम्र के व्यक्ति का किया अनुबंध लागू नहीं कराया जा सकता, इसलिए कम उम्र के संस्थापक आम तौर पर ख़ुद समझौते पर हस्ताक्षर नहीं कर सकते या कंपनी के निदेशक नहीं बन सकते। तब तक माता-पिता या कोई वयस्क सह-संस्थापक काग़ज़ी काम संभालता है: इसे कैसे व्यवस्थित करें, यह किसी CA या वकील से पूछें।" },
      { title: "जब काम असली हो तब रजिस्टर करें", body: "आइडिया परखने के लिए कंपनी की ज़रूरत नहीं होती। जब पैसा लेने, ग्राहकों से समझौता करने या भर्ती करने वाले हों, तब कंपनी रजिस्टर करें, फिर DPIIT मान्यता के लिए आवेदन करें, जो मुफ़्त है।" },
    ],
    listTitle: "छात्रों और कॉलेजों के लिए कार्यक्रम",
    listLead: "पहले राष्ट्रीय कार्यक्रम, फिर राज्यों के।",
    listNational: "पूरे भारत में",
    listStates: "राज्य के हिसाब से",
  },
  women: {
    title: "भारत में महिला संस्थापकों के लिए सहायता",
    lead: "महिला-नेतृत्व वाले स्टार्टअप के लिए योजनाएँ, कार्यक्रम और नेटवर्क, और आवेदन करते समय महिला-नेतृत्व का मतलब क्या होता है।",
    stepsTitle: "कहाँ से शुरू करें",
    steps: [
      { title: "योजना जाँच चलाएँ", body: "जाँच पूछती है कि क्या आपके स्टार्टअप का नेतृत्व कोई महिला करती है। कुछ योजनाएँ, जैसे नए उद्यमों के लिए स्टैंड-अप इंडिया बैंक लोन, सिर्फ़ महिला-नेतृत्व वाले या दूसरे तय उद्यमों के लिए हैं।" },
      { title: "देखें कि महिला-नेतृत्व का मतलब क्या है", body: "हर योजना इसे अपने शब्दों में परिभाषित करती है, अक्सर ऐसे कि किसी महिला के पास कम से कम 51% शेयर हों और वही कारोबार चलाए। आवेदन से पहले नियम देखें, और अपनी कैप टेबल अद्यतन रखें।" },
      { title: "अपने राज्य की नीति देखें", body: "कई राज्यों की स्टार्टअप नीतियाँ महिलाओं के नेतृत्व वाले स्टार्टअप को अतिरिक्त या ज़्यादा सहायता देती हैं, ग्रांट से लेकर इनक्यूबेशन तक। आपके राज्य के पेज पर उसकी नीति और कार्यक्रम हैं।" },
      { title: "महिला संस्थापकों के कार्यक्रम से जुड़ें", body: "तेलंगाना का वी हब, नीति आयोग का वुमन एंटरप्रेन्योरशिप प्लेटफ़ॉर्म और टाई विमेन महिला-नेतृत्व वाले स्टार्टअप के लिए कार्यक्रम, मेंटरिंग और पिच कार्यक्रम चलाते हैं।" },
      { title: "सामान्य योजनाओं का भी इस्तेमाल करें", body: "महिला-नेतृत्व वाले स्टार्टअप DPIIT मान्यता से लेकर सीड फ़ंड तक हर सामान्य योजना का भी इस्तेमाल कर सकते हैं। सिर्फ़ महिलाओं वाले कार्यक्रम शुरुआत हैं, सीमा नहीं।" },
    ],
    listTitle: "महिला संस्थापकों के लिए कार्यक्रम और नेटवर्क",
    listLead: "सिर्फ़ संस्थाएँ और सार्वजनिक कार्यक्रम।",
    listNational: "पूरे भारत में",
    listStates: "राज्य के हिसाब से",
  },
  selling: {
    title: "सरकार और बड़ी कंपनियों को बेचना",
    lead: "स्टार्टअप GeM और टेंडर के ज़रिए सरकारी ख़रीदारों को कैसे बेचते हैं, DPIIT मान्यता से कौन-सी छूट मिलती है, और किसी बड़ी कंपनी के साथ पायलट कैसे पाएँ।",
    stepsTitle: "सरकार को बेचना",
    steps: [
      { title: "DPIIT मान्यता लें", body: "ख़रीद से जुड़ी ज़्यादातर छूटें सिर्फ़ DPIIT मान्यता वाले स्टार्टअप के लिए हैं। यह मुफ़्त है और Startup India पर ऑनलाइन होती है।" },
      { title: "GeM पर विक्रेता के तौर पर रजिस्टर करें", body: "गवर्नमेंट ई-मार्केटप्लेस केंद्र सरकार की ख़रीद का मुख्य रास्ता है। विक्रेता के तौर पर रजिस्टर करें और अपनी DPIIT मान्यता जोड़ें, जिससे आपकी लिस्टिंग पर स्टार्टअप का निशान लगता है।" },
      { title: "नए प्रोडक्ट स्टार्टअप रनवे से लिस्ट करें", body: "अगर आपका प्रोडक्ट GeM की किसी मौजूदा श्रेणी में नहीं आता, तो GeM स्टार्टअप रनवे मान्यता वाले स्टार्टअप को नए प्रोडक्ट लिस्ट करने देता है ताकि ख़रीदार उन्हें खोज सकें।" },
      { title: "टेंडर की छूटों का इस्तेमाल करें", body: "सामान्य वित्तीय नियमों (GFR) के तहत मान्यता वाले स्टार्टअप को पिछले टर्नओवर और पिछले अनुभव की शर्तों से, और बयाना राशि (बिड सिक्योरिटी) जमा करने से छूट मिल सकती है। हर टेंडर की गुणवत्ता और तकनीकी शर्तें फिर भी लागू रहती हैं। सेंट्रल पब्लिक प्रोक्योरमेंट पोर्टल के टेंडर भी इन्हीं नियमों पर चलते हैं।" },
      { title: "अपने राज्य के नियम देखें", body: "राज्य अपने पोर्टल और नियमों से ख़रीदते हैं, और कई स्टार्टअप नीतियाँ स्थानीय स्टार्टअप के लिए अतिरिक्त छूट देती हैं। राज्यों वाले पेज पर अपने राज्य की नीति देखें।" },
      { title: "ख़रीदार नियम न माने तो शिकायत करें", body: "अगर कोई सरकारी ख़रीदार छूट देने से मना करे, तो मान्यता वाला स्टार्टअप Startup India पर ख़रीद संबंधी शिकायत दर्ज कर सकता है, जिसे DPIIT संबंधित विभाग के साथ देखता है।" },
    ],
    listTitle: "बड़ी कंपनियों के स्टार्टअप कार्यक्रम",
    listLead: "एक्सेलरेटर, चुनौतियाँ और पायलट कार्यक्रम: अक्सर पहला बड़ा ग्राहक पाने का सबसे तेज़ रास्ता।",
    listNational: "पूरे भारत में",
    listStates: "राज्य के हिसाब से",
  },
};

export const guideText: Record<"en" | "hi", Record<FounderGuide, GuideText>> = { en, hi };
export const sharedText: Record<"en" | "hi", SharedText> = { en: sharedEn, hi: sharedHi };
export const corporateSteps: Record<"en" | "hi", typeof corporateStepsEn> = { en: corporateStepsEn, hi: corporateStepsHi };
