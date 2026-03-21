import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { authConfig } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TesoTunes - East African Music Platform",
    template: "%s | TesoTunes",
  },
  description:
    "Discover, stream, and support East African music. Your platform for authentic African sounds.",
  keywords: [
    "East African music",
    "African music streaming",
    "Ugandan music",
    "Kenyan music",
    "Tanzanian music",
    "Teso music",
  ],
  authors: [{ name: "TesoTunes" }],
  creator: "TesoTunes",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TesoTunes",
    title: "TesoTunes - East African Music Platform",
    description:
      "Discover, stream, and support East African music. Your platform for authentic African sounds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TesoTunes - East African Music Platform",
    description:
      "Discover, stream, and support East African music. Your platform for authentic African sounds.",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authConfig);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E1VJQ4RJBH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E1VJQ4RJBH');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers session={session}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
