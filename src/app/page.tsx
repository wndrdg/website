"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <main className="relative min-h-svh overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Grid layout */}
      <div className="relative z-10 min-h-svh grid grid-rows-[1fr_auto] px-8 sm:px-12 md:px-16 py-10">
        {/* Main content — left aligned, vertically centered */}
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
            className="text-[28px] sm:text-[36px] md:text-[42px] font-medium tracking-[-0.02em] leading-[1.1] text-white"
          >
            Wonder Dog
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-4 text-[15px] sm:text-base text-white/60 leading-relaxed max-w-sm"
          >
            Helping dogs live longer, healthier lives.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-10"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="flex gap-0 max-w-sm"
                >
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 flex-1 bg-white/[0.08] border border-white/[0.12] border-r-0 px-4 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:bg-white/[0.12] transition-colors"
                  />
                  <button
                    type="submit"
                    className="h-11 px-6 bg-white text-black text-[13px] font-medium tracking-[0.04em] uppercase hover:bg-white/90 transition-colors cursor-pointer shrink-0"
                  >
                    Join Waitlist
                  </button>
                </motion.form>
              ) : (
                <motion.p
                  key="thanks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-[14px] text-white/60"
                >
                  Thank you. We&apos;ll be in touch.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
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
