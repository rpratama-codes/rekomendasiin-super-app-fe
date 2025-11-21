import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "./auth";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rekomendasiin",
  description: "App yang ngertiin kamu.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <SessionProvider session={session}>
        <meta name="apple-mobile-web-app-title" content="Rekomendasiin" />
        <body className={`${poppins.className} antialiased`}>{children}</body>
      </SessionProvider>
    </html>
  );
}
