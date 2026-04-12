"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

const termsHTML = `<p>Welcome to Wonderdog. Wonderdog Health, Inc., a Delaware corporation
(<strong>\u201cWonderdog,\u201d \u201cus,\u201d \u201cwe,\u201d</strong> or <strong>\u201cour\u201d</strong>)
recommends that you read these Terms and Conditions
(<strong>\u201cTerms\u201d</strong>) carefully before using our website,
communicating with us, or obtaining our veterinary telehealth,
diagnostics, and preventive health services (together, or individually,
the <strong>\u201cService\u201d</strong>).</p>
<p>These Terms constitute a legally binding agreement between Wonderdog
and you concerning your use of the Service (the \u201cAgreement\u201d), including
binding dispute resolution terms between you and Wonderdog. We
encourage you to print these Terms or save them to your device for
reference. Your access to and use of the Service is conditioned upon
your acceptance of and compliance with these Terms. These Terms apply to
all visitors, users, members, and others who access or use the
Service.</p>
<p>By accessing or using the Service you agree to be bound by these
Terms. If you disagree with any part of the Terms then you do not have
permission to access the Service. By accessing or using the Service, you
agree to comply with all laws and regulations applicable to your use of
our Service. This means, among other things, that you will ensure your
pets are vaccinated, licensed, identifiable, and/or microchipped as
required by applicable local law, and that you have obtained and will
maintain any and all mandatory insurance coverage concerning the pets
you entrust to our care.</p>
<h1>Eligibility</h1>
<p>By accessing and/or using the Service, including by doing so after
accessing this Agreement, you represent and warrant that you are at
least eighteen (18) years old or older, competent to enter into
contracts, and authorized to make Appointments on behalf of any party or
company subject to the Appointment.</p>
<h1>Dispute Resolution</h1>
<p>This section outlines how you and Wonderdog will handle disputes
arising from these Terms, the Privacy Policy, or the Service. It is
crucial that you read this section carefully.</p>
<h2>Claims and Governing Law</h2>
<p>A <strong>\u201cClaim\u201d</strong> refers to any claim or dispute between you
and us or any third-party beneficiary, arising from these Terms, the
Privacy Policy, and the Service. These Terms, including the
interpretation and enforcement of this dispute resolution provision and
any Claims, shall be exclusively governed by the Federal Arbitration Act
and federal arbitration law. To the extent state law applies and is not
inconsistent with federal arbitration law, the laws of the State of
California shall apply, excluding its choice of law rules.
Notwithstanding the foregoing, to the extent that applicable mandatory
local law governs a specific obligation and cannot be waived or
superseded by contract, such mandatory local law shall govern that
specific obligation only, without affecting the application of
California law to all other matters.</p>
<h2>Informal Dispute Process</h2>
<p>Our goal is to resolve all Claims to optimize member satisfaction.
Before seeking arbitration relief, you agree to first notify our Member
Support team to attempt to resolve any Claims against us. You can reach
us at legal@wonder.dog. Participating in this informal process is a
prerequisite to initiating arbitration or small claims court
proceedings, to the fullest extent permitted by applicable laws.</p>
<h2>Mandatory Pre-Arbitration Notice Procedure</h2>
<p>If the Claim is not resolved through our Informal Dispute Process,
the aggrieved party (\u201cClaimant\u201d) must follow this Pre-Arbitration Notice
Procedure before commencing arbitration:</p>
<ul>
<li><p>The Claimant must send the other party a formal written Notice of
the Claim by email to legal@wonder.dog.</p></li>
<li><p>The Notice must contain the Claimant\u2019s full name, address, email,
description of relevant facts and basis of the Claim, damages and
recovery sought, and a signed statement verifying the accuracy of the
information.</p></li>
<li><p>After receiving the Notice, the parties will negotiate in good
faith to resolve the dispute for 30 days, which may include an
individualized video conference or phone call attended by both parties.
Optionally, in addition to both parties, a party\u2019s attorney may also
attend this individualized video conference or phone call. The parties
agree to work together cooperatively to schedule this individualized
video conference or phone call as soon as possible after the receipt of
the Notice.</p></li>
<li><p>If no agreement is reached within 30 days, the Claimant may
commence arbitration proceedings.</p></li>
<li><p>Compliance with the Informal Dispute Process and the Mandatory
Pre-Arbitration Notice Procedure is a condition precedent to initiating
arbitration. Statutes of limitations are tolled during the Informal
Dispute Process and the Mandatory Pre-Arbitration Notice.</p></li>
<li><p>If the Claimant does not comply with the Notice Procedure, a
court, upon request by a party, must enjoin an arbitration filing or
continued prosecution, and an arbitration administrator cannot initiate
or assess fees related to the arbitration. If a party commences an
arbitration prior to completing the Notice Procedure, the arbitration
provider shall administratively close the arbitration. Furthermore, a
party may seek damages from any party who does not comply with the
Mandatory Pre-Arbitration Notice procedure.</p></li>
</ul>
<h2>Arbitration Agreement</h2>
<p>The parties agree that any unresolved Claims will be resolved
exclusively through final and binding arbitration according to the
following terms, except as otherwise provided further below:</p>
<ul>
<li><p>Claims will only be resolved through arbitration, not in a court
of law.</p></li>
<li><p>Arbitration will be governed by applicable National Arbitration
&amp; Mediation (\u201cNAM\u201d) rules, as modified by this arbitration
agreement, and administered by NAM or another provider that is
agreed-upon or appointed by a court. The NAM rules include the
Comprehensive Dispute Resolution Rules and Procedure and the
Supplemental Rules for Mass Arbitration, as may be amended by these
Terms. You may find the NAM rules online at www.NAMADR.com.</p></li>
<li><p>Arbitration will be conducted before a single arbitrator who will
resolve any Claims, as well as any disagreements regarding the scope,
enforceability, formation, interpretation, applicability,
enforceability, voidness, or voidability of these Terms or the dispute
resolution provisions of the Terms. All remedies will be available to
the arbitrator, and the arbitration decision will be final and
binding.</p></li>
<li><p>The arbitration will be conducted in the county where you live or
at another mutually agreed location, and may be conducted by telephone,
videoconference, or written submissions upon request.</p></li>
<li><p>Payment of fees will be governed by the NAM Rules, unless you
qualify for a fee waiver under applicable law. Each party shall pay its
own attorneys\u2019 fees, unless otherwise required by statute.</p></li>
<li><p>The arbitrator may consolidate multiple related arbitrations upon
request, but cannot preside over any form of representative or class
proceeding unless all individuals have initiated and are currently
pursuing arbitration under this Agreement.</p></li>
<li><p>As in court, counsel representing a party in arbitration
certifies compliance with Federal Rule of Civil Procedure 11(b), and the
arbitrator is authorized to impose sanctions under the NAM Rules,
Federal Rule of Civil Procedure 11, or applicable federal or state
law.</p></li>
</ul>
<h2>Limitations to Arbitration</h2>
<ul>
<li><p>Instead of arbitration, you or we may bring any individual Claim
in small claims court, but only if the Claim(s) are brought on an
individual basis and are below the statutory maximum amount permitted in
small claims court.</p></li>
<li><p>If you choose to pursue the Claim(s) in a small claims action, it
may only be filed in the county of your residence or in Los Angeles,
California.</p></li>
<li><p>Nothing in this section will limit either party\u2019s ability, if and
as allowed by applicable law, to seek injunctive relief in aid of
arbitration or a \u201cpublic injunction\u201d in a court of competent
jurisdiction or to seek to compel arbitration, stay a case during
arbitration, or enter judgment on, confirm, modify, or vacate an
arbitration award.</p></li>
<li><p>Arbitration is required if you reside or bring a Claim in the
United States or any country that enforces arbitration agreements. If
you are not bringing a Claim in, and are not a resident of, the United
States, you may be allowed to file a Claim in a court of competent
jurisdiction on an individual basis in the city in which you reside
under the laws of that city, after completing the Informal Dispute
Process and the Mandatory Pre-Arbitration Notice Procedure.</p></li>
</ul>
<h1>Class Action Waiver</h1>
<p><strong>THIS AGREEMENT LIMITS YOUR RIGHTS TO BRING CLAIMS IN COURT OR
AS PART OF A CLASS ACTION. BY ACCEPTING THESE TERMS, YOU AGREE THAT ALL
CLAIMS MUST BE BROUGHT IN ARBITRATION ON AN INDIVIDUAL BASIS ONLY. YOU
WAIVE THE RIGHT TO PARTICIPATE AS A CLASS MEMBER OR REPRESENTATIVE IN
ANY CLASS ACTION OR REPRESENTATIVE PROCEEDING. THE ARBITRATOR MAY NOT
JOIN OR CONSOLIDATE CLAIMS FROM MULTIPLE PARTIES, MAY NOT PRESIDE OVER
ANY CLASS, REPRESENTATIVE, OR CONSOLIDATED ACTION, AND MAY NOT AWARD
RELIEF BEYOND WHAT IS NECESSARY FOR THE INDIVIDUAL CLAIM. THIS WAIVER OF
CLASS ACTION RIGHTS IS A CRUCIAL PART OF THIS AGREEMENT. IF THIS WAIVER
IS FOUND TO BE LIMITED OR VOID, THE ENTIRE ARBITRATION AGREEMENT BECOMES
NULL AND VOID, SUBJECT TO APPEAL. YOU ACKNOWLEDGE THAT WITHOUT THESE
TERMS, YOU WOULD HAVE THE RIGHT TO SUE IN COURT WITH A JURY. BY AGREEING
TO THESE TERMS, YOU ARE KNOWINGLY WAIVING THESE RIGHTS IN FAVOR OF
INDIVIDUAL ARBITRATION.</strong></p>
<p>This dispute resolution provision applies equally to all parties and
shall not be interpreted to the disadvantage of the party who drafted
it. If any part of this provision is found to be unenforceable, that
specific part shall be severed from the agreement. The remaining
portions of the agreement will continue to be valid and enforceable to
the fullest extent permitted by law.</p>
<h1>Privacy</h1>
<p>Your use of the Service is subject to Wonderdog\u2019s Privacy Policy,
which forms a part of these Terms. Please review our Privacy Policy,
which also governs the Service and informs users of our data collection
practices, including the collection and use of longitudinal canine
health data and biomarker results. We encourage you to frequently check
the Privacy Policy for changes.</p>
<h1>Health Data and Ownership</h1>
<h2>Wonderdog\u2019s Ownership of Platform Data</h2>
<p>All data generated through your use of the Service \u2014 including but
not limited to blood biomarker results, AI-generated health analyses,
longitudinal health trend data, Televet consultation notes, Vet Tech
observation records, intake form responses, and aggregate
population-level data derived from member pets (collectively, \u201cPlatform
Data\u201d) \u2014 is and shall remain the sole and exclusive property of Wonder
Dog Inc. By using the Service, you irrevocably and perpetually assign to
Wonderdog all right, title, and interest in and to Platform Data, to
the fullest extent permitted by applicable law.</p>
<h2>License to Your Pet\u2019s Personal Health Information</h2>
<p>Wonderdog acknowledges that certain information collected through
the Service, such as your pet\u2019s name, species, breed, age, and
individually identifiable biomarker results (\u201cPet Health Information\u201d),
is personal to you and your pet. Wonderdog does not claim ownership of
Pet Health Information. However, by using the Service, you grant Wonder
Dog a perpetual, irrevocable, worldwide, royalty-free, sublicensable
license to use, store, process, and analyze Pet Health Information for
the following purposes:</p>
<ul>
<li><p>Delivering the Service to you, including generating Diagnostic
Results and health trend reports.</p></li>
<li><p>Improving Wonderdog\u2019s AI diagnostic models, reference range
calibration, and predictive health algorithms, using de-identified or
aggregated data.</p></li>
<li><p>Conducting internal research and development to advance canine
preventive health and to otherwise enhance the Service and any other
current or future business offerings of Wonderdog.</p></li>
<li><p>Complying with applicable legal, regulatory, and veterinary
recordkeeping obligations.</p></li>
</ul>
<h2>De-Identification and Research Use</h2>
<p>Wonderdog may de-identify your pet\u2019s health data in accordance with
applicable privacy standards and use such de-identified data for
research, product development, publication, and commercial purposes
without restriction and without compensation to you. De-identified data
will not be linked back to you or your pet without your express
consent.</p>
<h2>Clinical Records</h2>
<p>Notwithstanding the above, veterinary clinical records created by a
licensed Televet in connection with your Appointment are subject to
applicable state veterinary practice acts governing recordkeeping and
patient record access. Wonderdog will maintain and provide access to
clinical records in accordance with those applicable requirements. Your
right to request a copy of your pet\u2019s clinical records is governed by
the laws of the state in which the Televet is licensed.</p>
<h2>Data Security</h2>
<p>Wonderdog uses commercially reasonable technical and organizational
measures to protect Platform Data and Pet Health Information from
unauthorized access, disclosure, or loss. However, no system is
perfectly secure, and Wonderdog cannot guarantee the absolute security
of your data. In the event of a data breach affecting your Pet Health
Information, Wonderdog will notify you in accordance with applicable
law. To the maximum extent permitted by applicable law, Wonderdog\u2019s
liability arising out of or related to any data breach, unauthorized
access, or loss of Pet Health Information shall be subject to and
limited by the Aggregate Liability Cap set forth in the Limitation of
Liability section of these Terms.</p>
<h1>Availability, Errors, and Inaccuracies</h1>
<p>We are constantly updating our Service offerings, including our
diagnostic panels, AI-driven health reports, and telehealth
availability. We may experience delays in updating information on the
Service and in our advertising on other websites. The information found
on the Service may contain errors or inaccuracies and may not be
complete or current. While Wonderdog reserves the right to remove
content from the Service, such as for errors, it does not assume any
obligation to do so and disclaims any liability for failing to do
so.</p>
<h1>Prohibited Activities</h1>
<p>In using the Service you agree not to: (i) copy, distribute, or
disclose any part of the Service in any medium, including without
limitation by any automated or non-automated \u201cscraping\u201d; (ii) use any
automated system, including without limitation \u201crobots,\u201d \u201cspiders,\u201d
\u201coffline readers,\u201d etc., to access the Service in a manner that sends
more request messages to our servers than a human can reasonably produce
in the same period of time by using a conventional online website; (iii)
transmit spam, chain letters, or other unsolicited email; (iv) attempt
to interfere with, compromise the system integrity or security, or
decipher any transmissions to or from the servers running the Service;
(v) take any action that imposes, or may impose, an unreasonable or
disproportionately large load on our infrastructure; (vi) upload invalid
data, viruses, worms, or other software agents through the Service;
(vii) collect or harvest any personally identifiable information, or any
information pertaining to your pet\u2019s health data, from the Service,
except as expressly permitted by the features of the Service; (viii) use
the Service for any commercial solicitation purposes; (ix) impersonate
another person or otherwise misrepresent your affiliation with a person
or entity, including in creating and using an account, conducting fraud,
hiding, or attempting to hide your identity; (x) interfere with the
proper working of the Service; (xi) access any content on the Service
through any technology or means other than those provided or authorized
by the Service; (xii) bypass the measures we may use to prevent or
restrict access to the Service, including without limitation features
that prevent or restrict use or copying of any content or enforce
limitations on use of the Service or the content therein; and (xiii)
create or use an account without proper authorization.</p>
<h1>Intellectual Property</h1>
<p>You are granted a non-exclusive, non-transferable, limited, revocable
license to access and use the Service subject to your strict compliance
with these Terms. As a condition of your use of the Service, you warrant
to Wonderdog that you will not use the Service for any purpose that is
unlawful or prohibited by these Terms or applicable law. You may not use
the Service in any manner which could damage, disable, overburden, or
impair the Service, or interfere with any other party\u2019s use and
enjoyment of the Service. You may not obtain or attempt to obtain any
materials or information through any means not intentionally made
available through the Service.</p>
<p>The Service and its features and functionality \u2014 including but not
limited to Wonderdog\u2019s AI diagnostic platform, longitudinal health data
infrastructure, biomarker analysis models, and the Liquid Gold
supplement line \u2014 are and will remain the exclusive property of Wonder
Dog Inc. and its licensors. The Service is protected by copyright,
trademark, and other laws of both the United States and foreign
countries. Our trademarks and trade dress may not be used in connection
with any product or service without the prior written consent of Wonder
Dog in each instance.</p>
<h1>Accounts</h1>
<p>As part of the Service, you may save information about you or your
pet by creating a member account. If you create an account, you warrant
that your information is accurate and authorized. You are solely
responsible for your account activity and your account confidentiality;
you must notify us of suspicious or unauthorized account activity, and
we disclaim all liability for use of your account. It is your
responsibility to maintain the accuracy of information in your account,
including your pet\u2019s health history and current medications. You may not
allow anyone else to use your login credentials to access your account.
We also retain the right to terminate or suspend your account, such as
if you violate these Terms.</p>
<h1>Consent to Communications</h1>
<p>By using the Service, you consent to receive communications,
including marketing emails and emails about your Appointments and your
pet\u2019s health results; and you agree that all agreements, notices,
disclosures, and other communications that we provide to you
electronically, via email and on our website, satisfy any legal
requirement that such communications be in writing. You also agree to
communications from us by phone and SMS/text message if they are
transactional or if you consent to them.</p>
<p>By gibing your consent to such communications, you agree that no
communications by Wonderdog to you shall violate the CAN-SPAM Act, the
Telephone Consumer Protection Act, or any other applicable laws. You are
responsible for paying any voice, message, and data fees, rates,
charges, and taxes that may apply to you.</p>
<p>You may opt out of any of our communications by following the
instructions provided in the communications or by contacting us.</p>
<h1>Termination</h1>
<p>We may terminate or suspend your access to the Service immediately,
without prior notice or liability, under our sole discretion, for any
reason whatsoever and without limitation, including but not limited to a
breach of the Terms.</p>
<p>All provisions of the Terms which by their nature should survive
termination shall survive termination, including, without limitation,
the arbitration requirement, ownership and intellectual property
provisions, warranty disclaimers, indemnity, miscellaneous terms, and
limitations of liability.</p>
<h1>Appointments</h1>
<p>An <strong>\u201cAppointment\u201d</strong> occurs when you utilize the booking
mechanism on the Wonderdog website or application, complete the member
intake form, and receive a confirmed appointment time with a Wonder
Dog-affiliated licensed veterinarian (\u201cTelevet\u201d) and/or veterinary
technician (\u201cVet Tech\u201d). If you request an Appointment, you agree that
we are not obligated to accept your request and may decline it at our
sole discretion. If your Appointment request is accepted, you
acknowledge that you agree to honor the price and other terms of that
Appointment. Our Appointments have a twenty-four (24) hour cancellation
policy. If you wish to cancel an Appointment that is less than
twenty-four (24) hours away, you may contact us via our Contact Form and
we may, in our sole discretion, choose to cancel the Appointment.
Appointments canceled with less than twenty-four (24) hours\u2019 notice will
result in a charge for the full amount of the Appointment. This
cancellation policy may not apply in certain emergency situations. In
such situations we may, in our reasonable discretion, issue a
refund.</p>
<p>We do not provide Services to dogs who meet any of the following
criteria: (i) at the time of the Appointment, the dog has an open wound,
contagious or infectious disease and/or has had surgery within the
fourteen days prior to the Appointment without prior written
authorization from our veterinary team; (ii) the dog has a history of
aggressive behavior towards humans and/or other dogs, including but not
limited to a history of imminent threats or biting, without prior
disclosure; (iii) the dog does not have an up-to-date vaccination
record, including vaccines for Bordetella and rabies where required by
local law; or (iv) the dog has behavioral issues that would prevent safe
blood collection or physical examination. You acknowledge that we are
relying on you to inform us if any of these apply to your pet, and you
agree to provide us with current vaccination records at or before the
time of the Appointment. We reserve the right to cancel the Appointment
at any time, including at the time of service. Appointments cancelled
less than twenty-four (24) hours prior to the Appointment for this
reason are non-refundable, except in our sole discretion.</p>
<p>Before, during, and/or immediately after the Appointment, we may
photograph your pet and use those photographs for marketing purposes,
including on social media. By using the Service, you consent to have
your pet photographed and acknowledge that any such photographs will be
the sole and exclusive property of Wonderdog, and that we may publish
these to third parties (including on social media) in our sole
discretion, pursuant to the provisions of our Privacy Policy. You may
opt out of having your pet\u2019s photograph taken during the Appointment by
emailing us prior to your Appointment at legal@wonder.dog.</p>
<p>During your Appointment, our Vet Techs and Televets will use
appropriate clinical precautions while collecting blood samples and
conducting physical examinations to prevent injury to your pet and/or
others. However, minor adverse events are still possible. This includes,
but is not limited to, stress, bruising, hematoma at the venipuncture
site, skin irritation, nausea, allergic reactions, or activation of
previously unknown or inactive conditions. In our sole discretion, we
may determine that the Appointment cannot be completed as scheduled.</p>
<p>Wonderdog may be required (such as by state or local laws) to report
to the applicable authorities if certain issues arise during an
Appointment. By using the Service, you acknowledge and understand that
if your pet causes injury to a person or another animal (or there is
another issue requiring reporting), we may report this to the relevant
authorities.</p>
<h2>Televet and Vet Tech Scope of Services</h2>
<p>Wonderdog delivers its Service through a coordinated model involving
two distinct roles, each operating within their respective licensed
scope of practice under applicable state law:</p>
<ul>
<li><p>A licensed veterinarian affiliated with Wonderdog operating via
telehealth (\u201cTelevet\u201d) conducts remote consultations, reviews Diagnostic
Results, establishes or maintains a valid VCPR where required by
applicable state law, makes clinical assessments, and exercises all
final clinical judgment. The Televet does not perform hands-on physical
examination.</p></li>
<li><p>A licensed or certified veterinary technician, or veterinary
assistant, (\u201cVet Tech\u201d) may attend your Appointment in person at your
home or a designated location to facilitate blood collection and perform
physical data-gathering tasks \u2014 including but not limited to palpation,
weight measurement, and visual assessment \u2014 under the real-time
synchronous video supervision of the Televet. The Vet Tech does not
diagnose, prescribe, or make independent clinical decisions.</p></li>
</ul>
<p>You acknowledge and agree that:</p>
<ul>
<li><p>The delegation of physical examination tasks to a Vet Tech under
live, synchronous Televet supervision is consistent with applicable
veterinary practice acts and the standard of care in the jurisdiction
where Services are rendered. Wonderdog makes no representation that
this model is authorized in jurisdictions outside its active operating
markets.</p></li>
<li><p>The Vet Tech performing services at your home is acting within
the scope of tasks delegated by the supervising Televet. Any
instructions given by the Vet Tech during the Appointment reflect the
Televet\u2019s clinical direction and do not constitute independent
veterinary advice.</p></li>
<li><p>Wonderdog\u2019s Televets are licensed in the jurisdiction in which
they provide Services and comply with applicable telehealth VCPR
requirements. The specific VCPR standard applicable to your Appointment
may vary by state. By using the Service, you consent to the telehealth
model of care delivery as authorized under the laws of your
state.</p></li>
<li><p>Wonderdog does not guarantee that a Vet Tech will be available
for in-home visits in all service areas. In some cases, Services may be
provided via telehealth consultation only, without an in-person Vet Tech
component, to the extent permitted by applicable law.</p></li>
</ul>
<h1>Membership and Diagnostic Services</h1>
<p>Wonderdog offers an annual membership (the
<strong>\u201cMembership\u201d</strong>) that provides access to our longitudinal
blood biomarker testing, AI-driven health analysis, and telehealth
veterinary consultations. Membership terms, pricing, and included
services are described on our website and may be updated from time to
time in Wonderdog\u2019s sole discretion.</p>
<h2>Membership Billing, Renewal, and Cancellation</h2>
<p>Memberships. Memberships are billed on an annual basis at the
then-current rate displayed on our website at the time of purchase or
renewal. By enrolling in a Membership, you authorize Wonderdog to
charge the applicable annual fee to your payment method on file. All
Membership fees are charged in advance and are non-refundable except as
expressly stated in these Terms.</p>
<p>AUTO-RENEWAL. YOUR MEMBERSHIP WILL AUTOMATICALLY RENEW FOR SUCCESSIVE
ONE-YEAR TERMS AT THE THEN-CURRENT ANNUAL RATE UNLESS YOU CANCEL BEFORE
YOUR RENEWAL DATE. WE WILL SEND A RENEWAL REMINDER TO THE EMAIL ADDRESS
ON FILE AT LEAST THIRTY (30) DAYS BEFORE YOUR RENEWAL DATE, OR SUCH
LONGER PERIOD THAT MAY BE REQUIRED UNDER APPLICABLE LAW. YOU AUTHORIZE
US TO CHARGE YOUR PAYMENT METHOD ON FILE FOR THE RENEWAL FEE WITHOUT
FURTHER NOTICE UNLESS YOU HAVE CANCELLED IN ACCORDANCE WITH THESE
TERMS.</p>
<p>Cancellation. You may cancel your Membership at any time by
contacting us at legal@wonder.dog or through the account management page
on our website, which includes a cancellation click-through link.
Cancellation will take effect at the end of the then-current annual
billing period, and you will retain access to the Service through that
date. We do not provide prorated refunds for unused portions of a
Membership term. Notwithstanding the foregoing, if you cancel within
seven (7) days of your initial Membership purchase and have not yet used
any blood draw, diagnostic, or Televet consultation services included in
your Membership, you may request a full refund by contacting
legal@wonder.dog. This seven-day refund right does not apply to
Membership renewals.</p>
<p>Wonderdog reserves the right to modify Membership pricing upon
reasonable notice. Price changes will take effect at your next renewal
date. If you do not agree to a price change, you must cancel your
Membership before the renewal date on which the new price takes effect.
Continued use of the Service after a price change takes effect
constitutes your acceptance of the new pricing.</p>
<h2>Nature of Diagnostic Results</h2>
<p>All diagnostic results, biomarker reports, and AI-generated health
analyses provided through the Service (collectively, \u201cDiagnostic
Results\u201d) are intended solely for informational and preventive health
monitoring purposes. Diagnostic Results do not constitute a definitive
veterinary diagnosis, a prescription, or a recommended course of
treatment, and must not be relied upon as such. Wonderdog\u2019s biomarker
panels are designed to identify trends and flag potential areas of
concern over time \u2014 they are not a substitute for a comprehensive
in-person veterinary examination.</p>
<p>You expressly acknowledge and agree that:</p>
<ul>
<li><p>Diagnostic Results may include false positives or false
negatives. A result outside a reference range does not confirm the
presence of disease, and a result within a reference range does not
confirm the absence of disease.</p></li>
<li><p>Reference ranges used in Wonderdog\u2019s panels are population-based
estimates and may not reflect the normal baseline for your individual
pet. Breed, age, sex, medication use, recent activity, and other factors
can affect biomarker values.</p></li>
<li><p>Early detection markers, including but not limited to SDMA,
thymidine kinase 1 (TK1), and oncology screening panels, are screening
tools only. A positive or elevated result requires follow-up evaluation
by a licensed veterinarian and does not constitute a diagnosis of kidney
disease, cancer, or any other condition.</p></li>
<li><p>Wonderdog\u2019s AI-powered analysis is a decision-support tool
designed to assist licensed veterinarians in identifying patterns across
longitudinal data. It does not replace, and must not be substituted for,
professional veterinary clinical judgment. You acknowledge and agree
that there are inherent risks for AI-powered analyses that cannot be
fully protected against, including hallucinations or false or misleading
outputs.</p></li>
<li><p>Any clinical decisions \u2014 including but not limited to changes in
medication, diet, further diagnostic testing, or treatment \u2014 must be
made in consultation with a licensed veterinarian who has conducted an
appropriate physical examination and established a valid
veterinarian-client-patient relationship (VCPR) in accordance with
applicable state law.</p></li>
<li><p>You hereby agree that Wonderdog is not responsible for any
outcome \u2014 including delayed diagnosis, misdiagnosis, or treatment
decisions \u2014 arising from your reliance on Diagnostic Results without
appropriate follow-up veterinary care.</p></li>
</ul>
<h1>Late Fees and Other Charges</h1>
<p>If you fail to have your pet available or accessible at the time of a
scheduled at-home Appointment, you will be charged for the time incurred
by the Vet Tech and/or Televet. In addition, you agree to indemnify us
from any and all costs and expenses we incur as a result of your failure
to make your pet available at the scheduled appointment time.</p>
<h1>Indemnification</h1>
<p>To the maximum extent permitted by law, you agree to indemnify,
defend (with counsel reasonably acceptable to us), and hold harmless
Wonderdog Health, Inc. and its licensees and licensors, and our/their
employees, contractors, agents, officers, and managers, from and against
any and all claims, damages, obligations, losses, liabilities, costs or
debt, and expenses (including but not limited to attorney\u2019s fees),
resulting from or arising out of: a) your use of or access to the
Service, including your account; b) your violation of these Terms or any
applicable law; or c) your misrepresentations regarding your pet,
including about your pet\u2019s vaccination status, health history, or
behavioral history.</p>
<p>Additionally, to the maximum extent permitted by law, you agree to
indemnify, defend (with counsel reasonably acceptable to us), and hold
harmless Wonderdog Health, Inc. and its licensees and licensors, and our/their
employees, contractors, agents, officers, and managers, from and against
any and all claims, damages, obligations, losses, liabilities, costs or
debt, and expenses (including but not limited to attorney\u2019s fees)
resulting from or arising out of: a) injuries your pet causes to another
pet or person in our care or in the presence of our staff; b) damages to
property caused by your pet; c) injuries your pet causes to any Wonder
Dog employee, agent, contractor, Televet, Vet Tech, or affiliate; d) any
nuisances, quarantine expenses, or other costs created by your pet;
and/or e) your violation of the conditions of these Terms (including,
without limitation, the prohibited conduct set forth herein).</p>
<h1>Limitation of Liability</h1>
<p><strong>IN NO EVENT SHALL WONDERDOG HEALTH, INC., NOR ITS MANAGERS,
EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, LICENSORS, OR AFFILIATES, BE
LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE,
GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO
OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE, INCLUDING YOUR
ACCOUNT; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE;
(III) UNAUTHORIZED ACCESS TO, USE OF, OR ALTERATION OF YOUR
TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT
(INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE
HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A
REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED ITS ESSENTIAL
PURPOSE.</strong></p>
<p><strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WONDERDOG
INC. ASSUMES NO LIABILITY OR RESPONSIBILITY FOR (I) ANY ERRORS,
MISTAKES, OR INACCURACIES OF CONTENT OR DIAGNOSTIC RESULTS; (II) ANY
PERSONAL INJURY OR PROPERTY DAMAGE OF ANY NATURE WHATSOEVER RESULTING
FROM YOUR ACCESS TO OR USE OF OUR SERVICE, INCLUDING YOUR APPOINTMENTS;
(III) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS OR YOUR ACCOUNT
AND/OR ANY AND ALL PERSONAL INFORMATION OR PET HEALTH DATA STORED
THEREIN; (IV) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM
THE SERVICE; (V) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE THAT MAY
BE TRANSMITTED TO OR THROUGH OUR SERVICE BY ANY THIRD PARTY; (VI) ANY
ERRORS OR OMISSIONS IN ANY CONTENT OR DIAGNOSTIC REPORT OR FOR ANY LOSS
OR DAMAGE INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED,
EMAILED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE THROUGH THE SERVICE;
(VII) ANY USER OR OTHER THIRD-PARTY CONTENT OR THE DEFAMATORY,
OFFENSIVE, OR ILLEGAL CONDUCT OF ANY USER OR THIRD PARTY; (VIII) ANY
INJURY OR ILLNESS OF YOUR PET WHILE RECEIVING OUR SERVICES; (IX) ANY
INJURY, ILLNESS, OR LOSS OF YOUR PET RESULTING FROM OUR ATTEMPT TO
PROVIDE YOUR PET WITH CARE IN THE EVENT OF AN EMERGENCY; AND/OR (X) THE
LOSS AND/OR DEATH OF YOUR PET WHILE IN OUR CARE.</strong></p>
<p><strong>THIS LIMITATION OF LIABILITY SECTION APPLIES WHETHER THE
ALLEGED LIABILITY IS BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT
LIABILITY, OR ANY OTHER BASIS, EVEN IF WONDERDOG HEALTH, INC. HAS BEEN ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE. THE FOREGOING LIMITATIONS OF
LIABILITY SHALL APPLY TO THE FULLEST EXTENT PERMITTED BY LAW IN THE
APPLICABLE JURISDICTION.</strong></p>
<p><strong>NOTWITHSTANDING ANY OTHER PROVISION OF THESE TERMS, IN NO
EVENT SHALL WONDERDOG HEALTH, INC.\u2019S TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL
CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE \u2014 WHETHER
BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER
LEGAL THEORY \u2014 EXCEED THE GREATER OF: (A) THE TOTAL FEES ACTUALLY PAID
BY YOU TO WONDERDOG IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE
EVENT GIVING RISE TO THE CLAIM; OR (B) ONE HUNDRED U.S. DOLLARS ($100).
THIS CAP APPLIES TO ALL CLAIMS IN THE AGGREGATE, NOT PER CLAIM, AND
SHALL APPLY EVEN IF WONDERDOG HAS BEEN ADVISED OF THE POSSIBILITY OF
SUCH DAMAGES AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE
FAILED ITS ESSENTIAL PURPOSE. THE EXISTENCE OF MORE THAN ONE CLAIM WILL
NOT ENLARGE THIS LIMIT.</strong></p>
<h1>Disclaimer</h1>
<p><strong>YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS
PROVIDED ON AN \u201cAS IS\u201d AND \u201cAS AVAILABLE\u201d BASIS. THE SERVICE IS PROVIDED
WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING,
BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
DIAGNOSTIC RESULTS, AI-GENERATED HEALTH REPORTS, AND TELEHEALTH
CONSULTATIONS PROVIDED THROUGH THE SERVICE ARE INTENDED TO SUPPLEMENT,
NOT REPLACE, IN-PERSON VETERINARY CARE.</strong></p>
<p><strong>WONDERDOG HEALTH, INC. AND ITS SUBSIDIARIES, AFFILIATES, AND
LICENSORS DO NOT WARRANT THAT A) THE SERVICE WILL FUNCTION OR BE
UNINTERRUPTED, SECURE, OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION;
B) ANY ERRORS OR DEFECTS WILL BE CORRECTED; C) THE SERVICE IS FREE OF
VIRUSES OR OTHER HARMFUL COMPONENTS; OR D) THE RESULTS OF USING THE
SERVICE WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS.</strong></p>
<h1>Exclusions</h1>
<p>Some jurisdictions do not allow the exclusion of certain warranties
or the exclusion or limitation of liability for consequential or
incidental damages, so the limitations above may not apply to you.</p>
<h1>Emergencies</h1>
<p>You hereby authorize us to obtain and authorize the provision of
veterinary or other emergency care for your pet if you cannot be reached
to authorize care yourself in an emergency situation. In such case, you
also authorize your pet\u2019s veterinarian to release your pet\u2019s veterinary
records to us. Wonderdog will make reasonable efforts to contact you
before authorizing emergency care and, where practicable, will attempt
to obtain verbal or written authorization from you prior to incurring
costs on your behalf. You are responsible for the costs of any medical
or emergency care or treatment reasonably authorized for your pet on
your behalf; provided, however, that Wonderdog will not authorize
emergency expenditures exceeding five hundred U.S. dollars ($500) on
your behalf without first making reasonable attempts to reach you,
unless the delay would, in the reasonable clinical judgment of the
attending Televet or treating veterinarian, create an imminent risk to
the life of your pet. Any emergency costs authorized in excess of this
threshold will be communicated to you as promptly as practicable.</p>
<p>In some cases, Wonderdog\u2019s Vet Techs and/or Televets may attempt to
provide guidance or care to your pet in an emergency situation, either
in lieu of or in addition to reaching out to a veterinarian. You
authorize us to provide such guidance on your pet\u2019s behalf.</p>
<h1>Changes</h1>
<p>Wonderdog reserves the right, in its sole discretion, to modify or
replace these Terms at any time. When we make material changes, we will
provide you with reasonable advance notice by sending an email to the
address associated with your account and/or by posting a prominent
notice on our website, no less than thirty (30) days before the changes
take effect (or such shorter period as required by law). Non-material
changes may take effect immediately upon posting. The most current
version of the Terms will always be available on our website and will
supersede all prior versions. Your continued access to or use of the
Service after the effective date of any modification constitutes your
acceptance of the revised Terms. If you do not agree to the revised
Terms, you must stop using the Service and, if applicable, cancel your
Membership before the effective date of the changes. Cancellations made
in response to a material change in Terms will be treated as
cancellations made for cause; in such cases, Wonderdog will provide a
prorated refund of any prepaid but unused Membership fees covering
periods after the effective date of the change.</p>
<h1>DMCA Notice and Procedure for Copyright Infringement Claims</h1>
<p>You may submit a notification pursuant to the Digital Millennium
Copyright Act (\u201cDMCA\u201d) by providing us with the following information in
writing (see 17 U.S.C. \u00a7512(c)(3) for further details): an electronic or
physical signature of the person authorized to act on behalf of the
owner of the copyright\u2019s interest; a description of the copyrighted work
that you claim has been infringed, including the URL of the location
where the copyrighted work exists or a copy of the copyrighted work;
identification of the URL or other specific location on the Service
where the material that you claim is infringing is located; your
address, telephone number, and email address; a statement by you that
you have a good faith belief that the disputed use is not authorized by
the copyright owner, its agent, or the law; a statement by you, made
under penalty of perjury, that the above information in your notice is
accurate and that you are the copyright owner or authorized to act on
the copyright owner\u2019s behalf. We may terminate your account or use of
the Service if you are a repeat infringer under a repeat infringer
policy.</p>
<p>DMCA notices may be sent to:</p>
<p><strong>Wonderdog Health, Inc.</strong></p>
<p><a href="mailto:legal@wonder.dog">legal@wonder.dog</a></p>
<p>Additional Prohibited ConductYou shall not engage in any of the
following activities at any time with respect to the Wonderdog website:
(a) the impersonation of any person or entity, (b) any act that
infringes or otherwise violates the intellectual property, privacy, or
publicity rights of any person or entity, (c) the reproduction of the
website or its content (including, without limitation, the Service) or
the creation of any derivative works of the website or its content
(including, without limitation, the Service), (d) the publication of any
content that is objectionable or illegal (including content that is
defamatory, disparaging, false, misleading, threatening, or abusive),
(e) the publication of any machine, computer, or randomly-generated
content, (f) any act intended or designed to drive traffic to or boost
the search rankings of third-party websites, networks, platforms,
servers, or applications, (g) the systematic retrieval or copying of any
information or content found on or through the website to directly or
indirectly create or compile a collection, compilation, database, or
directory, (h) any act or the use of any software, program, or process
to monitor, copy, disrupt, damage, or impermissibly access the website
or its infrastructure, (i) any act that involves or concerns decrypting,
security bypassing, hacking, data mining, or the like on or through the
website, or (j) any other act that Wonderdog becomes aware of and
believes in good faith is improper, illegal, or harmful to the website
or its servers, or any person, entity, or property. Wonderdog reserves
the right to take down or otherwise exclude from the website, without
notice or recourse, any content made or submitted by you that Wonderdog
believes in its sole discretion to be in violation of the foregoing
prohibited activities or that Wonderdog otherwise considers to be
unsuitable for the website.</p>
<h1>Linked Technologies</h1>
<p>The Wonderdog website or any communications sent as a function of
the website (including, without limitation, the Service) may contain
links to third-party websites or applications and, similarly,
third-party websites or applications may contain links to the Wonderdog
website (collectively, the \u201c<strong>Linked Technologies</strong>\u201d). The
Linked Technologies are not under the control of Wonderdog or the
Wonderdog website, and any such communications contain the outgoing
links as a convenience to you.</p>
<p><strong>Wonderdog is not responsible for any information, goods,
services, or other content that may be found on or excluded from the
Linked Technologies (including malicious software, inaccurate
information, and illegal content). Wonderdog does not make any
representations or warranties (whether express, implied, or otherwise)
concerning the terms of use, privacy policies, agreements, information,
goods, services, or other content that may be found on or excluded from
the Linked Technologies. The fact that the Wonderdog website may link
to or from any Linked Technologies shall not constitute an affiliation
with, association with, or endorsement of such Linked Technologies, and
their information, goods, services, or other content. If you decide to
access any Linked Technologies, then you do so at your own
risk.</strong></p>
<h1>Miscellaneous</h1>
<p>These Terms constitute the entire agreement between the parties as to
the matters in these Terms and supersede any prior agreements. These
Terms do not create any agency, partnership, employer, or joint venture
relationship. Use of the Service, including creation and use of an
account, constitutes your consent to receiving communications from us,
including emails with marketing offers and information about your
account and your pet\u2019s health. The parties shall not be liable for any
event beyond that party\u2019s reasonable control, such as a war, epidemic,
natural disaster, government order or regulation, explosion, fire,
strike, act of God, or other force majeure event. If any provision of
these Terms is ruled to be invalid or unenforceable, the remainder of
the Terms shall continue to be valid and enforceable, and to this end
these Terms are severable.</p>
<h1>Contact Us</h1>
<p>Wonderdog welcomes your questions or comments regarding the
Terms.</p>
<p>Please contact us at <strong>legal@wonder.dog</strong>.</p>`;

