
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useLanguage } from "./components/language-provider";
import LanguageSwitcher from "./components/language-switcher";

const categories = [
  { name: "All", icon: "✨" },
  { name: "Products", icon: "📱" },
  { name: "Movies", icon: "🎬" },
  { name: "Hotels", icon: "🏨" },
  { name: "Restaurants", icon: "🍽️" },
  { name: "Education", icon: "🎓" },
  { name: "Health", icon: "🏥" },
  { name: "Services", icon: "🏢" },
  { name: "Finance", icon: "💰" },
];

type Business = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  description: string | null;
  location: string | null;
  website: string | null;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
};

const categoryIcons: Record<string, string> = {
  Products: "📱",
  Movies: "🎬",
  Hotels: "🏨",
  Restaurants: "🍽️",
  Education: "🎓",
  Health: "🏥",
  Services: "🏢",
  Finance: "💰",
};

const translations = {
  en: {
    tagline: "NEPAL'S REVIEW PLATFORM",
    navCategories: "Categories",
    navBusinesses: "Businesses",
    navAbout: "About Us",
    loading: "Loading...",
    logout: "Logout",
    pleaseWait: "Please wait...",
    login: "Log in",
    join: "Join Us",
    madeForNepal: "Made for Nepal, Powered by People",
    heroFirst: "Find What Nepal",
    heroSecond: "Really Thinks.",
    heroDescription:
      "Discover honest reviews, compare ratings and share your experiences. Make smarter decisions with TrustNepal.",
    searchPlaceholder: "Search businesses, products, hotels...",
    search: "Search",
    popular: "Popular searches:",
    stats: ["Built for Nepal", "Honest Reviews", "Our Community", "Better Decisions"],
    explore: "Explore TrustNepal",
    allCategories: "Explore All Categories",
    categoryDescription: "Everything you want to know, all in one place.",
    discover: "Discover & Compare",
    exploreBusinesses: "Explore Businesses",
    businessDescription: "Discover businesses listed on TrustNepal.",
    clearFilters: "Clear Filters",
    loadingBusinesses: "Loading businesses...",
    couldNotLoad: "Could not load businesses.",
    tryAgain: "Try Again",
    noReviews: "No approved reviews yet",
    approvedReviews: "approved reviews",
    locationMissing: "Location not provided",
    noDescription: "No description available yet.",
    viewProfile: "View Profile",
    noBusinesses: "No businesses found",
    tryAnother: "Try another search or select a different category.",
    showAll: "Show All Businesses",
    callTitle: "Your Experience Matters.",
    callDescription:
      "Help other people make better decisions. Share your honest experiences and become part of Nepal's trusted review community.",
    exploreTrust: "Explore TrustNepal",
    joinToday: "Join TrustNepal Today",
    about: "About",
    aboutDescription:
      "TrustNepal is a platform designed to bring Nepal's consumers together. Our vision is to make honest reviews and transparent ratings accessible to everyone in Nepal.",
    discoverRate: "Discover. Rate. Review. Trust.",
    aboutTagline:
      "A better Nepal starts with informed decisions and honest experiences.",
    proudly: "Proudly made for Nepal.",
    footerTagline: "Nepal's Trusted Review Platform.",
    disclaimer: "Disclaimer",
    copyright: "All rights reserved.",
    categories: [
      "All Categories",
      "Products",
      "Movies",
      "Hotels",
      "Restaurants",
      "Education",
      "Health",
      "Services",
      "Finance",
    ],
  },
  ne: {
    tagline: "नेपालको समीक्षा मञ्च",
    navCategories: "श्रेणीहरू",
    navBusinesses: "व्यवसायहरू",
    navAbout: "हाम्रोबारे",
    loading: "लोड हुँदैछ...",
    logout: "लगआउट",
    pleaseWait: "कृपया पर्खनुहोस्...",
    login: "लगइन",
    join: "सामेल हुनुहोस्",
    madeForNepal: "नेपालका लागि, नेपालीहरूद्वारा",
    heroFirst: "नेपाल के सोच्छ",
    heroSecond: "जान्नुहोस्।",
    heroDescription:
      "वास्तविक समीक्षा पढ्नुहोस्, रेटिङ तुलना गर्नुहोस् र आफ्ना अनुभव साझा गर्नुहोस्। TrustNepal सँग सही निर्णय लिनुहोस्।",
    searchPlaceholder: "व्यवसाय, उत्पादन, होटल खोज्नुहोस्...",
    search: "खोज्नुहोस्",
    popular: "लोकप्रिय खोजी:",
    stats: ["नेपालका लागि निर्मित", "वास्तविक समीक्षा", "हाम्रो समुदाय", "सही निर्णय"],
    explore: "TrustNepal अन्वेषण गर्नुहोस्",
    allCategories: "सबै श्रेणीहरू",
    categoryDescription: "तपाईंलाई चाहिने सबै जानकारी एकै ठाउँमा।",
    discover: "खोज्नुहोस् र तुलना गर्नुहोस्",
    exploreBusinesses: "व्यवसायहरू हेर्नुहोस्",
    businessDescription: "TrustNepal मा सूचीकृत व्यवसायहरू पत्ता लगाउनुहोस्।",
    clearFilters: "फिल्टर हटाउनुहोस्",
    loadingBusinesses: "व्यवसायहरू लोड हुँदैछन्...",
    couldNotLoad: "व्यवसायहरू लोड गर्न सकिएन।",
    tryAgain: "पुनः प्रयास गर्नुहोस्",
    noReviews: "अहिलेसम्म स्वीकृत समीक्षा छैन",
    approvedReviews: "स्वीकृत समीक्षा",
    locationMissing: "स्थान उपलब्ध छैन",
    noDescription: "विवरण उपलब्ध छैन।",
    viewProfile: "प्रोफाइल हेर्नुहोस्",
    noBusinesses: "कुनै व्यवसाय भेटिएन",
    tryAnother: "अर्को शब्द खोज्नुहोस् वा फरक श्रेणी छान्नुहोस्।",
    showAll: "सबै व्यवसाय देखाउनुहोस्",
    callTitle: "तपाईंको अनुभव महत्त्वपूर्ण छ।",
    callDescription:
      "अरूलाई राम्रो निर्णय लिन सहयोग गर्नुहोस्। आफ्ना वास्तविक अनुभव साझा गर्नुहोस् र नेपालको विश्वासिलो समीक्षा समुदायको हिस्सा बन्नुहोस्।",
    exploreTrust: "TrustNepal हेर्नुहोस्",
    joinToday: "आजै TrustNepal मा सामेल हुनुहोस्",
    about: "हाम्रोबारे",
    aboutDescription:
      "TrustNepal नेपालका उपभोक्ताहरूलाई जोड्ने उद्देश्यले बनाइएको मञ्च हो। हाम्रो लक्ष्य नेपालका सबै मानिसलाई वास्तविक समीक्षा र पारदर्शी रेटिङ उपलब्ध गराउनु हो।",
    discoverRate: "खोज्नुहोस्। मूल्याङ्कन गर्नुहोस्। समीक्षा गर्नुहोस्। विश्वास गर्नुहोस्।",
    aboutTagline:
      "जानकारीमा आधारित निर्णय र वास्तविक अनुभवबाट राम्रो नेपाल निर्माण हुन्छ।",
    proudly: "नेपालका लागि गर्वका साथ निर्मित।",
    footerTagline: "नेपालको विश्वासिलो समीक्षा मञ्च।",
    disclaimer: "अस्वीकरण",
    copyright: "सर्वाधिकार सुरक्षित।",
    categories: [
      "सबै श्रेणी",
      "उत्पादन",
      "चलचित्र",
      "होटल",
      "रेस्टुरेन्ट",
      "शिक्षा",
      "स्वास्थ्य",
      "सेवाहरू",
      "वित्त",
    ],
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="tracking-wide text-amber-400">{"★★★★★"}</span>
      <span className="text-sm font-bold text-gray-800">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const ne = language === "ne";
  const t = translations[language];

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    async function loadBusinesses() {
      setBusinessLoading(true);
      setBusinessError("");

      try {
        const [businessResult, categoryResult, reviewResult] =
          await Promise.all([
            supabase
              .from("businesses")
              .select(
                "id, name, slug, category_id, description, location, website"
              )
              .order("created_at", { ascending: false }),

            supabase.from("categories").select("id, name"),

            supabase
              .from("reviews")
              .select("business_id, rating")
              .eq("status", "approved"),
          ]);

        if (businessResult.error) throw businessResult.error;
        if (categoryResult.error) throw categoryResult.error;
        if (reviewResult.error) throw reviewResult.error;

        const categoryMap = new Map<number, string>();

        (categoryResult.data ?? []).forEach((category) => {
          categoryMap.set(category.id, category.name);
        });

        const reviewStats = new Map<
          number,
          { total: number; count: number }
        >();

        (reviewResult.data ?? []).forEach((review) => {
          const current = reviewStats.get(review.business_id) ?? {
            total: 0,
            count: 0,
          };

          current.total += review.rating;
          current.count += 1;
          reviewStats.set(review.business_id, current);
        });

        const formattedBusinesses: Business[] = (
          businessResult.data ?? []
        ).map((business) => {
          const stats = reviewStats.get(business.id);

          return {
            ...business,
            categoryName: categoryMap.get(business.category_id) ?? "Other",
            averageRating:
              stats && stats.count > 0
                ? stats.total / stats.count
                : 0,
            reviewCount: stats?.count ?? 0,
          };
        });

        setBusinesses(formattedBusinesses);
      } catch (err) {
        setBusinessError(
          err instanceof Error ? err.message : "Could not load businesses."
        );
      } finally {
        setBusinessLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getSession();

      if (!error) {
        setUserEmail(data.session?.user.email ?? null);
      }

      setAuthLoading(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert(error.message);
      } else {
        setUserEmail(null);
      }
    } finally {
      setLogoutLoading(false);
    }
  }

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.categoryName === activeCategory;

      const searchText =
        `${item.name} ${item.categoryName} ${item.location ?? ""} ${item.description ?? ""}`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase().trim()
      );

      return matchesCategory && matchesSearch;
    });
  }, [businesses, search, activeCategory]);

  const categoryLabel = (name: string) => {
    const index = categories.findIndex((item) => item.name === name);
    return index >= 0 ? t.categories[index] : name;
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-xl font-black text-white">
              T
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Trust<span className="text-green-700">Nepal</span>
              </h1>
              <p className="text-[10px] font-semibold tracking-widest text-gray-400">
                {t.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-600 md:flex">
            <a href="#categories" className="hover:text-green-700">
              {t.navCategories}
            </a>
            <a href="#trending" className="hover:text-green-700">
              {t.navBusinesses}
            </a>
            <a href="#about" className="hover:text-green-700">
              {t.navAbout}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {authLoading ? (
              <span className="text-sm text-gray-400">{t.loading}</span>
            ) : userEmail ? (
              <>
                <span className="hidden max-w-44 truncate text-sm font-semibold text-gray-700 lg:block">
                  {userEmail}
                </span>

                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {logoutLoading ? t.pleaseWait : t.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="hidden rounded-full px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 sm:block"
                >
                  {t.login}
                </Link>

                <Link
                  href="/auth"
                  className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-800"
                >
                  {t.join}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f0f8f2]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-green-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center md:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold text-green-800 shadow-sm">
            🇳🇵 {t.madeForNepal}
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
            {t.heroFirst}
            <br />
            <span className="text-green-700">{t.heroSecond}</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            {t.heroDescription}
          </p>

          <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-green-900/10 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-4">
              <span className="text-xl">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  document.getElementById("trending")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                placeholder={t.searchPlaceholder}
                className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={() =>
                document.getElementById("trending")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="rounded-xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800"
            >
              {t.search}
            </button>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            {t.popular}{" "}
            {["Hotels", "Movies", "Mobiles", "Restaurants"].map(
              (item, index) => (
                <button
                  key={item}
                  onClick={() => {
                    setSearch(item === "Mobiles" ? "Products" : item);
                    document.getElementById("trending")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="mx-1 font-semibold text-green-800 hover:underline"
                >
                  {ne
                    ? ({ Hotels: "होटल", Movies: "चलचित्र", Mobiles: "मोबाइल", Restaurants: "रेस्टुरेन्ट" }[item])
                    : item}
                  {index !== 3 ? "," : ""}
                </button>
              )
            )}
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 py-9 text-center md:grid-cols-4">
          {[
            ["🇳🇵", t.stats[0]],
            ["🌟", t.stats[1]],
            ["👥", t.stats[2]],
            ["💡", t.stats[3]],
          ].map(([icon, title]) => (
            <div key={title}>
              <div className="text-2xl">{icon}</div>
              <p className="mt-2 text-sm font-bold text-gray-700">{title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-green-700">
            {t.explore}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            {t.allCategories}
          </h2>
          <p className="mt-3 text-gray-500">{t.categoryDescription}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categories
            .filter((item) => item.name !== "All")
            .map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveCategory(item.name);
                  document.getElementById("trending")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className={`group rounded-2xl border p-5 text-center transition hover:-translate-y-1 hover:border-green-300 hover:bg-green-50 hover:shadow-md ${
                  activeCategory === item.name
                    ? "border-green-500 bg-green-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl transition group-hover:bg-green-100">
                  {item.icon}
                </div>
                <p className="mt-3 text-sm font-bold text-gray-800">
                  {categoryLabel(item.name)}
                </p>
              </button>
            ))}
        </div>
      </section>

      {/* BUSINESSES */}
      <section id="trending" className="scroll-mt-24 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                {t.discover}
              </p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                {t.exploreBusinesses}
              </h2>
              <p className="mt-2 text-gray-500">{t.businessDescription}</p>
            </div>

            <button
              onClick={() => {
                setActiveCategory("All");
                setSearch("");
              }}
              className="w-fit rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:border-green-500 hover:text-green-700"
            >
              {t.clearFilters}
            </button>
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveCategory(item.name)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  activeCategory === item.name
                    ? "bg-green-700 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-green-500 hover:text-green-700"
                }`}
              >
                {item.icon} {categoryLabel(item.name)}
              </button>
            ))}
          </div>

          {businessLoading ? (
            <div className="rounded-2xl bg-white py-16 text-center text-gray-500">
              {t.loadingBusinesses}
            </div>
          ) : businessError ? (
            <div className="rounded-2xl border border-red-100 bg-white py-12 text-center">
              <p className="font-bold text-red-700">{t.couldNotLoad}</p>
              <p className="mt-2 px-4 text-sm text-gray-500">
                {businessError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white"
              >
                {t.tryAgain}
              </button>
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBusinesses.map((item) => (
                <Link
                  key={item.id}
                  href={`/business/${encodeURIComponent(item.slug)}`}
                  aria-label={`View ${item.name} business profile`}
                  className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                      {categoryIcons[item.categoryName] ?? "🏢"}
                    </div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                      {categoryLabel(item.categoryName)}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold text-gray-900 group-hover:text-green-700">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    📍{" "}
                    {item.location ||
                      (ne ? "स्थान उपलब्ध छैन" : t.locationMissing)}
                  </p>

                  <p className="mt-4 min-h-10 text-sm leading-6 text-gray-500">
                    {item.description ||
                      (ne ? "विवरण उपलब्ध छैन।" : t.noDescription)}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      {item.reviewCount > 0 ? (
                        <>
                          <StarRating rating={item.averageRating} />
                          <p className="mt-1 text-xs text-gray-400">
                            {item.reviewCount} {t.approvedReviews}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500">
                          {t.noReviews}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-800">
                      {t.viewProfile} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
              <div className="text-5xl">🔎</div>
              <h3 className="mt-4 text-xl font-bold">{t.noBusinesses}</h3>
              <p className="mt-2 text-sm text-gray-500">{t.tryAnother}</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white"
              >
                {t.showAll}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-green-800 px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-5xl">💬</div>
          <h2 className="mt-6 text-3xl font-black md:text-4xl">
            {t.callTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-green-100">
            {t.callDescription}
          </p>
          <Link
            href={userEmail ? "#trending" : "/auth"}
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-extrabold text-green-800 shadow-lg transition hover:bg-green-50"
          >
            {userEmail ? t.exploreTrust : t.joinToday} →
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-black">
              {t.about} <span className="text-green-700">TrustNepal</span>
            </h2>
            <p className="mt-5 leading-8 text-gray-600">
              {t.aboutDescription}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-8">
            <p className="text-lg font-bold text-green-900">
              {t.discoverRate}
            </p>
            <p className="mt-3 text-sm leading-7 text-green-800">
              {t.aboutTagline}
            </p>
            <p className="mt-5 text-sm font-extrabold text-green-900">
              🇳🇵 {t.proudly}
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 px-5 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black">
              Trust<span className="text-green-400">Nepal</span>
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {t.footerTagline}
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-gray-400">
            <a href="#categories" className="hover:text-white">
              {t.navCategories}
            </a>
            <a href="#trending" className="hover:text-white">
              {t.navBusinesses}
            </a>
            <a href="#about" className="hover:text-white">
              {t.about}
            </a>
            <Link href="/disclaimer" className="hover:text-white">
              {t.disclaimer}
            </Link>
          </div>

          <p className="text-xs text-gray-500">
            © 2026 TrustNepal. {t.copyright}
          </p>
        </div>
      </footer>
    </main>
  );
}
