import type { Metadata } from "next";
import { LANG_INFO, LANGS, lp, type Lang } from "./i18n/config";
import { SEO_INTL } from "./seo-intl";
import { contentOf } from "./i18n/content";

/**
 * Search engine details for each main page, in English and Hindi.
 *
 * - focus: the phrase the page should rank for; it opens the SEO title and appears in the description.
 * - title: the SEO title shown in search results (at most 60 characters, ending "| Foundura").
 * - description: the meta description (120 to 160 characters).
 * - excerpt: a short summary (at most 50 words) for social shares and structured data.
 * - keywords: 15 phrases people search for. Google ignores the keywords tag for ranking, but it
 *   records the page's target searches in one place and other engines still read it.
 * - slug: the page's address. Hindi pages live at /hi + the same slug.
 *
 * e2e/tests/seo.spec.ts checks every limit above.
 */
export type PageSeo = { slug: string; focus: string; title: string; description: string; excerpt: string; keywords: string[] };
export type PageKey =
  | "home"
  | "scan"
  | "schemes"
  | "medtech"
  | "startups"
  | "investors"
  | "events"
  | "policy"
  | "learn"
  | "documents"
  | "glossary"
  | "funding"
  | "basics"
  | "partners"
  | "about"
  | "contact"
  | "states"
  | "perks"
  | "investorUpdate"
  | "software"
  | "data"
  | "numbers"
  | "cities"
  | "mentors"
  | "coworking"
  | "students"
  | "women"
  | "selling"
  | "global"
  | "closing"
  | "labs"
  | "patents"
  | "founderGuides"
  | "setup"
  | "employees"
  | "esops"
  | "taxes"
  | "foreignInvestment"
  | "trademarks"
  | "licences"
  | "cyber"
  | "onlineSelling"
  | "insurance"
  | "rounds"
  | "msme"
  | "agritech"
  | "stories";

