import type { Locale } from "@foundura/shared";

/**
 * Wording of every email Foundura sends, in each language. Hindi mirrors English; both are plain text.
 * Links go to the site in the reader's language (Hindi pages live under /hi).
 */

export function siteLink(site: string, locale: Locale, path: string): string {
  return `${site}${locale === "hi" ? (path === "/" ? "/hi" : `/hi${path}`) : path}`;
}

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hi: ["जन॰", "फ़र॰", "मार्च", "अप्रैल", "मई", "जून", "जुल॰", "अग॰", "सित॰", "अक्टू॰", "नव॰", "दिस॰"],
};

/** "2026-12-02" → "2 Dec" / "2 दिस॰" */
export function shortDate(iso: string, locale: Locale): string {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[locale][m - 1]}`;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many).replace("{n}", String(n));

export const T = {
  en: {
    signIn: (code: string) => ({
      subject: `${code} is your Foundura sign-in code`,
      text: `Your Foundura sign-in code is ${code}. It expires in 10 minutes. If you did not ask for it, ignore this email.`,
    }),
    introRequest: (startup: string, score: number, link: string) => ({
      subject: `New intro request from ${startup} (${score}% match)`,
      text: `${startup} would like an introduction.\n\nRead their message and decide on Foundura: ${link}\n\nYour email is shared only if you accept.`,
    }),
    introAccepted: (who: string, startup: string, link: string) => ({
      subject: `${who} accepted your intro request`,
      text: `Good news: ${who} accepted your intro request for ${startup}. Their contact email is now on your dashboard: ${link}`,
    }),
    introDeclined: (who: string, startup: string, link: string) => ({
      subject: `Update on your intro request to ${who}`,
      text: `${who} has decided not to take your intro request for ${startup} forward. Your other matches are on your dashboard: ${link}`,
    }),
    digest: {
      subjectBase: "Your Foundura week",
      qualify: (n: number) => plural(n, "{n} scheme you qualify for", "{n} schemes you qualify for"),
      worthChecking: (n: number) => plural(n, "{n} scheme worth checking", "{n} schemes worth checking"),
      deadlines: (n: number) => plural(n, "{n} deadline soon", "{n} deadlines soon"),
      policy: (n: number) => plural(n, "{n} policy update", "{n} policy updates"),
      hi: "Hi,",
      introFor: (name: string) => `Here's what's new for ${name} this week.`,
      introGeneral: "Here's what's new on Foundura this week.",
      addProfile: "Add your startup profile to see which schemes you qualify for:",
      newForYou: "New for you",
      youQualify: "you qualify",
      youMay: (n: number) => plural(n, "you may qualify, {n} thing to confirm", "you may qualify, {n} things to confirm"),
      more: (n: number, link: string) => `- and ${n} more on your dashboard: ${link}`,
      updated: "Updated since last week",
      checkedOn: (d: string) => `details checked on ${d}`,
      changed: "details changed",
      comingUp: "Coming up in the next two weeks",
      applyBy: (d: string) => `apply by ${d}`,
      starts: (d: string) => `starts ${d}`,
      unconfirmed: " (dates not yet confirmed)",
      policyNews: "Policy news",
      guides: "New founder guides",
      minRead: (n: number) => `${n} min read`,
      inEnglish: "",
      confirm: "Scheme details are summaries. Always confirm on the official source before you apply.",
      why: "You get this because you turned on scheme and deadline alerts.",
      stop: (link: string) => `Stop these emails: ${link}`,
      money: "Foundura never handles money and will never ask you to pay to apply for a scheme.",
    },
    reminder: (site: (p: string) => string, version: string) => ({
      subject: "Your yearly reminder of Foundura's terms and privacy notice",
      text: [
        "Hi,",
        "",
        "Once a year we remind everyone with a Foundura account of the rules we all work by.",
        "",
        `Terms of use: ${site("/terms")}`,
        `Privacy and your data: ${site("/privacy")}`,
        `(current version ${version})`,
        "",
        "The short version:",
        "- Foundura is free and never handles money. We will never ask you to pay to apply for a scheme.",
        "- Scheme results are a guide. Always confirm on the official source before you apply.",
        "- Your turnover, funding and shareholding are never shown publicly.",
        "- Investors see your profile only if you've made it public and switched on investor visibility.",
        `- You can download or delete your data at any time: ${site("/dashboard")}`,
        "",
        "Questions or complaints go to our grievance officer, listed on the privacy page.",
        "",
        "--",
        "This is a service notice sent to every account holder once a year.",
      ].join("\n"),
    }),
  },
  hi: {
    signIn: (code: string) => ({
      subject: `${code} आपका Foundura साइन-इन कोड है`,
      text: `आपका Foundura साइन-इन कोड ${code} है। यह 10 मिनट में ख़त्म हो जाएगा। अगर आपने यह कोड नहीं माँगा, तो इस ईमेल को अनदेखा करें।`,
    }),
    introRequest: (startup: string, score: number, link: string) => ({
      subject: `${startup} की ओर से नया परिचय अनुरोध (${score}% मिलान)`,
      text: `${startup} आपसे परिचय चाहता है।\n\nउनका संदेश पढ़ें और Foundura पर फ़ैसला करें: ${link}\n\nआपका ईमेल तभी साझा होगा जब आप स्वीकार करेंगे।`,
    }),
    introAccepted: (who: string, startup: string, link: string) => ({
      subject: `${who} ने आपका परिचय अनुरोध स्वीकार किया`,
      text: `अच्छी ख़बर: ${who} ने ${startup} के लिए आपका परिचय अनुरोध स्वीकार कर लिया है। उनका संपर्क ईमेल अब आपके डैशबोर्ड पर है: ${link}`,
    }),
    introDeclined: (who: string, startup: string, link: string) => ({
      subject: `${who} को भेजे परिचय अनुरोध पर अपडेट`,
      text: `${who} ने ${startup} के लिए आपके परिचय अनुरोध पर आगे न बढ़ने का फ़ैसला किया है। आपके बाक़ी मिलान आपके डैशबोर्ड पर हैं: ${link}`,
    }),
    digest: {
      subjectBase: "आपका Foundura हफ़्ता",
      qualify: (n: number) => plural(n, "{n} योजना जिसके लिए आप योग्य हैं", "{n} योजनाएँ जिनके लिए आप योग्य हैं"),
      worthChecking: (n: number) => plural(n, "{n} योजना जो देखने लायक है", "{n} योजनाएँ जो देखने लायक हैं"),
      deadlines: (n: number) => `${n} अंतिम तिथि जल्द`,
      policy: (n: number) => `${n} नीति अपडेट`,
      hi: "नमस्ते,",
      introFor: (name: string) => `इस हफ़्ते ${name} के लिए क्या नया है।`,
      introGeneral: "इस हफ़्ते Foundura पर क्या नया है।",
      addProfile: "आप किन योजनाओं के लिए योग्य हैं, यह देखने के लिए अपनी स्टार्टअप प्रोफ़ाइल जोड़ें:",
      newForYou: "आपके लिए नया",
      youQualify: "आप योग्य हैं",
      youMay: (n: number) => `आप योग्य हो सकते हैं, ${n} बात की पुष्टि बाक़ी`,
      more: (n: number, link: string) => `- और ${n} आपके डैशबोर्ड पर: ${link}`,
      updated: "पिछले हफ़्ते से बदलाव",
      checkedOn: (d: string) => `विवरण ${d} को जाँचा गया`,
      changed: "विवरण बदला",
      comingUp: "अगले दो हफ़्तों में",
      applyBy: (d: string) => `${d} तक आवेदन करें`,
      starts: (d: string) => `${d} से शुरू`,
      unconfirmed: " (तारीख़ों की अभी पुष्टि नहीं)",
      policyNews: "नीति समाचार",
      guides: "संस्थापकों के लिए नई गाइड",
      minRead: (n: number) => `${n} मिनट में पढ़ें`,
      inEnglish: "योजनाओं के नाम, कार्यक्रम, नीति समाचार और गाइड अभी अंग्रेज़ी में हैं।",
      confirm: "योजनाओं का विवरण सारांश है। आवेदन से पहले आधिकारिक स्रोत पर ज़रूर पुष्टि करें।",
      why: "यह ईमेल आपको इसलिए मिल रहा है क्योंकि आपने योजना और अंतिम तिथि अलर्ट चालू किए हैं।",
      stop: (link: string) => `ये ईमेल बंद करें: ${link}`,
      money: "Foundura कभी पैसों का लेन-देन नहीं करता और योजना में आवेदन के लिए आपसे कभी पैसे नहीं माँगेगा।",
    },
    reminder: (site: (p: string) => string, version: string) => ({
      subject: "Foundura की शर्तों और गोपनीयता सूचना की सालाना याद",
      text: [
        "नमस्ते,",
        "",
        "साल में एक बार हम Foundura के हर खाताधारक को उन नियमों की याद दिलाते हैं जिन पर हम सब चलते हैं।",
        "",
        `उपयोग की शर्तें: ${site("/terms")}`,
        `गोपनीयता और आपका डेटा: ${site("/privacy")}`,
        `(मौजूदा संस्करण ${version})`,
        "",
        "संक्षेप में:",
        "- Foundura मुफ़्त है और कभी पैसों का लेन-देन नहीं करता। हम योजना में आवेदन के लिए आपसे कभी पैसे नहीं माँगेंगे।",
        "- योजना जाँच के नतीजे एक मार्गदर्शन हैं। आवेदन से पहले आधिकारिक स्रोत पर ज़रूर पुष्टि करें।",
        "- आपका टर्नओवर, फ़ंडिंग और शेयरहोल्डिंग कभी सार्वजनिक नहीं दिखते।",
        "- निवेशक आपकी प्रोफ़ाइल तभी देखते हैं जब आपने उसे सार्वजनिक किया हो और निवेशकों को दिखाने का विकल्प चालू किया हो।",
        `- आप कभी भी अपना डेटा डाउनलोड कर सकते हैं या हटा सकते हैं: ${site("/dashboard")}`,
        "",
        "सवाल या शिकायत हमारे शिकायत अधिकारी को भेजें, जिनका विवरण गोपनीयता पेज पर है।",
        "",
        "--",
        "यह सेवा सूचना हर खाताधारक को साल में एक बार भेजी जाती है।",
      ].join("\n"),
    }),
  },
} satisfies Record<Locale, unknown>;

export const tFor = (locale: string | null | undefined) => T[locale === "hi" ? "hi" : "en"];
