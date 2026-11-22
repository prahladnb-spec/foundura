/**
 * MedTech sector hub content. Researched from official sources on 22 Nov 2026 (see `sources`).
 * Regulatory steps follow the Medical Devices Rules, 2017 as published by CDSCO.
 * When rules change, update the text and `checkedOn` here.
 */

export type Goal = "prototype" | "study" | "make" | "import";
export type RiskClass = "A_nsnm" | "A" | "B" | "C" | "D" | "unsure";

/** Which steps apply. Keys map to text in `hubText[lang].steps`. */
export function pathwaySteps(goal: Goal, cls: RiskClass): StepKey[] {
  const steps: StepKey[] = [cls === "unsure" ? "classifyUnsure" : "classify"];
  if (goal === "prototype") steps.push("testLicence", "testing", "qms");
  if (goal === "study") steps.push("testLicence", "clinical", "studyHelp");
  if (goal === "make") {
    if (cls === "A_nsnm") steps.push("registerNsnm");
    else if (cls === "A" || cls === "B") steps.push("stateLicence");
    else if (cls === "C" || cls === "D") steps.push("cdscoLicence");
    else steps.push("stateLicence", "cdscoLicence");
    if (cls !== "A_nsnm") steps.push("qms", "noPredicate");
  }
  if (goal === "import") steps.push(cls === "A_nsnm" ? "registerNsnm" : "importLicence");
  steps.push("portal");
  return steps;
}

export type StepKey =
  | "classify"
  | "classifyUnsure"
  | "testLicence"
  | "testing"
  | "qms"
  | "clinical"
  | "studyHelp"
  | "registerNsnm"
  | "stateLicence"
  | "cdscoLicence"
  | "noPredicate"
  | "importLicence"
  | "portal";

/** Schemes from the catalogue to show on the hub, in this order. */
export const MEDTECH_SCHEMES = [
  "birac-big",
  "nidhi-prayas",
  "prip-pharma-medtech",
  "smdi-clinical-studies-support",
  "maha-medtech-mission",
  "pli-medical-devices-2",
  "startup-india-seed-fund",
];

export const CHECKED_ON = "2026-11-22";

export const SOURCES = [
  {
    name: "CDSCO: regulatory pathway under the Medical Devices Rules, 2017",
    url: "https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device/RegulatoryMDR-2017.pdf",
  },
  { name: "CDSCO: Medical Devices frequently asked questions (2024)", url: "https://www.cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/MDfAq24.pdf" },
  { name: "CDSCO Medical Devices online portal", url: "https://cdscomdonline.gov.in/" },
  { name: "CDSCO startup and innovation help (PRO)", url: "https://cdsco.gov.in/opencms/opencms/en/PRO/" },
  { name: "ICMR MedTech Mitra", url: "https://medtechmitra.icmr.org.in/" },
  { name: "Department of Pharmaceuticals schemes", url: "https://pharma-dept.gov.in/schemes" },
  { name: "ANRF MAHA MedTech Mission", url: "https://anrfonline.in/ANRF/maha_medTech" },
];

type Step = { title: string; body: string; forms?: string };

