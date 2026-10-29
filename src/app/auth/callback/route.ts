import { NextResponse, type NextRequest } from "next/server";

import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?notice=oauth-failed", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user || !(await ensureProfileForUser(supabase, data.user))) {
    return NextResponse.redirect(new URL("/login?notice=oauth-failed", request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.redirect(new URL("/login?notice=oauth-failed", request.url));
  }

  return NextResponse.redirect(new URL(profile.onboarding_completed ? "/dashboard" : "/onboarding", request.url));
}
