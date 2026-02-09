import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
