
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const categories = [
  { name: "All", label: "All Categories", icon: "âœ¨" },
  { name: "Products", label: "Products", icon: "ðŸ“±" },
  { name: "Movies", label: "Movies", icon: "ðŸŽ¬" },
  { name: "Hotels", label: "Hotels", icon: "ðŸ¨" },
  { name: "Restaurants", label: "Restaurants", icon: "ðŸ½ï¸" },
  { name: "Education", label: "Education", icon: "ðŸŽ“" },
  { name: "Health", label: "Health", icon: "ðŸ¥" },
  { name: "Services", label: "Services", icon: "ðŸ¢" },
  { name: "Finance", label: "Finance", icon: "\u{1F4B0}" },
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
  Products: "ðŸ“±",
  Movies: "ðŸŽ¬",
  Hotels: "ðŸ¨",
  Restaurants: "ðŸ½ï¸",
  Education: "ðŸŽ“",
  Health: "ðŸ¥",
  Services: "ðŸ¢",
  Finance: "\u{1F4B0}",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="tracking-wide text-amber-400">â˜…â˜…â˜…â˜…â˜…</span>
      <span className="text-sm font-bold text-gray-800">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // LOAD BUSINESSES AND APPROVED REVIEW STATISTICS
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

            // IMPORTANT: Only approved reviews are counted publicly.
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
            categoryName:
              categoryMap.get(business.category_id) ?? "Other",
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
          err instanceof Error
            ? err.message
            : "Could not load businesses."
        );
      } finally {
        setBusinessLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  // CHECK LOGIN STATUS
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

  // LOGOUT
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

  // SEARCH AND CATEGORY FILTER
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

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-xl font-black text-white">
              T
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Trust<span className="text-green-700">Nepal</span>
              </h1>

              <p className="text-[10px] font-semibold tracking-widest text-gray-400">
                NEPAL'S REVIEW PLATFORM
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-600 md:flex">
            <a href="#categories" className="hover:text-green-700">
              Categories
            </a>

            <a href="#trending" className="hover:text-green-700">
              Businesses
            </a>

            <a href="#about" className="hover:text-green-700">
              About Us
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {authLoading ? (
              <span className="text-sm text-gray-400">Loading...</span>
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
                  {logoutLoading ? "Please wait..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth"
                  className="hidden rounded-full px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 sm:block"
                >
                  Log in
                </a>

                <a
                  href="/auth"
                  className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-800"
                >
                  Join Us
                </a>
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
            ðŸ‡³ðŸ‡µ Made for Nepal, Powered by People
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
            Find What Nepal
            <br />
            <span className="text-green-700">Really Thinks.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            Discover honest reviews, compare ratings and share your
            experiences. Make smarter decisions with TrustNepal.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-green-900/10 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-4">
              <span className="text-xl">ðŸ”</span>

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
                placeholder="Search businesses, products, hotels..."
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
              Search
            </button>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Popular searches:{" "}
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
                  {item}{index !== 3 ? "," : ""}
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
            ["ðŸ‡³ðŸ‡µ", "Built for Nepal"],
            ["â­", "Honest Ratings"],
            ["ðŸ¤", "Community Driven"],
            ["ðŸ”", "Better Decisions"],
          ].map(([icon, title]) => (
            <div key={title}>
              <div className="text-2xl">{icon}</div>
              <p className="mt-2 text-sm font-bold text-gray-700">
                {title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-green-700">
            Explore TrustNepal
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Explore All Categories
          </h2>

          <p className="mt-3 text-gray-500">
            Everything you want to know, all in one place.
          </p>
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
                  {item.label}
                </p>
              </button>
            ))}
        </div>
      </section>

      {/* REAL BUSINESSES */}
      <section id="trending" className="scroll-mt-24 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-green-700">
                Discover & Compare
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Explore Businesses
              </h2>

              <p className="mt-2 text-gray-500">
                Discover businesses listed on TrustNepal.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveCategory("All");
                setSearch("");
              }}
              className="w-fit rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:border-green-500 hover:text-green-700"
            >
              Clear Filters
            </button>
          </div>

          {/* FILTERS */}
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
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {businessLoading ? (
            <div className="rounded-2xl bg-white py-16 text-center text-gray-500">
              Loading businesses...
            </div>
          ) : businessError ? (
            <div className="rounded-2xl border border-red-100 bg-white py-12 text-center">
              <p className="font-bold text-red-700">
                Could not load businesses.
              </p>
              <p className="mt-2 px-4 text-sm text-gray-500">
                {businessError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white"
              >
                Try Again
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
                      {categoryIcons[item.categoryName] ?? "ðŸ¢"}
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                      {item.categoryName}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold text-gray-900 group-hover:text-green-700">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    ðŸ“ {item.location || "Location not provided"}
                  </p>

                  <p className="mt-4 min-h-10 text-sm leading-6 text-gray-500">
                    {item.description || "No description available yet."}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      {item.reviewCount > 0 ? (
                        <>
                          <StarRating rating={item.averageRating} />
                          <p className="mt-1 text-xs text-gray-400">
                            {item.reviewCount} approved reviews
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500">
                          No approved reviews yet
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-800">
                      View Profile â†’
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
              <div className="text-5xl">ðŸ”Ž</div>

              <h3 className="mt-4 text-xl font-bold">
                No businesses found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try another search or select a different category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white"
              >
                Show All Businesses
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-green-800 px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-5xl">â­</div>

          <h2 className="mt-6 text-3xl font-black md:text-4xl">
            Your Experience Matters.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-green-100">
            Help other people make better decisions. Share your honest
            experiences and become part of Nepal's trusted review community.
          </p>

          <a
            href={userEmail ? "#trending" : "/auth"}
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-extrabold text-green-800 shadow-lg transition hover:bg-green-50"
          >
            {userEmail
              ? "Explore TrustNepal â†’"
              : "Join TrustNepal Today â†’"}
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-black">
              About <span className="text-green-700">TrustNepal</span>
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              TrustNepal is a platform designed to bring Nepal's consumers
              together. Our vision is to make honest reviews and transparent
              ratings accessible to everyone in Nepal.
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-8">
            <p className="text-lg font-bold text-green-900">
              Discover. Rate. Review. Trust.
            </p>

            <p className="mt-3 text-sm leading-7 text-green-800">
              A better Nepal starts with informed decisions and honest
              experiences.
            </p>

            <p className="mt-5 text-sm font-extrabold text-green-900">
              ðŸ‡³ðŸ‡µ Proudly made for Nepal.
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
              Nepal's Trusted Review Platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-gray-400">
            <a href="#categories" className="hover:text-white">
              Categories
            </a>

            <a href="#trending" className="hover:text-white">
              Businesses
            </a>

            <a href="#about" className="hover:text-white">
              About
            </a>
          </div>

          <p className="text-xs text-gray-500">
            Â© 2026 TrustNepal. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

