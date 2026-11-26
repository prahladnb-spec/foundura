import { CITIES, type City } from "@foundura/shared/constants";
import type { Lang } from "../i18n/config";

/**
 * The city pages (/cities/[city]). Each city gathers what Foundura already holds about it: support
 * organisations and funders based there (matched on the English `base` text of directory entries),
 * upcoming events in the city, and startups that chose it on their profile. Names are in every
 * interface language. Client-safe: the dashboard's city menu uses the names too.
 */
export type CityInfo = {
  id: City;
  state: (typeof CITIES)[number]["state"];
  /** Matches the city in directory `base` text and event cities (English spellings and old names). */
  match: RegExp;
  names: Record<Lang, string>;
};

export const CITY_INFO: CityInfo[] = [
  {
    id: "bengaluru",
    state: "KA",
    match: /\b(bengaluru|bangalore)\b/i,
    names: { en: "Bengaluru", hi: "बेंगलुरु", mr: "बेंगळुरू", kn: "ಬೆಂಗಳೂರು", ta: "பெங்களூரு", te: "బెంగళూరు", gu: "બેંગલુરુ", bn: "বেঙ্গালুরু", ml: "ബെംഗളൂരു", es: "Bengaluru", de: "Bengaluru", fr: "Bangalore", pt: "Bangalore", ar: "بنغالور", he: "בנגלור", ja: "ベンガルール" },
  },
  {
    id: "delhi-ncr",
    state: "DL",
    match: /\b(new delhi|delhi|gurugram|gurgaon|noida|greater noida|ghaziabad|faridabad)\b/i,
    names: { en: "Delhi NCR", hi: "दिल्ली एनसीआर", mr: "दिल्ली एनसीआर", kn: "ದೆಹಲಿ ಎನ್‌ಸಿಆರ್", ta: "டெல்லி என்சிஆர்", te: "ఢిల్లీ ఎన్‌సీఆర్", gu: "દિલ્હી એનસીઆર", bn: "দিল্লি এনসিআর", ml: "ഡൽഹി NCR", es: "Delhi NCR", de: "Delhi NCR", fr: "Delhi NCR", pt: "Délhi NCR", ar: "دلهي الكبرى", he: "אזור דלהי", ja: "デリー首都圏" },
  },
  {
    id: "mumbai",
    state: "MH",
    match: /\b(mumbai|bombay|navi mumbai|thane)\b/i,
    names: { en: "Mumbai", hi: "मुंबई", mr: "मुंबई", kn: "ಮುಂಬೈ", ta: "மும்பை", te: "ముంబై", gu: "મુંબઈ", bn: "মুম্বাই", ml: "മുംബൈ", es: "Bombay", de: "Mumbai", fr: "Bombay", pt: "Mumbai", ar: "مومباي", he: "מומבאי", ja: "ムンバイ" },
  },
  {
    id: "hyderabad",
    state: "TG",
    match: /\b(hyderabad|secunderabad)\b/i,
    names: { en: "Hyderabad", hi: "हैदराबाद", mr: "हैदराबाद", kn: "ಹೈದರಾಬಾದ್", ta: "ஹைதராபாத்", te: "హైదరాబాద్", gu: "હૈદરાબાદ", bn: "হায়দরাবাদ", ml: "ഹൈദരാബാദ്", es: "Hyderabad", de: "Hyderabad", fr: "Hyderabad", pt: "Hyderabad", ar: "حيدر أباد", he: "היידראבאד", ja: "ハイデラバード" },
  },
  {
    id: "pune",
    state: "MH",
    match: /\bpune\b/i,
    names: { en: "Pune", hi: "पुणे", mr: "पुणे", kn: "ಪುಣೆ", ta: "புனே", te: "పుణె", gu: "પુણે", bn: "পুনে", ml: "പുണെ", es: "Pune", de: "Pune", fr: "Pune", pt: "Pune", ar: "بونه", he: "פונה", ja: "プネー" },
  },
  {
    id: "chennai",
    state: "TN",
    match: /\b(chennai|madras)\b/i,
    names: { en: "Chennai", hi: "चेन्नई", mr: "चेन्नई", kn: "ಚೆನ್ನೈ", ta: "சென்னை", te: "చెన్నై", gu: "ચેન્નઈ", bn: "চেন্নাই", ml: "ചെന്നൈ", es: "Chennai", de: "Chennai", fr: "Chennai", pt: "Chennai", ar: "تشيناي", he: "צ'נאי", ja: "チェンナイ" },
  },
  {
    id: "ahmedabad",
    state: "GJ",
    match: /\b(ahmedabad|gandhinagar|gift city)\b/i,
    names: { en: "Ahmedabad", hi: "अहमदाबाद", mr: "अहमदाबाद", kn: "ಅಹಮದಾಬಾದ್", ta: "அகமதாபாத்", te: "అహ్మదాబాద్", gu: "અમદાવાદ", bn: "আহমেদাবাদ", ml: "അഹമ്മദാബാദ്", es: "Ahmedabad", de: "Ahmedabad", fr: "Ahmedabad", pt: "Ahmedabad", ar: "أحمد آباد", he: "אחמדאבאד", ja: "アーメダバード" },
  },
  {
    id: "kolkata",
    state: "WB",
    match: /\b(kolkata|calcutta)\b/i,
    names: { en: "Kolkata", hi: "कोलकाता", mr: "कोलकाता", kn: "ಕೋಲ್ಕತ್ತಾ", ta: "கொல்கத்தா", te: "కోల్‌కతా", gu: "કોલકાતા", bn: "কলকাতা", ml: "കൊൽക്കത്ത", es: "Calcuta", de: "Kolkata", fr: "Calcutta", pt: "Calcutá", ar: "كولكاتا", he: "קולקטה", ja: "コルカタ" },
  },
  {
    id: "kochi",
    state: "KL",
    match: /\b(kochi|cochin|ernakulam|kalamassery)\b/i,
    names: { en: "Kochi", hi: "कोच्चि", mr: "कोची", kn: "ಕೊಚ್ಚಿ", ta: "கொச்சி", te: "కొచ్చి", gu: "કોચી", bn: "কোচি", ml: "കൊച്ചി", es: "Kochi", de: "Kochi", fr: "Kochi", pt: "Kochi", ar: "كوتشي", he: "קוצ'י", ja: "コーチ" },
  },
  {
    id: "thiruvananthapuram",
    state: "KL",
    match: /\b(thiruvananthapuram|trivandrum)\b/i,
    names: { en: "Thiruvananthapuram", hi: "तिरुवनंतपुरम", mr: "तिरुवनंतपुरम", kn: "ತಿರುವನಂತಪುರಂ", ta: "திருவனந்தபுரம்", te: "తిరువనంతపురం", gu: "તિરુવનંતપુરમ", bn: "তিরুবনন্তপুরম", ml: "തിരുവനന്തപുരം", es: "Thiruvananthapuram", de: "Thiruvananthapuram", fr: "Thiruvananthapuram", pt: "Thiruvananthapuram", ar: "ثيروفانانثابورام", he: "טירובנאנתפורם", ja: "ティルヴァナンタプラム" },
  },
  {
    id: "jaipur",
    state: "RJ",
    match: /\bjaipur\b/i,
    names: { en: "Jaipur", hi: "जयपुर", mr: "जयपूर", kn: "ಜೈಪುರ", ta: "ஜெய்ப்பூர்", te: "జైపూర్", gu: "જયપુર", bn: "জয়পুর", ml: "ജയ്പൂർ", es: "Jaipur", de: "Jaipur", fr: "Jaipur", pt: "Jaipur", ar: "جايبور", he: "ג'איפור", ja: "ジャイプル" },
  },
  {
    id: "indore",
    state: "MP",
    match: /\bindore\b/i,
    names: { en: "Indore", hi: "इंदौर", mr: "इंदूर", kn: "ಇಂದೋರ್", ta: "இந்தூர்", te: "ఇండోర్", gu: "ઇન્દોર", bn: "ইন্দোর", ml: "ഇൻഡോർ", es: "Indore", de: "Indore", fr: "Indore", pt: "Indore", ar: "إندور", he: "אינדור", ja: "インドール" },
  },
  {
    id: "coimbatore",
    state: "TN",
    match: /\b(coimbatore|kovai)\b/i,
    names: { en: "Coimbatore", hi: "कोयंबटूर", mr: "कोईम्बतूर", kn: "ಕೊಯಮತ್ತೂರು", ta: "கோயம்புத்தூர்", te: "కోయంబత్తూరు", gu: "કોઈમ્બતુર", bn: "কোয়েম্বাটুর", ml: "കോയമ്പത്തൂർ", es: "Coimbatore", de: "Coimbatore", fr: "Coimbatore", pt: "Coimbatore", ar: "كويمباتور", he: "קוימבטור", ja: "コインバトール" },
  },
  {
    id: "bhubaneswar",
    state: "OR",
    match: /\b(bhubaneswar|bhubaneshwar)\b/i,
    names: { en: "Bhubaneswar", hi: "भुवनेश्वर", mr: "भुवनेश्वर", kn: "ಭುವನೇಶ್ವರ", ta: "புவனேஸ்வர்", te: "భువనేశ్వర్", gu: "ભુવનેશ્વર", bn: "ভুবনেশ্বর", ml: "ഭുവനേശ്വർ", es: "Bhubaneswar", de: "Bhubaneswar", fr: "Bhubaneswar", pt: "Bhubaneswar", ar: "بوبانسوار", he: "בובנשוואר", ja: "ブバネーシュワル" },
  },
  {
    id: "chandigarh",
    state: "CH",
    match: /\b(chandigarh|mohali|panchkula)\b/i,
    names: { en: "Chandigarh", hi: "चंडीगढ़", mr: "चंदीगड", kn: "ಚಂಡೀಗಢ", ta: "சண்டிகர்", te: "చండీగఢ్", gu: "ચંડીગઢ", bn: "চণ্ডীগড়", ml: "ചണ്ഡീഗഢ്", es: "Chandigarh", de: "Chandigarh", fr: "Chandigarh", pt: "Chandigarh", ar: "شانديغار", he: "צ'נדיגאר", ja: "チャンディーガル" },
  },
];

export const cityById = (id: string) => CITY_INFO.find((c) => c.id === id);
export const cityName = (id: string | null | undefined, lang: Lang) => (id ? (cityById(id)?.names[lang] ?? id) : "");