const SEO_EN_HI: Record<PageKey, Record<"en" | "hi", PageSeo>> = {
  home: {
    en: {
      slug: "/",
      focus: "free help for startups",
      title: "Free help for startups, in India and worldwide | Foundura",
      description: "Free help for startups from idea to investors: a scan of Indian government schemes, startup events worldwide, investors, a showcase, guides and templates.",
      excerpt: "Foundura gives founders free help from idea to investors. Indian startups can check which central and state schemes they qualify for; founders anywhere can find startup events and challenges worldwide, investors, a showcase for their product, a funding course, guides and templates.",
      keywords: ["free help for startups", "startup platform", "government schemes for startups", "startup schemes India", "startup events worldwide", "open innovation challenges", "startup showcase", "find investors", "angel investors", "startup funding course", "startup templates", "pitch deck template", "DPIIT recognition", "entering India startups", "Foundura"],
    },
    hi: {
      slug: "/",
      focus: "स्टार्टअप के लिए सरकारी योजनाएँ",
      title: "स्टार्टअप के लिए सरकारी योजनाएँ, भारत | Foundura",
      description:
        "स्टार्टअप के लिए सरकारी योजनाएँ जिनके लिए आप योग्य हैं, मुफ़्त जाँच से जानें: केंद्र और राज्य की योजनाएँ, साथ में निवेशक, कार्यक्रम, गाइड और टेम्पलेट।",
      excerpt:
        "Foundura भारतीय संस्थापकों को बताता है कि वे केंद्र और राज्य की किन सरकारी योजनाओं के लिए योग्य हैं, क्यों, और आवेदन कहाँ करें। साथ में निवेशक, स्टार्टअप कार्यक्रम, नीति समाचार, मुफ़्त गाइड और टेम्पलेट।",
      keywords: [
        "स्टार्टअप के लिए सरकारी योजनाएँ",
        "स्टार्टअप योजना",
        "स्टार्टअप इंडिया योजना",
        "DPIIT मान्यता",
        "स्टार्टअप अनुदान",
        "सीड फ़ंड योजना",
        "स्टार्टअप लोन",
        "राज्य स्टार्टअप नीति",
        "एंजल निवेशक भारत",
        "स्टार्टअप कार्यक्रम",
        "स्टार्टअप टेम्पलेट",
        "पिच डेक",
        "संस्थापकों के लिए गाइड",
        "योजना पात्रता जाँच",
        "Foundura",
      ],
    },
  },
  scan: {
    en: {
      slug: "/scan",
      focus: "startup scheme eligibility check",
      title: "Startup scheme eligibility check, free | Foundura",
      description:
        "A free startup scheme eligibility check: answer a few questions and see which central and state schemes you qualify for. Nothing you enter is stored.",
      excerpt:
        "The Scheme Scan checks your startup against every central and state scheme on Foundura, rule by rule, and shows which conditions you meet and which you don't. It takes a few minutes, needs no sign-up, and stores nothing you enter.",
      keywords: [
        "startup scheme eligibility check",
        "scheme eligibility checker",
        "government scheme finder",
        "which government schemes am I eligible for",
        "DPIIT recognition eligibility",
        "Startup India eligibility",
        "Seed Fund Scheme eligibility",
        "startup grant eligibility",
        "MSME scheme eligibility",
        "Section 80-IAC eligibility",
        "state startup scheme eligibility",
        "central government startup schemes",
        "free eligibility check",
        "startup benefits India",
        "Scheme Scan",
      ],
    },
    hi: {
      slug: "/scan",
      focus: "स्टार्टअप योजना पात्रता जाँच",
      title: "स्टार्टअप योजना पात्रता जाँच, मुफ़्त | Foundura",
      description:
        "मुफ़्त स्टार्टअप योजना पात्रता जाँच: कुछ सवालों के जवाब दें और देखें कि आप केंद्र और राज्य की किन योजनाओं के योग्य हैं। आपकी कोई जानकारी सेव नहीं होती।",
      excerpt:
        "योजना जाँच आपके स्टार्टअप को Foundura की हर केंद्रीय और राज्य योजना से नियम-दर-नियम मिलाती है और बताती है कि आप कौन-सी शर्तें पूरी करते हैं। कुछ मिनट लगते हैं, साइन-अप नहीं चाहिए, और कुछ सेव नहीं होता।",
      keywords: [
        "स्टार्टअप योजना पात्रता जाँच",
        "योजना पात्रता",
        "सरकारी योजना खोजें",
        "मैं किन योजनाओं के लिए योग्य हूँ",
        "DPIIT मान्यता पात्रता",
        "स्टार्टअप इंडिया पात्रता",
        "सीड फ़ंड योजना पात्रता",
        "स्टार्टअप अनुदान पात्रता",
        "MSME योजना पात्रता",
        "धारा 80-IAC",
        "राज्य स्टार्टअप योजना",
        "केंद्र सरकार की स्टार्टअप योजनाएँ",
        "मुफ़्त पात्रता जाँच",
        "स्टार्टअप लाभ",
        "योजना जाँच",
      ],
    },
  },
  schemes: {
    en: {
      slug: "/schemes",
      focus: "startup schemes in India",
      title: "Startup schemes in India: grants, loans, tax | Foundura",
      description:
        "Startup schemes in India in one list: DPIIT recognition, Seed Fund, grants, loans, tax holiday and state policies, each linked to its official source.",
      excerpt:
        "Every central and state government scheme for startups on Foundura, with what it gives, who qualifies, whether it's open, and a link to the official source. Covers recognition, grants, loans, tax benefits, IP fee relief, selling to government and state policies.",
      keywords: [
        "startup schemes in India",
        "government schemes for startups",
        "Startup India Seed Fund Scheme",
        "DPIIT startup recognition",
        "Section 80-IAC tax holiday",
        "Credit Guarantee Scheme for Startups",
        "BIRAC BIG grant",
        "NIDHI-PRAYAS",
        "startup grants India",
        "startup loans India",
        "Fund of Funds for Startups",
        "state startup policy",
        "Karnataka startup policy",
        "GeM Startup Runway",
        "startup IP benefits",
      ],
    },
    hi: {
      slug: "/schemes",
      focus: "भारत में स्टार्टअप योजनाएँ",
      title: "भारत में स्टार्टअप योजनाएँ: अनुदान, लोन, टैक्स | Foundura",
      description:
        "भारत में स्टार्टअप योजनाएँ एक सूची में: DPIIT मान्यता, सीड फ़ंड, अनुदान, लोन, टैक्स छूट और राज्य नीतियाँ, हर एक के आधिकारिक स्रोत के लिंक के साथ।",
      excerpt:
        "Foundura पर स्टार्टअप के लिए केंद्र और राज्य की हर सरकारी योजना: क्या मिलता है, कौन योग्य है, अभी खुली है या नहीं, और आधिकारिक स्रोत का लिंक। मान्यता, अनुदान, लोन, टैक्स लाभ, IP शुल्क छूट और राज्य नीतियाँ।",
      keywords: [
        "भारत में स्टार्टअप योजनाएँ",
        "स्टार्टअप के लिए सरकारी योजनाएँ",
        "स्टार्टअप इंडिया सीड फ़ंड योजना",
        "DPIIT स्टार्टअप मान्यता",
        "धारा 80-IAC टैक्स छूट",
        "स्टार्टअप क्रेडिट गारंटी योजना",
        "BIRAC BIG अनुदान",
        "NIDHI-PRAYAS",
        "स्टार्टअप अनुदान",
        "स्टार्टअप लोन",
        "स्टार्टअप फ़ंड ऑफ़ फ़ंड्स",
        "राज्य स्टार्टअप नीति",
        "कर्नाटक स्टार्टअप नीति",
        "GeM स्टार्टअप रनवे",
        "स्टार्टअप IP लाभ",
      ],
    },
  },
  medtech: {
    en: {
      slug: "/sectors/medtech",
      focus: "medtech startups in India",
      title: "Medtech startups in India: CDSCO and funding | Foundura",
      description:
        "For medtech startups in India: which CDSCO licence your device needs, the forms, grants for clinical studies and R&D, and the investors and events to know.",
      excerpt:
        "For medical device and diagnostics founders in India: how to classify your device and which CDSCO licence you need, the forms and who decides, the grants and incentives for clinical studies and R&D, and the investors and events that focus on medtech.",
      keywords: [
        "medtech startups in India",
        "medical device startup India",
        "CDSCO medical device licence",
        "Medical Devices Rules 2017",
        "medical device classification India",
        "CDSCO MD forms",
        "BIRAC BIG medtech",
        "PRIP scheme",
        "MAHA MedTech Mission",
        "PLI scheme medical devices",
        "SMDI clinical studies support",
        "medtech grants India",
        "medtech investors India",
        "medical device regulatory pathway",
        "diagnostics startup India",
      ],
    },
    hi: {
      slug: "/sectors/medtech",
      focus: "मेडटेक स्टार्टअप",
      title: "मेडटेक स्टार्टअप गाइड: CDSCO लाइसेंस और फ़ंडिंग | Foundura",
      description:
        "मेडटेक स्टार्टअप के लिए गाइड: आपके उपकरण को कौन-सा CDSCO लाइसेंस चाहिए, फ़ॉर्म, क्लिनिकल स्टडी और R&D के लिए अनुदान, और ज़रूरी निवेशक और कार्यक्रम।",
      excerpt:
        "भारत में मेडिकल डिवाइस और डायग्नोस्टिक्स संस्थापकों के लिए: उपकरण का वर्गीकरण और ज़रूरी CDSCO लाइसेंस, फ़ॉर्म और फ़ैसला कौन करता है, क्लिनिकल स्टडी और R&D के लिए अनुदान, और मेडटेक पर ध्यान देने वाले निवेशक और कार्यक्रम।",
      keywords: [
        "मेडटेक स्टार्टअप",
        "मेडिकल डिवाइस स्टार्टअप",
        "CDSCO मेडिकल डिवाइस लाइसेंस",
        "मेडिकल डिवाइस नियम 2017",
        "मेडिकल डिवाइस वर्गीकरण",
        "CDSCO MD फ़ॉर्म",
        "BIRAC BIG मेडटेक",
        "PRIP योजना",
        "MAHA मेडटेक मिशन",
        "मेडिकल डिवाइस PLI योजना",
        "SMDI क्लिनिकल स्टडी सहायता",
        "मेडटेक अनुदान",
        "मेडटेक निवेशक",
        "मेडिकल डिवाइस नियामक प्रक्रिया",
        "डायग्नोस्टिक्स स्टार्टअप",
      ],
    },
  },
  startups: {
    en: {
      slug: "/startups",
      focus: "Indian startups",
      title: "Indian startups to discover, by sector and stage | Foundura",
      description:
        "Discover Indian startups by sector, stage and state: what they make, where they're based, and whether they want customers, partners, pilots or investors.",
      excerpt:
        "A showcase of Indian startups listed by their founders: what each one makes, its sector, stage and state, and what it's looking for, from first customers and pilots to partners and investors. Listing is free; financial details are never shown.",
      keywords: [
        "Indian startups",
        "startup showcase India",
        "new startups in India",
        "startup directory India",
        "early-stage startups India",
        "startups by sector",
        "medtech startups India",
        "fintech startups India",
        "agritech startups India",
        "edtech startups India",
        "startups looking for investors",
        "startups looking for pilots",
        "list your startup free",
        "startup products India",
        "Foundura startups",
      ],
    },
    hi: {
      slug: "/startups",
      focus: "भारतीय स्टार्टअप",
      title: "भारतीय स्टार्टअप: क्षेत्र और चरण के अनुसार खोजें | Foundura",
      description:
        "भारतीय स्टार्टअप खोजें, क्षेत्र, चरण और राज्य के अनुसार: वे क्या बनाते हैं, कहाँ हैं, और उन्हें ग्राहक, पार्टनर, पायलट या निवेशक में से क्या चाहिए।",
      excerpt:
        "संस्थापकों द्वारा जोड़े गए भारतीय स्टार्टअप: हर एक क्या बनाता है, उसका क्षेत्र, चरण और राज्य, और उसे क्या चाहिए, पहले ग्राहक और पायलट से लेकर पार्टनर और निवेशक तक। लिस्टिंग मुफ़्त है; वित्तीय जानकारी कभी नहीं दिखाई जाती।",
      keywords: [
        "भारतीय स्टार्टअप",
        "स्टार्टअप शोकेस",
        "भारत के नए स्टार्टअप",
        "स्टार्टअप सूची",
        "शुरुआती चरण के स्टार्टअप",
        "क्षेत्र के अनुसार स्टार्टअप",
        "मेडटेक स्टार्टअप",
        "फ़िनटेक स्टार्टअप",
        "एग्रीटेक स्टार्टअप",
        "एडटेक स्टार्टअप",
        "निवेशक खोज रहे स्टार्टअप",
        "पायलट खोज रहे स्टार्टअप",
        "अपना स्टार्टअप मुफ़्त जोड़ें",
        "स्टार्टअप उत्पाद",
        "Foundura स्टार्टअप",
      ],
    },
  },
  investors: {
    en: {
      slug: "/investors",
      focus: "angel investors in India",
      title: "Angel investors in India and VC funds | Foundura",
      description:
        "Angel investors in India, networks and VC funds, with the sectors, stages and cheque sizes they back. Founders get matched and can request an intro, free.",
      excerpt:
        "Angels, angel networks and funds that invest in Indian startups, with the sectors, stages, states and cheque sizes each one backs. Founders with a complete profile are matched and can request an intro; emails are shared only when an investor accepts.",
      keywords: [
        "angel investors in India",
        "VC funds India",
        "angel networks India",
        "seed investors India",
        "pre-seed funding India",
        "startup investors list",
        "find investors for startup",
        "investor intro",
        "venture capital India",
        "early-stage investors",
        "medtech investors India",
        "deep tech investors India",
        "cheque size",
        "how to raise seed funding",
        "investor matching",
      ],
    },
    hi: {
      slug: "/investors",
      focus: "भारत में एंजल निवेशक",
      title: "भारत में एंजल निवेशक और VC फ़ंड | Foundura",
      description:
        "भारत में एंजल निवेशक, नेटवर्क और VC फ़ंड, उनके क्षेत्र, चरण और निवेश राशि के साथ। संस्थापकों का मिलान होता है और वे मुफ़्त में परिचय माँग सकते हैं।",
      excerpt:
        "भारतीय स्टार्टअप में निवेश करने वाले एंजल, एंजल नेटवर्क और फ़ंड, हर एक के क्षेत्र, चरण, राज्य और निवेश राशि के साथ। पूरी प्रोफ़ाइल वाले संस्थापकों का मिलान होता है; ईमेल तभी साझा होते हैं जब निवेशक स्वीकार करें।",
      keywords: [
        "भारत में एंजल निवेशक",
        "VC फ़ंड",
        "एंजल नेटवर्क",
        "सीड निवेशक",
        "प्री-सीड फ़ंडिंग",
        "स्टार्टअप निवेशक सूची",
        "स्टार्टअप के लिए निवेशक कैसे खोजें",
        "निवेशक से परिचय",
        "वेंचर कैपिटल",
        "शुरुआती चरण के निवेशक",
        "मेडटेक निवेशक",
        "डीप टेक निवेशक",
        "निवेश राशि",
        "सीड फ़ंडिंग कैसे जुटाएँ",
        "निवेशक मिलान",
      ],
    },
  },
  events: {
    en: {
      slug: "/events",
      focus: "startup events in India",
      title: "Startup events in India and worldwide | Foundura",
      description:
        "Startup events in India and worldwide: expos, summits, pitch days and application deadlines in a calendar, updated daily. Add any event to your calendar.",
      excerpt:
        "A calendar of startup events in India and around the world: expos, summits, conferences, pitch days and application deadlines, filtered by region and format. Updated daily from organisers' own listings, and every event can be added to Google, Outlook or Apple Calendar.",
      keywords: [
        "startup events in India",
        "startup events calendar",
        "startup conferences India",
        "startup expo India",
        "startup summit",
        "pitch competition India",
        "startup events Bengaluru",
        "startup events Delhi",
        "startup events Mumbai",
        "global startup events",
        "tech conferences",
        "medtech conferences",
        "accelerator application deadlines",
        "Startup Mahakumbh",
        "TiEcon",
      ],
    },
    hi: {
      slug: "/events",
      focus: "भारत में स्टार्टअप कार्यक्रम",
      title: "भारत में स्टार्टअप कार्यक्रम और वैश्विक आयोजन | Foundura",
      description:
        "भारत में स्टार्टअप कार्यक्रम और दुनिया भर के आयोजन: एक्सपो, समिट, पिच डे और आवेदन की तारीख़ें, रोज़ अपडेट। कोई भी कार्यक्रम कैलेंडर में जोड़ें।",
      excerpt:
        "भारत और दुनिया भर के स्टार्टअप कार्यक्रमों का कैलेंडर: एक्सपो, समिट, सम्मेलन, पिच डे और आवेदन की आख़िरी तारीख़ें, क्षेत्र और तरीक़े के फ़िल्टर के साथ। आयोजकों की अपनी सूचियों से रोज़ अपडेट।",
      keywords: [
        "भारत में स्टार्टअप कार्यक्रम",
        "स्टार्टअप इवेंट कैलेंडर",
        "स्टार्टअप सम्मेलन",
        "स्टार्टअप एक्सपो",
        "स्टार्टअप समिट",
        "पिच प्रतियोगिता",
        "बेंगलुरु स्टार्टअप कार्यक्रम",
        "दिल्ली स्टार्टअप कार्यक्रम",
        "मुंबई स्टार्टअप कार्यक्रम",
        "दुनिया भर के स्टार्टअप कार्यक्रम",
        "टेक सम्मेलन",
        "मेडटेक सम्मेलन",
        "एक्सेलरेटर आवेदन की तारीख़",
        "स्टार्टअप महाकुंभ",
        "TiEcon",
      ],
    },
  },
  policy: {
    en: {
      slug: "/policy",
      focus: "startup policy news",
      title: "Startup policy news for Indian founders | Foundura",
      description:
        "Startup policy news for Indian founders: changes from DPIIT, ministries, regulators and states, each with a plain-language takeaway on what it means for you.",
      excerpt:
        "Government policy changes that affect Indian startups, from DPIIT, ministries, regulators and state governments, each summarised with a plain-language takeaway on what it means for founders and a link to the official notice.",
      keywords: [
        "startup policy news",
        "startup policy India",
        "DPIIT notification",
        "Startup India news",
        "government policy for startups",
        "startup rules 2026",
        "state startup policy news",
        "MCA rules for startups",
        "startup tax news",
        "angel tax",
        "SEBI AIF rules",
        "RBI rules for startups",
        "new startup schemes",
        "startup policy updates",
        "policy news for founders",
      ],
    },
    hi: {
      slug: "/policy",
      focus: "स्टार्टअप नीति समाचार",
      title: "स्टार्टअप नीति समाचार, भारतीय संस्थापकों के लिए | Foundura",
      description:
        "स्टार्टअप नीति समाचार: DPIIT, मंत्रालयों, नियामकों और राज्यों के बदलाव, हर एक के साथ आसान भाषा में बताया गया कि संस्थापकों के लिए इसका क्या मतलब है।",
      excerpt:
        "भारतीय स्टार्टअप पर असर डालने वाले सरकारी नीति बदलाव, DPIIT, मंत्रालयों, नियामकों और राज्य सरकारों से, हर एक का आसान सार कि संस्थापकों के लिए इसका क्या मतलब है, और आधिकारिक सूचना का लिंक।",
      keywords: [
        "स्टार्टअप नीति समाचार",
        "भारत की स्टार्टअप नीति",
        "DPIIT अधिसूचना",
        "स्टार्टअप इंडिया समाचार",
        "स्टार्टअप के लिए सरकारी नीति",
        "स्टार्टअप नियम 2026",
        "राज्य स्टार्टअप नीति समाचार",
        "स्टार्टअप के लिए MCA नियम",
        "स्टार्टअप टैक्स समाचार",
        "एंजल टैक्स",
        "SEBI AIF नियम",
        "स्टार्टअप के लिए RBI नियम",
        "नई स्टार्टअप योजनाएँ",
        "स्टार्टअप नीति अपडेट",
        "संस्थापकों के लिए नीति समाचार",
      ],
    },
  },
  learn: {
    en: {
      slug: "/learn",
      focus: "startup guides",
      title: "Startup guides for Indian founders | Foundura",
      description:
        "Practical startup guides for Indian founders, from finding an idea to registering, funding and growth. Grouped by topic, with a map from idea to market.",
      excerpt:
        "Practical guides for Indian founders on every stage from idea to market: validating an idea, registering the company, building, raising money and growing. Grouped by topic, with an eight-stage map linking the templates and schemes that help at each step.",
      keywords: [
        "startup guides",
        "how to start a startup in India",
        "startup idea validation",
        "how to register a startup in India",
        "DPIIT recognition guide",
        "how to raise funding",
        "go-to-market strategy",
        "startup growth tips",
        "founder advice India",
        "first-time founder",
        "startup journey",
        "idea to market",
        "product-market fit",
        "startup fundraising guide",
        "Startup India guide",
      ],
    },
    hi: {
      slug: "/learn",
      focus: "स्टार्टअप गाइड",
      title: "स्टार्टअप गाइड, आइडिया से बाज़ार तक | Foundura",
      description:
        "भारतीय संस्थापकों के लिए व्यावहारिक स्टार्टअप गाइड, आइडिया खोजने से रजिस्ट्रेशन, फ़ंडिंग और ग्रोथ तक। विषय के हिसाब से, और आइडिया से बाज़ार तक का नक्शा।",
      excerpt:
        "आइडिया से बाज़ार तक हर चरण पर भारतीय संस्थापकों के लिए व्यावहारिक गाइड: आइडिया परखना, कंपनी रजिस्टर करना, निर्माण, पैसा जुटाना और बढ़ना। विषय के हिसाब से, और हर चरण के टेम्पलेट और योजनाओं से जुड़ा आठ चरणों का नक्शा।",
      keywords: [
        "स्टार्टअप गाइड",
        "भारत में स्टार्टअप कैसे शुरू करें",
        "स्टार्टअप आइडिया की पुष्टि",
        "स्टार्टअप रजिस्ट्रेशन कैसे करें",
        "DPIIT मान्यता गाइड",
        "फ़ंडिंग कैसे जुटाएँ",
        "गो-टू-मार्केट रणनीति",
        "स्टार्टअप ग्रोथ टिप्स",
        "संस्थापकों के लिए सलाह",
        "पहली बार संस्थापक",
        "स्टार्टअप का सफ़र",
        "आइडिया से बाज़ार तक",
        "प्रोडक्ट-मार्केट फ़िट",
        "स्टार्टअप फ़ंडरेज़िंग गाइड",
        "स्टार्टअप इंडिया गाइड",
      ],
    },
  },
  documents: {
    en: {
      slug: "/documents",
      focus: "startup templates",
      title: "Startup templates for India, free download | Foundura",
      description:
        "Free startup templates written for India: pitch deck, financial model, cap table, founders' agreement, NDA, offer letter and more, each with a short guide.",
      excerpt:
        "Free Word, Excel and PowerPoint templates written for Indian startups, from the first pitch to the first hire: pitch deck, financial model, cap table, founders' agreement, NDA, term sheet, offer letter and more, each with a short guide to the points specific to India.",
      keywords: [
        "startup templates",
        "pitch deck template",
        "financial model template",
        "cap table template",
        "founders agreement template India",
        "NDA template India",
        "term sheet template",
        "offer letter template India",
        "ESOP policy template",
        "business plan template",
        "DPR template",
        "data room checklist",
        "shareholders agreement India",
        "privacy policy template India",
        "free startup documents",
      ],
    },
    hi: {
      slug: "/documents",
      focus: "स्टार्टअप टेम्पलेट",
      title: "भारत के लिए स्टार्टअप टेम्पलेट, मुफ़्त डाउनलोड | Foundura",
      description:
        "भारत के लिए लिखे मुफ़्त स्टार्टअप टेम्पलेट: पिच डेक, फ़ाइनेंशियल मॉडल, कैप टेबल, संस्थापकों का समझौता, NDA, ऑफ़र लेटर और बहुत कुछ, हर एक के साथ छोटी गाइड।",
      excerpt:
        "भारतीय स्टार्टअप के लिए लिखे मुफ़्त Word, Excel और PowerPoint टेम्पलेट, पहली पिच से पहली भर्ती तक: पिच डेक, फ़ाइनेंशियल मॉडल, कैप टेबल, संस्थापकों का समझौता, NDA, टर्म शीट, ऑफ़र लेटर और बहुत कुछ, हर एक के साथ छोटी गाइड।",
      keywords: [
        "स्टार्टअप टेम्पलेट",
        "पिच डेक टेम्पलेट",
        "फ़ाइनेंशियल मॉडल टेम्पलेट",
        "कैप टेबल टेम्पलेट",
        "संस्थापकों का समझौता",
        "NDA टेम्पलेट",
        "टर्म शीट टेम्पलेट",
        "ऑफ़र लेटर टेम्पलेट",
        "ESOP नीति",
        "बिज़नेस प्लान टेम्पलेट",
        "DPR टेम्पलेट",
        "डेटा रूम चेकलिस्ट",
        "शेयरधारक समझौता",
        "प्राइवेसी पॉलिसी टेम्पलेट",
        "मुफ़्त स्टार्टअप दस्तावेज़",
      ],
    },
  },
  basics: {
    en: {
      slug: "/basics",
      focus: "startup funding basics",
      title: "Startup funding basics: a free course | Foundura",
      description:
        "Startup funding basics for Indian founders: stages, funding rounds, equity, debt, grants, how VCs work, valuation, term sheets and Indian rules, in plain words.",
      excerpt:
        "A free eleven-chapter course on startup money for Indian founders: the stages of a startup, funding rounds from bootstrapping to IPO, equity, debt and grants, how venture capital works, valuation and dilution, term sheets and the Indian rules, with a dilution calculator.",
      keywords: [
        "startup funding basics",
        "startup funding course",
        "funding stages explained",
        "equity vs debt",
        "startup grants explained",
        "how venture capital works",
        "pre-money post-money valuation",
        "dilution calculator",
        "term sheet explained",
        "angel tax abolished",
        "convertible note rules India",
        "financial literacy for founders",
        "startup finance India",
        "Series A explained",
        "Foundura",
      ],
    },
    hi: {
      slug: "/basics",
      focus: "फ़ंडिंग की बुनियादी बातें",
      title: "फ़ंडिंग की बुनियादी बातें: स्टार्टअप कोर्स | Foundura",
      description:
        "भारतीय संस्थापकों के लिए फ़ंडिंग की बुनियादी बातें: चरण, फ़ंडिंग राउंड, इक्विटी, कर्ज़, ग्रांट, वेंचर कैपिटल, वैल्यूएशन, टर्म शीट, भारत के नियम, आसान भाषा में।",
      excerpt:
        "भारतीय संस्थापकों के लिए स्टार्टअप के पैसे पर ग्यारह अध्याय का मुफ़्त कोर्स: स्टार्टअप के चरण, बूटस्ट्रैपिंग से IPO तक के राउंड, इक्विटी, कर्ज़ और ग्रांट, वेंचर कैपिटल, वैल्यूएशन और डाइल्यूशन, टर्म शीट और भारत के नियम, डाइल्यूशन कैलकुलेटर के साथ।",
      keywords: [
        "फ़ंडिंग की बुनियादी बातें",
        "स्टार्टअप फ़ंडिंग कोर्स",
        "फ़ंडिंग के चरण",
        "इक्विटी बनाम कर्ज़",
        "स्टार्टअप ग्रांट",
        "वेंचर कैपिटल कैसे काम करता है",
        "प्री-मनी पोस्ट-मनी वैल्यूएशन",
        "डाइल्यूशन कैलकुलेटर",
        "टर्म शीट",
        "एंजेल टैक्स ख़त्म",
        "कन्वर्टिबल नोट के नियम",
        "संस्थापकों के लिए वित्तीय साक्षरता",
        "स्टार्टअप फ़ाइनेंस",
        "सीरीज़ A",
        "Foundura",
      ],
    },
  },
  funding: {
    en: {
      slug: "/funding",
      focus: "startup funding in India",
      title: "Startup funding in India: investors and grants | Foundura",
      description:
        "Startup funding in India by state: venture funds, angel networks, venture debt, government grants and accelerators, with what each offers and when to apply.",
      excerpt:
        "A directory of the money open to Indian startups: more than a hundred venture funds, angel networks, government funds, grants, state schemes and accelerators, sorted by state and region, with what each offers and whether it is open now.",
      keywords: [
        "startup funding in India",
        "startup funding by state",
        "venture capital firms India",
        "angel networks India",
        "government grants for startups",
        "state startup schemes",
        "seed funding India",
        "venture debt India",
        "startup accelerators",
        "Startup India Fund of Funds",
        "Karnataka ELEVATE",
        "TANSEED",
        "Kerala Startup Mission grants",
        "startup grants abroad",
        "Foundura",
      ],
    },
    hi: {
      slug: "/funding",
      focus: "स्टार्टअप फ़ंडिंग",
      title: "स्टार्टअप फ़ंडिंग: निवेशक, ग्रांट और योजनाएँ | Foundura",
      description:
        "भारत में स्टार्टअप फ़ंडिंग, राज्य के हिसाब से: वेंचर फ़ंड, एंजेल नेटवर्क, वेंचर डेट, सरकारी ग्रांट और एक्सेलरेटर, हर एक क्या देता है और कब आवेदन करें।",
      excerpt:
        "भारतीय स्टार्टअप के लिए खुले पैसे की डायरेक्टरी: सौ से ज़्यादा वेंचर फ़ंड, एंजेल नेटवर्क, सरकारी फ़ंड, ग्रांट, राज्य योजनाएँ और एक्सेलरेटर, राज्य और क्षेत्र के हिसाब से, हर एक क्या देता है और अभी खुला है या नहीं।",
      keywords: [
        "स्टार्टअप फ़ंडिंग",
        "राज्य के हिसाब से स्टार्टअप फ़ंडिंग",
        "वेंचर कैपिटल फ़र्म",
        "एंजेल नेटवर्क",
        "स्टार्टअप के लिए सरकारी ग्रांट",
        "राज्य स्टार्टअप योजनाएँ",
        "सीड फ़ंडिंग",
        "वेंचर डेट",
        "स्टार्टअप एक्सेलरेटर",
        "Startup India Fund of Funds",
        "कर्नाटक ELEVATE",
        "TANSEED",
        "केरल स्टार्टअप मिशन ग्रांट",
        "विदेश में स्टार्टअप ग्रांट",
        "Foundura",
      ],
    },
  },
  glossary: {
    en: {
      slug: "/glossary",
      focus: "startup glossary",
      title: "Startup glossary: funding and legal terms | Foundura",
      description:
        "A startup glossary in plain language: the funding, legal and finance terms Indian founders meet, from ESOP, SAFE and cap table to term sheet and DPIIT.",
      excerpt:
        "Plain-language meanings of the startup terms Indian founders meet when raising money, signing agreements and reading the numbers: ESOP, vesting, cap table, dilution, SAFE, term sheet, liquidation preference, runway, unit economics, DPIIT recognition and more, in English and Hindi.",
      keywords: [
        "startup glossary",
        "startup terms",
        "funding terms explained",
        "ESOP meaning",
        "vesting cliff",
        "cap table meaning",
        "dilution meaning",
        "SAFE note",
        "iSAFE India",
        "term sheet meaning",
        "liquidation preference",
        "pre-money post-money valuation",
        "burn rate and runway",
        "unit economics",
        "startup jargon",
      ],
    },
    hi: {
      slug: "/glossary",
      focus: "स्टार्टअप शब्दावली",
      title: "स्टार्टअप शब्दावली: फ़ंडिंग और क़ानूनी शब्द | Foundura",
      description:
        "आसान भाषा में स्टार्टअप शब्दावली: फ़ंडिंग, क़ानूनी और वित्त के वे शब्द जो भारतीय संस्थापकों के सामने आते हैं, ESOP, SAFE और कैप टेबल से टर्म शीट और DPIIT तक।",
      excerpt:
        "पैसा जुटाते, समझौते करते और आँकड़े पढ़ते समय संस्थापकों के सामने आने वाले स्टार्टअप शब्दों के आसान अर्थ: ESOP, वेस्टिंग, कैप टेबल, डाइल्यूशन, SAFE, टर्म शीट, लिक्विडेशन प्रेफ़रेंस, रनवे, यूनिट इकोनॉमिक्स, DPIIT मान्यता और बहुत कुछ।",
      keywords: [
        "स्टार्टअप शब्दावली",
        "स्टार्टअप शब्द",
        "फ़ंडिंग शब्दों के अर्थ",
        "ESOP का मतलब",
        "वेस्टिंग क्लिफ़",
        "कैप टेबल का मतलब",
        "डाइल्यूशन का मतलब",
        "SAFE नोट",
        "iSAFE",
        "टर्म शीट का मतलब",
        "लिक्विडेशन प्रेफ़रेंस",
        "प्री-मनी पोस्ट-मनी वैल्यूएशन",
        "बर्न रेट और रनवे",
        "यूनिट इकोनॉमिक्स",
        "स्टार्टअप की भाषा",
      ],
    },
  },
  partners: {
    en: {
      slug: "/partners",
      focus: "scheme eligibility widget",
      title: "Scheme eligibility widget for your website | Foundura",
      description:
        "A free scheme eligibility widget: incubators, accelerators and associations can add Foundura's Scheme Scan to their own website with one line of code.",
      excerpt:
        "Incubators, accelerators, chambers and founder associations can embed Foundura's free Scheme Scan on their own website with one line of code. Founders check scheme eligibility without leaving the partner's site, in English or Hindi, and nothing they enter is stored.",
      keywords: [
        "scheme eligibility widget",
        "embed scheme checker",
        "incubator website tools",
        "accelerator tools",
        "startup support widget",
        "government scheme widget",
        "free embeddable widget",
        "startup association tools",
        "chamber of commerce startups",
        "incubator resources India",
        "scheme finder for incubators",
        "Hindi startup tools",
        "startup ecosystem partners",
        "embed code",
        "Foundura partners",
      ],
    },
    hi: {
      slug: "/partners",
      focus: "योजना पात्रता विजेट",
      title: "आपकी वेबसाइट के लिए योजना पात्रता विजेट | Foundura",
      description:
        "मुफ़्त योजना पात्रता विजेट: इनक्यूबेटर, एक्सेलरेटर और संगठन Foundura की योजना जाँच को कोड की एक पंक्ति से अपनी वेबसाइट पर जोड़ सकते हैं।",
      excerpt:
        "इनक्यूबेटर, एक्सेलरेटर, चैंबर और संस्थापक संगठन Foundura की मुफ़्त योजना जाँच को कोड की एक पंक्ति से अपनी वेबसाइट पर लगा सकते हैं। संस्थापक पार्टनर की साइट छोड़े बिना, हिंदी या अंग्रेज़ी में, पात्रता जाँचते हैं, और कुछ सेव नहीं होता।",
      keywords: [
        "योजना पात्रता विजेट",
        "योजना जाँच वेबसाइट पर लगाएँ",
        "इनक्यूबेटर वेबसाइट टूल",
        "एक्सेलरेटर टूल",
        "स्टार्टअप सहायता विजेट",
        "सरकारी योजना विजेट",
        "मुफ़्त विजेट",
        "स्टार्टअप संगठन टूल",
        "चैंबर ऑफ़ कॉमर्स स्टार्टअप",
        "इनक्यूबेटर संसाधन",
        "इनक्यूबेटर के लिए योजना खोज",
        "हिंदी स्टार्टअप टूल",
        "स्टार्टअप इकोसिस्टम पार्टनर",
        "एम्बेड कोड",
        "Foundura पार्टनर",
      ],
    },
  },
  about: {
    en: {
      slug: "/about",
      focus: "about Foundura",
      title: "About Foundura: free help for Indian startups | Foundura",
      description: "About Foundura: a free website that helps Indian founders find government schemes, funding and investors, with templates and guides. It never handles money.",
      excerpt: "Foundura is a free website for Indian founders: a scheme eligibility check, a funding directory, document templates, events and investor introductions. It never handles money, links every scheme to its official source and keeps your data yours.",
      keywords: ["about Foundura", "Foundura", "free startup help India", "startup platform India", "government schemes for startups", "startup funding India", "startup document templates", "DPIIT recognition", "Indian founders", "startup support website", "scheme eligibility check", "startup events India", "investor introductions", "startup data privacy", "who runs Foundura"],
    },
    hi: {
      slug: "/about",
      focus: "Foundura के बारे में",
      title: "Foundura के बारे में: स्टार्टअप के लिए मुफ़्त मदद | Foundura",
      description: "Foundura के बारे में: एक मुफ़्त वेबसाइट जो भारतीय संस्थापकों को सरकारी योजनाएँ, फ़ंडिंग और निवेशक खोजने में मदद करती है। यह कभी पैसों का लेन-देन नहीं करती।",
      excerpt: "Foundura भारतीय संस्थापकों के लिए एक मुफ़्त वेबसाइट है: योजना जाँच, फ़ंडिंग डायरेक्टरी, दस्तावेज़ टेम्पलेट, कार्यक्रम और निवेशकों से परिचय। यह कभी पैसों का लेन-देन नहीं करती, हर योजना को उसके आधिकारिक स्रोत से जोड़ती है और आपका डेटा आपका रहता है।",
      keywords: ["Foundura के बारे में", "Foundura", "स्टार्टअप के लिए मुफ़्त मदद", "भारतीय स्टार्टअप प्लेटफ़ॉर्म", "स्टार्टअप के लिए सरकारी योजनाएँ", "स्टार्टअप फ़ंडिंग", "स्टार्टअप दस्तावेज़ टेम्पलेट", "DPIIT मान्यता", "भारतीय संस्थापक", "स्टार्टअप सहायता वेबसाइट", "योजना जाँच", "स्टार्टअप कार्यक्रम", "निवेशकों से परिचय", "स्टार्टअप डेटा की गोपनीयता", "Foundura कौन चलाता है"],
    },
  },
  contact: {
    en: {
      slug: "/contact",
      focus: "contact Foundura",
      title: "Contact Foundura: corrections, help and privacy | Foundura",
      description: "Contact Foundura by email to report a scheme change, get help with your startup profile, ask about your data or partner with us. We never ask for money.",
      excerpt: "Write to Foundura by email to report something out of date, get help with the site, ask about your data or partner with us. The page also lists our grievance officer and how to spot anyone misusing our name.",
      keywords: ["contact Foundura", "Foundura support", "Foundura email", "report a scheme change", "startup help India", "grievance officer", "data privacy request", "delete my data", "partner with Foundura", "list a startup event", "Scheme Scan widget", "scheme scam warning", "startup support contact", "Foundura help", "Foundura"],
    },
    hi: {
      slug: "/contact",
      focus: "Foundura से संपर्क",
      title: "Foundura से संपर्क: सुधार, मदद और गोपनीयता | Foundura",
      description: "Foundura से संपर्क ईमेल से करें: योजना में बदलाव बताएँ, स्टार्टअप प्रोफ़ाइल में मदद लें, अपने डेटा के बारे में पूछें या साझेदारी करें। हम पैसे नहीं माँगते।",
      excerpt: "पुरानी जानकारी बताने, साइट पर मदद लेने, अपने डेटा के बारे में पूछने या साझेदारी के लिए Foundura को ईमेल करें। इस पेज पर शिकायत अधिकारी की जानकारी और हमारे नाम का ग़लत इस्तेमाल पहचानने का तरीक़ा भी है।",
      keywords: ["Foundura से संपर्क", "Foundura सहायता", "Foundura ईमेल", "योजना में बदलाव बताएँ", "स्टार्टअप मदद", "शिकायत अधिकारी", "डेटा गोपनीयता अनुरोध", "मेरा डेटा मिटाएँ", "Foundura के साथ साझेदारी", "स्टार्टअप कार्यक्रम जोड़ें", "योजना जाँच विजेट", "योजना धोखाधड़ी से सावधान", "स्टार्टअप सहायता संपर्क", "Foundura मदद", "Foundura"],
    },
  },
  states: {
    en: {
      slug: "/states",
      focus: "startup support by state",
      title: "Startup support by state: schemes and incubators | Foundura",
      description: "Startup support by state in India: each state's startup schemes, funding, incubators and startups, with how DPIIT's latest ranking rated its support.",
      excerpt: "A page for every Indian state and union territory: its startup schemes, funding programmes, incubators and startups on Foundura, and its result in DPIIT's States' Startup Ranking.",
      keywords: ["startup support by state", "state startup policy India", "startup schemes by state", "state startup ranking", "DPIIT states startup ranking", "incubators in India", "startup incubators by state", "state startup missions", "Karnataka startups", "Gujarat startups", "Kerala Startup Mission", "T-Hub", "startup hubs India", "Startup India", "Foundura"],
    },
    hi: {
      slug: "/states",
      focus: "राज्यवार स्टार्टअप सहायता",
      title: "राज्यवार स्टार्टअप सहायता: योजनाएँ और इनक्यूबेटर | Foundura",
      description: "भारत में राज्यवार स्टार्टअप सहायता: हर राज्य की स्टार्टअप योजनाएँ, फ़ंडिंग, इनक्यूबेटर और स्टार्टअप, और DPIIT की ताज़ा रैंकिंग में उसका स्थान।",
      excerpt: "भारत के हर राज्य और केंद्र शासित प्रदेश का पेज: उसकी स्टार्टअप योजनाएँ, फ़ंडिंग कार्यक्रम, इनक्यूबेटर और Foundura पर उसके स्टार्टअप, और DPIIT की राज्य स्टार्टअप रैंकिंग में उसका नतीजा।",
      keywords: ["राज्यवार स्टार्टअप सहायता", "राज्य स्टार्टअप नीति", "राज्यवार स्टार्टअप योजनाएँ", "राज्य स्टार्टअप रैंकिंग", "DPIIT राज्य स्टार्टअप रैंकिंग", "भारत में इनक्यूबेटर", "राज्यवार स्टार्टअप इनक्यूबेटर", "राज्य स्टार्टअप मिशन", "कर्नाटक के स्टार्टअप", "गुजरात के स्टार्टअप", "केरल स्टार्टअप मिशन", "T-Hub", "स्टार्टअप हब", "Startup India", "Foundura"],
    },
  },
  perks: {
    en: {
      slug: "/perks",
      focus: "startup perks",
      title: "Startup perks: free credits and DPIIT benefits | Foundura",
      description: "Startup perks for Indian founders: free cloud and AI credits, software discounts and the tax and fee benefits DPIIT recognition unlocks, with official links.",
      excerpt: "Free credits, software discounts and government benefits that startups in India can claim, from AWS, Google and Microsoft to the patent fee rebates and tax holiday that come with DPIIT recognition. Official links only; no deals and no tracking.",
      keywords: ["startup perks", "startup credits India", "free cloud credits for startups", "AWS Activate", "Google for Startups Cloud Program", "Microsoft for Startups", "NVIDIA Inception", "DPIIT recognition benefits", "Section 80-IAC tax holiday", "patent fee rebate for startups", "startup discounts", "Zoho for Startups", "software for startups", "Startup India benefits", "Foundura"],
    },
    hi: {
      slug: "/perks",
      focus: "स्टार्टअप के लिए फ़ायदे",
      title: "स्टार्टअप के लिए फ़ायदे: मुफ़्त क्रेडिट और छूट | Foundura",
      description: "स्टार्टअप के लिए फ़ायदे: मुफ़्त क्लाउड और AI क्रेडिट, सॉफ़्टवेयर पर छूट, और DPIIT मान्यता से मिलने वाले कर और फ़ीस लाभ, आधिकारिक लिंक के साथ।",
      excerpt: "मुफ़्त क्रेडिट, सॉफ़्टवेयर पर छूट और सरकारी लाभ जो भारत के स्टार्टअप ले सकते हैं: AWS, Google और Microsoft से लेकर DPIIT मान्यता के साथ मिलने वाली पेटेंट फ़ीस छूट और कर छूट तक। सिर्फ़ आधिकारिक लिंक; कोई सौदा नहीं, कोई ट्रैकिंग नहीं।",
      keywords: ["स्टार्टअप के लिए फ़ायदे", "स्टार्टअप क्रेडिट", "मुफ़्त क्लाउड क्रेडिट", "AWS Activate", "Google for Startups Cloud Program", "Microsoft for Startups", "NVIDIA Inception", "DPIIT मान्यता के लाभ", "धारा 80-IAC कर छूट", "पेटेंट फ़ीस में छूट", "स्टार्टअप छूट", "Zoho for Startups", "स्टार्टअप के लिए सॉफ़्टवेयर", "Startup India लाभ", "Foundura"],
    },
  },
  investorUpdate: {
    en: {
      slug: "/investor-update",
      focus: "investor update",
      title: "Investor update builder for startup founders | Foundura",
      description: "Write your monthly investor update in minutes: add your news and numbers, get runway worked out, and copy a clean email. Free, private, nothing is stored.",
      excerpt: "A free form that turns this month's highlights, challenges, revenue, spending, cash and asks into a short investor update email, with runway worked out for you. It runs in your browser: nothing is saved or sent.",
      keywords: ["investor update", "monthly investor update", "investor update template", "investor update email", "startup investor update", "founder update", "runway calculator", "burn rate", "startup metrics", "investor relations for startups", "update to investors", "startup reporting", "angel investors", "venture capital", "Foundura"],
    },
    hi: {
      slug: "/investor-update",
      focus: "निवेशक अपडेट",
      title: "निवेशक अपडेट बनाएँ: संस्थापकों के लिए मुफ़्त टूल | Foundura",
      description: "कुछ ही मिनटों में हर महीने का निवेशक अपडेट लिखें: ख़बरें और आँकड़े भरें, रनवे का हिसाब पाएँ और साफ़ ईमेल कॉपी करें। मुफ़्त, निजी, कुछ भी सेव नहीं होता।",
      excerpt: "एक मुफ़्त फ़ॉर्म जो इस महीने की ख़ास बातें, चुनौतियाँ, आय, ख़र्च, नकदी और माँगें एक छोटे निवेशक अपडेट ईमेल में बदल देता है, रनवे के हिसाब के साथ। यह आपके ब्राउज़र में चलता है: कुछ भी सेव या भेजा नहीं जाता।",
      keywords: ["निवेशक अपडेट", "मासिक निवेशक अपडेट", "निवेशक अपडेट टेम्पलेट", "निवेशक अपडेट ईमेल", "स्टार्टअप निवेशक अपडेट", "संस्थापक अपडेट", "रनवे कैलकुलेटर", "बर्न रेट", "स्टार्टअप मेट्रिक्स", "निवेशक संबंध", "निवेशकों को अपडेट", "स्टार्टअप रिपोर्टिंग", "एंजेल निवेशक", "वेंचर कैपिटल", "Foundura"],
    },
  },
  software: {
    en: {
      slug: "/sectors/software",
      focus: "SaaS startup",
      title: "SaaS startup guide for India: tax, exports, data | Foundura",
      description: "A SaaS startup guide for India: registration, GST and zero-rated exports, foreign payments, TDS, the DPDP Act, key metrics and schemes to check.",
      excerpt: "Everything a software or SaaS founder in India needs in one place: company and DPIIT registration, owning your code, GST and exports under a LUT, foreign payments, TDS, data protection, contracts, selling to government, key metrics and schemes.",
      keywords: ["SaaS startup India", "software startup India", "SaaS GST", "export of services GST", "letter of undertaking", "foreign payments for SaaS", "SOFTEX form", "TDS on software", "DPDP Act for SaaS", "SaaS metrics", "MRR and churn", "DPIIT recognition", "software IP assignment", "selling software to government", "Foundura"],
    },
    hi: {
      slug: "/sectors/software",
      focus: "SaaS स्टार्टअप",
      title: "SaaS स्टार्टअप गाइड: टैक्स, निर्यात और डेटा | Foundura",
      description: "भारत में SaaS स्टार्टअप गाइड: रजिस्ट्रेशन, GST और ज़ीरो-रेटेड निर्यात, विदेशी भुगतान, TDS, DPDP अधिनियम, निवेशकों के पसंदीदा आँकड़े और जाँचने लायक़ योजनाएँ।",
      excerpt: "भारत के सॉफ़्टवेयर या SaaS संस्थापकों के लिए सब कुछ एक जगह: कंपनी और DPIIT रजिस्ट्रेशन, कोड का स्वामित्व, GST और LUT के साथ निर्यात, विदेशी भुगतान, TDS, डेटा सुरक्षा, अनुबंध, सरकार को बिक्री, अहम आँकड़े और योजनाएँ।",
      keywords: ["SaaS स्टार्टअप", "सॉफ़्टवेयर स्टार्टअप", "SaaS पर GST", "सेवाओं का निर्यात GST", "लेटर ऑफ़ अंडरटेकिंग", "विदेशी भुगतान", "SOFTEX फ़ॉर्म", "सॉफ़्टवेयर पर TDS", "DPDP अधिनियम", "SaaS मेट्रिक्स", "MRR और चर्न", "DPIIT मान्यता", "IP असाइनमेंट", "सरकार को सॉफ़्टवेयर बेचना", "Foundura"],
    },
  },
  data: {
    en: {
      slug: "/data",
      focus: "startup data India",
      title: "Startup data India: open lists to download | Foundura",
      description: "Startup data India: download Foundura's lists of government schemes, funders, incubators, perks, events and public startups as CSV or JSON, free under CC BY.",
      excerpt: "Free open data on Indian startup support: government schemes, the funding and support directories, perks, upcoming events and public startup profiles, as CSV for spreadsheets or JSON for code, under the CC BY 4.0 licence. Nothing personal is ever included.",
      keywords: ["startup data India", "open data startups", "government schemes dataset", "startup schemes CSV", "funding directory data", "incubators list India", "startup events data", "public startup profiles", "CC BY 4.0", "startup ecosystem data", "download startup list", "JSON API startups", "DPIIT schemes list", "Startup India data", "Foundura"],
    },
    hi: {
      slug: "/data",
      focus: "स्टार्टअप डेटा",
      title: "स्टार्टअप डेटा: डाउनलोड के लिए ओपन सूचियाँ | Foundura",
      description: "स्टार्टअप डेटा मुफ़्त: सरकारी योजनाओं, फ़ंड देने वालों, इनक्यूबेटर, फ़ायदों, कार्यक्रमों और सार्वजनिक स्टार्टअप की Foundura सूचियाँ CSV या JSON में।",
      excerpt: "भारतीय स्टार्टअप सहायता पर मुफ़्त ओपन डेटा: सरकारी योजनाएँ, फ़ंडिंग और सहायता डायरेक्टरी, फ़ायदे, आने वाले कार्यक्रम और सार्वजनिक स्टार्टअप प्रोफ़ाइल, स्प्रेडशीट के लिए CSV या कोड के लिए JSON में, CC BY 4.0 लाइसेंस पर। कोई निजी जानकारी कभी नहीं।",
      keywords: ["स्टार्टअप डेटा", "ओपन डेटा", "सरकारी योजनाओं का डेटा", "योजनाओं की CSV", "फ़ंडिंग डायरेक्टरी डेटा", "इनक्यूबेटर की सूची", "स्टार्टअप कार्यक्रम डेटा", "सार्वजनिक स्टार्टअप प्रोफ़ाइल", "CC BY 4.0", "स्टार्टअप इकोसिस्टम डेटा", "स्टार्टअप सूची डाउनलोड", "JSON डेटा", "DPIIT योजनाएँ", "Startup India डेटा", "Foundura"],
    },
  },
  numbers: {
    en: {
      slug: "/numbers",
      focus: "Indian startup statistics",
      title: "Indian startup statistics: Foundura in numbers | Foundura",
      description: "Indian startup statistics from Foundura: how many schemes, funders, incubators and events we list, startups by sector and state, and monthly usage totals.",
      excerpt: "Foundura in numbers: the schemes, funders, support organisations, perks and events it covers, public startups by sector and state, upcoming events by month, and anonymous totals of scans, downloads and new accounts over the last 30 days.",
      keywords: ["Indian startup statistics", "startup numbers India", "startup schemes count", "startups by sector India", "startups by state", "startup events India", "Foundura in numbers", "startup ecosystem India", "DPIIT schemes", "startup support data", "open data", "Scheme Scan", "startup templates", "Startup India", "Foundura"],
    },
    hi: {
      slug: "/numbers",
      focus: "स्टार्टअप आँकड़े",
      title: "स्टार्टअप आँकड़े: आँकड़ों में Foundura | Foundura",
      description: "भारतीय स्टार्टअप आँकड़े Foundura से: कितनी योजनाएँ, फ़ंड देने वाले, इनक्यूबेटर और कार्यक्रम सूची में हैं, सेक्टर और राज्य के हिसाब से स्टार्टअप, मासिक इस्तेमाल।",
      excerpt: "आँकड़ों में Foundura: इसकी योजनाएँ, फ़ंड देने वाले, सहायता संस्थाएँ, फ़ायदे और कार्यक्रम, सेक्टर और राज्य के हिसाब से सार्वजनिक स्टार्टअप, महीने के हिसाब से आने वाले कार्यक्रम, और पिछले 30 दिनों की जाँचों, डाउनलोड और नए खातों की गुमनाम कुल संख्या।",
      keywords: ["स्टार्टअप आँकड़े", "भारत के स्टार्टअप", "योजनाओं की संख्या", "सेक्टर के हिसाब से स्टार्टअप", "राज्य के हिसाब से स्टार्टअप", "स्टार्टअप कार्यक्रम", "आँकड़ों में Foundura", "स्टार्टअप इकोसिस्टम", "DPIIT योजनाएँ", "स्टार्टअप सहायता डेटा", "ओपन डेटा", "योजना जाँच", "स्टार्टअप टेम्पलेट", "Startup India", "Foundura"],
    },
  },
  cities: {
    en: {
      slug: "/cities",
      focus: "startup cities in India",
      title: "Startup cities in India: Bengaluru, Delhi, more | Foundura",
      description: "Startup cities in India: Bengaluru, Delhi NCR, Mumbai, Hyderabad, Pune, Chennai, Ahmedabad and Kolkata, each with its incubators, funders, events and startups.",
      excerpt: "A page for each of India's main startup cities: the incubators, startup hubs and funders based there, upcoming startup events in the city, the startups that chose it on Foundura, and the state's schemes.",
      keywords: ["startup cities in India", "Bengaluru startups", "Delhi NCR startups", "Mumbai startups", "Hyderabad startups", "Pune startups", "Chennai startups", "Ahmedabad startups", "Kolkata startups", "incubators by city", "startup events by city", "startup ecosystem India", "startup hubs", "T-Hub", "Foundura"],
    },
    hi: {
      slug: "/cities",
      focus: "भारत के स्टार्टअप शहर",
      title: "भारत के स्टार्टअप शहर: बेंगलुरु, दिल्ली और अन्य | Foundura",
      description: "भारत के स्टार्टअप शहर: बेंगलुरु, दिल्ली एनसीआर, मुंबई, हैदराबाद, पुणे, चेन्नई, अहमदाबाद और कोलकाता, हर एक के इनक्यूबेटर, फ़ंड, कार्यक्रम और स्टार्टअप।",
      excerpt: "भारत के हर मुख्य स्टार्टअप शहर का पेज: वहाँ के इनक्यूबेटर, स्टार्टअप हब और फ़ंड देने वाले, शहर के आने वाले स्टार्टअप कार्यक्रम, Foundura पर उस शहर को चुनने वाले स्टार्टअप, और राज्य की योजनाएँ।",
      keywords: ["भारत के स्टार्टअप शहर", "बेंगलुरु के स्टार्टअप", "दिल्ली एनसीआर के स्टार्टअप", "मुंबई के स्टार्टअप", "हैदराबाद के स्टार्टअप", "पुणे के स्टार्टअप", "चेन्नई के स्टार्टअप", "अहमदाबाद के स्टार्टअप", "कोलकाता के स्टार्टअप", "शहरवार इनक्यूबेटर", "शहरवार स्टार्टअप कार्यक्रम", "स्टार्टअप इकोसिस्टम", "स्टार्टअप हब", "T-Hub", "Foundura"],
    },
  },
  mentors: {
    en: {
      slug: "/mentors",
      focus: "startup mentors India",
      title: "Startup mentors India: free mentoring programmes | Foundura",
      description: "Find startup mentors India-wide: MAARG, the government portal, plus free programmes from foundations, TiE and incubators, and how to work with a mentor.",
      excerpt: "Free mentoring for Indian founders: MAARG, Startup India's national mentorship portal, foundation programmes, TiE chapters and incubator mentors, with practical advice on choosing a mentor, agreeing how you'll work together, putting advisor equity in writing and avoiding paid introductions.",
      keywords: ["startup mentors India", "find a mentor", "startup mentorship", "MAARG portal", "free mentoring for startups", "Startup India mentorship", "TiE mentoring", "Wadhwani Liftoff", "startup advisor", "advisor agreement", "advisor equity", "mentoring programme", "founder mentoring", "NASSCOM 10000 Startups", "Foundura"],
    },
    hi: {
      slug: "/mentors",
      focus: "स्टार्टअप मेंटर",
      title: "स्टार्टअप मेंटर: मुफ़्त मेंटरिंग कार्यक्रम | Foundura",
      description: "स्टार्टअप मेंटर खोजें: सरकारी पोर्टल MAARG, फ़ाउंडेशन, TiE और इनक्यूबेटर के मुफ़्त कार्यक्रम, और मेंटर के साथ काम करने के आसान तरीक़े।",
      excerpt: "भारतीय संस्थापकों के लिए मुफ़्त मेंटरिंग: Startup India का राष्ट्रीय मेंटरशिप पोर्टल MAARG, फ़ाउंडेशन के कार्यक्रम, TiE चैप्टर और इनक्यूबेटर के मेंटर, साथ में मेंटर चुनने, साथ काम करने का तरीक़ा तय करने, सलाहकार इक्विटी लिखित में रखने और पैसे लेकर परिचय कराने वालों से बचने की व्यावहारिक सलाह।",
      keywords: ["स्टार्टअप मेंटर", "मेंटर कैसे खोजें", "स्टार्टअप मेंटरशिप", "MAARG पोर्टल", "मुफ़्त मेंटरिंग", "Startup India मेंटरशिप", "TiE मेंटरिंग", "Wadhwani Liftoff", "स्टार्टअप सलाहकार", "सलाहकार समझौता", "सलाहकार इक्विटी", "मेंटरिंग कार्यक्रम", "संस्थापकों के लिए मार्गदर्शन", "NASSCOM 10000 Startups", "Foundura"],
    },
  },
  coworking: {
    en: {
      slug: "/coworking",
      focus: "co-working space for startups",
      title: "Co-working space for startups in India | Foundura",
      description: "Co-working space for startups at government hubs and incubators across India, state seat subsidies, and what to check before you sign for a desk.",
      excerpt: "Desks, cabins and labs for Indian startups at government-run hubs and incubators such as T-Hub, O-Hub, i-Hub Gujarat and Kerala Startup Mission, state schemes that repay part of the seat cost, and a checklist for internet, meeting rooms, the registered office address and the agreement.",
      keywords: ["co-working space for startups", "startup co-working India", "government co-working space", "incubator desk", "plug and play office", "T-Hub co-working", "O-Hub Bhubaneswar", "i-Hub Gujarat", "Kerala Startup Mission space", "co-working subsidy", "startup office space", "registered office address", "shared office India", "STPI incubation", "Foundura"],
    },
    hi: {
      slug: "/coworking",
      focus: "स्टार्टअप के लिए को-वर्किंग",
      title: "स्टार्टअप के लिए को-वर्किंग जगह | Foundura",
      description: "स्टार्टअप के लिए को-वर्किंग जगह: पूरे भारत के सरकारी हब और इनक्यूबेटर में डेस्क, राज्यों की सीट सब्सिडी, और डेस्क लेने से पहले क्या देखें।",
      excerpt: "T-Hub, O-Hub, i-Hub गुजरात और केरल स्टार्टअप मिशन जैसे सरकारी हब और इनक्यूबेटर में भारतीय स्टार्टअप के लिए डेस्क, केबिन और लैब, सीट की लागत का हिस्सा लौटाने वाली राज्य योजनाएँ, और इंटरनेट, मीटिंग रूम, रजिस्टर्ड दफ़्तर के पते और समझौते की जाँच-सूची।",
      keywords: ["स्टार्टअप के लिए को-वर्किंग", "को-वर्किंग जगह", "सरकारी को-वर्किंग", "इनक्यूबेटर में डेस्क", "प्लग एंड प्ले दफ़्तर", "T-Hub को-वर्किंग", "O-Hub भुवनेश्वर", "i-Hub गुजरात", "केरल स्टार्टअप मिशन", "को-वर्किंग सब्सिडी", "स्टार्टअप दफ़्तर", "रजिस्टर्ड दफ़्तर का पता", "साझा दफ़्तर", "STPI इनक्यूबेशन", "Foundura"],
    },
  },
  students: {
    en: {
      slug: "/students",
      focus: "student startups India",
      title: "Student startups India: campus help, hackathons | Foundura",
      description: "Student startups India guide: campus innovation councils, Smart India Hackathon, state student policies, who owns your idea and what under-18s should know.",
      excerpt: "Help for student founders in India: Institution's Innovation Councils and incubators on campus, the Smart India Hackathon, Atal Tinkering Labs, Gujarat's student startup policy and Kerala's IEDCs, plus who owns ideas built with college resources and how founders under 18 handle the paperwork.",
      keywords: ["student startups India", "student entrepreneurship", "startup for students", "Institution's Innovation Council", "Smart India Hackathon", "Atal Tinkering Labs", "SSIP Gujarat", "IEDC Kerala", "campus incubator", "college startup", "E-cell", "student founder", "startup under 18", "idea ownership", "Foundura"],
    },
    hi: {
      slug: "/students",
      focus: "छात्र स्टार्टअप",
      title: "छात्र स्टार्टअप: कैंपस सहायता और हैकाथॉन | Foundura",
      description: "छात्र स्टार्टअप गाइड: कैंपस इनोवेशन काउंसिल, स्मार्ट इंडिया हैकाथॉन, राज्यों की छात्र नीतियाँ, आइडिया का मालिक कौन, और 18 से कम उम्र वाले क्या जानें।",
      excerpt: "भारत के छात्र संस्थापकों के लिए मदद: कैंपस की इंस्टिट्यूशन इनोवेशन काउंसिल और इनक्यूबेटर, स्मार्ट इंडिया हैकाथॉन, अटल टिंकरिंग लैब, गुजरात की छात्र स्टार्टअप नीति और केरल के IEDC, साथ में कॉलेज के संसाधनों से बने आइडिया का मालिक कौन और 18 से कम उम्र के संस्थापक काग़ज़ संभालना।",
      keywords: ["छात्र स्टार्टअप", "छात्र उद्यमिता", "छात्रों के लिए स्टार्टअप", "इंस्टिट्यूशन इनोवेशन काउंसिल", "स्मार्ट इंडिया हैकाथॉन", "अटल टिंकरिंग लैब", "SSIP गुजरात", "IEDC केरल", "कैंपस इनक्यूबेटर", "कॉलेज स्टार्टअप", "उद्यमिता सेल", "छात्र संस्थापक", "18 से कम उम्र में स्टार्टअप", "आइडिया का स्वामित्व", "Foundura"],
    },
  },
  women: {
    en: {
      slug: "/women",
      focus: "women entrepreneurs India",
      title: "Women entrepreneurs India: schemes and support | Foundura",
      description: "Support for women entrepreneurs India-wide: Stand-Up India, WE Hub, NITI Aayog's Women Entrepreneurship Platform, TiE Women and what women-led means.",
      excerpt: "Schemes, programmes and networks for women-led startups in India: Stand-Up India loans, Telangana's WE Hub, NITI Aayog's Women Entrepreneurship Platform and TiE Women, extra support in state startup policies, and how schemes usually define a woman-led enterprise.",
      keywords: ["women entrepreneurs India", "women founders", "women-led startups", "schemes for women entrepreneurs", "Stand-Up India", "WE Hub", "Women Entrepreneurship Platform", "WEP NITI Aayog", "TiE Women", "women startup funding", "female founders India", "women entrepreneurship", "state startup policy women", "woman-led enterprise", "Foundura"],
    },
    hi: {
      slug: "/women",
      focus: "महिला उद्यमी",
      title: "महिला उद्यमी: योजनाएँ और सहायता | Foundura",
      description: "महिला उद्यमी और संस्थापकों के लिए सहायता: स्टैंड-अप इंडिया, WE Hub, नीति आयोग का वुमन एंटरप्रेन्योरशिप प्लेटफ़ॉर्म, TiE Women और महिला-नेतृत्व का मतलब।",
      excerpt: "भारत में महिला-नेतृत्व वाले स्टार्टअप के लिए योजनाएँ, कार्यक्रम और नेटवर्क: स्टैंड-अप इंडिया लोन, तेलंगाना का WE Hub, नीति आयोग का वुमन एंटरप्रेन्योरशिप प्लेटफ़ॉर्म और TiE Women, राज्य स्टार्टअप नीतियों में अतिरिक्त सहायता, और योजनाएँ आम तौर पर महिला-नेतृत्व वाले उद्यम को कैसे परिभाषित करती हैं।",
      keywords: ["महिला उद्यमी", "महिला संस्थापक", "महिला-नेतृत्व वाले स्टार्टअप", "महिलाओं के लिए योजनाएँ", "स्टैंड-अप इंडिया", "WE Hub", "वुमन एंटरप्रेन्योरशिप प्लेटफ़ॉर्म", "नीति आयोग WEP", "TiE Women", "महिला स्टार्टअप फ़ंडिंग", "महिला उद्यमिता", "राज्य स्टार्टअप नीति", "महिला-नेतृत्व वाला उद्यम", "महिलाओं के लिए लोन", "Foundura"],
    },
  },
  selling: {
    en: {
      slug: "/selling",
      focus: "sell to government",
      title: "Sell to government: GeM, tenders and pilots | Foundura",
      description: "How startups sell to government in India: GeM seller registration, Startup Runway, tender relaxations for DPIIT startups, and winning pilots with big companies.",
      excerpt: "A plain guide to public procurement for Indian startups: registering on GeM, listing new products through Startup Runway, exemptions from prior turnover, experience and earnest money, state rules and grievances, then paid pilots, NDAs, vendor onboarding and on-time payment for MSMEs.",
      keywords: ["sell to government", "GeM registration", "GeM Startup Runway", "government tenders for startups", "public procurement India", "prior turnover exemption", "EMD exemption", "CPPP tenders", "DPIIT procurement benefits", "corporate pilot", "enterprise sales India", "vendor onboarding", "Udyam registration", "MSME payment 45 days", "Foundura"],
    },
    hi: {
      slug: "/selling",
      focus: "सरकार को बेचना",
      title: "सरकार को बेचना: GeM, टेंडर और पायलट | Foundura",
      description: "स्टार्टअप सरकार को बेचना कैसे शुरू करें: GeM पर विक्रेता रजिस्ट्रेशन, स्टार्टअप रनवे, DPIIT स्टार्टअप के लिए टेंडर छूट, और बड़ी कंपनियों के साथ पायलट।",
      excerpt: "भारतीय स्टार्टअप के लिए सरकारी ख़रीद की आसान गाइड: GeM पर रजिस्ट्रेशन, स्टार्टअप रनवे से नए प्रोडक्ट लिस्ट करना, पिछले टर्नओवर, अनुभव और बयाना राशि से छूट, राज्यों के नियम और शिकायत, फिर पेड पायलट, NDA, वेंडर ऑनबोर्डिंग और MSME को समय पर भुगतान।",
      keywords: ["सरकार को बेचना", "GeM रजिस्ट्रेशन", "GeM स्टार्टअप रनवे", "स्टार्टअप के लिए सरकारी टेंडर", "सरकारी ख़रीद", "पिछले टर्नओवर से छूट", "बयाना राशि से छूट", "CPPP टेंडर", "DPIIT ख़रीद लाभ", "कॉर्पोरेट पायलट", "बड़ी कंपनियों को बिक्री", "वेंडर ऑनबोर्डिंग", "उद्यम रजिस्ट्रेशन", "MSME भुगतान 45 दिन", "Foundura"],
    },
  },
  global: {
    en: {
      slug: "/global",
      focus: "expand your startup abroad",
      title: "Expand your startup abroad from India | Foundura",
      description: "How to expand your startup abroad from India: export services without GST, protect your brand, use Startup India's bridges and set up a subsidiary legally.",
      excerpt: "A plain guide for Indian founders going global: selling abroad from your Indian company, zero-rated exports with a letter of undertaking, international trademarks and patents, Startup India's international bridges, overseas direct investment rules for a foreign subsidiary and why moving the parent company abroad needs care.",
      keywords: ["expand your startup abroad", "going global India", "startup international expansion", "export of services GST", "letter of undertaking", "overseas direct investment", "ODI rules 2022", "foreign subsidiary", "flipping a startup", "reverse flip India", "Madrid Protocol trademark", "PCT patent", "Startup India international bridges", "SCO Startup Forum", "Foundura"],
    },
    hi: {
      slug: "/global",
      focus: "स्टार्टअप का विदेश में विस्तार",
      title: "स्टार्टअप का विदेश में विस्तार: पूरी गाइड | Foundura",
      description: "भारत से स्टार्टअप का विदेश में विस्तार कैसे करें: बिना GST सेवाओं का निर्यात, विदेश में ब्रांड सुरक्षा, Startup India ब्रिज और विदेशी सहायक कंपनी के नियम।",
      excerpt: "विदेश जाने वाले संस्थापकों के लिए आसान गाइड: भारतीय कंपनी से विदेश में बेचना, लेटर ऑफ़ अंडरटेकिंग के साथ शून्य दर पर निर्यात, अंतरराष्ट्रीय ट्रेडमार्क और पेटेंट, Startup India के अंतरराष्ट्रीय ब्रिज, विदेशी सहायक कंपनी के लिए ओवरसीज़ डायरेक्ट इन्वेस्टमेंट नियम, और मूल कंपनी विदेश ले जाने की सावधानी।",
      keywords: ["स्टार्टअप का विदेश में विस्तार", "विदेश में कारोबार", "अंतरराष्ट्रीय विस्तार", "सेवाओं का निर्यात", "लेटर ऑफ़ अंडरटेकिंग", "ओवरसीज़ डायरेक्ट इन्वेस्टमेंट", "ODI नियम 2022", "विदेशी सहायक कंपनी", "स्टार्टअप फ़्लिप", "रिवर्स फ़्लिप", "मैड्रिड ट्रेडमार्क", "PCT पेटेंट", "Startup India अंतरराष्ट्रीय ब्रिज", "SCO स्टार्टअप फ़ोरम", "Foundura"],
    },
  },
  closing: {
    en: {
      slug: "/closing",
      focus: "close a startup in India",
      title: "Close a startup in India: strike-off, insolvency | Foundura",
      description: "How to close a startup in India properly: tell investors and staff, settle dues, cancel GST, strike off with Form STK-2 or use the fast-track insolvency route.",
      excerpt: "A step-by-step guide to shutting down an Indian startup cleanly: choosing between dormant status and closure, telling investors and the team, settling salaries, suppliers and taxes, cancelling GST, voluntary strike-off with Form STK-2, fast-track insolvency for startups and the records to keep afterwards.",
      keywords: ["close a startup in India", "shut down a company", "strike off company", "Form STK-2", "voluntary strike off", "dormant company", "winding up a startup", "fast-track insolvency", "IBC startups", "cancel GST registration", "close an LLP", "company closure process", "startup failure", "director liability", "Foundura"],
    },
    hi: {
      slug: "/closing",
      focus: "स्टार्टअप बंद करना",
      title: "स्टार्टअप बंद करना: नाम हटवाना और दिवाला | Foundura",
      description: "भारत में स्टार्टअप बंद करना सही तरीक़े से: निवेशकों और टीम को बताएँ, बकाया चुकाएँ, GST रद्द करें, STK-2 से नाम हटवाएँ या फ़ास्ट-ट्रैक दिवाला अपनाएँ।",
      excerpt: "भारतीय स्टार्टअप को ठीक से बंद करने की क़दम-दर-क़दम गाइड: निष्क्रिय कंपनी या बंद करने में चुनाव, निवेशकों और टीम को बताना, वेतन, सप्लायर और टैक्स चुकाना, GST रद्द करना, फ़ॉर्म STK-2 से स्वैच्छिक नाम हटवाना, स्टार्टअप के लिए फ़ास्ट-ट्रैक दिवाला और बाद में रखे जाने वाले रिकॉर्ड।",
      keywords: ["स्टार्टअप बंद करना", "कंपनी बंद करना", "कंपनी का नाम हटवाना", "फ़ॉर्म STK-2", "स्वैच्छिक स्ट्राइक ऑफ़", "निष्क्रिय कंपनी", "स्टार्टअप का समापन", "फ़ास्ट-ट्रैक दिवाला", "IBC स्टार्टअप", "GST रजिस्ट्रेशन रद्द करना", "LLP बंद करना", "कंपनी बंद करने की प्रक्रिया", "स्टार्टअप की विफलता", "निदेशक की ज़िम्मेदारी", "Foundura"],
    },
  },
  labs: {
    en: {
      slug: "/labs",
      focus: "startup testing labs India",
      title: "Startup testing labs India: prototype and certify | Foundura",
      description: "Startup testing labs India guide: where to prototype, which certificates you need (BIS, MTCTE, CDSCO), NABL accredited labs and STQC, CSIR and state centres.",
      excerpt: "Where Indian startups can build prototypes, test products and get certified: shared prototyping centres and fab labs, BIS, MTCTE, CDSCO and drone certification, NABL accredited labs, STQC and CSIR labs, pre-compliance testing, protecting your design and schemes that pay for testing.",
      keywords: ["startup testing labs India", "prototyping centre", "fab lab", "NABL accredited lab", "STQC testing", "BIS certification", "MTCTE certification", "CDSCO medical device testing", "drone type certification", "CSIR labs", "product certification India", "pre-compliance testing", "hardware startup India", "T-Works Hyderabad", "Foundura"],
    },
    hi: {
      slug: "/labs",
      focus: "स्टार्टअप टेस्टिंग लैब",
      title: "स्टार्टअप टेस्टिंग लैब: प्रोटोटाइप और प्रमाणन | Foundura",
      description: "स्टार्टअप टेस्टिंग लैब की गाइड: प्रोटोटाइप कहाँ बनाएँ, कौन-से प्रमाणपत्र चाहिए (BIS, MTCTE, CDSCO), NABL मान्यता प्राप्त लैब और STQC व CSIR केंद्र।",
      excerpt: "भारतीय स्टार्टअप प्रोटोटाइप कहाँ बनाएँ, उत्पाद की जाँच कहाँ कराएँ और प्रमाणपत्र कैसे पाएँ: साझा प्रोटोटाइपिंग केंद्र और फ़ैब लैब, BIS, MTCTE, CDSCO और ड्रोन प्रमाणन, NABL मान्यता प्राप्त लैब, STQC और CSIR लैब, शुरुआती जाँच, डिज़ाइन की सुरक्षा और जाँच का ख़र्च उठाने वाली योजनाएँ।",
      keywords: ["स्टार्टअप टेस्टिंग लैब", "प्रोटोटाइपिंग केंद्र", "फ़ैब लैब", "NABL मान्यता प्राप्त लैब", "STQC जाँच", "BIS प्रमाणन", "MTCTE प्रमाणन", "चिकित्सा उपकरण जाँच", "ड्रोन प्रमाणन", "CSIR लैब", "उत्पाद प्रमाणन", "शुरुआती जाँच", "हार्डवेयर स्टार्टअप", "T-Works हैदराबाद", "Foundura"],
    },
  },
  patents: {
    en: {
      slug: "/patents",
      focus: "patent filing for startups",
      title: "Patent filing for startups: India and abroad | Foundura",
      description: "Patent filing for startups: file in India step by step, use the 12-month priority year, the PCT route and the national phase, and know the main patent offices.",
      excerpt: "How startups can protect an invention: keeping it secret until filing, what India lets you patent, provisional and complete applications, examination and renewal, the foreign filing permit, the 12-month priority year, the PCT route, the national phase, and the main patent offices abroad.",
      keywords: ["patent filing for startups", "patent filing India", "provisional patent application", "PCT application", "national phase", "foreign filing permit", "priority date", "request for examination", "expedited examination startups", "startup patent fees", "software patent India", "unitary patent", "USPTO small entity", "patent agent", "Foundura"],
    },
    hi: {
      slug: "/patents",
      focus: "स्टार्टअप के लिए पेटेंट",
      title: "स्टार्टअप के लिए पेटेंट: भारत और विदेश में आवेदन | Foundura",
      description: "स्टार्टअप के लिए पेटेंट: भारत में आवेदन कदम-दर-कदम, 12 महीने की प्राथमिकता अवधि, PCT का रास्ता, राष्ट्रीय चरण और दुनिया के मुख्य पेटेंट कार्यालय।",
      excerpt: "स्टार्टअप अपना आविष्कार कैसे सुरक्षित करें: आवेदन तक गोपनीयता, भारत में क्या पेटेंट हो सकता है, अस्थायी और पूरा आवेदन, जाँच और नवीनीकरण, विदेशी आवेदन की अनुमति, 12 महीने की प्राथमिकता अवधि, PCT, राष्ट्रीय चरण और विदेश के मुख्य पेटेंट कार्यालय।",
      keywords: ["स्टार्टअप के लिए पेटेंट", "भारत में पेटेंट आवेदन", "अस्थायी पेटेंट आवेदन", "PCT आवेदन", "राष्ट्रीय चरण", "विदेशी आवेदन अनुमति", "प्राथमिकता तिथि", "जाँच का अनुरोध", "स्टार्टअप के लिए जल्दी जाँच", "पेटेंट फ़ीस में छूट", "सॉफ़्टवेयर पेटेंट", "यूनिटरी पेटेंट", "अमेरिका में पेटेंट", "पेटेंट एजेंट", "Foundura"],
    },
  },
  founderGuides: {
    en: {
      slug: "/founder-guides",
      focus: "founder handbook",
      title: "Founder handbook: people, rules and paperwork | Foundura",
      description: "Founder handbook for startups: mentors, desks and labs, company setup, hiring, ESOPs, tax, foreign investment, trademarks, patents, licences and more.",
      excerpt: "Short, practical guides for founders: finding mentors, desks and labs; setting up the company, hiring, ESOPs, tax deductions, foreign investment, trademarks, patents, licences, cyber security, online selling and insurance; and selling to government, going abroad and closing.",
      keywords: ["founder handbook", "startup guides India", "company setup", "hiring staff", "ESOPs", "TDS for startups", "FEMA for startups", "trademarks", "patents", "business licences", "cyber security", "selling online", "startup insurance", "startup compliance", "Foundura"],
    },
    hi: {
      slug: "/founder-guides",
      focus: "संस्थापक पुस्तिका",
      title: "संस्थापक पुस्तिका: लोग, नियम और काग़ज़ी काम | Foundura",
      description: "स्टार्टअप के लिए संस्थापक पुस्तिका: मेंटर, जगह और लैब, कंपनी बनाना, भर्ती, ESOP, कर, विदेशी निवेश, ट्रेडमार्क, पेटेंट, लाइसेंस और बहुत कुछ।",
      excerpt: "संस्थापकों के लिए छोटी, व्यावहारिक गाइड: मेंटर, काम की जगह और लैब खोजना; कंपनी बनाना, भर्ती, ESOP, कर कटौती, विदेशी निवेश, ट्रेडमार्क, पेटेंट, लाइसेंस, साइबर सुरक्षा, ऑनलाइन बिक्री और बीमा; और सरकार को बेचना, विदेश जाना और बंद करना।",
      keywords: ["संस्थापक पुस्तिका", "स्टार्टअप गाइड", "कंपनी बनाना", "कर्मचारी रखना", "ESOP", "स्टार्टअप के लिए TDS", "FEMA", "ट्रेडमार्क", "पेटेंट", "व्यवसाय लाइसेंस", "साइबर सुरक्षा", "ऑनलाइन बिक्री", "स्टार्टअप बीमा", "स्टार्टअप अनुपालन", "Foundura"],
    },
  },
  setup: {
    en: {
      slug: "/company-setup",
      focus: "company registration for startups",
      title: "Company registration for startups in India | Foundura",
      description: "Company registration for startups: choose a private limited company or LLP, incorporate with SPICe+, and meet the 30, 60 and 180-day filings.",
      excerpt: "How to set up your startup: choosing between a private limited company, LLP or one person company, digital signatures and name checks, incorporating with SPICe+, the first auditor and board meeting, share certificates, the commencement filing, demat shares and other registrations.",
      keywords: ["company registration for startups", "private limited company", "LLP registration", "SPICe+", "one person company", "INC-20A", "commencement of business", "first auditor", "ADT-1", "share certificates", "demat shares private company", "DPIIT recognition", "Udyam registration", "incorporation India", "Foundura"],
    },
    hi: {
      slug: "/company-setup",
      focus: "स्टार्टअप के लिए कंपनी पंजीकरण",
      title: "स्टार्टअप के लिए कंपनी पंजीकरण | Foundura",
      description: "स्टार्टअप के लिए कंपनी पंजीकरण: प्राइवेट लिमिटेड या LLP चुनें, स्पाइस+ से निगमन करें, और 30, 60 और 180 दिनों की फ़ाइलिंग समय पर करें।",
      excerpt: "अपना स्टार्टअप कैसे बनाएँ: प्राइवेट लिमिटेड कंपनी, LLP या एक व्यक्ति कंपनी में से चुनना, डिजिटल हस्ताक्षर और नाम की जाँच, स्पाइस+ से निगमन, पहला ऑडिटर और बोर्ड बैठक, शेयर प्रमाणपत्र, कारोबार शुरू करने की घोषणा, डीमैट शेयर और दूसरे पंजीकरण।",
      keywords: ["स्टार्टअप के लिए कंपनी पंजीकरण", "प्राइवेट लिमिटेड कंपनी", "LLP पंजीकरण", "स्पाइस+", "एक व्यक्ति कंपनी", "INC-20A", "कारोबार शुरू करने की घोषणा", "पहला ऑडिटर", "ADT-1", "शेयर प्रमाणपत्र", "डीमैट शेयर", "DPIIT मान्यता", "उद्यम पंजीकरण", "कंपनी निगमन", "Foundura"],
    },
  },
  employees: {
    en: {
      slug: "/employees",
      focus: "labour law for startups",
      title: "Labour law for startups: hiring staff in India | Foundura",
      description: "Labour law for startups under the new labour codes: appointment letters, wages, provident fund at 20, ESI at 10, POSH committee, gratuity and leave.",
      excerpt: "The rules that switch on as a startup's team grows under India's four labour codes: appointment letters, the new wage definition, provident fund, ESI, the POSH internal committee, gratuity, maternity leave and creches, and keeping registers and returns up to date.",
      keywords: ["labour law for startups", "labour codes 2025", "hiring employees India", "appointment letter", "provident fund registration", "EPFO", "ESI registration", "POSH committee", "internal committee", "gratuity", "maternity leave", "shops and establishments", "payroll compliance", "employee or contractor", "Foundura"],
    },
    hi: {
      slug: "/employees",
      focus: "स्टार्टअप के लिए श्रम क़ानून",
      title: "स्टार्टअप के लिए श्रम क़ानून: कर्मचारी रखना | Foundura",
      description: "नई श्रम संहिताओं के तहत स्टार्टअप के लिए श्रम क़ानून: नियुक्ति पत्र, वेतन, 20 पर भविष्य निधि, 10 पर ESI, POSH समिति, ग्रेच्युटी और छुट्टी।",
      excerpt: "भारत की चार श्रम संहिताओं के तहत टीम बढ़ने के साथ लागू होने वाले नियम: नियुक्ति पत्र, वेतन की नई परिभाषा, भविष्य निधि, ESI, POSH आंतरिक समिति, ग्रेच्युटी, मातृत्व अवकाश और शिशु-गृह, और रजिस्टर व रिटर्न अद्यतन रखना।",
      keywords: ["स्टार्टअप के लिए श्रम क़ानून", "श्रम संहिता 2025", "कर्मचारी भर्ती", "नियुक्ति पत्र", "भविष्य निधि पंजीकरण", "EPFO", "ESI पंजीकरण", "POSH समिति", "आंतरिक समिति", "ग्रेच्युटी", "मातृत्व अवकाश", "दुकान और प्रतिष्ठान", "पेरोल अनुपालन", "कर्मचारी या ठेकेदार", "Foundura"],
    },
  },
  esops: {
    en: {
      slug: "/esops",
      focus: "ESOPs for startups",
      title: "ESOPs for startups: pools, vesting and tax | Foundura",
      description: "ESOPs for startups in India: create the pool, who can get options, one-year minimum vesting, tax at exercise and sale, and the startup tax deferral.",
      excerpt: "How Indian startups set up and run an employee stock option plan: creating the pool, who can receive options, vesting and cliffs, tax at exercise and on sale, the deferral for eligible startups, leavers and buybacks, and recording and reporting grants.",
      keywords: ["ESOPs for startups", "employee stock options India", "ESOP pool", "ESOP vesting", "vesting cliff", "ESOP tax", "perquisite tax", "ESOP tax deferral", "80-IAC", "ESOP buyback", "fair market value", "cap table", "ESOP scheme", "stock options for promoters", "Foundura"],
    },
    hi: {
      slug: "/esops",
      focus: "स्टार्टअप के लिए ESOP",
      title: "स्टार्टअप के लिए ESOP: पूल, वेस्टिंग और कर | Foundura",
      description: "भारत में स्टार्टअप के लिए ESOP: पूल बनाना, विकल्प किसे मिलें, कम से कम एक साल की वेस्टिंग, इस्तेमाल और बिक्री पर कर, और कर टालने की सुविधा।",
      excerpt: "भारतीय स्टार्टअप कर्मचारी स्टॉक विकल्प योजना कैसे बनाएँ और चलाएँ: पूल बनाना, विकल्प किसे मिल सकते हैं, वेस्टिंग और क्लिफ़, इस्तेमाल और बिक्री पर कर, योग्य स्टार्टअप के लिए कर टालना, छोड़ने वाले और बायबैक, और विकल्पों को दर्ज करना व रिपोर्ट करना।",
      keywords: ["स्टार्टअप के लिए ESOP", "कर्मचारी स्टॉक विकल्प", "ESOP पूल", "ESOP वेस्टिंग", "वेस्टिंग क्लिफ़", "ESOP पर कर", "अनुलाभ कर", "ESOP कर टालना", "स्टार्टअप कर छूट", "ESOP बायबैक", "उचित बाज़ार मूल्य", "कैप टेबल", "ESOP योजना", "प्रमोटरों को विकल्प", "Foundura"],
    },
  },
  taxes: {
    en: {
      slug: "/tax-deductions",
      focus: "TDS for startups",
      title: "TDS for startups: deductions and advance tax | Foundura",
      description: "TDS for startups under the Income-tax Act, 2025: TAN, when to deduct, deposit by the 7th, quarterly returns, advance tax dates and the tax holiday.",
      excerpt: "The tax a startup deducts and pays: getting a TAN, TDS on salaries, contractors, professionals and rent under the Income-tax Act, 2025, monthly deposits, quarterly returns and certificates, advance tax instalments, where angel tax stands, and applying for the startup tax holiday.",
      keywords: ["TDS for startups", "Income-tax Act 2025", "TAN registration", "TDS on salary", "TDS on contractors", "TDS deposit date", "TDS return due dates", "section 393", "advance tax dates", "angel tax", "startup tax holiday", "80-IAC", "tax compliance startup", "TDS certificate", "Foundura"],
    },
    hi: {
      slug: "/tax-deductions",
      focus: "स्टार्टअप के लिए TDS",
      title: "स्टार्टअप के लिए TDS: कटौती और अग्रिम कर | Foundura",
      description: "आयकर अधिनियम, 2025 के तहत स्टार्टअप के लिए TDS: TAN, कब काटें, 7 तारीख़ तक जमा, तिमाही रिटर्न, अग्रिम कर की तारीख़ें और कर छूट।",
      excerpt: "स्टार्टअप जो कर काटते और भरते हैं: TAN लेना, आयकर अधिनियम, 2025 के तहत वेतन, ठेकेदारों, पेशेवरों और किराए पर TDS, मासिक जमा, तिमाही रिटर्न और प्रमाणपत्र, अग्रिम कर की किस्तें, एंजेल टैक्स की स्थिति, और स्टार्टअप कर छूट के लिए आवेदन।",
      keywords: ["स्टार्टअप के लिए TDS", "आयकर अधिनियम 2025", "TAN पंजीकरण", "वेतन पर TDS", "ठेकेदारों पर TDS", "TDS जमा करने की तारीख़", "TDS रिटर्न", "धारा 393", "अग्रिम कर", "एंजेल टैक्स", "स्टार्टअप कर छूट", "80-IAC", "कर अनुपालन", "TDS प्रमाणपत्र", "Foundura"],
    },
  },
  foreignInvestment: {
    en: {
      slug: "/foreign-investment",
      focus: "FEMA compliance for startups",
      title: "FEMA compliance for startups: foreign investment | Foundura",
      description: "FEMA compliance for startups taking foreign money: routes and approvals, fair value, allotment in 60 days, FC-GPR in 30, FC-TRS, the FLA return.",
      excerpt: "What startups must do when money comes from abroad: the automatic route and land-border approvals, pricing at fair value, allotting within 60 days, filing FC-GPR on the FIRMS portal, convertible notes, share transfers, the annual FLA return, flips and reverse flips, and fixing missed filings.",
      keywords: ["FEMA compliance for startups", "foreign investment India", "FDI in startups", "FC-GPR", "FIRMS portal", "FC-TRS", "FLA return", "convertible note foreign investor", "Press Note 3", "fair value shares", "overseas direct investment", "reverse flip", "late submission fee", "RBI reporting", "Foundura"],
    },
    hi: {
      slug: "/foreign-investment",
      focus: "स्टार्टअप के लिए FEMA अनुपालन",
      title: "स्टार्टअप के लिए FEMA अनुपालन: विदेशी निवेश | Foundura",
      description: "विदेशी पैसा लेने वाले स्टार्टअप के लिए FEMA अनुपालन: रास्ता और मंज़ूरी, उचित मूल्य, 60 दिनों में आवंटन, 30 में FC-GPR, FC-TRS और FLA रिटर्न।",
      excerpt: "विदेश से पैसा आने पर स्टार्टअप को क्या करना होता है: स्वचालित रास्ता और ज़मीनी सीमा वाले देशों की मंज़ूरी, उचित मूल्य, 60 दिनों में आवंटन, FIRMS पोर्टल पर FC-GPR, परिवर्तनीय नोट, शेयर हस्तांतरण, सालाना FLA रिटर्न, फ़्लिप और रिवर्स फ़्लिप, और छूटी फ़ाइलिंग सुधारना।",
      keywords: ["स्टार्टअप के लिए FEMA अनुपालन", "विदेशी निवेश", "स्टार्टअप में FDI", "FC-GPR", "FIRMS पोर्टल", "FC-TRS", "FLA रिटर्न", "परिवर्तनीय नोट", "प्रेस नोट 3", "उचित मूल्य पर शेयर", "विदेश में निवेश", "रिवर्स फ़्लिप", "देरी का शुल्क", "RBI रिपोर्टिंग", "Foundura"],
    },
  },
  trademarks: {
    en: {
      slug: "/trademarks",
      focus: "trademark registration for startups",
      title: "Trademark registration for startups in India | Foundura",
      description: "Trademark registration for startups: clear the name, pick classes, file TM-A at half fee, answer objections, survive opposition and use the Madrid system.",
      excerpt: "How startups protect their name and logo: searching before you spend, choosing classes, filing in India with the startup fee, examination reports and hearings, the four-month opposition window, ten-year registration, the six-month priority, the Madrid system and owning the mark.",
      keywords: ["trademark registration for startups", "trademark India", "TM-A", "trademark search", "trademark classes", "Nice classification", "trademark objection", "trademark opposition", "Trade Marks Journal", "Madrid Protocol", "international trademark", "trademark fee startups", "brand name protection", "logo trademark", "Foundura"],
    },
    hi: {
      slug: "/trademarks",
      focus: "स्टार्टअप के लिए ट्रेडमार्क पंजीकरण",
      title: "स्टार्टअप के लिए ट्रेडमार्क पंजीकरण | Foundura",
      description: "स्टार्टअप के लिए ट्रेडमार्क पंजीकरण: नाम जाँचें, वर्ग चुनें, आधी फ़ीस पर TM-A भरें, आपत्तियों का जवाब दें, विरोध से निपटें और मैड्रिड प्रणाली अपनाएँ।",
      excerpt: "स्टार्टअप अपना नाम और लोगो कैसे सुरक्षित करें: ख़र्च से पहले खोज, वर्ग चुनना, स्टार्टअप फ़ीस पर भारत में आवेदन, जाँच रिपोर्ट और सुनवाई, चार महीने की विरोध अवधि, दस साल का पंजीकरण, छह महीने की प्राथमिकता, मैड्रिड प्रणाली और चिह्न का मालिकाना हक़।",
      keywords: ["स्टार्टअप के लिए ट्रेडमार्क पंजीकरण", "भारत में ट्रेडमार्क", "TM-A", "ट्रेडमार्क खोज", "ट्रेडमार्क वर्ग", "नीस वर्गीकरण", "ट्रेडमार्क आपत्ति", "ट्रेडमार्क विरोध", "ट्रेडमार्क जर्नल", "मैड्रिड प्रोटोकॉल", "अंतरराष्ट्रीय ट्रेडमार्क", "स्टार्टअप ट्रेडमार्क फ़ीस", "ब्रांड नाम सुरक्षा", "लोगो ट्रेडमार्क", "Foundura"],
    },
  },
  licences: {
    en: {
      slug: "/licences",
      focus: "business licences in India",
      title: "Business licences in India: which ones you need | Foundura",
      description: "Business licences in India by sector: FSSAI for food, CDSCO for health, RBI, SEBI and IRDAI for money, drones, telecom, IEC, Legal Metrology and premises.",
      excerpt: "Which licences and registrations a startup may need before selling: FSSAI for food, CDSCO and drug licences for health, RBI, SEBI and IRDAI for financial services, drone and telecom permissions, IEC for trade, Legal Metrology and BIS for products, and premises licences.",
      keywords: ["business licences in India", "FSSAI registration", "FSSAI licence", "CDSCO licence", "payment aggregator licence", "digital lending rules", "SEBI registration", "IRDAI licence", "drone permission", "Digital Sky", "IEC code", "Legal Metrology", "trade licence", "regulatory sandbox", "Foundura"],
    },
    hi: {
      slug: "/licences",
      focus: "भारत में व्यवसाय लाइसेंस",
      title: "भारत में व्यवसाय लाइसेंस: कौन-से चाहिए | Foundura",
      description: "क्षेत्र के हिसाब से भारत में व्यवसाय लाइसेंस: खाद्य के लिए FSSAI, स्वास्थ्य के लिए CDSCO, पैसे के लिए RBI, SEBI और IRDAI, ड्रोन, दूरसंचार और IEC।",
      excerpt: "बेचने से पहले स्टार्टअप को कौन-से लाइसेंस और पंजीकरण चाहिए हो सकते हैं: खाद्य के लिए FSSAI, स्वास्थ्य के लिए CDSCO और दवा लाइसेंस, वित्तीय सेवाओं के लिए RBI, SEBI और IRDAI, ड्रोन और दूरसंचार की अनुमति, IEC, BIS और परिसर के लाइसेंस।",
      keywords: ["भारत में व्यवसाय लाइसेंस", "FSSAI पंजीकरण", "FSSAI लाइसेंस", "CDSCO लाइसेंस", "पेमेंट एग्रीगेटर", "डिजिटल ऋण नियम", "SEBI पंजीकरण", "IRDAI लाइसेंस", "ड्रोन अनुमति", "डिजिटल स्काई", "IEC कोड", "विधिक माप विज्ञान", "व्यापार लाइसेंस", "नियामक सैंडबॉक्स", "Foundura"],
    },
  },
  cyber: {
    en: {
      slug: "/cyber-security",
      focus: "cyber security for startups",
      title: "Cyber security for startups: CERT-In and breaches | Foundura",
      description: "Cyber security for startups: basic protections, keeping logs in India, reporting to CERT-In within six hours, DPDP breach notices and the GDPR.",
      excerpt: "What startups should do before and after a cyber incident: basic protections, logs kept in India for 180 days, reporting to CERT-In within six hours, telling the Data Protection Board and users about personal data breaches, rules abroad such as the GDPR, and an incident plan.",
      keywords: ["cyber security for startups", "CERT-In", "CERT-In 6 hours", "incident reporting India", "data breach", "DPDP breach notification", "Data Protection Board", "log retention 180 days", "GDPR breach", "two-factor authentication", "incident response plan", "ransomware", "cyber insurance", "DPDP Rules 2025", "Foundura"],
    },
    hi: {
      slug: "/cyber-security",
      focus: "स्टार्टअप के लिए साइबर सुरक्षा",
      title: "स्टार्टअप के लिए साइबर सुरक्षा और उल्लंघन | Foundura",
      description: "स्टार्टअप के लिए साइबर सुरक्षा: बुनियादी बचाव, भारत में लॉग रखना, छह घंटे में सर्ट-इन को रिपोर्ट, DPDP उल्लंघन सूचना और यूरोप का GDPR।",
      excerpt: "साइबर घटना से पहले और बाद में स्टार्टअप को क्या करना चाहिए: बुनियादी बचाव, 180 दिनों तक भारत में लॉग, छह घंटे में सर्ट-इन को रिपोर्ट, व्यक्तिगत डेटा उल्लंघन पर डेटा संरक्षण बोर्ड और उपयोगकर्ताओं को सूचना, विदेश के नियम जैसे GDPR, और घटना योजना।",
      keywords: ["स्टार्टअप के लिए साइबर सुरक्षा", "सर्ट-इन", "छह घंटे में रिपोर्ट", "साइबर घटना रिपोर्ट", "डेटा उल्लंघन", "DPDP उल्लंघन सूचना", "डेटा संरक्षण बोर्ड", "180 दिन लॉग", "GDPR", "दो-चरणीय लॉगिन", "घटना योजना", "रैनसमवेयर", "साइबर बीमा", "DPDP नियम 2025", "Foundura"],
    },
  },
  onlineSelling: {
    en: {
      slug: "/online-selling",
      focus: "e-commerce rules in India",
      title: "E-commerce rules in India for online sellers | Foundura",
      description: "E-commerce rules in India: seller details, grievance officer, complaints in 48 hours, price, origin and returns, dark patterns, reviews and GST.",
      excerpt: "The consumer rules for online stores and marketplaces in India: showing who you are, the grievance officer and complaint deadlines, price, origin and return terms, the ban on dark patterns, genuine reviews and endorsements, GST and TCS for sellers, and selling abroad.",
      keywords: ["e-commerce rules in India", "Consumer Protection E-Commerce Rules", "grievance officer", "online seller rules", "dark patterns", "dark patterns guidelines", "country of origin", "return policy", "Legal Metrology e-commerce", "fake reviews", "influencer disclosure", "GST for online sellers", "TCS e-commerce", "D2C brand", "Foundura"],
    },
    hi: {
      slug: "/online-selling",
      focus: "भारत में ई-कॉमर्स नियम",
      title: "भारत में ई-कॉमर्स नियम: ऑनलाइन विक्रेताओं के लिए | Foundura",
      description: "भारत में ई-कॉमर्स नियम: विक्रेता का विवरण, शिकायत अधिकारी, 48 घंटे में पावती, क़ीमत, मूल देश और वापसी, डार्क पैटर्न, समीक्षाएँ और GST।",
      excerpt: "भारत में ऑनलाइन स्टोर और मार्केटप्लेस के उपभोक्ता नियम: अपनी पहचान दिखाना, शिकायत अधिकारी और समय-सीमा, क़ीमत, मूल देश और वापसी की शर्तें, डार्क पैटर्न पर रोक, असली समीक्षाएँ और प्रचार, विक्रेताओं के लिए GST और TCS, और विदेश में बिक्री।",
      keywords: ["भारत में ई-कॉमर्स नियम", "उपभोक्ता संरक्षण ई-कॉमर्स नियम", "शिकायत अधिकारी", "ऑनलाइन विक्रेता नियम", "डार्क पैटर्न", "डार्क पैटर्न दिशानिर्देश", "मूल देश", "वापसी नीति", "विधिक माप विज्ञान", "नक़ली समीक्षाएँ", "इन्फ़्लुएंसर खुलासा", "ऑनलाइन विक्रेता GST", "ई-कॉमर्स TCS", "डी2सी ब्रांड", "Foundura"],
    },
  },
  insurance: {
    en: {
      slug: "/insurance",
      focus: "insurance for startups",
      title: "Insurance for startups: the covers that matter | Foundura",
      description: "Insurance for startups: group health, directors and officers, professional indemnity, cyber, product and public liability, and buying from IRDAI insurers.",
      excerpt: "The insurance covers startups most often need and when investors and customers ask for them: group health, directors and officers, professional indemnity, cyber, product and public liability, equipment, goods and key people, and buying from regulated insurers.",
      keywords: ["insurance for startups", "startup insurance India", "group health insurance", "D&O insurance", "directors and officers", "professional indemnity", "errors and omissions", "cyber insurance", "product liability", "public liability", "key person insurance", "IRDAI", "insurance for SaaS", "clinical trial insurance", "Foundura"],
    },
    hi: {
      slug: "/insurance",
      focus: "स्टार्टअप के लिए बीमा",
      title: "स्टार्टअप के लिए बीमा: ज़रूरी कवर | Foundura",
      description: "स्टार्टअप के लिए बीमा: समूह स्वास्थ्य, निदेशक और अधिकारी, पेशेवर क्षतिपूर्ति, साइबर, उत्पाद और सार्वजनिक देयता, और IRDAI बीमाकर्ताओं से ख़रीद।",
      excerpt: "स्टार्टअप को सबसे ज़्यादा जिन बीमों की ज़रूरत होती है और निवेशक व ग्राहक कब माँगते हैं: समूह स्वास्थ्य, निदेशक और अधिकारी, पेशेवर क्षतिपूर्ति, साइबर, उत्पाद और सार्वजनिक देयता, उपकरण, सामान और अहम लोग, और विनियमित बीमा कंपनियों से ख़रीद।",
      keywords: ["स्टार्टअप के लिए बीमा", "स्टार्टअप बीमा", "समूह स्वास्थ्य बीमा", "D&O बीमा", "निदेशक और अधिकारी बीमा", "पेशेवर क्षतिपूर्ति", "ग़लती और चूक बीमा", "साइबर बीमा", "उत्पाद देयता", "सार्वजनिक देयता", "अहम व्यक्ति बीमा", "IRDAI", "सॉफ़्टवेयर कंपनी बीमा", "क्लिनिकल ट्रायल बीमा", "Foundura"],
    },
  },
  rounds: {
    en: {
      slug: "/rounds",
      focus: "startup funding rounds India",
      title: "Startup funding rounds India: who raised what | Foundura",
      description: "Startup funding rounds India: recent rounds by Indian startups with amount, stage, sector and investors, each linked to its report. Free and open data.",
      excerpt: "A free list of funding rounds raised by Indian startups, as publicly reported: company, sector, place, round, amount and investing organisations, newest first, filterable by sector and round, with a link to each report and the data free to download.",
      keywords: ["startup funding rounds India", "Indian startup funding", "funding news India", "Series A India", "seed funding India", "who raised money", "startup investors India", "venture capital deals India", "funding tracker", "startup deals", "pre-seed rounds", "venture debt India", "funding data", "open data startups", "Foundura"],
    },
    hi: {
      slug: "/rounds",
      focus: "स्टार्टअप फ़ंडिंग राउंड",
      title: "स्टार्टअप फ़ंडिंग राउंड: किसने कितना जुटाया | Foundura",
      description: "भारत के स्टार्टअप फ़ंडिंग राउंड: हाल के राउंड, रक़म, चरण, सेक्टर और निवेशकों के साथ, हर एक की रिपोर्ट के लिंक सहित। मुफ़्त और खुला डेटा।",
      excerpt: "भारतीय स्टार्टअप के सार्वजनिक रूप से बताए गए फ़ंडिंग राउंड की मुफ़्त सूची: कंपनी, सेक्टर, जगह, राउंड, रक़म और निवेशक संस्थाएँ, सबसे नए पहले, सेक्टर और राउंड के फ़िल्टर, हर रिपोर्ट के लिंक और मुफ़्त डाउनलोड वाले डेटा के साथ।",
      keywords: ["स्टार्टअप फ़ंडिंग राउंड", "भारतीय स्टार्टअप फ़ंडिंग", "फ़ंडिंग समाचार", "सीरीज़ A", "सीड फ़ंडिंग", "किसने पैसा जुटाया", "स्टार्टअप निवेशक", "वेंचर कैपिटल सौदे", "फ़ंडिंग ट्रैकर", "स्टार्टअप सौदे", "प्री-सीड राउंड", "वेंचर ऋण", "फ़ंडिंग डेटा", "खुला डेटा", "Foundura"],
    },
  },
  msme: {
    en: {
      slug: "/sectors/msme",
      focus: "MSME guide India",
      title: "MSME guide India: Udyam, payments, loans and GeM | Foundura",
      description: "MSME guide India: free Udyam registration, the 2025 size limits, the 45-day payment rule, TReDS, GeM tenders and collateral-free loans, step by step.",
      excerpt: "A free guide for small businesses and MSMEs in India: Udyam registration, the micro, small and medium limits, getting paid within 45 days, recovering late payments, TReDS invoice finance, selling on GeM and the loans and subsidies meant for small units.",
      keywords: ["MSME guide India", "Udyam registration", "MSME classification 2025", "45 day payment rule", "MSME delayed payment", "MSME ODR portal", "TReDS", "GeM for MSMEs", "public procurement MSE", "CGTMSE loan", "PMEGP subsidy", "MUDRA loan", "small business India", "micro enterprise", "Foundura"],
    },
    hi: {
      slug: "/sectors/msme",
      focus: "MSME गाइड",
      title: "MSME गाइड: उद्यम, भुगतान, ऋण और GeM | Foundura",
      description: "MSME गाइड: मुफ़्त उद्यम रजिस्ट्रेशन, 2025 की आकार सीमाएँ, 45 दिन में भुगतान का नियम, ट्रेड्स, GeM टेंडर और बिना गिरवी ऋण, क़दम-दर-क़दम समझें।",
      excerpt: "भारत में छोटे कारोबार और MSME के लिए मुफ़्त गाइड: उद्यम रजिस्ट्रेशन, सूक्ष्म, लघु और मध्यम की सीमाएँ, 45 दिन में भुगतान, देर से आए भुगतान की वसूली, ट्रेड्स, GeM पर बिक्री और छोटी इकाइयों के ऋण व सब्सिडी।",
      keywords: ["MSME गाइड", "उद्यम रजिस्ट्रेशन", "MSME श्रेणी 2025", "45 दिन भुगतान नियम", "देर से भुगतान", "MSME ODR पोर्टल", "ट्रेड्स", "GeM पर बिक्री", "सरकारी ख़रीद", "CGTMSE ऋण", "PMEGP सब्सिडी", "मुद्रा ऋण", "छोटा कारोबार", "सूक्ष्म उद्यम", "Foundura"],
    },
  },
  agritech: {
    en: {
      slug: "/sectors/agritech",
      focus: "agritech startup guide India",
      title: "Agritech startup guide India: grants, FPOs, FSSAI | Foundura",
      description: "Agritech startup guide India: RKVY agri-startup grants, AgriSURE, AIF loans, working with FPOs, FSSAI licence limits from 2026, drones and food exports.",
      excerpt: "A free guide for agritech and food startups in India: agri-startup grants through incubators, the AgriSURE fund, Agriculture Infrastructure Fund loans, working with farmer producer organisations, FSSAI licences, input and drone rules, food processing subsidies and exports.",
      keywords: ["agritech startup guide India", "agri startup grants", "RKVY agri startup", "AgriSURE fund", "Agriculture Infrastructure Fund", "FPO scheme", "farmer producer organisation", "FSSAI licence limits", "FoSCoS", "PMFME subsidy", "agri drones rules", "APEDA registration", "food startup India", "agribusiness incubator", "Foundura"],
    },
    hi: {
      slug: "/sectors/agritech",
      focus: "एग्रीटेक स्टार्टअप गाइड",
      title: "एग्रीटेक स्टार्टअप गाइड: अनुदान, FPO, FSSAI | Foundura",
      description: "एग्रीटेक स्टार्टअप गाइड: RKVY एग्री-स्टार्टअप अनुदान, एग्रीश्योर फ़ंड, AIF ऋण, FPO के साथ काम, 2026 से FSSAI लाइसेंस सीमाएँ, ड्रोन और खाद्य निर्यात।",
      excerpt: "भारत में एग्रीटेक और फ़ूड स्टार्टअप के लिए मुफ़्त गाइड: इनक्यूबेटरों से एग्री-स्टार्टअप अनुदान, एग्रीश्योर फ़ंड, कृषि अवसंरचना कोष के ऋण, किसान उत्पादक संगठन, FSSAI लाइसेंस, इनपुट और ड्रोन के नियम, खाद्य प्रसंस्करण सब्सिडी और निर्यात।",
      keywords: ["एग्रीटेक स्टार्टअप गाइड", "एग्री-स्टार्टअप अनुदान", "RKVY स्टार्टअप", "एग्रीश्योर फ़ंड", "कृषि अवसंरचना कोष", "FPO योजना", "किसान उत्पादक संगठन", "FSSAI लाइसेंस", "फ़ॉस्कॉस", "PMFME सब्सिडी", "कृषि ड्रोन नियम", "APEDA पंजीकरण", "फ़ूड स्टार्टअप", "एग्रीबिज़नेस इनक्यूबेटर", "Foundura"],
    },
  },
  stories: {
    en: {
      slug: "/stories",
      focus: "Indian founder stories",
      title: "Indian founder stories: how startups were built | Foundura",
      description: "Indian founder stories in their own words: how startups were started, funded and grown, published only with each founder's consent and free to read.",
      excerpt: "Founders tell, in their own words, how they built their startups: first customers, mistakes, funding and lessons. Each story is published only with the founder's consent, checked by an editor first, and can be withdrawn by the founder at any time.",
      keywords: ["Indian founder stories", "startup stories India", "founder journey", "how startups started", "startup lessons", "entrepreneur stories", "founder interviews", "startup success stories", "startup failures", "bootstrapped founders", "women founders India", "first customers", "building a startup", "founder advice", "Foundura"],
    },
    hi: {
      slug: "/stories",
      focus: "भारतीय संस्थापकों की कहानियाँ",
      title: "भारतीय संस्थापकों की कहानियाँ: स्टार्टअप कैसे बने | Foundura",
      description: "भारतीय संस्थापकों की कहानियाँ उनके अपने शब्दों में: स्टार्टअप कैसे शुरू हुए, पैसा कैसे जुटा और कैसे बढ़े, हर संस्थापक की सहमति से प्रकाशित।",
      excerpt: "संस्थापक अपने शब्दों में बताते हैं कि उन्होंने स्टार्टअप कैसे बनाया: पहले ग्राहक, गलतियाँ, फ़ंडिंग और सबक। हर कहानी संस्थापक की सहमति से, संपादक के पढ़ने के बाद ही छपती है, और संस्थापक उसे कभी भी वापस ले सकते हैं।",
      keywords: ["भारतीय संस्थापकों की कहानियाँ", "स्टार्टअप की कहानियाँ", "संस्थापक का सफ़र", "स्टार्टअप कैसे शुरू हुए", "स्टार्टअप के सबक", "उद्यमियों की कहानियाँ", "संस्थापकों के अनुभव", "सफल स्टार्टअप", "स्टार्टअप की असफलता", "बूटस्ट्रैप्ड संस्थापक", "महिला संस्थापक", "पहले ग्राहक", "स्टार्टअप बनाना", "संस्थापकों की सलाह", "Foundura"],
    },
  },
};

