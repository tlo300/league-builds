import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider, SignInButton, Show, UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import "./globals.css";

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? "https://hub-green-beta.vercel.app";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "League Builds",
  description: "Track your League of Legends champion builds",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const allowedApps = (user.privateMetadata?.apps as string[]) ?? [];
    if (!allowedApps.includes("league-builds")) redirect(HUB_URL);
  }

  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body>
        <ClerkProvider>
          <header className="flex justify-end items-center px-6 py-3 border-b border-[#333] bg-black">
            <Show when="signed-out">
              <SignInButton>
                <button className="text-sm font-medium text-[#888] hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
