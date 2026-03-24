export interface PlatformSettings {
  general: {
    platform_name: string;
    tagline: string;
    support_email: string;
    default_currency: string;
    timezone: string;
    maintenance_mode: boolean;
    registration_enabled: boolean;
  };
  appearance: {
    primary_color: string;
    logo_light: string;
    logo_dark: string;
    favicon: string;
    app_name: string;
    admin_panel_name: string;
    admin_panel_subtitle: string;
    logo_alt: string;
    logo_compact_label: string;
    sacco_name: string;
    sacco_tagline: string;
  };
  notifications: {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    digest_frequency: string;
  };
  security: {
    two_factor_required: boolean;
    password_min_length: number;
    session_timeout_minutes: number;
    max_login_attempts: number;
    lockout_duration_minutes: number;
  };
  payments: {
    mtn_enabled: boolean;
    mtn_api_key: string;
    airtel_enabled: boolean;
    airtel_api_key: string;
    zengapay_enabled: boolean;
    zengapay_merchant_id: string;
    zengapay_api_key: string;
    artist_revenue_share: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_from_name: string;
    smtp_from_email: string;
  };
  storage: {
    driver: string;
    max_upload_mb: number;
    allowed_audio_formats: string;
    allowed_image_formats: string;
  };
  sacco: {
    sacco_name: string;
    sacco_tagline: string;
    share_price_ugx: number;
    minimum_savings_balance_ugx: number;
    default_join_deposit_ugx: number;
    default_join_shares: number;
    minimum_initial_shares: number;
    monthly_savings_target_ugx: number;
    annual_interest_rate: number;
    annual_dividend_rate: number;
    max_loan_multiplier: number;
    guest_title: string;
    guest_description: string;
    member_title: string;
    member_description: string;
    cta_title: string;
    cta_description: string;
  };
}

export const defaultPlatformSettings: PlatformSettings = {
  general: {
    platform_name: "TesoTunes",
    tagline: "Empowering Artists, Connecting Fans",
    support_email: "support@tesotunes.com",
    default_currency: "UGX",
    timezone: "Africa/Kampala",
    maintenance_mode: false,
    registration_enabled: true,
  },
  appearance: {
    primary_color: "#10B981",
    logo_light: "",
    logo_dark: "",
    favicon: "",
    app_name: "TesoTunes",
    admin_panel_name: "Admin Panel",
    admin_panel_subtitle: "Platform operations",
    logo_alt: "TesoTunes",
    logo_compact_label: "T",
    sacco_name: "TesoTunes SACCO",
    sacco_tagline: "Artist Finance Platform",
  },
  notifications: {
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    digest_frequency: "daily",
  },
  security: {
    two_factor_required: false,
    password_min_length: 8,
    session_timeout_minutes: 120,
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
  },
  payments: {
    mtn_enabled: false,
    mtn_api_key: "",
    airtel_enabled: false,
    airtel_api_key: "",
    zengapay_enabled: false,
    zengapay_merchant_id: "",
    zengapay_api_key: "",
    artist_revenue_share: 70,
  },
  email: {
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_from_name: "TesoTunes",
    smtp_from_email: "noreply@tesotunes.com",
  },
  storage: {
    driver: "s3",
    max_upload_mb: 100,
    allowed_audio_formats: "mp3,wav,flac,aac",
    allowed_image_formats: "jpg,jpeg,png,webp",
  },
  sacco: {
    sacco_name: "TesoTunes Artist SACCO",
    sacco_tagline: "Save together, grow together.",
    share_price_ugx: 50000,
    minimum_savings_balance_ugx: 50000,
    default_join_deposit_ugx: 50000,
    default_join_shares: 5,
    minimum_initial_shares: 5,
    monthly_savings_target_ugx: 500000,
    annual_interest_rate: 12,
    annual_dividend_rate: 8,
    max_loan_multiplier: 3,
    guest_title: "Join Our Artist SACCO",
    guest_description: "A savings and credit cooperative designed exclusively for music artists. Save together, grow together.",
    member_title: "Welcome Back, Member!",
    member_description: "Manage your savings, shares, and loans. Build your financial future with fellow artists.",
    cta_title: "Ready to Join?",
    cta_description: "Becoming a member is easy. Start with a minimum of UGX 50,000 and begin your journey to financial growth with fellow artists.",
  },
};

type PartialPlatformSettings = Partial<{
  [K in keyof PlatformSettings]: Partial<PlatformSettings[K]>;
}>;

export function normalizePlatformSettings(input?: PartialPlatformSettings | null): PlatformSettings {
  return {
    general: { ...defaultPlatformSettings.general, ...(input?.general ?? {}) },
    appearance: { ...defaultPlatformSettings.appearance, ...(input?.appearance ?? {}) },
    notifications: { ...defaultPlatformSettings.notifications, ...(input?.notifications ?? {}) },
    security: { ...defaultPlatformSettings.security, ...(input?.security ?? {}) },
    payments: { ...defaultPlatformSettings.payments, ...(input?.payments ?? {}) },
    email: { ...defaultPlatformSettings.email, ...(input?.email ?? {}) },
    storage: { ...defaultPlatformSettings.storage, ...(input?.storage ?? {}) },
    sacco: { ...defaultPlatformSettings.sacco, ...(input?.sacco ?? {}) },
  };
}
