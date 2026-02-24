import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wonder Dog — Coming Soon",
  description: "Helping dogs live longer, healthier lives. Join the waitlist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
