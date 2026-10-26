import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  ensureProfileForUser: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/env", () => ({ isDemoMode: false, siteUrl: "https://studybridge.example" }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: { signUp: mocks.signUp } })),
}));
vi.mock("@/lib/auth/ensure-profile", () => ({ ensureProfileForUser: mocks.ensureProfileForUser }));

import { signupWithPassword } from "@/app/actions/auth";

const input = {
  displayName: "새멘토",
  email: "new@example.com",
  password: "password123",
  confirmPassword: "password123",
  grade: 2,
  termsAccepted: true,
};

describe("signupWithPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("waits for email confirmation when signup has no session", async () => {
    mocks.signUp.mockResolvedValue({ data: { user: { id: "new-user" }, session: null }, error: null });

    const result = await signupWithPassword(input);

    expect(result).toEqual({
      ok: true,
      message: "확인 메일을 보냈습니다. 받은 편지함의 가입 확인 링크를 눌러 주세요.",
    });
    expect(mocks.ensureProfileForUser).not.toHaveBeenCalled();
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: input.email,
        options: expect.objectContaining({ emailRedirectTo: "https://studybridge.example/auth/callback" }),
      }),
    );
  });

  it("creates a profile and opens onboarding when signup has a session", async () => {
    const user = { id: "new-user" };
    mocks.signUp.mockResolvedValue({ data: { user, session: { access_token: "test" } }, error: null });
    mocks.ensureProfileForUser.mockResolvedValue(true);

    const result = await signupWithPassword(input);

    expect(mocks.ensureProfileForUser).toHaveBeenCalledWith(expect.anything(), user);
    expect(result.redirectTo).toBe("/onboarding");
  });

  it("explains when the confirmation email cannot be sent to a new address", async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "email_address_not_authorized" },
    });

    const result = await signupWithPassword(input);

    expect(result).toEqual({
      ok: false,
      message: "현재 이메일 발송 설정에서는 이 주소로 확인 메일을 보낼 수 없습니다. 운영자에게 문의해 주세요.",
    });
  });
});
