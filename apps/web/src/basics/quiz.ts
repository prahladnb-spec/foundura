/**
 * Three questions at the end of each funding basics chapter, in English and Hindi. Answers are checked in the
 * browser and nothing is stored. Each answer must follow from the chapter's own text; when a chapter changes,
 * check its questions too (e2e/tests/basics.spec.ts makes sure every chapter has them).
 */
export type Question = { q: string; options: string[]; answer: number; why: string };
type Quiz = Record<string, Question[]>;

export const QUIZ_EN: Quiz = {
  stages: [
    { q: "Which stage comes just before building the MVP?", options: ["Product-market fit", "Setting up the company", "Growth and scale"], answer: 1, why: "Register the company, sign a founders' agreement and get recognised before you take money, hire or apply for most schemes." },
    { q: "What counts as proof that people will pay?", options: ["A friend saying it's a great idea", "Pre-orders, letters of intent or a paid pilot", "A finished app"], answer: 1, why: "Validation means evidence of payment, not opinions." },
    { q: "What is the most common way to waste money?", options: ["Spending on a later stage before the earlier question is answered", "Talking to customers too early", "Applying for DPIIT recognition"], answer: 0, why: "Hiring a sales team before product-market fit, for example, spends money on a question you can't answer yet." },
  ],
  team: [
    { q: "A common vesting schedule for founders' shares is…", options: ["Four years with a one-year cliff", "All shares earned on day one", "One year with no cliff"], answer: 0, why: "Leave in the first year and you keep nothing; after that you keep what has vested." },
    { q: "In India, who can a DPIIT-recognised startup grant ESOPs to?", options: ["Anyone, including outside advisors", "Employees and directors, and for 10 years from incorporation also promoters", "Only its investors"], answer: 1, why: "ESOPs are for employees and directors; the startup exception lets promoters and large shareholding directors receive them for 10 years." },
    { q: "How should founders decide the share split?", options: ["By who had the idea", "By weighing commitment, roles and risk, early and in writing", "Always exactly equally"], answer: 1, why: "Shares pay for the years of work ahead. Decide before the company is worth much and record it in a founders' agreement." },
  ],
  rounds: [
    { q: "How much runway should a funding round usually buy?", options: ["3 to 6 months", "18 to 24 months", "10 years"], answer: 1, why: "Enough time to reach the milestones the next investors will look for." },
    { q: "Who usually invests in a Series A round?", options: ["Friends and family", "Venture capital funds", "Public investors on the stock exchange"], answer: 1, why: "Series A funds a repeatable way to grow, and VC funds lead it." },
    { q: "What is a bridge round?", options: ["A smaller round, often from existing investors, to buy time before the next round", "A bank loan for a building", "The first round after listing"], answer: 0, why: "It buys time; ask what will be different when that time runs out." },
  ],
  equity: [
    { q: "What is the least one investor can put into a convertible note in India?", options: ["₹1 lakh", "₹25 lakh in a single tranche", "₹1 crore"], answer: 1, why: "Below ₹25 lakh per investor the money would count as a deposit." },
    { q: "Which instrument do most angel, seed and VC rounds in India use?", options: ["CCPS", "Bank loans", "Debentures sold to the public"], answer: 0, why: "Compulsorily convertible preference shares carry investor rights and convert into equity shares later." },
    { q: "Who can issue convertible notes?", options: ["Any company", "Only DPIIT-recognised startups", "Only listed companies"], answer: 1, why: "Convertible notes are a startup-only route." },
  ],
  debt: [
    { q: "Which scheme guarantees bank loans to DPIIT-recognised startups?", options: ["CGSS", "MUDRA", "TReDS"], answer: 0, why: "The Credit Guarantee Scheme for Startups lets banks lend with less collateral." },
    { q: "Venture debt is mostly used to…", options: ["Extend runway between equity rounds of VC-backed startups", "Buy a founder's home", "Replace all equity funding"], answer: 0, why: "It is lent to VC-backed companies, usually for 2 to 4 years." },
    { q: "What is sensible to borrow against?", options: ["Losses with no end in sight", "Confirmed orders or equipment that earns", "An idea you haven't tested"], answer: 1, why: "Borrow against something that will produce the cash to repay the loan." },
  ],
  grants: [
    { q: "Why are grants called non-dilutive?", options: ["You don't give up any shares", "They are always small", "Banks pay them"], answer: 0, why: "You don't repay a grant and you don't sell part of the company." },
    { q: "How are grants usually paid?", options: ["All in advance", "In tranches after milestones, or as reimbursement", "As shares in the government"], answer: 1, why: "Plan your cash for the gap between spending and getting paid back." },
    { q: "What should you check before anything else?", options: ["Eligibility", "Which logo to use", "What your competitors received"], answer: 0, why: "Entity type, age, DPIIT recognition, state and sector decide whether you can apply at all." },
  ],
  vc: [
    { q: "How long does a VC fund usually last?", options: ["About two years", "About ten years", "For ever"], answer: 1, why: "A few years of new investments, then years of growing and selling stakes." },
    { q: "Why do VCs look for very large outcomes?", options: ["A few big winners return the whole fund", "The law requires it", "They must repay a bank"], answer: 0, why: "Most startups fail or return little, so the fund depends on the few that become very large." },
    { q: "Someone asks for a fee to introduce you to investors. You should…", options: ["Pay, it's normal", "Refuse: real investors don't charge founders to pitch", "Ask for a discount"], answer: 1, why: "Paying for introductions or guaranteed funding is a warning sign." },
  ],
  valuation: [
    { q: "Pre-money valuation ₹16 crore, new investment ₹4 crore. What do the new investors own?", options: ["25%", "20%", "16%"], answer: 1, why: "₹4 crore ÷ (₹16 crore + ₹4 crore) = 20%." },
    { q: "An ESOP pool created before the round dilutes…", options: ["Only the new investors", "The existing shareholders", "Nobody"], answer: 1, why: "Because it is created pre-money, the new investors' percentage isn't affected." },
    { q: "The fully diluted share count includes…", options: ["Only shares already issued", "All shares plus every option, note and iSAFE that will become shares", "Only the founders' shares"], answer: 1, why: "Always look at the fully diluted count when you work out ownership." },
  ],
  "term-sheet": [
    { q: "Which parts of a term sheet are usually binding?", options: ["The valuation", "Confidentiality and exclusivity", "The board seats"], answer: 1, why: "Most of a term sheet is not binding, but the no-shop and confidentiality clauses are." },
    { q: "The founder-friendly form of liquidation preference is…", options: ["1x non-participating", "3x participating", "Full ratchet"], answer: 0, why: "Investors take their money back or their share of the proceeds, not both." },
    { q: "A pro rata right lets investors…", options: ["Buy enough of the next round to keep their percentage", "Veto every hire", "Draw a salary"], answer: 0, why: "It protects their stake from dilution in later rounds." },
  ],
  "india-rules": [
    { q: "How soon must shares be allotted after the money arrives?", options: ["Within 60 days", "Within a year", "Within 7 days"], answer: 0, why: "Then the return of allotment (PAS-3) is filed." },
    { q: "Can investors pay for shares in cash?", options: ["Yes", "No, only from their own bank accounts", "Only up to ₹10 lakh"], answer: 1, why: "Money goes from the investor's bank account into a separate account of the company." },
    { q: "What happened to angel tax on share premium?", options: ["It still applies to every startup", "It no longer applies from 1 April 2025", "It applies only to foreign investors"], answer: 1, why: "Valuation reports are still needed under company law and FEMA." },
  ],
  choosing: [
    { q: "Which money suits growing very fast in a large market?", options: ["Angels, angel funds and venture capital", "Invoice discounting", "A prototype grant"], answer: 0, why: "Fast growth needs investors who accept high risk for a share of a large outcome." },
    { q: "When should you start your next raise?", options: ["With at least six months of runway left", "When the money has run out", "Only after you're profitable"], answer: 0, why: "A raise often takes three to six months." },
    { q: "Which of these is a warning sign?", options: ["Investors who want a majority stake at the earliest stage", "Sending a short monthly update", "Having your CA read the documents"], answer: 0, why: "Giving up control that early leaves little room for later rounds." },
  ],
};

