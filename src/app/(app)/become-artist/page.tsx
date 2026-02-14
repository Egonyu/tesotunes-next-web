"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic2,
  Music,
  Upload,
  TrendingUp,
  DollarSign,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Shield,
  Wallet,
  Sparkles,
  Camera,
  FileText,
  Loader2,
  Heart,
  Headphones,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useSubmitArtistApplication,
  useArtistApplicationStatus,
  useAvailableGenres,
  ArtistApplicationData,
} from "@/hooks/useArtist";

// ============================================================================
// Step Configuration - Simplified to 4 steps
// ============================================================================

const STEPS = [
  { id: 0, title: "Welcome", icon: Sparkles, description: "Why become an artist?" },
  { id: 1, title: "Your Music", icon: Music, description: "Tell us about your artistry" },
  { id: 2, title: "Get Paid", icon: Wallet, description: "Set up payouts" },
  { id: 3, title: "Review", icon: FileText, description: "Review & submit" },
] as const;

// ============================================================================
// Main Component
// ============================================================================

export default function BecomeArtistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Check application status
  const { data: appStatus, isLoading: statusLoading } = useArtistApplicationStatus();
  const { data: genresData, isLoading: genresLoading, error: genresError } = useAvailableGenres();
  const submitApplication = useSubmitArtistApplication();

  // Pre-fill user data from session
  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "";
  
  // Form state - simplified and pre-filled
  const [formData, setFormData] = useState<Partial<ArtistApplicationData>>({
    stage_name: userName, // Pre-fill with user's name
    bio: "",
    primary_genre: "",
    secondary_genres: [],
    full_name: userName, // Pre-fill with user's name
    phone: "",
    payout_method: "mtn_momo",
    mobile_money_provider: "mtn",
    country: "UG",
    terms_accepted: false,
    artist_agreement_accepted: false,
    social_links: {},
  });

  // File state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when session loads - MUST be before any early returns
  useEffect(() => {
    if (session?.user?.name && !formData.stage_name) {
      setFormData(prev => ({
        ...prev,
        stage_name: session.user.name || "",
        full_name: session.user.name || "",
      }));
    }
  }, [session?.user?.name]);

  const genres = genresData?.data ?? [];

  // Auth guard - redirect via useEffect to avoid hooks reconciliation error
  const shouldRedirectToLogin = status !== "loading" && !statusLoading && !session?.user;
  const shouldRedirectToStatus = appStatus?.data?.status === "pending";
  const shouldRedirectToArtist = appStatus?.data?.status === "approved" || appStatus?.data?.is_artist;

  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.replace("/login?callbackUrl=/become-artist");
    } else if (shouldRedirectToStatus) {
      router.replace("/become-artist/status");
    } else if (shouldRedirectToArtist) {
      router.replace("/artist/dashboard");
    }
  }, [shouldRedirectToLogin, shouldRedirectToStatus, shouldRedirectToArtist, router]);

  if (status === "loading" || statusLoading) {
    return <LoadingScreen />;
  }

  if (shouldRedirectToLogin || shouldRedirectToStatus || shouldRedirectToArtist) {
    return <LoadingScreen />;
  }

  const updateForm = (updates: Partial<ArtistApplicationData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Your Music (stage name, genre, bio)
        return !!(
          formData.stage_name && 
          formData.primary_genre && 
          formData.bio && 
          formData.bio.length >= 50
        );
      case 2: // Get Paid (phone, payout)
        if (formData.payout_method === "bank") {
          return !!(formData.phone && formData.bank_name && formData.bank_account);
        }
        return !!(formData.phone && formData.mobile_money_number);
      case 3: // Review (terms)
        return !!(formData.terms_accepted && formData.artist_agreement_accepted);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Ensure auth token is synced to localStorage before API call
    if (session?.accessToken) {
      localStorage.setItem("auth_token", session.accessToken);
    } else {
      toast.error("Session expired. Please log in again.");
      setIsSubmitting(false);
      router.replace("/login?callbackUrl=/become-artist");
      return;
    }

    try {
      const submitData: ArtistApplicationData = {
        stage_name: formData.stage_name ?? "",
        bio: formData.bio ?? "",
        primary_genre: formData.primary_genre ?? "",
        secondary_genres: formData.secondary_genres,
        career_start_year: formData.career_start_year,
        country: formData.country,
        city: formData.city,
        website_url: formData.website_url,
        social_links: formData.social_links,
        full_name: formData.full_name ?? "",
        nin_number: formData.nin_number,
        phone: formData.phone ?? "",
        payout_method: formData.payout_method ?? "mtn_momo",
        mobile_money_number: formData.mobile_money_number,
        mobile_money_provider: formData.mobile_money_provider,
        bank_name: formData.bank_name,
        bank_account: formData.bank_account,
        // Only include files if they exist
        ...(avatarFile && { avatar: avatarFile }),
        ...(idFrontFile && { national_id_front: idFrontFile }),
        ...(idBackFile && { national_id_back: idBackFile }),
        ...(selfieFile && { selfie_with_id: selfieFile }),
        terms_accepted: true,
        artist_agreement_accepted: true,
      };

      await submitApplication.mutateAsync(submitData);
      toast.success("Application submitted! We'll review it within 24-48 hours.");
      router.push("/become-artist/status");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const message = err?.response?.data?.message || "Failed to submit application. Please try again.";
      toast.error(message);

      // Show field errors
      if (err?.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((e) => toast.error(e));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">Become an Artist</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1.5">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  step.id < currentStep
                    ? "bg-primary cursor-pointer"
                    : step.id === currentStep
                    ? "bg-primary/70"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Current step label */}
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            {(() => {
              const StepIcon = STEPS[currentStep].icon;
              return <StepIcon className="h-4 w-4" />;
            })()}
            <span>{STEPS[currentStep].title}</span>
            <span className="text-xs">— {STEPS[currentStep].description}</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {currentStep === 0 && <StepWelcome />}
        {currentStep === 1 && (
          <StepMusic
            formData={formData}
            updateForm={updateForm}
            genres={genres}
            genresLoading={genresLoading}
            avatarPreview={avatarPreview}
            onAvatarChange={handleAvatarChange}
          />
        )}
        {currentStep === 2 && (
          <StepPayout formData={formData} updateForm={updateForm} />
        )}
        {currentStep === 3 && (
          <StepReview
            formData={formData}
            updateForm={updateForm}
            avatarPreview={avatarPreview}
            genres={genres}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                canProceed()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={cn(
                "flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold transition-all",
                canProceed() && !isSubmitting
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90 shadow-lg shadow-primary/25"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 0: Welcome / Benefits
// ============================================================================

function StepWelcome() {
  const benefits = [
    {
      icon: Upload,
      title: "Upload Your Music",
      description: "Share your songs, albums, and EPs with fans across East Africa and beyond.",
    },
    {
      icon: DollarSign,
      title: "Earn From Your Art",
      description: "Get paid for every stream, download, and sale. Withdraw earnings via Mobile Money or bank.",
    },
    {
      icon: BarChart3,
      title: "Track Your Growth",
      description: "Access real-time analytics — see who's listening, where, and what's trending.",
    },
    {
      icon: TrendingUp,
      title: "Build Your Fanbase",
      description: "Get featured, join playlists, and connect directly with your audience.",
    },
    {
      icon: Headphones,
      title: "Professional Tools",
      description: "Album management, release scheduling, promo materials, and more — all in one place.",
    },
    {
      icon: Heart,
      title: "Artist Community",
      description: "Join a growing community of East African artists. Collaborate, share, and grow together.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
          <Mic2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Share Your Music With The World
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground leading-relaxed">
          Join thousands of artists on TesoTunes. Upload your music, reach new fans,
          earn from your streams, and grow your career — all from one platform.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <benefit.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1">{benefit.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 pt-4">
        {[
          { label: "Active Artists", value: "2,500+" },
          { label: "Songs Uploaded", value: "15,000+" },
          { label: "Monthly Listeners", value: "100K+" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* What you need */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          What you&apos;ll need
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
          {[
            "Your stage name / artist name",
            "A short bio about your music",
            "Phone number for verification",
            "Mobile Money or bank details for payouts",
            "National ID (optional, for verified badge)",
            "A profile photo (optional)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// Step 1: Your Music (Combined: Identity + Sound)
// ============================================================================

interface StepMusicProps {
  formData: Partial<ArtistApplicationData>;
  updateForm: (data: Partial<ArtistApplicationData>) => void;
  genres: Array<{ id: string; name: string; emoji: string }>;
  genresLoading: boolean;
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function StepMusic({ 
  formData, 
  updateForm, 
  genres, 
  genresLoading,
  avatarPreview, 
  onAvatarChange 
}: StepMusicProps) {
  const toggleSecondaryGenre = (genreId: string) => {
    const current = formData.secondary_genres ?? [];
    if (genreId === formData.primary_genre) return;
    if (current.includes(genreId)) {
      updateForm({ secondary_genres: current.filter((g) => g !== genreId) });
    } else if (current.length < 5) {
      updateForm({ secondary_genres: [...current, genreId] });
    }
  };

  const bioLength = formData.bio?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Tell Us About Your Music</h2>
        <p className="text-muted-foreground">
          Set up your artist profile so fans can discover you
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center">
        <label className="group relative cursor-pointer">
          <div className={cn(
            "flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed transition-all overflow-hidden",
            avatarPreview
              ? "border-primary"
              : "border-muted-foreground/30 hover:border-primary/50"
          )}>
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Artist avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <span className="mt-1 text-xs text-muted-foreground">Add Photo</span>
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Camera className="h-4 w-4" />
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onAvatarChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Artist/Stage Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Artist / Stage Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.stage_name ?? ""}
          onChange={(e) => updateForm({ stage_name: e.target.value, full_name: e.target.value })}
          placeholder="e.g. DJ Kaweesi, Mama Africa"
          className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2 transition-all"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This is how fans will discover you. Choose something memorable!
        </p>
      </div>

      {/* Primary Genre */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Primary Genre <span className="text-red-500">*</span>
        </label>
        {genresLoading ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading genres...</p>
          </div>
        ) : genres.length === 0 ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load genres. Please refresh the page or contact support.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => {
                  updateForm({ primary_genre: genre.id });
                  const secs = formData.secondary_genres ?? [];
                  if (secs.includes(genre.id)) {
                    updateForm({ secondary_genres: secs.filter((g) => g !== genre.id) });
                  }
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all",
                  formData.primary_genre === genre.id
                    ? "border-primary bg-primary/10 text-primary font-medium ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/30 hover:bg-accent"
                )}
              >
                <span className="text-lg">{genre.emoji}</span>
                <span>{genre.name}</span>
                {formData.primary_genre === genre.id && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Secondary Genres */}
      {formData.primary_genre && genres.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Other Genres You Explore
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (optional, up to 5)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {genres
              .filter((g) => g.id !== formData.primary_genre)
              .map((genre) => {
                const selected = formData.secondary_genres?.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleSecondaryGenre(genre.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all",
                      selected
                        ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "border-muted hover:border-primary/30"
                    )}
                  >
                    <span>{genre.emoji}</span>
                    <span>{genre.name}</span>
                    {selected && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Bio */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Artist Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.bio ?? ""}
          onChange={(e) => updateForm({ bio: e.target.value })}
          placeholder="Tell your story... What inspires your music? What makes your sound unique? Share your journey with fans."
          rows={5}
          maxLength={2000}
          className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2 transition-all resize-none"
        />
        <div className="mt-1 flex justify-between">
          <p className={cn(
            "text-xs",
            bioLength < 50 ? "text-amber-500 font-medium" : "text-muted-foreground"
          )}>
            {bioLength < 50
              ? `${50 - bioLength} more characters needed (minimum 50)`
              : "✓ Looking good!"}
          </p>
          <p className="text-xs text-muted-foreground">
            {bioLength}/2000
          </p>
        </div>
      </div>

      {/* Optional: Social Links - Collapsed by default */}
      <details className="rounded-lg border">
        <summary className="cursor-pointer p-4 font-medium hover:bg-accent">
          Social Media Links (Optional)
        </summary>
        <div className="space-y-3 p-4 pt-0">
          {[
            { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
            { key: "twitter", label: "X (Twitter)", placeholder: "@yourhandle" },
            { key: "youtube", label: "YouTube", placeholder: "youtube.com/c/yourchannel" },
            { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 text-sm text-muted-foreground">{label}</span>
              <input
                type="text"
                value={(formData.social_links as Record<string, string>)?.[key] ?? ""}
                onChange={(e) =>
                  updateForm({
                    social_links: {
                      ...formData.social_links,
                      [key]: e.target.value,
                    },
                  })
                }
                placeholder={placeholder}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2 transition-all"
              />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// ============================================================================
// Step 2: Payout Setup (includes phone verification)
// ============================================================================

interface StepPayoutProps {
  formData: Partial<ArtistApplicationData>;
  updateForm: (data: Partial<ArtistApplicationData>) => void;
}

function StepPayout({ formData, updateForm }: StepPayoutProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Set Up Your Payouts</h2>
        <p className="text-muted-foreground">
          Choose how you want to receive your earnings
        </p>
      </div>

      {/* Commission Info */}
      <div className="rounded-xl border bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold">70% Revenue Share</h3>
            <p className="text-xs text-muted-foreground">
              You keep 70% of all earnings from streams, downloads, and sales.
            </p>
          </div>
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={formData.phone ?? ""}
          onChange={(e) => updateForm({ phone: e.target.value })}
          placeholder="e.g. 0770 123 456"
          className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2 transition-all"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Used for account verification and payout notifications
        </p>
      </div>

      {/* Payout Method Selection */}
      <div>
        <label className="mb-3 block text-sm font-medium">
          Payout Method <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { id: "mtn_momo", label: "MTN Mobile Money", icon: "📱", desc: "Instant payouts" },
            { id: "airtel_money", label: "Airtel Money", icon: "📱", desc: "Instant payouts" },
            { id: "bank", label: "Bank Transfer", icon: "🏦", desc: "1-3 business days" },
          ].map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                updateForm({
                  payout_method: method.id as ArtistApplicationData["payout_method"],
                  mobile_money_provider:
                    method.id === "mtn_momo" ? "mtn" : method.id === "airtel_money" ? "airtel" : undefined,
                });
              }}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                formData.payout_method === method.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:border-primary/30 hover:bg-accent"
              )}
            >
              <span className="text-2xl">{method.icon}</span>
              <h4 className="mt-2 text-sm font-medium">{method.label}</h4>
              <p className="text-xs text-muted-foreground">{method.desc}</p>
              {formData.payout_method === method.id && (
                <Check className="h-4 w-4 text-primary mt-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Money Fields */}
      {(formData.payout_method === "mtn_momo" || formData.payout_method === "airtel_money") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Mobile Money Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile_money_number ?? ""}
            onChange={(e) => updateForm({ mobile_money_number: e.target.value })}
            placeholder="e.g. 0770 123 456"
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2 transition-all"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            The {formData.payout_method === "mtn_momo" ? "MTN" : "Airtel"} number where you&apos;ll receive earnings.
          </p>
        </div>
      )}

      {/* Bank Fields */}
      {formData.payout_method === "bank" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bank_name ?? ""}
              onChange={(e) => updateForm({ bank_name: e.target.value })}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2 transition-all"
            >
              <option value="">Select your bank</option>
              <option value="Stanbic Bank Uganda">Stanbic Bank Uganda</option>
              <option value="DFCU Bank">DFCU Bank</option>
              <option value="Centenary Bank">Centenary Bank</option>
              <option value="Absa Bank Uganda">Absa Bank Uganda</option>
              <option value="Bank of Africa">Bank of Africa</option>
              <option value="Equity Bank Uganda">Equity Bank Uganda</option>
              <option value="KCB Bank Uganda">KCB Bank Uganda</option>
              <option value="PostBank Uganda">PostBank Uganda</option>
              <option value="Housing Finance Bank">Housing Finance Bank</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.bank_account ?? ""}
              onChange={(e) => updateForm({ bank_account: e.target.value })}
              placeholder="Enter your account number"
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Step 3: Verification
// ============================================================================
// Step 5: Review & Submit
// ============================================================================

interface StepReviewProps {
  formData: Partial<ArtistApplicationData>;
  updateForm: (data: Partial<ArtistApplicationData>) => void;
  avatarPreview: string | null;
  genres: Array<{ id: string; name: string; emoji: string }>;
}

function StepReview({ formData, updateForm, avatarPreview, genres }: StepReviewProps) {
  const getGenreName = (id: string) => genres.find((g) => g.id === id)?.name ?? id;
  const getGenreEmoji = (id: string) => genres.find((g) => g.id === id)?.emoji ?? "🎵";

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review Your Application</h2>
        <p className="text-muted-foreground">
          Make sure everything looks right before submitting.
        </p>
      </div>

      {/* Artist Card Preview */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-6">
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Artist avatar"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold">{formData.stage_name || "Your Stage Name"}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {formData.primary_genre && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {getGenreEmoji(formData.primary_genre)} {getGenreName(formData.primary_genre)}
                </span>
              )}
              {formData.city && <span>📍 {formData.city}</span>}
            </div>
          </div>
        </div>
        {formData.bio && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {formData.bio}
          </p>
        )}
      </div>

      {/* Summary Sections */}
      <div className="space-y-4">
        <ReviewSection title="Personal Details">
          <ReviewItem label="Full Name" value={formData.full_name} />
          <ReviewItem label="Stage Name" value={formData.stage_name} />
          <ReviewItem label="Phone" value={formData.phone} />
          <ReviewItem label="Location" value={[formData.city, formData.country].filter(Boolean).join(", ")} />
        </ReviewSection>

        <ReviewSection title="Music">
          <ReviewItem
            label="Primary Genre"
            value={formData.primary_genre ? `${getGenreEmoji(formData.primary_genre)} ${getGenreName(formData.primary_genre)}` : undefined}
          />
          <ReviewItem
            label="Other Genres"
            value={
              formData.secondary_genres?.length
                ? formData.secondary_genres.map((g) => getGenreName(g)).join(", ")
                : "None"
            }
          />
        </ReviewSection>

        <ReviewSection title="Payout">
          <ReviewItem
            label="Method"
            value={
              formData.payout_method === "mtn_momo"
                ? "MTN Mobile Money"
                : formData.payout_method === "airtel_money"
                ? "Airtel Money"
                : "Bank Transfer"
            }
          />
          <ReviewItem
            label={formData.payout_method === "bank" ? "Account #" : "Phone #"}
            value={formData.payout_method === "bank" ? formData.bank_account : formData.mobile_money_number}
          />
        </ReviewSection>
      </div>

      {/* Terms & Agreement */}
      <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Terms & Agreement
        </h3>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.terms_accepted ?? false}
            onChange={(e) => updateForm({ terms_accepted: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-muted-foreground/30 accent-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.artist_agreement_accepted ?? false}
            onChange={(e) => updateForm({ artist_agreement_accepted: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-muted-foreground/30 accent-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            I confirm that I have the rights to distribute the music I upload. I agree to the
            70/30 revenue share model and understand that my application will be reviewed
            before I can start uploading music.
          </span>
        </label>
      </div>
    </div>
  );
}

// ============================================================================
// Review Helpers
// ============================================================================

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="text-sm font-semibold mb-3 text-primary">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

// ============================================================================
// Loading Screen
// ============================================================================

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
