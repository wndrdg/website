"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ThankYou() {
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
            Wonder Dog
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-[28px] sm:text-[36px] md:text-[42px] font-medium tracking-[-0.02em] leading-[1.1] text-white"
          >
            Thank you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-5 text-[15px] sm:text-base font-medium text-white/60 leading-relaxed max-w-sm"
          >
            We&apos;ll be in touch very soon.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-10"
          >
            <Link
              href="/"
              className="inline-block h-11 leading-[44px] px-6 border border-white/80 text-white text-[13px] font-medium tracking-[0.04em] uppercase hover:bg-white/10 transition-colors"
            >
              Back
            </Link>
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
