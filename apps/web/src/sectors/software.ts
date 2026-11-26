/**
 * Software and SaaS sector guide (/sectors/software). Written from official sources and general practice
 * on CHECKED_ON. English and Hindi only; other languages show the English. When GST, export, payment or
 * data protection rules change, update both languages and CHECKED_ON.
 */

export const CHECKED_ON = "2026-11-26";

/** Schemes from the catalogue that most software startups should look at, in this order. */
export const SOFTWARE_SCHEMES = [
  "dpiit-startup-recognition",
  "startup-india-seed-fund",
  "income-tax-holiday-80iac",
  "credit-guarantee-scheme-startups",
  "public-procurement-relaxations",
  "startup-india-fund-of-funds-2",
];

/** Templates for selling software, in this order. */
export const SOFTWARE_DOCS = ["customer-agreement", "website-terms", "privacy-policy", "data-processing-agreement", "ip-assignment", "nda"];

/** Guides that matter most for software founders. */
export const SOFTWARE_GUIDES = [
  "gst-registration-for-startups",
  "dpdp-act-for-startups",
  "unit-economics-for-startups",
  "startup-pricing-first-product",
  "startup-intellectual-property-india",
];

export const SOURCES = [
  { name: "GST portal (registration, letter of undertaking, returns)", url: "https://www.gst.gov.in" },
  { name: "CBIC GST: acts, rules and notifications", url: "https://cbic-gst.gov.in" },
  { name: "Reserve Bank of India: foreign exchange and payment rules", url: "https://www.rbi.org.in" },
  { name: "DGFT: electronic bank realisation certificates", url: "https://www.dgft.gov.in" },
  { name: "Ministry of Electronics and IT: data protection", url: "https://www.meity.gov.in" },
  { name: "Startup India: DPIIT recognition", url: "https://www.startupindia.gov.in" },
  { name: "Government e-Marketplace (GeM)", url: "https://gem.gov.in" },
];

type Step = { title: string; body: string };

const en = {
  breadcrumb: "Sector guides",
  title: "Building a software or SaaS company in India",
  lead: "Registration, tax, getting paid from abroad, data protection and the schemes that suit software founders, in one place.",
  checked: "Checked against official sources on {date}. This is a guide, not legal or tax advice: rules change, so confirm with a chartered accountant or lawyer before you act.",
  stepsTitle: "The path, step by step",
  steps: [
    {
      title: "Register the company and apply for DPIIT recognition",
      body: "Most software startups register a private limited company, because investors and customers expect it and it can issue ESOPs. Then apply for DPIIT recognition: it is free and unlocks tax, fee and procurement benefits.",
    },
    {
      title: "Make sure the company owns the code",
      body: "Code written by founders, freelancers or agencies belongs to them unless an agreement assigns it. Sign IP assignments with everyone who builds for you, and keep a list of the open-source licences you use, since some carry conditions when you distribute software.",
    },
    {
      title: "Sort out GST",
      body: "Once your turnover crosses the limit (₹20 lakh for services in most states) you must register, and many software startups register earlier because business customers want GST invoices. Most software and IT services are taxed at 18% when sold in India.",
    },
    {
      title: "Export without charging GST",
      body: "Selling to customers abroad, paid in foreign currency, can count as an export of services, which is zero-rated. File a letter of undertaking (LUT) on the GST portal each financial year, then invoice without GST and still claim input credit. Check the conditions for each kind of customer.",
    },
    {
      title: "Get paid from abroad the right way",
      body: "Receive foreign payments through your bank or a payment provider licensed by the RBI for cross-border payments. Keep the foreign inward remittance advice your bank issues: it is your proof of export. Some software exports also need a SOFTEX form certified by STPI or an SEZ; ask your CA whether it applies to you.",
    },
    {
      title: "Expect TDS from Indian business customers",
      body: "Indian companies paying for software or services often deduct income tax at source (TDS) before paying you. Check it appears against your PAN in your tax statement and claim it in your return, and price with this cash-flow gap in mind.",
    },
    {
      title: "Prepare for the DPDP Act",
      body: "If your product handles personal data, the Digital Personal Data Protection Act and its 2025 rules apply. Most duties for businesses (notices, consent, security, breach reporting and people's rights) apply from 13 May 2027. Customers will also ask you to sign data processing terms, so have yours ready.",
    },
    {
      title: "Put proper terms in place",
      body: "You need a customer agreement or subscription terms, website terms, a privacy policy and a data processing agreement. Clear terms on uptime, support, liability and data make enterprise sales faster.",
    },
    {
      title: "Consider selling to government",
      body: "Central government buyers purchase through GeM. DPIIT-recognised startups get relaxed prior-experience and turnover conditions in many tenders, which matters for software that public bodies need.",
    },
  ] satisfies Step[],
  metricsTitle: "The numbers investors ask software founders for",
  metrics: [
    { t: "Monthly recurring revenue (MRR)", d: "Subscription revenue you can count on each month; annual recurring revenue (ARR) is MRR × 12." },
    { t: "Churn", d: "The share of customers, or of revenue, lost each month." },
    { t: "Net revenue retention", d: "Revenue this year from last year's customers, including upgrades, as a share of what they paid last year. Over 100% means existing customers grow." },
    { t: "CAC payback", d: "Months of gross profit needed to earn back what it cost to win a customer." },
    { t: "Gross margin", d: "Revenue minus hosting, payment fees and support. Healthy software businesses usually keep most of their revenue." },
  ],
  metricsMore: "Read the guide to unit economics",
  schemesTitle: "Schemes to check",
  schemesLead: "Run the Scheme Scan to see which you qualify for.",
  scanLink: "Run the Scheme Scan",
  docsTitle: "Templates for selling software",
  guidesTitle: "Guides for software founders",
  perks: "Free cloud, AI and software credits for startups are on the {link}.",
  perksLink: "perks page",
  investorsTitle: "Investors in AI, SaaS and software",
  investorsBrowse: "All investors in this sector",
  investorsEmpty: "No investors with this focus are listed yet.",
  sourcesTitle: "Official sources",
};

