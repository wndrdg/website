import { JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "vibe check",
  description: "Quick-fire screening for vibe coder applicants",
};

export default function VibeCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={mono.className} style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <style>{`
        .vibe-check-root input,
        .vibe-check-root select,
        .vibe-check-root button,
        .vibe-check-root textarea {
          font-family: inherit;
        }
      `}</style>
      <div className="vibe-check-root">
        {children}
      </div>
    </div>
  );
}
