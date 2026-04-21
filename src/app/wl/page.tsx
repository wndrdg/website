"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type ContactPreference = "call" | "text" | "email";

interface Dog {
  name: string;
  breed: string;
  weight: string;
  age: string;
}

const emptyDog = (): Dog => ({ name: "", breed: "", weight: "", age: "" });

/* -------------------------------------------------------------------------- */
/*  Google Places loader                                                      */
/* -------------------------------------------------------------------------- */

// Lazily load the Google Maps JS with Places library. Returns true once ready.
// If no key is configured we resolve false and the caller falls back to a
// plain text input — the form still works, it just loses autocomplete.
function useGooglePlaces() {
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") return false;
    const w = window as unknown as {
      google?: { maps?: { places?: unknown } };
    };
    return !!w.google?.maps?.places;
  });

  useEffect(() => {
    if (ready) return;
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!key) return;

    const w = window as unknown as {
      google?: { maps?: { places?: unknown } };
      __wdPlacesLoading?: Promise<void>;
    };

    if (!w.__wdPlacesLoading) {
      w.__wdPlacesLoading = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
      });
    }

    w.__wdPlacesLoading
      .then(() => setReady(true))
      .catch(() => {
        /* key missing or blocked — fall back to plain input */
      });
  }, [ready]);

  return ready;
}

/* -------------------------------------------------------------------------- */
/*  Address input with Google Places autocomplete                             */
/* -------------------------------------------------------------------------- */

