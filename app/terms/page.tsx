"use client";

import Link from "next/link";
import { useLanguage } from "../components/language-provider";
import LanguageSwitcher from "../components/language-switcher";

const sections = [
  { title: "1. About TrustNepal", titleNe: "१. TrustNepal बारे", body: [
    "TrustNepal is an online platform intended to help people in Nepal discover businesses, products, services and other listed entities, read ratings and reviews, and share their own experiences.",
    "TrustNepal provides a place for users to publish opinions. Unless expressly stated otherwise, a review is the opinion of the person who submitted it and is not a statement or guarantee made by TrustNepal."
  ], bodyNe: [
    "TrustNepal नेपालको प्रयोगकर्तालाई व्यवसाय, उत्पादन, सेवा तथा अन्य सूचीकृत संस्था वा सेवाप्रदायकबारे जानकारी खोज्न, मूल्याङ्कन तथा समीक्षाहरू पढ्न र आफ्ना अनुभव साझा गर्न सहयोग गर्ने उद्देश्यले तयार गरिएको अनलाइन प्लेटफर्म हो।",
    "TrustNepal ले प्रयोगकर्तालाई आफ्ना विचार तथा अनुभव प्रकाशित गर्ने माध्यम प्रदान गर्दछ। स्पष्ट रूपमा अन्यथा उल्लेख नगरिएसम्म, कुनै समीक्षा त्यसलाई लेख्ने व्यक्तिको व्यक्तिगत विचार हो; त्यसलाई TrustNepal को आधिकारिक भनाइ वा प्रत्याभूति मानिने छैन।"
  ] },
  { title: "2. Acceptance of these Terms", titleNe: "२. यी सर्तहरूको स्वीकृति", body: [
    "By creating a TrustNepal account, you confirm that you have read and agree to these Terms & Conditions and our Privacy Policy. If you do not agree, do not create or use an account.",
    "Acceptance is requested during account registration. These Terms continue to apply when you use your account and the platform; you are not required to accept them again every time you submit a review."
  ], bodyNe: [
    "TrustNepal मा खाता सिर्जना गर्दा तपाईंले यी नियम तथा सर्तहरू र हाम्रो गोपनीयता नीतिलाई पढेको र स्वीकार गरेको पुष्टि गर्नुहुन्छ। तपाईं यी सर्तहरूसँग सहमत हुनुहुन्न भने खाता सिर्जना नगर्नुहोस् वा प्लेटफर्म प्रयोग नगर्नुहोस्।",
    "यी सर्तहरू खाता दर्ता गर्ने क्रममा स्वीकार गर्नुपर्नेछ। तपाईंले आफ्नो खाता वा प्लेटफर्म प्रयोग गरिरहँदा यी सर्तहरू लागू भइरहनेछन्; प्रत्येक पटक समीक्षा लेख्दा पुनः स्वीकार गर्नुपर्ने छैन।"
  ] },
  { title: "3. Account registration and security", titleNe: "३. खाता दर्ता तथा सुरक्षा", body: [
    "You must provide information that is accurate and keep your account details reasonably up to date. You are responsible for activity carried out through your account and for keeping your login credentials secure.",
    "Do not impersonate another person, create an account using false information, or use another person's account without permission. Tell us promptly if you believe your account has been accessed without your permission.",
    "We may restrict or suspend an account where we reasonably believe it is being used fraudulently, deceptively, unlawfully, or in breach of these Terms."
  ], bodyNe: [
    "तपाईंले सही जानकारी उपलब्ध गराउनुपर्छ र आफ्नो खातासम्बन्धी विवरण उचित रूपमा अद्यावधिक राख्नुपर्छ। तपाईंको खातामार्फत हुने गतिविधि तथा लगइन विवरण सुरक्षित राख्ने जिम्मेवारी तपाईंको हुनेछ।",
    "अरू व्यक्तिको परिचय प्रयोग नगर्नुहोस्, झुटो विवरण राखेर खाता नबनाउनुहोस् र अनुमति बिना अरूको खाता प्रयोग नगर्नुहोस्। तपाईंको खातामा अनुमति बिना पहुँच भएको शंका लागेमा हामीलाई यथाशीघ्र जानकारी दिनुहोस्।",
    "खाता ठगी, छल, गैरकानुनी कार्य वा यी सर्तहरूको उल्लङ्घनका लागि प्रयोग भइरहेको उचित आधार देखिएमा हामी त्यस खातामा प्रतिबन्ध लगाउन वा निलम्बन गर्न सक्छौँ।"
  ] },
  { title: "4. Reviews, ratings and user content", titleNe: "४. समीक्षा, मूल्याङ्कन तथा प्रयोगकर्ताको सामग्री", body: [
    "You may submit ratings, reviews, replies and other content where the relevant feature is available. Your content should reflect your genuine experience or clearly identified, good-faith opinion.",
    "You are responsible for the content you submit. You must have the right to share it and must not disclose another person's private, confidential or sensitive information without a lawful basis and appropriate permission.",
    "A review should be relevant, truthful to the best of your knowledge, based on a genuine experience where it claims to describe one, and written in a respectful manner. Do not present speculation, advertising or a personal dispute as verified fact."
  ], bodyNe: [
    "सम्बन्धित सुविधा उपलब्ध भएको अवस्थामा तपाईंले मूल्याङ्कन, समीक्षा, जवाफ तथा अन्य सामग्री पेश गर्न सक्नुहुन्छ। तपाईंले पेश गर्ने सामग्री आफ्नो वास्तविक अनुभव वा स्पष्ट रूपमा व्यक्तिगत सद्भावपूर्ण विचारमा आधारित हुनुपर्छ।",
    "तपाईंले पेश गरेको सामग्रीको जिम्मेवारी तपाईं स्वयंको हुनेछ। उक्त सामग्री साझा गर्ने अधिकार तपाईंसँग हुनुपर्छ र कानुनी आधार तथा उपयुक्त अनुमति बिना अरू व्यक्तिको निजी, गोप्य वा संवेदनशील जानकारी सार्वजनिक गर्नु हुँदैन।",
    "समीक्षा विषयसँग सम्बन्धित, तपाईंको जानकारीअनुसार सत्य र वास्तविक अनुभवमा आधारित हुनुपर्छ (वास्तविक अनुभवको दाबी गरिएको अवस्थामा) तथा सम्मानजनक भाषामा लेखिएको हुनुपर्छ। अनुमान, विज्ञापन वा व्यक्तिगत विवादलाई प्रमाणित तथ्यका रूपमा प्रस्तुत नगर्नुहोस्।"
  ] },
  { title: "5. Prohibited content and conduct", titleNe: "५. निषेधित सामग्री तथा गतिविधि", body: [
    "You must not submit fake, purchased, incentivised without clear disclosure, manipulated or misleading reviews; ratings intended to artificially raise or lower a score; spam; advertisements; or content unrelated to the listed entity.",
    "You must not post threats, harassment, hate speech, discriminatory abuse, obscene content, defamatory allegations presented as fact, unlawful material, malware, or content that infringes intellectual property or privacy rights.",
    "Do not attempt to manipulate the platform, interfere with its security or operation, scrape or harvest information without permission, evade moderation, or use automated means in a way that harms the service or its users."
  ], bodyNe: [
    "नक्कली, किनिएको, स्पष्ट खुलासा नगरी प्रलोभन वा पुरस्कारका आधारमा लेखिएको, हेरफेर गरिएको वा भ्रमपूर्ण समीक्षा; कुनै संस्थाको अंक कृत्रिम रूपमा बढाउने वा घटाउने उद्देश्यका मूल्याङ्कन; स्पाम; विज्ञापन; वा सूचीकृत संस्था/सेवासँग असम्बन्धित सामग्री पेश गर्न पाइने छैन।",
    "धम्की, दुर्व्यवहार, घृणास्पद अभिव्यक्ति, विभेदकारी आक्रमण, अश्लील सामग्री, तथ्यका रूपमा प्रस्तुत गरिएका मानहानिकारक आरोप, गैरकानुनी सामग्री, हानिकारक सफ्टवेयर वा बौद्धिक सम्पत्ति तथा गोपनीयता अधिकार उल्लङ्घन गर्ने सामग्री पोस्ट गर्न पाइने छैन।",
    "प्लेटफर्ममा हेरफेर गर्ने, यसको सुरक्षा वा सञ्चालनमा बाधा पुर्‍याउने, अनुमति बिना जानकारी संकलन गर्ने, सामग्री समीक्षा प्रक्रियाबाट छल्ने वा सेवा तथा प्रयोगकर्तालाई हानि पुग्ने गरी स्वचालित माध्यम प्रयोग गर्ने प्रयास नगर्नुहोस्।"
  ] },
  { title: "6. Moderation, reports and removal", titleNe: "६. सामग्रीको समीक्षा, उजुरी तथा हटाउने प्रक्रिया", body: [
    "TrustNepal may review, delay, decline, hide, edit for formatting, or remove content that appears to breach these Terms, applicable law, or our review standards. We may also request clarification or supporting information.",
    "We may act on user reports, business complaints, automated signals or our own review. A moderation decision does not necessarily mean that TrustNepal has independently verified every factual statement in a review.",
    "Where appropriate, users may report content through reporting or contact options made available on the platform. Please provide enough information for us to identify the content and understand the concern."
  ], bodyNe: [
    "यी सर्त, लागू कानुन वा हाम्रो समीक्षा मापदण्ड उल्लङ्घन भएको देखिने सामग्रीलाई TrustNepal ले जाँच गर्न, प्रकाशनमा ढिलाइ गर्न, अस्वीकार गर्न, लुकाउन, ढाँचाका लागि सम्पादन गर्न वा हटाउन सक्छ। आवश्यक परेमा हामी थप स्पष्टीकरण वा प्रमाणसमेत माग्न सक्छौँ।",
    "प्रयोगकर्ताको उजुरी, व्यवसायको गुनासो, स्वचालित प्रणालीबाट प्राप्त सङ्केत वा आफ्नै जाँचका आधारमा हामी आवश्यक कदम चाल्न सक्छौँ। सामग्री व्यवस्थापनसम्बन्धी निर्णयले समीक्षामा उल्लेख गरिएका सबै तथ्य TrustNepal ले स्वतन्त्र रूपमा प्रमाणित गरेको भन्ने अर्थ दिँदैन।",
    "उपयुक्त अवस्थामा प्लेटफर्ममा उपलब्ध उजुरी वा सम्पर्क सुविधामार्फत सामग्री रिपोर्ट गर्न सकिन्छ। हामीले सम्बन्धित सामग्री पहिचान गर्न र समस्या बुझ्न सक्ने पर्याप्त विवरण उपलब्ध गराउनुहोस्।"
  ] },
  { title: "7. Business listings and responses", titleNe: "७. व्यवसाय सूचीकरण तथा जवाफ", body: [
    "Business, product, service, education, health, finance, hotel, restaurant, movie and other listings may be added or managed by TrustNepal or authorised administrators. A listing does not mean TrustNepal endorses, certifies or guarantees that entity.",
    "Where a business representative can respond to a review, the response must be relevant, professional and respectful. A business must not threaten, pressure, reward or retaliate against a user to influence a review or rating."
  ], bodyNe: [
    "व्यवसाय, उत्पादन, सेवा, शिक्षा, स्वास्थ्य, वित्त, होटल, रेस्टुरेन्ट, चलचित्र तथा अन्य सूचीहरू TrustNepal वा अधिकारप्राप्त प्रशासकद्वारा थप वा व्यवस्थापन गर्न सकिन्छ। कुनै संस्था सूचीमा समावेश हुनुको अर्थ TrustNepal ले त्यसको समर्थन, प्रमाणीकरण वा प्रत्याभूति गरेको भन्ने होइन।",
    "व्यवसायका प्रतिनिधिलाई समीक्षाको जवाफ दिने सुविधा उपलब्ध भएमा त्यस्तो जवाफ विषयसँग सम्बन्धित, व्यावसायिक र सम्मानजनक हुनुपर्छ। समीक्षा वा मूल्याङ्कन प्रभावित पार्न व्यवसायले प्रयोगकर्तालाई धम्की दिन, दबाब दिन, पुरस्कारको प्रलोभन दिन वा प्रतिशोध लिन हुँदैन।"
  ] },
  { title: "8. Intellectual property and permission to display content", titleNe: "८. बौद्धिक सम्पत्ति तथा सामग्री प्रदर्शन गर्ने अनुमति", body: [
    "You retain any rights you have in content you submit. By submitting content, you give TrustNepal a non-exclusive, worldwide, royalty-free permission to host, store, reproduce, display, format and distribute that content as reasonably necessary to operate, improve and promote the platform.",
    "You confirm that this permission does not violate another person's rights. You may ask us to remove your content, subject to legal obligations, platform integrity needs and any applicable retention requirements.",
    "The TrustNepal name, branding, website design, software and platform materials are owned by or licensed to TrustNepal and may not be copied or used commercially without permission, except where the law allows."
  ], bodyNe: [
    "तपाईंले पेश गर्नुभएको सामग्रीमा तपाईंसँग रहेका अधिकार तपाईंसँगै रहनेछन्। सामग्री पेश गरेर तपाईंले प्लेटफर्म सञ्चालन, सुधार तथा प्रवर्द्धन गर्न आवश्यक हदसम्म उक्त सामग्री होस्ट, भण्डारण, प्रतिलिपि, प्रदर्शन, ढाँचाबद्ध र वितरण गर्न TrustNepal लाई गैर–एकाधिकारयुक्त, विश्वव्यापी तथा रोयल्टी नलाग्ने अनुमति प्रदान गर्नुहुन्छ।",
    "यसरी दिइएको अनुमतिले अरू व्यक्तिको अधिकार उल्लङ्घन गर्दैन भन्ने कुरा तपाईं सुनिश्चित गर्नुहुन्छ। कानुनी दायित्व, प्लेटफर्मको अखण्डता तथा लागू हुने अभिलेख संरक्षण आवश्यकताका अधीनमा रही तपाईंले आफ्नो सामग्री हटाउन अनुरोध गर्न सक्नुहुन्छ।",
    "TrustNepal नाम, ब्रान्ड, वेबसाइट डिजाइन, सफ्टवेयर तथा प्लेटफर्मका सामग्री TrustNepal को स्वामित्वमा वा इजाजतअन्तर्गत छन्। कानुनले अनुमति दिएको अवस्थाबाहेक पूर्वअनुमति बिना तिनको प्रतिलिपि बनाउन वा व्यावसायिक प्रयोग गर्न पाइने छैन।"
  ] },
  { title: "9. Third-party services and links", titleNe: "९. तेस्रो पक्षका सेवा तथा लिङ्कहरू", body: [
    "The platform may use third-party services for hosting, authentication, storage, security or other functions, and may link to external websites. Those services and websites may have their own terms and privacy practices.",
    "TrustNepal is not responsible for the content, availability, products, services or privacy practices of third-party websites or providers. Your use of them is at your own discretion and subject to their terms."
  ], bodyNe: [
    "प्लेटफर्मले होस्टिङ, प्रयोगकर्ता प्रमाणीकरण, भण्डारण, सुरक्षा वा अन्य कार्यका लागि तेस्रो पक्षका सेवाहरू प्रयोग गर्न तथा बाह्य वेबसाइटका लिङ्कहरू उपलब्ध गराउन सक्छ। त्यस्ता सेवा र वेबसाइटका आफ्नै नियम तथा गोपनीयता अभ्यास हुन सक्छन्।",
    "तेस्रो पक्षका वेबसाइट वा सेवाप्रदायकको सामग्री, उपलब्धता, उत्पादन, सेवा वा गोपनीयता अभ्यासका लागि TrustNepal जिम्मेवार हुने छैन। त्यस्ता सेवा प्रयोग गर्ने वा नगर्ने निर्णय तपाईंको आफ्नै हुनेछ र तिनका सर्तहरू लागू हुनेछन्।"
  ] },
  { title: "10. Information and no endorsement", titleNe: "१०. जानकारी तथा समर्थनसम्बन्धी अस्वीकरण", body: [
    "Ratings and reviews are user-generated and may be incomplete, subjective, outdated or disputed. TrustNepal does not guarantee the accuracy, completeness, reliability, quality or current status of any listing, review, rating, product or service.",
    "You should make your own enquiries and decisions. Do not treat reviews or listings as professional, financial, medical, legal or other specialist advice. For important decisions, consult an appropriately qualified professional or the relevant provider."
  ], bodyNe: [
    "मूल्याङ्कन तथा समीक्षाहरू प्रयोगकर्ताले तयार गरेका सामग्री हुन् र ती अपूर्ण, व्यक्तिगत धारणा-आधारित, पुराना वा विवादित हुन सक्छन्। कुनै सूची, समीक्षा, मूल्याङ्कन, उत्पादन वा सेवाको शुद्धता, पूर्णता, विश्वसनीयता, गुणस्तर वा वर्तमान अवस्थाको TrustNepal ले प्रत्याभूति गर्दैन।",
    "आफैँ आवश्यक जानकारी बुझेर निर्णय गर्नुहोस्। समीक्षा वा सूचीलाई व्यावसायिक, वित्तीय, चिकित्सकीय, कानुनी वा अन्य विशेषज्ञ सल्लाहका रूपमा नलिनुहोस्। महत्त्वपूर्ण निर्णय गर्नुअघि सम्बन्धित योग्य विशेषज्ञ वा सेवाप्रदायकसँग परामर्श गर्नुहोस्।"
  ] },
  { title: "11. Availability and changes", titleNe: "११. सेवा उपलब्धता तथा परिवर्तन", body: [
    "We aim to keep TrustNepal available and secure, but we do not promise uninterrupted or error-free access. We may update, suspend or discontinue features, listings or parts of the platform for operational, security, legal or business reasons.",
    "We may update these Terms from time to time. The revised version will be published on this page with an updated date. If a change materially affects users, we will take reasonable steps to bring it to their attention. Continued use after the revised Terms take effect means you accept the updated Terms, to the extent permitted by law."
  ], bodyNe: [
    "TrustNepal लाई उपलब्ध र सुरक्षित राख्ने हाम्रो प्रयास रहनेछ; तथापि, सेवा निरन्तर वा त्रुटिरहित रूपमा उपलब्ध हुने ग्यारेन्टी हामी दिँदैनौँ। सञ्चालन, सुरक्षा, कानुनी वा व्यावसायिक कारणले हामी सुविधाहरू, सूचीहरू वा प्लेटफर्मका केही भाग अद्यावधिक, निलम्बन वा बन्द गर्न सक्छौँ।",
    "हामी समय–समयमा यी सर्तहरू संशोधन गर्न सक्छौँ। संशोधित संस्करण अद्यावधिक मितिसहित यसै पृष्ठमा प्रकाशित गरिनेछ। परिवर्तनले प्रयोगकर्तालाई महत्त्वपूर्ण असर पार्ने भएमा त्यसबारे जानकारी गराउन उचित प्रयास गरिनेछ। कानुनले अनुमति दिएको हदसम्म संशोधित सर्त लागू भएपछि प्लेटफर्म प्रयोग जारी राख्नुले अद्यावधिक सर्त स्वीकार गरेको मानिनेछ।"
  ] },
  { title: "12. Suspension and termination", titleNe: "१२. खाता निलम्बन तथा बन्द", body: [
    "You may stop using TrustNepal at any time. We may restrict, suspend or terminate access where reasonably necessary to protect users, the platform or third parties, to enforce these Terms, or to comply with law.",
    "Suspension or termination does not remove obligations or liabilities that arose before the account was closed. Some content may remain where required for legal, security, dispute-resolution or legitimate record-keeping purposes, as described in the Privacy Policy."
  ], bodyNe: [
    "तपाईंले जुनसुकै समयमा TrustNepal प्रयोग गर्न बन्द गर्न सक्नुहुन्छ। प्रयोगकर्ता, प्लेटफर्म वा तेस्रो पक्षको सुरक्षा गर्न, यी सर्त लागू गर्न वा कानुन पालना गर्न आवश्यक देखिएमा हामी पहुँचमा प्रतिबन्ध लगाउन, निलम्बन गर्न वा बन्द गर्न सक्छौँ।",
    "खाता निलम्बन वा बन्द हुँदैमा खाता बन्द हुनुअघि सिर्जना भएका दायित्व वा जिम्मेवारी समाप्त हुँदैनन्। गोपनीयता नीतिमा उल्लेख भएअनुसार कानुनी, सुरक्षा, विवाद समाधान वा वैध अभिलेख प्रयोजनका लागि केही सामग्री सुरक्षित रहन सक्छन्।"
  ] },
  { title: "13. Limitation of responsibility", titleNe: "१३. जिम्मेवारीको सीमा", body: [
    "To the extent permitted by applicable law, TrustNepal is not responsible for losses arising from reliance on user-generated reviews, dealings between users and listed entities, third-party services, unauthorised account access caused by circumstances outside our reasonable control, or temporary platform interruption.",
    "Nothing in these Terms excludes or limits responsibility where doing so would be unlawful. Your statutory rights, where applicable, remain unaffected."
  ], bodyNe: [
    "लागू कानुनले अनुमति दिएको हदसम्म, प्रयोगकर्ताले तयार गरेका समीक्षामा भरोसा गर्दा, प्रयोगकर्ता र सूचीकृत संस्थाबीचको कारोबार वा व्यवहारबाट, तेस्रो पक्षका सेवाबाट, हाम्रो उचित नियन्त्रणबाहिरका कारणले भएको अनधिकृत खाता पहुँचबाट वा प्लेटफर्म अस्थायी रूपमा अवरुद्ध हुँदा उत्पन्न हुने क्षतिका लागि TrustNepal जिम्मेवार हुने छैन।",
    "कानुनविपरीत हुने गरी यी सर्तहरूले कुनै जिम्मेवारी हटाउने वा सीमित गर्ने छैनन्। लागू हुने अवस्थामा कानुनले प्रदान गरेका तपाईंका अधिकारहरू यथावत् रहनेछन्।"
  ] },
  { title: "14. Indemnity", titleNe: "१४. क्षतिपूर्तिसम्बन्धी जिम्मेवारी", body: [
    "To the extent permitted by law, you are responsible for claims, losses and reasonable costs arising from content you submit or your misuse of TrustNepal, including infringement of another person's rights or breach of these Terms. This does not apply to the extent a claim is caused by TrustNepal's own unlawful conduct."
  ], bodyNe: [
    "कानुनले अनुमति दिएको हदसम्म, तपाईंले पेश गरेको सामग्री वा TrustNepal को दुरुपयोगका कारण उत्पन्न हुने दाबी, क्षति तथा उचित खर्चको जिम्मेवारी तपाईंको हुनेछ। यसमा अरू व्यक्तिको अधिकार उल्लङ्घन वा यी सर्तको उल्लङ्घनसमेत पर्छ। TrustNepal कै गैरकानुनी कार्यका कारण उत्पन्न भएको हदसम्म यो व्यवस्था लागू हुने छैन।"
  ] },
  { title: "15. Governing law and disputes", titleNe: "१५. लागू हुने कानुन तथा विवाद समाधान", body: [
    "These Terms are intended to be interpreted consistently with the laws of Nepal. Disputes will be handled by the competent authorities or courts of Nepal, subject to applicable law and any mandatory consumer protections."
  ], bodyNe: [
    "यी सर्तहरूको व्याख्या नेपालको प्रचलित कानुनअनुसार गरिनेछ। लागू कानुन तथा उपभोक्ताका अनिवार्य संरक्षणसम्बन्धी व्यवस्थाको अधीनमा रही विवादको निरूपण नेपालका अधिकारप्राप्त निकाय वा अदालतबाट हुनेछ।"
  ] },
  { title: "16. Contact", titleNe: "१६. सम्पर्क", body: [
    "For questions, complaints or reports relating to these Terms, use the contact or support channel made available on the TrustNepal website. Include the relevant page, listing or review details so we can understand your request."
  ], bodyNe: [
    "यी सर्तसँग सम्बन्धित प्रश्न, गुनासो वा उजुरीका लागि TrustNepal वेबसाइटमा उपलब्ध सम्पर्क वा सहायता माध्यम प्रयोग गर्नुहोस्। तपाईंको अनुरोध बुझ्न सहज होस् भनेर सम्बन्धित पृष्ठ, सूची वा समीक्षाको विवरणसमेत उल्लेख गर्नुहोस्।"
  ] }
];

