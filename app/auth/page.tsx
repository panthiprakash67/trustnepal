"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { supabase } from "../../lib/supabase";

type Gender = "Male" | "Female" | "Prefer not to say" | "";
type PhoneDetails = {
  countryCode: string;
  phoneNumber: string;
};

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

const countries = getCountries()
  .map((code) => ({
    code,
    name: countryNames.of(code) || code,
    callingCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function getSafeNextPath(): string | null {
  if (typeof window === "undefined") return null;

  const requestedPath = new URLSearchParams(window.location.search).get("next");

  if (
    !requestedPath ||
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//")
  ) {
    return null;
  }

  try {
    const parsedUrl = new URL(requestedPath, window.location.origin);

    if (parsedUrl.origin !== window.location.origin) {
      return null;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return null;
  }
}

function getAuthRedirectUrl(): string {
  const redirectUrl = new URL("/auth", window.location.origin);
  const nextPath = getSafeNextPath();

  if (nextPath) {
    redirectUrl.searchParams.set("next", nextPath);
  }

  return redirectUrl.toString();
}

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);

  const [phoneCountry, setPhoneCountry] = useState("NP");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [googlePhoneStep, setGooglePhoneStep] = useState(false);
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === phoneCountry) || countries[0],
    [phoneCountry]
  );

  function getValidPhone(): PhoneDetails | null {
    const parsed = parsePhoneNumberFromString(phoneNumber.trim(), phoneCountry as any);

    if (!parsed || !parsed.isValid()) {
      return null;
    }

    return {
      countryCode: `+${parsed.countryCallingCode}`,
      phoneNumber: parsed.nationalNumber,
    };
  }

  async function saveUserProfile(
    user: User,
    selectedPhoto: File | null = null,
    phoneDetails?: PhoneDetails
  ) {
    const metadata = user.user_metadata || {};

    const googleFullName = metadata.full_name || metadata.name || "";
    const nameParts = String(googleFullName)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const savedFirstName =
      firstName.trim() ||
      metadata.first_name ||
      metadata.given_name ||
      nameParts[0] ||
      "";

    const savedMiddleName = middleName.trim() || metadata.middle_name || "";

    const savedLastName =
      lastName.trim() ||
      metadata.last_name ||
      metadata.family_name ||
      nameParts.slice(1).join(" ") ||
      "";

    const savedGender = gender || metadata.gender || null;

    const fullName =
      [savedFirstName, savedMiddleName, savedLastName]
        .filter(Boolean)
        .join(" ") || String(googleFullName);

    let avatarUrl: string | null =
      metadata.avatar_url || metadata.picture || null;

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
        throw new Error("Profile photo upload failed: " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      avatarUrl = publicUrlData.publicUrl;
    }

    const savedPhoneCountryCode =
      phoneDetails?.countryCode || metadata.phone_country_code || null;
    const savedPhoneNumber =
      phoneDetails?.phoneNumber || metadata.phone_number || null;

    const profileData: {
      user_id: string;
      first_name: string;
      middle_name: string;
      last_name: string;
      gender: string | null;
      full_name: string;
      avatar_url?: string;
      phone_country_code: string | null;
      phone_number: string | null;
    } = {
      user_id: user.id,
      first_name: savedFirstName,
      middle_name: savedMiddleName,
      last_name: savedLastName,
      gender: savedGender,
      full_name: fullName,
      phone_country_code: savedPhoneCountryCode,
      phone_number: savedPhoneNumber,
    };

    if (avatarUrl) {
      profileData.avatar_url = avatarUrl;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "user_id" });

    if (profileError) {
      throw new Error("Profile save failed: " + profileError.message);
    }
  }

  async function redirectUser(
    user: User,
    selectedPhoto: File | null = null,
    phoneDetails?: PhoneDetails
  ) {
    await saveUserProfile(user, selectedPhoto, phoneDetails);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = roleData?.role;
    const nextPath = getSafeNextPath();

    if (role === "super_admin" || role === "admin") {
      router.replace("/admin");
    } else {
      router.replace(nextPath || "/");
    }
  }

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (data.session?.user) {
          const user = data.session.user;

          // An existing profile means this is an existing account.
          // Existing users are not forced to add a phone number at login.
          const { data: existingProfile, error: profileLookupError } =
            await supabase
              .from("profiles")
              .select("user_id")
              .eq("user_id", user.id)
              .maybeSingle();

          if (profileLookupError) throw profileLookupError;

          if (existingProfile) {
            await redirectUser(user);
          } else if (active) {
            // A Google account without a profile is treated as a first-time signup.
            setGoogleUser(user);
            setGooglePhoneStep(true);
          }
        }
      } catch (err) {
        console.error("Session check error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify your account."
          );
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
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

  async function handleGoogleLogin() {
    setError("");
    setMessage("");
    setLoading(false);
    setGoogleLoading(true);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectUrl(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (googleError) throw googleError;
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Google login failed. Please try again."
      );
      setGoogleLoading(false);
    }
  }

  async function handleGooglePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!googleUser) {
      setError("Your Google session could not be found. Please try again.");
      return;
    }

    const validPhone = getValidPhone();

    if (!validPhone) {
      setError("Please enter a valid phone number for the selected country.");
      return;
    }

    setLoading(true);

    try {
      await redirectUser(googleUser, null, validPhone);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to save your phone number."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    let validPhone: PhoneDetails | null = null;

    if (mode === "signup") {
      if (!firstName.trim() || !lastName.trim()) {
        setError("First Name and Last Name are required.");
        return;
      }

      if (!gender) {
        setError("Please select your gender.");
        return;
      }

      validPhone = getValidPhone();

      if (!validPhone) {
        setError("Please enter a valid phone number for the selected country.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const fullName = [firstName.trim(), middleName.trim(), lastName.trim()]
          .filter(Boolean)
          .join(" ");

        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(),
            data: {
              first_name: firstName.trim(),
              middle_name: middleName.trim(),
              last_name: lastName.trim(),
              full_name: fullName,
              gender,
              phone_country_code: validPhone!.countryCode,
              phone_number: validPhone!.phoneNumber,
            },
          },
        });

        if (signupError) throw signupError;

        if (data.session && data.user) {
          await redirectUser(data.user, photo, validPhone!);
          return;
        }

        setMessage(
          "Registration successful! Please check your email and verify your account. After verification, log in to continue. Your phone number will be saved when you log in."
        );
      } else {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) throw loginError;

        if (data.user) {
          // Existing email users can log in without providing a phone number.
          await redirectUser(data.user);
          return;
        }

        setMessage("Login successful. Please continue.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  function renderPhoneFields() {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Mobile Number *
        </label>
        <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-2">
          <select
            value={phoneCountry}
            onChange={(event) => setPhoneCountry(event.target.value)}
            required
            className="min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
            aria-label="Country calling code"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.callingCode})
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            required
            autoComplete="tel-national"
            placeholder="Phone number"
            className="min-w-0 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Select your country and enter your mobile number. Nepal (+977) is selected by default.
        </p>
        {selectedCountry && (
          <p className="mt-1 text-xs text-gray-400">
            Calling code: {selectedCountry.callingCode}
          </p>
        )}
      </div>
    );
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Checking your account...</p>
      </main>
    );
  }

  if (googlePhoneStep && googleUser) {
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
              Complete your account registration
            </p>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Add Your Mobile Number
          </h1>
          <p className="mb-5 text-sm text-gray-600">
            You are signing in with Google for the first time. Please provide
            your mobile number to complete your TrustNepal account.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleGooglePhoneSubmit} className="space-y-4">
            {renderPhoneFields()}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Complete Registration"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            Signed in as {googleUser.email}
          </p>
        </div>
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

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            "Connecting to Google..."
          ) : (
            <>
              <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.01 13.22l7.98 6.19C11.91 13.72 17.47 9.5 24 9.5z"
                  transform="translate(0 4)"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 38.08 46.98 31.95 46.98 24.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.01 28.59a14.4 14.4 0 0 1 0-9.18l-8-6.19a23.9 23.9 0 0 0 0 21.56l8-6.19z"
                  transform="translate(0 4)"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.53 0-12.09-4.22-14.01-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  transform="translate(0 -2)"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium uppercase text-gray-400">
            Or continue with email
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

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
                    onChange={(event) => setFirstName(event.target.value)}
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
                    onChange={(event) => setMiddleName(event.target.value)}
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
                  onChange={(event) => setLastName(event.target.value)}
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
                  onChange={(event) => setGender(event.target.value as Gender)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {renderPhoneFields()}

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
              onChange={(event) => setEmail(event.target.value)}
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                placeholder="Enter your password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-gray-900 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must contain at least 6 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
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
