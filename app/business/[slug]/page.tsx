
"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

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
  categoryName: string;
};

type Review = {
  id: number;
  user_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  created_at: string;
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const reviewDraftKey = `trustnepal_review_draft:${slug}`;
  const autoSubmitStarted = useRef(false);

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

      setRating(draft.rating);
      setReviewTitle(draft.reviewTitle);
      setReviewText(draft.reviewText);

      setSubmitMessage(
        "Your saved review has been restored. Please submit it below."
      );
    } catch {
      setSubmitError("Unable to restore your saved review.");
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

  async function loadReviews(businessId: number) {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, user_id, rating, title, review_text, created_at")
      .eq("business_id", businessId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const reviewRows = data ?? [];

    if (reviewRows.length === 0) {
      setReviews([]);
      setReplies([]);
      return;
    }

    const reviewUserIds = [
      ...new Set(reviewRows.map((review) => review.user_id)),
    ];

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
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
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      };
    });

    setReviews(reviewsWithProfiles);

    await loadReplies(reviewRows.map((review) => review.id));
  }

  async function loadReplies(reviewIds: number[]) {
    if (reviewIds.length === 0) {
      setReplies([]);
      return;
    }

    const { data, error } = await supabase
      .from("review_replies")
      .select(
        "id, review_id, user_id, parent_reply_id, reply_text, created_at"
      )
      .in("review_id", reviewIds)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const replyRows = data ?? [];

    if (replyRows.length === 0) {
      setReplies([]);
      return;
    }

    const replyUserIds = [
      ...new Set(replyRows.map((reply) => reply.user_id)),
    ];

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
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

    setReplies(repliesWithProfiles);
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
              "id, name, slug, category_id, description, location, website, email, phone"
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
        });

      if (insertError) throw insertError;

      localStorage.removeItem(reviewDraftKey);

      await loadReviews(business.id);

      setRating(5);
      setReviewTitle("");
      setReviewText("");

      setSubmitMessage(
        "Your review has been submitted and is awaiting moderation. It will appear publicly after approval."
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to submit your review. Please try again."
      );
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

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      : 0;

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
              <span className="text-lg font-bold text-green-700">
                {reviews.length > 0 ? averageRating.toFixed(1) : "—"} ★
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Total Reviews
              </span>
              <span className="text-lg font-bold text-gray-900">
                {reviews.length}
              </span>
            </div>
          </div>

          {business.location && (
            <p className="mt-3 text-gray-600">
              📍 {business.location}
            </p>
          )}

          {(business.description ||
            business.email ||
            business.phone ||
            business.website) && (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {(business.email || business.phone || business.website) && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
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
                  </div>
                </div>
              )}

              {business.description && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Company Description
                  </h2>
                  <p className="mt-3 leading-7 text-gray-600">
                    {business.description}
                  </p>
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
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Your Rating
                </label>

                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      className={`text-4xl transition ${
                        star <= rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } hover:scale-110`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {rating} out of 5 stars
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
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
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
              {reviews.length} reviews
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

                      <span className="rounded-lg bg-yellow-50 px-3 py-2 font-bold text-yellow-700">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>

                    {review.review_text && (
                      <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-gray-600">
                        {review.review_text}
                      </p>
                    )}

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
