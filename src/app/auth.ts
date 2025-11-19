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

  type BackendLoginData = AccessAndRefreshToken & {
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

  type BackendJWT = { exp: number; role: string; sub: string };

  const backendAuth: BackendAuthFunction = async (args) => {
    let endpoint = backendUrl as string;
    const headers = new Headers();
    const options = {} as RequestInit;

    switch (args.type) {
      /**
       * Ensure the response structure for `backend-login`, `backend-refresh`,
       * and `google-login` are identical, or be prepared to adjust the payload accordingly.
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

  const transformToNextAuthUser = (data: BackendLoginData) => {
    if (!data.user) return null;
    return {
      ...data.user,
      name: data.user.username,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  };

  export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      Credentials({
        id: "backend-refresh",
        name: "backend-refresh",
        credentials: {
          refreshToken: {
            label: "refresh token",
            type: "text",
            placeholder: "ey...",
          },
        },
        async authorize(credentials, _req) {
          const data = await backendAuth({
            type: "backend-refresh",
            token: credentials.refreshToken as string,
          });

          if (!data) {
            return null;
          }

          return transformToNextAuthUser(data);
        },
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

          /**
           * Here adjust payload to be identical with authjs Default User type.
           */
          return transformToNextAuthUser(data);
        },
      }),
    ],
    callbacks: {
      async signIn(_params) {
        /**
         * Let bypass here, The value from _params is a return result from provider.
         */
        return true;
      },
      async redirect(params) {
        /**
         * Also same, left it as is.
         */
        return params.baseUrl;
      },
      async jwt({ token, user, account }) {
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
           * To handle if something wrong!.
           */
          if (!verifiedData) return null;
          /**
           * Because AuthJS treats any authentication as session-based,
           * we should set the session expiration date using the **refresh token's** expiry time.
           * The **access token** has a short lifespan, so we will implement
           * the refresh token logic later, which must ensure the inclusion of all
           * required payloads (e.g., role, sub, etc.).
           */
          const refreshTokenPayload = jose.decodeJwt(
            verifiedData?.refresh_token as string,
          );

          return {
            ...jwtData,
            ...verifiedData?.user,
            ...refreshTokenPayload,
            access_token: verifiedData.access_token,
            refresh_token: verifiedData.refresh_token,
            exp: Number(refreshTokenPayload.exp),
          };
        }

        if (jwtData.access_token && jwtData.refresh_token) {
          /**
           * Still figure out why this refresh token is not work.
           * It's running but not really make a change.
           */
          const accessTokenPayload = jose.decodeJwt(jwtData.access_token)
          const currentDate = Math.floor(Date.now() / 1000)
          const expiredDate = accessTokenPayload.exp as number
          const isExp = currentDate > expiredDate

          console.log('Is Expired :', isExp)

          if (isExp) {
            const refreshAuth = await backendAuth({
              type: "backend-refresh",
              token: jwtData.refresh_token as string,
            });

            if (!refreshAuth) return null;

            const refreshTokenPayload = jose.decodeJwt(
              refreshAuth?.refresh_token as string,
            );

            return {
              ...jwtData,
              ...refreshAuth?.user,
              ...refreshTokenPayload,
              access_token: refreshAuth.access_token,
              refresh_token: refreshAuth.refresh_token,
              exp: Number(refreshTokenPayload.exp),
            };
          }
        }

        if (!jwtData.refresh_token) {
          return null;
        }

        const refreshTokenPayload = jose.decodeJwt(jwtData.refresh_token);

        return {
          /**
           * The access and refresh tokens already include the `jwtData` object
           * within the `user` or `token` structure, depending on the source (login or cookie).
           */
          ...jwtData,
          ...refreshTokenPayload,
          exp: Number(refreshTokenPayload.exp),
        };
      },
      async session({ session, token }) {
        /**
         * Expose the access and refresh tokens from the resource server to the session.
         * They have been included in the `token` object.
         * * WARNING: Do not use the `user` parameter, as it may contain raw data directly from the authentication server.
         * * NOTE: Unfortunately, we cannot handle token refreshing here or within the JWT process (attempts have been made).
         * We will implement token refreshing at the fetch level instead.
         */
        return { ...session, ...token };
      },
    },
  });
