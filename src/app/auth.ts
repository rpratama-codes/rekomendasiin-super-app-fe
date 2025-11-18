import * as jose from "jose";
import { RedirectType, redirect } from "next/navigation";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const backendUrl = process.env.BE_BASE_URL;

export interface BackendUser {
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
  user?: BackendUser;
};

type LoginCredential = { email: string; password: string };

type GoogleLoginArgs = {
  type: "google-login";
  idToken: string;
};

type BackendLoginArgs = {
  type: "backend-login";
  credential: LoginCredential;
};

type BackendAuthArgs = GoogleLoginArgs | BackendLoginArgs;

type BackendAuthFunction = (
  args: BackendAuthArgs,
) => Promise<BackendLoginData | null>;

type BackendJWT = { exp: number; role: string; sub: string };

const backendAuth: BackendAuthFunction = async (args) => {
  let endpoint = backendUrl as string;
  const payload = {} as Record<string, string>;

  switch (args.type) {
    /**
     * Just make sure later the response of `backend-login` and
     * `google-login` are the same!, or you will adjust the payload.
     */
    case "backend-login":
      endpoint += "/v1/auth/sign-in";
      payload.email = args.credential.email;
      payload.password = args.credential.password;
      break;

    case "google-login":
      endpoint += "/v1/auth/google/verify";
      payload.idToken = args.idToken;
      break;
  }

  console.log("endpint", endpoint);

  const request = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });

  const response = (await request.json()) as {
    code: number;
    message: string;
    data: BackendLoginData;
  };

  console.log(request);

  if (String(request.status).startsWith("4")) {
    return null;
  }

  const data = response.data;

  if (!data) {
    return null;
  }

  return data as BackendLoginData;
};

const refreshToken = async (
  refreshToken: string,
): Promise<AccessAndRefreshToken | null> => {
  const request = await fetch("/v1/auth/refresh", {
    headers: {
      authorization: `Bearer ${refreshToken}`,
    },
  });

  const response = (await request.json()) as {
    code: number;
    message: string;
    data: AccessAndRefreshToken;
  };

  if (String(request.status).startsWith("4")) {
    return null;
  }

  const data = response.data;

  if (!data) {
    return null;
  }

  return {
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
      name: "backend-login",
      credentials: {
        email: { label: "email", type: "email", placeholder: "jsmith" },
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

        const user = {
          ...data.user,
          name: data.user?.username,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn(_params) {
      /**
       * Let by pass here!
       * The value from _params is a return result from provider.
       */
      return true;
    },
    async redirect(params) {
      /**
       * Also same, left as is.
       * Here just redirect value.
       */
      return params.baseUrl;
    },
    async jwt({ token, user, account }) {
      /**
       * We want fill the payload data of jwt inside the cookie with our preference!.
       * and if user `null` or `undefined` it mean it from cookie!.
       */
      const userData = (user ? user : {}) as BackendUser;

      let jwtData: JWT &
        Partial<BackendJWT> &
        Partial<AccessAndRefreshToken> &
        BackendUser = {
        ...token,
        ...userData,
      };

      if (account && account.provider === "google") {
        const verifiedData = await backendAuth({
          type: "google-login",
          idToken: account?.id_token as string,
        });

        /**
         * To handle if something wrong!.
         */
        if (!verifiedData) return redirect("/auth/signout", RedirectType.push);

        /**
         * Because AuthJS will thread any of auth as session base auth,
         * Just add an expired date from the refresh token,
         * since the access token only has a short life time,
         * then we will make a refresh token logic later,
         * and it will include any payload like role, sub, etc!.
         */
        const refreshTokenPayload = jose.decodeJwt(
          verifiedData?.refresh_token as string,
        );

        jwtData = {
          ...jwtData,
          ...verifiedData?.user,
          ...refreshTokenPayload,
          access_token: verifiedData.access_token,
          refresh_token: verifiedData.refresh_token,
          /**
           * Adjusting the exp date to match frontend format!.
           */
          exp: Math.ceil(Number(refreshTokenPayload.exp) / 1000),
        };
      }

      if (jwtData.access_token && jwtData.refresh_token) {
        const accessPayload = jose.decodeJwt(jwtData.access_token);
        const isExp = Date.now() / 1000 > Number(accessPayload.exp);

        if (isExp) {
          const refresh = await refreshToken(jwtData.refresh_token);
          const refreshPayload = jose.decodeJwt(jwtData.access_token);

          if (!refresh) return redirect("/api/auth/signin", RedirectType.push);

          jwtData = {
            ...jwtData,
            access_token: refresh.access_token,
            refresh_token: refresh.refresh_token,
            /**
             * Adjusting the exp date to match frontend format!.
             */
            exp: Math.ceil(Number(refreshPayload.exp) / 1000),
          };
        }
      }

      return jwtData;
    },
    async session({ session, token }) {
      /**
       * Expose access and refresh token from resource server to the session that has been included to `token`!.
       * Don't use user from parameter, it may contain raw data from auth server!.
       * And unfortunately we can't do refresh token, here. we will do at fetch level.
       */
      return { ...session, ...token };
    },
  },
});
