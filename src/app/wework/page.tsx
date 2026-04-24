"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
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

const inputClass =
  "h-11 w-full rounded-xl border border-white/25 bg-white/10 px-5 text-[16px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-[#D9FF66]/70 focus:bg-white/15";

/* -------------------------------------------------------------------------- */
/*  Google Places loader                                                      */
/* -------------------------------------------------------------------------- */

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

type ParsedAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

type PlaceResult = {
  formatted_address?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
};

function parsePlace(place: PlaceResult): ParsedAddress {
  const comps = place.address_components || [];
  const find = (t: string, short = false) => {
    const c = comps.find((x) => x.types.includes(t));
    return c ? (short ? c.short_name : c.long_name) : "";
  };
  const streetNumber = find("street_number");
  const route = find("route");
  const city =
    find("locality") ||
    find("sublocality") ||
    find("sublocality_level_1") ||
    find("postal_town") ||
    find("administrative_area_level_3");
  const state = find("administrative_area_level_1", true);
  const zip = find("postal_code");
  return {
    street: [streetNumber, route].filter(Boolean).join(" "),
    city,
    state,
    zip,
  };
}

function AddressAutocomplete({
  query,
  onQueryChange,
  onPlaceSelected,
  placeholder = "Start typing your address",
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onPlaceSelected: (parsed: ParsedAddress) => void;
  placeholder?: string;
}) {
  const ready = useGooglePlaces();
  const inputRef = useRef<HTMLInputElement | null>(null);

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
              getPlace: () => PlaceResult;
            };
          };
        };
      };
    };

    const ac = new w.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "address_components"],
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const parsed = parsePlace(place);
      if (inputRef.current && parsed.street) {
        inputRef.current.value = parsed.street;
      }
      onQueryChange(parsed.street || place?.formatted_address || "");
      onPlaceSelected(parsed);
    });

    return () => {
      listener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <input
      ref={inputRef}
      type="text"
      autoComplete="new-password"
      name="wd-address-search"
      data-form-type="other"
      placeholder={placeholder}
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      className={inputClass}
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

function WeWorkInner() {
  // Form state
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSelected, setAddressSelected] = useState(false);
  const [street, setStreet] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [dogCount, setDogCount] = useState<number>(1);
  const [dogs, setDogs] = useState<Dog[]>([emptyDog()]);
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>("text");

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formSectionRef = useRef<HTMLDivElement | null>(null);

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

  const step1Valid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.replace(/\D/g, "").length === 10 &&
    street.trim().length > 0 &&
    city.trim().length > 0 &&
    stateCode.trim().length > 0 &&
    zip.trim().length > 0 &&
    dogCount >= 1;

  const updateDog = useCallback((i: number, patch: Partial<Dog>) => {
    setDogs((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    );
  }, []);

  const handleContinue = () => {
    if (!step1Valid) return;
    setStep(2);
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const formattedAddress = [
      [street, apt].filter(Boolean).join(" "),
      city,
      [stateCode, zip].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");

    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address: formattedAddress,
          addressParts: { street, apt, city, state: stateCode, zip },
          invite_code: "wework",
          source: "wework",
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

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#003A45] text-[#f5f0e8]">
      {/* Soft decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(217,255,102,0.08), transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,83,82,0.55), transparent 60%)",
        }}
      />

      <section className="relative px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center gap-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/wd-logo.svg"
                alt="Wonderdog"
                className="h-10 w-auto md:h-11"
              />
              <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D9FF66]">
                A Wonder Dog × WeWork Partnership
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 font-serif font-light text-[clamp(40px,6.5vw,72px)] leading-[1.02] tracking-[-0.02em] text-[#f5f0e8]"
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
            ref={formSectionRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
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
                    blood draw and get you set up in the app. Welcome to the
                    pack.
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
                      className={inputClass}
                    />
                    <div className="flex flex-col gap-3.5 md:flex-row">
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className={inputClass}
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>

                    <AddressAutocomplete
                      query={addressQuery}
                      onQueryChange={(v) => {
                        setAddressQuery(v);
                        if (addressSelected && v !== street) {
                          setAddressSelected(false);
                        }
                      }}
                      onPlaceSelected={(p) => {
                        setStreet(p.street);
                        setCity(p.city);
                        setStateCode(p.state);
                        setZip(p.zip);
                        setAddressQuery(p.street);
                        setAddressSelected(true);
                      }}
                      placeholder="Start typing your home address…"
                    />

                    <AnimatePresence initial={false}>
                      {addressSelected ? (
                        <motion.div
                          key="addr-parts"
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3.5 pt-1">
                            <div className="flex flex-col gap-3.5 md:flex-row">
                              <input
                                type="text"
                                placeholder="Street"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className={`${inputClass} flex-[2]`}
                              />
                              <input
                                type="text"
                                placeholder="Apt / Unit (optional)"
                                value={apt}
                                onChange={(e) => setApt(e.target.value)}
                                className={`${inputClass} flex-1`}
                              />
                            </div>
                            <div className="flex flex-col gap-3.5 md:flex-row">
                              <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className={`${inputClass} flex-[2]`}
                              />
                              <input
                                type="text"
                                placeholder="State"
                                value={stateCode}
                                onChange={(e) =>
                                  setStateCode(
                                    e.target.value.toUpperCase().slice(0, 2),
                                  )
                                }
                                maxLength={2}
                                className={`${inputClass} flex-1 uppercase`}
                              />
                              <input
                                type="text"
                                placeholder="ZIP"
                                inputMode="numeric"
                                value={zip}
                                onChange={(e) =>
                                  setZip(
                                    e.target.value.replace(/\D/g, "").slice(0, 5),
                                  )
                                }
                                className={`${inputClass} flex-1`}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

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
                              <span className="block font-serif text-[18px]">
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

                  <form
                    onSubmit={handleSubmit}
                    className="mt-8 flex flex-col gap-6"
                  >
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
                            className={inputClass}
                          />
                          <input
                            type="text"
                            placeholder="Breed"
                            value={dog.breed}
                            onChange={(e) =>
                              updateDog(i, { breed: e.target.value })
                            }
                            className={inputClass}
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
                              className={`${inputClass} flex-1`}
                            />
                            <input
                              type="text"
                              placeholder="Age (years)"
                              value={dog.age}
                              onChange={(e) =>
                                updateDog(i, { age: e.target.value })
                              }
                              className={`${inputClass} flex-1`}
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
                          Wonderdog about your appointment, results, and
                          account. Msg &amp; data rates may apply. Reply STOP to
                          unsubscribe. See our{" "}
                          <Link
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-white/80"
                          >
                            Privacy Policy
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-white/80"
                          >
                            Terms
                          </Link>
                          .
                        </p>
                      ) : null}
                    </div>

                    <label className="mt-2 flex cursor-pointer select-none items-start gap-3">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-[3px] h-4 w-4 flex-shrink-0 rounded accent-[#D9FF66]"
                      />
                      <span className="text-[13px] leading-snug text-white/70">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline hover:text-white/90"
                        >
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline hover:text-white/90"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting || !agreedToTerms}
                      className="mt-4 h-13 rounded-xl bg-[#D9FF66] py-3.5 text-[15px] font-semibold text-[#003A45] transition-all hover:bg-[#e5ff8a] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      {submitting ? "Sending…" : "Join Waitlist"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-20 flex justify-center gap-5 text-[12px] text-white/45">
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
            className="cursor-pointer text-[12px] text-white/60 underline underline-offset-4 transition-colors hover:text-white"
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
// WD-94
