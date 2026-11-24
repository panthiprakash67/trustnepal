
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, createHash } from "crypto";


function response(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return response("Server configuration is incomplete.", 500);
    }

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return response("Authentication required.", 401);
    }

    const accessToken = authorization.slice(7);

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: authError } =
      await authClient.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return response("Invalid or expired login session.", 401);
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: platformRoles, error: roleError } =
      await userClient
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", "super_admin")
        .limit(1);

    if (roleError) {
      console.error(
        "Business invitation role lookup failed:",
        roleError.message
      );
      return response("Unable to verify Super Admin permissions.", 500);
    }

    if (!platformRoles?.length) {
      console.error(
        "Business invitation denied for:",
        authData.user.email
      );
      return response("Only Super Admin can create invitations.", 403);
    }

    const body = await request.json();

    const businessId = Number(body.business_id);
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const role = body.role;
    const branchIds: number[] = Array.isArray(body.branch_ids)
      ? body.branch_ids.map(Number)
      : [];

    if (!Number.isSafeInteger(businessId) || businessId <= 0) {
      return response("Please select a valid business.", 400);
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return response("Please enter a valid email address.", 400);
    }

    if (
      !["owner", "branch_manager", "review_responder"].includes(role)
    ) {
      return response("Invalid business role.", 400);
    }

    if (
      branchIds.some(
        (id) => !Number.isSafeInteger(id) || id <= 0
      ) ||
      new Set(branchIds).size !== branchIds.length
    ) {
      return response("Invalid branch selection.", 400);
    }

    if (role === "owner" && branchIds.length > 0) {
      return response(
        "Business Owners receive business-wide access. Do not assign individual branches.",
        400
      );
    }

    if (role !== "owner" && branchIds.length === 0) {
      return response(
        "Please assign at least one branch for this role.",
        400
      );
    }

    const { data: business, error: businessError } =
      await adminClient
        .from("businesses")
        .select("id, name")
        .eq("id", businessId)
        .maybeSingle();

    if (businessError || !business) {
      console.error("Business lookup diagnostic:", {
        businessId,
        error: businessError?.message ?? null,
        errorCode: businessError?.code ?? null,
        businessFound: Boolean(business),
      });
      return response("Business not found.", 404);
    }

    if (branchIds.length > 0) {
      const { data: branches, error: branchError } =
        await adminClient
          .from("business_branches")
          .select("id")
          .eq("business_id", businessId)
          .eq("is_active", true)
          .in("id", branchIds);

      if (
        branchError ||
        !branches ||
        branches.length !== branchIds.length
      ) {
        return response(
          "One or more selected branches are invalid or inactive.",
          400
        );
      }
    }

    const { data: existingInvitation, error: existingError } =
      await adminClient
        .from("business_invitations")
        .select("id")
        .eq("business_id", businessId)
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle();

    if (existingError) {
      return response("Unable to check existing invitations.", 500);
    }

    if (existingInvitation) {
      return response(
        "A pending invitation already exists for this email and business.",
        409
      );
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: invitation, error: invitationError } =
      await adminClient
        .from("business_invitations")
        .insert({
          business_id: businessId,
          email,
          role,
          token_hash: tokenHash,
          status: "pending",
          expires_at: expiresAt,
          invited_by: authData.user.id,
        })
        .select("id")
        .single();

    if (invitationError || !invitation) {
      return response(
        invitationError?.message ?? "Unable to create invitation.",
        500
      );
    }

    if (branchIds.length > 0) {
      const branchRows = branchIds.map((branchId) => ({
        invitation_id: invitation.id,
        branch_id: branchId,
      }));

      const { error: assignmentError } = await adminClient
        .from("business_invitation_branches")
        .insert(branchRows);

      if (assignmentError) {
        await adminClient
          .from("business_invitations")
          .delete()
          .eq("id", invitation.id);

        return response(
          "Unable to save branch assignments.",
          500
        );
      }
    }

    const { error: auditError } = await adminClient
      .from("business_audit_logs")
      .insert({
        business_id: businessId,
        actor_user_id: authData.user.id,
        action: "business_invitation_created",
        entity_type: "business_invitation",
        entity_id: String(invitation.id),
        details: {
          email,
          role,
          branch_ids: branchIds,
          expires_at: expiresAt,
        },
      });

    if (auditError) {
      await adminClient
        .from("business_invitations")
        .delete()
        .eq("id", invitation.id);

      return response("Unable to record invitation audit log.", 500);
    }

    const origin = request.nextUrl.origin;
    const invitationUrl =
      `${origin}/business-invitation/accept?token=${rawToken}`;

    return NextResponse.json({
      success: true,
      message: "Business invitation created successfully.",
      business_name: business.name,
      email,
      role,
      expires_at: expiresAt,
      invitation_url: invitationUrl,
    });
  } catch (error) {
    console.error("Business Invitation API Error:", error);

    return response(
      error instanceof Error
        ? error.message
        : "Unexpected server error.",
      500
    );
  }
}
