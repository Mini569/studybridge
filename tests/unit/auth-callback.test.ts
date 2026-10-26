import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  ensureProfileForUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
  })),
}));
vi.mock("@/lib/auth/ensure-profile", () => ({ ensureProfileForUser: mocks.ensureProfileForUser }));

import { GET } from "@/app/auth/callback/route";

describe("email confirmation callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts onboarding after exchanging the confirmation code", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "new-user" } }, error: null });
    mocks.ensureProfileForUser.mockResolvedValue(true);

    const response = await GET(new NextRequest("https://studybridge.example/auth/callback?code=sample"));

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("sample");
    expect(mocks.ensureProfileForUser).toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://studybridge.example/onboarding");
  });

  it("returns to login when the code is invalid", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ data: { user: null }, error: { message: "invalid code" } });

    const response = await GET(new NextRequest("https://studybridge.example/auth/callback?code=invalid"));

    expect(response.headers.get("location")).toBe("https://studybridge.example/login?notice=confirmation-failed");
  });
});
