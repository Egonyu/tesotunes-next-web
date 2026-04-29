"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { getProviders, signIn } from "next-auth/react";
import { registerUser } from "@/lib/register-client";
import { usePublicPlatformSettings } from "@/hooks/usePublicPlatformSettings";
import { getEnabledSocialAuthProvidersForPlatformSettings } from "@/lib/social-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { data: platformSettings } = usePublicPlatformSettings();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [socialProviders, setSocialProviders] = useState<Record<string, { id: string; name: string }> | null>(null);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<string | null>(null);

  const enabledProviders = getEnabledSocialAuthProvidersForPlatformSettings(platformSettings);

  useEffect(() => {
    let mounted = true;
    void getProviders().then((providers) => {
      if (mounted) setSocialProviders(providers as Record<string, { id: string; name: string }> | null);
    }).catch(() => {
      if (mounted) setSocialProviders(null);
    });
    return () => { mounted = false; };
  }, []);

  const enabledSocialProviders = Object.values(socialProviders ?? {}).filter(
    (p) => p.id !== "credentials" && enabledProviders.has(p.id as "google" | "facebook" | "twitter" | "apple")
  );

  const handleSocialSignIn = async (providerId: string) => {
    setErrors({});
    setSocialLoadingProvider(providerId);
    try {
      await signIn(providerId, { callbackUrl: "/" });
    } catch {
      setErrors({ general: ["Unable to start social sign-in. Please try again."] });
      setSocialLoadingProvider(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await registerUser(formData);

      if (!result.ok) {
        if (result.status === 422 && result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: [result.message || "An error occurred during registration"] });
        }
        return;
      }

      router.push(`/verify-email?registered=true&email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setErrors({ general: [message] });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordChecks = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains uppercase", met: /[A-Z]/.test(formData.password) },
    { label: "Contains lowercase", met: /[a-z]/.test(formData.password) },
    { label: "Contains number", met: /[0-9]/.test(formData.password) },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Create an account</h2>
      <p className="text-muted-foreground mb-8">
        Join TesoTunes and start discovering East African music
      </p>

      {errors.general && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {errors.general[0]}
        </div>
      )}

      {enabledSocialProviders.length > 0 && (
        <div className="mb-6 space-y-3">
          {enabledSocialProviders.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => void handleSocialSignIn(provider.id)}
              disabled={Boolean(socialLoadingProvider)}
              className="w-full py-2.5 rounded-lg border font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {socialLoadingProvider === provider.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting {provider.name}...
                </>
              ) : (
                <>Continue with {provider.name}</>
              )}
            </button>
          ))}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or sign up with email</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2 space-y-1">
              {passwordChecks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs ${check.met ? "text-green-600" : "text-muted-foreground"}`}
                >
                  <Check className={`h-3 w-3 ${check.met ? "" : "opacity-30"}`} />
                  {check.label}
                </div>
              ))}
            </div>
          )}
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {formData.password_confirmation && formData.password !== formData.password_confirmation && (
            <p className="mt-1 text-sm text-destructive">Passwords do not match</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 rounded border-muted-foreground"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
