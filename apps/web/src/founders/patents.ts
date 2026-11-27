/**
 * The extra parts of the /patents founder guide: filing abroad, the timeline from the first Indian
 * filing, and the main patent offices. English and Hindi, like the other founder guides; the steps for
 * filing in India live with the other guides in `guides.ts`.
 *
 * Written from official sources (IP India, WIPO, EPO, USPTO) on the date in `CHECKED_ON` in `guides.ts`.
 * Not yet reviewed by a patent agent: say so on the page until one has checked it.
 */

type Step = { title: string; body: string };

export type PatentText = {
  abroadTitle: string;
  abroadSteps: Step[];
  timelineTitle: string;
  timelineLead: string;
  timeline: { when: string; what: string }[];
  officesTitle: string;
  officesLead: string;
  /** One note per office, in the order of `PATENT_OFFICES`. */
  officeNotes: string[];
  agent: string;
};

/** Main patent offices: names and links stay in English. */
export const PATENT_OFFICES: { name: string; where: string; url: string }[] = [
  { name: "Office of the Controller General of Patents, Designs and Trade Marks (IP India)", where: "India", url: "https://ipindia.gov.in" },
  { name: "WIPO: Patent Cooperation Treaty (PCT)", where: "International", url: "https://www.wipo.int/pct/en/" },
  { name: "European Patent Office (EPO)", where: "Europe", url: "https://www.epo.org" },
  { name: "United States Patent and Trademark Office (USPTO)", where: "United States", url: "https://www.uspto.gov" },
  { name: "UK Intellectual Property Office", where: "United Kingdom", url: "https://www.gov.uk/government/organisations/intellectual-property-office" },
  { name: "China National Intellectual Property Administration (CNIPA)", where: "China", url: "https://english.cnipa.gov.cn" },
  { name: "Japan Patent Office (JPO)", where: "Japan", url: "https://www.jpo.go.jp/e/" },
  { name: "Korean Intellectual Property Office (KIPO)", where: "South Korea", url: "https://www.kipo.go.kr/en/" },
  { name: "Intellectual Property Office of Singapore (IPOS)", where: "Singapore", url: "https://www.ipos.gov.sg" },
];

const en: PatentText = {
  abroadTitle: "Filing in other countries",
  abroadSteps: [
    { title: "Mind the 12-month priority year", body: "Under the Paris Convention you can file in other countries within 12 months of your first application and keep its date. Miss the year and your own publication can count against you abroad, and that can't be undone." },
    { title: "Get permission before filing abroad", body: "If you live in India, the Patents Act (section 39) says you must either file in India first and wait six weeks, or get written permission from the Patent Office (Form 25) before filing anywhere else. Filing abroad without it is an offence and can cost you the Indian patent." },
    { title: "Choose the PCT route or direct filing", body: "One PCT application, filed in India or with WIPO, keeps your options open in more than 150 countries and gives you a search report and an opinion on patentability. It isn't an international patent: it buys time, usually until month 30, to decide where to spend money. If you only need one or two countries, filing there directly can be simpler." },
    { title: "Enter the national phase", body: "At month 30 (31 in India and at the European Patent Office) you file in each country or region you chose, with translations, local fees and usually a local patent agent. This is where most of the cost of foreign patents lies, so decide before then." },
    { title: "Use regional and faster routes", body: "One European patent application covers the EPO's member states, and a granted European patent can become a Unitary Patent covering 18 EU countries in one go. The UK isn't part of the Unitary Patent. Patent Prosecution Highway agreements between some offices can speed up examination once one office has allowed your claims." },
    { title: "Spend where it matters", body: "File where your customers, competitors and manufacturers are, not everywhere. Check the discounts: in the US, small entities pay 60% less and micro entities 80% less on most fees. Some Indian state startup policies also reimburse part of patent costs; check yours." },
  ],
  timelineTitle: "From your first Indian filing",
  timelineLead: "The usual deadlines, counted from your first filing (the priority date). Check the dates for your own application with your patent agent.",
  timeline: [
    { when: "Month 0", what: "First filing in India, provisional or complete. This sets your priority date." },
    { when: "6 weeks", what: "Earliest you can file abroad without a foreign filing permit, if you live in India." },
    { when: "Month 12", what: "Complete specification due in India after a provisional, and the last day to file a PCT application or file abroad claiming your Indian date." },
    { when: "Month 16", what: "The PCT search report and written opinion usually arrive around now." },
    { when: "Month 18", what: "Your application is published, in India and under the PCT, unless you asked for early publication." },
    { when: "Month 30", what: "PCT national phase in most countries, including the US, China, Japan and Korea." },
    { when: "Month 31", what: "PCT national phase in India and at the EPO, and the last day to request examination in India." },
    { when: "Year 20", what: "The patent ends, 20 years from the filing date, if you keep paying renewal fees." },
  ],
  officesTitle: "Main patent offices",
  officesLead: "Where to file and look things up. Each office publishes its fees and forms; check them before you file.",
  officeNotes: [
    "Startups pay lower fees and can ask for expedited examination. Computer programs as such, business methods and algorithms can't be patented (section 3(k)).",
    "Not a patent office of its own: one international application, filed through your national office or WIPO, then the national phase. PATENTSCOPE searches published applications for free.",
    "One application for all its member states, then a Unitary Patent for 18 EU countries or validation country by country. There's no general grace period, so don't disclose before filing.",
    "A provisional application holds your date for 12 months, and your own disclosures have a one-year grace period. Small and micro entities get 60% and 80% off most fees.",
    "Separate from the EU's Unitary Patent; cover the UK through the EPO or by filing with the UK office directly.",
    "Foreign applicants file through a Chinese patent agency. Check whether inventions made in China need a security review before filing abroad.",
    "You must request examination within three years of filing, or the application is withdrawn.",
    "Examination must also be requested within three years of filing.",
    "A common hub for South-East Asia, where you can file in English.",
  ],
  agent: "Patent drafting needs a registered patent agent: the claims decide what you can stop others doing. This guide hasn't been reviewed by a patent agent yet.",
};

