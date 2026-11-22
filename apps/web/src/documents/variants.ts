import { type FounderDoc, h, note, p, table, type Template, ul } from "./types";

/**
 * Extra downloads for some documents: a filled-in example for a made-up startup (Mitti Sense, soil
 * moisture sensors; every name and number is invented), and Hindi versions of templates founders
 * often need in Hindi for state schemes.
 */
const deckExample: Template = {
  kind: "deck",
  slides: [
    { title: "Mitti Sense: soil sensors that tell farmers when to water", prompts: ["Example deck for a made-up startup. All names and numbers are invented.", "Asha Kulkarni, co-founder. asha@mittisense.example, 90000 00000", "Prototype stage, Nashik"] },
    { title: "Grape farmers in Nashik over-water by 30% because they water by habit", prompts: ["1.8 lakh grape and pomegranate growers in Maharashtra irrigate on a fixed schedule", "Over-watering costs a 2-acre farmer about ₹18,000 a season in power, water and fungal disease", "\"I water every third day because my father did.\" Grower, Niphad"] },
    { title: "A ₹2,400 sensor and an SMS: water today, or wait", prompts: ["A probe in the root zone reads moisture every hour", "The farmer gets one SMS a day in Marathi: water, or wait", "Works on 2G, no smartphone needed; possible now because sensor and SIM costs have fallen"] },
    { title: "The product", prompts: ["Probe, solar-powered node and SMS service; photo and 30-second demo at mittisense.example/demo", "Built: 60 working units, Marathi and Hindi messages", "Planned: disease-risk alerts, app for farmer groups"] },
    { title: "Market: 1.8 lakh growers paying ₹1,800 a year", prompts: ["Bottom-up: 1.8 lakh high-value fruit growers × ₹1,800 subscription = ₹32 crore a year in Maharashtra", "First segment: 22,000 growers in Nashik district who sell for export and already track quality", "Next: Karnataka and Andhra Pradesh, then vegetables under drip"] },
    { title: "Business model: device at cost, yearly subscription", prompts: ["Farmer pays ₹2,400 once for the device and ₹1,800 a year for alerts", "Gross margin 62% on subscription", "Cost to win a farmer ₹900 through farmer groups; earned back in 10 months"] },
    { title: "Traction: 60 farms, 27% less water, 52 of 60 renewed", prompts: ["Pilot with 60 farms over one season with a farmer producer company in Niphad", "Average water use down 27%, measured against each farm's previous season", "52 farmers paid to renew; 140 on the waiting list"] },
    { title: "Go to market: through farmer producer companies", prompts: ["One agreement with a producer company reaches 300 to 800 farmers", "Its field officer installs the device and earns ₹200 per unit", "Three more producer companies have signed letters of intent"] },
    { title: "Competition: habit, and imported systems at 10 times the price", prompts: ["Today: watering by schedule, or a ₹25,000 imported station that needs a smartphone", "We win on price, local language and no-app delivery", "Hard to copy: calibration data for local soils from 60 farms, and producer company relationships"] },
    { title: "Team: agronomy, hardware and rural sales", prompts: ["Asha Kulkarni: agronomist, 6 years with grape exporters", "Imran Shaikh: hardware engineer, built low-power sensors for 5 years", "Gap to fill with this round: a head of field operations"] },
    { title: "Financials: break-even in year 3", prompts: ["Year 1: 2,000 farms, ₹84 lakh revenue. Year 2: 8,000 farms, ₹2.6 crore. Year 3: 20,000 farms, ₹5.9 crore", "Drivers: farms per producer company, renewal rate (87% in pilot), device cost", "Burn today ₹3.2 lakh a month; 7 months of runway"] },
    { title: "The ask: ₹1.2 crore to reach 8,000 farms", prompts: ["₹1.2 crore in equity; ₹30 lakh committed by two angels", "Use: devices and tooling 40%, field team 35%, product 15%, compliance and working capital 10%", "Gets us to: 8,000 paying farms, 5 districts, and a seed round in 18 months"] },
  ],
};

