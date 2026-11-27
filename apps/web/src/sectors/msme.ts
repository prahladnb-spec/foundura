/**
 * Small businesses and MSMEs guide (/sectors/msme). Written from official sources and general practice on
 * CHECKED_ON. English and Hindi only; other languages show the English. When the MSME limits, the
 * delayed-payment rules, TReDS, public procurement or PMEGP change, update both languages and CHECKED_ON.
 */
import type { SectorGuide, SectorText } from "./guide";

const en: SectorText = {
  breadcrumb: "Sector guides",
  title: "Running a small business or MSME in India",
  lead: "Udyam registration, the MSME size limits, getting paid on time, invoice finance, selling to government and the loans meant for small units, in one place.",
  checked: "Checked against official sources on {date}. This is a guide, not legal or tax advice: rules change, so confirm with a chartered accountant or lawyer before you act.",
  stepsTitle: "The path, step by step",
  steps: [
    {
      title: "Register on Udyam, free",
      body: "Udyam registration is how a business is recognised as a micro, small or medium enterprise. It is free and online on the Udyam portal, using the owner's Aadhaar and the business PAN; your GST and income tax details fill in automatically. Ignore websites that charge a fee for it.",
    },
    {
      title: "Know your category",
      body: "Your category depends on both your investment in plant, machinery or equipment and your turnover (the limits are in the box below). The category decides which schemes, loans and protections apply, and it is updated from your tax returns, so check it each year.",
    },
    {
      title: "Put payment terms in writing",
      body: "Micro and small suppliers must be paid within the agreed period, and never later than 45 days after the buyer accepts the goods or services; with no agreement, the limit is 15 days. Put the terms and your Udyam number on every quotation and invoice.",
    },
    {
      title: "Recover late payments",
      body: "A buyer who pays late owes compound interest, with monthly rests, at three times the bank rate notified by the RBI. Since 15 October 2025, new claims go to the MSME ODR portal, which takes the case to your state's MSE Facilitation Council for conciliation and, if needed, arbitration.",
    },
    {
      title: "Turn invoices into cash on TReDS",
      body: "On a TReDS platform (RBI-licensed exchanges such as RXIL, M1xchange, Invoicemart and C2treds) banks bid to pay your accepted invoices early, at a discount, without recourse to you. Companies with turnover above ₹250 crore and central public sector enterprises must be on TReDS, so many large buyers already are.",
    },
    {
      title: "Sell to government",
      body: "Central ministries and public sector enterprises must buy at least 25% of their goods and services from micro and small enterprises, including 4% from SC/ST-owned and 3% from women-owned units. Micro and small sellers on GeM are exempt from earnest money in eligible tenders and get purchase preference within 15% of the lowest price.",
    },
    {
      title: "Borrow with a guarantee, not collateral",
      body: "CGTMSE guarantees let banks lend to micro and small enterprises without collateral, and MUDRA loans cover the smallest units. To set up a new micro unit, PMEGP adds a subsidy of 15% to 35% of the project cost (up to ₹50 lakh for manufacturing, ₹20 lakh for services) on a bank loan.",
    },
    {
      title: "Keep the paperwork clean",
      body: "GST returns, TDS, labour registrations and, for companies, the half-yearly MSME-1 return on dues to micro and small suppliers. Clean books and on-time filings make loans, tenders and investor checks much faster.",
    },
  ],
  factsTitle: "MSME size limits, from 1 April 2025",
  facts: [
    { t: "Micro", d: "Investment up to ₹2.5 crore and turnover up to ₹10 crore." },
    { t: "Small", d: "Investment up to ₹25 crore and turnover up to ₹100 crore." },
    { t: "Medium", d: "Investment up to ₹125 crore and turnover up to ₹500 crore." },
    { t: "Late payment by a buyer", d: "Compound interest at three times the RBI bank rate. Buyers also cannot deduct a late payment to a micro or small supplier as an expense until it is paid (section 37(2)(g) of the Income-tax Act, 2025)." },
  ],
  factsNote: "Both limits apply: a business moves up a category if it crosses either one. Medium enterprises are not covered by the delayed-payment protection, which is for micro and small suppliers.",
  schemesTitle: "Schemes to check",
  schemesLead: "Run the Scheme Scan to see which you qualify for.",
  scanLink: "Run the Scheme Scan",
  docsTitle: "Templates for small businesses",
  guidesTitle: "Guides for small business founders",
  investorsTitle: "Investors",
  investorsBrowse: "All investors",
  investorsEmpty: "No investors are listed yet.",
  sourcesTitle: "Official sources",
};

