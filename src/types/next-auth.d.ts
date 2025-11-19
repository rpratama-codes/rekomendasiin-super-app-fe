import type { DefaultUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AccessAndRefreshToken, User } from "@/app/auth";

declare module "next-auth" {
	interface Session
		extends DefaultUser,
			JWT,
			Partial<User>,
			Partial<AccessAndRefreshToken> {}
}
