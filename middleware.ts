import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isDemoMode, supabaseAnonKey, supabaseUrl } from "@/lib/env";

const protectedRoutes = [
  "/dashboard",
  "/mentors",
  "/requests",
  "/applications",
  "/mentorships",
  "/profile",
  "/notifications",
  "/admin",
];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isDemoMode || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isProtectedPath(pathname)) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase.from("profiles").select("onboarding_completed, role").eq("id", user.id).single();

  if (pathname !== "/onboarding" && profile?.onboarding_completed === false) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname.startsWith("/admin") && profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
