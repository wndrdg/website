"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";

const timezones = [
  { value: "HST", label: "GMT-10 — Hawaii" },
  { value: "AKST", label: "GMT-9 — Alaska" },
  { value: "PT", label: "GMT-8 — Pacific (LA, Seattle, Vancouver)" },
  { value: "MT", label: "GMT-7 — Mountain (Denver, Phoenix)" },
  { value: "CT", label: "GMT-6 — Central (Chicago, Mexico City)" },
  { value: "ET", label: "GMT-5 — Eastern (NYC, Toronto, Bogot\u00e1)" },
  { value: "AST", label: "GMT-4 — Atlantic (Santiago, Puerto Rico)" },
  { value: "BRT", label: "GMT-3 — Brazil (S\u00e3o Paulo, Buenos Aires)" },
  { value: "GMT", label: "GMT+0 — UK / Iceland / Portugal" },
  { value: "CET", label: "GMT+1 — Central Europe (Berlin, Paris, Lagos)" },
  { value: "EET", label: "GMT+2 — Eastern Europe (Helsinki, Kyiv, Cairo)" },
  { value: "MSK", label: "GMT+3 — Moscow / Istanbul / Nairobi" },
  { value: "GST", label: "GMT+4 — Dubai / Baku" },
  { value: "IST", label: "GMT+5:30 — India (Mumbai, Delhi)" },
  { value: "BST", label: "GMT+6 — Bangladesh / Kazakhstan" },
  { value: "ICT", label: "GMT+7 — Thailand / Vietnam / Jakarta" },
  { value: "CST_ASIA", label: "GMT+8 — Singapore / Hong Kong / Perth" },
  { value: "JST", label: "GMT+9 — Japan / Korea" },
  { value: "AEST", label: "GMT+10 — Australia East (Sydney, Melbourne)" },
  { value: "NZST", label: "GMT+12 — New Zealand" },
  { value: "Other", label: "Other" },
];

const questions = [
  { key: "framework", label: "Go-to frontend framework?" },
  { key: "css", label: "Favorite CSS approach?" },
  { key: "components", label: "Favorite component library?" },
  { key: "tool", label: "What do you vibe code in?" },
  { key: "model", label: "What AI model do you reach for most?" },
  { key: "stuck", label: "AI gets stuck in a loop — what\u2019s your move?" },
  {
    key: "rn_styling",
    label: "No DOM, no Tailwind — how do you style in React Native?",
  },
  {
    key: "rn_iterate",
    label: "RN builds are slow — how do you keep your feedback loop fast?",
  },
];

export default function VibeCheckPage() {
  const startTime = useRef<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [canText, setCanText] = useState<boolean | null>(null);
  const [salary, setSalary] = useState("");
  const [background, setBackground] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const allFilled =
    name.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    timezone !== "" &&
    background.trim() !== "" &&
    canText !== null &&
    questions.every((q) => (answers[q.key] || "").trim() !== "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allFilled || submitting) return;

    setSubmitting(true);

    const elapsed = Math.round((Date.now() - startTime.current) / 1000);

    const payload = {
      contact: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        timezone,
        canText: canText ? "Can text me" : "Call only",
        background: background.trim(),
        salary: salary.trim() || null,
      },
      answers,
      meta: {
        elapsed_seconds: elapsed,
        submitted_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
      },
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Submission failed silently
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <h1 className="text-[32px] font-bold text-[#e0e0e0] mb-3">
            Got it. Thanks.
          </h1>
          <p className="text-[#666] text-sm">
            We&apos;ll text you to set up a quick call. Talk soon.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-[#141414] border border-[#222] rounded-md text-[#e0e0e0] outline-none focus:border-[#444] transition-colors";

  return (
    <div className="flex justify-center px-6 py-12 min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-[580px]">
        {/* Header */}
        <h1 className="text-[32px] font-bold text-[#e0e0e0] mb-2">
          vibe check
        </h1>
        <p className="text-[#666] text-sm leading-relaxed mb-12">
          Quick-fire questions. Just answer with your gut — no right answers,
          just your actual opinions. Should take about a minute.
        </p>

        {/* Contact Section */}
        <div className="mb-10">
          <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#999] mb-4">
            you
          </div>

          <div className="mb-4">
            <label className="block text-[13px] text-[#999] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] text-[#999] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] text-[#999] mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className="block text-[13px] text-[#999] mb-1.5">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="" disabled />
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] text-[#999] mb-1.5">
              Can I text you?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCanText(true)}
                className={`px-4 py-2 text-[13px] rounded-md border transition-all cursor-pointer ${
                  canText === true
                    ? "bg-[rgba(74,222,128,0.1)] border-[#4ade80] text-[#4ade80]"
                    : "bg-[#141414] border-[#222] text-[#999] hover:border-[#444]"
                }`}
              >
                Can text me
              </button>
              <button
                type="button"
                onClick={() => setCanText(false)}
                className={`px-4 py-2 text-[13px] rounded-md border transition-all cursor-pointer ${
                  canText === false
                    ? "bg-[rgba(74,222,128,0.1)] border-[#4ade80] text-[#4ade80]"
                    : "bg-[#141414] border-[#222] text-[#999] hover:border-[#444]"
                }`}
              >
                Call only
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[13px] text-[#999] mb-1.5">
              Your background in one sentence
            </label>
            <input
              type="text"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mt-4">
            <label className="block text-[13px] text-[#999] mb-1.5">
              Desired annual salary (USD)
              <span className="text-[#666] ml-1.5">— optional</span>
            </label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-10">
          <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#999] mb-4">
            quick fire
          </div>

          {questions.map((q, i) => (
            <div key={q.key} className="mb-4">
              <label className="block text-[13px] text-[#999] mb-1.5">
                <span className="text-[#666] mr-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {q.label}
              </label>
              <input
                type="text"
                value={answers[q.key] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!allFilled || submitting}
          className={`w-full py-3.5 text-[15px] font-semibold rounded-md transition-all ${
            allFilled && !submitting
              ? "bg-[#e0e0e0] text-[#0a0a0a] cursor-pointer hover:bg-[#f0f0f0]"
              : "bg-[#333] text-[#666] cursor-not-allowed"
          }`}
        >
          {submitting ? "sending..." : "send it"}
        </button>
      </form>
    </div>
  );
}
