"use client";

import Link from "next/link";
import { useLanguage } from "../components/language-provider";
import LanguageSwitcher from "../components/language-switcher";

const sections = [
  { title: "1. Introduction", titleNe: "१. परिचय", body: [
    "This Privacy Policy explains how TrustNepal collects, uses, stores and shares information when you visit or use our website and services.",
    "By creating an account or using TrustNepal, you acknowledge this Policy. Our Terms & Conditions also apply to your use of the platform."
  ], bodyNe: [
    "यस गोपनीयता नीतिमा तपाईंले TrustNepal वेबसाइट तथा सेवाहरू भ्रमण वा प्रयोग गर्दा हामीले जानकारी कसरी सङ्कलन, प्रयोग, भण्डारण तथा साझा गर्छौँ भन्ने कुरा स्पष्ट गरिएको छ।",
    "TrustNepal मा खाता सिर्जना वा प्लेटफर्म प्रयोग गरेर तपाईंले यस नीतिबारे जानकारी प्राप्त गरेको स्वीकार गर्नुहुन्छ। प्लेटफर्मको प्रयोगमा हाम्रा नियम तथा सर्तहरू पनि लागू हुन्छन्।"
  ] },
  { title: "2. Information we collect", titleNe: "२. हामीले सङ्कलन गर्ने जानकारी", body: [
    "Account information: when you register or update your profile, we may collect information such as your name, email address, phone number, profile photograph and other details you choose to provide. If you sign in using Google, we receive the account information made available through that sign-in process.",
    "User content: we collect the ratings, reviews, replies, reports, profile details and other information you submit through TrustNepal, together with the date and time and the listing to which your content relates.",
    "Technical and usage information: our systems and service providers may process information such as IP address, browser and device details, log records, session information, security events and basic interactions needed to operate, protect and troubleshoot the service.",
    "Draft information: if you begin a review while signed out, your browser may temporarily store the draft locally so it can be restored after you sign in or register. This draft storage is on your device/browser and may be cleared by you through browser settings."
  ], bodyNe: [
    "खाता जानकारी: तपाईंले खाता दर्ता गर्दा वा आफ्नो प्रोफाइल अद्यावधिक गर्दा हामी तपाईंको नाम, इमेल ठेगाना, फोन नम्बर, प्रोफाइल तस्बिर तथा तपाईंले उपलब्ध गराउन रोज्नुभएका अन्य विवरण सङ्कलन गर्न सक्छौँ। Google मार्फत लगइन गर्दा उक्त लगइन प्रक्रियाबाट उपलब्ध गराइएको खाता जानकारी हामी प्राप्त गर्छौँ।",
    "प्रयोगकर्ताले पेश गरेको सामग्री: TrustNepal मार्फत तपाईंले पेश गर्ने मूल्याङ्कन, समीक्षा, जवाफ, उजुरी, प्रोफाइल विवरण तथा अन्य जानकारी हामी सङ्कलन गर्छौँ। यसमा सामग्रीसँग सम्बन्धित मिति, समय र सूचीको विवरणसमेत पर्न सक्छ।",
    "प्राविधिक तथा प्रयोगसम्बन्धी जानकारी: सेवा सञ्चालन, सुरक्षा तथा समस्या समाधानका लागि हाम्रा प्रणाली र सेवाप्रदायकले IP ठेगाना, ब्राउजर तथा उपकरणको विवरण, लग अभिलेख, सेसनसम्बन्धी जानकारी, सुरक्षा घटना र आधारभूत प्रयोग गतिविधिजस्ता जानकारी प्रशोधन गर्न सक्छन्।",
    "मस्यौदा जानकारी: तपाईंले लगइन नगरी समीक्षा लेख्न सुरु गर्नुभयो भने, लगइन वा दर्तापछि पुनः प्राप्त गर्न सकियोस् भनेर तपाईंको ब्राउजरले उक्त मस्यौदा अस्थायी रूपमा स्थानीय रूपमा सुरक्षित गर्न सक्छ। यस्तो मस्यौदा तपाईंको उपकरण वा ब्राउजरमा रहन्छ र ब्राउजरको सेटिङबाट हटाउन सकिन्छ।"
  ] },
  { title: "3. How we use information", titleNe: "३. जानकारीको प्रयोग", body: [
    "We use information to create and manage accounts; authenticate users; display profiles and user-submitted content; publish and moderate reviews; provide replies and reporting features; respond to requests; maintain security; prevent fraud, spam and abuse; troubleshoot problems; and operate and improve TrustNepal.",
    "We may also use information to meet legal obligations, resolve disputes, enforce our Terms & Conditions, and protect the rights, safety and property of TrustNepal, users and other people."
  ], bodyNe: [
    "खाता सिर्जना तथा व्यवस्थापन, प्रयोगकर्ता प्रमाणीकरण, प्रोफाइल र प्रयोगकर्ताले पेश गरेको सामग्री प्रदर्शन, समीक्षा प्रकाशन तथा व्यवस्थापन, जवाफ र उजुरी सुविधा उपलब्ध गराउने, अनुरोधको जवाफ दिने, सुरक्षा कायम गर्ने, ठगी, स्पाम तथा दुरुपयोग रोक्ने, समस्या समाधान गर्ने र TrustNepal सञ्चालन तथा सुधार गर्ने प्रयोजनका लागि हामी जानकारी प्रयोग गर्छौँ।",
    "कानुनी दायित्व पूरा गर्न, विवाद समाधान गर्न, हाम्रा नियम तथा सर्त लागू गर्न र TrustNepal, प्रयोगकर्ता तथा अन्य व्यक्तिको अधिकार, सुरक्षा र सम्पत्तिको संरक्षण गर्न पनि जानकारी प्रयोग गर्न सकिन्छ।"
  ] },
  { title: "4. Information visible to the public", titleNe: "४. सार्वजनिक रूपमा देखिने जानकारी", body: [
    "TrustNepal is a public review platform. Reviews and replies that are approved for publication may be visible to visitors. Depending on your profile settings and the information displayed by the platform, your display name and profile photograph may appear with your public contributions.",
    "Do not include phone numbers, email addresses, home addresses, financial details, health details or other private information in a review or reply. Information you choose to publish may be copied, shared or indexed by others.",
    "Your account email address, password and private authentication credentials are not intended to be displayed publicly."
  ], bodyNe: [
    "TrustNepal सार्वजनिक समीक्षा प्लेटफर्म हो। प्रकाशनका लागि स्वीकृत समीक्षा तथा जवाफ वेबसाइटका आगन्तुकले हेर्न सक्नेछन्। तपाईंको प्रोफाइल सेटिङ तथा प्लेटफर्ममा देखाइने जानकारीअनुसार सार्वजनिक योगदानसँगै तपाईंको प्रदर्शन नाम र प्रोफाइल तस्बिर देखिन सक्छ।",
    "समीक्षा वा जवाफमा फोन नम्बर, इमेल ठेगाना, घरको ठेगाना, वित्तीय विवरण, स्वास्थ्यसम्बन्धी विवरण वा अन्य निजी जानकारी समावेश नगर्नुहोस्। तपाईंले सार्वजनिक गर्ने जानकारी अरूले प्रतिलिपि, साझा वा खोज प्रणालीमा सूचीकृत गर्न सक्छन्।",
    "तपाईंको खाता इमेल ठेगाना, पासवर्ड तथा निजी प्रमाणीकरण विवरण सार्वजनिक रूपमा प्रदर्शन गर्ने उद्देश्य राखिएको छैन।"
  ] },
  { title: "5. When we share information", titleNe: "५. जानकारी साझा गरिने अवस्था", body: [
    "We may share information with service providers that help us host the website, authenticate accounts, store data, maintain security or provide other technical services. They may process information only as needed to provide their services to us and subject to appropriate safeguards.",
    "We may disclose information where required by law, legal process or a lawful request from a competent authority, or where reasonably necessary to investigate abuse, enforce our Terms, protect users or protect the platform.",
    "If TrustNepal is involved in a merger, restructuring, transfer or sale of all or part of its operations, information may be transferred as part of that process, subject to applicable law and appropriate protections.",
    "We do not sell personal information to third parties as a business practice."
  ], bodyNe: [
    "वेबसाइट होस्ट गर्ने, खाता प्रमाणीकरण गर्ने, तथ्याङ्क भण्डारण गर्ने, सुरक्षा कायम गर्ने वा अन्य प्राविधिक सेवा उपलब्ध गराउने सेवाप्रदायकसँग हामी जानकारी साझा गर्न सक्छौँ। त्यस्ता सेवाप्रदायकले हामीलाई सेवा उपलब्ध गराउन आवश्यक हदसम्म र उपयुक्त सुरक्षा उपायको अधीनमा रही मात्र जानकारी प्रशोधन गर्न पाउनेछन्।",
    "कानुन, कानुनी प्रक्रिया वा अधिकारप्राप्त निकायको वैध अनुरोधअनुसार आवश्यक भएमा, वा दुरुपयोगको जाँच गर्न, हाम्रा सर्त लागू गर्न, प्रयोगकर्ता वा प्लेटफर्मको सुरक्षा गर्न उचित रूपमा आवश्यक भएमा हामी जानकारी खुलाउन सक्छौँ।",
    "TrustNepal कुनै अर्को संस्थासँग गाभिएमा, पुनर्संरचना भएमा, सञ्चालनको सम्पूर्ण वा केही भाग हस्तान्तरण वा बिक्री भएमा लागू कानुन तथा उपयुक्त सुरक्षा उपायको अधीनमा रही उक्त प्रक्रियाको भागका रूपमा जानकारी हस्तान्तरण हुन सक्छ।",
    "हामी व्यावसायिक अभ्यासका रूपमा व्यक्तिगत जानकारी तेस्रो पक्षलाई बिक्री गर्दैनौँ।"
  ] },
  { title: "6. Cookies, sessions and local storage", titleNe: "६. कुकीज, सेसन तथा स्थानीय भण्डारण", body: [
    "TrustNepal and its service providers may use cookies, browser storage or similar technologies to keep you signed in, maintain session security, remember necessary preferences and support core website functions.",
    "A review draft may be stored in your browser's local storage until it is submitted, overwritten or cleared. Clearing browser data may remove a saved draft or sign you out.",
    "You can manage cookies and local storage through your browser settings. Disabling some storage may affect sign-in or other platform features."
  ], bodyNe: [
    "तपाईंलाई लगइन अवस्थामा राख्न, सेसन सुरक्षा कायम गर्न, आवश्यक प्राथमिकता सम्झन तथा वेबसाइटका मुख्य सुविधा सञ्चालन गर्न TrustNepal र यसका सेवाप्रदायकले कुकीज, ब्राउजर भण्डारण वा यस्तै प्रविधि प्रयोग गर्न सक्छन्।",
    "समीक्षाको मस्यौदा पेश, प्रतिस्थापन वा हटाइएनसम्म तपाईंको ब्राउजरको स्थानीय भण्डारणमा रहन सक्छ। ब्राउजरको डेटा हटाउँदा सुरक्षित मस्यौदा मेटिन वा तपाईं लगआउट हुन सक्नुहुन्छ।",
    "तपाईंले ब्राउजर सेटिङबाट कुकीज तथा स्थानीय भण्डारण व्यवस्थापन गर्न सक्नुहुन्छ। केही भण्डारण सुविधा बन्द गर्दा लगइन वा प्लेटफर्मका अन्य सुविधामा असर पर्न सक्छ।"
  ] },
  { title: "7. Data retention", titleNe: "७. जानकारी सुरक्षित राख्ने अवधि", body: [
    "We keep personal information for as long as reasonably necessary to provide the service, maintain account and review records, enforce our Terms, resolve disputes, meet legal obligations and protect the platform.",
    "If you request account or content deletion, we will consider the request in light of applicable law, security needs, moderation records, dispute handling and legitimate record-keeping. Some information may need to be retained or may remain in backups for a limited period."
  ], bodyNe: [
    "सेवा उपलब्ध गराउन, खाता तथा समीक्षा अभिलेख कायम राख्न, हाम्रा सर्त लागू गर्न, विवाद समाधान गर्न, कानुनी दायित्व पूरा गर्न र प्लेटफर्मको सुरक्षा गर्न उचित रूपमा आवश्यक अवधिसम्म हामी व्यक्तिगत जानकारी सुरक्षित राख्छौँ।",
    "तपाईंले खाता वा सामग्री हटाउन अनुरोध गर्नुभयो भने लागू कानुन, सुरक्षा आवश्यकता, सामग्री व्यवस्थापन अभिलेख, विवाद समाधान तथा वैध अभिलेख संरक्षणका आधारमा हामी अनुरोधको मूल्याङ्कन गर्नेछौँ। केही जानकारी सुरक्षित राख्नुपर्ने हुन सक्छ वा सीमित अवधिसम्म ब्याकअपमा रहन सक्छ।"
  ] },
  { title: "8. Security", titleNe: "८. सुरक्षा", body: [
    "We use reasonable technical and organisational measures intended to protect information against unauthorised access, loss, misuse or alteration. No website, internet transmission or storage system can be guaranteed to be completely secure.",
    "You should use a strong, unique password, keep your sign-in details private and notify us through the website's available support channel if you suspect unauthorised access to your account."
  ], bodyNe: [
    "अनधिकृत पहुँच, हराउने, दुरुपयोग वा परिवर्तनबाट जानकारी जोगाउने उद्देश्यले हामी उचित प्राविधिक तथा व्यवस्थापकीय सुरक्षा उपाय अपनाउँछौँ। कुनै पनि वेबसाइट, इन्टरनेटमार्फत हुने डेटा आदानप्रदान वा भण्डारण प्रणाली पूर्ण रूपमा सुरक्षित हुन्छ भन्ने ग्यारेन्टी दिन सकिँदैन।",
    "बलियो र अरू खातामा प्रयोग नगरिएको पासवर्ड प्रयोग गर्नुहोस्, आफ्नो लगइन विवरण गोप्य राख्नुहोस् र तपाईंको खातामा अनधिकृत पहुँच भएको शंका लागेमा वेबसाइटमा उपलब्ध सहायता माध्यमबाट हामीलाई जानकारी दिनुहोस्।"
  ] },
  { title: "9. Your choices and requests", titleNe: "९. तपाईंका विकल्प तथा अनुरोधहरू", body: [
    "You may review and update certain profile information through the features available in your account. You may also contact TrustNepal to request access to, correction of, or deletion of personal information, or to raise a privacy concern.",
    "We may need to verify your identity before acting on a request. Some requests may be limited where we are required or permitted to retain information, protect another person's rights, preserve evidence or comply with law."
  ], bodyNe: [
    "तपाईंले आफ्नो खातामा उपलब्ध सुविधामार्फत केही प्रोफाइल जानकारी हेर्न र अद्यावधिक गर्न सक्नुहुन्छ। व्यक्तिगत जानकारीमा पहुँच, सच्याउने वा हटाउने अनुरोध गर्न अथवा गोपनीयतासम्बन्धी चिन्ता राख्न TrustNepal मा सम्पर्क गर्न पनि सक्नुहुन्छ।",
    "अनुरोधमाथि कारबाही गर्नुअघि हामीले तपाईंको पहिचान पुष्टि गर्नुपर्ने हुन सक्छ। जानकारी सुरक्षित राख्नुपर्ने वा राख्न पाउने कानुनी अवस्था, अरू व्यक्तिको अधिकार संरक्षण, प्रमाण सुरक्षित राख्ने आवश्यकता वा कानुन पालना गर्नुपर्ने अवस्थामा केही अनुरोध सीमित हुन सक्छन्।"
  ] },
  { title: "10. Children's privacy", titleNe: "१०. बालबालिकाको गोपनीयता", body: [
    "TrustNepal is not designed to knowingly collect personal information from children who are not permitted to use online services under applicable law. If you believe a child has provided personal information without appropriate authorisation, please contact us through the website's available support channel so we can review the matter."
  ], bodyNe: [
    "लागू कानुनअनुसार अनलाइन सेवा प्रयोग गर्न अनुमति नभएका बालबालिकाबाट जानीजानी व्यक्तिगत जानकारी सङ्कलन गर्ने उद्देश्यले TrustNepal तयार गरिएको होइन। उपयुक्त अनुमति बिना कुनै बालबालिकाले व्यक्तिगत जानकारी उपलब्ध गराएको तपाईंलाई लागेमा विषयको समीक्षा गर्न वेबसाइटमा उपलब्ध सहायता माध्यमबाट हामीलाई सम्पर्क गर्नुहोस्।"
  ] },
  { title: "11. Third-party websites and services", titleNe: "११. तेस्रो पक्षका वेबसाइट तथा सेवाहरू", body: [
    "TrustNepal may contain links to third-party websites or use third-party sign-in and infrastructure services. We do not control the privacy practices of independent third parties. Please read their privacy notices before providing information to them."
  ], bodyNe: [
    "TrustNepal मा तेस्रो पक्षका वेबसाइटका लिङ्क हुन सक्छन् वा तेस्रो पक्षका लगइन तथा पूर्वाधारसम्बन्धी सेवा प्रयोग हुन सक्छन्। स्वतन्त्र तेस्रो पक्षका गोपनीयता अभ्यासमाथि हाम्रो नियन्त्रण हुँदैन। त्यस्ता पक्षलाई आफ्नो जानकारी उपलब्ध गराउनुअघि तिनको गोपनीयता सूचना पढ्नुहोस्।"
  ] },
  { title: "12. Changes to this Policy", titleNe: "१२. यस नीतिमा हुने परिवर्तन", body: [
    "We may update this Privacy Policy as TrustNepal's features, operations or legal requirements change. The latest version will be published on this page with its updated date. Where appropriate, we will take reasonable steps to notify users of material changes."
  ], bodyNe: [
    "TrustNepal का सुविधा, सञ्चालन वा कानुनी आवश्यकतामा परिवर्तन भएअनुसार हामी यो गोपनीयता नीति अद्यावधिक गर्न सक्छौँ। पछिल्लो संस्करण अद्यावधिक मितिसहित यसै पृष्ठमा प्रकाशित गरिनेछ। उपयुक्त अवस्थामा महत्त्वपूर्ण परिवर्तनबारे प्रयोगकर्तालाई जानकारी गराउन उचित प्रयास गरिनेछ।"
  ] },
  { title: "13. Contact us", titleNe: "१३. हामीलाई सम्पर्क गर्नुहोस्", body: [
    "For privacy questions or requests, use the contact or support channel made available on the TrustNepal website. Please describe your request clearly and include the email address associated with your account where appropriate. Do not send your password or other login credentials."
  ], bodyNe: [
    "गोपनीयतासम्बन्धी प्रश्न वा अनुरोधका लागि TrustNepal वेबसाइटमा उपलब्ध सम्पर्क वा सहायता माध्यम प्रयोग गर्नुहोस्। आफ्नो अनुरोध स्पष्ट रूपमा उल्लेख गर्नुहोस् र आवश्यक भएमा खातासँग सम्बन्धित इमेल ठेगाना उपलब्ध गराउनुहोस्। आफ्नो पासवर्ड वा अन्य लगइन विवरण नपठाउनुहोस्।"
  ] }
];

