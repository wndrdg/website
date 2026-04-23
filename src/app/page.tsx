"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

const fieldClass =
  "h-11 rounded-md border-white/25 bg-white/10 px-4 text-[16px] text-white placeholder:text-white/50 shadow-none transition-colors focus-visible:border-[#D9FF66] focus-visible:bg-white/15 focus-visible:ring-[#D9FF66]/30 focus-visible:ring-2 md:text-[15px]";

/**
 * Scene color timeline for the mobile video reel.
 * Each entry: [startTime in seconds, hex color for Safari status bar].
 * These should match the dominant top-of-frame color at each scene cut.
 */
const SCENE_COLORS: [number, string][] = [
  [0,    "#1a1a1a"],
  [3.5,  "#2d4a3a"],
  [7,    "#3a2a1e"],
  [10.5, "#1e3040"],
  [14,   "#3d2b1a"],
  [17.5, "#1a2a1a"],
  [20,   "#1a1a1a"],
];

function useVideoThemeColor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentColorRef = useRef<string>(SCENE_COLORS[0][1]);

  const updateThemeColor = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const t = video.currentTime;
    let color = SCENE_COLORS[0][1];
    for (const [start, c] of SCENE_COLORS) {
      if (t >= start) color = c;
      else break;
    }

    if (color !== currentColorRef.current) {
      currentColorRef.current = color;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", color);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(updateThemeColor, 200);
    return () => clearInterval(interval);
  }, [updateThemeColor]);

  return videoRef;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function HomeInner() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mobileVideoRef = useVideoThemeColor();

  // If someone lands on "/?invite=XXX", forward the code to the API but don't
  // show any invite-specific UI — the dedicated invite flow lives at /wl.
  const inviteCode = searchParams.get("invite") || null;

  const waitlistSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToWaitlist = () => {
    waitlistSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          zip,
          email,
          phone,
          smsConsent,
          invite_code: inviteCode,
        }),
      });
    } catch {
      // don't block the UX
    }
    setSubmitted(true);
  };

  return (
    <main className="relative bg-[#003A45] text-[#f5f0e8]">
      {/* ================================================================ */}
      {/*  HERO — video, logo, H1, scroll hint                             */}
      {/* ================================================================ */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        {/* Video background */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="hidden md:block"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "100%",
              minHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "cover",
            }}
          >
            <source src="/reel-desktop.webm" type="video/webm" />
            <source src="/reel-desktop.mp4" type="video/mp4" />
          </video>
          <video
            ref={mobileVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="md:hidden"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "100%",
              minHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "cover",
            }}
          >
            <source src="/reel-mobile.mp4" type="video/mp4" />
            <source src="/reel-mobile.webm" type="video/webm" />
          </video>
          {/* Gradient veil for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#003A45]/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 text-center md:px-12 md:py-14">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wd-logo.svg"
              alt="Wonderdog"
              className="h-10 w-auto md:h-11"
            />
          </motion.div>

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-light text-[clamp(40px,6vw,80px)] leading-[1.04] tracking-[-0.02em] text-[#f5f0e8]"
            >
              Your dog is your
              <br />
              whole world.
              <br />
              Protect theirs.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.5] text-white/80 md:text-[19px]"
            >
              The AI health companion for your dog &mdash; early disease
              detection through at-home blood work. By invite only.
            </motion.p>
          </div>

          <motion.button
            type="button"
            onClick={scrollToWaitlist}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="group flex flex-col items-center gap-3 text-white/70 transition-colors hover:text-white cursor-pointer"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.25em]">
              Join the waitlist
            </span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-[22px] leading-none"
              aria-hidden
            >
              ↓
            </motion.span>
          </motion.button>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  WAITLIST — mysterious, understated                              */}
      {/* ================================================================ */}
      <section
        ref={waitlistSectionRef}
        className="relative overflow-hidden bg-[#003A45] px-6 pb-24 pt-20 md:pt-28"
      >
        {/* Soft decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(217,255,102,0.08), transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,83,82,0.55), transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-xl">
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D9FF66]"
            >
              Private beta · by invitation
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 font-serif font-light text-[clamp(40px,6.5vw,80px)] leading-[1.02] tracking-[-0.02em] text-[#f5f0e8]"
            >
              Join the waitlist.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-md text-[16px] leading-[1.6] text-white/75 md:text-[17px]"
            >
              An AI health companion for dogs, built around at-home blood work
              and early disease detection.
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3.5"
                >
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`${fieldClass} flex-[2]`}
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Zip code"
                      value={zip}
                      onChange={(e) =>
                        setZip(e.target.value.replace(/\D/g, "").slice(0, 5))
                      }
                      className={`${fieldClass} flex-1 md:max-w-[140px]`}
                    />
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={fieldClass}
                    />
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className={fieldClass}
                    />
                  </div>

                  {/* Massive SMS consent — required for Twilio compliance */}
                  <label className="mt-2 flex cursor-pointer select-none items-start gap-3">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="mt-[3px] h-4 w-4 flex-shrink-0 rounded accent-[#D9FF66]"
                    />
                    <span className="text-[12px] leading-snug text-white/60">
                      I consent to receive recurring SMS text messages from
                      Wonderdog regarding appointment scheduling, appointment
                      reminders, account notifications, and customer support.
                      Message frequency varies. Msg &amp; data rates may apply. Reply STOP to
                      unsubscribe, HELP for help. See our{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white/90"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white/90"
                      >
                        Terms
                      </Link>
                      . Consent is not required to join the waitlist or use our
                      service.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 h-13 rounded-xl bg-[#D9FF66] py-3.5 text-[15px] font-semibold text-[#003A45] transition-all hover:bg-[#e5ff8a] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? "…" : "Join Waitlist"}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D9FF66]">
                    Thank you
                  </p>
                  <p className="mx-auto mt-5 max-w-md text-[17px] leading-[1.55] text-white/80">
                    We&rsquo;ll be in touch very soon.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative mx-auto mt-20 flex max-w-xl justify-center gap-5 text-[12px] text-white/45">
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/75 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/75 transition-colors"
          >
            Terms
          </Link>
          <span>&copy; 2026 Wonderdog</span>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#003A45] text-white/70">
          Loading…
        </div>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