export const QUIZ_HI: Quiz = {
  stages: [
    { q: "MVP बनाने से ठीक पहले कौन-सा चरण आता है?", options: ["प्रोडक्ट-मार्केट फ़िट", "कंपनी बनाना", "विकास और विस्तार"], answer: 1, why: "पैसा लेने, लोगों को रखने या ज़्यादातर योजनाओं में आवेदन से पहले कंपनी रजिस्टर करें, संस्थापक समझौता करें और मान्यता लें।" },
    { q: "लोग पैसा देंगे, इसका सबूत क्या माना जाता है?", options: ["किसी दोस्त का कहना कि विचार बढ़िया है", "अग्रिम ऑर्डर, आशय-पत्र या भुगतान वाला पायलट", "तैयार ऐप"], answer: 1, why: "पुष्टि का मतलब भुगतान का सबूत है, राय नहीं।" },
    { q: "पैसा बर्बाद करने का सबसे आम तरीका क्या है?", options: ["पिछले सवाल का जवाब मिले बिना अगले चरण पर ख़र्च करना", "ग्राहकों से बहुत जल्दी बात करना", "DPIIT मान्यता के लिए आवेदन करना"], answer: 0, why: "जैसे प्रोडक्ट-मार्केट फ़िट से पहले बिक्री टीम रखना, ऐसे सवाल पर पैसा लगाना है जिसका जवाब अभी नहीं मिल सकता।" },
  ],
  team: [
    { q: "संस्थापकों के शेयरों के लिए आम वेस्टिंग शेड्यूल क्या है?", options: ["एक साल के क्लिफ़ के साथ चार साल", "पहले दिन ही सारे शेयर", "बिना क्लिफ़ के एक साल"], answer: 0, why: "पहले साल में छोड़ें तो कुछ नहीं मिलता; उसके बाद जितना वेस्ट हुआ वह आपका।" },
    { q: "भारत में DPIIT मान्यता वाला स्टार्टअप ESOP किसे दे सकता है?", options: ["किसी को भी, बाहरी सलाहकारों समेत", "कर्मचारियों और निदेशकों को, और निगमन से 10 साल तक प्रमोटरों को भी", "सिर्फ़ अपने निवेशकों को"], answer: 1, why: "ESOP कर्मचारियों और निदेशकों के लिए हैं; स्टार्टअप की छूट से प्रमोटर और बड़े हिस्सेदार निदेशक भी 10 साल तक इन्हें पा सकते हैं।" },
    { q: "संस्थापक शेयरों का बँटवारा कैसे तय करें?", options: ["इस आधार पर कि विचार किसका था", "प्रतिबद्धता, भूमिका और जोखिम तौलकर, जल्दी और लिखित में", "हमेशा बिल्कुल बराबर"], answer: 1, why: "शेयर आगे के सालों के काम की क़ीमत हैं। कंपनी की क़ीमत बढ़ने से पहले तय करें और संस्थापक समझौते में लिखें।" },
  ],
  rounds: [
    { q: "एक फ़ंडिंग राउंड आम तौर पर कितना रनवे देना चाहिए?", options: ["3 से 6 महीने", "18 से 24 महीने", "10 साल"], answer: 1, why: "इतना समय कि आप अगले निवेशकों के देखे जाने वाले लक्ष्य पूरे कर सकें।" },
    { q: "सीरीज़ A राउंड में आम तौर पर कौन निवेश करता है?", options: ["दोस्त और परिवार", "वेंचर कैपिटल फ़ंड", "शेयर बाज़ार के आम निवेशक"], answer: 1, why: "सीरीज़ A बढ़ने के दोहराए जा सकने वाले तरीक़े के लिए होता है, और इसकी अगुवाई VC फ़ंड करते हैं।" },
    { q: "ब्रिज राउंड क्या है?", options: ["अगले राउंड से पहले समय ख़रीदने के लिए छोटा राउंड, अक्सर मौजूदा निवेशकों से", "इमारत के लिए बैंक लोन", "लिस्टिंग के बाद का पहला राउंड"], answer: 0, why: "यह समय ख़रीदता है; पूछें कि वह समय ख़त्म होने पर क्या अलग होगा।" },
  ],
  equity: [
    { q: "भारत में एक निवेशक कन्वर्टिबल नोट में कम से कम कितना लगा सकता है?", options: ["₹1 लाख", "एक किस्त में ₹25 लाख", "₹1 करोड़"], answer: 1, why: "हर निवेशक से ₹25 लाख से कम पैसा जमा (डिपॉज़िट) माना जाएगा।" },
    { q: "भारत में ज़्यादातर एंजेल, सीड और VC राउंड किस साधन से होते हैं?", options: ["CCPS", "बैंक लोन", "जनता को बेचे गए डिबेंचर"], answer: 0, why: "अनिवार्य रूप से परिवर्तनीय वरीयता शेयरों में निवेशकों के अधिकार होते हैं और बाद में वे इक्विटी शेयर बनते हैं।" },
    { q: "कन्वर्टिबल नोट कौन जारी कर सकता है?", options: ["कोई भी कंपनी", "सिर्फ़ DPIIT मान्यता वाले स्टार्टअप", "सिर्फ़ लिस्टेड कंपनियाँ"], answer: 1, why: "कन्वर्टिबल नोट सिर्फ़ स्टार्टअप का रास्ता है।" },
  ],
  debt: [
    { q: "कौन-सी योजना DPIIT मान्यता वाले स्टार्टअप के बैंक लोन की गारंटी देती है?", options: ["CGSS", "MUDRA", "TReDS"], answer: 0, why: "स्टार्टअप के लिए क्रेडिट गारंटी योजना से बैंक कम ज़मानत पर लोन दे पाते हैं।" },
    { q: "वेंचर डेट ज़्यादातर किस लिए होता है?", options: ["VC से पैसा पाए स्टार्टअप के इक्विटी राउंड के बीच रनवे बढ़ाने के लिए", "संस्थापक का घर ख़रीदने के लिए", "पूरी इक्विटी फ़ंडिंग की जगह लेने के लिए"], answer: 0, why: "यह VC से पैसा पाई कंपनियों को आम तौर पर 2 से 4 साल के लिए दिया जाता है।" },
    { q: "किसके भरोसे क़र्ज़ लेना समझदारी है?", options: ["ऐसे घाटे जिनका अंत न दिखे", "पक्के ऑर्डर या कमाई करने वाले उपकरण", "ऐसा विचार जिसे परखा नहीं"], answer: 1, why: "उस चीज़ के भरोसे क़र्ज़ लें जो लोन चुकाने लायक नक़दी पैदा करेगी।" },
  ],
  grants: [
    { q: "ग्रांट को नॉन-डाइल्यूटिव क्यों कहते हैं?", options: ["आप कोई शेयर नहीं देते", "ये हमेशा छोटे होते हैं", "बैंक देते हैं"], answer: 0, why: "ग्रांट न लौटाना पड़ता है, न कंपनी का हिस्सा बेचना पड़ता है।" },
    { q: "ग्रांट आम तौर पर कैसे मिलते हैं?", options: ["सारा पैसा पहले", "लक्ष्य पूरे होने पर किस्तों में, या ख़र्च की भरपाई के रूप में", "सरकार के शेयरों के रूप में"], answer: 1, why: "ख़र्च करने और पैसा वापस मिलने के बीच के समय के लिए नक़दी का इंतज़ाम रखें।" },
    { q: "सबसे पहले क्या जाँचना चाहिए?", options: ["पात्रता", "कौन-सा लोगो लगाएँ", "प्रतिस्पर्धियों को क्या मिला"], answer: 0, why: "कंपनी का प्रकार, उम्र, DPIIT मान्यता, राज्य और क्षेत्र तय करते हैं कि आप आवेदन कर भी सकते हैं या नहीं।" },
  ],
  vc: [
    { q: "एक VC फ़ंड आम तौर पर कितने साल चलता है?", options: ["लगभग दो साल", "लगभग दस साल", "हमेशा"], answer: 1, why: "कुछ साल नए निवेश, फिर कई साल कंपनियों को बढ़ाना और हिस्सेदारी बेचना।" },
    { q: "VC बहुत बड़े नतीजे क्यों खोजते हैं?", options: ["कुछ बड़े विजेता पूरा फ़ंड लौटा देते हैं", "क़ानून ऐसा कहता है", "उन्हें बैंक को चुकाना होता है"], answer: 0, why: "ज़्यादातर स्टार्टअप असफल होते हैं या कम लौटाते हैं, इसलिए फ़ंड उन कुछ पर निर्भर है जो बहुत बड़े बनते हैं।" },
    { q: "कोई निवेशकों से मिलवाने के लिए फ़ीस माँगे, तो आपको…", options: ["देनी चाहिए, यह आम है", "मना करना चाहिए: असली निवेशक संस्थापकों से पिच के पैसे नहीं लेते", "छूट माँगनी चाहिए"], answer: 1, why: "परिचय या पक्की फ़ंडिंग के लिए पैसे देना चेतावनी का संकेत है।" },
  ],
  valuation: [
    { q: "प्री-मनी वैल्यूएशन ₹16 करोड़, नया निवेश ₹4 करोड़। नए निवेशकों का हिस्सा कितना?", options: ["25%", "20%", "16%"], answer: 1, why: "₹4 करोड़ ÷ (₹16 करोड़ + ₹4 करोड़) = 20%।" },
    { q: "राउंड से पहले बनाया गया ESOP पूल किसका हिस्सा घटाता है?", options: ["सिर्फ़ नए निवेशकों का", "मौजूदा शेयरधारकों का", "किसी का नहीं"], answer: 1, why: "प्री-मनी बनने की वजह से नए निवेशकों का प्रतिशत नहीं बदलता।" },
    { q: "फ़ुली डाइल्यूटेड शेयर गिनती में क्या शामिल है?", options: ["सिर्फ़ जारी हो चुके शेयर", "सारे शेयर और हर ऑप्शन, नोट और iSAFE जो शेयर बनेंगे", "सिर्फ़ संस्थापकों के शेयर"], answer: 1, why: "हिस्सेदारी निकालते समय हमेशा फ़ुली डाइल्यूटेड गिनती देखें।" },
  ],
  "term-sheet": [
    { q: "टर्म शीट के कौन-से हिस्से आम तौर पर बाध्यकारी होते हैं?", options: ["वैल्यूएशन", "गोपनीयता और विशिष्टता", "बोर्ड की सीटें"], answer: 1, why: "टर्म शीट का ज़्यादातर हिस्सा बाध्यकारी नहीं होता, लेकिन नो-शॉप और गोपनीयता की शर्तें होती हैं।" },
    { q: "संस्थापकों के अनुकूल लिक्विडेशन प्रेफ़रेंस कौन-सा है?", options: ["1x नॉन-पार्टिसिपेटिंग", "3x पार्टिसिपेटिंग", "फ़ुल रैचेट"], answer: 0, why: "निवेशक या तो अपना पैसा वापस लेते हैं या बिक्री में अपना हिस्सा, दोनों नहीं।" },
    { q: "प्रो राटा अधिकार निवेशकों को क्या करने देता है?", options: ["अगले राउंड में इतना ख़रीदना कि उनका प्रतिशत बना रहे", "हर भर्ती रोकना", "वेतन लेना"], answer: 0, why: "यह बाद के राउंड में उनकी हिस्सेदारी को घटने से बचाता है।" },
  ],
  "india-rules": [
    { q: "पैसा आने के कितने दिनों में शेयर आवंटित करने होते हैं?", options: ["60 दिन के भीतर", "एक साल के भीतर", "7 दिन के भीतर"], answer: 0, why: "उसके बाद आवंटन का रिटर्न (PAS-3) दाख़िल होता है।" },
    { q: "क्या निवेशक शेयरों के लिए नक़द भुगतान कर सकते हैं?", options: ["हाँ", "नहीं, सिर्फ़ अपने बैंक खाते से", "सिर्फ़ ₹10 लाख तक"], answer: 1, why: "पैसा निवेशक के बैंक खाते से कंपनी के अलग खाते में आता है।" },
    { q: "शेयर प्रीमियम पर एंजेल टैक्स का क्या हुआ?", options: ["अब भी हर स्टार्टअप पर लागू है", "1 अप्रैल 2025 से लागू नहीं है", "सिर्फ़ विदेशी निवेशकों पर लागू है"], answer: 1, why: "कंपनी क़ानून और FEMA के तहत वैल्यूएशन रिपोर्ट अब भी ज़रूरी है।" },
  ],
  choosing: [
    { q: "बड़े बाज़ार में बहुत तेज़ी से बढ़ने के लिए कौन-सा पैसा ठीक है?", options: ["एंजेल, एंजेल फ़ंड और वेंचर कैपिटल", "इनवॉइस डिस्काउंटिंग", "प्रोटोटाइप ग्रांट"], answer: 0, why: "तेज़ विकास के लिए ऐसे निवेशक चाहिए जो बड़े नतीजे के हिस्से के बदले ऊँचा जोखिम लें।" },
    { q: "अगला राउंड कब शुरू करना चाहिए?", options: ["जब कम से कम छह महीने का रनवे बचा हो", "जब पैसा ख़त्म हो जाए", "सिर्फ़ मुनाफ़े में आने के बाद"], answer: 0, why: "राउंड में अक्सर तीन से छह महीने लगते हैं।" },
    { q: "इनमें से कौन-सा चेतावनी का संकेत है?", options: ["सबसे शुरुआती चरण में बहुमत हिस्सेदारी माँगने वाले निवेशक", "हर महीने छोटा अपडेट भेजना", "दस्तावेज़ अपने CA से पढ़वाना"], answer: 0, why: "इतनी जल्दी नियंत्रण देने से आगे के राउंड के लिए बहुत कम जगह बचती है।" },
  ],
};
