import { render, screen } from "@/test/test-utils";
import { HomepageThemeResolver } from "@/components/home/homepage-theme-resolver";

jest.mock("@/components/home/classic-home-page", () => ({
  ClassicHomePage: () => <div>classic-home</div>,
}));

describe("HomepageThemeResolver", () => {
  it("renders the classic home experience", () => {
    render(<HomepageThemeResolver />);
    expect(screen.getByText("classic-home")).toBeInTheDocument();
  });
});