const en = {
  metaTitle: "MedTech startup guide: CDSCO licences, funding and support",
  metaDescription:
    "For medical device and diagnostics founders in India: which CDSCO licence you need, the forms, who decides, grants for clinical studies and R&D, and who can help.",
  breadcrumb: "Sector guides",
  title: "Building a medical device in India",
  lead: "The regulatory path, the money and the help available to medical device and diagnostics founders, in one place.",
  checked: "Checked against official sources on {date}. This is a guide, not legal advice: rules and forms change, so confirm with CDSCO before you file.",
  finder: {
    title: "Find your regulatory path",
    lead: "Answer two questions to see the steps, forms and who decides.",
    goal: "What are you doing now?",
    goals: {
      prototype: "Building a prototype",
      study: "Planning clinical studies",
      make: "Ready to make and sell in India",
      import: "Importing a device to sell",
    },
    cls: "What is the device's risk class?",
    classes: {
      A_nsnm: "Class A, not sterile and no measuring function",
      A: "Class A (low risk)",
      B: "Class B (low to moderate)",
      C: "Class C (moderate to high)",
      D: "Class D (high risk)",
      unsure: "Not sure yet",
    },
    examples: "Examples CDSCO gives: Class A, a thermometer; Class B, a hypodermic needle; Class C, a lung ventilator; Class D, a heart valve.",
    yourSteps: "Your steps",
    whoDecides: "Who decides",
    forms: "Forms",
  },
  steps: {
    classify: {
      title: "Confirm the class with CDSCO",
      body: "The class decides who licenses you and what evidence you need. Check the device against CDSCO's published classification lists. CDSCO has reportedly told state authorities to wait for its classification before licensing Class A and B devices, so allow time for it.",
    },
    classifyUnsure: {
      title: "Work out the risk class first",
      body: "Every application starts with the class. Look for your device type in CDSCO's classification lists on the Medical Devices portal. If it isn't listed, or you're unsure, ask CDSCO's startup and innovation desk before you build your plan around a guess: a class dispute discovered mid-application resets the clock.",
    },
    testLicence: {
      title: "Get a test licence to make or import units for testing",
      body: "Units made for testing, evaluation, demonstration, training or clinical investigation need a test licence from CDSCO, for every class.",
      forms: "Make: MD-12 → licence MD-13. Import: MD-16 → licence MD-17.",
    },
    testing: {
      title: "Test with a CDSCO-registered lab",
      body: "Bench, electrical, software and performance tests can be done at a Medical Device Testing Laboratory registered with CDSCO. The list is on the CDSCO website and changes over time.",
    },
    qms: {
      title: "Set up your quality management system",
      body: "Manufacturing sites must follow the Fifth Schedule of the Medical Devices Rules (aligned with ISO 13485). Units used on people in a clinical investigation must also come from a site with a compliant quality system.",
    },
    clinical: {
      title: "Get permission for the clinical investigation",
      body: "Studies on people with an investigational device need CDSCO's permission and ethics committee approval. IVDs follow the clinical performance evaluation route instead.",
      forms: "Device: MD-22 → permission MD-23. IVD: MD-24 → permission MD-25.",
    },
    studyHelp: {
      title: "Get help designing and paying for studies",
      body: "ICMR's MedTech Mitra helps innovators with clinical evaluation, connecting them to ICMR's preclinical and clinical trial networks, and with regulatory facilitation. The Department of Pharmaceuticals' clinical studies scheme reimburses up to ₹5 crore of study costs when a call is open (see funding below).",
    },
    registerNsnm: {
      title: "Register the device (no licence needed)",
      body: "Class A devices that are not sterile and have no measuring function are exempt from manufacturing and import licences, but the manufacturer or importer must register them on CDSCO's online system. Check your device is on CDSCO's list of such devices.",
    },
    stateLicence: {
      title: "Class A or B: manufacturing licence from your state",
      body: "Your State Licensing Authority (state drug controller) grants manufacturing licences for Class A and B devices.",
      forms: "Own site: MD-3 → licence MD-5. Loan licence (someone else's site): MD-4 → MD-6.",
    },
    cdscoLicence: {
      title: "Class C or D: manufacturing licence from CDSCO",
      body: "CDSCO (the Central Licensing Authority) grants manufacturing licences for Class C and D devices.",
      forms: "Own site: MD-7 → licence MD-9. Loan licence: MD-8 → MD-10.",
    },
    noPredicate: {
      title: "New kind of device? Plan for clinical evidence",
      body: "If no similar device is already approved (no predicate), CDSCO needs a clinical investigation first and then grants permission to make or import it.",
      forms: "After the investigation: MD-26 → permission MD-27.",
    },
    importLicence: {
      title: "Import licence from CDSCO",
      body: "CDSCO licenses imports of every class. You need an authorised agent in India.",
      forms: "MD-14 → licence MD-15.",
    },
    portal: {
      title: "File online, and ask when unsure",
      body: "All applications go through CDSCO's Medical Devices online portal (also reachable through the National Single Window System). CDSCO's startup and innovation desk answers questions about the regulatory path at startupinnov@cdsco.nic.in.",
    },
  } satisfies Record<StepKey, Step>,
  who: { state: "State Licensing Authority", cdsco: "CDSCO", either: "State (Class A/B) or CDSCO (Class C/D)" },
  help: {
    title: "Who can help",
    items: [
      {
        name: "ICMR MedTech Mitra",
        body: "Handholding for clinical evaluation, regulatory facilitation and uptake of new products, run by ICMR with CDSCO and NITI Aayog.",
        url: "https://medtechmitra.icmr.org.in/",
      },
      {
        name: "CDSCO startup and innovation desk",
        body: "Guidance on the regulatory pathway for startups and innovators. Email startupinnov@cdsco.nic.in.",
        url: "https://cdsco.gov.in/opencms/opencms/en/PRO/",
      },
      {
        name: "ICMR Patent Mitra",
        body: "Help with protecting and transferring intellectual property for health technologies.",
        url: "https://intent.icmr.org.in/quickLinks.html",
      },
      {
        name: "BIRAC",
        body: "Department of Biotechnology's startup funding programmes, including the Biotechnology Ignition Grant.",
        url: "https://birac.nic.in/",
      },
    ],
  },
  money: {
    title: "Funding for MedTech",
    lead: "Grants and schemes for medical devices and diagnostics. Each page shows who qualifies and where to apply.",
    check: "Check which ones you qualify for",
  },
  investors: {
    title: "Investors backing MedTech",
    empty: "No MedTech investors listed yet. They're joining now.",
    browse: "All MedTech investors",
  },
  events: { title: "Health and MedTech events", empty: "No health or MedTech events listed right now.", all: "All events" },
  sources: "Sources",
};

