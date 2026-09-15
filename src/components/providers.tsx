"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            // Coming back to a tab left open (or a phone woken up) must show
            // current balances, not the numbers from when it was last looked
            // at. Only queries past their staleTime refetch, so long-lived
            // public data (genres, home rails) stays cached.
            refetchOnWindowFocus: true,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
          },
        },
      })
  );

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
      useEnterprise
      scriptProps={{ async: true, defer: true }}
    >
      <SessionProvider
        session={session}
        refetchInterval={5 * 60}
        // Re-checking the session on return is what rotates the API token
        // (or notices it has died) before the page starts trusting it.
        refetchOnWindowFocus
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors position="bottom-right" />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ThemeProvider>
      </SessionProvider>
    </GoogleReCaptchaProvider>
  );
}
