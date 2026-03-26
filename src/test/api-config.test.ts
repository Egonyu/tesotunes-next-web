describe("api-config production fallback", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it("uses the production API fallback when NODE_ENV is production and no API env vars are set", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      VERCEL: "",
      APP_ENV: "",
      NEXT_PUBLIC_API_URL: "",
      BACKEND_API_URL: "",
      API_URL: "",
    };

    let API_URL: string;
    let API_ORIGIN: string;

    jest.isolateModules(() => {
      const config = require("@/lib/api-config") as typeof import("@/lib/api-config");
      API_URL = config.API_URL;
      API_ORIGIN = config.API_ORIGIN;
    });

    expect(API_URL!).toBe("https://api.tesotunes.com/api");
    expect(API_ORIGIN!).toBe("https://api.tesotunes.com");
  });

  it("normalizes malformed production API env values with duplicated api host and path", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      VERCEL: "1",
      APP_ENV: "production",
      NEXT_PUBLIC_API_URL: "https://api.api.tesotunes.com/api/api",
      BACKEND_API_URL: "",
      API_URL: "",
    };

    let API_URL: string;
    let API_ORIGIN: string;

    jest.isolateModules(() => {
      const config = require("@/lib/api-config") as typeof import("@/lib/api-config");
      API_URL = config.API_URL;
      API_ORIGIN = config.API_ORIGIN;
    });

    expect(API_URL!).toBe("https://api.tesotunes.com/api");
    expect(API_ORIGIN!).toBe("https://api.tesotunes.com");
  });
});
