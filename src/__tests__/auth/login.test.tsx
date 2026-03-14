const mockSignIn = jest.fn();

jest.mock("next-auth/react", () => ({
  signIn: mockSignIn,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("lucide-react", () => ({
  Eye: () => <span data-testid="icon-eye">Eye</span>,
  EyeOff: () => <span data-testid="icon-eye-off">EyeOff</span>,
  Loader2: () => <span data-testid="icon-loader">Loading</span>,
}));

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import LoginPage from "@/app/(auth)/login/page";
import { AUTH_SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-api";

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("submits email, password, and remember_me through NextAuth credentials", async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: "/" });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "benson@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Ben./12!" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "benson@gmail.com",
        password: "Ben./12!",
        remember_me: true,
        redirect: false,
        callbackUrl: "/",
      });
    });
  });

  it("shows a user-friendly message for CredentialsSignin", async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: "CredentialsSignin",
      status: 401,
      url: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("shows backend errors returned by NextAuth", async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: "Account is suspended",
      status: 403,
      url: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "suspended@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/account is suspended/i)).toBeInTheDocument();
    });
  });

  it("shows a clear auth service error when the API is unreachable", async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: AUTH_SERVICE_UNAVAILABLE_MESSAGE,
      status: 503,
      url: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "benson@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Ben./12!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(AUTH_SERVICE_UNAVAILABLE_MESSAGE)).toBeInTheDocument();
    });
  });

  it("redirects to the callback URL after a successful login", async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: "/" });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "benson@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Ben./12!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("does not render unsupported auth methods in the web login UI", () => {
    render(<LoginPage />);

    expect(screen.queryByText(/two-factor authentication/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sign in with phone number/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/or continue with/i)).not.toBeInTheDocument();
  });
});
