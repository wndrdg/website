"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/crm/layout/Sidebar";
import { Header } from "@/components/crm/layout/Header";
import { Toaster } from "@/components/crm/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Toggle the CRM light theme on <html> while this layout is mounted. The
  // root theme tokens otherwise come from the dark marketing theme, which
  // makes the CRM UI unreadable.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("crm-theme");
    return () => {
      root.classList.remove("crm-theme");
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">{children}</main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
