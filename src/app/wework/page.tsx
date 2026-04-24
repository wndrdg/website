"use client";

import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const fieldClass =
  "h-11 rounded-md border-white/25 bg-white/10 px-4 text-[16px] text-white placeholder:text-white/50 shadow-none transition-colors focus-visible:border-[#D9FF66] focus-visible:bg-white/15 focus-visible:ring-[#D9FF66]/30 focus-visible:ring-2 md:text-[15px]";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function WeWorkInner() {
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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
        body: JSON.stringify({
          name,
          zip,
          email,
          phone,
          smsConsent,
          invite_code: "wework",
        }),
      });
    } catch {
      // don't block the UX
    }
    setSubmitted(true);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#003A45] text-[#f5f0e8]">
      {/* Soft decorative glow — matches the homepage waitlist section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(217,255,102,0.08), transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,83,82,0.55), transparent 60%)",
        }}
      />

      <section className="relative flex min-h-[100dvh] items-center justify-center px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-10 flex justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/wd-logo.svg"
                alt="Wonderdog"
                className="h-10 w-auto md:h-11"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-light text-[clamp(40px,6.5vw,72px)] leading-[1.02] tracking-[-0.02em] text-[#f5f0e8]"
            >
              We love dogs.
              <br />
              So does WeWork.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-md text-[16px] leading-[1.6] text-white/75 md:text-[17px]"
            >
              Wonderdog and WeWork are bringing preventative health to the dogs
              of the WeWork community. Join the waitlist for exclusive early
              access.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
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

                  <div className="mt-2 flex flex-col gap-3">
                    <label className="grid cursor-pointer select-none grid-cols-[1rem_1fr] gap-3">
                      <input
                        type="checkbox"
                        checked={smsConsent}
                        onChange={(e) => setSmsConsent(e.target.checked)}
                        className="mt-[3px] h-4 w-4 flex-shrink-0 rounded accent-[#D9FF66]"
                      />
                      <span className="text-[12px] leading-snug text-white/60">
                        By checking, you are allowing to receive{" "}
                        <strong className="font-semibold text-white/80">
                          transactional/informational SMS
                        </strong>{" "}
                        communications regarding account notifications, customer
                        care, etc, from{" "}
                        <strong className="font-semibold text-white/80">
                          Wonderdog
                        </strong>
                        . Messages frequency may vary. Message and data rates
                        may apply,{" "}
                        <strong className="font-semibold text-white/80">
                          reply HELP for help or STOP to opt-out.
                        </strong>
                      </span>
                    </label>

                    <label className="grid cursor-pointer select-none grid-cols-[1rem_1fr] gap-3">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        required
                        className="mt-[3px] h-4 w-4 flex-shrink-0 rounded accent-[#D9FF66]"
                      />
                      <span className="text-[12px] leading-snug text-white/60">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white/90"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white/90"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !termsAccepted}
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

          <div className="mt-16 flex justify-center gap-5 text-[12px] text-white/45">
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/75"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/75"
            >
              Terms
            </Link>
            <span>&copy; 2026 Wonderdog</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function WeWorkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#003A45] text-white/70">
          Loading…
        </div>
      }
    >
      <WeWorkInner />
    </Suspense>
  );
}