const hi: SectorText = {
  breadcrumb: "सेक्टर गाइड",
  title: "भारत में छोटा कारोबार या MSME चलाना",
  lead: "उद्यम रजिस्ट्रेशन, MSME की आकार सीमाएँ, समय पर भुगतान पाना, इनवॉइस पर पैसा, सरकार को बेचना और छोटी इकाइयों के लिए बने ऋण, एक ही जगह।",
  checked: "{date} को आधिकारिक स्रोतों से मिलाया गया। यह गाइड है, क़ानूनी या टैक्स सलाह नहीं: नियम बदलते हैं, इसलिए कुछ करने से पहले चार्टर्ड अकाउंटेंट या वकील से पुष्टि करें।",
  stepsTitle: "रास्ता, क़दम-दर-क़दम",
  steps: [
    {
      title: "उद्यम पर मुफ़्त रजिस्ट्रेशन करें",
      body: "उद्यम रजिस्ट्रेशन से कारोबार सूक्ष्म, लघु या मध्यम उद्यम के रूप में पहचाना जाता है। यह उद्यम पोर्टल पर ऑनलाइन और मुफ़्त है, जिसमें मालिक का आधार और कारोबार का PAN लगता है; GST और आयकर का ब्योरा अपने-आप भर जाता है। इसके लिए फ़ीस माँगने वाली वेबसाइटों से बचें।",
    },
    {
      title: "अपनी श्रेणी जानें",
      body: "आपकी श्रेणी प्लांट, मशीनरी या उपकरण में निवेश और टर्नओवर, दोनों पर निर्भर है (सीमाएँ नीचे के बॉक्स में हैं)। श्रेणी तय करती है कि कौन-सी योजनाएँ, ऋण और सुरक्षाएँ लागू होंगी, और यह आपके टैक्स रिटर्न से अपडेट होती है, इसलिए हर साल जाँचें।",
    },
    {
      title: "भुगतान की शर्तें लिखित में रखें",
      body: "सूक्ष्म और लघु आपूर्तिकर्ताओं को तय अवधि में भुगतान होना चाहिए, और ख़रीदार के सामान या सेवा स्वीकार करने के 45 दिन से ज़्यादा देर कभी नहीं; कोई समझौता न हो तो सीमा 15 दिन है। हर कोटेशन और इनवॉइस पर शर्तें और अपना उद्यम नंबर लिखें।",
    },
    {
      title: "देर से आया भुगतान वसूलें",
      body: "देर से भुगतान करने वाला ख़रीदार RBI की अधिसूचित बैंक दर के तीन गुना पर, मासिक चक्रवृद्धि ब्याज देता है। 15 अक्टूबर 2025 से नए दावे MSME ODR पोर्टल पर जाते हैं, जो मामला आपके राज्य की सूक्ष्म और लघु उद्यम सुविधा परिषद को सुलह और ज़रूरत हो तो मध्यस्थता के लिए भेजता है।",
    },
    {
      title: "ट्रेड्स पर इनवॉइस को नक़द में बदलें",
      body: "ट्रेड्स (TReDS) प्लेटफ़ॉर्म पर (RBI से लाइसेंस पाए एक्सचेंज, जैसे RXIL, एम-वन-एक्सचेंज, इनवॉइसमार्ट और सी-टू-ट्रेड्स) बैंक आपके स्वीकार किए गए इनवॉइस का जल्दी, छूट पर भुगतान करने की बोली लगाते हैं, और जोखिम आप पर नहीं लौटता। ₹250 करोड़ से ज़्यादा टर्नओवर वाली कंपनियों और केंद्रीय सार्वजनिक उपक्रमों का ट्रेड्स पर होना ज़रूरी है, इसलिए कई बड़े ख़रीदार पहले से वहाँ हैं।",
    },
    {
      title: "सरकार को बेचें",
      body: "केंद्रीय मंत्रालयों और सार्वजनिक उपक्रमों को अपनी कम से कम 25% वस्तुएँ और सेवाएँ सूक्ष्म और लघु उद्यमों से ख़रीदनी होती हैं, जिसमें 4% अनुसूचित जाति/जनजाति के और 3% महिलाओं के स्वामित्व वाली इकाइयों से। GeM पर सूक्ष्म और लघु विक्रेताओं को पात्र टेंडरों में बयाना राशि से छूट और सबसे कम क़ीमत के 15% के भीतर ख़रीद में वरीयता मिलती है।",
    },
    {
      title: "गिरवी नहीं, गारंटी पर ऋण लें",
      body: "CGTMSE की गारंटी से बैंक सूक्ष्म और लघु उद्यमों को बिना गिरवी ऋण दे पाते हैं, और मुद्रा ऋण सबसे छोटी इकाइयों के लिए हैं। नई सूक्ष्म इकाई लगाने पर PMEGP बैंक ऋण के साथ परियोजना लागत की 15% से 35% सब्सिडी देता है (विनिर्माण में ₹50 लाख तक, सेवाओं में ₹20 लाख तक की परियोजना)।",
    },
    {
      title: "काग़ज़ात साफ़ रखें",
      body: "GST रिटर्न, TDS, श्रम रजिस्ट्रेशन और कंपनियों के लिए सूक्ष्म और लघु आपूर्तिकर्ताओं के बकाये पर छमाही MSME-1 रिटर्न। साफ़ खाते और समय पर फ़ाइलिंग से ऋण, टेंडर और निवेशकों की जाँच बहुत तेज़ होती है।",
    },
  ],
  factsTitle: "MSME की आकार सीमाएँ, 1 अप्रैल 2025 से",
  facts: [
    { t: "सूक्ष्म", d: "₹2.5 करोड़ तक निवेश और ₹10 करोड़ तक टर्नओवर।" },
    { t: "लघु", d: "₹25 करोड़ तक निवेश और ₹100 करोड़ तक टर्नओवर।" },
    { t: "मध्यम", d: "₹125 करोड़ तक निवेश और ₹500 करोड़ तक टर्नओवर।" },
    { t: "ख़रीदार का देर से भुगतान", d: "RBI बैंक दर के तीन गुना पर चक्रवृद्धि ब्याज। ख़रीदार सूक्ष्म या लघु आपूर्तिकर्ता को देर से किए भुगतान को ख़र्च के रूप में तब तक नहीं घटा सकते, जब तक भुगतान न हो जाए (आयकर अधिनियम, 2025 की धारा 37(2)(g))।" },
  ],
  factsNote: "दोनों सीमाएँ लागू होती हैं: किसी एक को पार करने पर कारोबार ऊपर की श्रेणी में चला जाता है। देर से भुगतान की सुरक्षा सूक्ष्म और लघु आपूर्तिकर्ताओं के लिए है, मध्यम उद्यमों के लिए नहीं।",
  schemesTitle: "जाँचने लायक़ योजनाएँ",
  schemesLead: "योजना जाँच चलाकर देखें कि आप किनके पात्र हैं।",
  scanLink: "योजना जाँच चलाएँ",
  docsTitle: "छोटे कारोबार के टेम्पलेट",
  guidesTitle: "छोटे कारोबार के संस्थापकों के लिए गाइड (अंग्रेज़ी में)",
  investorsTitle: "निवेशक",
  investorsBrowse: "सभी निवेशक",
  investorsEmpty: "अभी कोई निवेशक सूची में नहीं है।",
  sourcesTitle: "आधिकारिक स्रोत",
};