export type SoftwareText = typeof en;

const hi: SoftwareText = {
  breadcrumb: "सेक्टर गाइड",
  title: "भारत में सॉफ़्टवेयर या SaaS कंपनी बनाना",
  lead: "रजिस्ट्रेशन, टैक्स, विदेश से भुगतान लेना, डेटा सुरक्षा और सॉफ़्टवेयर संस्थापकों के लिए उपयुक्त योजनाएँ, एक ही जगह।",
  checked: "{date} को आधिकारिक स्रोतों से मिलाया गया। यह गाइड है, क़ानूनी या टैक्स सलाह नहीं: नियम बदलते हैं, इसलिए कुछ करने से पहले चार्टर्ड अकाउंटेंट या वकील से पुष्टि करें।",
  stepsTitle: "रास्ता, क़दम-दर-क़दम",
  steps: [
    {
      title: "कंपनी रजिस्टर करें और DPIIT मान्यता के लिए आवेदन करें",
      body: "ज़्यादातर सॉफ़्टवेयर स्टार्टअप प्राइवेट लिमिटेड कंपनी रजिस्टर करते हैं, क्योंकि निवेशक और ग्राहक यही चाहते हैं और इसमें ESOP दिए जा सकते हैं। फिर DPIIT मान्यता के लिए आवेदन करें: यह मुफ़्त है और टैक्स, फ़ीस और सरकारी ख़रीद के लाभ खोलती है।",
    },
    {
      title: "पक्का करें कि कोड कंपनी का हो",
      body: "संस्थापकों, फ़्रीलांसरों या एजेंसियों का लिखा कोड उन्हीं का होता है, जब तक कोई समझौता उसे कंपनी के नाम न करे। जो भी आपके लिए बनाता है, उसके साथ IP असाइनमेंट पर हस्ताक्षर करें, और इस्तेमाल किए गए ओपन-सोर्स लाइसेंसों की सूची रखें, क्योंकि कुछ लाइसेंस सॉफ़्टवेयर बाँटने पर शर्तें लगाते हैं।",
    },
    {
      title: "GST व्यवस्थित करें",
      body: "टर्नओवर सीमा पार होते ही (ज़्यादातर राज्यों में सेवाओं के लिए ₹20 लाख) रजिस्ट्रेशन ज़रूरी है, और कई सॉफ़्टवेयर स्टार्टअप पहले ही रजिस्टर कर लेते हैं क्योंकि कारोबारी ग्राहक GST इनवॉइस चाहते हैं। भारत में बिकने वाली ज़्यादातर सॉफ़्टवेयर और IT सेवाओं पर 18% GST लगता है।",
    },
    {
      title: "बिना GST लिए निर्यात करें",
      body: "विदेशी ग्राहकों को विदेशी मुद्रा में भुगतान पर की गई बिक्री सेवाओं का निर्यात मानी जा सकती है, जो ज़ीरो-रेटेड है। हर वित्त वर्ष GST पोर्टल पर लेटर ऑफ़ अंडरटेकिंग (LUT) फ़ाइल करें, फिर बिना GST के इनवॉइस बनाएँ और इनपुट क्रेडिट भी लें। हर तरह के ग्राहक के लिए शर्तें जाँच लें।",
    },
    {
      title: "विदेश से भुगतान सही तरीक़े से लें",
      body: "विदेशी भुगतान अपने बैंक से या RBI से सीमा-पार भुगतान का लाइसेंस पाए प्रदाता से लें। बैंक जो विदेशी आवक धनप्रेषण की सूचना देता है, उसे संभालकर रखें: यही आपके निर्यात का सबूत है। कुछ सॉफ़्टवेयर निर्यात के लिए STPI या SEZ से प्रमाणित SOFTEX फ़ॉर्म भी लगता है; अपने CA से पूछें कि क्या यह आप पर लागू है।",
    },
    {
      title: "भारतीय कारोबारी ग्राहकों से TDS की उम्मीद रखें",
      body: "सॉफ़्टवेयर या सेवाओं का भुगतान करने वाली भारतीय कंपनियाँ अक्सर भुगतान से पहले स्रोत पर कर (TDS) काट लेती हैं। देखें कि यह आपके टैक्स विवरण में आपके PAN पर दिखे और रिटर्न में इसका दावा करें, और क़ीमत तय करते समय नकदी के इस अंतर का ध्यान रखें।",
    },
    {
      title: "DPDP अधिनियम की तैयारी करें",
      body: "अगर आपका प्रोडक्ट निजी डेटा संभालता है, तो डिजिटल पर्सनल डेटा प्रोटेक्शन अधिनियम और उसके 2025 के नियम लागू होते हैं। कारोबारों के ज़्यादातर दायित्व (सूचना, सहमति, सुरक्षा, डेटा उल्लंघन की रिपोर्ट और लोगों के अधिकार) 13 मई 2027 से लागू होंगे। ग्राहक भी डेटा प्रोसेसिंग शर्तों पर हस्ताक्षर माँगेंगे, इसलिए अपनी शर्तें तैयार रखें।",
    },
    {
      title: "सही शर्तें तय करें",
      body: "आपको ग्राहक समझौता या सब्सक्रिप्शन शर्तें, वेबसाइट की शर्तें, निजता नीति और डेटा प्रोसेसिंग समझौता चाहिए। अपटाइम, सपोर्ट, दायित्व और डेटा पर साफ़ शर्तें बड़े ग्राहकों को बिक्री तेज़ करती हैं।",
    },
    {
      title: "सरकार को बेचने के बारे में सोचें",
      body: "केंद्र सरकार के ख़रीदार GeM से ख़रीदते हैं। DPIIT मान्यता वाले स्टार्टअप को कई टेंडरों में पिछले अनुभव और टर्नओवर की शर्तों में छूट मिलती है, जो सरकारी संस्थाओं के काम आने वाले सॉफ़्टवेयर के लिए अहम है।",
    },
  ],
  metricsTitle: "सॉफ़्टवेयर संस्थापकों से निवेशक कौन-से आँकड़े माँगते हैं",
  metrics: [
    { t: "मासिक आवर्ती आय (MRR)", d: "हर महीने मिलने वाली पक्की सब्सक्रिप्शन आय; वार्षिक आवर्ती आय (ARR) = MRR × 12।" },
    { t: "चर्न", d: "हर महीने छोड़कर जाने वाले ग्राहकों या आय का हिस्सा।" },
    { t: "नेट रेवेन्यू रिटेंशन", d: "पिछले साल के ग्राहकों से इस साल की आय, अपग्रेड समेत, उनकी पिछले साल की आय के हिस्से के रूप में। 100% से ज़्यादा का मतलब है मौजूदा ग्राहक बढ़ रहे हैं।" },
    { t: "CAC पेबैक", d: "एक ग्राहक पाने की लागत वापस कमाने में लगने वाले सकल मुनाफ़े के महीने।" },
    { t: "सकल मार्जिन", d: "आय में से होस्टिंग, भुगतान शुल्क और सपोर्ट घटाकर। अच्छे सॉफ़्टवेयर कारोबार आम तौर पर आय का बड़ा हिस्सा रखते हैं।" },
  ],
  metricsMore: "यूनिट इकोनॉमिक्स पर गाइड पढ़ें (अंग्रेज़ी में)",
  schemesTitle: "जाँचने लायक़ योजनाएँ",
  schemesLead: "योजना जाँच चलाकर देखें कि आप किनके पात्र हैं।",
  scanLink: "योजना जाँच चलाएँ",
  docsTitle: "सॉफ़्टवेयर बेचने के टेम्पलेट",
  guidesTitle: "सॉफ़्टवेयर संस्थापकों के लिए गाइड (अंग्रेज़ी में)",
  perks: "स्टार्टअप के लिए मुफ़्त क्लाउड, AI और सॉफ़्टवेयर क्रेडिट {link} पर हैं।",
  perksLink: "फ़ायदों वाले पेज",
  investorsTitle: "AI, SaaS और सॉफ़्टवेयर में निवेशक",
  investorsBrowse: "इस सेक्टर के सभी निवेशक",
  investorsEmpty: "इस फ़ोकस वाले निवेशक अभी सूची में नहीं हैं।",
  sourcesTitle: "आधिकारिक स्रोत",
};

export const softwareText: Record<"en" | "hi", SoftwareText> = { en, hi };
