"use client";

import Link from "next/link";
import { useLanguage } from "../components/language-provider";
import LanguageSwitcher from "../components/language-switcher";

const sections = [
  {
    title: "1. Share your own experience",
    titleNe: "१. आफ्नो वास्तविक अनुभव साझा गर्नुहोस्",
    body: [
      "Reviews should be based on your own genuine, first-hand experience with the product, service, place, institution or other item being reviewed. Write about something you personally used, visited, watched, read, purchased or experienced.",
      "Do not present another person's experience as your own. If you are sharing an experience involving a family member or someone you directly accompanied, clearly explain your own role and what you personally observed."
    ],
    bodyNe: [
      "समीक्षा तपाईंले समीक्षा गर्न लागेको उत्पादन, सेवा, स्थान, संस्था वा अन्य विषयसँगको आफ्नै वास्तविक र प्रत्यक्ष अनुभवमा आधारित हुनुपर्छ। आफूले व्यक्तिगत रूपमा प्रयोग, भ्रमण, हेरेको, पढेको, खरिद गरेको वा अनुभव गरेको विषयबारे लेख्नुहोस्।",
      "अरू कसैको अनुभवलाई आफ्नो अनुभवका रूपमा प्रस्तुत नगर्नुहोस्। परिवारको सदस्य वा आफू सँगै सहभागी भएको व्यक्तिसँग सम्बन्धित अनुभव साझा गर्दा आफ्नो भूमिका र आफूले प्रत्यक्ष देखेको वा अनुभव गरेको कुरा स्पष्ट पार्नुहोस्।"
    ]
  },
  {
    title: "2. Guidelines for different categories",
    titleNe: "२. विभिन्न श्रेणीका लागि समीक्षा निर्देशिका",
    body: [
      "Products: Review products you have personally purchased, used or tried. Where relevant, mention how long you used the product and how it performed.",
      "Movies: Review movies you have personally watched. You may discuss the story, acting, direction, visuals and your overall viewing experience.",
      "Books: Review books you have personally read. You may comment on the content, writing style, usefulness and your reading experience.",
      "Hotels and Restaurants: Share experiences from places you personally visited, stayed at, ordered from or received services from. Mention relevant details such as service, cleanliness, food or facilities.",
      "Education: Write about an institution or course where you personally studied, enrolled or participated. A parent or guardian may describe their direct experience with a child's education, while clearly identifying their perspective.",
      "Finance: Review financial products or services you personally used or directly interacted with. Describe your experience rather than presenting personal financial advice to others.",
      "Health: Share your direct experience of a healthcare provider or service. Avoid publishing private medical details or presenting your review as professional medical advice.",
      "Other Services: Review services you personally received or attempted to obtain. Explain what service you requested, how the provider responded and the outcome."
    ],
    bodyNe: [
      "उत्पादन: आफूले व्यक्तिगत रूपमा खरिद, प्रयोग वा परीक्षण गरेको उत्पादनको समीक्षा गर्नुहोस्। आवश्यकताअनुसार कति समय प्रयोग गर्नुभयो र त्यसको कार्यसम्पादन कस्तो रह्यो भन्ने उल्लेख गर्नुहोस्।",
      "चलचित्र: आफूले व्यक्तिगत रूपमा हेरेको चलचित्रको समीक्षा गर्नुहोस्। कथा, अभिनय, निर्देशन, दृश्य र समग्र हेर्ने अनुभवबारे लेख्न सक्नुहुन्छ।",
      "पुस्तक: आफूले पढेको पुस्तकको समीक्षा गर्नुहोस्। विषयवस्तु, लेखनशैली, उपयोगिता र पढ्दाको अनुभव उल्लेख गर्न सक्नुहुन्छ।",
      "होटल तथा रेस्टुरेन्ट: आफूले भ्रमण, बसोबास, खाना अर्डर वा सेवा प्राप्त गरेको स्थानको अनुभव साझा गर्नुहोस्। सेवा, सरसफाइ, खाना वा सुविधाजस्ता सान्दर्भिक विवरण उल्लेख गर्नुहोस्।",
      "शिक्षा: आफूले अध्ययन, भर्ना वा सहभागिता जनाएको शैक्षिक संस्था वा पाठ्यक्रमबारे लेख्नुहोस्। अभिभावकले बालबालिकाको शिक्षासँग सम्बन्धित आफ्नो प्रत्यक्ष अनुभव साझा गर्न सक्छन्; आफ्नो दृष्टिकोण स्पष्ट पार्नुहोस्।",
      "वित्त: आफूले प्रयोग गरेको वा प्रत्यक्ष कारोबार/सम्पर्क गरेको वित्तीय उत्पादन वा सेवाबारे समीक्षा गर्नुहोस्। अरूलाई व्यक्तिगत वित्तीय सल्लाह दिनुको सट्टा आफ्नो अनुभव वर्णन गर्नुहोस्।",
      "स्वास्थ्य: स्वास्थ्य सेवा प्रदायक वा सेवासँगको आफ्नो प्रत्यक्ष अनुभव साझा गर्नुहोस्। निजी स्वास्थ्य विवरण सार्वजनिक नगर्नुहोस् र आफ्नो समीक्षालाई व्यावसायिक चिकित्सकीय सल्लाहका रूपमा प्रस्तुत नगर्नुहोस्।",
      "अन्य सेवाहरू: आफूले प्राप्त गरेको वा प्राप्त गर्ने प्रयास गरेको सेवाको समीक्षा गर्नुहोस्। कुन सेवा माग्नुभयो, सेवा प्रदायकले कस्तो प्रतिक्रिया दियो र अन्तिम परिणाम के भयो भन्ने स्पष्ट पार्नुहोस्।"
    ]
  },
  {
    title: "3. Choose the right time to review",
    titleNe: "३. समीक्षा लेख्ने उपयुक्त समय छान्नुहोस्",
    body: [
      "Allow yourself enough time to form a fair opinion. For products or ongoing services, consider using them long enough to understand their performance. For a one-time experience, you may write a review after the experience is complete.",
      "When useful, mention approximately when the experience took place. If your experience changes later, consider updating your review so readers have a more current picture."
    ],
    bodyNe: [
      "निष्पक्ष धारणा बनाउन पर्याप्त समय लिनुहोस्। उत्पादन वा निरन्तर प्रयोग हुने सेवाका लागि त्यसको कार्यसम्पादन बुझ्न पर्याप्त समय प्रयोग गर्नुहोस्। एकपटकको अनुभव भएमा अनुभव पूरा भएपछि समीक्षा लेख्न सक्नुहुन्छ।",
      "उपयोगी हुने अवस्थामा अनुभव कहिले भएको थियो भन्ने अनुमानित समय उल्लेख गर्नुहोस्। पछि तपाईंको अनुभव परिवर्तन भएमा पाठकले पछिल्लो अवस्था बुझ्न सकून् भनेर समीक्षा अद्यावधिक गर्ने विचार गर्नुहोस्।"
    ]
  },
  {
    title: "4. Write clear and useful reviews",
    titleNe: "४. स्पष्ट र उपयोगी समीक्षा लेख्नुहोस्",
    body: [
      "A helpful review explains what you expected, what actually happened and why you formed your opinion. Include specific details that may help another person make an informed decision.",
      "You may describe positive aspects, areas that could be improved and the overall outcome. Separate facts you directly observed from your personal opinions or expectations.",
      "Keep your review relevant, readable and respectful. Clear and specific descriptions are generally more useful than very short comments without context."
    ],
    bodyNe: [
      "उपयोगी समीक्षामा तपाईंको अपेक्षा के थियो, वास्तवमा के भयो र तपाईंले त्यस्तो धारणा किन बनाउनुभयो भन्ने कुरा स्पष्ट हुन्छ। अरूलाई जानकारीपूर्ण निर्णय लिन सहयोग पुग्ने ठोस विवरण समावेश गर्नुहोस्।",
      "राम्रो पक्ष, सुधार गर्नुपर्ने पक्ष र समग्र परिणाम उल्लेख गर्न सक्नुहुन्छ। आफूले प्रत्यक्ष देखेका तथ्य र आफ्नो व्यक्तिगत विचार वा अपेक्षालाई छुट्टाछुट्टै स्पष्ट पार्नुहोस्।",
      "समीक्षा विषयसँग सम्बन्धित, पढ्न सजिलो र सम्मानजनक राख्नुहोस्। सन्दर्भबिनाका अत्यन्त छोटा टिप्पणीभन्दा स्पष्ट र ठोस विवरण सामान्यतया बढी उपयोगी हुन्छन्।"
    ]
  },
  {
    title: "5. Be fair and provide context",
    titleNe: "५. निष्पक्ष हुनुहोस् र आवश्यक सन्दर्भ दिनुहोस्",
    body: [
      "Describe your experience honestly and in context. Where relevant, explain the circumstances that affected your experience, such as the date, type of service, product version or nature of your visit.",
      "Your experience may differ from another person's experience. It is acceptable to express a positive or negative opinion, provided it reflects your own experience and is explained clearly."
    ],
    bodyNe: [
      "आफ्नो अनुभव इमानदारीपूर्वक र आवश्यक सन्दर्भसहित वर्णन गर्नुहोस्। सान्दर्भिक भएमा मिति, सेवाको प्रकार, उत्पादनको संस्करण वा भ्रमणको अवस्था जस्ता अनुभवमा प्रभाव पार्ने कुरा उल्लेख गर्नुहोस्।",
      "तपाईंको अनुभव अरू व्यक्तिको अनुभवभन्दा फरक हुन सक्छ। आफ्नो अनुभवमा आधारित र स्पष्ट रूपमा व्याख्या गरिएको सकारात्मक वा नकारात्मक दुवै धारणा व्यक्त गर्न सकिन्छ।"
    ]
  },
  {
    title: "6. Keep relevant information available",
    titleNe: "६. आवश्यक जानकारी सुरक्षित राख्नुहोस्",
    body: [
      "Depending on the nature of a review, you may wish to keep relevant supporting information, such as a receipt, order confirmation, ticket, booking record or service communication.",
      "TrustNepal may request relevant information when clarification is reasonably needed. Do not publish passwords, payment details, identification numbers or other private information in a public review."
    ],
    bodyNe: [
      "समीक्षाको प्रकृतिअनुसार बिल, अर्डर पुष्टि, टिकट, बुकिङ विवरण वा सेवा सम्बन्धी कुराकानीजस्ता आवश्यक आधारभूत जानकारी सुरक्षित राख्नु उपयोगी हुन सक्छ।",
      "आवश्यक स्पष्टीकरणका लागि TrustNepal ले सान्दर्भिक जानकारी माग्न सक्छ। पासवर्ड, भुक्तानी विवरण, परिचयपत्र नम्बर वा अन्य निजी जानकारी सार्वजनिक समीक्षामा प्रकाशित नगर्नुहोस्।"
    ]
  },
  {
    title: "7. Disclose relevant relationships",
    titleNe: "७. सम्बन्ध वा स्वार्थको द्वन्द्व भए स्पष्ट पार्नुहोस्",
    body: [
      "If you have a personal, professional or financial relationship with the business, service provider or item being reviewed, consider whether that relationship could affect the independence of your opinion.",
      "Where a relationship is relevant to understanding your review, explain it clearly so readers can assess your perspective."
    ],
    bodyNe: [
      "समीक्षा गर्न लागेको व्यवसाय, सेवा प्रदायक वा विषयसँग तपाईंको व्यक्तिगत, व्यावसायिक वा आर्थिक सम्बन्ध छ भने त्यसले तपाईंको धारणाको निष्पक्षतामा प्रभाव पार्न सक्छ कि सक्दैन भन्ने विचार गर्नुहोस्।",
      "तपाईंको समीक्षा बुझ्न त्यस्तो सम्बन्ध सान्दर्भिक हुन्छ भने पाठकले तपाईंको दृष्टिकोण मूल्याङ्कन गर्न सकून् भनेर सम्बन्ध स्पष्ट पार्नुहोस्।"
    ]
  },
  {
    title: "8. Update your review when things change",
    titleNe: "८. अवस्था परिवर्तन भए समीक्षा अद्यावधिक गर्नुहोस्",
    body: [
      "An experience may change over time. If a product, service or issue is later resolved or your opinion changes because of a new experience, consider updating your existing review where the platform allows it.",
      "An update should explain what changed and when. This helps readers understand both your original experience and the later developments."
    ],
    bodyNe: [
      "समयसँगै अनुभव परिवर्तन हुन सक्छ। कुनै उत्पादन, सेवा वा समस्या पछि समाधान भयो वा नयाँ अनुभवका कारण तपाईंको धारणा परिवर्तन भयो भने प्लेटफर्मले सुविधा दिएको अवस्थामा आफ्नो पुरानो समीक्षा अद्यावधिक गर्नुहोस्।",
      "अद्यावधिक गर्दा के परिवर्तन भयो र कहिले भयो भन्ने कुरा स्पष्ट पार्नुहोस्। यसले पाठकलाई सुरुको अनुभव र पछिल्लो अवस्थाबारे बुझ्न सहयोग गर्छ।"
    ]
  },
  {
    title: "9. Read the related TrustNepal policies",
    titleNe: "९. TrustNepal का सम्बन्धित नीतिहरू पढ्नुहोस्",
    body: [
      "These Review Guidelines explain how to write useful, experience-based reviews. They should be read together with the TrustNepal Terms & Conditions and Privacy Policy, which explain the platform's rules and how information is handled.",
      "By submitting a review, you remain responsible for ensuring that your content follows the applicable TrustNepal policies."
    ],
    bodyNe: [
      "यी समीक्षा निर्देशिकाले अनुभवमा आधारित उपयोगी समीक्षा कसरी लेख्ने भन्ने जानकारी दिन्छन्। प्लेटफर्मका नियम तथा व्यक्तिगत जानकारीको व्यवस्थापनबारे उल्लेख गर्ने TrustNepal का नियम तथा सर्तहरू र गोपनीयता नीतिसँगै यी निर्देशिका पढ्नुहोस्।",
      "समीक्षा पेश गर्दा आफ्नो सामग्री TrustNepal का लागू नीतिहरूअनुसार रहेको सुनिश्चित गर्ने जिम्मेवारी तपाईंको हुन्छ।"
    ]
  }
];

