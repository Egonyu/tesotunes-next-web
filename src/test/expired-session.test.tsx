import { render, screen, waitFor } from "@/test/test-utils";
import ExpiredSessionNotice from "@/components/auth/ExpiredSessionNotice";

// A session cookie lives 30 days; the API token it carries lasts 24 hours and
// is refreshed every 12. Someone away longer than a day comes back holding a
// cookie the browser still trusts, wrapping a token that is long dead. The
// notice has to say so *and* clear the cookie — otherwise they carry the same
// dead session around for the rest of the month.

const mockSignOut = jest.fn();

jest.mock("next-auth/react", () => ({
  ...jest.requireActual("next-auth/react"),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe("ExpiredSessionNotice", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
    mockSignOut.mockResolvedValue(undefined);
  });

  it("clears the stale cookie without navigating the reader away", async () => {
    render(<ExpiredSessionNotice callbackUrl="/wallet" />);

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));

    // redirect:false — the notice offers the way back itself, and moving
    // somebody mid-sentence is worse than letting them choose.
    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
  });

  it("says the session expired rather than demanding a sign in", () => {
    render(<ExpiredSessionNotice callbackUrl="/wallet" />);

    expect(screen.getByText(/your session expired/i)).toBeInTheDocument();
    expect(screen.getByText(/away a while/i)).toBeInTheDocument();
  });

  it("returns the reader to where they were headed", () => {
    render(<ExpiredSessionNotice callbackUrl="/admin/rewards" />);

    const signIn = screen.getByRole("link", { name: /sign in/i });
    expect(signIn).toHaveAttribute(
      "href",
      `/login?callbackUrl=${encodeURIComponent("/admin/rewards")}`,
    );
  });

  it("only clears once, however often it re-renders", async () => {
    const { rerender } = render(<ExpiredSessionNotice callbackUrl="/wallet" />);
    rerender(<ExpiredSessionNotice callbackUrl="/wallet" />);
    rerender(<ExpiredSessionNotice callbackUrl="/wallet" />);

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
  });
});