const hi: typeof en = {
  metaTitle: "मेडटेक स्टार्टअप गाइड: CDSCO लाइसेंस, फ़ंडिंग और मदद",
  metaDescription:
    "भारत में चिकित्सा उपकरण और डायग्नॉस्टिक्स के संस्थापकों के लिए: कौन-सा CDSCO लाइसेंस चाहिए, फ़ॉर्म, फ़ैसला कौन करता है, क्लिनिकल अध्ययन और R&D के लिए अनुदान, और कौन मदद कर सकता है।",
  breadcrumb: "क्षेत्र गाइड",
  title: "भारत में चिकित्सा उपकरण बनाना",
  lead: "चिकित्सा उपकरण और डायग्नॉस्टिक्स के संस्थापकों के लिए नियामक रास्ता, पैसा और मिलने वाली मदद, एक ही जगह।",
  checked:
    "{date} को आधिकारिक स्रोतों से मिलाकर जाँचा गया। यह एक मार्गदर्शन है, क़ानूनी सलाह नहीं: नियम और फ़ॉर्म बदलते रहते हैं, इसलिए आवेदन से पहले CDSCO से पुष्टि करें।",
  finder: {
    title: "अपना नियामक रास्ता जानें",
    lead: "दो सवालों के जवाब दें और देखें कि कौन-से क़दम, फ़ॉर्म और फ़ैसला कौन करता है।",
    goal: "आप अभी क्या कर रहे हैं?",
    goals: {
      prototype: "प्रोटोटाइप बना रहे हैं",
      study: "क्लिनिकल अध्ययन की योजना बना रहे हैं",
      make: "भारत में बनाकर बेचने के लिए तैयार",
      import: "बेचने के लिए उपकरण आयात कर रहे हैं",
    },
    cls: "उपकरण की जोखिम श्रेणी (क्लास) क्या है?",
    classes: {
      A_nsnm: "क्लास A, स्टेराइल नहीं और मापने का काम नहीं करता",
      A: "क्लास A (कम जोखिम)",
      B: "क्लास B (कम से मध्यम)",
      C: "क्लास C (मध्यम से ऊँचा)",
      D: "क्लास D (ऊँचा जोखिम)",
      unsure: "अभी पता नहीं",
    },
    examples: "CDSCO के दिए उदाहरण: क्लास A, थर्मामीटर; क्लास B, हाइपोडर्मिक सुई; क्लास C, लंग वेंटिलेटर; क्लास D, हृदय वाल्व।",
    yourSteps: "आपके क़दम",
    whoDecides: "फ़ैसला कौन करता है",
    forms: "फ़ॉर्म",
  },
  steps: {
    classify: {
      title: "CDSCO से क्लास की पुष्टि करें",
      body: "क्लास से तय होता है कि आपको लाइसेंस कौन देगा और कौन-से सबूत चाहिए। अपने उपकरण को CDSCO की प्रकाशित वर्गीकरण सूचियों से मिलाएँ। ख़बरों के मुताबिक CDSCO ने राज्य प्राधिकरणों से कहा है कि क्लास A और B उपकरणों को लाइसेंस देने से पहले उसके वर्गीकरण का इंतज़ार करें, इसलिए इसके लिए समय रखें।",
    },
    classifyUnsure: {
      title: "पहले जोखिम श्रेणी तय करें",
      body: "हर आवेदन क्लास से शुरू होता है। मेडिकल डिवाइस पोर्टल पर CDSCO की वर्गीकरण सूचियों में अपने उपकरण का प्रकार खोजें। अगर वह सूची में नहीं है, या आप पक्का नहीं हैं, तो अंदाज़े पर योजना बनाने से पहले CDSCO के स्टार्टअप और इनोवेशन डेस्क से पूछें: आवेदन के बीच में क्लास पर विवाद निकले तो सारा समय फिर से शुरू हो जाता है।",
    },
    testLicence: {
      title: "जाँच के लिए यूनिट बनाने या आयात करने का टेस्ट लाइसेंस लें",
      body: "जाँच, मूल्यांकन, प्रदर्शन, प्रशिक्षण या क्लिनिकल इन्वेस्टिगेशन के लिए बनी यूनिटों के लिए हर क्लास में CDSCO से टेस्ट लाइसेंस चाहिए।",
      forms: "बनाने के लिए: MD-12 → लाइसेंस MD-13। आयात के लिए: MD-16 → लाइसेंस MD-17।",
    },
    testing: {
      title: "CDSCO में पंजीकृत लैब में जाँच कराएँ",
      body: "बेंच, इलेक्ट्रिकल, सॉफ़्टवेयर और परफ़ॉर्मेंस जाँच CDSCO में पंजीकृत मेडिकल डिवाइस टेस्टिंग लैबोरेटरी में हो सकती है। सूची CDSCO की वेबसाइट पर है और समय के साथ बदलती है।",
    },
    qms: {
      title: "अपना गुणवत्ता प्रबंधन सिस्टम बनाएँ",
      body: "विनिर्माण स्थलों को मेडिकल डिवाइस नियमों की पाँचवीं अनुसूची (ISO 13485 के अनुरूप) का पालन करना होता है। क्लिनिकल इन्वेस्टिगेशन में लोगों पर इस्तेमाल होने वाली यूनिटें भी ऐसी जगह से आनी चाहिए जहाँ यह गुणवत्ता सिस्टम लागू हो।",
    },
    clinical: {
      title: "क्लिनिकल इन्वेस्टिगेशन की अनुमति लें",
      body: "किसी जाँचाधीन उपकरण के साथ लोगों पर अध्ययन के लिए CDSCO की अनुमति और एथिक्स कमेटी की मंज़ूरी चाहिए। IVD के लिए इसकी जगह क्लिनिकल परफ़ॉर्मेंस इवैल्यूएशन का रास्ता है।",
      forms: "उपकरण: MD-22 → अनुमति MD-23। IVD: MD-24 → अनुमति MD-25।",
    },
    studyHelp: {
      title: "अध्ययन की रूपरेखा और ख़र्च में मदद लें",
      body: "ICMR का मेडटेक मित्र नवाचारियों को क्लिनिकल मूल्यांकन में मदद करता है, उन्हें ICMR के प्री-क्लिनिकल और क्लिनिकल ट्रायल नेटवर्क से जोड़ता है, और नियामक प्रक्रिया में सहायता देता है। कॉल खुली होने पर फ़ार्मास्युटिकल्स विभाग की क्लिनिकल अध्ययन योजना अध्ययन की लागत में से ₹5 करोड़ तक की प्रतिपूर्ति करती है (नीचे फ़ंडिंग देखें)।",
    },
    registerNsnm: {
      title: "उपकरण का पंजीकरण कराएँ (लाइसेंस की ज़रूरत नहीं)",
      body: "जो क्लास A उपकरण स्टेराइल नहीं हैं और मापने का काम नहीं करते, उन्हें विनिर्माण और आयात लाइसेंस से छूट है, लेकिन निर्माता या आयातक को उन्हें CDSCO के ऑनलाइन सिस्टम पर पंजीकृत कराना होता है। जाँच लें कि आपका उपकरण CDSCO की ऐसे उपकरणों की सूची में है।",
    },
    stateLicence: {
      title: "क्लास A या B: अपने राज्य से विनिर्माण लाइसेंस",
      body: "क्लास A और B उपकरणों के लिए विनिर्माण लाइसेंस आपका राज्य लाइसेंसिंग प्राधिकरण (राज्य ड्रग कंट्रोलर) देता है।",
      forms: "अपनी जगह: MD-3 → लाइसेंस MD-5। लोन लाइसेंस (किसी और की जगह): MD-4 → MD-6।",
    },
    cdscoLicence: {
      title: "क्लास C या D: CDSCO से विनिर्माण लाइसेंस",
      body: "क्लास C और D उपकरणों के लिए विनिर्माण लाइसेंस CDSCO (केंद्रीय लाइसेंसिंग प्राधिकरण) देता है।",
      forms: "अपनी जगह: MD-7 → लाइसेंस MD-9। लोन लाइसेंस: MD-8 → MD-10।",
    },
    noPredicate: {
      title: "नए तरह का उपकरण? क्लिनिकल सबूत की तैयारी करें",
      body: "अगर कोई मिलता-जुलता उपकरण पहले से मंज़ूर नहीं है (कोई प्रेडिकेट नहीं), तो CDSCO पहले क्लिनिकल इन्वेस्टिगेशन माँगता है और फिर उसे बनाने या आयात करने की अनुमति देता है।",
      forms: "इन्वेस्टिगेशन के बाद: MD-26 → अनुमति MD-27।",
    },
    importLicence: {
      title: "CDSCO से आयात लाइसेंस",
      body: "हर क्लास के आयात के लिए लाइसेंस CDSCO देता है। आपको भारत में एक अधिकृत एजेंट चाहिए।",
      forms: "MD-14 → लाइसेंस MD-15।",
    },
    portal: {
      title: "ऑनलाइन आवेदन करें, और शक हो तो पूछें",
      body: "सभी आवेदन CDSCO के मेडिकल डिवाइस ऑनलाइन पोर्टल से होते हैं (नेशनल सिंगल विंडो सिस्टम से भी पहुँच सकते हैं)। CDSCO का स्टार्टअप और इनोवेशन डेस्क नियामक रास्ते के सवालों के जवाब startupinnov@cdsco.nic.in पर देता है।",
    },
  },
  who: { state: "राज्य लाइसेंसिंग प्राधिकरण", cdsco: "CDSCO", either: "राज्य (क्लास A/B) या CDSCO (क्लास C/D)" },
  help: {
    title: "कौन मदद कर सकता है",
    items: [
      {
        name: "ICMR मेडटेक मित्र",
        body: "नए उत्पादों के क्लिनिकल मूल्यांकन, नियामक प्रक्रिया और अपनाए जाने में मार्गदर्शन, जिसे ICMR, CDSCO और नीति आयोग के साथ चलाता है।",
        url: "https://medtechmitra.icmr.org.in/",
      },
      {
        name: "CDSCO स्टार्टअप और इनोवेशन डेस्क",
        body: "स्टार्टअप और नवाचारियों के लिए नियामक रास्ते पर मार्गदर्शन। startupinnov@cdsco.nic.in पर ईमेल करें।",
        url: "https://cdsco.gov.in/opencms/opencms/en/PRO/",
      },
      {
        name: "ICMR पेटेंट मित्र",
        body: "स्वास्थ्य तकनीकों की बौद्धिक संपदा की सुरक्षा और हस्तांतरण में मदद।",
        url: "https://intent.icmr.org.in/quickLinks.html",
      },
      {
        name: "BIRAC",
        body: "जैव प्रौद्योगिकी विभाग के स्टार्टअप फ़ंडिंग कार्यक्रम, जिनमें बायोटेक्नोलॉजी इग्निशन ग्रांट भी है।",
        url: "https://birac.nic.in/",
      },
    ],
  },
  money: {
    title: "मेडटेक के लिए फ़ंडिंग",
    lead: "चिकित्सा उपकरणों और डायग्नॉस्टिक्स के लिए अनुदान और योजनाएँ। हर पेज पर लिखा है कि कौन योग्य है और कहाँ आवेदन करें।",
    check: "देखें आप किनके लिए योग्य हैं",
  },
  investors: {
    title: "मेडटेक में निवेश करने वाले",
    empty: "अभी कोई मेडटेक निवेशक सूची में नहीं है। वे अभी जुड़ रहे हैं।",
    browse: "सभी मेडटेक निवेशक",
  },
  events: { title: "स्वास्थ्य और मेडटेक कार्यक्रम", empty: "अभी कोई स्वास्थ्य या मेडटेक कार्यक्रम सूची में नहीं है।", all: "सभी कार्यक्रम" },
  sources: "स्रोत",
};

export const hubText = { en, hi };
export type HubText = typeof en;

/** Who decides each step, by class. */
export function whoDecides(key: StepKey, _cls: RiskClass, t: HubText): string | null {
  if (key === "stateLicence") return t.who.state;
  if (key === "cdscoLicence" || key === "testLicence" || key === "clinical" || key === "noPredicate" || key === "importLicence" || key === "registerNsnm") {
    return t.who.cdsco;
  }
  if (key === "classify" || key === "classifyUnsure") return t.who.cdsco;
  return null;
}
