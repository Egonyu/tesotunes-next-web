import Link from "next/link";
import { Music } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              T
            </div>
            <span className="text-4xl font-bold">TesoTunes</span>
          </Link>
          <h1 className="text-3xl font-bold mb-4">
            Discover East African Music
          </h1>
          <p className="text-muted-foreground text-lg">
            Stream millions of songs, discover new artists, and support the
            sounds of East Africa.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10K+</div>
              <div className="text-sm">Songs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm">Artists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">50K+</div>
              <div className="text-sm">Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              T
            </div>
            <span className="text-2xl font-bold">TesoTunes</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