export const MSME: SectorGuide = {
  key: "msme",
  checkedOn: "2026-11-27",
  schemes: ["cgtmse", "pm-mudra-yojana", "stand-up-india", "public-procurement-relaxations", "dpiit-startup-recognition", "credit-guarantee-scheme-startups"],
  docs: ["quotation-and-invoice", "vendor-agreement", "customer-agreement", "financial-records-checklist", "business-plan-dpr", "hr-policies"],
  guides: ["gst-registration-for-startups", "company-compliance-calendar-india", "first-customers-startup-sales", "unit-economics-for-startups", "bootstrapping-or-raising-money"],
  sources: [
    { name: "Udyam registration portal", url: "https://udyamregistration.gov.in" },
    { name: "Ministry of MSME", url: "https://msme.gov.in" },
    { name: "MSME ODR portal: delayed payment claims", url: "https://odr.msme.gov.in" },
    { name: "Government e-Marketplace (GeM)", url: "https://gem.gov.in" },
    { name: "CGTMSE: credit guarantees", url: "https://www.cgtmse.in" },
    { name: "PMEGP e-portal (KVIC)", url: "https://www.kviconline.gov.in/pmegpeportal/" },
    { name: "Reserve Bank of India: TReDS", url: "https://www.rbi.org.in" },
  ],
  text: { en, hi },
};