const onePagerExample: Template = {
  kind: "doc",
  blocks: [
    h("Mitti Sense"),
    p("We help fruit growers cut water use by a quarter with a ₹2,400 soil sensor that sends one SMS a day: water, or wait. Nashik. November 2026."),
    table(
      ["", ""],
      ["Problem", "1.8 lakh grape and pomegranate growers in Maharashtra water by habit and over-water by about 30%, costing a 2-acre farmer about ₹18,000 a season."],
      ["Solution", "A root-zone moisture probe and a daily SMS in Marathi. Works on 2G, no smartphone needed."],
      ["Product", "60 units live. Demo: mittisense.example/demo"],
      ["Traction", "60 pilot farms; water use down 27% on average; 52 of 60 paid to renew; 140 on the waiting list."],
      ["Market", "1.8 lakh growers × ₹1,800 a year = ₹32 crore a year in Maharashtra. First: 22,000 export growers in Nashik."],
      ["Business model", "₹2,400 device at cost, ₹1,800 a year subscription, 62% gross margin."],
      ["Competition", "Watering by schedule, or imported stations at ₹25,000 that need a smartphone. We win on price and language."],
      ["Team", "Asha Kulkarni (agronomist, 6 years with grape exporters); Imran Shaikh (low-power hardware, 5 years)."],
      ["Raising", "₹1.2 crore equity, ₹30 lakh committed, to reach 8,000 paying farms in 18 months."],
      ["Status", "Private limited company, incorporated March 2025, DPIIT-recognised, incubated at an agri-business incubator."],
      ["Contact", "Asha Kulkarni, asha@mittisense.example, 90000 00000"],
    ),
  ],
};

const deckHi: Template = {
  kind: "deck",
  slides: [
    { title: "[कंपनी का नाम]: [आप क्या करते हैं, एक लाइन में]", prompts: ["लोगो, आपका नाम, ईमेल और फ़ोन", "एक लाइन जो कोई अनजान व्यक्ति भी समझ सके", "चरण और शहर, जैसे: प्रोटोटाइप, नाशिक"] },
    { title: "समस्या: [इसे एक आँकड़े के साथ तथ्य की तरह लिखें]", prompts: ["यह समस्या किसे है, और कितनी बार होती है", "आज इससे उन्हें पैसे, समय या जोखिम में क्या नुक़सान होता है", "किसी ग्राहक की एक असली कहानी या बात"] },
    { title: "समाधान: [ग्राहक के लिए क्या बदलता है]", prompts: ["आप क्या करते हैं, सरल शब्दों में", "एक ग्राहक के लिए पहले और बाद की स्थिति", "अभी क्यों: ऐसा क्या बदला जिससे यह संभव हुआ"] },
    { title: "प्रोडक्ट", prompts: ["स्क्रीनशॉट, फ़ोटो या 30 सेकंड के डेमो का लिंक", "वे 3 काम जो यह सबसे अच्छा करता है", "आज क्या बन चुका है और आगे क्या बनेगा"] },
    { title: "बाज़ार: [N] ग्राहक, हर एक से साल में ₹[X]", prompts: ["नीचे से गिनती: जिन ग्राहकों तक आप पहुँच सकते हैं × सालाना कीमत", "पहला वर्ग जिसे आप जीतेंगे, और वही क्यों", "उसके बाद बाज़ार कैसे बढ़ेगा"] },
    { title: "बिज़नेस मॉडल: कमाई कैसे होती है", prompts: ["कौन भुगतान करता है, कितना और कितनी बार", "हर बिक्री पर सकल मार्जिन", "एक ग्राहक पाने की लागत और वह कितने समय में वसूल होती है"] },
    { title: "अब तक की प्रगति: [सबसे अहम एक आँकड़ा]", prompts: ["समय के साथ एक चार्ट: कमाई, उपयोगकर्ता, पायलट या उपयोग", "ग्राहकों या पायलट के नाम, उनकी अनुमति से", "आपने क्या सीखा और क्या बदला"] },
    { title: "बाज़ार में उतरना: अगले 100 ग्राहकों तक कैसे पहुँचेंगे", prompts: ["वह चैनल जो आज काम कर रहा है", "बिक्री में कितना समय लगता है और हस्ताक्षर कौन करता है", "पार्टनर, डिस्ट्रीब्यूटर या सरकारी रास्ते"] },
    { title: "प्रतिस्पर्धा: हम क्यों जीतेंगे", prompts: ["ग्राहक आज क्या इस्तेमाल करते हैं, कुछ न करना भी शामिल", "वे 2 या 3 बातें जो आप अलग करते हैं और ग्राहक के लिए मायने रखती हैं", "दूसरों को नक़ल से क्या रोकता है: IP, डेटा, मंज़ूरियाँ, वितरण"] },
    { title: "टीम: हम ही क्यों", prompts: ["संस्थापक, हर एक के अनुभव पर एक लाइन", "अहम कर्मचारी और सलाहकार", "वे कमियाँ जो इस राउंड से पूरी होंगी"] },
    { title: "वित्तीय तस्वीर: अगले 3 साल", prompts: ["साल-दर-साल कमाई, ख़र्च और नक़दी (एक छोटी तालिका या चार्ट)", "वे 3 मान्यताएँ जिन पर आँकड़े टिके हैं", "आज का मासिक ख़र्च और रनवे"] },
    { title: "माँग: [पड़ाव] तक पहुँचने के लिए ₹[रकम]", prompts: ["रकम, इंस्ट्रूमेंट (इक्विटी, CCPS, कन्वर्टिबल नोट) और अब तक कितना पक्का हुआ", "धन का उपयोग 3 या 4 हिस्सों में", "इस पैसे से कौन-से पड़ाव पूरे होंगे, और संपर्क का ब्योरा"] },
  ],
};

