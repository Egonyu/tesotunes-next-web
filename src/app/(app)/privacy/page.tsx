import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'TesoTunes Privacy Policy - how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: February 2025</p>

      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly, including your name, email address,
            and profile details when you create an account. We also collect usage data such
            as listening history, search queries, and interaction patterns to improve your experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use your information to provide and improve our services, personalize your
            music recommendations, process payments, communicate with you about your account,
            and ensure platform security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell your personal information. We may share data with service providers
            who help us operate the platform, such as payment processors and analytics services.
            We may also share information when required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate technical and organizational measures to protect your
            personal data against unauthorized access, alteration, disclosure, or destruction.
            This includes encryption, secure servers, and regular security audits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies & Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to maintain your session, remember preferences,
            and analyze usage patterns. You can manage cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to access, update, or delete your personal information.
            You can manage your data through your account settings or contact us directly.
            You may also request a copy of all data we hold about you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal data for as long as your account is active or as needed
            to provide services. When you delete your account, we remove your personal data
            within 30 days, except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            TesoTunes is not intended for children under 13. We do not knowingly collect
            personal information from children. If you believe a child has provided us
            with personal data, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes through email or a prominent notice on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy, please contact our Data Protection
            team at{' '}
            <a href="mailto:privacy@tesotunes.com" className="text-primary hover:underline">
              privacy@tesotunes.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
