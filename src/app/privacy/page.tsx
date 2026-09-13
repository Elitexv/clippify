import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Clippifi",
  description: "How Clippifi collects, uses, and protects your information.",
};

const UPDATED = "September 13, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains what information Clippifi collects, why, and how it&apos;s
        used, stored, and protected. It also covers cookies and similar technologies — Clippifi
        doesn&apos;t maintain a separate cookie policy, since our footprint there is small enough
        to cover in one place (Section 6).
      </p>

      <h2>1. Information we collect</h2>
      <h3>Account information</h3>
      <ul>
        <li>Name, username, email address, and the role you choose (Brand, Creator, or both).</li>
        <li>
          If you sign up or log in with Google or Apple, we receive your name, email, and profile
          identifier from that provider — we never see or store your Google/Apple password.
        </li>
        <li>Account status (active/suspended) and role, which an admin can change.</li>
      </ul>
      <h3>Content you provide</h3>
      <ul>
        <li>Clip videos you upload or link, campaign flyers, campaign briefs and budgets.</li>
        <li>
          Any view/like counts we fetch on your behalf from YouTube (for a pasted YouTube link) or
          from your own connected TikTok account (see Section 3).
        </li>
      </ul>
      <h3>Payment and transaction records</h3>
      <ul>
        <li>
          When a campaign payment is made, we record the amount, the payment provider used, a
          transaction reference, and whether it succeeded or failed. This is for accounting,
          support, and fraud-prevention purposes.
        </li>
        <li>
          <strong>We never receive or store your full card number, CVV, or bank login details.</strong>{" "}
          Those are entered directly with our payment providers (Paystack, and — where an admin has
          enabled them — Flutterwave, Stripe, or bank transfer details), who process the payment
          under their own privacy and security terms.
        </li>
      </ul>
      <h3>Technical information</h3>
      <ul>
        <li>
          Basic device/browser information gathered automatically by our hosting and error-logging
          infrastructure (Firebase/Google Cloud), used only to keep the Platform running and to
          debug problems.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To create and operate your account, and to show your content to the right audience.</li>
        <li>To process campaign payments and track what a creator has earned and is owed.</li>
        <li>To moderate submitted clips and enforce our Terms of Service.</li>
        <li>To respond to support requests sent to our contact email.</li>
        <li>
          To detect and prevent fraud, abuse, or violations of our Terms — for example, reviewing
          transaction records for suspicious patterns.
        </li>
      </ul>
      <p>
        We do not sell your personal information to third parties, and we do not use your content
        or account data for advertising.
      </p>

      <h2>3. Third-party platform connections (TikTok and YouTube)</h2>
      <h3>TikTok (&ldquo;Connect TikTok&rdquo;)</h3>
      <p>
        From your Profile page, you can optionally connect a TikTok account using TikTok&apos;s
        official Login Kit. If you do, TikTok shares with us: your TikTok user ID, display name,
        and an access/refresh token scoped to the <code>user.info.basic</code> and{" "}
        <code>video.list</code> permissions you approve. We use this only to look up view and like
        counts for videos on <strong>your own</strong> connected account when you submit a matching
        TikTok link as a clip — we do not read your private messages, followers, or any data
        outside those two scopes, and we never post on your behalf. Your TikTok tokens are stored
        under your own user record and are only ever readable by you (or an admin, for support
        purposes) — see Section 5. You can disconnect at any time from your Profile page, which
        deletes the stored tokens immediately. Your use of TikTok itself remains subject to{" "}
        <a href="https://www.tiktok.com/legal/page/row/privacy-policy/en" target="_blank" rel="noopener noreferrer">
          TikTok&apos;s own Privacy Policy
        </a>
        .
      </p>
      <h3>YouTube</h3>
      <p>
        When a creator pastes a YouTube link while submitting a clip, Clippifi uses the YouTube
        Data API to look up that video&apos;s publicly available view and like counts. This
        doesn&apos;t require you to log in to YouTube or grant us any access to a YouTube account —
        it&apos;s a lookup of public data about the video itself. This feature is provided using
        YouTube API Services, and by using it you also agree to be bound by the{" "}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
          YouTube Terms of Service
        </a>
        , and Google&apos;s use of information is governed by the{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google Privacy Policy
        </a>
        .
      </p>

      <h2>4. Where your data is stored</h2>
      <p>
        Clippifi runs on Firebase and Google Cloud infrastructure (authentication, database, file
        storage). As a result, your data may be processed or stored on servers located outside
        Nigeria. We rely on Firebase&apos;s own security and compliance program for the
        infrastructure layer, and we apply our own access rules on top of it (Section 5) to control
        who can read or change what.
      </p>

      <h2>5. Data access and security</h2>
      <p>
        Access to your data is controlled by security rules enforced at the database level, not
        just in the app&apos;s interface. In practice, that means:
      </p>
      <ul>
        <li>You can always read and update your own profile, content, and TikTok connection.</li>
        <li>
          A brand can see clips submitted to their own campaigns; other users&apos; private data
          (like stored TikTok tokens or transaction history) isn&apos;t exposed to them.
        </li>
        <li>
          Admins have broader access needed to moderate content, manage accounts, and configure the
          Platform — this access is limited to accounts we&apos;ve explicitly granted the admin
          role.
        </li>
        <li>
          Payment-provider secret keys are configured by admins and are never exposed to regular
          users or stored anywhere accessible from the browser.
        </li>
      </ul>
      <p>
        No system is perfectly secure, and we can&apos;t guarantee absolute security of information
        transmitted over the internet. If we become aware of a data breach affecting your personal
        information, we&apos;ll notify you and the relevant regulator as required by law.
      </p>

      <h2>6. Cookies and local storage</h2>
      <p>Clippifi doesn&apos;t use advertising or cross-site tracking cookies. What we do use:</p>
      <ul>
        <li>
          <strong>Sign-in session data</strong> — kept by Firebase Authentication in your
          browser&apos;s local storage/IndexedDB, so you stay signed in between visits. This is
          essential to the Platform working and isn&apos;t used for tracking across other sites.
        </li>
        <li>
          <strong>A short-lived TikTok OAuth cookie</strong> (<code>tiktok_oauth_state</code>) — set
          only during the few minutes of the &quot;Connect TikTok&quot; flow, used to verify the
          request came from you and not an attacker. It expires automatically after 10 minutes and
          is deleted as soon as the connection completes.
        </li>
        <li>
          <strong>A theme preference</strong> (light/dark mode) stored locally in your browser, used
          only to remember your display preference.
        </li>
      </ul>
      <p>
        You can clear local storage or cookies from your browser at any time; doing so will simply
        sign you out and reset your theme preference.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, or request deletion
        of your personal information, or to object to certain processing. We aim to honor these
        rights consistent with the Nigeria Data Protection Act, 2023, and its regulations, as well
        as other applicable data protection law. To make a request, email{" "}
        <a href="mailto:support@clippii.com">support@clippii.com</a> from the email address on your
        account. We may need to verify your identity before acting on a request.
      </p>
      <p>
        Deleting your account removes your profile and stops future processing of your data for
        the purposes above, but we may retain transaction records and limited account information
        where we&apos;re legally required to (for example, financial record-keeping) or where
        needed to resolve an ongoing dispute.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>
        Clippifi requires users to be at least 15 years old, and requires parental or guardian
        consent for anyone under 18 (see our{" "}
        <a href="/terms">Terms of Service</a>). We do not knowingly collect personal information
        from anyone under 15. If you believe a child under 15 has created an account, please
        contact us at <a href="mailto:support@clippii.com">support@clippii.com</a> so we can
        investigate and remove it if appropriate.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy as the Platform changes — for example, if we add a new
        third-party integration. We&apos;ll update the date at the top of this page when we do, and
        make a reasonable effort to flag material changes in-app.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions, requests, or concerns about this Privacy Policy can be sent to{" "}
        <a href="mailto:support@clippii.com">support@clippii.com</a>.
      </p>
    </LegalLayout>
  );
}
