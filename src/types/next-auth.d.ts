import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isArtist?: boolean;
      isEventOrganizer?: boolean;
      permissions?: string[];
      apiAuthorized?: boolean;
    } & DefaultSession["user"];
    /** The API token behind this session expired and could not be refreshed. */
    expired?: boolean;
  }

  interface User extends DefaultUser {
    role: string;
    isArtist?: boolean;
    isEventOrganizer?: boolean;
    permissions?: string[];
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    isArtist?: boolean;
    isEventOrganizer?: boolean;
    permissions?: string[];
    accessToken?: string;
    accessTokenRefreshedAt?: number;
    /** Set when the API token lapsed, so the stale cookie can be cleared. */
    sessionExpired?: boolean;
  }
}
