"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
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
        body: JSON.stringify({ name, zip, email }),
      });
    } catch {
      // don't block the UX
    }
    setSubmitted(true);
  };

  return (
    <main className="relative h-svh overflow-hidden bg-black">
      {/* Desktop video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      >
        <source src="/reel-desktop.webm" type="video/webm" />
        <source src="/reel-desktop.mp4" type="video/mp4" />
      </video>
      {/* Mobile video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover md:hidden"
      >
        <source src="/reel-mobile.webm" type="video/webm" />
        <source src="/reel-mobile.mp4" type="video/mp4" />
      </video>

      {/* === DESKTOP LAYOUT === */}
      <div className="relative z-10 hidden md:flex h-full">
        {/* Frosted glass left panel */}
        <div className="relative w-[52%] h-full flex flex-col justify-between">
          {/* Glass backdrop */}
          <div className="absolute inset-0 backdrop-blur-[30px] bg-black/10" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full px-10 lg:px-14 py-10">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wd-logo.svg" alt="Wonderdog" className="h-12 w-auto" />
            </motion.div>

            {/* Headline + Form */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-[clamp(40px,5vw,72px)] leading-[1.05] tracking-[-0.02em] text-[#f5f0e8]"
              >
                We tell you what
                <br />
                your dog can&rsquo;t.
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 max-w-md"
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
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex-1 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[15px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                        />
                        <input
                          type="text"
                          placeholder="Zip Code"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          className="flex-1 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[15px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[15px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-3 h-12 w-48 rounded-xl bg-[#D9FF66] text-[#003A45] font-semibold text-[15px] cursor-pointer hover:bg-[#e5ff8a] transition-colors disabled:opacity-60"
                      >
                        {loading ? "..." : "Join Waitlist"}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.p
                      key="thanks"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-[17px] text-white"
                    >
                      Thank you! We&apos;ll be in touch very soon.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex gap-3 text-[11px] text-white/50"
            >
              <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
              <span>&copy; 2026 Wonderdog</span>
            </motion.footer>
          </div>
        </div>
      </div>

      {/* === MOBILE LAYOUT === */}
      <div className="relative z-10 flex flex-col h-full md:hidden">
        {/* Top logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="pt-7 pb-3 text-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wd-logo.svg" alt="Wonderdog" className="h-10 w-auto inline-block" />
        </motion.div>

        {/* Spacer + headline in the middle-lower area */}
        <div className="flex-1 flex flex-col justify-end px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[44px] leading-[1.05] tracking-[-0.02em] text-[#f5f0e8] text-center mb-8"
          >
            We tell you what
            <br />
            your dog can&rsquo;t.
          </motion.h1>
        </div>

        {/* Frosted glass bottom panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 backdrop-blur-[30px] bg-black/10" />
          <div className="relative z-10 px-6 pt-7 pb-8">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3"
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[15px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="flex-1 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[15px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[15px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-12 rounded-xl bg-[#D9FF66] text-[#003A45] font-semibold text-[15px] cursor-pointer hover:bg-[#e5ff8a] transition-colors disabled:opacity-60"
                  >
                    {loading ? "..." : "Join Waitlist"}
                  </button>
                </motion.form>
              ) : (
                <motion.p
                  key="thanks"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-[16px] text-white text-center py-4"
                >
                  Thank you! We&apos;ll be in touch very soon.
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-5 flex justify-center gap-4 text-[12px] text-white/50">
              <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
              <span>&copy; 2026 Wonderdog</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
