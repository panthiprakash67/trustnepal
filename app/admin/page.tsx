
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { supabase } from "../../lib/supabase";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

type Business = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  description: string | null;
  location: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
};

type UserRole = {
  user_id: string;
  role: string;
  created_at: string;
};

type Review = {
  id: number;
  business_id: number;
  user_id: string;
  rating: number;
  title: string | null;
  review_text: string;
  status: string;
  created_at: string;
  updated_at: string;
  businesses: { name: string } | null;
};

type ModerationLog = {
  id: number;
  review_id: number | null;
  moderator_id: string | null;
  old_status: string;
  new_status: string;
  reason: string | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [qrCompany, setQrCompany] = useState<Business | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [reviewReasons, setReviewReasons] = useState<Record<number, string>>({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("companies");

  const [companySearch, setCompanySearch] = useState("");
  const [companyCategoryFilter, setCompanyCategoryFilter] = useState("all");
  const [companyPage, setCompanyPage] = useState(1);
  const companiesPerPage = 10;

  const [companyName, setCompanyName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [roleEmail, setRoleEmail] = useState("");
  const [newRole, setNewRole] = useState("admin");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    initializeAdmin();
  }, []);

  async function initializeAdmin() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.replace("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      if (
        !roleData ||
        !["super_admin", "admin", "moderator"].includes(roleData.role)
      ) {
        setError("You do not have permission to access this dashboard.");
        setLoading(false);
        return;
      }

      setUserRole(roleData.role);
      setAuthorized(true);

      if (["super_admin", "admin"].includes(roleData.role)) {
        await loadCategories();
        await loadBusinesses();
      }

      if (roleData.role === "super_admin") {
        await loadRoles();
      }

      if (["super_admin", "moderator"].includes(roleData.role)) {
        await loadReviews();
        await loadModerationHistory();
        setActiveTab("reviews");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open Admin Dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .order("name");

    if (error) throw error;

    setCategories((data ?? []) as Category[]);
  }

  function resetCategoryForm() {
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategoryId(null);
  }

  function editCategory(category: Category) {
    setCategoryName(category.name);
    setCategoryDescription(category.description ?? "");
    setEditingCategoryId(category.id);
    setMessage("");
    setError("");
  }

  async function saveCategory() {
    const name = categoryName.trim();

    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      setError("Please use English letters or numbers in the category name.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const categoryData = {
        name,
        slug,
        description: categoryDescription.trim() || null,
      };

      if (editingCategoryId !== null) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategoryId);

        if (error) throw error;

        setMessage("Category updated successfully.");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(categoryData);

        if (error) throw error;

        setMessage("Category added successfully.");
      }

      await loadCategories();
      resetCategoryForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function loadBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, slug, category_id, description, location, website, email, phone")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setBusinesses((data ?? []) as Business[]);
  }

  async function loadRoles() {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setRoles((data ?? []) as UserRole[]);
  }

  async function loadReviews() {
    setReviewLoading(true);

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          business_id,
          user_id,
          rating,
          title,
          review_text,
          status,
          created_at,
          updated_at,
          businesses(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews((data ?? []) as unknown as Review[]);
    } finally {
      setReviewLoading(false);
    }
  }

  async function loadModerationHistory() {
    setHistoryLoading(true);

    try {
      const { data, error } = await supabase
        .from("review_moderation_logs")
        .select("id, review_id, moderator_id, old_status, new_status, reason, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      setModerationLogs((data ?? []) as ModerationLog[]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function moderateReview(
    reviewId: number,
    newStatus: "approved" | "hidden" | "rejected"
  ) {
    const reason = reviewReasons[reviewId]?.trim() ?? "";

    if (
      (newStatus === "hidden" || newStatus === "rejected") &&
      !reason
    ) {
      setError("Please enter a reason before hiding or rejecting a review.");
      return;
    }

    const actionText =
      newStatus === "approved"
        ? "approve"
        : newStatus === "hidden"
        ? "hide"
        : "reject";

    if (!window.confirm(`Are you sure you want to ${actionText} this review?`)) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.rpc("moderate_review", {
        _review_id: reviewId,
        _new_status: newStatus,
        _reason: reason || null,
      });

      if (error) throw error;

      setMessage(`Review ${actionText}d successfully!`);

      setReviewReasons((previous) => {
        const updated = { ...previous };
        delete updated[reviewId];
        return updated;
      });

      await loadReviews();
      await loadModerationHistory();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to moderate this review."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredCompanies = businesses.filter((company) => {
    const searchText = [
      company.name,
      company.slug,
      company.location ?? "",
      company.email ?? "",
      company.phone ?? "",
    ].join(" ").toLowerCase();

    const matchesSearch = searchText.includes(companySearch.trim().toLowerCase());
    const matchesCategory =
      companyCategoryFilter === "all" ||
      String(company.category_id) === companyCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalCompanyPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / companiesPerPage)
  );

  const paginatedCompanies = filteredCompanies.slice(
    (companyPage - 1) * companiesPerPage,
    companyPage * companiesPerPage
  );

  function getCategoryCompanyCount(categoryId: number) {
    return businesses.filter(
      (company) => company.category_id === categoryId
    ).length;
  }

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function resetCompanyForm() {
    setCompanyName("");
    setCategoryId("");
    setDescription("");
    setLocation("");
    setWebsite("");
    setCompanyEmail("");
    setCompanyPhone("");
    setEditingId(null);
  }

  function editCompany(company: Business) {
    setEditingId(company.id);
    setCompanyName(company.name);
    setCategoryId(String(company.category_id));
    setDescription(company.description ?? "");
    setLocation(company.location ?? "");
    setWebsite(company.website ?? "");
    setCompanyEmail(company.email ?? "");
    setCompanyPhone(company.phone ?? "");

    setActiveTab("companies");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function generateCompanyQr(company: Business) {
    setQrLoading(true);
    setError("");

    try {
      const companyUrl = `https://trustnepal.vercel.app/business/${encodeURIComponent(company.slug)}`;
      const dataUrl = await QRCode.toDataURL(companyUrl, {
        width: 700,
        margin: 3,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#FFFFFF" },
      });

      setQrCompany(company);
      setQrDataUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate QR code.");
    } finally {
      setQrLoading(false);
    }
  }

  async function downloadCompanyQr() {
    if (!qrDataUrl || !qrCompany) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create QR poster.");
      }

      const width = 1200;
      const height = 1800;

      canvas.width = width;
      canvas.height = height;

      const green = "#087A45";
      const dark = "#17251D";
      const muted = "#52635A";

      ctx.fillStyle = "#F5F9F6";
      ctx.fillRect(0, 0, width, height);

      // TrustNepal header
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(42, 42, 1116, 273, 32);
      ctx.fill();

      ctx.fillStyle = green;
      ctx.fillRect(42, 42, 1116, 23);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = green;
      ctx.font = "bold 82px Arial";
      ctx.fillText("TrustNepal", 600, 125);

      ctx.fillStyle = muted;
      ctx.font = "31px Arial";
      ctx.fillText("Nepal's Trusted Review Platform.", 600, 205);

      ctx.fillStyle = dark;
      ctx.font = "bold 23px Arial";
      ctx.fillText("REAL EXPERIENCES. TRUSTED DECISIONS.", 600, 270);

      // Scan heading
      ctx.fillStyle = green;
      ctx.font = "bold 34px Arial";
      ctx.fillText("SCAN TO REVIEW", 600, 365);

      // Company name with automatic wrapping
      const companyName = qrCompany.name || "Company";
      const companyFont = "bold 40px Arial";
      ctx.font = companyFont;

      const words = companyName.split(/\s+/);
      const lines = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;

        if (ctx.measureText(testLine).width <= 1080) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) lines.push(currentLine);

      let companyY = 435;
      ctx.fillStyle = dark;
      ctx.font = companyFont;

      for (const line of lines) {
        ctx.fillText(line, 600, companyY);
        companyY += 54;
      }

      // Load the original QR image without changing its destination
      const qrImage = new Image();

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = () => reject(new Error("Unable to load QR image."));
        qrImage.src = qrDataUrl;
      });

      // Large QR with a clear white quiet zone
      const qrSize = 820;
      const panelTop = companyY + 20;
      const panelBottom = panelTop + qrSize + 52;

      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#DCE8E0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(145, panelTop, 910, qrSize + 52, 30);
      ctx.fill();
      ctx.stroke();

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrImage, 190, panelTop + 26, qrSize, qrSize);
      ctx.imageSmoothingEnabled = true;

      // Poster message
      const footerY = panelBottom + 38;

      ctx.fillStyle = dark;
      ctx.font = "bold 28px Arial";
      ctx.fillText("Scan to visit and review this company", 600, footerY);

      ctx.fillStyle = muted;
      ctx.font = "23px Arial";
      ctx.fillText("Your experience matters. Share your review.", 600, footerY + 55);

      // TrustNepal footer
      ctx.fillStyle = green;
      ctx.beginPath();
      ctx.roundRect(42, height - 125, 1116, 83, 22);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px Arial";
      ctx.fillText("TRUSTNEPAL  •  SHARE YOUR EXPERIENCE", 600, height - 83);

      const link = document.createElement("a");
      link.download = `${qrCompany.slug}-trustnepal-qr-poster.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download QR poster.");
    }
  }

  async function saveCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!companyName.trim() || !categoryId) {
        throw new Error("Company name and category are required.");
      }

      const companyData = {
        name: companyName.trim(),
        slug: createSlug(companyName),
        category_id: Number(categoryId),
        description: description.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
        email: companyEmail.trim() || null,
        phone: companyPhone.trim() || null,
      };

      if (editingId !== null) {
        const { error } = await supabase
          .from("businesses")
          .update(companyData)
          .eq("id", editingId);

        if (error) throw error;

        setMessage("Company updated successfully!");
      } else {
        const { error } = await supabase
          .from("businesses")
          .insert(companyData);

        if (error) throw error;

        setMessage("New company added successfully!");
      }

      resetCompanyForm();
      await loadBusinesses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save company."
      );
    } finally {
      setSaving(false);
    }
  }

  async function assignRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!roleEmail.trim()) {
        throw new Error("Please enter the registered email address.");
      }

      const { error } = await supabase.rpc("assign_user_role_by_email", {
        _email: roleEmail.trim(),
        _new_role: newRole,
      });

      if (error) throw error;

      setMessage("User role assigned successfully!");
      setRoleEmail("");

      await loadRoles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign user role."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeRole(userId: string) {
    if (
      !window.confirm(
        "Are you sure you want to remove this user's admin role?"
      )
    ) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.rpc("remove_user_role", {
        _target_user_id: userId,
      });

      if (error) throw error;

      setMessage("User role removed successfully!");
      await loadRoles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove role."
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  function statusStyle(status: string) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "hidden":
        return "bg-gray-200 text-gray-700";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  const filteredReviews =
    reviewFilter === "all"
      ? reviews
      : reviews.filter((review) => review.status === reviewFilter);

  const reviewCounts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    hidden: reviews.filter((r) => r.status === "hidden").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading Admin Dashboard...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-5">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Access Denied
          </h1>
          <p className="mt-3 text-gray-600">
            {error || "You are not authorized to access this page."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 text-white"
          >
            Go to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <h1 className="text-2xl font-extrabold">
              TrustNepal Admin
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Platform Management Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-green-800 px-3 py-1 text-xs font-semibold sm:inline-block">
              {userRole.replace("_", " ").toUpperCase()}
            </span>

            <button
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* Company Dashboard */}
        {["super_admin", "admin"].includes(userRole) && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Total Companies</p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900">
                  {businesses.length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Registered Categories
                </p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900">
                  {categories.length}
                </p>
              </div>
            </div>

            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Category Overview
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    All registered categories and their listed companies.
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
                  {categories.length} Categories
                </span>
              </div>

              {categories.length === 0 ? (
                <p className="mt-5 rounded-lg bg-gray-50 p-5 text-center text-gray-500">
                  No categories found.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => {
                    const count = getCategoryCompanyCount(category.id);

                    const categoryCompanies = businesses.filter(
                      (company) => company.category_id === category.id
                    );

                    return (
                      <div
                        key={category.id}
                        className="rounded-xl border border-gray-200 p-5 transition hover:border-green-400 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {category.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {count} {count === 1 ? "Company" : "Companies"}
                            </p>
                          </div>

                          <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-green-100 px-3 font-bold text-green-800">
                            {count}
                          </span>
                        </div>

                        {categoryCompanies.length > 0 ? (
                          <div className="hidden">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Listed Companies
                            </p>

                            <div className="space-y-2">
                              {categoryCompanies.slice(0, 7).map((company) => (
                                <button
                                  key={company.id}
                                  onClick={() => editCompany(company)}
                                  className="block w-full rounded-lg bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-800"
                                >
                                  {company.name}
                                  <span className="ml-2 text-xs text-gray-400">
                                    Edit
                                  </span>
                                </button>
                              ))}
                            </div>

                            {categoryCompanies.length > 7 && (
                              <button
                                onClick={() => {
                                  setCompanyCategoryFilter(String(category.id));
                                  setCompanySearch("");
                                  setCompanyPage(1);
                                  setActiveTab("companies");
                                }}
                                className="mt-3 text-sm font-semibold text-green-700 hover:text-green-900"
                              >
                                View All {count} Companies →
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                            No companies listed in this category yet.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Dashboard Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {["super_admin", "admin"].includes(userRole) && (
            <button
              onClick={() => setActiveTab("companies")}
              className={`rounded-lg px-5 py-3 text-sm font-semibold ${
                activeTab === "companies"
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Company Management
            </button>
          )}

          {["super_admin", "moderator"].includes(userRole) && (
            <button
              onClick={() => setActiveTab("reviews")}
              className={`rounded-lg px-5 py-3 text-sm font-semibold ${
                activeTab === "reviews"
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Review Management
            </button>
          )}

          {userRole === "super_admin" && (
            <>
              <button
                onClick={() => setActiveTab("users")}
                className={`rounded-lg px-5 py-3 text-sm font-semibold ${
                  activeTab === "users"
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                Admin Management
              </button>

              <button
                onClick={() => setActiveTab("categories")}
                className={`rounded-lg px-5 py-3 text-sm font-semibold ${
                  activeTab === "categories"
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                Category Management
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-3 font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-lg bg-green-100 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Review Management */}
        {activeTab === "reviews" &&
          ["super_admin", "moderator"].includes(userRole) && (
            <section className="mt-6 space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Review Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Review, approve, hide or reject submitted reviews.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      loadReviews();
                      loadModerationHistory();
                    }}
                    disabled={reviewLoading || historyLoading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {(
                    [
                      ["all", "All Reviews"],
                      ["pending", "Pending"],
                      ["approved", "Approved"],
                      ["hidden", "Hidden"],
                      ["rejected", "Rejected"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setReviewFilter(key)}
                      className={`rounded-xl border p-4 text-left ${
                        reviewFilter === key
                          ? "border-green-700 bg-green-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-500">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-extrabold text-gray-900">
                        {reviewCounts[key]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {reviewFilter === "all"
                      ? "All Reviews"
                      : `${reviewFilter.charAt(0).toUpperCase()}${reviewFilter.slice(1)} Reviews`}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {filteredReviews.length} found
                  </span>
                </div>

                {reviewLoading ? (
                  <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                    Loading reviews...
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
                    No reviews found in this section.
                  </div>
                ) : (
                  filteredReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-xl bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-sm font-bold text-green-800">
                            {review.businesses?.name ?? `Business #${review.business_id}`}
                          </p>

                          <h4 className="mt-2 text-lg font-bold text-gray-900">
                            {review.title || "Untitled Review"}
                          </h4>

                          <p className="mt-1 text-sm text-yellow-600">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                            <span className="ml-2 text-gray-500">
                              ({review.rating}/5)
                            </span>
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyle(review.status)}`}
                        >
                          {review.status}
                        </span>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {review.review_text}
                      </p>

                      <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                        <p>Review ID: {review.id}</p>
                        <p className="mt-1 break-all">
                          User ID: {review.user_id}
                        </p>
                        <p className="mt-1">
                          Submitted: {new Date(review.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Decision reason (required for Hide or Reject)
                        </label>

                        <textarea
                          rows={2}
                          value={reviewReasons[review.id] ?? ""}
                          onChange={(e) =>
                            setReviewReasons((previous) => ({
                              ...previous,
                              [review.id]: e.target.value,
                            }))
                          }
                          placeholder="Write why this review is being hidden or rejected..."
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900"
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {review.status !== "approved" && (
                          <button
                            onClick={() => moderateReview(review.id, "approved")}
                            disabled={saving}
                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}

                        {review.status !== "hidden" && (
                          <button
                            onClick={() => moderateReview(review.id, "hidden")}
                            disabled={saving}
                            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                          >
                            Hide
                          </button>
                        )}

                        {review.status !== "rejected" && (
                          <button
                            onClick={() => moderateReview(review.id, "rejected")}
                            disabled={saving}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Moderation History */}
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Moderation History
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Recent decisions made by Super Admin and Moderators.
                    </p>
                  </div>

                  <span className="text-sm text-gray-500">
                    Latest 100 records
                  </span>
                </div>

                {historyLoading ? (
                  <p className="mt-5 text-center text-gray-500">
                    Loading history...
                  </p>
                ) : moderationLogs.length === 0 ? (
                  <p className="mt-5 rounded-lg bg-gray-50 p-5 text-center text-gray-500">
                    No moderation decisions recorded yet.
                  </p>
                ) : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-3 py-3">Review ID</th>
                          <th className="px-3 py-3">Moderator ID</th>
                          <th className="px-3 py-3">Previous</th>
                          <th className="px-3 py-3">New Status</th>
                          <th className="px-3 py-3">Reason</th>
                          <th className="px-3 py-3">Date</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {moderationLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-3 py-3 font-semibold text-gray-900">
                              {log.review_id ?? "Deleted"}
                            </td>
                            <td className="max-w-[180px] break-all px-3 py-3 text-xs text-gray-600">
                              {log.moderator_id ?? "Unknown"}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle(log.old_status)}`}>
                                {log.old_status}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle(log.new_status)}`}>
                                {log.new_status}
                              </span>
                            </td>
                            <td className="max-w-[220px] whitespace-pre-wrap px-3 py-3 text-gray-600">
                              {log.reason || "—"}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-500">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </section>
          )}

        {/* Company Management */}
        {activeTab === "companies" &&
          ["super_admin", "admin"].includes(userRole) && (
            <section className="mt-6 grid items-start gap-6 lg:grid-cols-5">
              <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId !== null ? "Edit Company" : "Add New Company"}
                </h2>

                <form onSubmit={saveCompany} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Company Name *
                    </label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      placeholder="e.g. Bajeko Sekuwa"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Describe this company..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Location
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kathmandu, Nepal"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Official Company Email
                    </label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="e.g. info@example.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Official Contact Number
                    </label>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="e.g. +977-1-1234567"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId !== null
                      ? "Update Company"
                      : "Add Company"}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={resetCompanyForm}
                      className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700"
                    >
                      Cancel Editing
                    </button>
                  )}
                </form>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Listed Companies
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage companies listed on TrustNepal.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setCompanyPage(1);
                    }}
                    placeholder="Search companies..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-500 outline-none focus:border-green-600"
                  />

                  <select
                    value={companyCategoryFilter}
                    onChange={(e) => {
                      setCompanyCategoryFilter(e.target.value);
                      setCompanyPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-green-600"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 space-y-3">
                  {businesses.length === 0 && (
                    <p className="py-8 text-center text-gray-500">
                      No companies found.
                    </p>
                  )}

                  {paginatedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {company.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          /{company.slug}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {categories.find((c) => c.id === company.category_id)?.name ?? "Uncategorized"}
                          {company.location ? ` • ${company.location}` : ""}
                        </p>
                        {company.email && (
                          <p className="mt-1 text-sm text-gray-600">Email: {company.email}</p>
                        )}
                        {company.phone && (
                          <p className="mt-1 text-sm text-gray-600">Phone: {company.phone}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => editCompany(company)}
                            className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => generateCompanyQr(company)}
                            disabled={qrLoading}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                          >
                            {qrLoading && qrCompany?.id === company.id ? "Generating..." : "Generate QR"}
                          </button>
                        </div>

                        {qrCompany?.id === company.id && qrDataUrl && (
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="mb-3 font-semibold text-gray-900">
                              QR Code - {company.name}
                            </p>
                            <img
                              src={qrDataUrl}
                              alt={`TrustNepal QR code for ${company.name}`}
                              className="h-56 w-56 max-w-full rounded border border-gray-100"
                            />
                            <p className="mt-2 max-w-56 break-all text-xs text-gray-500">
                              https://trustnepal.vercel.app/business/{company.slug}
                            </p>
                            <button
                              onClick={downloadCompanyQr}
                              className="mt-3 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                            >
                              Download QR Poster (PNG)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {businesses.length > 0 && filteredCompanies.length === 0 && (
                    <p className="py-8 text-center text-gray-500">
                      No companies match your search or selected category.
                    </p>
                  )}

                  {filteredCompanies.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
                      <p className="text-sm text-gray-500">
                        Showing {(companyPage - 1) * companiesPerPage + 1}
                        {" - "}
                        {Math.min(companyPage * companiesPerPage, filteredCompanies.length)}
                        {" of "}
                        {filteredCompanies.length} companies
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCompanyPage((page) => Math.max(1, page - 1))}
                          disabled={companyPage === 1}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>

                        <span className="text-sm font-medium text-gray-600">
                          Page {companyPage} of {totalCompanyPages}
                        </span>

                        <button
                          onClick={() => setCompanyPage((page) => Math.min(totalCompanyPages, page + 1))}
                          disabled={companyPage >= totalCompanyPages}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

        {/* Admin Management */}
        {activeTab === "users" && userRole === "super_admin" && (
          <section className="mt-6 grid items-start gap-6 lg:grid-cols-5">
            <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900">
                Appoint Team Member
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                The person must already have a registered TrustNepal account.
              </p>

              <form onSubmit={assignRole} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={roleEmail}
                    onChange={(e) => setRoleEmail(e.target.value)}
                    placeholder="person@gmail.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Assign Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="support">Support Staff</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {saving ? "Assigning..." : "Assign Role"}
                </button>
              </form>
            </div>

            <div
  id="listed-companies"
  className="rounded-xl bg-white p-6 shadow-sm lg:col-span-3"
>
              <h2 className="text-xl font-bold text-gray-900">
                Assigned Team Members
              </h2>

              <div className="mt-5 space-y-3">
                {roles.map((item) => (
                  <div
                    key={item.user_id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="break-all text-xs text-gray-500">
                        User ID: {item.user_id}
                      </p>
                      <p className="mt-2 font-bold text-gray-900">
                        {item.role.replace("_", " ").toUpperCase()}
                      </p>
                    </div>

                    {item.role !== "super_admin" && (
                      <button
                        onClick={() => removeRole(item.user_id)}
                        disabled={saving}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove Role
                      </button>
                    )}
                  </div>
                ))}

                {roles.length === 0 && (
                  <p className="py-6 text-center text-gray-500">
                    No team members found.
                  </p>
                )}
              </div>

              <p className="mt-5 text-xs text-gray-400">
                Super Admin accounts cannot be removed from this screen.
              </p>
            </div>
          </section>
        )}

        {/* Category Management */}
        {activeTab === "categories" && userRole === "super_admin" && (
          <section className="mt-6 grid items-start gap-6 lg:grid-cols-5">
            <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategoryId !== null ? "Edit Category" : "Add New Category"}
              </h2>

              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveCategory();
                }}
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="Enter category name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    value={categoryDescription}
                    onChange={(event) =>
                      setCategoryDescription(event.target.value)
                    }
                    placeholder="Enter category description"
                    rows={4}
                    style={{ color: "#000000", backgroundColor: "#ffffff" }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 !text-black placeholder:text-gray-400 outline-none focus:border-green-600"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingCategoryId !== null
                        ? "Update Category"
                        : "Save Category"}
                  </button>

                  {editingCategoryId !== null && (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              {message && (
                <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  All Categories
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                  {categories.length} Categories
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">
                        {category.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Slug: {category.slug}
                      </p>
                      {category.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => editCategory(category)}
                      className="rounded-lg border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                    >
                      Edit
                    </button>
                  </div>
                ))}

                {categories.length === 0 && (
                  <p className="py-6 text-center text-gray-500">
                    No categories found.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
