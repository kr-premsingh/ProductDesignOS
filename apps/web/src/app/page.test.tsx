import { render, screen } from "@testing-library/react";
import Home from "./page";

jest.mock("@/components/feed-card", () => ({
  FeedCard: () => <div data-testid="feed-card" />
}));

jest.mock("@/components/early-access", () => ({
  EarlyAccess: ({ label = "Join Early Access" }: { label?: string }) => <button type="button">{label}</button>
}));

jest.mock("@/lib/catalog", () => ({
  fetchCategories: jest.fn().mockResolvedValue([]),
  fetchDesigns: jest.fn().mockResolvedValue([]),
  toTile: jest.fn()
}));

describe("home page", () => {
  it("renders the hero CTA", async () => {
    const page = await Home();
    render(page);
    expect(screen.getByText("A Design OS for Individuality")).toBeInTheDocument();
    expect(screen.getByText("Join Early Access")).toBeInTheDocument();
  });
});