export default function PrivacyPage() {
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
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{ne ? "गोपनीयता नीति" : "Privacy Policy"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-green-50">{ne ? "TrustNepal ले कुन जानकारी सङ्कलन गर्छ, किन प्रयोग गर्छ, कहिले साझा गर्न सक्छ र तपाईंका विकल्पहरू के छन् भन्ने कुरा यहाँ पढ्नुहोस्।" : "Learn what information TrustNepal collects, why it is used, when it may be shared and what choices you have."}</p>
          <p className="mt-4 text-xs text-green-200">{ne ? "अन्तिम अद्यावधिक: १८ नोभेम्बर २०२६" : "Last updated: 18 November 2026"}</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm">
          <span className="font-semibold text-gray-700">{ne ? "सम्बन्धित नीति:" : "Related policy:"}</span>
          <Link href="/terms" className="font-semibold text-green-700 hover:underline">{ne ? "नियम तथा सर्तहरू" : "Terms & Conditions"}</Link>
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
          <h2 className="font-bold text-gray-900">{ne ? "कानुनी पालना तथा व्यक्तिगत जानकारीको संरक्षण" : "Legal Compliance and Protection of Personal Information"}</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">{ne ? "TrustNepal प्रचलित नेपाली कानुन तथा लागू हुने अन्य कानुनी व्यवस्थाहरूको पालना गर्न प्रतिबद्ध छ। हाल लागू रहेका तथा भविष्यमा लागू हुने सम्बन्धित ऐन, नियम, विनियम र अधिकारप्राप्त निकायका कानुनी निर्देशनहरूको पालना गर्नु TrustNepal को जिम्मेवारी हुनेछ।" : "TrustNepal is committed to complying with the laws of Nepal and other applicable legal requirements. TrustNepal is responsible for complying with relevant acts, rules, regulations and lawful directives of competent authorities that are currently in force or become applicable in the future."}</p>
          <p className="mt-2 text-sm leading-7 text-gray-600">{ne ? "हामी यस गोपनीयता नीतिमा उल्लेख गरिएका उद्देश्य तथा लागू कानुनअनुसार व्यक्तिगत जानकारी सङ्कलन, प्रयोग, भण्डारण र साझा गर्नेछौँ तथा त्यस्तो जानकारीको सुरक्षा गर्न उचित उपाय अपनाउनेछौँ।" : "We will collect, use, store and share personal information for the purposes described in this Privacy Policy and as permitted or required by applicable law, and will take reasonable measures to protect that information."}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/terms" className="text-green-700 hover:underline">{ne ? "नियम तथा सर्तहरू पढ्नुहोस् →" : "Read Terms & Conditions →"}</Link>
          <Link href="/" className="text-gray-600 hover:text-green-700">{ne ? "गृहपृष्ठमा फर्कनुहोस्" : "Return to Homepage"}</Link>
        </div>
      </article>

      <footer className="border-t border-gray-200 bg-white px-5 py-7 text-center text-xs text-gray-500">© 2026 TrustNepal. {ne ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}</footer>
    </main>
  );
}
