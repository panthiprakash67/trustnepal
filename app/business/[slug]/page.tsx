
"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Business = {
  id: number;
  name: string;
  slug: string;
  is_multi_branch: boolean;
  category_id: number;
  description: string | null;
  location: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
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
  categoryName: string;
};

function getSafeSocialUrl(
  value: string | null,
  platform: "facebook" | "instagram" | "tiktok" | "youtube"
): string | null {
  if (!value) return null;

  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname.toLowerCase();

    const allowedDomains =
      platform === "facebook"
        ? ["facebook.com", "fb.com"]
        : platform === "instagram"
          ? ["instagram.com"]
          : platform === "tiktok"
            ? ["tiktok.com"]
            : ["youtube.com", "youtu.be"];

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      !allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      )
    ) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}
type BusinessLocation = {
  id: number;
  branch_name: string | null;
};

type Review = {
  id: number;
  user_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  created_at: string;
  branch_id: number | null;
  business_branches: { branch_name: string | null } | null;
  full_name: string | null;
  avatar_url: string | null;
};

type Reply = {
  id: number;
  review_id: number;
  user_id: string;
  parent_reply_id: number | null;
  reply_text: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ReplyTarget = {
  reviewId: number;
  parentReplyId: number | null;
};

type ReviewDraft = {
  slug: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  selectedBranchId?: number | null;
};

type ReplyListProps = {
  reviewId: number;
  parentReplyId: number | null;
  replies: Reply[];
  userId: string | null;
  activeTarget: ReplyTarget | null;
  replyDraft: string;
  submittingReply: boolean;
  onReplyClick: (reviewId: number, parentReplyId: number | null) => void;
  onDraftChange: (value: string) => void;
  onSubmit: (reviewId: number, parentReplyId: number | null) => void;
};

function ReplyList({
  reviewId,
  parentReplyId,
  replies,
  userId,
  activeTarget,
  replyDraft,
  submittingReply,
  onReplyClick,
  onDraftChange,
  onSubmit,
}: ReplyListProps) {
  const childReplies = replies.filter(
    (reply) => reply.parent_reply_id === parentReplyId
  );

  if (childReplies.length === 0) return null;

  return (
    <div className={parentReplyId === null ? "mt-4 space-y-4" : "mt-4 ml-5 space-y-4 border-l-2 border-gray-200 pl-4"}>
      {childReplies.map((reply) => {
        const isActive =
          activeTarget?.reviewId === reviewId &&
          activeTarget?.parentReplyId === reply.id;

        return (
          <article key={reply.id} className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              {reply.avatar_url ? (
                <img
                  src={reply.avatar_url}
                  alt={reply.full_name || "User"}
                  className="h-9 w-9 rounded-full border object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                  {reply.full_name?.trim()
                    ? reply.full_name.trim().charAt(0).toUpperCase()
                    : "👤"}
                </div>
              )}

              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {reply.full_name || "TrustNepal Member"}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(reply.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-gray-700">
              {reply.reply_text}
            </p>

            <button
              type="button"
              onClick={() => onReplyClick(reviewId, reply.id)}
              className="mt-3 text-sm font-semibold text-green-700 hover:underline"
            >
              ↳ Reply
            </button>

            {isActive && (
              <div className="mt-3 space-y-3">
                {userId ? (
                  <>
                    <textarea
                      value={replyDraft}
                      onChange={(e) => onDraftChange(e.target.value)}
                      maxLength={3000}
                      rows={3}
                      placeholder="Write your reply in Nepali or English..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={submittingReply || !replyDraft.trim()}
                        onClick={() => onSubmit(reviewId, reply.id)}
                        className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                      >
                        {submittingReply ? "Sending..." : "Send Reply"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onReplyClick(reviewId, null)}
                        className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg bg-white p-4 text-sm text-gray-700">
                    Please login to reply.
                    <Link
                      href="/auth"
                      className="ml-2 font-semibold text-green-700 hover:underline"
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            )}

            <ReplyList
              reviewId={reviewId}
              parentReplyId={reply.id}
              replies={replies}
              userId={userId}
              activeTarget={activeTarget}
              replyDraft={replyDraft}
              submittingReply={submittingReply}
              onReplyClick={onReplyClick}
              onDraftChange={onDraftChange}
              onSubmit={onSubmit}
            />
          </article>
        );
      })}
    </div>
  );
}

export default function BusinessProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-lg font-medium text-gray-600">
            Loading business profile...
          </p>
        </main>
      }
    >
      <BusinessProfileContent />
    </Suspense>
  );
}

function BusinessProfileContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [business, setBusiness] = useState<Business | null>(null);
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewTitleManuallyEdited, setReviewTitleManuallyEdited] = useState(false);
  const [contactInfoElement, setContactInfoElement] = useState<HTMLDivElement | null>(null);
  const [contactInfoHeight, setContactInfoHeight] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const reviewDraftKey = `trustnepal_review_draft:${slug}`;
  const autoSubmitStarted = useRef(false);

  function getAutoReviewTitle(value: number): string {
    if (value <= 2) return "Below Average – Needs Improvement";
    if (value <= 3) return "Average";
    if (value === 3.5) return "Good";
    if (value === 4) return "Very Good";
    if (value === 4.5) return "Excellent";
    return "Outstanding";
  }

  useEffect(() => {
    const element = contactInfoElement;
    if (!element) {
      setContactInfoHeight(null);
      return;
    }

    const updateHeight = () => {
      const height = element.getBoundingClientRect().height;

setContactInfoHeight(height);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [contactInfoElement]);

  useEffect(() => {
    if (authLoading || !userId || !business) return;
    if (autoSubmitStarted.current) return;

    autoSubmitStarted.current = true;

    try {
      const savedDraft = localStorage.getItem(reviewDraftKey);
      if (!savedDraft) return;

      const draft = JSON.parse(savedDraft) as ReviewDraft;

      if (
        draft.slug !== slug ||
        !draft.reviewTitle ||
        !draft.reviewText ||
        draft.rating < 1 ||
        draft.rating > 5
      ) {
        return;
      }

      queueMicrotask(() => {
        setRating(draft.rating);
        setReviewTitle(draft.reviewTitle);
        setReviewTitleManuallyEdited(true);
        setReviewText(draft.reviewText);
        setSelectedBranchId(draft.selectedBranchId ?? null);
        setSubmitMessage(
          "Your saved review has been restored. Please submit it below."
        );
      });
    } catch {
      queueMicrotask(() => {
        setSubmitError("Unable to restore your saved review.");
      });
    }
  }, [authLoading, userId, business, reviewDraftKey, slug]);

  function saveReviewDraft(): boolean {
    if (!reviewTitle.trim() || !reviewText.trim()) {
      setSubmitError("Please fill in both the title and review.");
      return false;
    }

    const draft: ReviewDraft = {
      slug,
      rating,
      reviewTitle: reviewTitle.trim(),
      reviewText: reviewText.trim(),
      selectedBranchId,
    };

    try {
      localStorage.setItem(reviewDraftKey, JSON.stringify(draft));
      return true;
    } catch {
      setSubmitError("Unable to save your review. Please try again.");
      return false;
    }
  }

  const [activeReplyTarget, setActiveReplyTarget] =
    useState<ReplyTarget | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUserId(session?.user.id ?? null);
      setAuthLoading(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const REVIEWS_PAGE_SIZE = 10;

  async function loadReviews(businessId: number) {
    const { data: statsData, error: statsError } = await (supabase as any)
      .rpc("get_business_review_stats", {
        p_business_id: businessId,
      });

    if (statsError) throw statsError;

    const stats = statsData?.[0];
    setTotalReviews(Number(stats?.total_reviews ?? 0));
    setAverageRating(Number(stats?.average_rating ?? 0));

    const { data, error } = await supabase
      .from("reviews")
      .select("id, user_id, rating, title, review_text, created_at, branch_id")
      .eq("business_id", businessId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(0, REVIEWS_PAGE_SIZE - 1);

    if (error) throw error;

    const reviewRows = data ?? [];

    if (reviewRows.length === 0) {
      setReviews([]);
      await loadReplies([]);
      return;
    }

    const branchIds = [...new Set(reviewRows.map((review) => review.branch_id).filter((id): id is number => id !== null))];
    const branchMap = new Map<number, { branch_name: string | null }>();

    if (branchIds.length > 0) {
      const { data: branchData, error: branchError } = await supabase
        .from("business_branches")
        .select("id, branch_name")
        .in("id", branchIds);

      if (branchError) throw branchError;
      (branchData ?? []).forEach((branch) => {
        branchMap.set(branch.id, { branch_name: branch.branch_name });
      });
    }

    const reviewUserIds = [
      ...new Set(reviewRows.map((review) => review.user_id)),
    ];

    const { data: profileData, error: profileError } = await supabase
      .from("public_profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", reviewUserIds);

    if (profileError) throw profileError;

    const profileMap = new Map(
      (profileData ?? []).map((profile) => [
        profile.user_id,
        {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        },
      ])
    );

    const reviewsWithProfiles: Review[] = reviewRows.map((review) => {
      const profile = profileMap.get(review.user_id);
      return {
        ...review,
        business_branches: review.branch_id ? branchMap.get(review.branch_id) ?? null : null,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      };
    });

    setReviews(reviewsWithProfiles);
    await loadReplies(reviewRows.map((review) => review.id));
  }

  async function loadReplies(reviewIds: number[], append = false) {
    if (reviewIds.length === 0) {
      if (!append) setReplies([]);
      return;
    }

    const { data, error } = await supabase
      .from("review_replies")
      .select("id, review_id, user_id, parent_reply_id, reply_text, created_at")
      .in("review_id", reviewIds)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const replyRows = data ?? [];

    if (replyRows.length === 0) {
      if (!append) setReplies([]);
      return;
    }

    const replyUserIds = [
      ...new Set(replyRows.map((reply) => reply.user_id)),
    ];

    const { data: profileData, error: profileError } = await supabase
      .from("public_profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", replyUserIds);

    if (profileError) throw profileError;

    const profileMap = new Map(
      (profileData ?? []).map((profile) => [
        profile.user_id,
        {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        },
      ])
    );

    const repliesWithProfiles: Reply[] = replyRows.map((reply) => {
      const profile = profileMap.get(reply.user_id);
      return {
        ...reply,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      };
    });

    setReplies((current) =>
      append
        ? [
            ...current.filter(
              (existing) => !reviewIds.includes(existing.review_id)
            ),
            ...repliesWithProfiles,
          ]
        : repliesWithProfiles
    );
  }

  async function loadMoreReviews() {
    if (!business || loadingMoreReviews || reviews.length >= totalReviews) {
      return;
    }

    setLoadingMoreReviews(true);
    setLoadMoreError("");

    try {
      const offset = reviews.length;

      const { data, error } = await supabase
        .from("reviews")
        .select("id, user_id, rating, title, review_text, created_at, branch_id")
        .eq("business_id", business.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + REVIEWS_PAGE_SIZE - 1);

      if (error) throw error;

      const reviewRows = data ?? [];
      if (reviewRows.length === 0) return;

      const branchIds = [...new Set(reviewRows.map((review) => review.branch_id).filter((id): id is number => id !== null))];
      const branchMap = new Map<number, { branch_name: string | null }>();

      if (branchIds.length > 0) {
        const { data: branchData, error: branchError } = await supabase
          .from("business_branches")
          .select("id, branch_name")
          .in("id", branchIds);

        if (branchError) throw branchError;
        (branchData ?? []).forEach((branch) => {
          branchMap.set(branch.id, { branch_name: branch.branch_name });
        });
      }

      const reviewUserIds = [
        ...new Set(reviewRows.map((review) => review.user_id)),
      ];

      const { data: profileData, error: profileError } = await supabase
        .from("public_profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", reviewUserIds);

      if (profileError) throw profileError;

      const profileMap = new Map(
        (profileData ?? []).map((profile) => [
          profile.user_id,
          {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          },
        ])
      );

      const reviewsWithProfiles: Review[] = reviewRows.map((review) => {
        const profile = profileMap.get(review.user_id);
        return {
          ...review,
          business_branches: review.branch_id ? branchMap.get(review.branch_id) ?? null : null,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
        };
      });

      setReviews((current) => [...current, ...reviewsWithProfiles]);
      await loadReplies(
        reviewRows.map((review) => review.id),
        true
      );
    } catch (err) {
      setLoadMoreError(
        err instanceof Error ? err.message : "Unable to load more reviews."
      );
    } finally {
      setLoadingMoreReviews(false);
    }
  }
  useEffect(() => {
    async function loadBusiness() {
      setLoading(true);
      setError("");

      try {
        const { data: businessData, error: businessError } =
          await supabase
            .from("businesses")
            .select(
              "id, name, slug, category_id, description, location, website, facebook_url, instagram_url, tiktok_url, youtube_url, email, phone, author, publisher, genre, language, publication_year, isbn, director, cast_members, release_year, duration, production_company, image_url, is_multi_branch, latitude, longitude, google_maps_url"
            )
            .eq("slug", slug)
            .maybeSingle();

        if (businessError) throw businessError;

        if (!businessData) {
          setBusiness(null);
          setError("This business could not be found.");
          return;
        }

        const { data: categoryData } = await supabase
          .from("categories")
          .select("name")
          .eq("id", businessData.category_id)
          .maybeSingle();

        setBusiness({
          ...businessData,
          categoryName: categoryData?.name ?? "Other",
        });

        const { data: locationData, error: locationError } = await (supabase as any)
          .from("business_branches")
          .select("id, branch_name")
          .eq("business_id", businessData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (locationError) throw locationError;
        setBusinessLocations(locationData ?? []);

        await loadReviews(businessData.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load business information."
        );
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadBusiness();
    }
  }, [slug]);

  async function handleReviewSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSubmitMessage("");
    setSubmitError("");

    if (!business) {
      setSubmitError("Business information is not available.");
      return;
    }

    if (!reviewTitle.trim() || !reviewText.trim()) {
      setSubmitError("Please fill in both the title and review.");
      return;
    }

    if (!userId) {
      if (!saveReviewDraft()) return;

      window.location.href = `/auth?next=${encodeURIComponent(
        `/business/${slug}`
      )}`;
      return;
    }

    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          business_id: business.id,
          user_id: userId,
          rating,
          title: reviewTitle.trim(),
          review_text: reviewText.trim(),
          branch_id: business.is_multi_branch ? selectedBranchId : null,
        });

      if (insertError) throw insertError;

      localStorage.removeItem(reviewDraftKey);

      await loadReviews(business.id);

      setRating(5);
      setReviewTitle("");
      setReviewTitleManuallyEdited(false);
      setReviewText("");
      setSelectedBranchId(null);

      setSubmitMessage(
        "Your review has been submitted and is awaiting moderation. It will appear publicly after approval."
      );
    } catch (err) {
      console.error("Review submission failed:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to submit your review. Please try again.";

      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  function openReplyForm(reviewId: number, parentReplyId: number | null) {
    setReplyError("");
    setReplyMessage("");

    if (
      activeReplyTarget?.reviewId === reviewId &&
      activeReplyTarget?.parentReplyId === parentReplyId
    ) {
      setActiveReplyTarget(null);
      setReplyDraft("");
      return;
    }

    setActiveReplyTarget({ reviewId, parentReplyId });
    setReplyDraft("");
  }

  async function handleReplySubmit(
    reviewId: number,
    parentReplyId: number | null
  ) {
    setReplyError("");
    setReplyMessage("");

    if (!userId) {
      setReplyError("Please login before replying.");
      return;
    }

    if (!replyDraft.trim()) {
      setReplyError("Please write a reply first.");
      return;
    }

    if (replyDraft.trim().length > 3000) {
      setReplyError("Your reply cannot exceed 3000 characters.");
      return;
    }

    setSubmittingReply(true);

    try {
      const { error: insertError } = await supabase
        .from("review_replies")
        .insert({
          review_id: reviewId,
          user_id: userId,
          parent_reply_id: parentReplyId,
          reply_text: replyDraft.trim(),
        });

      if (insertError) throw insertError;

      const approvedReviewIds = reviews.map((review) => review.id);
      await loadReplies(approvedReviewIds);

      setReplyDraft("");
      setActiveReplyTarget(null);
      setReplyMessage("Your reply has been posted successfully.");
    } catch (err) {
      setReplyError(
        err instanceof Error
          ? err.message
          : "Unable to post your reply. Please try again."
      );
    } finally {
      setSubmittingReply(false);
    }
  }

if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600">
          Loading business profile...
        </p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Business not found
        </h1>
        <p className="mt-3 text-gray-600">
          {error || "This business is not available."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white"
        >
          Back to Homepage
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-extrabold text-green-700">
            TrustNepal
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-green-700"
          >
            ← Back to Homepage
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <span className="inline-block rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            {business.categoryName}
          </span>

          <h1 className="mt-5 text-3xl font-extrabold text-gray-900 md:text-4xl">
            {business.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Average Rating
              </span>
              {totalReviews > 0 ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const fill = Math.max(0, Math.min(100, (averageRating - star + 1) * 100));
                      const starColor =
                        averageRating >= 4.5 ? "#00A878" :
                        averageRating >= 3.5 ? "#73B85A" :
                        averageRating >= 2.5 ? "#E8B43A" :
                        averageRating >= 1.5 ? "#E98236" :
                        "#D94B4B";

                      return (
                        <span key={star} className="relative flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-[2px] bg-gray-200">
                          <span className="absolute inset-0 flex items-center justify-center text-base text-white">
                            {String.fromCodePoint(0x2605)}
                          </span>
                          <span className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden" style={{ width: `${fill}%`, backgroundColor: starColor }}>
                            <span className="flex h-full w-[22px] shrink-0 items-center justify-center text-base text-white">
                              {String.fromCodePoint(0x2605)}
                            </span>
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-500">—</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Total Reviews
              </span>
              <span className="text-lg font-bold text-gray-900">
                {totalReviews}
              </span>
            </div>
          </div>

          {(business.categoryName === "Books" || business.categoryName === "Movies") && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
                {business.image_url && (
                  <div className="flex justify-center">
                    <img
                      src={business.image_url}
                      alt={business.categoryName === "Books" ? `${business.name} book cover` : `${business.name} movie poster`}
                      className="max-h-[340px] w-full max-w-[220px] rounded-lg object-contain shadow-sm"
                    />
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {business.categoryName === "Books" ? "Book Details" : "Movie Details"}
                  </h2>

                  <div className="mt-4 space-y-3 text-gray-700">
                    {business.categoryName === "Books" ? (
                      <>
                        {business.author && <p><span className="font-semibold">Author: </span>{business.author}</p>}
                        {business.publisher && <p><span className="font-semibold">Publisher: </span>{business.publisher}</p>}
                        {business.isbn && <p><span className="font-semibold">ISBN: </span>{business.isbn}</p>}
                        {business.publication_year && <p><span className="font-semibold">Publication Year: </span>{business.publication_year}</p>}
                      </>
                    ) : (
                      <>
                        {business.director && <p><span className="font-semibold">Director: </span>{business.director}</p>}
                        {business.cast_members && <p><span className="font-semibold">Cast: </span>{business.cast_members}</p>}
                        {business.release_year && <p><span className="font-semibold">Release Year: </span>{business.release_year}</p>}
                        {business.duration && <p><span className="font-semibold">Duration: </span>{business.duration}</p>}
                        {business.production_company && <p><span className="font-semibold">Production Company: </span>{business.production_company}</p>}
                      </>
                    )}

                    {business.genre && <p><span className="font-semibold">Genre: </span>{business.genre}</p>}
                    {business.language && <p><span className="font-semibold">Language: </span>{business.language}</p>}
                  </div>
                </div>
              </div>

              {business.description && (
                <div className="mt-6 border-t border-gray-200 pt-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {business.categoryName === "Books" ? "About This Book" : "About This Movie"}
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-600">
                    {business.description}
                  </p>
                </div>
              )}
            </div>
          )}
          {business.categoryName !== "Books" && business.categoryName !== "Movies" && business.location && (
            <p className="mt-3 text-gray-600">
              📍 {business.location}
            </p>
          )}

          {business.categoryName !== "Books" && business.categoryName !== "Movies" && (business.description ||
            business.email ||
            business.phone ||
            business.website ||
            business.facebook_url ||
            business.instagram_url || business.tiktok_url || business.youtube_url || (business.google_maps_url || (business.latitude !== null && business.longitude !== null))) && (
            <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-2">
              {(business.email || business.phone || business.website ||
                business.facebook_url || business.instagram_url || business.tiktok_url || business.youtube_url || (business.google_maps_url || (business.latitude !== null && business.longitude !== null))) && (
                <div ref={setContactInfoElement} className="h-fit self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Contact Information
                  </h2>

                  <div className="mt-3 space-y-3">
                    {business.phone && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Phone: </span>
                        <a
                          href={`tel:${business.phone.replace(/[^+\d]/g, "")}`}
                          className="font-medium text-green-700 hover:underline"
                        >
                          {business.phone}
                        </a>
                      </p>
                    )}
                    {business.email && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Email: </span>
                        <a
                          href={`mailto:${business.email}`}
                          className="font-medium text-green-700 hover:underline"
                        >
                          {business.email}
                        </a>
                      </p>
                    )}
                    {business.website && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Website: </span>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 hover:underline"
                        >
                          Visit Official Website
                        </a>
                      </p>
                    )}

                    {getSafeSocialUrl(business.facebook_url, "facebook") && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Facebook: </span>
                        <a
                          href={getSafeSocialUrl(business.facebook_url, "facebook")!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 hover:underline"
                        >
                          Visit Facebook Page
                        </a>
                      </p>
                    )}
                    {getSafeSocialUrl(business.instagram_url, "instagram") && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Instagram: </span>
                        <a
                          href={getSafeSocialUrl(business.instagram_url, "instagram")!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 hover:underline"
                        >
                          Visit Instagram Page
                        </a>
                      </p>
                    )}

                    {getSafeSocialUrl(business.tiktok_url, "tiktok") && (
                      <p className="text-gray-700">
                        <span className="font-semibold">TikTok: </span>
                        <a
                          href={getSafeSocialUrl(business.tiktok_url, "tiktok")!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 hover:underline"
                        >
                          Visit TikTok Profile
                        </a>
                      </p>
                    )}

                    {getSafeSocialUrl(business.youtube_url, "youtube") && (
                      <p className="text-gray-700">
                        <span className="font-semibold">YouTube: </span>
                        <a
                          href={getSafeSocialUrl(business.youtube_url, "youtube")!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 hover:underline"
                        >
                          Visit YouTube Channel
                        </a>
                      </p>
                    )}


                    {(business.google_maps_url || (business.latitude !== null && business.longitude !== null)) && (
                      <p className="text-gray-700">
                        <a
                          href={business.google_maps_url || `https://www.google.com/maps?q=${business.latitude},${business.longitude}&z=19`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 hover:underline"
                        >
                          Get Directions on Google Maps ↗
                        </a>
                      </p>
                    )}
</div>
                </div>
              )}

              {business.description && (
                <div
                  className="flex h-[var(--contact-info-height)] min-h-0 flex-col rounded-xl border border-gray-200 bg-gray-50 p-5"
                  style={{
                    "--contact-info-height": contactInfoHeight
                      ? `${contactInfoHeight}px`
                      : "auto",
                  } as React.CSSProperties}
                >
                  <h2 className="shrink-0 text-lg font-bold text-gray-900">
                    Company Description
                  </h2>
                  <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-2">
                    <p className="whitespace-pre-wrap leading-7 text-gray-600">
                      {business.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Write a Review
          </h2>

          <p className="mt-2 text-gray-500">
            Share your honest experience with {business.name}.
          </p>

          {authLoading ? (
            <p className="mt-6 text-gray-500">
              Checking your login status...
            </p>
          ) : (
            <form
              onSubmit={handleReviewSubmit}
              className="mt-6 space-y-5"
            >
              {business.is_multi_branch && businessLocations.length > 0 && (
                <div>
                  <label
                    htmlFor="reviewLocation"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Reviewing Experience At
                  </label>
                  <select
                    id="reviewLocation"
                    value={selectedBranchId === null ? "" : String(selectedBranchId)}
                    onChange={(e) =>
                      setSelectedBranchId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Overall Business</option>
                    {businessLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.branch_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Your Rating
                </label>

                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const clickedHalf = event.clientX - rect.left < rect.width / 2;
                        const nextRating = star - (clickedHalf ? 0.5 : 0);
                        setRating(nextRating);

                        if (!reviewTitleManuallyEdited) {
                          setReviewTitle(getAutoReviewTitle(nextRating));
                        }
                      }}
                      aria-label={`Rate ${star - 0.5} or ${star} out of 5 stars`}
                      className="relative h-9 w-9 overflow-hidden rounded-sm bg-gray-300 transition hover:scale-110"
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xl text-white">
                        {String.fromCodePoint(0x2605)}
                      </span>
                      <span
                        className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden text-xl text-white"
                        style={{
                          width:
                            rating >= star
                              ? "100%"
                              : rating >= star - 0.5
                                ? "50%"
                                : "0%",
                          backgroundColor:
                            rating >= 4.5 ? "#00A878" :
                            rating >= 3.5 ? "#73B85A" :
                            rating >= 2.5 ? "#E8B43A" :
                            rating >= 1.5 ? "#E98236" :
                            "#D94B4B",
                        }}
                      >
                        <span className="absolute left-0 flex h-full w-9 items-center justify-center">
                          {String.fromCodePoint(0x2605)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {rating.toFixed(1)} out of 5 stars
                </p>
              </div>

              <div>
                <label
                  htmlFor="reviewTitle"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Review Title
                </label>

                <input
                  id="reviewTitle"
                  type="text"
                  required
                  maxLength={150}
                  value={reviewTitle}
                  onChange={(e) => {
                    setReviewTitle(e.target.value);
                    setReviewTitleManuallyEdited(true);
                  }}
                  placeholder="Select your rating to generate a review title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label
                  htmlFor="reviewText"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Your Review
                </label>

                <textarea
                  id="reviewText"
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell others about your experience..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                />
              </div>

              {submitError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              {submitMessage && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {submitMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-green-700 px-7 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Customer Reviews
            </h2>
            <span className="text-sm text-gray-500">
              {totalReviews} reviews
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <div className="text-4xl">⭐</div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                No approved reviews yet
              </h3>
              <p className="mt-2 text-gray-500">
                Be the first person to share an experience with this business.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isReviewReplyActive =
                  activeReplyTarget?.reviewId === review.id &&
                  activeReplyTarget?.parentReplyId === null;

                return (
                  <article
                    key={review.id}
                    className="rounded-xl border border-gray-200 bg-white p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {review.avatar_url ? (
                          <img
                            src={review.avatar_url}
                            alt={review.full_name || "Reviewer"}
                            className="h-12 w-12 rounded-full border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
                            {review.full_name?.trim()
                              ? review.full_name.trim().charAt(0).toUpperCase()
                              : "👤"}
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-gray-900">
                            {review.full_name || "TrustNepal Member"}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {review.title || "Customer Review"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      const fill = Math.max(0, Math.min(100, (review.rating - star + 1) * 100));
      const starColor =
        review.rating >= 4.5 ? "#00A878" :
        review.rating >= 3.5 ? "#73B85A" :
        review.rating >= 2.5 ? "#E8B43A" :
        review.rating >= 1.5 ? "#E98236" :
        "#D94B4B";

      return (
        <span key={star} className="relative flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-[2px] bg-gray-200">
          <span className="absolute inset-0 flex items-center justify-center text-base text-white">
            {String.fromCodePoint(0x2605)}
          </span>
          <span className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden" style={{ width: `${fill}%`, backgroundColor: starColor }}>
            <span className="flex h-full w-[22px] shrink-0 items-center justify-center text-base text-white">
              {String.fromCodePoint(0x2605)}
            </span>
          </span>
        </span>
      );
    })}
  </div>
  <span className="text-lg font-bold text-gray-900">
    {Number.isInteger(review.rating) ? review.rating : review.rating.toFixed(1)}
  </span>
</div>
                    </div>

                    {review.review_text && (
                      <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-gray-600">
                        {review.review_text}
                      </p>
                    )}

                                        <p className="mt-3 text-xs font-medium text-gray-500">
                      {review.branch_id
                        ? `Review for ${review.business_branches?.branch_name ?? "Selected Location"}`
                        : "Overall Business Review"}
                    </p>
<p className="mt-4 text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>

                    <button
                      type="button"
                      onClick={() => openReplyForm(review.id, null)}
                      className="mt-3 text-sm font-semibold text-green-700 hover:underline"
                    >
                      <span aria-hidden="true">↳ </span>Reply
                    </button>

                    {isReviewReplyActive && (
                      <div className="mt-4 space-y-3">
                        {authLoading ? (
                          <p className="text-sm text-gray-500">
                            Checking your login status...
                          </p>
                        ) : userId ? (
                          <>
                            <textarea
                              value={replyDraft}
                              onChange={(e) => setReplyDraft(e.target.value)}
                              maxLength={3000}
                              rows={3}
                              placeholder="Write your reply in Nepali or English..."
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-600"
                            />

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={submittingReply || !replyDraft.trim()}
                                onClick={() =>
                                  handleReplySubmit(review.id, null)
                                }
                                className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                              >
                                {submittingReply ? "Sending..." : "Send Reply"}
                              </button>

                              <button
                                type="button"
                                onClick={() => openReplyForm(review.id, null)}
                                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                            Please login to reply to this review.
                            <Link
                              href="/auth"
                              className="ml-2 font-semibold text-green-700 hover:underline"
                            >
                              Login to Continue
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    <ReplyList
                      reviewId={review.id}
                      parentReplyId={null}
                      replies={replies.filter(
                        (reply) => reply.review_id === review.id
                      )}
                      userId={userId}
                      activeTarget={activeReplyTarget}
                      replyDraft={replyDraft}
                      submittingReply={submittingReply}
                      onReplyClick={openReplyForm}
                      onDraftChange={setReplyDraft}
                      onSubmit={handleReplySubmit}
                    />
                  </article>
                );
              })}
            </div>
          )}

          {reviews.length < totalReviews && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={loadMoreReviews}
                disabled={loadingMoreReviews}
                className="rounded-lg border border-green-700 px-7 py-3 font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMoreReviews ? "Loading..." : "Load More Reviews"}
              </button>
            </div>
          )}

          {loadMoreError && (
            <p className="mt-3 text-center text-sm text-red-600">
              {loadMoreError}
            </p>
          )}
          {replyError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {replyError}
            </p>
          )}

          {replyMessage && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {replyMessage}
            </p>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="font-semibold text-green-700 hover:underline"
          >
            ← Explore more businesses on TrustNepal
          </Link>
        </div>
      </div>
    </main>
  );
}
