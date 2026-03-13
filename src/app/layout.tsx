import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { UserBar } from "@/components/UserBar";

export const metadata: Metadata = {
  title: "Danube Logistics",
  description: "Trucking logistics management system for billing, scheduling, and dispatch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <UserBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
