import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("Auth callback triggered:", {
    url: requestUrl.toString(),
    hasCode: !!code,
    origin: requestUrl.origin,
  });

  if (code) {
    try {
      console.log("Attempting to exchange code for session...");

      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error.message, error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(
            error.message
          )}`
        );
      }

      console.log("Successfully authenticated user:", data.user?.email);
      console.log("Session expires in:", data.session?.expires_in, "seconds");

      // Redirect to home page
      return NextResponse.redirect(requestUrl.origin);
    } catch (error) {
      console.error("Unexpected error in auth callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=unexpected_error`
      );
    }
  }

  // No code parameter, redirect to login
  console.log("No code parameter found, redirecting to login");
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
}
