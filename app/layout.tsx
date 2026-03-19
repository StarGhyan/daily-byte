import type { Metadata } from "next";
import { XpProvider } from "@/lib/xp-context";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Byte",
  description: "Bite-sized CS challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <XpProvider>
          <Header />
          <main style={{ padding: "40px 20px" }}>
            {children}
          </main>
        </XpProvider>
      </body>
    </html>
  );
}
