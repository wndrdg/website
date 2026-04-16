"use client";

import { useEffect } from "react";

export default function WaitlistCodesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("light-override");
    return () => {
      root.classList.remove("light-override");
    };
  }, []);

  return (
    <>
      <style>{`
        .light-override,
        .light-override [data-radix-portal] {
          --background: oklch(1 0 0);
          --foreground: oklch(0.145 0 0);
          --card: oklch(1 0 0);
          --card-foreground: oklch(0.145 0 0);
          --popover: oklch(1 0 0);
          --popover-foreground: oklch(0.145 0 0);
          --primary: oklch(0.205 0 0);
          --primary-foreground: oklch(0.985 0 0);
          --secondary: oklch(0.965 0 0);
          --secondary-foreground: oklch(0.205 0 0);
          --muted: oklch(0.965 0 0);
          --muted-foreground: oklch(0.45 0 0);
          --accent: oklch(0.965 0 0);
          --accent-foreground: oklch(0.205 0 0);
          --destructive: oklch(0.577 0.245 27.325);
          --border: oklch(0.922 0 0);
          --input: oklch(0.922 0 0);
          --ring: oklch(0.708 0 0);
        }
        .light-override body {
          background-color: #fff;
        }
      `}</style>
      {children}
    </>
  );
}
