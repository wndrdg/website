"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * Scene color timeline for the mobile video reel.
 * Each entry: [startTime in seconds, hex color for Safari status bar].
 * These should match the dominant top-of-frame color at each scene cut.
 * Tune these by watching reel-mobile.mp4 and sampling colors.
 */
const SCENE_COLORS: [number, string][] = [
  [0,    "#1a1a1a"],   // Scene 1 — dark opening
  [3.5,  "#2d4a3a"],   // Scene 2 — greenish outdoor
  [7,    "#3a2a1e"],   // Scene 3 — warm indoor / golden
  [10.5, "#1e3040"],   // Scene 4 — blue/cool tone
  [14,   "#3d2b1a"],   // Scene 5 — warm amber
  [17.5, "#1a2a1a"],   // Scene 6 — dark green / park
  [20,   "#1a1a1a"],   // Loop back to dark
];

/**
 * Hook: sync Safari status bar (theme-color meta tag) to video scene cuts.
 * Polls the mobile video's currentTime and updates the meta tag when scenes change.
 */
function useVideoThemeColor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentColorRef = useRef<string>(SCENE_COLORS[0][1]);

  const updateThemeColor = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const t = video.currentTime;
    // Find the active scene (last entry where startTime <= currentTime)
    let color = SCENE_COLORS[0][1];
    for (const [start, c] of SCENE_COLORS) {
      if (t >= start) color = c;
      else break;
    }

    if (color !== currentColorRef.current) {
      currentColorRef.current = color;
      document.documentElement.style.backgroundColor = color;
      document.body.style.backgroundColor = color;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", color);
    }
  }, []);

  useEffect(() => {
    // Poll every 200ms — fast enough for scene cuts, cheap enough to not matter
    const interval = setInterval(updateThemeColor, 200);
    return () => clearInterval(interval);
  }, [updateThemeColor]);

  return videoRef;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mobileVideoRef = useVideoThemeColor();
  const [smsConsent, setSmsConsent] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Check for invite code in URL
  useEffect(() => {
    const invite = searchParams.get('invite');
    if (invite) {
      setInviteCode(invite);
    }
  }, [searchParams]);

  // Lock body scroll while the splash is mounted (so the page feels intentional, no scrolling)
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
          invite_code: inviteCode 
        }),
      });
    } catch {
      // don't block the UX
    }
    setSubmitted(true);
  };

  return (
    <>
    {/* Full-bleed video background. Container is sized to 100vh / 100vw via inline styles
        (modern Safari treats 100vh as the largest viewport, equivalent to lvh) so we cover
        behind the iOS URL bar. Video uses the "YouTube-cover" centering pattern with
        min-width/min-height 100% so it always overflows the container and gets cropped,
        guaranteeing zero black bars regardless of aspect mismatch. */}
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-black"
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Desktop video */}
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
      {/* Mobile video — MP4 listed first so iOS Safari grabs the universally-supported
          H.264 stream instead of potentially-flaky VP9 WebM decode. */}
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
    </div>

    {/* Content layer — sized to the visible viewport (h-dvh) so it stays out of the browser UI */}
    <main className="fixed inset-0 h-dvh w-screen overflow-hidden">

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
              <img src="/wd-logo.svg" alt="Wonderdog" className="h-11 w-auto" />
            </motion.div>

            {/* Headline + Form */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif font-light text-[clamp(40px,5vw,72px)] leading-[1.05] tracking-[-0.02em] text-[#f5f0e8]"
              >
                Your dog is your
                <br />
                whole world.
                <br />
                Protect theirs.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 text-[18px] leading-[1.4] text-white/80 max-w-md"
              >
                Early disease detection through at-home blood work, powered by AI. Now in private beta.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 max-w-md"
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
                          className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                        />
                        <input
                          type="text"
                          placeholder="Zip Code"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                        />
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                        />
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={smsConsent}
                          onChange={(e) => setSmsConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded accent-[#D9FF66] flex-shrink-0"
                        />
                        <span className="text-[13px] text-white/60 leading-snug">
                          I consent to receive SMS messages from Wonderdog. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
                        </span>
                      </label>
                      {inviteCode ? (
                        <div className="mt-3 rounded-2xl border-2 border-[#005352] overflow-hidden">
                          <div className="bg-[#005352] px-4 py-2.5 flex items-center justify-center gap-2">
                            <span className="text-[12px] font-mono uppercase tracking-wider text-[#D9FF66]">Invite Code:</span>
                            <span className="text-[14px] font-mono font-bold text-white">{inviteCode}</span>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#D9FF66] text-[#003A45] font-semibold text-[15px] cursor-pointer hover:bg-[#e5ff8a] transition-colors disabled:opacity-60"
                          >
                            {loading ? "..." : "Join Friends & Family Free Pilot"}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          className="mt-3 h-12 w-48 rounded-xl bg-[#D9FF66] text-[#003A45] font-semibold text-[15px] cursor-pointer hover:bg-[#e5ff8a] transition-colors disabled:opacity-60"
                        >
                          {loading ? "..." : "Join Waitlist"}
                        </button>
                      )}
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
          <img src="/wd-logo.svg" alt="Wonderdog" className="h-9 w-auto inline-block" />
        </motion.div>

        {/* Spacer + headline in the middle-lower area */}
        <div className="flex-1 flex flex-col justify-end px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-light text-[44px] leading-[1.05] tracking-[-0.02em] text-[#f5f0e8] text-center"
          >
            Your dog is your
            <br />
            whole world.
            <br />
            Protect theirs.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 mb-6 text-[16px] leading-[1.4] text-white/80 text-center px-4"
          >
            Early disease detection through at-home blood work, powered by AI. Now in private beta.
          </motion.p>
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
                      className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="flex-1 min-w-0 h-12 rounded-xl bg-white/15 border border-white/20 px-5 text-[16px] text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors backdrop-blur-sm"
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      required
                      className="mt-0.5 h-4 w-4 rounded accent-[#D9FF66] flex-shrink-0"
                    />
                    <span className="text-[12px] text-white/60 leading-snug">
                      I consent to receive SMS messages from Wonderdog. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
                    </span>
                  </label>
                  {inviteCode ? (
                    <div className="mt-2 rounded-2xl border-2 border-[#005352] overflow-hidden">
                      <div className="bg-[#005352] px-4 py-2.5 flex items-center justify-center gap-2">
                        <span className="text-[12px] font-mono uppercase tracking-wider text-[#D9FF66]">Invite Code:</span>
                        <span className="text-[14px] font-mono font-bold text-white">{inviteCode}</span>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#D9FF66] text-[#003A45] font-semibold text-[15px] cursor-pointer hover:bg-[#e5ff8a] transition-colors disabled:opacity-60"
                      >
                        {loading ? "..." : "Join Friends & Family Free Pilot"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 h-12 rounded-xl bg-[#D9FF66] text-[#003A45] font-semibold text-[15px] cursor-pointer hover:bg-[#e5ff8a] transition-colors disabled:opacity-60"
                    >
                      {loading ? "..." : "Join Waitlist"}
                    </button>
                  )}
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
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
