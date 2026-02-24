"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      // don't block the UX
    }
    setSubmitted(true);
  };

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
            className="mt-8 w-full max-w-sm"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 bg-white/10 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm rounded-md focus-visible:ring-white/30 focus-visible:border-white"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 w-full bg-white text-black font-medium rounded-md hover:bg-white/90 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? "..." : "Join Waitlist"}
                  </Button>
                </motion.form>
              ) : (
                <motion.p
                  key="thanks"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-[15px] sm:text-[17px] text-white"
                >
                  Thank you! We&apos;ll be in touch very soon.
                </motion.p>
              )}
            </AnimatePresence>
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