export default function ReviewGuidelinesPage() {
  const { language } = useLanguage();
  const ne = language === "ne";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Trust<span className="text-green-700">Nepal</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-green-700">
              {ne ? "गृहपृष्ठमा फर्कनुहोस्" : "Back to Home"}
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        <div className="mb-8 rounded-2xl bg-green-800 px-6 py-8 text-white sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-200">
            {ne ? "TrustNepal का नीतिहरू" : "TrustNepal Policies"}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {ne ? "समीक्षा निर्देशिकाहरू" : "Review Guidelines"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-green-50">
            {ne
              ? "TrustNepal मा उपयोगी, निष्पक्ष र आफ्नै वास्तविक अनुभवमा आधारित समीक्षा लेख्न यी निर्देशिकाहरू पालना गर्नुहोस्।"
              : "Follow these guidelines to write useful, fair reviews based on your own genuine experiences on TrustNepal."}
          </p>
          <p className="mt-4 text-xs text-green-200">
            {ne ? "अन्तिम अद्यावधिक: १९ नोभेम्बर २०२६" : "Last updated: 19 November 2026"}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm">
          <span className="font-semibold text-gray-700">
            {ne ? "सम्बन्धित नीतिहरू:" : "Related policies:"}
          </span>
          <Link href="/terms" className="font-semibold text-green-700 hover:underline">
            {ne ? "नियम तथा सर्तहरू" : "Terms & Conditions"}
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="font-semibold text-green-700 hover:underline">
            {ne ? "गोपनीयता नीति" : "Privacy Policy"}
          </Link>
        </div>

        <div className="space-y-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          {sections.map((section) => (
            <section key={section.title} className="scroll-mt-8">
              <h2 className="text-lg font-bold text-gray-900">
                {ne ? section.titleNe : section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {(ne ? section.bodyNe : section.body).map((paragraph, index) => (
                  <p key={index} className="text-sm leading-7 text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/terms" className="text-green-700 hover:underline">
            {ne ? "नियम तथा सर्तहरू पढ्नुहोस् →" : "Read Terms & Conditions →"}
          </Link>
          <Link href="/privacy" className="text-green-700 hover:underline">
            {ne ? "गोपनीयता नीति पढ्नुहोस् →" : "Read Privacy Policy →"}
          </Link>
          <Link href="/" className="text-gray-600 hover:text-green-700">
            {ne ? "गृहपृष्ठमा फर्कनुहोस्" : "Return to Homepage"}
          </Link>
        </div>
      </article>

      <footer className="border-t border-gray-200 bg-white px-5 py-7 text-center text-xs text-gray-500">
        © 2026 TrustNepal. {ne ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}
      </footer>
    </main>
  );
}
