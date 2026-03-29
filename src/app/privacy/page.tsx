"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

export default function PrivacyPolicy() {
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
            &larr; Wonder Dog
          </Link>

          <h1 className="mt-8 text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-[13px] text-[oklch(0.5_0_0)]">
            Effective Date: March 29, 2026 &middot; Last Updated: March 29, 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="mt-12 space-y-10 text-[14px] sm:text-[15px] leading-relaxed text-[oklch(0.82_0_0)]"
        >
          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              1. Introduction
            </h2>
            <p className="mt-3">
              Wonder Dog (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website located at wonder.dog and any associated services (collectively, the &ldquo;Service&rdquo;). This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you visit our website, join our waitlist, apply for employment, or otherwise interact with us.
            </p>
            <p className="mt-3">
              By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              2. Information We Collect
            </h2>

            <h3 className="mt-4 text-[15px] sm:text-[16px] font-medium text-[oklch(0.92_0_0)]">
              2.1 Information You Provide Directly
            </h3>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Waitlist Sign-Up:</strong> When you join our waitlist, we collect your email address.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Job Applications:</strong> When you apply for a position, we collect the information you provide via email, including your name, contact details, resume, and any other materials you submit.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Communications:</strong> When you contact us directly, we collect the content of your messages and any information you choose to provide.
              </li>
            </ul>

            <h3 className="mt-4 text-[15px] sm:text-[16px] font-medium text-[oklch(0.92_0_0)]">
              2.2 Information Collected Automatically
            </h3>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Log Data:</strong> Our servers may automatically record information such as your IP address, browser type, operating system, referring URLs, pages visited, and the date and time of your visit.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Cookies &amp; Similar Technologies:</strong> We may use cookies, web beacons, and similar technologies to operate and improve the Service. You can control cookie preferences through your browser settings.
              </li>
            </ul>

            <h3 className="mt-4 text-[15px] sm:text-[16px] font-medium text-[oklch(0.92_0_0)]">
              2.3 Information Related to Messaging
            </h3>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Phone Numbers:</strong> If you provide your phone number to receive SMS or text messages from us, we collect and store your phone number.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Message Data:</strong> We may retain records of text messages sent to and from you for compliance, support, and service improvement purposes.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Consent Records:</strong> We maintain records of your opt-in consent to receive messages, including the date, time, and method of consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              3. How We Use Your Information
            </h2>
            <p className="mt-3">We use the information we collect to:</p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Operate, maintain, and improve the Service</li>
              <li>Process and manage waitlist registrations</li>
              <li>Send you transactional emails related to your waitlist status, account, or service updates</li>
              <li>Send promotional or marketing communications, including via SMS/text message, only with your prior express consent</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Process job applications</li>
              <li>Comply with legal obligations and enforce our terms</li>
              <li>Detect, prevent, and address fraud, abuse, or security issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              4. SMS/Text Messaging Terms
            </h2>
            <p className="mt-3">
              By providing your phone number and opting in, you consent to receive text messages from Wonder Dog. The following terms apply:
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Consent:</strong> You must provide express written consent before receiving any SMS messages from us. Consent is not a condition of purchase or use of our Service.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Message Frequency:</strong> Message frequency varies. You may receive up to 10 messages per month, depending on your interactions and preferences.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Message &amp; Data Rates:</strong> Message and data rates may apply. Check with your wireless carrier for details about your plan.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Opt-Out:</strong> You can opt out of receiving text messages at any time by replying <strong className="text-white">STOP</strong> to any message you receive from us. After opting out, you will receive a one-time confirmation message and no further texts.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Help:</strong> For help, reply <strong className="text-white">HELP</strong> to any message or email us at{" "}
                <a href="mailto:hr@wonder.dog" className="text-[#005352] hover:text-[#00706e] transition-colors">
                  hr@wonder.dog
                </a>.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Supported Carriers:</strong> Service is available on major US carriers including AT&amp;T, Verizon, T-Mobile, Sprint, and others. Carriers are not liable for delayed or undelivered messages.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">No Sharing for Marketing:</strong> We do not sell, rent, lease, or share your phone number or messaging consent information with third parties or affiliates for their own marketing purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              5. How We Share Your Information
            </h2>
            <p className="mt-3">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Service Providers:</strong> We share information with trusted third-party vendors who assist us in operating the Service, such as email delivery services (e.g., Resend) and hosting providers (e.g., Vercel). These providers are contractually obligated to use your information only as necessary to perform services on our behalf.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Legal Compliance:</strong> We may disclose information when required by law, regulation, legal process, or governmental request.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Protection of Rights:</strong> We may disclose information to protect the rights, property, or safety of Wonder Dog, our users, or the public.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              6. Data Retention
            </h2>
            <p className="mt-3">
              We retain your personal information only for as long as necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required by law. Waitlist email addresses are retained until the waitlist is closed or you request removal. SMS consent records are retained for a minimum of five years to comply with applicable regulations.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              7. Data Security
            </h2>
            <p className="mt-3">
              We implement commercially reasonable technical and organizational measures to protect your personal information against unauthorized access, loss, destruction, or alteration. However, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              8. Your Rights &amp; Choices
            </h2>

            <h3 className="mt-4 text-[15px] sm:text-[16px] font-medium text-[oklch(0.92_0_0)]">
              8.1 All Users
            </h3>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Access &amp; Correction:</strong> You may request access to or correction of your personal information by contacting us.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Deletion:</strong> You may request that we delete your personal information, subject to certain legal exceptions.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Opt-Out of Communications:</strong> You may unsubscribe from marketing emails by clicking the unsubscribe link in any email, or opt out of text messages by replying STOP.
              </li>
            </ul>

            <h3 className="mt-4 text-[15px] sm:text-[16px] font-medium text-[oklch(0.92_0_0)]">
              8.2 California Residents (CCPA/CPRA)
            </h3>
            <p className="mt-3">
              If you are a California resident, you have the right to:
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Know what personal information we collect, use, disclose, and sell</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale or sharing of your personal information (we do not sell your information)</li>
              <li>Not be discriminated against for exercising your privacy rights</li>
              <li>Correct inaccurate personal information</li>
              <li>Limit the use and disclosure of sensitive personal information</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:hr@wonder.dog" className="text-[#005352] hover:text-[#00706e] transition-colors">
                hr@wonder.dog
              </a>. We will verify your identity before processing your request.
            </p>

            <h3 className="mt-4 text-[15px] sm:text-[16px] font-medium text-[oklch(0.92_0_0)]">
              8.3 European Economic Area, UK &amp; International Users (GDPR)
            </h3>
            <p className="mt-3">
              If you are located in the EEA, UK, or other jurisdictions with applicable data protection laws, you may have additional rights including the right to access, rectify, port, erase, and restrict or object to the processing of your personal data. Our legal basis for processing is your consent and/or our legitimate interests in operating the Service. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              9. Third-Party Links
            </h2>
            <p className="mt-3">
              The Service may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to read the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              10. Children&apos;s Privacy
            </h2>
            <p className="mt-3">
              The Service is not directed to children under the age of 13 (or 16 in the EEA). We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child, we will take steps to delete it promptly. If you believe a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              11. Do Not Track
            </h2>
            <p className="mt-3">
              Our Service does not currently respond to &ldquo;Do Not Track&rdquo; browser signals. We will update this policy if that changes.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              12. Changes to This Privacy Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. When we make material changes, we will update the &ldquo;Last Updated&rdquo; date at the top of this page and, where required by law, provide additional notice. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              13. Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy or wish to exercise your privacy rights, contact us at:
            </p>
            <div className="mt-3">
              <p>Wonder Dog</p>
              <p>
                Email:{" "}
                <a href="mailto:hr@wonder.dog" className="text-[#005352] hover:text-[#00706e] transition-colors">
                  hr@wonder.dog
                </a>
              </p>
            </div>
          </section>
        </motion.div>

        <footer className="mt-16 flex flex-col gap-4 border-t border-[oklch(1_0_0_/_10%)] pt-8">
          <div className="flex gap-4 text-[12px] text-[oklch(0.5_0_0)]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-[11px] text-[oklch(0.4_0_0)]">
            &copy; 2026 Wonder Dog
          </p>
        </footer>
      </div>
    </main>
  );
}
