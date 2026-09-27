import { fireEvent, render, screen, waitFor } from "@/test/test-utils";
import { WalletPinSettings } from "@/components/wallet/wallet-pin-settings";

const resetPin = jest.fn();

jest.mock("@/hooks/useWalletPin", () => ({
    useWalletPinStatus: () => ({
        data: { has_pin: true, pin_length: 4 },
        isLoading: false,
    }),
    useChangeWalletPin: () => ({ mutateAsync: jest.fn(), isPending: false }),
    useResetWalletPin: () => ({ mutateAsync: resetPin, isPending: false }),
}));

jest.mock("@/components/wallet/wallet-pin-modal", () => ({
    WalletPinModal: () => null,
}));

jest.mock("sonner", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

describe("WalletPinSettings", () => {
    beforeEach(() => resetPin.mockReset());

    it("lets a user reset a forgotten PIN with their account password", async () => {
        resetPin.mockResolvedValue({ message: "ok" });
        render(<WalletPinSettings />);

        fireEvent.click(screen.getByRole("button", { name: "Forgot PIN?" }));
        expect(
            screen.getByText(/You do not need the old PIN/),
        ).toBeInTheDocument();

        fireEvent.change(
            screen.getByPlaceholderText("Enter your account password"),
            {
                target: { value: "account-password" },
            },
        );
        fireEvent.change(screen.getByLabelText("New PIN"), {
            target: { value: "8391" },
        });
        fireEvent.change(screen.getByLabelText("Confirm new PIN"), {
            target: { value: "8391" },
        });
        fireEvent.click(
            screen.getByRole("button", { name: "Reset PIN securely" }),
        );

        await waitFor(() =>
            expect(resetPin).toHaveBeenCalledWith({
                password: "account-password",
                pin: "8391",
            }),
        );
        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: "Forgot PIN?" }),
            ).toBeInTheDocument(),
        );
    });
});