function AddressInput({
  value,
  onChange,
  placeholder = "Street address",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ready = useGooglePlaces();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acRef = useRef<unknown>(null);

  useEffect(() => {
    if (!ready || !inputRef.current) return;
    const w = window as unknown as {
      google: {
        maps: {
          places: {
            Autocomplete: new (
              input: HTMLInputElement,
              opts: Record<string, unknown>,
            ) => {
              addListener: (
                ev: string,
                cb: () => void,
              ) => { remove: () => void };
              getPlace: () => { formatted_address?: string };
            };
          };
        };
      };
    };

    const ac = new w.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["formatted_address"],
    });
    acRef.current = ac;

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place?.formatted_address) onChange(place.formatted_address);
    });

    return () => {
      listener.remove();
    };
    // We intentionally only wire the autocomplete once it becomes ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <input
      ref={inputRef}
      type="text"
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 rounded-xl bg-white/10 border border-white/25 px-5 text-[16px] text-white placeholder:text-white/50 outline-none focus:border-[#D9FF66]/70 focus:bg-white/15 transition-colors"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function WaitlistInviteInner() {
  const searchParams = useSearchParams();
  const inviteCode = (searchParams.get("invite") || "").toUpperCase();

  const [codeDescription, setCodeDescription] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState<boolean>(Boolean(inviteCode));
  const [codeValid, setCodeValid] = useState<boolean | null>(
    inviteCode ? null : false,
  );

  // Form state
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dogCount, setDogCount] = useState<number>(1);
  const [dogs, setDogs] = useState<Dog[]>([emptyDog()]);
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>("text");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Scroll refs
  const inviteSectionRef = useRef<HTMLDivElement | null>(null);
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  /* ---- Fetch invite code description ---- */
  useEffect(() => {
    if (!inviteCode) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/codes/lookup/${inviteCode}`);
        if (!res.ok) {
          if (!cancelled) {
            setCodeValid(false);
            setCodeLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setCodeDescription(data.description || "");
          setCodeValid(true);
          setCodeLoading(false);
        }
      } catch {
        if (!cancelled) {
          setCodeValid(false);
          setCodeLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  const chooseDogCount = (n: number) => {
    setDogCount(n);
    setDogs((prev) => {
      if (prev.length === n) return prev;
      if (prev.length < n) {
        return [...prev, ...Array.from({ length: n - prev.length }, emptyDog)];
      }
      return prev.slice(0, n);
    });
  };

  /* ---- Helpers ---- */
  const step1Valid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.replace(/\D/g, "").length === 10 &&
    address.trim().length > 0 &&
    dogCount >= 1;

  const updateDog = useCallback(
    (i: number, patch: Partial<Dog>) => {
      setDogs((prev) =>
        prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
      );
    },
    [],
  );

  const handleContinue = () => {
    if (!step1Valid) return;
    setStep(2);
    // Smooth-scroll form into view on the taller layout
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          invite_code: inviteCode || undefined,
          dogs,
          contactPreference,
          smsConsent: contactPreference === "text",
        }),
      });
    } catch {
      // don't block
    }
    setSubmitted(true);
  };

  const scrollToInvite = () => {
    inviteSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* -------------------------------------------------------------------- */
  /*  Render                                                              */
  /* -------------------------------------------------------------------- */

  return (
    <main className="relative bg-[#003A45] text-[#f5f0e8]">
      {/* ================================================================ */}
      {/*  HERO — video, logo, H1/H2, scroll hint                          */}
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
          {/* Gradient veil for legibility — no glass panel */}
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
              Early disease detection through at-home blood work. Now in private
              beta in LA &amp; NYC.
            </motion.p>
          </div>

          <motion.button
            type="button"
            onClick={scrollToInvite}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="group flex flex-col items-center gap-3 text-white/70 transition-colors hover:text-white cursor-pointer"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.25em]">
              Your invitation awaits
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
      {/*  INVITE REVEAL — dark teal, elegant evite feel                   */}
      {/* ================================================================ */}
      <section
        ref={inviteSectionRef}
        className="relative overflow-hidden bg-[#003A45] px-6 pb-10 pt-20 md:pb-14 md:pt-28"
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

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Small preamble */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D9FF66]"
          >
            {codeLoading
              ? "Verifying invite…"
              : codeValid
              ? "Invite code accepted"
              : "Private preview"}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 font-serif font-light text-[clamp(44px,7vw,96px)] leading-[1.02] tracking-[-0.02em] text-[#f5f0e8]"
          >
            You&rsquo;re invited.
          </motion.h2>

          {/* Golden ticket — invite code stub + description */}
          {codeValid && codeDescription ? (
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -8, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, rotate: -2.5, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12"
            >
              <GoldenTicket code={inviteCode} description={codeDescription} />
            </motion.div>
          ) : null}

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mx-auto my-12 h-px w-24 origin-center bg-white/25"
          />

          {/* Pilot description */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl space-y-6 text-[17px] leading-[1.65] text-white/85 md:text-[18px]"
          >
            <p className="font-serif text-[clamp(24px,3vw,34px)] font-light leading-[1.2] tracking-[-0.01em] text-[#f5f0e8]">
              Our private friends &amp; family pilot in Los Angeles &amp; New
              York City.
            </p>

            <p>
              We&rsquo;re excited to have you alongside us as we launch our AI
              health companion app for dogs — partnering with the nation&rsquo;s
              most advanced reference lab and local vet techs, all overseen by
              some of the most accomplished veterinary pathologists in the
              world.
            </p>

            <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left md:p-8">
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D9FF66]">
                What&rsquo;s included
              </p>
              <ul className="mt-4 space-y-3 text-[15.5px] text-white/85">
                <li className="flex gap-3">
                  <span className="mt-[9px] inline-block h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#D9FF66]" />
                  <span>
                    One complimentary at-home advanced diagnostic blood panel,
                    drawn by a qualified registered vet tech and assistant
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] inline-block h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#D9FF66]" />
                  <span>Early access to the Wonderdog app and its features</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] inline-block h-[5px] w-[5px] flex-shrink-0 rounded-full bg-[#D9FF66]" />
                  <span>
                    A direct line to our team — your feedback shapes what we
                    build next
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex items-start gap-3 border-t border-white/10 pt-5">
                <span className="mt-1 text-[11px] font-mono uppercase tracking-[0.2em] text-white/50">
                  Value
                </span>
                <p className="text-[14px] leading-snug text-white/70">
                  Roughly <span className="text-[#D9FF66]">$500</span> of
                  legitimate veterinary diagnostics you can bring to your vet on
                  your next visit — and insights that can meaningfully inform
                  your dog&rsquo;s health picture.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================================================================ */}
      {/*  FORM SECTION — continuous with the invite reveal above          */}
      {/* ================================================================ */}
      <section
        ref={formSectionRef}
        className="relative bg-[#003A45] px-6 pb-24 pt-6"
      >
        <div className="mx-auto max-w-xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D9FF66]">
                  RSVP Received
                </p>
                <h3 className="mt-4 font-serif text-[clamp(34px,5vw,52px)] font-light leading-[1.1] text-[#f5f0e8]">
                  Thank you.
                </h3>
                <p className="mx-auto mt-5 max-w-md text-[16px] leading-[1.55] text-white/75">
                  We&rsquo;ll be in touch shortly to coordinate your at-home
                  blood draw and get you set up in the app. Welcome to the pack.
                </p>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <StepHeader index={1} total={2} title="About you" />

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleContinue();
                  }}
                  className="mt-8 flex flex-col gap-3.5"
                >
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/25 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15"
                  />
                  <div className="flex flex-col gap-3.5 md:flex-row">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="h-12 w-full rounded-xl border border-white/25 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border border-white/25 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15"
                    />
                  </div>

                  <AddressInput
                    value={address}
                    onChange={setAddress}
                    placeholder="Home address (where we&rsquo;ll meet you)"
                  />

                  {/* Dog count selector */}
                  <div className="mt-5">
                    <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.25em] text-white/60">
                      How many dogs live with you?
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((n) => {
                        const label = n === 3 ? "3+" : String(n);
                        const active = dogCount === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => chooseDogCount(n)}
                            className={`flex-1 rounded-xl border px-4 py-3 text-[15px] font-medium transition-all cursor-pointer ${
                              active
                                ? "border-[#D9FF66] bg-[#D9FF66]/15 text-[#D9FF66]"
                                : "border-white/20 bg-white/5 text-white/80 hover:border-white/35 hover:bg-white/10"
                            }`}
                          >
                            <span className="block text-[18px] font-serif">
                              {label}
                            </span>
                            <span className="mt-0.5 block text-[10px] font-mono uppercase tracking-[0.2em] opacity-70">
                              {n === 1 ? "dog" : "dogs"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!step1Valid}
                    className="mt-6 h-13 rounded-xl bg-[#D9FF66] py-3.5 text-[15px] font-semibold text-[#003A45] transition-all hover:bg-[#e5ff8a] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    Continue &rarr;
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <StepHeader
                  index={2}
                  total={2}
                  title={dogCount === 1 ? "About your dog" : "About your dogs"}
                  onBack={() => setStep(1)}
                />

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
                  {dogs.map((dog, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
                    >
                      <p className="mb-4 text-[11px] font-mono uppercase tracking-[0.25em] text-[#D9FF66]">
                        {dogs.length === 1 ? "Your dog" : `Dog ${i + 1}`}
                      </p>
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={dog.name}
                          onChange={(e) =>
                            updateDog(i, { name: e.target.value })
                          }
                          className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15"
                        />
                        <input
                          type="text"
                          placeholder="Breed"
                          value={dog.breed}
                          onChange={(e) =>
                            updateDog(i, { breed: e.target.value })
                          }
                          className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15"
                        />
                        <div className="flex gap-3">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Weight (lbs)"
                            value={dog.weight}
                            onChange={(e) =>
                              updateDog(i, { weight: e.target.value })
                            }
                            className="h-12 w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15"
                          />
                          <input
                            type="text"
                            placeholder="Age (years)"
                            value={dog.age}
                            onChange={(e) =>
                              updateDog(i, { age: e.target.value })
                            }
                            className="h-12 w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Contact preference */}
                  <div className="mt-1">
                    <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.25em] text-white/60">
                      Preferred way to reach you
                    </p>
                    <div className="flex gap-2">
                      {(
                        [
                          { key: "call", label: "Call me" },
                          { key: "text", label: "Text me" },
                          { key: "email", label: "Email me" },
                        ] as { key: ContactPreference; label: string }[]
                      ).map(({ key, label }) => {
                        const active = contactPreference === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setContactPreference(key)}
                            className={`flex-1 rounded-xl border px-3 py-3 text-[14px] font-medium transition-all cursor-pointer ${
                              active
                                ? "border-[#D9FF66] bg-[#D9FF66]/15 text-[#D9FF66]"
                                : "border-white/20 bg-white/5 text-white/80 hover:border-white/35 hover:bg-white/10"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    {contactPreference === "text" ? (
                      <p className="mt-3 text-[11px] leading-snug text-white/50">
                        By choosing text, you agree to receive SMS from
                        Wonderdog about your appointment, results, and account.
                        Msg &amp; data rates may apply. Reply STOP to
                        unsubscribe. See our{" "}
                        <Link
                          href="/privacy"
                          className="underline hover:text-white/80"
                        >
                          Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/terms"
                          className="underline hover:text-white/80"
                        >
                          Terms
                        </Link>
                        .
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 h-13 rounded-xl bg-[#D9FF66] py-3.5 text-[15px] font-semibold text-[#003A45] transition-all hover:bg-[#e5ff8a] disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? "Sending…" : "Accept Invitation"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mx-auto mt-20 flex max-w-xl justify-center gap-5 text-[12px] text-white/45">
          <Link href="/privacy" className="hover:text-white/75 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white/75 transition-colors">
            Terms
          </Link>
          <span>&copy; 2026 Wonderdog</span>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Golden Ticket                                                             */
/* -------------------------------------------------------------------------- */

function GoldenTicket({
  code,
  description,
}: {
  code: string;
  description: string;
}) {
  // Vector geometry — all content overlays onto this path at matching %.
  const W = 480;
  const H = 180;
  const CORNER_R = 22;
  const STUB_X = 128;
  const NOTCH_R = 13;

  // Outer ticket path, traced clockwise. The two notch arcs use sweep=0
  // so they curve INTO the ticket from the top and bottom edges — i.e.
  // actual concave cutouts. Everything outside this path is transparent.
  const ticketPath = `M ${CORNER_R} 0
    H ${STUB_X - NOTCH_R}
    A ${NOTCH_R} ${NOTCH_R} 0 0 0 ${STUB_X + NOTCH_R} 0
    H ${W - CORNER_R}
    A ${CORNER_R} ${CORNER_R} 0 0 1 ${W} ${CORNER_R}
    V ${H - CORNER_R}
    A ${CORNER_R} ${CORNER_R} 0 0 1 ${W - CORNER_R} ${H}
    H ${STUB_X + NOTCH_R}
    A ${NOTCH_R} ${NOTCH_R} 0 0 0 ${STUB_X - NOTCH_R} ${H}
    H ${CORNER_R}
    A ${CORNER_R} ${CORNER_R} 0 0 1 0 ${H - CORNER_R}
    V ${CORNER_R}
    A ${CORNER_R} ${CORNER_R} 0 0 1 ${CORNER_R} 0
    Z`;

  const stubPct = (STUB_X / W) * 100;

  return (
    <div
      className="relative mx-auto inline-block w-full max-w-[480px]"
      style={{ containerType: "inline-size" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        style={{
          filter:
            "drop-shadow(0 18px 32px rgba(217,255,102,0.3)) drop-shadow(0 6px 14px rgba(0,0,0,0.28))",
        }}
      >
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EDFFA8" />
            <stop offset="0.35" stopColor="#D9FF66" />
            <stop offset="0.72" stopColor="#B6E53A" />
            <stop offset="1" stopColor="#D9FF66" />
          </linearGradient>
          <radialGradient id="tlHighlight" cx="8%" cy="0%" r="70%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="brShade" cx="92%" cy="100%" r="70%">
            <stop offset="0" stopColor="#003A45" stopOpacity="0.22" />
            <stop offset="0.6" stopColor="#003A45" stopOpacity="0" />
          </radialGradient>
          <clipPath id="ticketClip">
            <path d={ticketPath} />
          </clipPath>
        </defs>

        <g clipPath="url(#ticketClip)">
          {/* Base gradient */}
          <path d={ticketPath} fill="url(#tg)" />
          {/* Sheen highlights */}
          <rect width={W} height={H} fill="url(#tlHighlight)" />
          <rect width={W} height={H} fill="url(#brShade)" />
          {/* Top edge highlight / bottom shade */}
          <rect width={W} height="1.5" fill="#ffffff" fillOpacity="0.65" />
          <rect
            y={H - 2}
            width={W}
            height="2"
            fill="#003A45"
            fillOpacity="0.14"
          />
          {/* Animated shimmer sweep, clipped to the ticket shape */}
          <rect
            x="-160"
            y="0"
            width="160"
            height={H}
            fill="#ffffff"
            fillOpacity="0.35"
            style={{
              mixBlendMode: "overlay",
              transform: "skewX(-18deg)",
              transformOrigin: "center",
              animation: "wdTicketShine 6s ease-in-out infinite",
            }}
          />
        </g>

        {/* Perforation dashed line */}
        <line
          x1={STUB_X}
          y1={NOTCH_R + 8}
          x2={STUB_X}
          y2={H - NOTCH_R - 8}
          stroke="#003A45"
          strokeOpacity="0.4"
          strokeWidth="2.4"
          strokeDasharray="5 5"
          strokeLinecap="round"
        />
      </svg>

      {/* Content overlay — sits absolutely over the SVG. Font sizes in
          cqw so they scale with the ticket's container width. */}
      <div className="pointer-events-none absolute inset-0 flex">
        <div
          className="flex flex-col items-center justify-center"
          style={{ width: `${stubPct}%` }}
        >
          <span
            className="font-mono uppercase tracking-[0.3em] text-[#003A45]/70"
            style={{ fontSize: "clamp(7.5px, 1.85cqw, 10px)" }}
          >
            Invite Code
          </span>
          <span
            className="mt-[0.55em] font-mono font-bold leading-none tracking-[0.12em] text-[#003A45]"
            style={{ fontSize: "clamp(22px, 6.2cqw, 34px)" }}
          >
            {code}
          </span>
          <span
            className="mt-[0.7em] font-mono uppercase tracking-[0.35em] text-[#003A45]/55"
            style={{ fontSize: "clamp(6.5px, 1.55cqw, 9px)" }}
          >
            Admit One
          </span>
        </div>
        <div
          className="flex flex-1 flex-col justify-center text-left"
          style={{
            paddingLeft: "clamp(0.75rem, 3cqw, 1.75rem)",
            paddingRight: "clamp(1rem, 4cqw, 2rem)",
          }}
        >
          <span
            className="font-mono uppercase tracking-[0.3em] text-[#003A45]/70"
            style={{ fontSize: "clamp(7.5px, 1.85cqw, 10px)" }}
          >
            VIP Guest List
          </span>
          <p
            className="mt-[0.3em] font-serif font-semibold leading-[1.15] tracking-[-0.01em] text-[#003A45]"
            style={{ fontSize: "clamp(17px, 5cqw, 26px)" }}
          >
            {description}
          </p>
          <div className="mt-[0.55em] flex items-center gap-1.5 text-[#003A45]/50">
            <span style={{ fontSize: "clamp(7px, 1.5cqw, 10px)" }}>★</span>
            <span className="h-px flex-1 bg-[#003A45]/25" />
            <span style={{ fontSize: "clamp(7px, 1.5cqw, 10px)" }}>★</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wdTicketShine {
          0% { transform: translateX(-40px) skewX(-18deg); }
          55% { transform: translateX(640px) skewX(-18deg); }
          100% { transform: translateX(640px) skewX(-18deg); }
        }
      `}</style>
    </div>
  );
}

function StepHeader({
  index,
  total,
  title,
  onBack,
}: {
  index: number;
  total: number;
  title: string;
  onBack?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D9FF66]">
          Step {index} of {total}
        </p>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-white/60 underline underline-offset-4 transition-colors hover:text-white cursor-pointer"
          >
            Back
          </button>
        ) : null}
      </div>
      <h3 className="mt-3 font-serif text-[clamp(32px,4.5vw,46px)] font-light leading-[1.1] tracking-[-0.01em] text-[#f5f0e8]">
        {title}
      </h3>
      <div className="mt-5 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full ${
              i < index ? "bg-[#D9FF66]" : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function WaitlistInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#003A45] text-white/70">
          Loading…
        </div>
      }
    >
      <WaitlistInviteInner />
    </Suspense>
  );
}
