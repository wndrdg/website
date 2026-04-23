"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const jobs = [
  {
    title: "Licensed Veterinary Technician (Mobile)",
    type: "Contract · Part-time or Full-time",
    location: "Los Angeles, CA",
    description:
      "We're looking for licensed vet techs to perform at-home blood draws and wellness checks for dogs. You'll visit pet owners in their homes, collect samples, and help us build the future of proactive dog health. Must be comfortable with dogs of all sizes and have strong phlebotomy skills.",
    requirements: [
      "Active RVT/LVT/CVT license",
      "2+ years veterinary technician experience",
      "Confident with canine blood draws",
      "Reliable vehicle and valid driver's license",
      "Excellent communication skills",
      "Genuine love for dogs (non-negotiable)",
    ],
  },
  {
    title: "Full-Stack Engineer",
    type: "Full-time",
    location: "Remote · US",
    description:
      "Join a small, senior engineering team building AI-powered health tools for dogs. You'll work across our Next.js web platform and React Native mobile app, shipping features that directly impact how pet owners care for their dogs.",
    requirements: [
      "Strong TypeScript, React, and Next.js experience",
      "React Native / Expo experience preferred",
      "Comfortable with AI/ML integrations and APIs",
      "Product-minded — you care about what you're building, not just how",
      "Startup pace: we ship fast and iterate",
    ],
  },
  {
    title: "Veterinary Science Advisor",
    type: "Part-time · Contract",
    location: "Remote",
    description:
      "Help us ensure our health insights, biomarker interpretations, and longevity recommendations are scientifically sound. You'll review AI-generated health reports, advise on diagnostic protocols, and help shape our approach to canine preventive care.",
    requirements: [
      "DVM or equivalent veterinary degree",
      "Experience in canine internal medicine or clinical pathology preferred",
      "Interest in AI, longevity science, or preventive care",
      "Comfortable working async with a fast-moving startup team",
    ],
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function NowHiring() {
  return (
    <main className="min-h-svh bg-[oklch(0.145_0_0)] text-[oklch(0.985_0_0)]">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <Link
            href="/"
            className="text-[13px] text-[oklch(0.708_0_0)] hover:text-white transition-colors"
          >
            ← Wonderdog
          </Link>

          <h1 className="mt-8 text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em]">
            Now Hiring
          </h1>
          <p className="mt-3 text-[15px] sm:text-[17px] text-[oklch(0.708_0_0)] max-w-lg">
            We&apos;re building the future of dog health and longevity. These
            are the people we need to make it happen.
          </p>
        </motion.div>

        <div className="mt-14 space-y-10">
          {jobs.map((job, i) => (
            <motion.article
              key={job.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2 + i * 0.15,
                ease,
              }}
              className="rounded-lg border border-[oklch(1_0_0_/_10%)] p-6 sm:p-8"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em]">
                  {job.title}
                </h2>
              </div>
              <p className="mt-1 text-[13px] text-[oklch(0.708_0_0)]">
                {job.type} · {job.location}
              </p>

              <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-[oklch(0.82_0_0)]">
                {job.description}
              </p>

              <ul className="mt-5 space-y-2">
                {job.requirements.map((req) => (
                  <li
                    key={req}
                    className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-[oklch(0.75_0_0)]"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#005352]" />
                    {req}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:jobs@wonderdog.com"
                className="mt-6 inline-block text-[13px] font-medium text-[#005352] hover:text-[#00706e] transition-colors"
              >
                Apply →
              </a>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 border-t border-[oklch(1_0_0_/_10%)] pt-8"
        >
          <p className="text-[13px] text-[oklch(0.5_0_0)]">
            Wonderdog is an equal opportunity employer. We don&apos;t
            discriminate based on race, religion, gender, sexual orientation,
            age, disability, or any other protected status. We just care if
            you&apos;re great at what you do and love dogs.
          </p>
        </motion.div>

        <footer className="mt-12 flex flex-col gap-4 border-t border-[oklch(1_0_0_/_10%)] pt-8">
          <div className="flex gap-4 text-[12px] text-[oklch(0.5_0_0)]">
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-[11px] text-[oklch(0.4_0_0)]">
            &copy; 2026 Wonderdog
          </p>
        </footer>
      </div>
    </main>
  );
}
