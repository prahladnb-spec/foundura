/**
 * Agritech and food guide (/sectors/agritech). Written from official sources and general practice on
 * CHECKED_ON. English and Hindi only; other languages show the English. When agri-startup grants, AIF,
 * AgriSURE, the FPO scheme, FSSAI limits or PMFME change, update both languages and CHECKED_ON.
 */
import type { SectorGuide, SectorText } from "./guide";

const en: SectorText = {
  breadcrumb: "Sector guides",
  title: "Building an agritech or food startup in India",
  lead: "Agri-startup grants and incubators, loans for farm infrastructure, working with farmer producer organisations, food licences and selling abroad, in one place.",
  checked: "Checked against official sources on {date}. This is a guide, not legal or tax advice: rules change, so confirm with a chartered accountant or lawyer before you act.",
  stepsTitle: "The path, step by step",
  steps: [
    {
      title: "Register the company and get DPIIT recognition",
      body: "Most agritech startups register a private limited company and apply for DPIIT recognition, which is free and is a condition for many grants and tax benefits, including the agriculture ministry's agri-startup programme.",
    },
    {
      title: "Join an agribusiness incubator",
      body: "Under the RKVY innovation and agri-entrepreneurship programme, agribusiness incubators (R-ABIs) and knowledge partners such as MANAGE and NIAM run calls for startups. Selected startups can get up to ₹5 lakh at the idea or pre-seed stage and up to ₹25 lakh at the seed stage, with training and mentoring.",
    },
    {
      title: "Work with farmers through FPOs",
      body: "Farmer producer organisations bring farmers together to buy inputs, sell produce and use services, so they are often an agritech startup's best route to farmers. Under the scheme to form 10,000 FPOs, each FPO can get management support of up to ₹18 lakh over three years, a matching equity grant of ₹2,000 per farmer member up to ₹15 lakh, and a credit guarantee on project loans up to ₹2 crore.",
    },
    {
      title: "Finance farm infrastructure with AIF loans",
      body: "The Agriculture Infrastructure Fund supports loans for post-harvest and farm-gate projects such as warehouses, cold chains, sorting and grading units. Startups are eligible: loans up to ₹2 crore get 3% a year interest subvention for up to seven years, and a credit guarantee. Check the current deadline before you apply.",
    },
    {
      title: "Get the food licence that fits",
      body: "Anyone who makes, stores, transports or sells food needs FSSAI registration or a licence, applied for on the FoSCoS portal. Since 1 April 2026 the limits are registration up to ₹1.5 crore turnover, a state licence up to ₹50 crore and a central licence above that; importers and some other businesses need a central licence whatever their size.",
    },
    {
      title: "Check the licences for inputs and drones",
      body: "Selling seeds, fertilisers or pesticides needs a dealer licence from the state agriculture department, and new pesticides need registration with the Central Insecticides Board. Drones must be a type-certified model registered on the Digital Sky platform, flown by a certified remote pilot, and spraying must follow the approved crop and dose.",
    },
    {
      title: "Look at grants for food processing",
      body: "PMFME has given micro food processing units a credit-linked subsidy of 35% of the project cost, up to ₹10 lakh, and up to ₹3 crore for common infrastructure built by FPOs, self-help groups and cooperatives. Its extension was under review in 2026, so check whether it is open.",
    },
    {
      title: "Sell abroad with the right papers",
      body: "Exporters need an Importer Exporter Code from DGFT. Many farm and processed food products also need registration with APEDA, and plant products need a phytosanitary certificate from the Plant Quarantine organisation. Buyers will also check residue and quality standards for their market.",
    },
  ],
  factsTitle: "Money for agritech founders",
  facts: [
    { t: "Agri-startup grants (RKVY)", d: "Up to ₹5 lakh at the idea or pre-seed stage and up to ₹25 lakh at the seed stage, through agribusiness incubators." },
    { t: "AgriSURE fund", d: "A ₹750 crore fund set up by NABARD and the agriculture ministry, managed by NABVENTURES, investing directly in agri startups and through other venture funds." },
    { t: "Agriculture Infrastructure Fund", d: "3% a year interest subvention on loans up to ₹2 crore for up to seven years, with a credit guarantee." },
    { t: "Collateral-free loans", d: "CGTMSE guarantees cover bank loans to micro and small enterprises, including food and agri businesses registered on Udyam." },
  ],
  schemesTitle: "Schemes to check",
  schemesLead: "Run the Scheme Scan to see which you qualify for.",
  scanLink: "Run the Scheme Scan",
  docsTitle: "Templates for agritech startups",
  guidesTitle: "Guides for agritech founders",
  investorsTitle: "Investors in agritech and food",
  investorsBrowse: "All investors in this sector",
  investorsEmpty: "No investors with this focus are listed yet.",
  sourcesTitle: "Official sources",
};