const onePagerHi: Template = {
  kind: "doc",
  blocks: [
    note("इसे एक पेज में रखें। [कोष्ठक] में लिखी हर चीज़ बदलें और यह टिप्पणी हटा दें।"),
    h("[कंपनी का नाम]"),
    p("[एक वाक्य: हम किसकी, क्या करने में, कैसे मदद करते हैं।] [शहर]। [महीना साल]।"),
    table(
      ["", ""],
      ["समस्या", "[यह किसे है, कितनी बड़ी है, आज उन्हें इससे क्या नुक़सान होता है।]"],
      ["समाधान", "[आप क्या करते हैं और ग्राहक के लिए क्या बदलता है।]"],
      ["प्रोडक्ट", "[आज क्या चालू है। डेमो का लिंक।]"],
      ["प्रगति", "[3 आँकड़े: ग्राहक या पायलट, कमाई या उपयोग, बढ़त।]"],
      ["बाज़ार", "[N ग्राहक × ₹X सालाना = ₹Y। पहला वर्ग।]"],
      ["बिज़नेस मॉडल", "[कौन भुगतान करता है, कितना, मार्जिन।]"],
      ["प्रतिस्पर्धा", "[ग्राहक आज क्या इस्तेमाल करते हैं और आप क्यों बेहतर हैं।]"],
      ["टीम", "[संस्थापक, हर एक पर एक लाइन। मुख्य सलाहकार।]"],
      ["निवेश की माँग", "[₹ रकम, इंस्ट्रूमेंट, अब तक पक्का हुआ, इससे क्या हासिल होगा।]"],
      ["स्थिति", "[इकाई का प्रकार, स्थापना महीना साल, DPIIT मान्यता: हाँ/नहीं, इनक्यूबेटर या ग्रांट।]"],
      ["संपर्क", "[नाम, ईमेल, फ़ोन, वेबसाइट, डेक का लिंक।]"],
    ),
  ],
};