export default function TermsAndConditions() {
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
            &larr; Wonderdog
          </Link>

          <h1 className="mt-8 text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em]">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-[13px] text-[oklch(0.5_0_0)]">
            Effective Date: March 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <div
            className="mt-12 text-[14px] sm:text-[15px] leading-relaxed text-[oklch(0.82_0_0)] [&_h1]:text-[20px] [&_h1]:sm:text-[22px] [&_h1]:font-semibold [&_h1]:text-[oklch(0.985_0_0)] [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:text-[17px] [&_h2]:sm:text-[18px] [&_h2]:font-semibold [&_h2]:text-[oklch(0.985_0_0)] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-[15px] [&_h3]:sm:text-[16px] [&_h3]:font-semibold [&_h3]:text-[oklch(0.985_0_0)] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2 [&_li]:pl-1 [&_a]:underline [&_a]:text-white/80 [&_strong]:text-white/95 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-white/20 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-white/95 [&_td]:border [&_td]:border-white/20 [&_td]:px-3 [&_td]:py-2"
            dangerouslySetInnerHTML={{ __html: termsHTML }}
          />
        </motion.div>

        <footer className="mt-16 flex flex-col gap-4 border-t border-[oklch(1_0_0_/_10%)] pt-8">
          <div className="flex gap-4 text-[12px] text-[oklch(0.5_0_0)]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link>
          </div>
          <p className="text-[11px] text-[oklch(0.4_0_0)]">
            &copy; 2026 Wonderdog
          </p>
        </footer>
      </div>
    </main>
  );
}
