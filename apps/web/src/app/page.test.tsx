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
  toTile: jest.fn(),
  creditsFor: jest.fn(() => 99)
}));

describe("home page", () => {
  it("renders the hero CTAs", () => {
    render(<Home />);
    expect(screen.getByText(/See it\. Remix it\./)).toBeInTheDocument();
    expect(screen.getByText("Shop the drop")).toBeInTheDocument();
    expect(screen.getByText("Remix with AI")).toBeInTheDocument();
  });
});