/** Every main page in every language; the other languages share the English slug. */
export const SEO: Record<PageKey, Record<Lang, PageSeo>> = Object.fromEntries(
  (Object.keys(SEO_EN_HI) as PageKey[]).map((k) => {
    const slug = SEO_EN_HI[k].en.slug;
    const later = Object.fromEntries(Object.entries(contentOf("seo")).map(([l, s]) => [l, (s as Record<PageKey, Omit<PageSeo, "slug">>)[k]]));
    const intl = Object.fromEntries(Object.entries({ ...SEO_INTL[k], ...later }).map(([l, e]) => [l, { slug, ...e }]));
    return [k, { ...SEO_EN_HI[k], ...intl }];
  }),
) as Record<PageKey, Record<Lang, PageSeo>>;

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** The page's address in a language: English at the plain path, the others under /<code>. */
export function urlFor(path: string, lang: Lang): string {
  return `${SITE}${lp(lang, path)}`;
}

/** Every language version of a page, keyed by hreflang, plus x-default (English). */
export function languagesFor(path: string): Record<string, string> {
  return { ...Object.fromEntries(LANGS.map((l) => [LANG_INFO[l].tag, urlFor(path, l)])), "x-default": urlFor(path, "en") };
}

/** Canonical address plus every language version, so search engines show the right one. */
export function alternates(path: string, lang: Lang): Metadata["alternates"] {
  return { canonical: urlFor(path, lang), languages: languagesFor(path) };
}

