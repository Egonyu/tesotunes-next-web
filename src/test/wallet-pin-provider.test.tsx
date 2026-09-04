import { fireEvent, render, screen, waitFor } from "@/test/test-utils";
import { AxiosError } from "axios";
import {
  WalletPinProvider,
  useWalletPinGuard,
} from "@/components/wallet/wallet-pin-provider";

// Six endpoints sit behind the wallet.pin middleware and every one of them has
// to raise the same prompt and replay the same action. When that wiring lived
// in the pages, only /wallet did it — the other five showed a raw failure with
// no way to enter a PIN, which made those actions impossible rather than merely
// awkward. Holding it in one provider means a page has no modal to forget.

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  useSession: () => ({ status: "authenticated", data: { user: { name: "T" } } }),
}));

jest.mock("@/hooks/useWalletPin", () => {
  const actual = jest.requireActual("@/hooks/useWalletPin");
  return {
    ...actual,
    useWalletPinStatus: () => ({ data: { has_pin: true, is_locked: false }, isLoading: false }),
    useSetWalletPin: () => ({ mutateAsync: jest.fn(), isPending: false }),
    useVerifyWalletPin: () => ({ mutateAsync: jest.fn(), isPending: false }),
  };
});

const pinRequired = new AxiosError(
  "PIN required",
  "ERR_BAD_REQUEST",
  undefined,
  undefined,
  {
    status: 423,
    statusText: "Locked",
    data: { pin_status: "verification_required" },
    headers: {},
    config: { headers: {} },
  } as never,
);

function MoneyAction({ action }: { action: () => Promise<unknown> }) {
  const runGuarded = useWalletPinGuard();

  return (
    <button onClick={() => void runGuarded(action)}>Send</button>
  );
}

describe("WalletPinProvider", () => {
  it("hands a working guard to any money action beneath it", async () => {
    const action = jest.fn().mockResolvedValue({ ok: true });

    render(
      <WalletPinProvider>
        <MoneyAction action={action} />
      </WalletPinProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
  });

  it("swallows a 423 instead of letting it reach the page", async () => {
    // The page must not see the 423 at all — that is the whole point. It used
    // to arrive as a raw error and get toasted as "failed, please try again",
    // advice that could never work because retrying produced the same 423.
    const action = jest.fn().mockRejectedValue(pinRequired);
    let rejectedWith: unknown = null;

    function Probe() {
      const runGuarded = useWalletPinGuard();
      return (
        <button
          onClick={() => {
            void runGuarded(action).catch((error) => {
              rejectedWith = error;
            });
          }}
        >
          Send
        </button>
      );
    }

    render(
      <WalletPinProvider>
        <Probe />
      </WalletPinProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(rejectedWith).toBeNull();
  });

  it("lets any other failure through to the page untouched", async () => {
    const boom = new Error("insufficient credits");
    const action = jest.fn().mockRejectedValue(boom);
    let rejectedWith: unknown = null;

    function Probe() {
      const runGuarded = useWalletPinGuard();
      return (
        <button
          onClick={() => {
            void runGuarded(action).catch((error) => {
              rejectedWith = error;
            });
          }}
        >
          Send
        </button>
      );
    }

    render(
      <WalletPinProvider>
        <Probe />
      </WalletPinProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(rejectedWith).toBe(boom));
  });

  /**
   * The failure this whole refactor exists to prevent: a money action that
   * cannot reach a prompt. Using the guard outside the provider must fail
   * loudly at development time rather than silently at a user's checkout.
   */
  it("refuses to run outside the provider", () => {
    const quiet = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(<MoneyAction action={jest.fn()} />),
    ).toThrow(/WalletPinProvider/);

    quiet.mockRestore();
  });
});
