import { renderHook, act } from "@testing-library/react";
import { AxiosError } from "axios";
import { useWalletPinGuardState } from "@/hooks/useWalletPin";

// A withdrawal that needs a PIN really does move money once the PIN is
// accepted, so the caller's `await runGuarded(...)` has to settle with what the
// retry returned. It used to be fired and forgotten: the caller had already
// been handed undefined and taken its early-return, which left the cash-out
// dialog open, its fields uncleared, and the stale amount reading as "more than
// your available balance" against the freshly-lowered balance.

/** The 423 the backend answers with when the wallet PIN must be entered. */
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

describe("useWalletPinGuardState", () => {
  it("resolves the original call with the retry's result once unlocked", async () => {
    const { result } = renderHook(() => useWalletPinGuardState());

    const action = jest
      .fn()
      .mockRejectedValueOnce(pinRequired)
      .mockResolvedValueOnce({ reference: "PAY-1" });

    let settled: unknown;
    await act(async () => {
      void result.current.runGuarded(action).then((value) => {
        settled = value;
      });
    });

    // Challenge raised, caller still waiting — not resolved with undefined.
    expect(result.current.pinModal.open).toBe(true);
    expect(settled).toBeUndefined();

    await act(async () => {
      result.current.pinModal.onUnlocked();
    });

    expect(action).toHaveBeenCalledTimes(2);
    expect(settled).toEqual({ reference: "PAY-1" });
  });

  it("rejects the original call when the retry fails", async () => {
    const { result } = renderHook(() => useWalletPinGuardState());

    const failure = new Error("provider rejected the transfer");
    const action = jest
      .fn()
      .mockRejectedValueOnce(pinRequired)
      .mockRejectedValueOnce(failure);

    let caught: unknown;
    await act(async () => {
      void result.current.runGuarded(action).catch((error) => {
        caught = error;
      });
    });

    await act(async () => {
      result.current.pinModal.onUnlocked();
    });

    expect(caught).toBe(failure);
  });

  it("settles rather than hanging when the prompt is dismissed", async () => {
    const { result } = renderHook(() => useWalletPinGuardState());

    const action = jest.fn().mockRejectedValueOnce(pinRequired);

    let done = false;
    await act(async () => {
      void result.current.runGuarded(action).then(() => {
        done = true;
      });
    });

    await act(async () => {
      result.current.pinModal.onClose();
    });

    // Abandoning the prompt must not leave the caller awaiting forever with its
    // submit button stuck spinning.
    expect(done).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
  });
});
