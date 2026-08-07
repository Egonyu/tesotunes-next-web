import { render, screen } from "@/test/test-utils";
import { WalletPinModal } from "@/components/wallet/wallet-pin-modal";

// Guards the wallet PIN wiring: the modal must show the right prompt for each
// challenge the backend can return, and must not render when closed.

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  useSession: () => ({ status: "authenticated", data: { user: { name: "T" } } }),
}));

const mockStatus = jest.fn();
const mockSet = jest.fn();
const mockVerify = jest.fn();

jest.mock("@/hooks/useWalletPin", () => ({
  ...jest.requireActual("@/hooks/useWalletPin"),
  useWalletPinStatus: () => mockStatus(),
  useSetWalletPin: () => mockSet(),
  useVerifyWalletPin: () => mockVerify(),
}));

const idleMutation = { mutateAsync: jest.fn(), isPending: false };

describe("WalletPinModal", () => {
  beforeEach(() => {
    mockSet.mockReturnValue(idleMutation);
    mockVerify.mockReturnValue(idleMutation);
    mockStatus.mockReturnValue({
      data: { has_pin: false, is_locked: false, pin_length: 4 },
    });
  });

  it("prompts first-time setup when the account has no PIN", () => {
    render(<WalletPinModal open onClose={jest.fn()} />);

    expect(screen.getByText("Set Up Your Wallet PIN")).toBeInTheDocument();
    expect(screen.getByText(/Create a 4-digit PIN/i)).toBeInTheDocument();
  });

  it("asks for the existing PIN when a transaction needs authorizing", () => {
    mockStatus.mockReturnValue({
      data: { has_pin: true, is_locked: false, pin_length: 4 },
    });

    render(<WalletPinModal open challenge="verification_required" onClose={jest.fn()} />);

    expect(screen.getByText("Enter Your Wallet PIN")).toBeInTheDocument();
  });

  it("explains the lockout rather than accepting more attempts", () => {
    render(<WalletPinModal open challenge="locked" onClose={jest.fn()} />);

    expect(screen.getByText("Wallet Locked")).toBeInTheDocument();
    expect(screen.queryByLabelText(/4-digit PIN/i)).not.toBeInTheDocument();
  });

  it("renders nothing while closed", () => {
    const { container } = render(<WalletPinModal open={false} onClose={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
