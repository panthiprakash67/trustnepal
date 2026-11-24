
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Business = {
  id: number;
  name: string;
  slug: string;
};

type Membership = {
  id: number;
  business_id: number;
  role: "owner" | "branch_manager" | "review_responder";
  is_active: boolean;
  businesses: Business | Business[] | null;
};

type BranchAssignment = {
  id: number;
  membership_id: number;
  branch_id: number;
};

function getBusiness(
  value: Business | Business[] | null
): Business | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function roleLabel(role: string) {
  switch (role) {
    case "owner":
      return "Business Owner";
    case "branch_manager":
      return "Branch Manager";
    case "review_responder":
      return "Review Responder";
    default:
      return role;
  }
}

export default function BusinessDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [assignments, setAssignments] = useState<BranchAssignment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          router.replace("/auth?next=/business-dashboard");
          return;
        }

        if (!active) return;

        setUserEmail(user.email ?? "");

        const { data: membershipData, error: membershipError } =
          await supabase
            .from("business_memberships")
            .select(
              "id, business_id, role, is_active, businesses(id, name, slug)"
            )
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (membershipError) throw membershipError;

        const activeMemberships = (membershipData ?? []) as Membership[];

        if (!active) return;

        setMemberships(activeMemberships);

        if (activeMemberships.length > 0) {
          setSelectedId(activeMemberships[0].id);

          const membershipIds = activeMemberships.map(
            (membership) => membership.id
          );

          const { data: branchData, error: branchError } =
            await supabase
              .from("business_membership_branches")
              .select("id, membership_id, branch_id")
              .in("membership_id", membershipIds);

          if (branchError) throw branchError;

          if (!active) return;

          setAssignments((branchData ?? []) as BranchAssignment[]);
        }
      } catch (err) {
        console.error("Business Dashboard Error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your business dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  const selectedMembership =
    memberships.find((item) => item.id === selectedId) ?? null;

  const selectedBusiness = selectedMembership
    ? getBusiness(selectedMembership.businesses)
    : null;

  const assignedBranchCount = selectedMembership
    ? assignments.filter(
        (item) => item.membership_id === selectedMembership.id
      ).length
    : 0;

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading Business Dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-blue-700"
            >
              TrustNepal
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              Business Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {userEmail}
            </span>

            <button
              onClick={logout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Your Business Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your TrustNepal business account from one place.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {memberships.length === 0 ? (
          <section className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              No Business Account Found
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Your account does not currently have an active
              Business Membership. Please contact TrustNepal
              Administration if you believe this is a mistake.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Back to Home
            </Link>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
              <label
                htmlFor="business-switcher"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Select Business
              </label>

              <select
                id="business-switcher"
                value={selectedId ?? ""}
                onChange={(event) =>
                  setSelectedId(Number(event.target.value))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 sm:max-w-lg"
              >
                {memberships.map((membership) => {
                  const business = getBusiness(membership.businesses);

                  return (
                    <option
                      key={membership.id}
                      value={membership.id}
                    >
                      {business?.name ?? `Business #${membership.business_id}`}
                    </option>
                  );
                })}
              </select>
            </section>

            {selectedMembership && selectedBusiness && (
              <>
                <section className="rounded-xl bg-blue-800 p-6 text-white shadow-sm">
                  <p className="text-sm text-blue-100">
                    Selected Business
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {selectedBusiness.name}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
                      {roleLabel(selectedMembership.role)}
                    </span>

                    <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
                      Active Membership
                    </span>
                  </div>
                </section>

                <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Business
                    </p>
                    <h3 className="mt-3 text-lg font-bold text-gray-900">
                      {selectedBusiness.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Business ID: {selectedBusiness.id}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Your Role
                    </p>
                    <h3 className="mt-3 text-lg font-bold text-gray-900">
                      {roleLabel(selectedMembership.role)}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Assigned by TrustNepal
                    </p>
                  </div>

                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Assigned Branches
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-gray-900">
                      {selectedMembership.role === "owner"
                        ? "All"
                        : assignedBranchCount}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {selectedMembership.role === "owner"
                        ? "Business-wide access"
                        : "Branch assignments"}
                    </p>
                  </div>
                </section>

                <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900">
                    Business Management
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    Your account is active. Additional management
                    features will appear here as they are enabled.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      "Customer Reviews",
                      "Review Replies",
                      "Branch Management",
                      "Business Analytics",
                    ].map((feature) => (
                      <div
                        key={feature}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <p className="text-sm font-semibold text-gray-700">
                          {feature}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Coming soon
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