const hi: SectorText = {
  breadcrumb: "सेक्टर गाइड",
  title: "भारत में एग्रीटेक या फ़ूड स्टार्टअप बनाना",
  lead: "एग्री-स्टार्टअप अनुदान और इनक्यूबेटर, खेती के बुनियादी ढाँचे के लिए ऋण, किसान उत्पादक संगठनों के साथ काम, खाद्य लाइसेंस और विदेश में बिक्री, एक ही जगह।",
  checked: "{date} को आधिकारिक स्रोतों से मिलाया गया। यह गाइड है, क़ानूनी या टैक्स सलाह नहीं: नियम बदलते हैं, इसलिए कुछ करने से पहले चार्टर्ड अकाउंटेंट या वकील से पुष्टि करें।",
  stepsTitle: "रास्ता, क़दम-दर-क़दम",
  steps: [
    {
      title: "कंपनी रजिस्टर करें और DPIIT मान्यता लें",
      body: "ज़्यादातर एग्रीटेक स्टार्टअप प्राइवेट लिमिटेड कंपनी रजिस्टर करते हैं और DPIIT मान्यता के लिए आवेदन करते हैं, जो मुफ़्त है और कृषि मंत्रालय के एग्री-स्टार्टअप कार्यक्रम समेत कई अनुदानों और टैक्स लाभों की शर्त है।",
    },
    {
      title: "किसी एग्रीबिज़नेस इनक्यूबेटर से जुड़ें",
      body: "RKVY के नवाचार और कृषि-उद्यमिता कार्यक्रम में एग्रीबिज़नेस इनक्यूबेटर (R-ABI) और मैनेज (MANAGE) व NIAM जैसे ज्ञान भागीदार स्टार्टअप के लिए आवेदन बुलाते हैं। चुने गए स्टार्टअप को आइडिया या प्री-सीड चरण में ₹5 लाख तक और सीड चरण में ₹25 लाख तक, प्रशिक्षण और मार्गदर्शन के साथ मिल सकता है।",
    },
    {
      title: "FPO के ज़रिए किसानों के साथ काम करें",
      body: "किसान उत्पादक संगठन किसानों को इनपुट ख़रीदने, उपज बेचने और सेवाएँ लेने के लिए एक साथ लाते हैं, इसलिए अक्सर यही एग्रीटेक स्टार्टअप का किसानों तक सबसे अच्छा रास्ता होते हैं। 10,000 FPO बनाने की योजना में हर FPO को तीन साल में ₹18 लाख तक प्रबंधन सहायता, प्रति किसान सदस्य ₹2,000 का बराबरी वाला इक्विटी अनुदान (₹15 लाख तक) और ₹2 करोड़ तक के परियोजना ऋण पर क्रेडिट गारंटी मिल सकती है।",
    },
    {
      title: "AIF ऋण से खेती का बुनियादी ढाँचा बनाएँ",
      body: "कृषि अवसंरचना कोष कटाई के बाद और खेत के पास की परियोजनाओं, जैसे गोदाम, कोल्ड चेन, छँटाई और ग्रेडिंग इकाइयों के लिए ऋण का समर्थन करता है। स्टार्टअप पात्र हैं: ₹2 करोड़ तक के ऋण पर सात साल तक हर साल 3% ब्याज छूट और क्रेडिट गारंटी मिलती है। आवेदन से पहले मौजूदा अंतिम तिथि देख लें।",
    },
    {
      title: "सही खाद्य लाइसेंस लें",
      body: "खाना बनाने, रखने, ढोने या बेचने वाले हर व्यक्ति को FSSAI रजिस्ट्रेशन या लाइसेंस चाहिए, जिसका आवेदन फ़ॉस्कॉस पोर्टल पर होता है। 1 अप्रैल 2026 से सीमाएँ हैं: ₹1.5 करोड़ टर्नओवर तक रजिस्ट्रेशन, ₹50 करोड़ तक राज्य लाइसेंस और उससे ऊपर केंद्रीय लाइसेंस; आयातकों और कुछ अन्य कारोबारों को आकार चाहे जो हो, केंद्रीय लाइसेंस चाहिए।",
    },
    {
      title: "इनपुट और ड्रोन के लाइसेंस जाँचें",
      body: "बीज, उर्वरक या कीटनाशक बेचने के लिए राज्य कृषि विभाग से डीलर लाइसेंस चाहिए, और नए कीटनाशकों को केंद्रीय कीटनाशक बोर्ड में पंजीकरण चाहिए। ड्रोन टाइप-प्रमाणित मॉडल का हो और डिजिटल स्काई प्लेटफ़ॉर्म पर दर्ज हो, उसे प्रमाणित रिमोट पायलट उड़ाए, और छिड़काव स्वीकृत फ़सल और मात्रा के अनुसार हो।",
    },
    {
      title: "खाद्य प्रसंस्करण के अनुदान देखें",
      body: "PMFME ने सूक्ष्म खाद्य प्रसंस्करण इकाइयों को परियोजना लागत की 35% ऋण-से-जुड़ी सब्सिडी (₹10 लाख तक) दी है, और FPO, स्वयं सहायता समूहों और सहकारी समितियों के साझा ढाँचे के लिए ₹3 करोड़ तक। 2026 में इसके विस्तार पर विचार चल रहा था, इसलिए देखें कि यह खुली है या नहीं।",
    },
    {
      title: "सही काग़ज़ात के साथ विदेश में बेचें",
      body: "निर्यातकों को DGFT से आयातक-निर्यातक कोड चाहिए। कई खेती और प्रसंस्कृत खाद्य उत्पादों के लिए APEDA में पंजीकरण भी चाहिए, और पौध उत्पादों के लिए वनस्पति संगरोध संगठन से पादप-स्वच्छता प्रमाणपत्र। ख़रीदार अपने बाज़ार के अवशेष और गुणवत्ता मानक भी जाँचेंगे।",
    },
  ],
  factsTitle: "एग्रीटेक संस्थापकों के लिए पैसा",
  facts: [
    { t: "एग्री-स्टार्टअप अनुदान (RKVY)", d: "एग्रीबिज़नेस इनक्यूबेटरों के ज़रिए आइडिया या प्री-सीड चरण में ₹5 लाख तक और सीड चरण में ₹25 लाख तक।" },
    { t: "एग्रीश्योर फ़ंड", d: "नाबार्ड और कृषि मंत्रालय का बनाया ₹750 करोड़ का फ़ंड, जिसे नैबवेंचर्स चलाता है; यह एग्री स्टार्टअप में सीधे और दूसरे वेंचर फ़ंडों के ज़रिए निवेश करता है।" },
    { t: "कृषि अवसंरचना कोष", d: "₹2 करोड़ तक के ऋण पर सात साल तक हर साल 3% ब्याज छूट, क्रेडिट गारंटी के साथ।" },
    { t: "बिना गिरवी ऋण", d: "CGTMSE की गारंटी सूक्ष्म और लघु उद्यमों के बैंक ऋण पर मिलती है, जिनमें उद्यम पर दर्ज खाद्य और कृषि कारोबार भी हैं।" },
  ],
  schemesTitle: "जाँचने लायक़ योजनाएँ",
  schemesLead: "योजना जाँच चलाकर देखें कि आप किनके पात्र हैं।",
  scanLink: "योजना जाँच चलाएँ",
  docsTitle: "एग्रीटेक स्टार्टअप के टेम्पलेट",
  guidesTitle: "एग्रीटेक संस्थापकों के लिए गाइड (अंग्रेज़ी में)",
  investorsTitle: "एग्रीटेक और फ़ूड में निवेशक",
  investorsBrowse: "इस सेक्टर के सभी निवेशक",
  investorsEmpty: "इस फ़ोकस वाले निवेशक अभी सूची में नहीं हैं।",
  sourcesTitle: "आधिकारिक स्रोत",
};

