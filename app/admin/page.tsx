
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
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  email: string | null;
  phone: string | null;
  author: string | null;
  publisher: string | null;
  genre: string | null;
  language: string | null;
  publication_year: number | null;
  isbn: string | null;
  director: string | null;
  cast_members: string | null;
  release_year: number | null;
  duration: string | null;
  production_company: string | null;
  image_url: string | null;
  is_multi_branch: boolean;
};

type BusinessLocation = {
  id: number;
  business_id: number;
  branch_name: string | null;
  province: string | null;
  district: string | null;
  municipality: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
};

type BranchAnalytics = {
  id: number;
  business_id: number;
  branch_name: string | null;
  business_name: string;
  review_count: number;
  average_rating: number | null;
  rating_distribution: Record<string, number>;
};
type ReviewAnalyticsStats = {
  count: number;
  totalRating: number;
  ratingDistribution: Record<string, number>;
};

type CompanyReviewAnalytics = {
  business_id: number;
  business_name: string;
  review_count: number;
  average_rating: number | null;
  rating_distribution: Record<string, number>;
  overall_review_count: number;
  branches: BranchAnalytics[];
};

type AnalyticsReview = {
  id: number;
  business_id: number;
  branch_id: number | null;
  rating: number;
  created_at: string | null;
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
  branch_id: number | null;
  business_branches: { branch_name: string | null } | null;
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
  const [totalListedBranches, setTotalListedBranches] = useState(0);
  const [analyticsBranches, setAnalyticsBranches] = useState<BranchAnalytics[]>([]);
  const [analyticsCompanies, setAnalyticsCompanies] = useState<CompanyReviewAnalytics[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsReviews, setAnalyticsReviews] = useState<AnalyticsReview[]>([]);
  const [analyticsDatePreset, setAnalyticsDatePreset] = useState("all");
  const [analyticsCompanyFilter, setAnalyticsCompanyFilter] = useState("all");
  const [analyticsCustomStart, setAnalyticsCustomStart] = useState("");
  const [analyticsCustomEnd, setAnalyticsCustomEnd] = useState("");
  const [analyticsTrendPeriod, setAnalyticsTrendPeriod] = useState("daily");
  const [expandedAnalyticsCompanies, setExpandedAnalyticsCompanies] = useState<number[]>([]);
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
  const [mainTab, setMainTab] = useState("overview");

  const [companySearch, setCompanySearch] = useState("");
  const [companyCategoryFilter, setCompanyCategoryFilter] = useState("all");
  const [companyPage, setCompanyPage] = useState(1);
  const companiesPerPage = 10;

  const [companyName, setCompanyName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [isMultiBranch, setIsMultiBranch] = useState(false);

  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [locationName, setLocationName] = useState("");
  const [locationProvince, setLocationProvince] = useState("");
  const [locationDistrict, setLocationDistrict] = useState("");
  const [locationMunicipality, setLocationMunicipality] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationPhone, setLocationPhone] = useState("");
  const [locationEmail, setLocationEmail] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [locationSaving, setLocationSaving] = useState(false);
  // Business Account Invitation
  const [inviteBusinessId, setInviteBusinessId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<
    "owner" | "branch_manager" | "review_responder"
  >("owner");
  const [invitationBranches, setInvitationBranches] = useState<BusinessLocation[]>([]);
  const [selectedInvitationBranches, setSelectedInvitationBranches] = useState<number[]>([]);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState("");

  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [isbn, setIsbn] = useState("");

  const [director, setDirector] = useState("");
  const [castMembers, setCastMembers] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [duration, setDuration] = useState("");
  const [productionCompany, setProductionCompany] = useState("");

  const [catalogImageFile, setCatalogImageFile] = useState<File | null>(null);
  const [catalogImagePreview, setCatalogImagePreview] = useState("");

  const selectedCategory = categories.find(
    (category) => String(category.id) === categoryId
  );

  const isBookCategory = selectedCategory?.slug === "books";
  const isMovieCategory = selectedCategory?.slug === "movies";
  const isCatalogCategory = isBookCategory || isMovieCategory;

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
        await loadBranchCount();
        await loadBranchAnalytics();
      }

      if (roleData.role === "super_admin") {
        await loadRoles();
      }

      if (["super_admin", "moderator"].includes(roleData.role)) {
        await loadReviews();
        await loadModerationHistory();
        if (roleData.role === "moderator") setMainTab("admin");
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
      .select("id, name, slug, category_id, description, location, website, facebook_url, instagram_url, tiktok_url, youtube_url, email, phone, author, publisher, genre, language, publication_year, isbn, director, cast_members, release_year, duration, production_company, image_url, is_multi_branch")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setBusinesses((data ?? []) as Business[]);
  }

  async function loadBranchCount() {
    const { count, error } = await supabase
      .from("business_branches")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) throw error;

    setTotalListedBranches(count ?? 0);
  }

  async function loadBranchAnalytics() {
    setAnalyticsLoading(true);

    try {
      const { data: branchData, error: branchError } = await supabase
        .from("business_branches")
        .select("id, business_id, branch_name")
        .eq("is_active", true)
        .order("branch_name", { ascending: true });

      if (branchError) throw branchError;

      const allReviews: {
        id: number;
        business_id: number;
        branch_id: number | null;
        rating: number;
        created_at: string | null;
      }[] = [];

      const pageSize = 1000;
      let offset = 0;

      while (true) {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, business_id, branch_id, rating, created_at")
          .eq("status", "approved")
          .order("id", { ascending: true })
          .range(offset, offset + pageSize - 1);

        if (error) throw error;

        const page = data ?? [];
        allReviews.push(...page);

        if (page.length < pageSize) break;

        offset += pageSize;
      }

      const createEmptyStats = (): ReviewAnalyticsStats => ({
        count: 0,
        totalRating: 0,
        ratingDistribution: {
          "0.5": 0,
          "1.0": 0,
          "1.5": 0,
          "2.0": 0,
          "2.5": 0,
          "3.0": 0,
          "3.5": 0,
          "4.0": 0,
          "4.5": 0,
          "5.0": 0,
        },
      });

      const addRating = (stats: ReviewAnalyticsStats, value: number) => {
        stats.count += 1;
        stats.totalRating += value;

        const ratingKey = value.toFixed(1);

        if (
          value >= 0.5 &&
          value <= 5 &&
          Number.isInteger(value * 2) &&
          Object.prototype.hasOwnProperty.call(
            stats.ratingDistribution,
            ratingKey
          )
        ) {
          stats.ratingDistribution[ratingKey] += 1;
        }
      };

      const companyStats = new Map<number, ReviewAnalyticsStats>();
      const branchStats = new Map<number, ReviewAnalyticsStats>();
      const overallReviewCounts = new Map<number, number>();

      for (const business of businesses) {
        companyStats.set(business.id, createEmptyStats());
        overallReviewCounts.set(business.id, 0);
      }

      for (const review of allReviews) {
        const businessId = review.business_id;
        const rating = Number(review.rating) || 0;

        let company = companyStats.get(businessId);

        if (!company) {
          company = createEmptyStats();
          companyStats.set(businessId, company);
        }

        addRating(company, rating);

        if (review.branch_id === null) {
          overallReviewCounts.set(
            businessId,
            (overallReviewCounts.get(businessId) ?? 0) + 1
          );
        } else {
          let branch = branchStats.get(review.branch_id);

          if (!branch) {
            branch = createEmptyStats();
            branchStats.set(review.branch_id, branch);
          }

          addRating(branch, rating);
        }
      }

      const businessMap = new Map(
        businesses.map((business) => [business.id, business.name])
      );

      const result: BranchAnalytics[] = (branchData ?? []).map((branch) => {
        const stats = branchStats.get(branch.id);

        return {
          id: branch.id,
          business_id: branch.business_id,
          branch_name: branch.branch_name,
          business_name:
            businessMap.get(branch.business_id) ?? "Unknown Business",
          review_count: stats?.count ?? 0,
          rating_distribution:
            stats?.ratingDistribution ?? createEmptyStats().ratingDistribution,
          average_rating:
            stats && stats.count > 0
              ? Math.round((stats.totalRating / stats.count) * 100) / 100
              : null,
        };
      });

      const companyResult: CompanyReviewAnalytics[] = businesses.map(
        (business) => {
          const stats = companyStats.get(business.id) ?? createEmptyStats();

          return {
            business_id: business.id,
            business_name: business.name,
            review_count: stats.count,
            average_rating:
              stats.count > 0
                ? Math.round((stats.totalRating / stats.count) * 100) / 100
                : null,
            rating_distribution: stats.ratingDistribution,
            overall_review_count:
              overallReviewCounts.get(business.id) ?? 0,
            branches: result.filter(
              (branch) => branch.business_id === business.id
            ),
          };
        }
      );

      setAnalyticsReviews(allReviews);
      setAnalyticsBranches(result);
      setAnalyticsCompanies(companyResult);
    } finally {
      setAnalyticsLoading(false);
    }
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
          branch_id,
          businesses(name),
          business_branches(branch_name)
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

  function handleCatalogImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be 2 MB or smaller.");
      e.target.value = "";
      return;
    }

    setError("");
    setCatalogImageFile(file);
    setCatalogImagePreview(URL.createObjectURL(file));
  }

  function resetLocationForm() {
    setLocationName("");
    setLocationProvince("");
    setLocationDistrict("");
    setLocationMunicipality("");
    setLocationAddress("");
    setLocationPhone("");
    setLocationEmail("");
    setEditingLocationId(null);
  }

  async function loadBusinessLocations(businessId: number) {
    const { data, error } = await supabase
      .from("business_branches")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setLocations((data ?? []) as BusinessLocation[]);
  }

  function resetCompanyForm() {
    setCompanyName("");
    setCategoryId("");
    setDescription("");
    setLocation("");
    setWebsite("");
    setFacebookUrl("");
    setInstagramUrl("");
    setTiktokUrl("");
    setYoutubeUrl("");
    setCompanyEmail("");
    setCompanyPhone("");
    setIsMultiBranch(false);
    setLocations([]);
    resetLocationForm();

    setAuthor("");
    setPublisher("");
    setGenre("");
    setLanguage("");
    setPublicationYear("");
    setIsbn("");
    setDirector("");
    setCastMembers("");
    setReleaseYear("");
    setDuration("");
    setProductionCompany("");
    setCatalogImageFile(null);
    setCatalogImagePreview("");

    setEditingId(null);
  }

  function editCompany(company: Business) {
    setEditingId(company.id);
    setCompanyName(company.name);
    setCategoryId(String(company.category_id));
    setDescription(company.description ?? "");
    setLocation(company.location ?? "");
    setWebsite(company.website ?? "");
    setFacebookUrl(company.facebook_url ?? "");
    setInstagramUrl(company.instagram_url ?? "");
    setTiktokUrl(company.tiktok_url ?? "");
    setYoutubeUrl(company.youtube_url ?? "");
    setCompanyEmail(company.email ?? "");
    setCompanyPhone(company.phone ?? "");
    setIsMultiBranch(company.is_multi_branch ?? false);
    resetLocationForm();
    if (company.is_multi_branch) {
      void loadBusinessLocations(company.id);
    } else {
      setLocations([]);
    }

    setAuthor(company.author ?? "");
    setPublisher(company.publisher ?? "");
    setGenre(company.genre ?? "");
    setLanguage(company.language ?? "");
    setPublicationYear(company.publication_year?.toString() ?? "");
    setIsbn(company.isbn ?? "");
    setDirector(company.director ?? "");
    setCastMembers(company.cast_members ?? "");
    setReleaseYear(company.release_year?.toString() ?? "");
    setDuration(company.duration ?? "");
    setProductionCompany(company.production_company ?? "");
    setCatalogImageFile(null);
    setCatalogImagePreview(company.image_url ?? "");

    setMainTab("admin");
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
      ctx.fillText("TRUSTNEPAL  â€¢  SHARE YOUR EXPERIENCE", 600, height - 83);

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
        throw new Error("Name and category are required.");
      }

      if (isBookCategory && !author.trim()) {
        throw new Error("Book author is required.");
      }

      let imageUrl = catalogImagePreview.startsWith("http")
        ? catalogImagePreview
        : null;

      if (catalogImageFile && isCatalogCategory) {
        const extension =
          catalogImageFile.type === "image/jpeg" ? "jpg" :
          catalogImageFile.type === "image/png" ? "png" : "webp";

        const imagePath =
          `${selectedCategory!.slug}/${createSlug(companyName)}-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("catalog-images")
          .upload(imagePath, catalogImageFile, {
            upsert: false,
            contentType: catalogImageFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("catalog-images")
          .getPublicUrl(imagePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const validateSocialUrl = (
        value: string,
        platform: "Facebook" | "Instagram" | "TikTok" | "YouTube"
      ) => {
        if (!value.trim()) return null;

        let parsedUrl: URL;

        try {
          parsedUrl = new URL(value.trim());
        } catch {
          throw new Error(`${platform} URL is not valid.`);
        }

        const hostname = parsedUrl.hostname.toLowerCase();
        const allowedDomains =
          platform === "Facebook"
            ? ["facebook.com", "fb.com"]
            : platform === "Instagram"
              ? ["instagram.com"]
              : platform === "TikTok"
                ? ["tiktok.com"]
                : ["youtube.com", "youtu.be"];

        if (
          !["http:", "https:"].includes(parsedUrl.protocol) ||
          !allowedDomains.some(
            (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
          )
        ) {
          throw new Error(`Please enter a valid ${platform} page URL.`);
        }

        return parsedUrl.toString();
      };

      const companyData = {
        name: companyName.trim(),
        slug: createSlug(companyName),
        category_id: Number(categoryId),
        description: description.trim() || null,
        is_multi_branch: isCatalogCategory ? false : isMultiBranch,

        location: isCatalogCategory ? null : location.trim() || null,
        website: isCatalogCategory ? null : website.trim() || null,
        facebook_url: isCatalogCategory ? null : validateSocialUrl(facebookUrl, "Facebook"),
        instagram_url: isCatalogCategory ? null : validateSocialUrl(instagramUrl, "Instagram"),
        tiktok_url: isCatalogCategory ? null : validateSocialUrl(tiktokUrl, "TikTok"),
        youtube_url: isCatalogCategory ? null : validateSocialUrl(youtubeUrl, "YouTube"),
        email: isCatalogCategory ? null : companyEmail.trim() || null,
        phone: isCatalogCategory ? null : companyPhone.trim() || null,

        author: isBookCategory ? author.trim() || null : null,
        publisher: isBookCategory ? publisher.trim() || null : null,
        genre: isCatalogCategory ? genre.trim() || null : null,
        language: isCatalogCategory ? language.trim() || null : null,
        publication_year: isBookCategory && publicationYear
          ? Number(publicationYear) : null,
        isbn: isBookCategory ? isbn.trim() || null : null,

        director: isMovieCategory ? director.trim() || null : null,
        cast_members: isMovieCategory ? castMembers.trim() || null : null,
        release_year: isMovieCategory && releaseYear
          ? Number(releaseYear) : null,
        duration: isMovieCategory ? duration.trim() || null : null,
        production_company: isMovieCategory
          ? productionCompany.trim() || null : null,

        image_url: isCatalogCategory ? imageUrl : null,
      };

      let savedBusinessId = editingId;

      if (editingId !== null) {
        const { error } = await supabase
          .from("businesses")
          .update(companyData)
          .eq("id", editingId);

        if (error) throw error;

        setMessage(
          isBookCategory ? "Book updated successfully!" :
          isMovieCategory ? "Movie updated successfully!" :
          "Company updated successfully!"
        );
      } else {
        const { data, error } = await supabase
          .from("businesses")
          .insert(companyData)
          .select("id")
          .single();

        if (error) throw error;

        savedBusinessId = data.id;
        setEditingId(data.id);

        setMessage(
          isBookCategory ? "New book added successfully!" :
          isMovieCategory ? "New movie added successfully!" :
          "New company added successfully! You can now add locations."
        );
      }

      if (isCatalogCategory) {
        resetCompanyForm();
      } else if (isMultiBranch && savedBusinessId !== null) {
        await loadBusinessLocations(savedBusinessId);
      } else {
        setLocations([]);
      }

      await loadBusinesses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveBusinessLocation() {

    if (editingId === null || !isMultiBranch) {
      setError("Please save a multiple-location company first.");
      return;
    }

    if (!locationName.trim()) {
      setError("Location Name is required.");
      return;
    }

    setLocationSaving(true);
    setMessage("");
    setError("");

    try {
      const locationData = {
        business_id: editingId,
        branch_name: locationName.trim(),
        province: locationProvince.trim() || null,
        district: locationDistrict.trim() || null,
        municipality: locationMunicipality.trim() || null,
        address: locationAddress.trim() || null,
        phone: locationPhone.trim() || null,
        email: locationEmail.trim() || null,
      };

      if (editingLocationId !== null) {
        const { error } = await supabase
          .from("business_branches")
          .update(locationData)
          .eq("id", editingLocationId)
          .eq("business_id", editingId);

        if (error) throw error;

        setMessage("Location updated successfully!");
      } else {
        const { error } = await supabase
          .from("business_branches")
          .insert({
            ...locationData,
            is_active: true,
          });

        if (error) throw error;

        setMessage("Location added successfully!");
      }

      resetLocationForm();
      await loadBusinessLocations(editingId);
      await loadBranchCount();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save location."
      );
    } finally {
      setLocationSaving(false);
    }
  }

  function editBusinessLocation(item: BusinessLocation) {
    setLocationName(item.branch_name ?? "");
    setLocationProvince(item.province ?? "");
    setLocationDistrict(item.district ?? "");
    setLocationMunicipality(item.municipality ?? "");
    setLocationAddress(item.address ?? "");
    setLocationPhone(item.phone ?? "");
    setLocationEmail(item.email ?? "");
    setEditingLocationId(item.id);
  }

  async function toggleBusinessLocation(item: BusinessLocation) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("business_branches")
      .update({ is_active: !item.is_active })
      .eq("id", item.id)
      .eq("business_id", item.business_id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      item.is_active
        ? "Location deactivated successfully!"
        : "Location activated successfully!"
    );

    await loadBusinessLocations(item.business_id);
    await loadBranchCount();
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

  async function loadInvitationBranches(businessId: number) {
    setInvitationBranches([]);
    setSelectedInvitationBranches([]);

    if (!businessId) return;

    const { data, error } = await supabase
      .from("business_branches")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setInvitationBranches((data ?? []) as BusinessLocation[]);
  }

  async function createBusinessInvitation(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setInvitationLoading(true);
    setMessage("");
    setError("");
    setInvitationUrl("");

    try {
      if (!inviteBusinessId || !inviteEmail.trim()) {
        throw new Error("Please select a business and enter an email.");
      }

      if (
        inviteRole !== "owner" &&
        selectedInvitationBranches.length === 0
      ) {
        throw new Error("Please assign at least one active branch.");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error("Please login again.");
      }

      const result = await fetch("/api/admin/business-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          business_id: Number(inviteBusinessId),
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          branch_ids:
            inviteRole === "owner"
              ? []
              : selectedInvitationBranches,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || "Unable to create invitation.");
      }

      setInvitationUrl(data.invitation_url);
      setMessage("Business invitation created successfully!");
      setInviteEmail("");
      setSelectedInvitationBranches([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create business invitation."
      );
    } finally {
      setInvitationLoading(false);
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

  const getNptDateKey = (value: string | Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(value));

    const year = parts.find((part) => part.type === "year")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const day = parts.find((part) => part.type === "day")?.value ?? "";

    return `${year}-${month}-${day}`;
  };

  const addDaysToDateKey = (dateKey: string, days: number) => {
    const date = new Date(`${dateKey}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const todayNpt = getNptDateKey(new Date());
  const currentMonthStart = `${todayNpt.slice(0, 7)}-01`;

  const analyticsDateFilteredReviews = analyticsReviews.filter((review) => {
    if (!review.created_at) return false;

    const reviewDate = getNptDateKey(review.created_at);

    switch (analyticsDatePreset) {
      case "today":
        return reviewDate === todayNpt;

      case "last7":
        return reviewDate >= addDaysToDateKey(todayNpt, -6) &&
          reviewDate <= todayNpt;

      case "last30":
        return reviewDate >= addDaysToDateKey(todayNpt, -29) &&
          reviewDate <= todayNpt;

      case "thisMonth":
        return reviewDate >= currentMonthStart &&
          reviewDate <= todayNpt;

      case "custom":
        if (analyticsCustomStart && reviewDate < analyticsCustomStart) {
          return false;
        }
        if (analyticsCustomEnd && reviewDate > analyticsCustomEnd) {
          return false;
        }
        return true;

      default:
        return true;
    }
  });

  const analyticsFilteredReviews =
    analyticsCompanyFilter === "all"
      ? analyticsDateFilteredReviews
      : analyticsDateFilteredReviews.filter(
          (review) => review.business_id === Number(analyticsCompanyFilter)
        );

  const createAnalyticsStats = () => ({
    count: 0,
    totalRating: 0,
    ratingDistribution: {
      "0.5": 0,
      "1.0": 0,
      "1.5": 0,
      "2.0": 0,
      "2.5": 0,
      "3.0": 0,
      "3.5": 0,
      "4.0": 0,
      "4.5": 0,
      "5.0": 0,
    } as Record<string, number>,
  });

  const addAnalyticsRating = (
    stats: ReturnType<typeof createAnalyticsStats>,
    rating: number
  ) => {
    stats.count += 1;
    stats.totalRating += rating;

    const key = rating.toFixed(1);

    if (
      rating >= 0.5 &&
      rating <= 5 &&
      Number.isInteger(rating * 2) &&
      Object.prototype.hasOwnProperty.call(stats.ratingDistribution, key)
    ) {
      stats.ratingDistribution[key] += 1;
    }
  };

  const overallAnalyticsStats = createAnalyticsStats();
  const companyAnalyticsMap = new Map<
    number,
    ReturnType<typeof createAnalyticsStats>
  >();
  const branchAnalyticsMap = new Map<
    number,
    ReturnType<typeof createAnalyticsStats>
  >();

  for (const review of analyticsFilteredReviews) {
    const rating = Number(review.rating) || 0;

    addAnalyticsRating(overallAnalyticsStats, rating);

    let companyStats = companyAnalyticsMap.get(review.business_id);

    if (!companyStats) {
      companyStats = createAnalyticsStats();
      companyAnalyticsMap.set(review.business_id, companyStats);
    }

    addAnalyticsRating(companyStats, rating);

    if (review.branch_id !== null) {
      let branchStats = branchAnalyticsMap.get(review.branch_id);

      if (!branchStats) {
        branchStats = createAnalyticsStats();
        branchAnalyticsMap.set(review.branch_id, branchStats);
      }

      addAnalyticsRating(branchStats, rating);
    }
  }

  const analyticsCompanyRows = businesses
    .filter((business) =>
      analyticsCompanyFilter === "all"
        ? true
        : business.id === Number(analyticsCompanyFilter)
    )
    .map((business) => {
      const stats =
        companyAnalyticsMap.get(business.id) ?? createAnalyticsStats();

      const branches = analyticsBranches
        .filter((branch) => branch.business_id === business.id)
        .map((branch) => {
          const branchStats =
            branchAnalyticsMap.get(branch.id) ?? createAnalyticsStats();

          return {
            ...branch,
            review_count: branchStats.count,
            rating_distribution: branchStats.ratingDistribution,
            average_rating:
              branchStats.count > 0
                ? Math.round(
                    (branchStats.totalRating / branchStats.count) * 100
                  ) / 100
                : null,
          };
        })
        .sort((a, b) => b.review_count - a.review_count);

      return {
        business_id: business.id,
        business_name: business.name,
        review_count: stats.count,
        average_rating:
          stats.count > 0
            ? Math.round((stats.totalRating / stats.count) * 100) / 100
            : null,
        rating_distribution: stats.ratingDistribution,
        overall_review_count: analyticsFilteredReviews.filter(
          (review) =>
            review.business_id === business.id && review.branch_id === null
        ).length,
        branches,
      };
    })
    .sort((a, b) => b.review_count - a.review_count);

  const analyticsTotalReviews = overallAnalyticsStats.count;

  const analyticsAverageRating =
    overallAnalyticsStats.count > 0
      ? overallAnalyticsStats.totalRating / overallAnalyticsStats.count
      : 0;

  const analyticsRatingDistribution =
    overallAnalyticsStats.ratingDistribution;

  const analyticsRatedBranches = analyticsCompanyRows
    .flatMap((company) => company.branches)
    .filter((branch) => branch.average_rating !== null);

  const analyticsSortedBranches = analyticsCompanyRows
    .flatMap((company) => company.branches)
    .sort((a, b) => b.review_count - a.review_count);

  const analyticsTopBranch = analyticsSortedBranches.find(
    (branch) => branch.review_count > 0
  );

  const analyticsBestCompany = [...analyticsCompanyRows]
    .filter((company) => company.review_count > 0)
    .sort(
      (a, b) =>
        (b.average_rating ?? 0) - (a.average_rating ?? 0)
    )[0];

  const analyticsLowestCompany = [...analyticsCompanyRows]
    .filter((company) => company.review_count > 0)
    .sort(
      (a, b) =>
        (a.average_rating ?? 0) - (b.average_rating ?? 0)
    )[0];

  const analyticsMostReviewedCompany = [...analyticsCompanyRows]
    .filter((company) => company.review_count > 0)
    .sort((a, b) => b.review_count - a.review_count)[0];

  const trendBuckets = new Map<string, number>();
  const trendToday = new Date(`${todayNpt}T00:00:00Z`);

  const getWeekStart = (dateKey: string) => {
    const date = new Date(`${dateKey}T00:00:00Z`);
    const day = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() - ((day + 6) % 7));
    return date.toISOString().slice(0, 10);
  };

  if (analyticsTrendPeriod === "daily") {
    for (let i = 6; i >= 0; i--) {
      const key = addDaysToDateKey(todayNpt, -i);
      trendBuckets.set(key, 0);
    }
  } else if (analyticsTrendPeriod === "weekly") {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(trendToday);
      date.setUTCDate(date.getUTCDate() - i * 7);
      const key = getWeekStart(date.toISOString().slice(0, 10));
      trendBuckets.set(key, 0);
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(`${todayNpt.slice(0, 7)}-01T00:00:00Z`);
      date.setUTCMonth(date.getUTCMonth() - i);
      const key = date.toISOString().slice(0, 7);
      trendBuckets.set(key, 0);
    }
  }

  for (const review of analyticsFilteredReviews) {
    if (!review.created_at) continue;

    const dateKey = getNptDateKey(review.created_at);
    let key = dateKey;

    if (analyticsTrendPeriod === "weekly") {
      key = getWeekStart(dateKey);
    } else if (analyticsTrendPeriod === "monthly") {
      key = dateKey.slice(0, 7);
    }

    if (trendBuckets.has(key)) {
      trendBuckets.set(key, (trendBuckets.get(key) ?? 0) + 1);
    }
  }

  const analyticsTrendData = Array.from(trendBuckets.entries()).map(
    ([key, count]) => ({
      key,
      count,
      label:
        analyticsTrendPeriod === "monthly"
          ? key
          : analyticsTrendPeriod === "weekly"
            ? `Week ${key.slice(5)}`
            : key.slice(5),
    })
  );

  const analyticsTrendMax = Math.max(
    1,
    ...analyticsTrendData.map((item) => item.count)
  );
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
        {/* Main Dashboard Navigation */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {["super_admin", "admin"].includes(userRole) && (
              <button
                onClick={() => setMainTab("overview")}
                className={`rounded-xl px-4 py-4 text-sm font-bold transition ${
                  mainTab === "overview"
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Category Overview
              </button>
            )}

            {["super_admin", "admin"].includes(userRole) && (
              <button
                onClick={() => setMainTab("analytics")}
                className={`rounded-xl px-4 py-4 text-sm font-bold transition ${
                  mainTab === "analytics"
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Review Analytics
              </button>
            )}

            {["super_admin", "admin", "moderator"].includes(userRole) && (
              <button
                onClick={() => setMainTab("admin")}
                className={`rounded-xl px-4 py-4 text-sm font-bold transition ${
                  mainTab === "admin"
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Admin Management Sub-navigation */}
        {mainTab === "admin" && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {["super_admin", "admin"].includes(userRole) && (
                <button
                  onClick={() => setActiveTab("companies")}
                  className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                    activeTab === "companies"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Company Management
                </button>
              )}

              {["super_admin", "moderator"].includes(userRole) && (
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                    activeTab === "reviews"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Review Management
                </button>
              )}

              {userRole === "super_admin" && (
                <>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                      activeTab === "users"
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Admin Management
                  </button>

                  <button
                    onClick={() => setActiveTab("businessAccounts")}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                      activeTab === "businessAccounts"
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Business Management
                  </button>

                  <button
                    onClick={() => setActiveTab("categories")}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                      activeTab === "categories"
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Category Management
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* Company Dashboard */}
        {mainTab === "overview" && ["super_admin", "admin"].includes(userRole) && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Total Listed Branches</p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900">
                  {totalListedBranches}
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
                                  setMainTab("admin");
                                  setActiveTab("companies");
                                }}
                                className="mt-3 text-sm font-semibold text-green-700 hover:text-green-900"
                              >
                                View All {count} Companies â†’
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

        {/* Review Analytics */}
        {mainTab === "analytics" && ["super_admin", "admin"].includes(userRole) && (
          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Review Analytics
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Approved reviews across companies and branches. Dates use Nepal Time (NPT).
                </p>
              </div>

              <button
                onClick={() => void loadBranchAnalytics()}
                disabled={analyticsLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {analyticsLoading ? "Refreshing..." : "Refresh Analytics"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Company
                </label>
                <select
                  value={analyticsCompanyFilter}
                  onChange={(event) => setAnalyticsCompanyFilter(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black [&_option]:text-black"
                >
                  <option value="all">All Companies</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Date Range
                </label>
                <select
                  value={analyticsDatePreset}
                  onChange={(event) => setAnalyticsDatePreset(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black [&_option]:text-black"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today (NPT)</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>
            </div>

            {analyticsDatePreset === "custom" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Start Date (NPT)
                  </label>
                  <input
                    type="date"
                    value={analyticsCustomStart}
                    onChange={(event) => setAnalyticsCustomStart(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    End Date (NPT)
                  </label>
                  <input
                    type="date"
                    value={analyticsCustomEnd}
                    min={analyticsCustomStart || undefined}
                    onChange={(event) => setAnalyticsCustomEnd(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {analyticsLoading ? (
              <p className="mt-6 text-center text-gray-500">
                Loading review analytics...
              </p>
            ) : (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-blue-50 p-5">
                    <p className="text-sm text-blue-700">Approved Reviews</p>
                    <p className="mt-2 text-3xl font-extrabold text-blue-900">
                      {analyticsTotalReviews}
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-5">
                    <p className="text-sm text-green-700">Average Rating</p>
                    <p className="mt-2 text-3xl font-extrabold text-green-900">
                      {analyticsTotalReviews > 0
                        ? `${analyticsAverageRating.toFixed(2)} / 5`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-yellow-50 p-5">
                    <p className="text-sm text-yellow-700">Companies</p>
                    <p className="mt-2 text-3xl font-extrabold text-yellow-900">
                      {analyticsCompanyRows.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-purple-50 p-5">
                    <p className="text-sm text-purple-700">Active Branches</p>
                    <p className="mt-2 text-3xl font-extrabold text-purple-900">
                      {analyticsCompanyRows.reduce(
                        (total, company) => total + company.branches.length,
                        0
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-green-200 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Best Rated Company
                    </p>
                    <p className="mt-2 font-bold text-gray-900">
                      {analyticsBestCompany?.business_name ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      {analyticsBestCompany
                        ? `${analyticsBestCompany.average_rating?.toFixed(2)} / 5 · ${analyticsBestCompany.review_count} reviews`
                        : "No approved reviews"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-200 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Lowest Rated Company
                    </p>
                    <p className="mt-2 font-bold text-gray-900">
                      {analyticsLowestCompany?.business_name ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {analyticsLowestCompany
                        ? `${analyticsLowestCompany.average_rating?.toFixed(2)} / 5 · ${analyticsLowestCompany.review_count} reviews`
                        : "No approved reviews"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-200 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Most Reviewed Company
                    </p>
                    <p className="mt-2 font-bold text-gray-900">
                      {analyticsMostReviewedCompany?.business_name ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      {analyticsMostReviewedCompany
                        ? `${analyticsMostReviewedCompany.review_count} approved reviews`
                        : "No approved reviews"}
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">
                    Rating Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {["5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.5", "1.0", "0.5"].map((rating) => {
                      const count = analyticsRatingDistribution[rating] ?? 0;
                      const percent =
                        analyticsTotalReviews > 0
                          ? (count / analyticsTotalReviews) * 100
                          : 0;

                      return (
                        <div key={rating} className="rounded-lg bg-gray-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-800">{rating}★</span>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-yellow-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {percent.toFixed(1)}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      Review Trends
                    </h3>
                    <select
                      value={analyticsTrendPeriod}
                      onChange={(event) => setAnalyticsTrendPeriod(event.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="daily">Daily · Last 7 Days</option>
                      <option value="weekly">Weekly · Last 12 Weeks</option>
                      <option value="monthly">Monthly · Last 12 Months</option>
                    </select>
                  </div>

                  <div className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-2">
                    {analyticsTrendData.map((item) => (
                      <div key={item.key} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-gray-600">
                          {item.label}
                        </span>
                        <div className="h-6 flex-1 overflow-hidden rounded bg-gray-100">
                          <div
                            className="flex h-full items-center rounded bg-blue-500 px-2 text-xs font-semibold text-white"
                            style={{
                              width: `${Math.max(
                                item.count > 0 ? 3 : 0,
                                (item.count / analyticsTrendMax) * 100
                              )}%`,
                            }}
                          >
                            {item.count > 0 ? item.count : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">
                    Company-wise Review Analytics
                  </h3>

                  {analyticsCompanyRows.length === 0 ? (
                    <p className="rounded-lg bg-gray-50 p-5 text-center text-gray-500">
                      No companies found.
                    </p>
                  ) : (
                    <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
                      {analyticsCompanyRows.map((company) => {
                        const expanded = expandedAnalyticsCompanies.includes(
                          company.business_id
                        );

                        return (
                          <div
                            key={company.business_id}
                            className="overflow-hidden rounded-xl border border-gray-200"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAnalyticsCompanies((current) =>
                                  current.includes(company.business_id)
                                    ? current.filter(
                                        (id) => id !== company.business_id
                                      )
                                    : [...current, company.business_id]
                                )
                              }
                              className="flex w-full flex-wrap items-center justify-between gap-3 bg-gray-50 p-4 text-left hover:bg-gray-100"
                            >
                              <div>
                                <p className="font-bold text-gray-900">
                                  {expanded ? "▼" : "▶"} {company.business_name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {company.overall_review_count} overall business reviews · {company.branches.length} active branches
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="font-semibold text-gray-700">
                                  {company.review_count} reviews
                                </span>
                                <span className="font-bold text-yellow-700">
                                  {company.average_rating !== null
                                    ? `${company.average_rating.toFixed(2)} ★`
                                    : "No rating"}
                                </span>
                              </div>
                            </button>

                            {expanded && (
                              <div className="p-4">
                                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                  <div className="rounded-lg bg-blue-50 p-3">
                                    <p className="text-xs text-blue-700">Company Total</p>
                                    <p className="text-xl font-bold text-blue-900">
                                      {company.review_count}
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-green-50 p-3">
                                    <p className="text-xs text-green-700">Overall Reviews</p>
                                    <p className="text-xl font-bold text-green-900">
                                      {company.overall_review_count}
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-purple-50 p-3">
                                    <p className="text-xs text-purple-700">Branch Reviews</p>
                                    <p className="text-xl font-bold text-purple-900">
                                      {company.branches.reduce(
                                        (total, branch) => total + branch.review_count,
                                        0
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <h4 className="mb-2 font-semibold text-gray-800">
                                  Branch-wise Review Analytics
                                </h4>

                                {company.branches.length === 0 ? (
                                  <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                                    No active branches found.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                                      <thead>
                                        <tr className="border-b bg-gray-50 text-gray-600">
                                          <th className="px-3 py-3">Branch</th>
                                          <th className="px-3 py-3">Reviews</th>
                                          {["5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.5", "1.0", "0.5"].map((rating) => (
                                            <th key={rating} className="whitespace-nowrap px-2 py-3 text-center">
                                              {rating}★
                                            </th>
                                          ))}
                                          <th className="px-3 py-3">Average</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {company.branches.map((branch) => (
                                          <tr key={branch.id} className="border-b last:border-0">
                                            <td className="px-3 py-3 font-semibold text-gray-800">
                                              {branch.branch_name || "Unnamed Branch"}
                                            </td>
                                            <td className="px-3 py-3">{branch.review_count}</td>
                                            {["5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.5", "1.0", "0.5"].map((rating) => (
                                              <td key={rating} className="px-2 py-3 text-center">
                                                {branch.rating_distribution[rating] ?? 0}
                                              </td>
                                            ))}
                                            <td className="px-3 py-3 font-bold text-yellow-700">
                                              {branch.average_rating !== null
                                                ? `${branch.average_rating.toFixed(2)} / 5`
                                                : "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
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
        {mainTab === "admin" && activeTab === "reviews" &&
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
                            {"â˜…".repeat(review.rating)}
                            {"â˜†".repeat(5 - review.rating)}
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
                              {log.reason || "â€”"}
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
        {mainTab === "admin" && activeTab === "companies" &&
          ["super_admin", "admin"].includes(userRole) && (
            <section className="mt-6 grid items-start gap-6 lg:grid-cols-5">
              <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
                
<h2 className="text-xl font-bold text-gray-900">
  {isBookCategory
    ? editingId !== null ? "Edit Book" : "Add New Book"
    : isMovieCategory
      ? editingId !== null ? "Edit Movie" : "Add New Movie"
      : editingId !== null ? "Edit Company" : "Add New Company"}
</h2>

<form onSubmit={saveCompany} className="mt-5 space-y-4">
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
      {isBookCategory ? "Book Title *" : isMovieCategory ? "Movie Title *" : "Company Name *"}
    </label>
    <input
      value={companyName}
      onChange={(e) => setCompanyName(e.target.value)}
      required
      placeholder={isBookCategory ? "Enter book title" : isMovieCategory ? "Enter movie title" : "Enter company name"}
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
    />
  </div>

  {!isCatalogCategory && (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        Business Type *
      </label>
      <select
        value={isMultiBranch ? "multi" : "single"}
        onChange={(e) => setIsMultiBranch(e.target.value === "multi")}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
      >
        <option value="single">Single Location</option>
        <option value="multi">Multiple Locations</option>
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Enter location details here. Save the company first, then add the location.
      </p>
    </div>
  )}

  {!isCatalogCategory && isMultiBranch && (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5 sm:col-span-2">
      <h3 className="text-lg font-bold text-gray-900">
        Location Management
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Add and manage individual locations for this company.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Location Name *
          </label>
          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Kathmandu Main Office"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Province (Optional)
          </label>
          <input
            value={locationProvince}
            onChange={(e) => setLocationProvince(e.target.value)}
            placeholder="Enter province"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            District (Optional)
          </label>
          <input
            value={locationDistrict}
            onChange={(e) => setLocationDistrict(e.target.value)}
            placeholder="Enter district"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Municipality (Optional)
          </label>
          <input
            value={locationMunicipality}
            onChange={(e) => setLocationMunicipality(e.target.value)}
            placeholder="Enter municipality"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Full Address (Optional)
          </label>
          <input
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Enter complete location address"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Contact Number (Optional)
          </label>
          <input
            type="tel"
            value={locationPhone}
            onChange={(e) => setLocationPhone(e.target.value)}
            placeholder="Enter contact number"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Email (Optional)
          </label>
          <input
            type="email"
            value={locationEmail}
            onChange={(e) => setLocationEmail(e.target.value)}
            placeholder="Enter location email"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={locationSaving || editingId === null}
          onClick={() => void saveBusinessLocation()}
          className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {locationSaving
            ? "Saving Location..."
            : editingLocationId !== null
            ? "Update Location"
            : editingId === null ? "Save Company First" : "Add Location"}
        </button>

        {editingLocationId !== null && (
          <button
            type="button"
            onClick={resetLocationForm}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700"
          >
            Cancel Location Edit
          </button>
        )}
      </div>

      <div className="mt-6 border-t border-green-200 pt-5">
        <h4 className="font-bold text-gray-900">
          Saved Locations ({locations.length})
        </h4>

        {locations.length === 0 ? (
          <p className="mt-3 rounded-lg bg-white p-4 text-sm text-gray-500">
            No locations added yet.
          </p>
        ) : (
          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-2">
            {locations.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">
                      {item.branch_name || item.municipality || "Business Location"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {[item.municipality, item.district, item.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {item.address}
                    </p>
                    {item.phone && (
                      <p className="mt-1 text-sm text-gray-600">
                        Phone: {item.phone}
                      </p>
                    )}
                    {item.email && (
                      <p className="mt-1 text-sm text-gray-600">
                        Email: {item.email}
                      </p>
                    )}
                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        item.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editBusinessLocation(item)}
                      className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleBusinessLocation(item)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                        item.is_active
                          ? "border-red-200 text-red-700 hover:bg-red-50"
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {item.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      Description
    </label>
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={3}
      placeholder="Enter description..."
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
    />
  </div>

  {isBookCategory && (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Author *
        </label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          placeholder="Enter author name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Publisher
        </label>
        <input
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          placeholder="Enter publisher"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          ISBN
        </label>
        <input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="Enter ISBN"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Publication Year
        </label>
        <input
          type="number"
          value={publicationYear}
          onChange={(e) => setPublicationYear(e.target.value)}
          placeholder="e.g. 2025"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>
    </>
  )}

  {isMovieCategory && (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Director
        </label>
        <input
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          placeholder="Enter director name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Cast
        </label>
        <textarea
          value={castMembers}
          onChange={(e) => setCastMembers(e.target.value)}
          rows={2}
          placeholder="Enter cast members"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Release Year
        </label>
        <input
          type="number"
          value={releaseYear}
          onChange={(e) => setReleaseYear(e.target.value)}
          placeholder="e.g. 2026"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Duration
        </label>
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 2h 15m"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Production Company
        </label>
        <input
          value={productionCompany}
          onChange={(e) => setProductionCompany(e.target.value)}
          placeholder="Enter production company"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>
    </>
  )}

  {isCatalogCategory && (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Genre
        </label>
        <input
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="e.g. Fiction, Drama, Action"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Language
        </label>
        <input
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="e.g. Nepali, English"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          {isBookCategory ? "Book Cover Image" : "Movie Poster"}
        </label>
        <input
          key={catalogImagePreview || "catalog-image"}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCatalogImageChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
        <p className="mt-1 text-xs text-gray-500">
          JPG, PNG or WEBP. Maximum file size: 2 MB.
        </p>
        {catalogImagePreview && (
          <img
            src={catalogImagePreview}
            alt="Catalog image preview"
            className="mt-3 h-40 rounded-lg border object-contain"
          />
        )}
      </div>
    </>
  )}

  {!isCatalogCategory && (
    <>
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
          placeholder="info@example.com"
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
          placeholder="+977-1-1234567"
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

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Facebook Page URL (Optional)
        </label>
        <input
          type="url"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
          placeholder="https://www.facebook.com/yourpage"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Instagram Page URL (Optional)
        </label>
        <input
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/yourpage"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          TikTok Profile URL (Optional)
        </label>
        <input
          type="url"
          value={tiktokUrl}
          onChange={(e) => setTiktokUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@yourprofile"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          YouTube Channel URL (Optional)
        </label>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/@yourchannel"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
        />
      </div>
    </>
  )}

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
                          {company.location ? ` â€¢ ${company.location}` : ""}
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
        {mainTab === "admin" && activeTab === "users" && userRole === "super_admin" && (
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

        {/* Business Account Management */}
        {mainTab === "admin" && activeTab === "businessAccounts" && userRole === "super_admin" && (
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Create Business Account Invitation
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Create a secure invitation link for a business representative.
              The invitation expires after 7 days.
            </p>

            <form onSubmit={createBusinessInvitation} className="mt-6 max-w-2xl space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Select Business
                </label>
                <select
                  value={inviteBusinessId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setInviteBusinessId(value);
                    setInvitationUrl("");
                    void loadInvitationBranches(Number(value));
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black"
                >
                  <option value="">Choose a business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="company@example.com"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Business Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(event) => {
                    const value = event.target.value as
                      | "owner"
                      | "branch_manager"
                      | "review_responder";
                    setInviteRole(value);
                    if (value === "owner") {
                      setSelectedInvitationBranches([]);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black"
                >
                  <option value="owner">Business Owner</option>
                  <option value="branch_manager">Branch Manager</option>
                  <option value="review_responder">Review Responder</option>
                </select>
              </div>

              {inviteRole !== "owner" && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-black">
                    Assign Active Branches
                  </label>

                  {!inviteBusinessId ? (
                    <p className="text-sm text-gray-500">
                      Select a business first.
                    </p>
                  ) : invitationBranches.length === 0 ? (
                    <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                      No active branches found for this business.
                    </p>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                      {invitationBranches.map((branch) => (
                        <label
                          key={branch.id}
                          className="flex cursor-pointer items-center gap-3 text-sm font-medium text-black"
                        >
                          <input
                            type="checkbox"
                            checked={selectedInvitationBranches.includes(branch.id)}
                            onChange={(event) => {
                              setSelectedInvitationBranches((current) =>
                                event.target.checked
                                  ? [...current, branch.id]
                                  : current.filter((id) => id !== branch.id)
                              );
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span>
                            {branch.branch_name || branch.address || `Branch #${branch.id}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={invitationLoading}
                className="rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {invitationLoading ? "Creating Invitation..." : "Create Invitation"}
              </button>
            </form>

            {invitationUrl && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="mb-2 text-sm font-semibold text-green-800">
                  Invitation Link Created
                </p>
                <input
                  type="text"
                  readOnly
                  value={invitationUrl}
                  className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-black"
                />
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(invitationUrl)
                      .then(() => setMessage("Invitation link copied successfully."))
                      .catch(() => setError("Unable to copy link. Please copy it manually."));
                  }}
                  className="mt-3 rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Copy Invitation Link
                </button>
                <p className="mt-2 text-xs text-gray-600">
                  Email sending is not enabled yet. Share this link securely with the invited person.
                </p>
              </div>
            )}
          </section>
        )}
        {/* Category Management */}
        {mainTab === "admin" && activeTab === "categories" && userRole === "super_admin" && (
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
