import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FeedbackForm } from "@/components/forms/FeedbackForm";

vi.mock("@/app/actions/mentorships", () => ({
  submitFeedback: vi.fn(),
}));

describe("FeedbackForm", () => {
  it("renders structured feedback fields", () => {
    render(<FeedbackForm sessionId="session-1" targetUserId="user-2" />);

    expect(screen.getByLabelText("전체 만족도")).toBeInTheDocument();
    expect(screen.getByLabelText("설명 명확성")).toBeInTheDocument();
    expect(screen.getByLabelText("시간 준수")).toBeInTheDocument();
    expect(screen.getByLabelText("목표 달성도")).toBeInTheDocument();
    expect(screen.getByLabelText("목표 재설정")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /후속 조치가 필요합니다/ })).toBeInTheDocument();
  });
});
