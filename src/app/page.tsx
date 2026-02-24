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
      {/* Background with slow Ken Burns drift */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.12 }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg.jpg)" }}
      />

      {/* Gradient overlay — darker at bottom for footer, warm tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/60" />

      <div className="relative z-10 min-h-svh flex flex-col items-center justify-between px-6 py-8 sm:py-10">
        {/* Spacer */}
        <div />

        {/* Center content */}
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[24px] sm:text-[30px] md:text-[34px] font-semibold tracking-[-0.02em] text-white"
          >
            Wonder Dog
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 text-[15px] sm:text-[17px] text-white"
          >
            Helping dogs live longer, healthier lives.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 w-full max-w-[360px]"
          >
            <form
              onSubmit={handleSubmit}
              className="flex"
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[46px] flex-1 min-w-0 bg-white/[0.07] backdrop-blur-sm border border-white border-r-0 px-4 text-[14px] text-white placeholder:text-white/60 focus:outline-none focus:bg-white/[0.12] transition-all duration-300"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-[46px] px-7 bg-white text-[#1a1a1a] text-[13px] font-semibold tracking-[0.01em] border border-white hover:bg-white/90 transition-all duration-300 cursor-pointer shrink-0 disabled:opacity-60"
              >
                {loading ? "..." : "Join Waitlist"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-[11px] text-white"
        >
          &copy; 2026 Wonder Dog
        </motion.footer>
      </div>
    </main>
  );
}
