import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KYC Demo App",
  description: "User registration and KYC verification demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