const dprHi: Template = {
  kind: "doc",
  blocks: [
    note("जिस बैंक या योजना में आवेदन कर रहे हैं, अगर उसका अपना प्रारूप है तो वही अपनाएँ। जहाँ नहीं है, वहाँ यह ढाँचा इस्तेमाल करें।"),
    h("1. सारांश"),
    table(["मद", "विवरण"], ["आवेदक", "[कंपनी का नाम, इकाई का प्रकार, स्थापना की तारीख़, CIN/LLPIN]"], ["पंजीकृत कार्यालय", "[पता]"], ["पंजीकरण", "[PAN, GST, उद्यम, DPIIT मान्यता संख्या]"], ["परियोजना", "[एक वाक्य]"], ["कुल परियोजना लागत", "₹[रकम]"], ["माँगी गई राशि", "₹[रकम], [ऋण / ग्रांट / सीड फ़ंड] के रूप में"], ["प्रवर्तकों का अंशदान", "₹[रकम] ([x]%)"]),
    h("2. प्रवर्तक और टीम"),
    table(["नाम", "भूमिका", "योग्यता और अनुभव", "शेयरधारिता %"], ["[नाम]", "[भूमिका]", "[...]", "[%]"], ["[नाम]", "[भूमिका]", "[...]", "[%]"]),
    h("3. समस्या और प्रोडक्ट"),
    p("[आप कौन-सी समस्या हल करते हैं, किसके लिए, और प्रोडक्ट कैसे काम करता है। विकास का चरण। दायर या प्राप्त IP।]"),
    h("4. बाज़ार और ग्राहक"),
    p("[लक्षित ग्राहक, नीचे से गिना गया बाज़ार का आकार, प्रतिस्पर्धी और आपकी बढ़त। हाथ में मौजूद आशय पत्र, पायलट या ऑर्डर।]"),
    h("5. संचालन"),
    p("[आप कहाँ काम करते हैं, मुख्य प्रक्रियाएँ, सप्लायर, क्षमता, ज़रूरी लाइसेंस और मंज़ूरियाँ और उनकी स्थिति।]"),
    h("6. परियोजना लागत"),
    table(["मद", "राशि (₹)", "आधार (कोटेशन, अनुमान)"], ["उपकरण और मशीनरी", "", ""], ["प्रोडक्ट विकास और परीक्षण", "", ""], ["वेतन (महीने × लोग)", "", ""], ["मार्केटिंग और यात्रा", "", ""], ["कार्यशील पूँजी मार्जिन", "", ""], ["आकस्मिक व्यय", "", ""], ["कुल", "", ""]),
    h("7. वित्त के स्रोत"),
    table(["स्रोत", "राशि (₹)", "स्थिति"], ["प्रवर्तकों का अंशदान", "", "[लगाया जा चुका / प्रतिबद्ध]"], ["माँगा गया ऋण या ग्रांट", "", ""], ["अन्य निवेशक या ग्रांट", "", ""], ["कुल (परियोजना लागत के बराबर होना चाहिए)", "", ""]),
    h("8. वित्तीय अनुमान"),
    note("अपने फ़ाइनेंशियल मॉडल का सालाना सारांश लगाएँ। नीचे मान्यताएँ लिखें।"),
    table(["", "वर्ष 1", "वर्ष 2", "वर्ष 3"], ["आय", "", "", ""], ["ख़र्च", "", "", ""], ["कर से पहले लाभ या हानि", "", "", ""], ["अंतिम नक़दी", "", "", ""]),
    h("9. पड़ाव और धन का उपयोग"),
    table(["पड़ाव", "कब तक", "ज़रूरी राशि (₹)", "कैसे मापा जाएगा"], ["", "", "", ""], ["", "", "", ""]),
    h("10. चुकौती (सिर्फ़ ऋण के लिए)"),
    p("[ऋण राशि, अवधि, माँगी गई मोहलत, किस्त, दी गई ज़मानत या क्रेडिट गारंटी कवर, साल-दर-साल ऋण चुकाने की क्षमता का अनुपात।]"),
    h("11. जोखिम और उनसे निपटने की योजना"),
    ul("[तकनीकी या नियामक जोखिम और योजना]", "[बाज़ार का जोखिम और योजना]", "[फ़ंडिंग का जोखिम और योजना]"),
    h("संलग्नक"),
    ul("निगमन प्रमाणपत्र, PAN, GST, उद्यम, DPIIT प्रमाणपत्र", "उपकरणों के कोटेशन", "पिछले वर्षों के वित्तीय विवरण और कर रिटर्न, अगर हों", "आशय पत्र, ऑर्डर, पायलट रिपोर्ट", "प्रवर्तकों के बायोडेटा"),
  ],
};

const VARIANTS: Record<string, NonNullable<FounderDoc["variants"]>> = {
  "pitch-deck": [{ key: "example", template: deckExample }, { key: "hi", template: deckHi }],
  "one-pager": [{ key: "example", template: onePagerExample }, { key: "hi", template: onePagerHi }],
  "business-plan-dpr": [{ key: "hi", template: dprHi }],
};

export const withVariants = (docs: FounderDoc[]): FounderDoc[] => docs.map((d) => (VARIANTS[d.slug] ? { ...d, variants: VARIANTS[d.slug] } : d));
