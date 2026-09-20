import React, { useEffect } from 'react';
import {
  Shield,
  Lock,
  FileText,
  Trash2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Database,
  Server,
  Clock,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { SEOLink } from './SEOLink';

interface PrivacyPolicyPageProps {
  navigate: (route: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ navigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Privacy Policy — Gauge House Pakistan';
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>Back to Storefront</span>
          </button>

          <span className="text-xs text-neutral-400">
            Effective Date: September 20, 2026
          </span>
        </div>

        {/* Header Hero Card */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-500 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Official Legal Policy
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Gauge House Privacy Policy
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl">
            This Privacy Policy explains how <strong>Gauge House</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operating in Pakistan as an established industrial equipment supplier, importer, and exporter (est. 1998), collects, uses, stores, and protects personal information when you use our web application, mobile application, customer account services, and industrial procurement platform.
          </p>

          <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Google Play Policy Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-orange-400" />
              <span>Firebase Cloud Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-neutral-400" />
              <span>Full Account Deletion Supported</span>
            </div>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-6">
          {/* Section 1: Business Identity & Scope */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                1. Application Overview & Scope
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                Gauge House provides an industrial instrumentation e-commerce and procurement platform. Through our web application and mobile application, clients and engineers can browse verified industrial products (such as pressure gauges, vacuum gauges, temperature thermometers, digital indicators, and 4-20mA pressure transmitters), request technical quotations, manage cart selections, place orders, and review past procurement records.
              </p>
              <p>
                This policy applies to all users accessing our digital storefront hosted at{' '}
                <a
                  href="https://gaugehouse1998-debug.github.io/gauge-house-webapp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  https://gaugehouse1998-debug.github.io/gauge-house-webapp/
                </a>{' '}
                and our corresponding Android mobile application published on Google Play.
              </p>
            </div>
          </section>

          {/* Section 2: Personal Information We Collect */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                2. Information We Collect
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                We collect only the essential personal information required to authenticate customer accounts, fulfill physical industrial shipments, and provide responsive customer service:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Account & Profile Data
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs">
                    <li>Full Name</li>
                    <li>Email Address (used for authentication and receipts)</li>
                    <li>Password (securely hashed via Firebase Auth)</li>
                    <li>Contact / Mobile Telephone Number</li>
                    <li>Account creation timestamp</li>
                  </ul>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Delivery & Fulfillment Data
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs">
                    <li>Destination City</li>
                    <li>Complete Physical Street Address</li>
                    <li>Province / Postal Region</li>
                    <li>Recipient Contact Number</li>
                    <li>Delivery preference (Courier, Cargo, or Self Pickup)</li>
                  </ul>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Cart & Order Information
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs">
                    <li>Items in shopping cart and item quantities</li>
                    <li>Technical product specifications selected</li>
                    <li>Order status, subtotal, and total amount (PKR)</li>
                    <li>Payment method chosen (Bank Transfer / COD / Pickup)</li>
                    <li>Order history and tracking records</li>
                  </ul>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Customer Support & Communications
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs">
                    <li>Direct inquiries sent to gaugehouse1998@gmail.com</li>
                    <li>WhatsApp messages sent to our official number</li>
                    <li>Quotations requested for corporate tenders</li>
                    <li>Feedback and technical inquiries</li>
                  </ul>
                </div>
              </div>

              <div className="bg-neutral-900 border-l-4 border-orange-500 p-3 rounded-r-xl mt-4 text-xs text-neutral-300">
                <strong>What We Do NOT Collect:</strong> Gauge House does not collect sensitive biometric data, real-time GPS background tracking, advertising identifiers (IDFA/GAID), contact book access, audio/camera streams, or payment card CVV numbers. Payments are arranged via direct interbank transfer, Cash on Delivery, or in-person pickup.
              </div>
            </div>
          </section>

          {/* Section 3: Third-Party Services & Firebase Infrastructure */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <Server className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                3. Third-Party Services & Infrastructure
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                To provide a secure and reliable experience, Gauge House integrates established Google Cloud and Firebase services:
              </p>

              <div className="space-y-3 pt-1">
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-1">
                    Google Firebase Authentication
                  </h4>
                  <p className="text-neutral-400 text-xs">
                    Used to authenticate customer accounts securely. Firebase Authentication handles password hashing (using industry-standard scrypt/bcrypt algorithms), token generation, and account session security. We never store or view raw plaintext passwords.
                  </p>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-1">
                    Google Firebase Cloud Firestore
                  </h4>
                  <p className="text-neutral-400 text-xs">
                    A managed, highly secure cloud database used to store published product catalog data, customer profile records, shopping carts, and completed order documents. Data is protected by strict Firestore Security Rules restricting customer order access exclusively to the authenticated account owner and authorized administrators.
                  </p>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-1">
                    Google Firebase Cloud Storage
                  </h4>
                  <p className="text-neutral-400 text-xs">
                    Used to securely host product reference images, technical specification datasheets, and customer payment deposit proofs (where uploaded by customers during checkout).
                  </p>
                </div>

                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-1">
                    Nationwide Logistics & Courier Carriers
                  </h4>
                  <p className="text-neutral-400 text-xs">
                    When you order products for physical delivery, your name, destination address, and recipient contact number are shared strictly with verified courier and logistics providers (such as TCS or local cargo networks) solely for parcel transportation and delivery confirmation.
                  </p>
                </div>
              </div>

              <p className="text-xs text-neutral-400 pt-1">
                Google&apos;s privacy practices and compliance information can be reviewed directly in the{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 inline-flex items-center gap-1"
                >
                  <span>Google Privacy Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>
          </section>

          {/* Section 4: How We Use Your Information */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                4. How We Use Collected Information
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
              <p>We use your personal data strictly for legitimate operational purposes:</p>
              <ul className="list-disc list-inside space-y-1.5 text-neutral-300 text-xs sm:text-sm pl-1">
                <li>
                  <strong>Order Fulfillment:</strong> Processing, packaging, calibrating, and dispatching ordered industrial instruments to your designated address or preparing them for Self Pickup at Gauge House.
                </li>
                <li>
                  <strong>Account Management:</strong> Authenticating your login sessions, maintaining your active cart, and displaying your verified order history.
                </li>
                <li>
                  <strong>Customer Service & Notifications:</strong> Communicating order confirmations, tracking numbers, quotation responses, and pickup availability alerts.
                </li>
                <li>
                  <strong>Security & Fraud Prevention:</strong> Verifying administrative access and preventing unauthorized orders or bot abuse.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> Maintaining commercial invoices, billing records, and taxation documentation required by Pakistani commercial law.
                </li>
              </ul>
              <p className="text-xs text-neutral-400 pt-2">
                We do not sell, rent, monetize, or trade your personal data to any third-party marketing brokers or advertisers.
              </p>
            </div>
          </section>

          {/* Section 5: Data Security & Storage */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                5. Data Storage & Security
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                We implement comprehensive technical and organizational measures to safeguard your personal information against unauthorized access, disclosure, alteration, or loss:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-neutral-300 text-xs sm:text-sm pl-1">
                <li>
                  <strong>End-to-End Encryption in Transit:</strong> All data exchanged between your web browser or mobile app and our servers is encrypted using modern Transport Layer Security (HTTPS / TLS 1.3).
                </li>
                <li>
                  <strong>Encrypted at Rest:</strong> Cloud Firestore and Firebase Storage utilize Google&apos;s standard AES-256 server-side encryption at rest.
                </li>
                <li>
                  <strong>Role-Based Access Control:</strong> Access to customer orders and administrative controls is strictly restricted to verified Gauge House management accounts.
                </li>
                <li>
                  <strong>Session Security:</strong> Authentication tokens are secured and renewed automatically through Firebase client libraries.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6: Data Retention */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                6. Data Retention Policy
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
              <p>
                We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-neutral-300 text-xs sm:text-sm pl-1">
                <li>
                  <strong>Active Accounts:</strong> Account information, contact numbers, and saved addresses are retained as long as your account remains open and in good standing.
                </li>
                <li>
                  <strong>Completed Orders:</strong> Order receipts, invoice data, and transaction records are retained for historical warranty validation and accounting records as mandated by commercial standards.
                </li>
                <li>
                  <strong>Upon Deletion:</strong> If you request account deletion, your personal authentication records and user profile documents are permanently deleted or anonymized within 30 days.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7: Account & Data Deletion (Google Play Console Mandatory) */}
          <section className="bg-neutral-950 border border-orange-500/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                7. Account & Data Deletion Requests
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                In compliance with <strong>Google Play Console Developer Policies</strong> and global privacy standards, Gauge House provides all users with clear, frictionless mechanisms to delete their account and associated personal data:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Method A: In-App Deletion */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-1">
                    Option A (Direct in App / Web)
                  </span>
                  <h3 className="font-semibold text-white mb-2">In-App Account Deletion</h3>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-300">
                    <li>Log into your account in the web app or mobile app.</li>
                    <li>Navigate to the <strong>Customer Account</strong> area.</li>
                    <li>Open <strong>Profile & Settings</strong>.</li>
                    <li>Click <strong>&ldquo;Delete Account & Data&rdquo;</strong> and confirm.</li>
                  </ol>
                  <p className="text-neutral-400 text-xs mt-2">
                    Your profile document in Firestore is deleted immediately, and your Firebase session is closed.
                  </p>
                </div>

                {/* Method B: Remote / Email Request */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-1">
                    Option B (Email / Contact)
                  </span>
                  <h3 className="font-semibold text-white mb-2">Manual Deletion Request</h3>
                  <p className="text-xs text-neutral-300 mb-2">
                    You can request complete deletion of your account and personal records at any time without logging in:
                  </p>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-xs space-y-1 text-neutral-300">
                    <div>
                      <strong>Email:</strong>{' '}
                      <a href="mailto:gaugehouse1998@gmail.com" className="text-orange-400 hover:underline">
                        gaugehouse1998@gmail.com
                      </a>
                    </div>
                    <div>
                      <strong>Subject:</strong> Account / Data Deletion Request
                    </div>
                    <div>
                      <strong>Details:</strong> Provide your registered email and phone number.
                    </div>
                  </div>
                  <p className="text-neutral-400 text-xs mt-2">
                    All valid requests are processed within <strong>30 days</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-neutral-400">
                <em>Note:</em> Data essential for completed physical deliveries, official tax invoices, or active warranty claims may be archived in anonymized form strictly to satisfy statutory commercial obligations.
              </div>
            </div>
          </section>

          {/* Section 8: Children's Privacy */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                8. Children&apos;s Privacy
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
              <p>
                Our services are directed strictly to commercial businesses, procurement officers, engineers, and adults aged 18 and older. We do not knowingly solicit or collect personal information from children under the age of 13.
              </p>
              <p>
                If we discover that a child under 13 has provided us with personal data, we will immediately take steps to permanently delete such information from our Firebase databases. If you believe a minor has registered an account, please notify us immediately at{' '}
                <a href="mailto:gaugehouse1998@gmail.com" className="text-orange-400 underline">
                  gaugehouse1998@gmail.com
                </a>.
              </p>
            </div>
          </section>

          {/* Section 9: Changes to this Policy */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                9. Changes to this Privacy Policy
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
              <p>
                We may periodically update this Privacy Policy to reflect enhancements in our application features, operational workflows, or regulatory requirements. Any modifications will be posted directly to this page with an updated &ldquo;Effective Date&rdquo; displayed at the top.
              </p>
              <p>
                Continued use of the Gauge House application or website following the posting of updates constitutes your acknowledgment and acceptance of the revised policy terms.
              </p>
            </div>
          </section>

          {/* Section 10: Contact Information */}
          <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                10. Contact Information & Privacy Queries
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact the Gauge House administration team:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white font-semibold mb-1">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span>Email Support</span>
                  </div>
                  <a
                    href="mailto:gaugehouse1998@gmail.com"
                    className="text-xs text-orange-400 hover:underline break-all"
                  >
                    gaugehouse1998@gmail.com
                  </a>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white font-semibold mb-1">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span>Direct Telephone</span>
                  </div>
                  <a
                    href="tel:03354499186"
                    className="text-xs text-orange-400 hover:underline"
                  >
                    0335-4499186 / +92 335 4499186
                  </a>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-white font-semibold mb-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>Headquarters</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Gauge House, Pakistan
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-neutral-400">
                Official Website:{' '}
                <a
                  href="https://gaugehouse1998-debug.github.io/gauge-house-webapp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline"
                >
                  https://gaugehouse1998-debug.github.io/gauge-house-webapp/
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-8 text-center">
          <SEOLink
            to="/"
            navigate={navigate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Gauge House Home</span>
          </SEOLink>
        </div>
      </div>
    </div>
  );
};
