"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState, useEffect, type ReactNode } from "react";
import { setAuthToken } from "@/lib/api";

// Sync NextAuth session token to in-memory auth variable for API interceptor
function TokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setAuthToken(session.accessToken);
    } else if (status === "unauthenticated" || (status === "authenticated" && !session?.accessToken)) {
      // Clear token if unauthenticated OR if session exists but token was invalidated
      setAuthToken(null);
    }
  }, [session, status]);

  return null;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
          },
        },
      })
  );

  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <TokenSync />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="bottom-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
