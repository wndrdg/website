"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

export default function TermsOfService() {
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
            Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;you&rdquo; or &ldquo;User&rdquo;) and Wonder Dog (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using our website at wonder.dog and any associated services (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms and our{" "}
              <Link href="/privacy" className="text-[#005352] hover:text-[#00706e] transition-colors">
                Privacy Policy
              </Link>, which is incorporated herein by reference. If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              2. Eligibility
            </h2>
            <p className="mt-3">
              You must be at least 18 years old or the age of majority in your jurisdiction, whichever is greater, to use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              3. Description of Service
            </h2>
            <p className="mt-3">
              Wonder Dog is building tools and services to help dogs live longer, healthier lives, including AI-powered health insights, at-home wellness services, and related offerings. The Service currently includes a waitlist registration, informational content, and job listings. Features and functionality may change as we develop and expand the platform.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              4. User Accounts &amp; Waitlist
            </h2>
            <p className="mt-3">
              When you sign up for our waitlist, you agree to provide accurate and complete information. You are responsible for maintaining the accuracy of the information you provide. Joining the waitlist does not guarantee access to any future product, service, or feature.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              5. SMS/Text Messaging Terms
            </h2>
            <p className="mt-3">
              If you opt in to receive text messages from Wonder Dog, the following terms apply in addition to our Privacy Policy:
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Opt-In:</strong> By providing your phone number and checking the applicable consent box or replying with a keyword, you expressly consent to receive recurring automated text messages from Wonder Dog at the phone number provided. Consent to receive text messages is not required as a condition of purchasing any goods or services.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Message Types:</strong> Messages may include waitlist updates, service announcements, appointment reminders, health insights, and promotional offers.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Message Frequency:</strong> Message frequency varies. You may receive up to 10 messages per month.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Costs:</strong> Message and data rates may apply. You are responsible for any charges from your wireless carrier.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Opt-Out:</strong> Reply <strong className="text-white">STOP</strong> to any message to unsubscribe. You will receive a single confirmation message. No further messages will be sent unless you re-subscribe.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Help:</strong> Reply <strong className="text-white">HELP</strong> for assistance, or contact us at{" "}
                <a href="mailto:hr@wonder.dog" className="text-[#005352] hover:text-[#00706e] transition-colors">
                  hr@wonder.dog
                </a>.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">Carrier Disclaimer:</strong> Carriers are not liable for delayed or undelivered messages. T-Mobile is not liable for delayed or undelivered messages.
              </li>
              <li>
                <strong className="text-[oklch(0.92_0_0)]">No Sharing:</strong> We will not sell, rent, or share your phone number or opt-in information with any third parties for their marketing purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              6. Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation</li>
              <li>Provide false, misleading, or inaccurate information</li>
              <li>Interfere with or disrupt the Service, servers, or networks connected to the Service</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use automated means (bots, scrapers, crawlers) to access or collect data from the Service without our prior written consent</li>
              <li>Transmit viruses, malware, or any code of a destructive nature</li>
              <li>Harass, threaten, or abuse other users or our employees</li>
              <li>Infringe upon the intellectual property rights of Wonder Dog or any third party</li>
            </ul>
            <p className="mt-3">
              We reserve the right to terminate or restrict your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to us, other users, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              7. Intellectual Property
            </h2>
            <p className="mt-3">
              All content, features, and functionality of the Service &mdash; including but not limited to text, graphics, logos, trademarks, images, software, and design &mdash; are the exclusive property of Wonder Dog or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use any of our intellectual property without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              8. Disclaimer of Warranties
            </h2>
            <p className="mt-3 uppercase text-[13px] tracking-wide">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure, or that any defects will be corrected.
            </p>
            <p className="mt-3 uppercase text-[13px] tracking-wide">
              Nothing on this website constitutes veterinary advice. Always consult a licensed veterinarian for your pet&apos;s health needs. Wonder Dog is not a veterinary practice and does not provide diagnoses, treatment, or prescriptions.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              9. Limitation of Liability
            </h2>
            <p className="mt-3 uppercase text-[13px] tracking-wide">
              To the maximum extent permitted by applicable law, in no event shall Wonder Dog, its officers, directors, employees, agents, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, resulting from: (a) your access to or use of (or inability to access or use) the Service; (b) any conduct or content of any third party on the Service; (c) any content obtained from the Service; or (d) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
            </p>
            <p className="mt-3 uppercase text-[13px] tracking-wide">
              Our total aggregate liability for all claims arising from or related to the Service shall not exceed one hundred US dollars ($100).
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              10. Indemnification
            </h2>
            <p className="mt-3">
              You agree to indemnify, defend, and hold harmless Wonder Dog and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising from or related to your use of the Service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              11. Dispute Resolution &amp; Arbitration
            </h2>
            <p className="mt-3">
              Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved through binding individual arbitration administered by the American Arbitration Association (&ldquo;AAA&rdquo;) under its Consumer Arbitration Rules, except that each party retains the right to seek injunctive or other equitable relief in a court of competent jurisdiction.
            </p>
            <p className="mt-3">
              <strong className="text-[oklch(0.92_0_0)]">Class Action Waiver:</strong> You agree that any arbitration or proceeding shall be conducted only on an individual basis and not in a class, consolidated, or representative action. If for any reason a claim proceeds in court rather than arbitration, you waive any right to a jury trial.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              12. Governing Law
            </h2>
            <p className="mt-3">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any legal action not subject to arbitration shall be brought exclusively in the state or federal courts located in Los Angeles County, California.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              13. Modifications to Terms
            </h2>
            <p className="mt-3">
              We reserve the right to modify these Terms at any time. When we make material changes, we will update the &ldquo;Last Updated&rdquo; date and, where required by law, provide additional notice. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              14. Severability
            </h2>
            <p className="mt-3">
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              15. Entire Agreement
            </h2>
            <p className="mt-3">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Wonder Dog regarding the Service and supersede all prior agreements, understandings, and communications, whether written or oral.
            </p>
          </section>

          <section>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[oklch(0.985_0_0)]">
              16. Contact Us
            </h2>
            <p className="mt-3">
              If you have any questions about these Terms, contact us at:
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
