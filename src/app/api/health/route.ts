import { NextResponse } from "next/server";

import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "StudyBridge",
    demoMode: isDemoMode,
    supabaseConfigured: isSupabaseConfigured,
  });
}