/** Full metadata for a page from explicit SEO details: title, description, keywords, alternates, shares. */
export function seoMetadata(
  path: string,
  lang: Lang,
  s: Omit<PageSeo, "slug"> & { type?: "website" | "article"; published?: string | null; noindex?: boolean; ownImage?: boolean },
): Metadata {
  return {
    title: { absolute: s.title },
    description: s.description,
    keywords: s.keywords,
    alternates: alternates(path, lang),
    openGraph: {
      title: s.title,
      description: s.excerpt,
      url: urlFor(path, lang),
      siteName: "Foundura",
      locale: LANG_INFO[lang].og,
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => LANG_INFO[l].og),
      type: s.type ?? "website",
      ...(s.type === "article" && s.published ? { publishedTime: s.published } : {}),
      // The default share image ([lang]/opengraph-image.tsx). Naming it here is needed because a page's own openGraph
      // replaces the inherited one. Pages with their own opengraph-image file pass ownImage, or this would replace theirs.
      ...(s.ownImage ? {} : { images: [{ url: urlFor("/opengraph-image", lang), width: 1200, height: 630, alt: "Foundura" }] }),
    },
    twitter: { card: "summary_large_image", title: s.title, description: s.description, ...(s.ownImage ? {} : { images: [urlFor("/opengraph-image", lang)] }) },
    ...(s.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Metadata for one of the main pages listed in SEO. */
export function pageMetadata(key: PageKey, lang: Lang): Metadata {
  const s = SEO[key][lang];
  return seoMetadata(s.slug, lang, s);
}

/** Cut text to a meta description: whole words, at most `max` characters. */
export function clip(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/[\s,;:.]+\S*$/, "")}…`;
}

/** An SEO title: the name first, then the site, within 60 characters when possible. */
export function seoTitle(name: string, suffix?: string): string {
  const full = suffix ? `${name}: ${suffix} | Foundura` : `${name} | Foundura`;
  if (full.length <= 60 || !suffix) return full.length <= 60 ? full : `${clip(name, 48)} | Foundura`;
  return `${name} | Foundura`.length <= 60 ? `${name} | Foundura` : `${clip(name, 48)} | Foundura`;
}

/** Up to 15 distinct keywords, the most specific first, padded with general ones. */
export function keywordList(specific: (string | null | undefined)[], general: string[]): string[] {
  const out: string[] = [];
  for (const k of [...specific, ...general]) {
    // The keywords tag is comma-separated, so a comma inside a keyword would split it in two.
    const v = k?.replace(/\s*,\s*/g, " ").trim();
    if (v && !out.some((o) => o.toLowerCase() === v.toLowerCase())) out.push(v);
    if (out.length === 15) break;
  }
  return out;
}

/** A description of 120–160 characters: the text, then a closing line if there's room. */
export function describe(text: string, closing: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  const withClosing = `${t.replace(/[.。।]?$/, lang => lang || ".")} ${closing}`.trim();
  if ([...withClosing].length <= 158) return withClosing;
  return clip(t, 158);
}
