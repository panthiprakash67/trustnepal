"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useLanguage } from "./components/language-provider";
import LanguageSwitcher from "./components/language-switcher";

const categories = [
  { name: "All", icon: String.fromCodePoint(0x2728) },
  { name: "Products", icon: String.fromCodePoint(0x1F4F1) },
  { name: "Movies", icon: String.fromCodePoint(0x1F3AC) },
  { name: "Hotels", icon: String.fromCodePoint(0x1F3E8) },
  { name: "Restaurants", icon: String.fromCodePoint(0x1F37D, 0xFE0F) },
  { name: "Education", icon: String.fromCodePoint(0x1F393) },
  { name: "Health", icon: String.fromCodePoint(0x1F3E5) },
  { name: "Services", icon: String.fromCodePoint(0x1F3E2) },
  { name: "Finance", icon: String.fromCodePoint(0x1F4B0) },
];

type Business = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  description: string | null;
  location: string | null;
  website: string | null;
  author: string | null;
  director: string | null;
  release_year: number | null;
  image_url: string | null;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
};

const categoryIcons: Record<string, string> = {
  Products: String.fromCodePoint(0x1F4F1),
  Movies: String.fromCodePoint(0x1F3AC),
  Hotels: String.fromCodePoint(0x1F3E8),
  Restaurants: String.fromCodePoint(0x1F37D, 0xFE0F),
  Education: String.fromCodePoint(0x1F393),
  Health: String.fromCodePoint(0x1F3E5),
  Services: String.fromCodePoint(0x1F3E2),
  Finance: String.fromCodePoint(0x1F4B0),
};


