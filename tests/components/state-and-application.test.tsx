import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/components/common/EmptyState";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { demoApplications } from "@/lib/demo/data";

vi.mock("@/app/actions/applications", () => ({
  acceptApplication: vi.fn(),
  rejectApplication: vi.fn(),
  cancelApplication: vi.fn(),
}));

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState description="신청이 생기면 이곳에 표시됩니다." icon={Inbox} title="표시할 신청이 없습니다" />);

    expect(screen.getByText("표시할 신청이 없습니다")).toBeInTheDocument();
    expect(screen.getByText("신청이 생기면 이곳에 표시됩니다.")).toBeInTheDocument();
  });
});

describe("ApplicationCard", () => {
  it("shows cancel button for pending sent applications", () => {
    const application = demoApplications.find((item) => item.status === "pending" && item.menteeId === "user-minseo");

    expect(application).toBeDefined();
    render(<ApplicationCard application={application!} direction="sent" />);

    expect(screen.getByRole("button", { name: /신청 취소/ })).toBeInTheDocument();
  });

  it("shows accept and reject buttons for pending received applications", () => {
    const application = demoApplications.find((item) => item.status === "pending");

    expect(application).toBeDefined();
    render(<ApplicationCard application={application!} direction="received" />);

    expect(screen.getByRole("button", { name: /승인/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /거절/ })).toBeInTheDocument();
  });
});