export default function TermsPage() {
  const { language } = useLanguage();
  const ne = language === "ne";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">Trust<span className="text-green-700">Nepal</span></Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-green-700">{ne ? "गृहपृष्ठमा फर्कनुहोस्" : "Back to Home"}</Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        <div className="mb-8 rounded-2xl bg-green-800 px-6 py-8 text-white sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-200">{ne ? "TrustNepal का नीतिहरू" : "TrustNepal Policies"}</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{ne ? "नियम तथा सर्तहरू" : "Terms & Conditions"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-green-50">{ne ? "TrustNepal मा खाता सिर्जना गर्नुअघि वा प्लेटफर्म प्रयोग गर्नुअघि यी सर्तहरू ध्यानपूर्वक पढ्नुहोस्। यसमा खाता, समीक्षा र प्लेटफर्म प्रयोगसम्बन्धी नियमहरू उल्लेख छन्।" : "Please read these terms before creating an account or using TrustNepal. They explain the rules for accounts, reviews and use of our platform."}</p>
          <p className="mt-4 text-xs text-green-200">{ne ? "अन्तिम अद्यावधिक: १८ नोभेम्बर २०२६" : "Last updated: 18 November 2026"}</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm">
          <span className="font-semibold text-gray-700">{ne ? "सम्बन्धित नीति:" : "Related policy:"}</span>
          <Link href="/privacy" className="font-semibold text-green-700 hover:underline">{ne ? "गोपनीयता नीति" : "Privacy Policy"}</Link>
          <span className="text-gray-300">|</span>
          <Link href="/" className="font-semibold text-green-700 hover:underline">{ne ? "TrustNepal गृहपृष्ठ" : "TrustNepal Homepage"}</Link>
        </div>

        <div className="space-y-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          {sections.map((section) => (
            <section key={section.title} className="scroll-mt-8">
              <h2 className="text-lg font-bold text-gray-900">{ne ? section.titleNe : section.title}</h2>
              <div className="mt-3 space-y-3">
                {(ne ? section.bodyNe : section.body).map((paragraph, index) => <p key={index} className="text-sm leading-7 text-gray-600">{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900">{ne ? "समीक्षा तथा सामग्री प्रकाशनको जिम्मेवारी" : "Responsibility for Reviews and Published Content"}</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">{ne ? "TrustNepal मा समीक्षा, प्रतिक्रिया वा अन्य कुनै सामग्री प्रकाशित गर्ने प्रत्येक प्रयोगकर्ता आफ्नो प्रकाशित सामग्रीको सत्यता, वैधता र त्यसबाट उत्पन्न हुने कानुनी जिम्मेवारीका लागि स्वयं जिम्मेवार हुनेछ। प्रचलित कानुनविपरीत हुने, झूटा, भ्रामक, मानहानिकारक वा अरूको अधिकार उल्लङ्घन गर्ने सामग्री प्रकाशित गरेमा त्यसबाट उत्पन्न हुने कानुनी परिणामको जिम्मेवारी सम्बन्धित सामग्री प्रकाशित गर्ने व्यक्तिकै हुनेछ।" : "Every user who publishes a review, feedback or any other content on TrustNepal is personally responsible for the truthfulness and legality of the content they publish and for the legal consequences arising from it. If a user publishes content that violates applicable law, is false, misleading, defamatory or infringes the rights of others, the user who published that content shall be responsible for the resulting legal consequences, to the extent provided by applicable law."}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/privacy" className="text-green-700 hover:underline">{ne ? "गोपनीयता नीति पढ्नुहोस् →" : "Read Privacy Policy →"}</Link>
          <Link href="/" className="text-gray-600 hover:text-green-700">{ne ? "गृहपृष्ठमा फर्कनुहोस्" : "Return to Homepage"}</Link>
        </div>
      </article>

      <footer className="border-t border-gray-200 bg-white px-5 py-7 text-center text-xs text-gray-500">© 2026 TrustNepal. {ne ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}</footer>
    </main>
  );
}
