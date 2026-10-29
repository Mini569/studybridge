import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  ensureProfileForUser: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: mocks.single })),
      })),
    })),
  })),
}));
vi.mock("@/lib/auth/ensure-profile", () => ({ ensureProfileForUser: mocks.ensureProfileForUser }));

import { GET } from "@/app/auth/callback/route";

describe("Google OAuth callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts onboarding for a new Google user", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "new-user" } }, error: null });
    mocks.ensureProfileForUser.mockResolvedValue(true);
    mocks.single.mockResolvedValue({ data: { onboarding_completed: false }, error: null });

    const response = await GET(new NextRequest("https://studybridge.example/auth/callback?code=sample"));

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("sample");
    expect(mocks.ensureProfileForUser).toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://studybridge.example/onboarding");
  });

  it("opens the dashboard for a returning Google user", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "existing-user" } }, error: null });
    mocks.ensureProfileForUser.mockResolvedValue(true);
    mocks.single.mockResolvedValue({ data: { onboarding_completed: true }, error: null });

    const response = await GET(new NextRequest("https://studybridge.example/auth/callback?code=sample"));

    expect(response.headers.get("location")).toBe("https://studybridge.example/dashboard");
  });

  it("returns to login when the code is invalid", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: { message: "invalid code" } });

    const response = await GET(new NextRequest("https://studybridge.example/auth/callback?code=invalid"));

    expect(response.headers.get("location")).toBe("https://studybridge.example/login?notice=oauth-failed");
  });
});
