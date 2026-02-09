import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'TesoTunes Terms of Service and usage agreement.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: February 2025</p>

      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using TesoTunes, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the platform. These terms apply to all users,
            including artists, listeners, and visitors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            TesoTunes provides a platform for streaming, discovering, and supporting East African music.
            You may use the service for personal, non-commercial purposes. You agree not to misuse
            the service or interfere with its normal operation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the security of your account and password.
            You must provide accurate information when creating an account. You may not share
            your account credentials or use another person&apos;s account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Content & Copyright</h2>
          <p className="text-muted-foreground leading-relaxed">
            All music, artwork, and content on TesoTunes is protected by copyright.
            Unauthorized reproduction, distribution, or modification of content is prohibited.
            Artists retain ownership of their original works uploaded to the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Subscriptions & Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            Some features require a paid subscription. Subscription fees are billed in advance
            and are non-refundable except as required by law. You can cancel your subscription
            at any time from your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Artist Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            Artists who upload content to TesoTunes grant the platform a license to stream
            and display their content. Artists are responsible for ensuring they have the
            rights to upload and distribute their content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Community Guidelines</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users must respect other community members. Harassment, hate speech, spam,
            and illegal content are prohibited. Violations may result in account suspension
            or termination.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            TesoTunes is provided &quot;as is&quot; without warranties of any kind. We are not
            liable for any damages arising from the use of the service. Service may be
            interrupted for maintenance or updates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms from time to time. Continued use of the service
            after changes constitutes acceptance of the updated terms. We will notify
            users of significant changes via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions regarding these terms, please contact us at{' '}
            <a href="mailto:legal@tesotunes.com" className="text-primary hover:underline">
              legal@tesotunes.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
