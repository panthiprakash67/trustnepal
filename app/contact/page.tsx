"use client";

import Link from "next/link";
import { useLanguage } from "../components/language-provider";
import LanguageSwitcher from "../components/language-switcher";

export default function ContactPage() {
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

      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-green-700">
            TrustNepal
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {ne ? "हामीलाई सम्पर्क गर्नुहोस्" : "Contact Us"}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600">
            {ne
              ? "तपाईंको सुझाव, प्रतिक्रिया, गुनासो वा कुनै पनि सहयोगका लागि हामीसँग सम्पर्क गर्नुहोस्। हामी तपाईंको कुरा सुन्न तयार छौँ।"
              : "Have a suggestion, feedback, complaint or need assistance? Get in touch with us. We are happy to hear from you."}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-2xl">
              ✉
            </div>
            <h2 className="text-xl font-bold">
              {ne ? "इमेल गर्नुहोस्" : "Email Us"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {ne ? "हामीलाई आफ्नो प्रश्न वा सन्देश पठाउनुहोस्।" : "Send us your questions or messages."}
            </p>
            <a
              href="mailto:founder.trustnepal@gmail.com"
              className="mt-5 inline-block break-all font-semibold text-green-700 hover:text-green-800"
            >
              founder.trustnepal@gmail.com
            </a>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-2xl">
              ☎
            </div>
            <h2 className="text-xl font-bold">
              {ne ? "फोन गर्नुहोस्" : "Call Us"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {ne ? "प्रत्यक्ष सम्पर्कका लागि हामीलाई फोन गर्नुहोस्।" : "Call us for direct communication."}
            </p>
            <a
              href="tel:9844724484"
              className="mt-5 inline-block font-semibold text-green-700 hover:text-green-800"
            >
              9844724484
            </a>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-gray-950 px-6 py-10 text-center text-white">
          <h2 className="text-2xl font-bold">
            {ne ? "तपाईंको आवाज हाम्रो लागि महत्त्वपूर्ण छ।" : "Your Voice Matters to Us."}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300">
            {ne
              ? "TrustNepal लाई अझ राम्रो र विश्वासिलो प्लेटफर्म बनाउन तपाईंको प्रतिक्रिया र सुझावले महत्त्वपूर्ण भूमिका खेल्छ।"
              : "Your feedback and suggestions help us make TrustNepal a better and more trustworthy platform."}
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        © 2026 TrustNepal. {ne ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}
      </footer>
    </main>
  );
}
