import type { User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { ensureProfileForUser } from "@/lib/auth/ensure-profile";

function createClient(profile: { id: string } | null) {
  const insert = vi.fn(async () => ({ error: null }));
  const from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(async () => ({ data: profile, error: null })),
      })),
    })),
    insert,
  }));

  return { client: { from }, insert };
}

describe("Google account profile preparation", () => {
  it("creates a first-grade profile using the Google full name", async () => {
    const { client, insert } = createClient(null);
    const user = {
      id: "12345678-user",
      email: "student@example.com",
      user_metadata: { full_name: "권민규" },
    } as unknown as User;

    const result = await ensureProfileForUser(client as never, user);

    expect(result).toBe(true);
    expect(insert).toHaveBeenCalledWith({
      id: user.id,
      display_name: "권민규",
      grade: 1,
      onboarding_completed: false,
    });
  });

  it("keeps an existing profile without inserting a duplicate", async () => {
    const { client, insert } = createClient({ id: "existing-user" });
    const user = { id: "existing-user", user_metadata: {} } as unknown as User;

    expect(await ensureProfileForUser(client as never, user)).toBe(true);
    expect(insert).not.toHaveBeenCalled();
  });
});