function getCategoryIcon(name: string): string {
  const value = name.toLowerCase().trim();

  if (value.includes("product")) return String.fromCodePoint(0x1F4F1);
  if (value.includes("movie") || value.includes("film")) return String.fromCodePoint(0x1F3AC);
  if (value.includes("hotel")) return String.fromCodePoint(0x1F3E8);
  if (value.includes("restaurant") || value.includes("food")) return String.fromCodePoint(0x1F37D, 0xFE0F);
  if (value.includes("education") || value.includes("school") || value.includes("college")) return String.fromCodePoint(0x1F393);
  if (value.includes("health") || value.includes("hospital")) return String.fromCodePoint(0x1F3E5);
  if (value.includes("service")) return String.fromCodePoint(0x1F3E2);
  if (value.includes("finance") || value.includes("bank")) return String.fromCodePoint(0x1F4B0);
  if (value.includes("book")) return String.fromCodePoint(0x1F4DA);
  if (value.includes("internet") || value.includes("broadband")) return String.fromCodePoint(0x1F310);

  return String.fromCodePoint(0x1F3F7, 0xFE0F);
}
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
    tagline: "à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¥‹ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤®à¤žà¥à¤š",
    navCategories: "à¤¶à¥à¤°à¥‡à¤£à¥€à¤¹à¤°à¥‚",
    navBusinesses: "à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯à¤¹à¤°à¥‚",
    navAbout: "à¤¹à¤¾à¤®à¥à¤°à¥‹à¤¬à¤¾à¤°à¥‡",
    loading: "à¤²à¥‹à¤¡ à¤¹à¥à¤à¤¦à¥ˆà¤›...",
    logout: "à¤²à¤—à¤†à¤‰à¤Ÿ",
    pleaseWait: "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¤°à¥à¤–à¤¨à¥à¤¹à¥‹à¤¸à¥...",
    login: "à¤²à¤—à¤‡à¤¨",
    join: "à¤¸à¤¾à¤®à¥‡à¤² à¤¹à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    madeForNepal: "à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¤¾ à¤²à¤¾à¤—à¤¿, à¤¨à¥‡à¤ªà¤¾à¤²à¥€à¤¹à¤°à¥‚à¤¦à¥à¤µà¤¾à¤°à¤¾",
    heroFirst: "à¤¨à¥‡à¤ªà¤¾à¤² à¤•à¥‡ à¤¸à¥‹à¤šà¥à¤›",
    heroSecond: "à¤œà¤¾à¤¨à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤",
    heroDescription:
      "à¤µà¤¾à¤¸à¥à¤¤à¤µà¤¿à¤• à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤ªà¤¢à¥à¤¨à¥à¤¹à¥‹à¤¸à¥, à¤°à¥‡à¤Ÿà¤¿à¤™ à¤¤à¥à¤²à¤¨à¤¾ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥ à¤° à¤†à¤«à¥à¤¨à¤¾ à¤…à¤¨à¥à¤­à¤µ à¤¸à¤¾à¤à¤¾ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤ TrustNepal à¤¸à¤à¤— à¤¸à¤¹à¥€ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤²à¤¿à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤",
    searchPlaceholder: "à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯, à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨, à¤¹à¥‹à¤Ÿà¤² à¤–à¥‹à¤œà¥à¤¨à¥à¤¹à¥‹à¤¸à¥...",
    search: "à¤–à¥‹à¤œà¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    popular: "à¤²à¥‹à¤•à¤ªà¥à¤°à¤¿à¤¯ à¤–à¥‹à¤œà¥€:",
    stats: ["à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¤¾ à¤²à¤¾à¤—à¤¿ à¤¨à¤¿à¤°à¥à¤®à¤¿à¤¤", "à¤µà¤¾à¤¸à¥à¤¤à¤µà¤¿à¤• à¤¸à¤®à¥€à¤•à¥à¤·à¤¾", "à¤¹à¤¾à¤®à¥à¤°à¥‹ à¤¸à¤®à¥à¤¦à¤¾à¤¯", "à¤¸à¤¹à¥€ à¤¨à¤¿à¤°à¥à¤£à¤¯"],
    explore: "TrustNepal à¤…à¤¨à¥à¤µà¥‡à¤·à¤£ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    allCategories: "à¤¸à¤¬à¥ˆ à¤¶à¥à¤°à¥‡à¤£à¥€à¤¹à¤°à¥‚",
    categoryDescription: "à¤¤à¤ªà¤¾à¤ˆà¤‚à¤²à¤¾à¤ˆ à¤šà¤¾à¤¹à¤¿à¤¨à¥‡ à¤¸à¤¬à¥ˆ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤à¤•à¥ˆ à¤ à¤¾à¤‰à¤à¤®à¤¾à¥¤",
    discover: "à¤–à¥‹à¤œà¥à¤¨à¥à¤¹à¥‹à¤¸à¥ à¤° à¤¤à¥à¤²à¤¨à¤¾ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    exploreBusinesses: "à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯à¤¹à¤°à¥‚ à¤¹à¥‡à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    businessDescription: "TrustNepal à¤®à¤¾ à¤¸à¥‚à¤šà¥€à¤•à¥ƒà¤¤ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯à¤¹à¤°à¥‚ à¤ªà¤¤à¥à¤¤à¤¾ à¤²à¤—à¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤",
    clearFilters: "à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤¹à¤Ÿà¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥",
    loadingBusinesses: "à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯à¤¹à¤°à¥‚ à¤²à¥‹à¤¡ à¤¹à¥à¤à¤¦à¥ˆà¤›à¤¨à¥...",
    couldNotLoad: "à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯à¤¹à¤°à¥‚ à¤²à¥‹à¤¡ à¤—à¤°à¥à¤¨ à¤¸à¤•à¤¿à¤à¤¨à¥¤",
    tryAgain: "à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    noReviews: "à¤…à¤¹à¤¿à¤²à¥‡à¤¸à¤®à¥à¤® à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤›à¥ˆà¤¨",
    approvedReviews: "à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾",
    locationMissing: "à¤¸à¥à¤¥à¤¾à¤¨ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤›à¥ˆà¤¨",
    noDescription: "à¤µà¤¿à¤µà¤°à¤£ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤›à¥ˆà¤¨à¥¤",
    viewProfile: "à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤² à¤¹à¥‡à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    noBusinesses: "à¤•à¥à¤¨à¥ˆ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤­à¥‡à¤Ÿà¤¿à¤à¤¨",
    tryAnother: "à¤…à¤°à¥à¤•à¥‹ à¤¶à¤¬à¥à¤¦ à¤–à¥‹à¤œà¥à¤¨à¥à¤¹à¥‹à¤¸à¥ à¤µà¤¾ à¤«à¤°à¤• à¤¶à¥à¤°à¥‡à¤£à¥€ à¤›à¤¾à¤¨à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤",
    showAll: "à¤¸à¤¬à¥ˆ à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯ à¤¦à¥‡à¤–à¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥",
    callTitle: "à¤¤à¤ªà¤¾à¤ˆà¤‚à¤•à¥‹ à¤…à¤¨à¥à¤­à¤µ à¤®à¤¹à¤¤à¥à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£ à¤›à¥¤",
    callDescription:
      "à¤…à¤°à¥‚à¤²à¤¾à¤ˆ à¤°à¤¾à¤®à¥à¤°à¥‹ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤²à¤¿à¤¨ à¤¸à¤¹à¤¯à¥‹à¤— à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤ à¤†à¤«à¥à¤¨à¤¾ à¤µà¤¾à¤¸à¥à¤¤à¤µà¤¿à¤• à¤…à¤¨à¥à¤­à¤µ à¤¸à¤¾à¤à¤¾ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥ à¤° à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¥‹ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¿à¤²à¥‹ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤¸à¤®à¥à¤¦à¤¾à¤¯à¤•à¥‹ à¤¹à¤¿à¤¸à¥à¤¸à¤¾ à¤¬à¤¨à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤",
    exploreTrust: "TrustNepal à¤¹à¥‡à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    joinToday: "à¤†à¤œà¥ˆ TrustNepal à¤®à¤¾ à¤¸à¤¾à¤®à¥‡à¤² à¤¹à¥à¤¨à¥à¤¹à¥‹à¤¸à¥",
    about: "à¤¹à¤¾à¤®à¥à¤°à¥‹à¤¬à¤¾à¤°à¥‡",
    aboutDescription:
      "TrustNepal à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¤¾ à¤‰à¤ªà¤­à¥‹à¤•à¥à¤¤à¤¾à¤¹à¤°à¥‚à¤²à¤¾à¤ˆ à¤œà¥‹à¤¡à¥à¤¨à¥‡ à¤‰à¤¦à¥à¤¦à¥‡à¤¶à¥à¤¯à¤²à¥‡ à¤¬à¤¨à¤¾à¤‡à¤à¤•à¥‹ à¤®à¤žà¥à¤š à¤¹à¥‹à¥¤ à¤¹à¤¾à¤®à¥à¤°à¥‹ à¤²à¤•à¥à¤·à¥à¤¯ à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¤¾ à¤¸à¤¬à¥ˆ à¤®à¤¾à¤¨à¤¿à¤¸à¤²à¤¾à¤ˆ à¤µà¤¾à¤¸à¥à¤¤à¤µà¤¿à¤• à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤° à¤ªà¤¾à¤°à¤¦à¤°à¥à¤¶à¥€ à¤°à¥‡à¤Ÿà¤¿à¤™ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤—à¤°à¤¾à¤‰à¤¨à¥ à¤¹à¥‹à¥¤",
    discoverRate: "à¤–à¥‹à¤œà¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤ à¤®à¥‚à¤²à¥à¤¯à¤¾à¤™à¥à¤•à¤¨ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤",
    aboutTagline:
      "à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€à¤®à¤¾ à¤†à¤§à¤¾à¤°à¤¿à¤¤ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤° à¤µà¤¾à¤¸à¥à¤¤à¤µà¤¿à¤• à¤…à¤¨à¥à¤­à¤µà¤¬à¤¾à¤Ÿ à¤°à¤¾à¤®à¥à¤°à¥‹ à¤¨à¥‡à¤ªà¤¾à¤² à¤¨à¤¿à¤°à¥à¤®à¤¾à¤£ à¤¹à¥à¤¨à¥à¤›à¥¤",
    proudly: "à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¤¾ à¤²à¤¾à¤—à¤¿ à¤—à¤°à¥à¤µà¤•à¤¾ à¤¸à¤¾à¤¥ à¤¨à¤¿à¤°à¥à¤®à¤¿à¤¤à¥¤",
    footerTagline: "à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¥‹ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¿à¤²à¥‹ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤®à¤žà¥à¤šà¥¤",
    disclaimer: "à¤…à¤¸à¥à¤µà¥€à¤•à¤°à¤£",
    copyright: "à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤",
    categories: [
      "à¤¸à¤¬à¥ˆ à¤¶à¥à¤°à¥‡à¤£à¥€",
      "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨",
      "à¤šà¤²à¤šà¤¿à¤¤à¥à¤°",
      "à¤¹à¥‹à¤Ÿà¤²",
      "à¤°à¥‡à¤¸à¥à¤Ÿà¥à¤°à¥‡à¤¨à¥à¤Ÿ",
      "à¤¶à¤¿à¤•à¥à¤·à¤¾",
      "à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯",
      "à¤¸à¥‡à¤µà¤¾à¤¹à¤°à¥‚",
      "à¤µà¤¿à¤¤à¥à¤¤",
    ],
  },
};

