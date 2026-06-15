import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("home page", () => {
  it("renders the hero CTA", () => {
    render(<Home />);
    expect(screen.getByText("A Design OS for Individuality")).toBeInTheDocument();
    expect(screen.getByText("Join Early Access")).toBeInTheDocument();
  });
});
