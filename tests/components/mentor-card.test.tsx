import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MentorCard } from "@/components/mentors/MentorCard";
import { demoMentors } from "@/lib/demo/data";

describe("MentorCard", () => {
  it("renders mentor information", () => {
    const mentor = demoMentors.find((item) => item.profile.id === "mentor-jiho");

    expect(mentor).toBeDefined();
    render(<MentorCard mentor={mentor!} />);

    expect(screen.getByText("박지호")).toBeInTheDocument();
    expect(screen.getByText("수학")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /프로필 보기/ })).toHaveAttribute("href", "/mentors/mentor-jiho");
  });
});
