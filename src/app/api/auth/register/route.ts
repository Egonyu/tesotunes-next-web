import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tesotunes.com";

/**
 * Safely parse JSON from a fetch response.
 * Returns null if the body is empty or not valid JSON.
 */
async function safeJsonParse(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("[Register] Non-JSON response from backend:", text.substring(0, 200));
      return null;
    }
  } catch (textError) {
    console.error("[Register] Failed to read response body:", textError);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: {
            ...(data.name ? {} : { name: ["Name is required"] }),
            ...(data.email ? {} : { email: ["Email is required"] }),
            ...(data.password ? {} : { password: ["Password is required"] }),
          },
        },
        { status: 422 }
      );
    }

    console.log("[Register] Calling backend:", {
      url: `${API_URL}/register`,
      data: { name: data.name, email: data.email },
    });

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        phone: data.phone,
        country: data.country,
        date_of_birth: data.date_of_birth,
        genres: data.genres, // optional genre selection from registration flow
      }),
    });

    const responseData = await safeJsonParse(response);

    if (!responseData) {
      console.error("[Register] Empty or non-JSON response from backend, status:", response.status, "content-type:", response.headers.get("content-type"));
      return NextResponse.json(
        {
          success: false,
          message: "The registration service is currently unavailable. Please try again later.",
          errors: null,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      // Normalize Laravel validation errors into a consistent shape
      const errors = (responseData.errors as Record<string, string[]>) ?? null;
      const message = (responseData.message as string) || "Registration failed";
      return NextResponse.json(
        { success: false, message, errors, data: null },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: "Registration successful", data: responseData.data ?? responseData, errors: null },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during registration. Please try again.",
        errors: null,
        data: null,
      },
      { status: 500 }
    );
  }
}
