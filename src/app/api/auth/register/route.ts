import { NextRequest, NextResponse } from "next/server";

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
            name: !data.name ? ["Name is required"] : [],
            email: !data.email ? ["Email is required"] : [],
            password: !data.password ? ["Password is required"] : [],
          }
        },
        { status: 422 }
      );
    }

    // Call Laravel backend
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://beta.test/api";

    console.log("Calling backend registration:", {
      url: `${backendUrl}/auth/register`,
      data: { name: data.name, email: data.email },
    });

    const response = await fetch(`${backendUrl}/auth/register`, {
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
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(responseData, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Registration API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
      },
      { status: 500 }
    );
  }
}
