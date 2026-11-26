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
  | "software";

const SEO_EN_HI: Record<PageKey, Record<"en" | "hi", PageSeo>> = {
  home: {
    en: {
      slug: "/",
      focus: "government schemes for startups",
      title: "Government schemes for startups in India | Foundura",
      description:
        "Find the government schemes for startups you qualify for: a free scan of central and state schemes, plus investors, events, guides and templates.",
      excerpt:
        "Foundura helps Indian founders find the central and state government schemes they qualify for, see why, and apply at the official source. It also lists investors, startup events and policy news, with free guides and templates.",
      keywords: [
        "government schemes for startups",
        "startup schemes India",
        "Startup India schemes",
        "DPIIT recognition",
        "startup grants India",
        "seed funding India",
        "startup loans India",
        "state startup policy",
        "angel investors India",
        "startup events India",
        "startup templates",
        "pitch deck template",
        "founder guides India",
        "startup eligibility check",
        "Foundura",
      ],
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

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

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
