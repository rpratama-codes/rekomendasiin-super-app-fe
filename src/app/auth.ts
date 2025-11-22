import * as jose from "jose";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const backendUrl = process.env.BE_BASE_URL;

export interface User {
  first_name: string | null;
  last_name: string | null;
  email: string;
  google_account_id?: string | null;
  id: string;
  username: string;
  verified: boolean;
  image: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AccessAndRefreshToken {
  access_token: string;
  refresh_token: string;
}

export type BackendLoginData = AccessAndRefreshToken & {
  user?: User;
};

type LoginCredential = { email: string; password: string };

type BackendLoginArgs = {
  type: "backend-login";
  credential: LoginCredential;
};

type BackendRefreshArgs = {
  type: "backend-refresh";
  token: string;
};

type GoogleLoginArgs = {
  type: "google-login";
  idToken: string;
};

type BackendAuthArgs = BackendLoginArgs | BackendRefreshArgs | GoogleLoginArgs;

type BackendAuthFunction = (
  args: BackendAuthArgs,
) => Promise<BackendLoginData | null>;

/**
 * BackendJWT represents the expected claims (payload) inside a JWT
 * issued by the resource server.
 */
type BackendJWT = { exp: number; role: string; sub: string };

/**
 * The primary function for communicating with the backend authentication endpoints.
 * It handles login, Google verification, and token refresh.
 */
export const backendAuth: BackendAuthFunction = async (args) => {
  let endpoint = backendUrl as string;
  const headers = new Headers();
  const options = {} as RequestInit;

  switch (args.type) {
    /**
     * NOTE: Ensure the response structure for 'backend-login', 'backend-refresh',
     * and 'google-login' is **identical** (containing `access_token`,
     * `refresh_token`, and the optional `user` object).
     * If structures differ, the logic in `transformToNextAuthUser` and the
     * `jwt` callback must be adjusted accordingly.
     */
    case "backend-login":
      headers.append("Content-Type", "application/json");
      endpoint += "/v1/auth/sign-in";
      options.method = "POST";
      options.headers = headers;
      options.body = JSON.stringify({
        email: args.credential.email,
        password: args.credential.password,
      });
      break;

    case "google-login":
      headers.append("Content-Type", "application/json");
      endpoint += "/v1/auth/google/verify";
      options.method = "POST";
      options.headers = headers;
      options.body = JSON.stringify({ idToken: args.idToken });
      break;

    case "backend-refresh":
      endpoint += "/v1/auth/refresh";
      options.method = "GET";
      headers.append("Authorization", `Bearer ${args.token}`);
      options.headers = headers;
      break;
  }

  const request = await fetch(endpoint, options);
  const response = (await request.json()) as {
    code: number;
    message: string;
    data: BackendLoginData;
  };

  if (!request.ok || !response.data) {
    return null;
  }

  return response.data as BackendLoginData;
};

/**
 * Transforms the authentication data received from the backend into a format
 * suitable for NextAuth.js's `user` object.
 * This includes merging user details with the access and refresh tokens.
 */
export const transformToNextAuthUser = (data: BackendLoginData) => {
  if (!data.user) return null;

  const { user, ...rest } = data;

  return {
    ...user,
    ...rest,
    name: data.user.username,
  };
};

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  trustHost: process.env.NODE_ENV === "production" ? true : undefined, // Bypass `trustHost` next production build on local.
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "backend-login",
      name: "backend-login",
      credentials: {
        email: { label: "email", type: "email", placeholder: "jhon@doe.local" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _req) {
        const data = await backendAuth({
          type: "backend-login",
          credential: credentials as LoginCredential,
        });

        if (!data) {
          return null;
        }

        return transformToNextAuthUser(data);
      },
    }),
  ],
  callbacks: {
    async signIn(_params) {
      /**
       * This callback can be bypassed. The value from `_params` is the
       * successful return result from the provider's `authorize` function.
       */
      return true;
    },
    async redirect(params) {
      /**
       * Returning `params.baseUrl` here maintains the default redirect behavior.
       */
      return params.baseUrl;
    },
    async jwt({ token, user, account, session, trigger }) {
      const jwtData: JWT &
        Partial<BackendJWT> &
        Partial<AccessAndRefreshToken> &
        User = {
        ...token,
        ...((user ?? {}) as User),
      };

      if (account && account.provider === "google") {
        const verifiedData = await backendAuth({
          type: "google-login",
          idToken: account?.id_token as string,
        });

        /**
         * Handle case where Google token verification fails on the backend.
         */
        if (!verifiedData) return null;

        /**
         * NextAuth uses the `exp` field of the JWT to determine the session's
         * lifespan. Since the access token is short-lived, we use the
         * **refresh token's** expiration (`exp`) to define the overall
         * session duration.
         *
         * The `unstable_update` function requires the new JWT to be returned
         * with updated tokens and claims (e.g., role, sub, etc.).
         */
        const refreshTokenPayload = jose.decodeJwt(
          verifiedData?.refresh_token as string,
        );

        const newUser = transformToNextAuthUser(verifiedData);

        return {
          ...jwtData,
          ...newUser,
          ...refreshTokenPayload,
          exp: Number(refreshTokenPayload.exp),
        };
      }

      if (trigger === "update") {
        /**
         * Merge new session data when `unstable_update` is called.
         * Handling refresh token from external.
         */
        return {
          ...jwtData,
          ...session,
        };
      }

      /**
       * This runs on initial sign-in (Credentials) or on subsequent requests.
       * If no refresh token exists in the token, authentication failed or the flow is incomplete.
       */
      if (!jwtData.refresh_token) {
        return null;
      }

      const refreshTokenPayload = jose.decodeJwt(jwtData.refresh_token);

      return {
        /**
         * The `jwtData` object already contains the user data and tokens.
         * We merge the refresh token's payload to ensure the `exp` claim
         * (and other core claims like `sub` and `role`) are present and current.
         */
        ...jwtData,
        ...refreshTokenPayload,
        exp: Number(refreshTokenPayload.exp),
      };
    },
    async session({ session, token }) {
      /**
       * Expose the access and refresh tokens from the resource server to the session.
       * These have been included in the `token` object within the `jwt` callback.
       *
       * WARNING: Do not use the raw `user` parameter here, as it may contain data
       * directly from the authentication server before NextAuth processing.
       *
       * NOTE: Token refreshing logic must be implemented **externally** (e.g., at the
       * fetch level via an interceptor) when the access token expires, as
       * NextAuth does not reliably handle background token refreshing in this flow.
       */
      return { ...session, ...token };
    },
  },
});
