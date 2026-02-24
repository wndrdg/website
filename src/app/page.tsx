"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // still redirect — we don't want to block the UX
    }
    router.push("/thank-you");
  };

  return (
    <main className="relative min-h-svh overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 min-h-svh grid grid-rows-[1fr_auto] px-8 sm:px-12 md:px-16 py-10">
        <div className="flex flex-col justify-center max-w-xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-[13px] sm:text-sm font-medium tracking-[0.2em] uppercase text-white/60 mb-6"
          >
            Coming Soon
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-[18px] sm:text-[22px] md:text-[24px] font-medium tracking-[0.12em] uppercase leading-[1.1] text-white"
          >
            Wonder Dog
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-4 text-[15px] sm:text-base font-medium text-white/60 leading-relaxed max-w-sm"
          >
            Helping dogs live longer, healthier lives.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-10"
          >
            <form
              onSubmit={handleSubmit}
              className="flex gap-0 max-w-sm"
            >
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 flex-1 bg-transparent border border-white/80 border-r-0 px-4 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-6 bg-white text-black text-[13px] font-medium tracking-[0.04em] uppercase border border-white hover:bg-white/90 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
              >
                {loading ? "..." : "Join Waitlist"}
              </button>
            </form>
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-end justify-between text-[11px] tracking-[0.08em] uppercase text-white/30 pb-1"
        >
          <span>&copy; 2026 Wonder Dog</span>
        </motion.footer>
      </div>
    </main>
  );
}