export const AGRITECH: SectorGuide = {
  key: "agritech",
  checkedOn: "2026-11-27",
  schemes: ["rkvy-agri-innovation", "dpiit-startup-recognition", "startup-india-seed-fund", "cgtmse", "credit-guarantee-scheme-startups", "income-tax-holiday-80iac"],
  docs: ["lean-canvas", "customer-interview-script", "go-to-market-plan", "quotation-and-invoice", "vendor-agreement", "grant-reporting-pack"],
  guides: ["customer-interviews-startup-guide", "first-customers-startup-sales", "startup-pricing-first-product", "unit-economics-for-startups", "gst-registration-for-startups"],
  investorSector: "agritech",
  sources: [
    { name: "Ministry of Agriculture and Farmers Welfare: agri-startups (RKVY)", url: "https://agriwelfare.gov.in" },
    { name: "Agriculture Infrastructure Fund", url: "https://agriinfra.dac.gov.in" },
    { name: "NABARD: AgriSURE fund", url: "https://www.nabard.org/agrisure.aspx" },
    { name: "FSSAI FoSCoS: food registration and licences", url: "https://foscos.fssai.gov.in" },
    { name: "Ministry of Food Processing Industries: PMFME", url: "https://pmfme.mofpi.gov.in" },
    { name: "APEDA: agricultural exports", url: "https://apeda.gov.in" },
    { name: "Digital Sky: drone registration", url: "https://digitalsky.dgca.gov.in" },
  ],
  text: { en, hi },
};
