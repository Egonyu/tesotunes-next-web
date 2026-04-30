export type HomepageTheme = "classic_home" | "curated_home";

export interface PlatformSettings {
  general: {
    platform_name: string;
    platform_url: string;
    platform_description: string;
    tagline: string;
    support_email: string;
    admin_contact: string;
    default_language: string;
    default_currency: string;
    timezone: string;
    maintenance_mode: boolean;
    registration_enabled: boolean;
    music_streaming_enabled: boolean;
    music_downloads_enabled: boolean;
    events_tickets_enabled: boolean;
    awards_system_enabled: boolean;
    user_comments_enabled: boolean;
    artist_following_enabled: boolean;
    playlists_enabled: boolean;
    social_sharing_enabled: boolean;
    store_enabled: boolean;
    forums_enabled: boolean;
    polls_enabled: boolean;
    credits_enabled: boolean;
    podcasts_enabled: boolean;
    campaigns_enabled: boolean;
    ojokotau_enabled: boolean;
    edula_enabled: boolean;
    promotions_enabled: boolean;
    email_verification_required: boolean;
    artist_approval_required: boolean;
    social_login_enabled: boolean;
    phone_verification_enabled: boolean;
    default_user_role: string;
    registration_limit_per_ip: number;
    verification_required_for_tickets: boolean;
    verification_required_for_artists: boolean;
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
    auth_form_title: string;
    auth_form_subtitle: string;
    auth_hero_title: string;
    auth_hero_description: string;
    auth_hero_image: string;
    auth_stat_1_value: string;
    auth_stat_1_label: string;
    auth_stat_2_value: string;
    auth_stat_2_label: string;
    auth_stat_3_value: string;
    auth_stat_3_label: string;
    homepage_theme: HomepageTheme;
  };
  notifications: {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    digest_frequency: string;
    notify_new_registrations: boolean;
    notify_new_uploads: boolean;
    notify_payout_requests: boolean;
    notify_content_reports: boolean;
    notify_new_orders: boolean;
    notify_failed_payments: boolean;
  };
  users: {
    user_registration_enabled: boolean;
    email_verification_required: boolean;
    artist_approval_required: boolean;
    social_login_enabled: boolean;
    phone_verification_enabled: boolean;
    default_user_role: string;
    registration_limit_per_ip: number;
    verification_required_for_tickets: boolean;
    verification_required_for_artists: boolean;
    user_can_upload_music: boolean;
    user_can_create_playlists: boolean;
    user_can_comment: boolean;
    user_can_download: boolean;
    artist_can_create_events: boolean;
    artist_can_sell_tickets: boolean;
    artist_can_monetize: boolean;
    artist_has_analytics: boolean;
    max_upload_size_mb: number;
    daily_upload_limit: number;
    max_playlists_per_user: number;
    max_events_per_artist_monthly: number;
    comment_character_limit: number;
    session_timeout_minutes: number;
    profanity_filter_enabled: boolean;
    auto_moderate_comments: boolean;
    auto_ban_after_violations: number;
    warnings_before_ban: number;
    spam_detection_enabled: boolean;
    rate_limiting_enabled: boolean;
    ip_blocking_enabled: boolean;
    moderation_email_notifications: boolean;
  };
  credits: {
    credits_enabled: boolean;
    credits_per_song_upload: number;
    credits_per_event_ticket: number;
    credit_purchase_enabled: boolean;
    credit_to_ugx_rate: number;
    package_1_credits: number;
    package_1_price: number;
    package_1_active: boolean;
    package_2_credits: number;
    package_2_price: number;
    package_2_active: boolean;
    package_3_credits: number;
    package_3_price: number;
    package_3_active: boolean;
  };
  mobile: {
    mobile_verification_enabled: boolean;
    mobile_verification_required_for_signup: boolean;
    mobile_verification_required_for_login: boolean;
    mobile_verification_required_for_events: boolean;
    mobile_verification_required_for_artists: boolean;
    mobile_verification_required_for_payouts: boolean;
    sms_provider: string;
    verification_code_length: number;
    verification_expiry_minutes: number;
    max_verification_attempts: number;
    resend_cooldown_seconds: number;
  };
  security: {
    two_factor_required: boolean;
    password_min_length: number;
    password_require_uppercase: boolean;
    password_require_lowercase: boolean;
    password_require_numbers: boolean;
    password_require_symbols: boolean;
    session_timeout_minutes: number;
    max_login_attempts: number;
    lockout_duration_minutes: number;
    enable_session_timeout: boolean;
    allow_remember_me: boolean;
    enforce_single_session: boolean;
    log_security_events: boolean;
    log_failed_logins: boolean;
    log_password_changes: boolean;
    google_login_enabled: boolean;
    facebook_login_enabled: boolean;
    apple_login_enabled: boolean;
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
    transaction_fee_percentage: number;
    minimum_payout_ugx: number;
    payout_schedule: string;
    payouts_enabled: boolean;
    payout_hold_days: number;
    zengapay_webhook_secret: string;
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

export function normalizeHomepageTheme(value?: string | null): HomepageTheme {
  return value === "curated_home" ? "curated_home" : "classic_home";
}

export const defaultPlatformSettings: PlatformSettings = {
  general: {
    platform_name: "TesoTunes",
    platform_url: "https://tesotunes.com",
    platform_description: "Your music streaming platform",
    tagline: "Empowering Artists, Connecting Fans",
    support_email: "support@tesotunes.com",
    admin_contact: "support@tesotunes.com",
    default_language: "en",
    default_currency: "UGX",
    timezone: "Africa/Kampala",
    maintenance_mode: false,
    registration_enabled: true,
    music_streaming_enabled: true,
    music_downloads_enabled: true,
    events_tickets_enabled: true,
    awards_system_enabled: false,
    user_comments_enabled: true,
    artist_following_enabled: true,
    playlists_enabled: true,
    social_sharing_enabled: false,
    store_enabled: true,
    forums_enabled: false,
    polls_enabled: false,
    credits_enabled: true,
    podcasts_enabled: false,
    campaigns_enabled: false,
    ojokotau_enabled: false,
    edula_enabled: false,
    promotions_enabled: false,
    email_verification_required: true,
    artist_approval_required: false,
    social_login_enabled: false,
    phone_verification_enabled: true,
    default_user_role: "user",
    registration_limit_per_ip: 5,
    verification_required_for_tickets: true,
    verification_required_for_artists: false,
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
    auth_form_title: "Welcome back",
    auth_form_subtitle: "Sign in to continue listening to your favorite music",
    auth_hero_title: "Discover East African Music",
    auth_hero_description: "Stream millions of songs, discover new artists, and support the sounds of East Africa.",
    auth_hero_image: "",
    auth_stat_1_value: "10K+",
    auth_stat_1_label: "Songs",
    auth_stat_2_value: "500+",
    auth_stat_2_label: "Artists",
    auth_stat_3_value: "50K+",
    auth_stat_3_label: "Users",
    homepage_theme: "classic_home",
  },
  notifications: {
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    digest_frequency: "daily",
    notify_new_registrations: true,
    notify_new_uploads: true,
    notify_payout_requests: true,
    notify_content_reports: true,
    notify_new_orders: true,
    notify_failed_payments: true,
  },
  users: {
    user_registration_enabled: true,
    email_verification_required: true,
    artist_approval_required: false,
    social_login_enabled: false,
    phone_verification_enabled: true,
    default_user_role: "user",
    registration_limit_per_ip: 5,
    verification_required_for_tickets: true,
    verification_required_for_artists: false,
    user_can_upload_music: true,
    user_can_create_playlists: true,
    user_can_comment: true,
    user_can_download: true,
    artist_can_create_events: true,
    artist_can_sell_tickets: true,
    artist_can_monetize: true,
    artist_has_analytics: true,
    max_upload_size_mb: 100,
    daily_upload_limit: 10,
    max_playlists_per_user: 50,
    max_events_per_artist_monthly: 5,
    comment_character_limit: 500,
    session_timeout_minutes: 120,
    profanity_filter_enabled: false,
    auto_moderate_comments: false,
    auto_ban_after_violations: 3,
    warnings_before_ban: 2,
    spam_detection_enabled: false,
    rate_limiting_enabled: true,
    ip_blocking_enabled: false,
    moderation_email_notifications: true,
  },
  credits: {
    credits_enabled: true,
    credits_per_song_upload: 5,
    credits_per_event_ticket: 10,
    credit_purchase_enabled: true,
    credit_to_ugx_rate: 100,
    package_1_credits: 100,
    package_1_price: 10000,
    package_1_active: true,
    package_2_credits: 500,
    package_2_price: 50000,
    package_2_active: true,
    package_3_credits: 1000,
    package_3_price: 100000,
    package_3_active: true,
  },
  mobile: {
    mobile_verification_enabled: true,
    mobile_verification_required_for_signup: false,
    mobile_verification_required_for_login: false,
    mobile_verification_required_for_events: false,
    mobile_verification_required_for_artists: false,
    mobile_verification_required_for_payouts: true,
    sms_provider: "local",
    verification_code_length: 6,
    verification_expiry_minutes: 10,
    max_verification_attempts: 5,
    resend_cooldown_seconds: 60,
  },
  security: {
    two_factor_required: false,
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    session_timeout_minutes: 120,
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
    enable_session_timeout: true,
    allow_remember_me: true,
    enforce_single_session: false,
    log_security_events: true,
    log_failed_logins: true,
    log_password_changes: true,
    google_login_enabled: false,
    facebook_login_enabled: false,
    apple_login_enabled: false,
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
    transaction_fee_percentage: 2.5,
    minimum_payout_ugx: 10000,
    payout_schedule: "weekly",
    payouts_enabled: true,
    payout_hold_days: 7,
    zengapay_webhook_secret: "",
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
    appearance: {
      ...defaultPlatformSettings.appearance,
      ...(input?.appearance ?? {}),
      homepage_theme: normalizeHomepageTheme(input?.appearance?.homepage_theme),
    },
    notifications: { ...defaultPlatformSettings.notifications, ...(input?.notifications ?? {}) },
    users: { ...defaultPlatformSettings.users, ...(input?.users ?? {}) },
    credits: { ...defaultPlatformSettings.credits, ...(input?.credits ?? {}) },
    mobile: { ...defaultPlatformSettings.mobile, ...(input?.mobile ?? {}) },
    security: { ...defaultPlatformSettings.security, ...(input?.security ?? {}) },
    payments: { ...defaultPlatformSettings.payments, ...(input?.payments ?? {}) },
    email: { ...defaultPlatformSettings.email, ...(input?.email ?? {}) },
    storage: { ...defaultPlatformSettings.storage, ...(input?.storage ?? {}) },
    sacco: { ...defaultPlatformSettings.sacco, ...(input?.sacco ?? {}) },
  };
}
