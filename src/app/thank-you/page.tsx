"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  return (
    <main className="relative min-h-svh overflow-hidden">
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.12 }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg.jpg)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/60" />

      <div className="relative z-10 min-h-svh flex flex-col items-center justify-between px-6 py-8 sm:py-10">
        <div />

        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[24px] sm:text-[30px] md:text-[34px] font-semibold tracking-[-0.02em] text-white"
          >
            Thank you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 text-[15px] sm:text-[17px] text-white"
          >
            We&apos;ll be in touch very soon.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <Button
              asChild
              variant="outline"
              className="h-10 px-6 bg-white/10 border-white/30 text-white rounded-md hover:bg-white/20 cursor-pointer"
            >
              <Link href="/">Back</Link>
            </Button>
          </motion.div>
        </div>

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
