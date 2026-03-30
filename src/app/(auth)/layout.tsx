'use client';

import Link from "next/link";
import { useMemo } from "react";
import { SafeImage, InitialsAvatar } from "@/components/ui/safe-image";
import { usePublicPlatformSettings } from "@/hooks/usePublicPlatformSettings";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: platformSettings } = usePublicPlatformSettings();
  const appearance = platformSettings?.appearance;
  const general = platformSettings?.general;

  const brandName = appearance?.app_name || general?.platform_name || "TesoTunes";
  const logoAlt = appearance?.logo_alt || brandName;
  const compactLabel = appearance?.logo_compact_label || brandName.charAt(0);
  const authHeroTitle = appearance?.auth_hero_title || "Discover East African Music";
  const authHeroDescription =
    appearance?.auth_hero_description ||
    "Stream millions of songs, discover new artists, and support the sounds of East Africa.";
  const authHeroImage = appearance?.auth_hero_image || "";
  const authStats = useMemo(
    () => [
      { value: appearance?.auth_stat_1_value || "10K+", label: appearance?.auth_stat_1_label || "Songs" },
      { value: appearance?.auth_stat_2_value || "500+", label: appearance?.auth_stat_2_label || "Artists" },
      { value: appearance?.auth_stat_3_value || "50K+", label: appearance?.auth_stat_3_label || "Users" },
    ],
    [
      appearance?.auth_stat_1_label,
      appearance?.auth_stat_1_value,
      appearance?.auth_stat_2_label,
      appearance?.auth_stat_2_value,
      appearance?.auth_stat_3_label,
      appearance?.auth_stat_3_value,
    ]
  );

  return (
    <div className="min-h-screen flex bg-background">
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 items-stretch justify-center border-r border-white/5 bg-[#16090d]">
        {authHeroImage ? (
          <SafeImage
            src={authHeroImage}
            alt={authHeroTitle}
            fill
            className="object-cover opacity-25"
            fallback={null}
            sizes="50vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.35),transparent_42%),linear-gradient(135deg,rgba(36,8,18,0.98),rgba(10,10,10,0.9))]" />
        <div className="relative z-10 flex w-full max-w-2xl flex-col justify-center px-16 py-12 text-white">
          <Link href="/" className="inline-flex items-center gap-4 self-start">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
              <SafeImage
                src={appearance?.logo_light || appearance?.logo_dark}
                alt={logoAlt}
                fill
                className="object-cover"
                fallback={<InitialsAvatar name={compactLabel} className="bg-primary text-primary-foreground" textClassName="text-2xl" />}
                sizes="64px"
              />
            </div>
            <span className="text-4xl font-bold tracking-tight">{brandName}</span>
          </Link>

          <div className="mt-20 max-w-xl space-y-5">
            <h1 className="text-5xl font-semibold leading-tight">{authHeroTitle}</h1>
            <p className="text-xl leading-8 text-white/70">{authHeroDescription}</p>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6">
            {authStats.map((stat) => (
              <div key={`${stat.label}-${stat.value}`} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm uppercase tracking-[0.18em] text-white/55">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
              <SafeImage
                src={appearance?.logo_light || appearance?.logo_dark}
                alt={logoAlt}
                fill
                className="object-cover"
                fallback={<InitialsAvatar name={compactLabel} className="bg-primary text-primary-foreground" textClassName="text-base" />}
                sizes="40px"
              />
            </div>
            <span className="text-2xl font-bold">{brandName}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
