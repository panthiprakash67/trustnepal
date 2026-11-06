
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          router.replace("/auth");
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? "");

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (data) {
          setFullName(data.full_name ?? "");
          setAvatarUrl(data.avatar_url ?? "");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!userId) {
        throw new Error("Please login again.");
      }

      if (!fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      let finalAvatarUrl = avatarUrl;

      if (selectedFile) {

        if (
          !["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)
        ) {
          throw new Error("Please select a JPG, PNG, or WebP image.");
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
          throw new Error("Image size must be less than 5 MB.");
        }
        const fileExtension =
          selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${userId}/profile-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(filePath, selectedFile, {
            upsert: true,
            contentType: selectedFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            full_name: fullName.trim(),
            avatar_url: finalAvatarUrl || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (saveError) throw saveError;

      setAvatarUrl(finalAvatarUrl);
      setSelectedFile(null);
      setMessage("Your profile has been saved successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-extrabold text-green-700">
            TrustNepal
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-green-700"
          >
            ← Homepage
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <h1 className="text-3xl font-extrabold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your TrustNepal account information.
          </p>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="flex flex-col items-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-green-100 bg-gray-100">
                {selectedFile ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected profile"
                    className="h-full w-full object-cover"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-gray-400">👤</span>
                )}
              </div>

              <label
                htmlFor="profilePhoto"
                className="mt-4 cursor-pointer rounded-lg border border-green-700 px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                Choose Profile Photo
              </label>

              <input
                id="profilePhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  setMessage("");
                  setError("");
                }}
              />

              <p className="mt-2 text-xs text-gray-400">
                JPG, PNG or WebP images. Maximum 5 MB.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Your registered email address.
              </p>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                required
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-600"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving Profile..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
