
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type Gender = "Male" | "Female" | "Prefer not to say" | "";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveUserProfile(
    user: User,
    selectedPhoto: File | null = null
  ) {
    const metadata = user.user_metadata || {};

    const savedFirstName =
      firstName.trim() || metadata.first_name || "";

    const savedMiddleName =
      middleName.trim() || metadata.middle_name || "";

    const savedLastName =
      lastName.trim() || metadata.last_name || "";

    const savedGender =
      gender || metadata.gender || null;

    const fullName = [
      savedFirstName,
      savedMiddleName,
      savedLastName,
    ]
      .filter(Boolean)
      .join(" ");

    let avatarUrl: string | null = metadata.avatar_url || null;

    if (selectedPhoto) {
      const extension =
        selectedPhoto.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/profile.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, selectedPhoto, {
          upsert: true,
          contentType: selectedPhoto.type,
        });

      if (uploadError) {
        throw new Error(
          "Profile photo upload failed: " + uploadError.message
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      avatarUrl = publicUrlData.publicUrl;
    }

    const profileData: {
      user_id: string;
      first_name: string;
      middle_name: string;
      last_name: string;
      gender: string | null;
      full_name: string;
      avatar_url?: string;
    } = {
      user_id: user.id,
      first_name: savedFirstName,
      middle_name: savedMiddleName,
      last_name: savedLastName,
      gender: savedGender,
      full_name: fullName,
    };

    if (avatarUrl) {
      profileData.avatar_url = avatarUrl;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData, {
        onConflict: "user_id",
      });

    if (profileError) {
      throw new Error(
        "Profile save failed: " + profileError.message
      );
    }
  }

  async function redirectUser(
    user: User,
    selectedPhoto: File | null = null
  ) {
    await saveUserProfile(user, selectedPhoto);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = roleData?.role;

    if (role === "super_admin" || role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
  }

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          await redirectUser(data.session.user);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setPhoto(selectedFile);
    setPhotoPreview(URL.createObjectURL(selectedFile));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (mode === "signup") {
      if (!firstName.trim() || !lastName.trim()) {
        setError("First Name and Last Name are required.");
        return;
      }

      if (!gender) {
        setError("Please select your gender.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const fullName = [
          firstName.trim(),
          middleName.trim(),
          lastName.trim(),
        ]
          .filter(Boolean)
          .join(" ");

        const { data, error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth`,
              data: {
                first_name: firstName.trim(),
                middle_name: middleName.trim(),
                last_name: lastName.trim(),
                full_name: fullName,
                gender,
              },
            },
          });

        if (signupError) {
          throw signupError;
        }

        if (data.session && data.user) {
          await redirectUser(data.user, photo);
          return;
        }

        setMessage(
          "Registration successful! Please check your email and verify your account. After verification, log in to continue. You can upload your profile photo from your Profile page."
        );
      } else {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) {
          throw loginError;
        }

        if (data.user) {
          await redirectUser(data.user);
          return;
        }

        setMessage("Login successful. Please continue.");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Checking your account...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-7 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-3xl font-bold text-blue-700"
          >
            TrustNepal
          </button>

          <p className="mt-2 text-sm text-gray-500">
            Your trusted community review platform
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-md py-2 font-medium transition ${
              mode === "login"
                ? "bg-white text-blue-700 shadow"
                : "text-gray-600"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-md py-2 font-medium transition ${
              mode === "signup"
                ? "bg-white text-blue-700 shadow"
                : "text-gray-600"
            }`}
          >
            Register
          </button>
        </div>

        <h1 className="mb-5 text-2xl font-bold text-gray-900">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Middle name (optional)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Last name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Profile Photo (Optional)
                </label>

                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
                      +
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="min-w-0 flex-1 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG or other image formats. Maximum 5 MB.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Enter your password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Password must contain at least 6 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() =>
              switchMode(mode === "login" ? "signup" : "login")
            }
            className="font-semibold text-blue-700 hover:underline"
          >
            {mode === "login" ? "Register here" : "Login here"}
          </button>
        </p>

        <div className="mt-6 border-t pt-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-blue-700"
          >
            ← Back to Homepage
          </button>
        </div>
      </div>
    </main>
  );
}
