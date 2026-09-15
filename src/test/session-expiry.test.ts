import {
  SESSION_EXPIRED_HEADER,
  handleSessionExpired,
  isSessionExpiredResponse,
  resetSessionExpiryForTests,
} from "@/lib/session-expiry";

// A returning user whose API token died used to see stale numbers: each widget
// swallowed its own 401 and React Query kept the last good data on screen.

describe("isSessionExpiredResponse", () => {
  it("only trusts a 401 the proxy has confirmed as a dead token", () => {
    expect(isSessionExpiredResponse({ status: 401, headers: { [SESSION_EXPIRED_HEADER]: "1" } })).toBe(true);
  });

  it("ignores 401s a signed-in user can still clear (2FA, password confirm)", () => {
    expect(isSessionExpiredResponse({ status: 401, headers: {} })).toBe(false);
  });

  it("ignores the header on any other status", () => {
    expect(isSessionExpiredResponse({ status: 403, headers: { [SESSION_EXPIRED_HEADER]: "1" } })).toBe(false);
    expect(isSessionExpiredResponse(undefined)).toBe(false);
  });

  it("reads AxiosHeaders-style bags", () => {
    const headers = { get: (name: string) => (name === SESSION_EXPIRED_HEADER ? "1" : undefined) };
    expect(isSessionExpiredResponse({ status: 401, headers })).toBe(true);
  });
});

describe("handleSessionExpired", () => {
  const assign = jest.fn();
  const at = (pathname: string, search = "") => ({ pathname, search, assign });

  beforeEach(() => {
    assign.mockReset();
    resetSessionExpiryForTests();
  });

  it("sends the reader to the expired notice, remembering where they were", () => {
    handleSessionExpired(at("/credits", "?tab=history"));

    expect(assign).toHaveBeenCalledWith(
      `/access-required?reason=expired&callbackUrl=${encodeURIComponent("/credits?tab=history")}`,
    );
  });

  it("redirects once however many requests fail together", () => {
    handleSessionExpired(at("/dashboard"));
    handleSessionExpired(at("/dashboard"));
    handleSessionExpired(at("/dashboard"));

    expect(assign).toHaveBeenCalledTimes(1);
  });

  it("stays put on pages that already explain themselves", () => {
    handleSessionExpired(at("/access-required"));
    handleSessionExpired(at("/login"));

    expect(assign).not.toHaveBeenCalled();
  });
});
