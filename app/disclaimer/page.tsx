
"use client";

import Link from "next/link";
import { useLanguage } from "../components/language-provider";
import LanguageSwitcher from "../components/language-switcher";

export default function DisclaimerPage() {
  const { language } = useLanguage();
  const ne = language === "ne";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-green-700">
            TrustNepal
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-green-700"
            >
              {ne ? "गृहपृष्ठमा फर्कनुहोस्" : "Back to Home"}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          {ne
            ? "कम्पनी सम्बन्धी जानकारीको अस्वीकरण"
            : "Company Information Disclaimer"}
        </h1>

        <div className="space-y-6 text-base leading-8 text-gray-700">
          <p>
            {ne
              ? "TrustNepal मा प्रदर्शित कम्पनीसम्बन्धी जानकारी, जस्तै इमेल ठेगाना, सम्पर्क नम्बर, भौतिक ठेगाना र वेबसाइटका लिङ्कहरू सार्वजनिक रूपमा उपलब्ध स्रोतहरूबाट सङ्कलन गरिन्छ। यस्ता जानकारी सङ्कलन गर्दा सम्बन्धित कम्पनीका आधिकारिक वेबसाइटहरूलाई प्राथमिकता दिइन्छ।"
              : "The company information displayed on TrustNepal, including email addresses, contact numbers, physical addresses, and website links, is collected from publicly available sources, primarily the respective companies' official websites."}
          </p>

          <p>
            {ne
              ? "हामी यस जानकारीलाई सही र अद्यावधिक राख्न उचित प्रयास गर्छौँ। तथापि, समयसँगै कम्पनीका विवरणहरू परिवर्तन हुन सक्छन्। त्यसैले TrustNepal ले सबै जानकारी सधैँ अद्यावधिक, पूर्ण वा त्रुटिरहित हुन्छ भन्ने ग्यारेन्टी गर्दैन।"
              : "We make reasonable efforts to keep this information accurate and up to date. However, company details may change over time, and TrustNepal does not guarantee that all information is always current, complete, or error-free."}
          </p>

          <p>
            {ne
              ? "TrustNepal एक स्वतन्त्र समीक्षा तथा सूचना प्रदान गर्ने प्लेटफर्म हो। यहाँ कुनै कम्पनीको जानकारी प्रदर्शित हुनुको अर्थ उक्त कम्पनीसँग हाम्रो आधिकारिक साझेदारी, समर्थन वा सम्बन्ध रहेको भन्ने होइन, जबसम्म त्यस्तो कुरा स्पष्ट रूपमा उल्लेख गरिएको हुँदैन।"
              : "TrustNepal is an independent review and information platform. The display of company information does not imply any official partnership, endorsement, or affiliation with the listed companies unless explicitly stated."}
          </p>

          <p>
            {ne
              ? "यदि कुनै कम्पनीको प्रतिनिधि वा प्रयोगकर्ताले गलत वा पुरानो जानकारी फेला पारेमा, त्यसलाई सच्याउन वा अद्यावधिक गर्न अनुरोध गर्दै TrustNepal मा सम्पर्क गर्न सक्नुहुन्छ।"
              : "If a company representative or user identifies incorrect or outdated information, they may contact TrustNepal to request a correction or update."}
          </p>
        </div>
      </section>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © 2026 TrustNepal. {ne ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}
      </footer>
    </main>
  );
}
