export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  recaptcha_token?: string;
}

export interface RegisterResult {
  ok: boolean;
  status: number;
  message?: string;
  errors?: Record<string, string[]>;
}

async function safeJsonParse(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();

  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("[Register] Failed to parse response:", {
      status: response.status,
      text: text.substring(0, 200),
      error,
    });
    return null;
  }
}

export async function registerUser(data: RegisterFormData): Promise<RegisterResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJsonParse(response);

  if (!response.ok) {
    if (!result) {
      return {
        ok: false,
        status: response.status,
        errors: { general: ["Registration service unavailable. Please try again later."] },
      };
    }

    return {
      ok: false,
      status: response.status,
      message:
        (result.message as string) ||
        (result.error as string) ||
        "An error occurred during registration",
      errors: (result.errors as Record<string, string[]>) ?? undefined,
    };
  }

  return {
    ok: true,
    status: response.status,
  };
}