const hi: PatentText = {
  abroadTitle: "दूसरे देशों में आवेदन",
  abroadSteps: [
    { title: "12 महीने की प्राथमिकता अवधि का ध्यान रखें", body: "पेरिस कन्वेंशन के तहत आप अपने पहले आवेदन के 12 महीने के अंदर दूसरे देशों में आवेदन करके उसी तारीख़ का लाभ ले सकते हैं। यह साल चूक गए तो विदेश में आपका अपना प्रकाशन ही आपके ख़िलाफ़ गिना जा सकता है, और इसे बाद में ठीक नहीं किया जा सकता।" },
    { title: "विदेश में आवेदन से पहले अनुमति लें", body: "अगर आप भारत में रहते हैं, तो पेटेंट अधिनियम (धारा 39) के अनुसार या तो पहले भारत में आवेदन करके छह हफ़्ते इंतज़ार करें, या कहीं और आवेदन करने से पहले पेटेंट कार्यालय से लिखित अनुमति (फ़ॉर्म 25) लें। इसके बिना विदेश में आवेदन करना अपराध है और इससे भारतीय पेटेंट भी जा सकता है।" },
    { title: "PCT या सीधा आवेदन चुनें", body: "भारत में या WIPO के पास दाख़िल एक PCT आवेदन 150 से ज़्यादा देशों में आपके विकल्प खुले रखता है और आपको खोज रिपोर्ट व पेटेंट योग्यता पर राय देता है। यह अंतरराष्ट्रीय पेटेंट नहीं है: यह आम तौर पर 30वें महीने तक का समय देता है ताकि आप तय कर सकें कि पैसा कहाँ लगाना है। अगर एक-दो देश ही चाहिए, तो वहाँ सीधे आवेदन करना आसान हो सकता है।" },
    { title: "राष्ट्रीय चरण में जाएँ", body: "30वें महीने में (भारत और यूरोपीय पेटेंट कार्यालय में 31वें महीने में) आप चुने गए हर देश या क्षेत्र में अनुवाद, स्थानीय फ़ीस और आम तौर पर स्थानीय पेटेंट एजेंट के साथ आवेदन करते हैं। विदेशी पेटेंट का ज़्यादातर ख़र्च यहीं होता है, इसलिए उससे पहले फ़ैसला कर लें।" },
    { title: "क्षेत्रीय और तेज़ रास्ते अपनाएँ", body: "एक यूरोपीय पेटेंट आवेदन EPO के सभी सदस्य देशों को कवर करता है, और मंज़ूर यूरोपीय पेटेंट एक साथ 18 EU देशों को कवर करने वाला यूनिटरी पेटेंट बन सकता है। ब्रिटेन यूनिटरी पेटेंट में शामिल नहीं है। कुछ कार्यालयों के बीच पेटेंट प्रॉसिक्यूशन हाईवे समझौते, किसी एक कार्यालय के आपके दावे मंज़ूर करने के बाद जाँच तेज़ कर सकते हैं।" },
    { title: "वहीं ख़र्च करें जहाँ ज़रूरी हो", body: "हर जगह नहीं, वहाँ आवेदन करें जहाँ आपके ग्राहक, प्रतिस्पर्धी और निर्माता हैं। छूट देखें: अमेरिका में छोटी संस्थाएँ ज़्यादातर फ़ीस पर 60% और सूक्ष्म संस्थाएँ 80% कम देती हैं। कुछ भारतीय राज्यों की स्टार्टअप नीतियाँ पेटेंट ख़र्च का हिस्सा भी लौटाती हैं; अपने राज्य की नीति देखें।" },
  ],
  timelineTitle: "भारत में पहले आवेदन से",
  timelineLead: "आम समय-सीमाएँ, आपके पहले आवेदन (प्राथमिकता तिथि) से गिनी गईं। अपने आवेदन की तारीख़ें अपने पेटेंट एजेंट से पक्की करें।",
  timeline: [
    { when: "महीना 0", what: "भारत में पहला आवेदन, अस्थायी (प्रोविज़नल) या पूरा। इससे आपकी प्राथमिकता तिथि तय होती है।" },
    { when: "6 हफ़्ते", what: "भारत में रहने वालों के लिए, विदेशी आवेदन अनुमति के बिना विदेश में आवेदन की सबसे पहली तारीख़।" },
    { when: "महीना 12", what: "अस्थायी आवेदन के बाद भारत में पूरा विनिर्देश जमा करने की आख़िरी तारीख़, और भारतीय तारीख़ का दावा करते हुए PCT या विदेश में आवेदन का आख़िरी दिन।" },
    { when: "महीना 16", what: "PCT खोज रिपोर्ट और लिखित राय आम तौर पर इसी समय आती है।" },
    { when: "महीना 18", what: "आपका आवेदन भारत में और PCT के तहत प्रकाशित होता है, अगर आपने जल्दी प्रकाशन नहीं माँगा।" },
    { when: "महीना 30", what: "अमेरिका, चीन, जापान और कोरिया समेत ज़्यादातर देशों में PCT का राष्ट्रीय चरण।" },
    { when: "महीना 31", what: "भारत और EPO में PCT का राष्ट्रीय चरण, और भारत में जाँच का अनुरोध करने का आख़िरी दिन।" },
    { when: "साल 20", what: "नवीनीकरण फ़ीस भरते रहने पर, आवेदन की तारीख़ से 20 साल बाद पेटेंट ख़त्म होता है।" },
  ],
  officesTitle: "मुख्य पेटेंट कार्यालय",
  officesLead: "कहाँ आवेदन करें और जानकारी खोजें। हर कार्यालय अपनी फ़ीस और फ़ॉर्म प्रकाशित करता है; आवेदन से पहले उन्हें देख लें।",
  officeNotes: [
    "स्टार्टअप कम फ़ीस देते हैं और जल्दी जाँच माँग सकते हैं। कंप्यूटर प्रोग्राम अपने आप में, व्यावसायिक तरीक़े और एल्गोरिद्म पेटेंट नहीं हो सकते (धारा 3(k))।",
    "यह अपने आप में पेटेंट कार्यालय नहीं है: अपने राष्ट्रीय कार्यालय या WIPO के ज़रिए एक अंतरराष्ट्रीय आवेदन, फिर राष्ट्रीय चरण। PATENTSCOPE पर प्रकाशित आवेदन मुफ़्त खोजे जा सकते हैं।",
    "सभी सदस्य देशों के लिए एक आवेदन, फिर 18 EU देशों के लिए यूनिटरी पेटेंट या देश-दर-देश मान्यता। यहाँ आम छूट अवधि नहीं है, इसलिए आवेदन से पहले खुलासा न करें।",
    "अस्थायी आवेदन 12 महीने तक आपकी तारीख़ सुरक्षित रखता है, और आपके अपने खुलासों पर एक साल की छूट अवधि है। छोटी और सूक्ष्म संस्थाओं को ज़्यादातर फ़ीस पर 60% और 80% छूट मिलती है।",
    "EU के यूनिटरी पेटेंट से अलग; ब्रिटेन को EPO के ज़रिए या सीधे ब्रिटिश कार्यालय में आवेदन करके कवर करें।",
    "विदेशी आवेदक किसी चीनी पेटेंट एजेंसी के ज़रिए आवेदन करते हैं। देखें कि चीन में बने आविष्कारों के लिए विदेश में आवेदन से पहले सुरक्षा जाँच ज़रूरी है या नहीं।",
    "आवेदन के तीन साल के अंदर जाँच का अनुरोध करना ज़रूरी है, नहीं तो आवेदन वापस मान लिया जाता है।",
    "यहाँ भी आवेदन के तीन साल के अंदर जाँच का अनुरोध करना होता है।",
    "दक्षिण-पूर्व एशिया का एक आम केंद्र, जहाँ अंग्रेज़ी में आवेदन किया जा सकता है।",
  ],
  agent: "पेटेंट का मसौदा बनाने के लिए पंजीकृत पेटेंट एजेंट ज़रूरी है: दावे ही तय करते हैं कि आप दूसरों को क्या करने से रोक सकते हैं। इस गाइड की अभी किसी पेटेंट एजेंट ने समीक्षा नहीं की है।",
};

export const patentText: Record<"en" | "hi", PatentText> = { en, hi };
