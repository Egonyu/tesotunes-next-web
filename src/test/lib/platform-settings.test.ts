import {
  defaultPlatformSettings,
  normalizeHomepageTheme,
  normalizePlatformSettings,
} from "@/lib/platform-settings";

describe("platform settings homepage theme", () => {
  it("defaults homepage theme to classic", () => {
    expect(defaultPlatformSettings.appearance.homepage_theme).toBe("classic_home");
    expect(normalizeHomepageTheme(undefined)).toBe("classic_home");
    expect(normalizeHomepageTheme("custom")).toBe("classic_home");
  });

  it("preserves curated home when present", () => {
    const settings = normalizePlatformSettings({
      appearance: {
        homepage_theme: "curated_home",
      },
    });

    expect(settings.appearance.homepage_theme).toBe("curated_home");
  });
});