function StarRating({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, rating));

  const starColor =
    safeRating >= 4.5 ? "#00A878" :
    safeRating >= 3.5 ? "#73B85A" :
    safeRating >= 2.5 ? "#E8B43A" :
    safeRating >= 1.5 ? "#E98236" :
    "#D94B4B";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.max(0, Math.min(100, (safeRating - star + 1) * 100));

          return (
            <span
              key={star}
              className="relative flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-[2px] bg-gray-200"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[14px] text-white">
                {String.fromCodePoint(0x2605)}
              </span>
              <span
                className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden"
                style={{ width: `${fill}%`, backgroundColor: starColor }}
              >
                <span className="flex h-full w-[18px] shrink-0 items-center justify-center text-[14px] text-white">
                  {String.fromCodePoint(0x2605)}
                </span>
              </span>
            </span>
          );
        })}
      </div>
      <span className="text-sm font-bold text-gray-800">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
}
export default function Home() {
  const { language } = useLanguage();
  const ne = language === "ne";
  const t = translations[language];

  const [search, setSearch] = useState("");
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "most">("newest");
  const [visibleCount, setVisibleCount] = useState(15);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [databaseCategories, setDatabaseCategories] = useState<
    { name: string; icon: string }[]
  >(categories.slice(1));
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const updateStickySearch = () => {
      const heroSearch = document.getElementById("hero-search");
      if (!heroSearch) return;

      setShowStickySearch(
        heroSearch.getBoundingClientRect().bottom <= 80
      );
    };

    window.addEventListener("scroll", updateStickySearch, {
      passive: true,
    });

    updateStickySearch();

    return () => {
      window.removeEventListener("scroll", updateStickySearch);
    };
  }, []);

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
                "id, name, slug, category_id, description, location, website, author, director, release_year, image_url"
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

        const orderedCategories = [...(categoryResult.data ?? [])].sort(
          (a, b) => {
            const aIndex = categories.findIndex((item) => item.name === a.name);
            const bIndex = categories.findIndex((item) => item.name === b.name);

            return (
              (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
                (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex) ||
              a.name.localeCompare(b.name)
            );
          }
        );

        setDatabaseCategories(
          orderedCategories.map((category) => ({
            name: category.name,
            icon: getCategoryIcon(category.name),
          }))
        );

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

  useEffect(() => {
    setVisibleCount(15);
  }, [search, activeCategory, sortBy]);

  const sortedBusinesses = useMemo(() => {
    const result = [...filteredBusinesses];

    if (sortBy === "highest") {
      result.sort(
        (a, b) =>
          b.averageRating - a.averageRating ||
          b.reviewCount - a.reviewCount
      );
    } else if (sortBy === "most") {
      result.sort(
        (a, b) =>
          b.reviewCount - a.reviewCount ||
          b.averageRating - a.averageRating
      );
    }

    return result;
  }, [filteredBusinesses, sortBy]);

  const visibleBusinesses = sortedBusinesses.slice(0, visibleCount);

  const allCategories = [categories[0], ...databaseCategories];

  const categoryLabel = (name: string) => {
    const index = categories.findIndex((item) => item.name === name);
    return index >= 0 ? t.categories[index] : name;
  };

  function scrollToBusinesses() {
    document.getElementById("trending")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 ${showStickySearch ? "py-2" : "py-4"} md:py-4`}>
          <Link href="/" className={`flex shrink-0 items-center ${showStickySearch ? "gap-1.5" : "gap-2"} md:gap-2`}>
            <div className={`flex items-center justify-center rounded-xl bg-green-700 font-black text-white ${showStickySearch ? "h-8 w-8 text-lg" : "h-10 w-10 text-xl"} md:h-10 md:w-10 md:text-xl`}>
              T
            </div>

            <div>
              <h1 className={`font-extrabold tracking-tight ${showStickySearch ? "text-xl" : "text-2xl"} md:text-2xl`}>
                Trust<span className="text-green-700">Nepal</span>
              </h1>
              <p className={`text-[10px] font-semibold tracking-widest text-gray-400 ${showStickySearch ? "hidden md:block" : ""}`}>
                {t.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            {showStickySearch ? (
              <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                  <span className="text-lg text-gray-400">{String.fromCodePoint(0x2715)}</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        scrollToBusinesses();
                      }
                    }}
                    placeholder={t.searchPlaceholder}
                    className="h-10 w-full min-w-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={scrollToBusinesses}
                  className="shrink-0 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
                >
                  {t.search}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8 text-sm font-semibold text-gray-600">
                <a href="#categories" className="hover:text-green-700">
                  {t.navCategories}
                </a>
                <a href="#trending" className="hover:text-green-700">
                  {t.navBusinesses}
                </a>
                <a href="#about" className="hover:text-green-700">
                  {t.navAbout}
                </a>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className={showStickySearch ? "scale-90 md:scale-100" : ""}><LanguageSwitcher /></div>

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
                  className={`rounded-full bg-green-700 font-bold text-white shadow-sm hover:bg-green-800 ${showStickySearch ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"} md:px-5 md:py-2.5 md:text-sm`}
                >
                  {t.join}
                </Link>
              </>
            )}
          </div>
        </div>
        {showStickySearch && (
          <div className="border-t border-gray-100 px-4 pb-2 pt-2 md:hidden">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              <div className="flex min-w-0 flex-1 items-center px-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      scrollToBusinesses();
                    }
                  }}
                  placeholder={t.searchPlaceholder}
                  className="h-9 w-full min-w-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={scrollToBusinesses}
                className="shrink-0 rounded-md bg-green-700 px-3 py-2 text-xs font-bold text-white"
              >
                {t.search}
              </button>
            </div>
          </div>
        )}
      </header>


      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f0f8f2]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-green-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center md:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold text-green-800 shadow-sm">
            {String.fromCodePoint(0x1F1F3, 0x1F1F5)} {t.madeForNepal}
          </div>

          <h2 className="mx-auto max-w-full whitespace-nowrap text-2xl font-black leading-tight tracking-tight text-gray-900 sm:text-3xl md:text-5xl lg:text-6xl">
            {t.heroFirst}{" "}
            <span className="text-green-700">{t.heroSecond}</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            {t.heroDescription}
          </p>

          <div id="hero-search" className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-green-900/10 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-4">
              <span className="text-xl">{String.fromCodePoint(0x1F50D)}</span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    scrollToBusinesses();
                  }
                }}
                placeholder={t.searchPlaceholder}
                className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={scrollToBusinesses}
              className="rounded-xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800"
            >
              {t.search}
            </button>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            {t.popular}{" "}
            {["Hotels", "Movies", "Products", "Restaurants"].map(
              (item, index) => (
                <button
                  key={item}
                  onClick={() => {
                    setSearch(item);
                    scrollToBusinesses();
                  }}
                  className="mx-1 font-semibold text-green-800 hover:underline"
                >
                  {ne
                    ? ({ Hotels: "à¤¹à¥‹à¤Ÿà¤²", Movies: "à¤šà¤²à¤šà¤¿à¤¤à¥à¤°", Products: "à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¤¨", Restaurants: "à¤°à¥‡à¤¸à¥à¤Ÿà¥à¤°à¥‡à¤¨à¥à¤Ÿ" }[item])
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
            [String.fromCodePoint(0x1F1F3, 0x1F1F5), t.stats[0]],
            [String.fromCodePoint(0x1F31F), t.stats[1]],
            [String.fromCodePoint(0x1F465), t.stats[2]],
            [String.fromCodePoint(0x1F4A1), t.stats[3]],
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
          {allCategories
            .filter((item) => item.name !== "All")
            .map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveCategory(item.name);
                  scrollToBusinesses();
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


          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-600">
              {ne ? "à¤¦à¥‡à¤–à¤¾à¤‰à¤¨à¥‡ à¤•à¥à¤°à¤®:" : "Sort by:"}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "most")}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-600 sm:w-64"
            >
              <option value="newest">{ne ? "à¤¨à¤¯à¤¾à¤ à¤ªà¤¹à¤¿à¤²à¥‡" : "Newest"}</option>
              <option value="highest">{ne ? "à¤‰à¤šà¥à¤š à¤°à¥‡à¤Ÿà¤¿à¤™ à¤ªà¤¹à¤¿à¤²à¥‡" : "Highest Rated"}</option>
              <option value="most">{ne ? "à¤§à¥‡à¤°à¥ˆ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤ªà¤¹à¤¿à¤²à¥‡" : "Most Reviewed"}</option>
            </select>
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
          ) : sortedBusinesses.length > 0 ? (
            <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleBusinesses.map((item) => (
                <Link
                  key={item.id}
                  href={`/business/${encodeURIComponent(item.slug)}`}
                  aria-label={`View ${item.name} business profile`}
                  className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                >
                  {(item.categoryName === "Books" || item.categoryName === "Movies") ? (
                    <>
                      {item.image_url && (
                        <div className="mb-4 flex h-52 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                          <img
                            src={item.image_url}
                            alt={item.categoryName === "Books" ? `${item.name} book cover` : `${item.name} movie poster`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex justify-end">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                          {categoryLabel(item.categoryName)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold text-gray-900 group-hover:text-green-700">
                        {item.name}
                      </h3>
                      {item.categoryName === "Books" && item.author && (
                        <p className="mt-2 text-sm text-gray-500">
                          Author: {item.author}
                        </p>
                      )}
                      {item.categoryName === "Movies" && (
                        <>
                          {item.director && (
                            <p className="mt-2 text-sm text-gray-500">
                              Director: {item.director}
                            </p>
                          )}
                          {item.release_year && (
                            <p className="mt-1 text-sm text-gray-500">
                              Release Year: {item.release_year}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                          {getCategoryIcon(item.categoryName)}
                        </div>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                          {categoryLabel(item.categoryName)}
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-extrabold text-gray-900 group-hover:text-green-700">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {String.fromCodePoint(0x1F4CD)} {item.location || (ne ? "à¤¸à¥à¤¥à¤¾à¤¨ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤›à¥ˆà¤¨" : t.locationMissing)}
                      </p>
                    </>
                  )}

                  {item.description && (
                    <p
                      className="mt-4 overflow-hidden text-sm leading-6 text-gray-500"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 10,
                        overflow: "hidden",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
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
                      {t.viewProfile} {String.fromCodePoint(0x2192)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {visibleBusinesses.length < sortedBusinesses.length && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount((current) => current + 15)}
                  className="rounded-full bg-green-700 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
                >
                  {ne ? "à¤¥à¤ª à¤•à¤®à¥à¤ªà¤¨à¥€à¤¹à¤°à¥‚ à¤¦à¥‡à¤–à¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥" : "Load More"}
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
              <div className="text-5xl">{String.fromCodePoint(0x1F50D)}</div>
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
          <div className="text-5xl">{String.fromCodePoint(0x1F4AC)}</div>
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
            {userEmail ? t.exploreTrust : t.joinToday} {String.fromCodePoint(0x2192)}
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
              {String.fromCodePoint(0x1F1F3, 0x1F1F5)} {t.proudly}
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
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact Us
            </Link>
          </div>

          <p className="text-xs text-gray-500">
            {String.fromCodePoint(0x00A9)} 2026 TrustNepal. {t.copyright}
          </p>
        </div>
      </footer>
    </main>
  );
}
