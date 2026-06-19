import { render, screen } from "@/test/test-utils";
import { KycJourneyCard } from "@/components/kyc/kyc-journey-card";

// Guards the KYC journey wiring: this is the feature that previously had a
// backend + hooks but was rendered by nothing. A smoke test at the component
// boundary catches "the feature stopped being wired into the UI".

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  useSession: () => ({ status: "authenticated", data: { user: { name: "T" } } }),
}));

const mockKyc = jest.fn();
jest.mock("@/hooks/useKyc", () => ({
  useKycStatus: () => mockKyc(),
}));

const requirements = {
  required_document_types: [
    { type: "national_id_front", label: "National ID (front)" },
    { type: "national_id_back", label: "National ID (back)" },
    { type: "selfie_with_id", label: "Selfie holding ID" },
  ],
};

describe("KycJourneyCard", () => {
  it("nudges an unverified user with a progress count and a verify CTA", () => {
    mockKyc.mockReturnValue({
      data: { status: "none", documents: [], requirements },
    });

    render(<KycJourneyCard />);

    expect(screen.getByText(/verify your identity/i)).toBeInTheDocument();
    expect(screen.getByText("0/3")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/verify");
  });

  it("renders nothing once the account is verified", () => {
    mockKyc.mockReturnValue({
      data: { status: "verified", documents: [], requirements },
    });

    const { container } = render(<KycJourneyCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing while the status is still loading", () => {
    mockKyc.mockReturnValue({ data: undefined });

    const { container } = render(<KycJourneyCard />);

    expect(container).toBeEmptyDOMElement();
  });
});
