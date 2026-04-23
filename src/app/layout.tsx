import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wonderdog - AI Health Companion App",
  description: "We tell you what your dog can't. Join the waitlist.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

// Inline script that runs synchronously before the first paint, so the
// admin/CRM light theme is applied immediately on initial load. Without
// this, React hydrates, then the layout's useEffect flips the class, and
// users see a one-frame flash of the marketing dark theme first.
//
// Keep this logic in sync with the layouts that own these classes:
//   - .crm-theme       — src/app/(crm)/layout.tsx
//   - .light-override  — src/app/waitlist-codes/layout.tsx
const themeBootstrap = `(function(){try{var p=location.pathname;var h=location.host||"";if(h.indexOf("spark.")===0||/^\\/(dashboard|customers|waitlist|messages|blood-draws|vet-records|vet-review|settings)(\\/|$)/.test(p)){document.documentElement.classList.add("crm-theme");}if(/^\\/waitlist-codes(\\/|$)/.test(p)){document.documentElement.classList.add("light-override");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
