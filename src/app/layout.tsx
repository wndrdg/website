import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wonderdog — We tell you what your dog can't",
  description: "We tell you what your dog can't. Join the waitlist.",
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
