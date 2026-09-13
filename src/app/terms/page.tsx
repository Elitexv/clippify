import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — Clippifi",
  description: "The terms that govern your use of Clippifi.",
};

const UPDATED = "September 13, 2026";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated={UPDATED}>
      <p>
        Clippifi (&ldquo;Clippifi,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
        is an independent platform currently operated by an individual and not yet incorporated as
        a registered company. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
        and use of the Clippifi website, mobile app, and related services (together, the{" "}
        &ldquo;Platform&rdquo;). By creating an account or otherwise using the Platform, you agree
        to these Terms. If you do not agree, do not use the Platform.
      </p>

      <h2>1. What Clippifi is</h2>
      <p>
        Clippifi connects two kinds of users:
      </p>
      <ul>
        <li>
          <strong>Brands</strong> — who post paid clipping campaigns describing a budget, a
          channel or content link, and a payout amount they&apos;re willing to pay per approved
          clip.
        </li>
        <li>
          <strong>Creators</strong> — who submit clips (by link or file upload) to open campaigns,
          hoping to have them approved by the brand or an admin.
        </li>
      </ul>
      <p>
        An account can hold either role, or both. Approved clips are shown on the Platform&apos;s
        Browse Clips page as a public showcase of creators&apos; work — <strong>clips are not for
        sale and cannot be purchased or licensed through the Platform.</strong> The only money that
        moves through Clippifi is a brand&apos;s campaign payment and, separately, what a brand or
        admin decides to pay a creator for an approved clip — see Section 5 and our{" "}
        <Link href="/refund-policy">Refund &amp; Payout Policy</Link>.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 15 years old to create an account. If you are under 18, you confirm
        that a parent or legal guardian has reviewed and agreed to these Terms on your behalf, and
        that they consent to your use of any payment or payout features. We may ask for proof of
        this consent at any time and may suspend an account where we reasonably believe it wasn&apos;t
        given.
      </p>
      <p>
        You&apos;re responsible for keeping your account credentials secure and for everything
        that happens under your account, whether you did it or allowed someone else to.
      </p>

      <h2>3. Account registration and roles</h2>
      <p>
        You can register with an email and password, or via Google or Apple sign-in. You choose a
        role (Brand or Creator) during signup; an admin can change a user&apos;s role or status
        afterward. Providing false information during signup, or misrepresenting who you are or
        what you&apos;re posting/submitting, is a breach of these Terms.
      </p>
      <p>
        Creators can optionally connect a TikTok account from their Profile page. This is entirely
        optional, is used only to fetch view/like counts for videos on <strong>your own</strong>{" "}
        connected TikTok account, and is described in more detail in our{" "}
        <Link href="/privacy">Privacy Policy</Link>. Disconnecting is available at any time from
        the same page.
      </p>

      <h2>4. Campaigns (Brands)</h2>
      <p>As a Brand posting a campaign, you agree that:</p>
      <ul>
        <li>
          You will pay the campaign budget plus any processing fee shown at checkout, in full,
          before the campaign goes live.
        </li>
        <li>
          You will honestly describe what you&apos;re asking creators to do, and set a payout per
          clip you genuinely intend to pay.
        </li>
        <li>
          You are solely responsible for reviewing and approving or rejecting clips submitted to
          your campaign — Clippifi does not verify that a submitted clip actually fulfills your
          brief before you approve it.
        </li>
        <li>
          You will not use a campaign, its brief, or the channel link you provide to solicit
          anything illegal, infringing, or otherwise prohibited under Section 8.
        </li>
      </ul>
      <p>
        Once a campaign payment is confirmed, the campaign goes live immediately. Cancelling a live
        campaign does not automatically refund what&apos;s already been paid — see our{" "}
        <Link href="/refund-policy">Refund &amp; Payout Policy</Link> for exactly when a refund is
        and isn&apos;t available.
      </p>

      <h2>5. Clip submissions and payouts (Creators)</h2>
      <p>As a Creator submitting a clip, you agree that:</p>
      <ul>
        <li>
          You own the clip you submit, or have the rights and permission needed to submit it and
          to grant Clippifi and the relevant brand the license described in Section 6.
        </li>
        <li>
          A clip you submit is subject to review — either automatic (if the brand or platform has
          enabled auto-approval) or manual, by the brand behind that campaign or by an admin. A
          clip can be approved, rejected, or left pending; we don&apos;t guarantee a review
          timeline.
        </li>
        <li>
          You only earn a campaign&apos;s payout amount once your clip is <strong>approved</strong>
          . A pending or rejected clip earns nothing. The rate you earn is the payout amount the
          campaign had set at the moment you submitted — later changes a brand makes to a
          campaign&apos;s payout don&apos;t apply retroactively to your already-submitted clips.
        </li>
        <li>
          Video/like counts shown next to a clip (from YouTube or a connected TikTok account) are
          fetched from the relevant platform&apos;s public API and reflect that platform&apos;s
          data, not Clippifi&apos;s own measurement — we&apos;re not responsible for their
          accuracy.
        </li>
      </ul>
      <p>
        How and when approved earnings are actually paid out to you is covered in our{" "}
        <Link href="/refund-policy">Refund &amp; Payout Policy</Link> — please read it before
        relying on Clippifi as a source of income.
      </p>

      <h2>6. Content and license</h2>
      <p>
        You retain ownership of anything you upload or submit to Clippifi (clip videos, campaign
        flyers, profile info). By submitting content, you grant Clippifi a worldwide,
        non-exclusive, royalty-free license to host, store, display, and reproduce it on the
        Platform for the purpose of operating the service — for example, showing an approved clip
        on Browse Clips, or a campaign&apos;s flyer on its own listing. This license ends when the
        content is removed from the Platform, except where a copy reasonably needs to persist for
        legal, backup, or dispute-resolution purposes.
      </p>
      <p>
        We do not claim ownership of your content, and we do not license or sell it to anyone on
        your behalf — remember, clips are not for sale on Clippifi.
      </p>

      <h2>7. Payments</h2>
      <p>
        Campaign payments are processed by third-party payment providers (currently Paystack, with
        Flutterwave, Stripe, and manual bank transfer available depending on what an admin has
        configured). Clippifi never sees or stores your full card number — that&apos;s handled
        entirely by the payment provider. We do keep a record of each payment attempt (amount,
        provider, a reference ID, and whether it succeeded or failed) for accounting and support
        purposes.
      </p>
      <p>
        You&apos;re responsible for any fees your bank, card issuer, or payment provider charges
        independently of Clippifi&apos;s own processing fee.
      </p>

      <h2>8. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Post or submit content that is illegal, infringing, defamatory, or fraudulent.</li>
        <li>
          Impersonate another person or brand, or misrepresent your affiliation with anyone.
        </li>
        <li>
          Attempt to manipulate view/like counts, submit clips that aren&apos;t genuinely yours, or
          otherwise game a campaign&apos;s approval or payout process.
        </li>
        <li>
          Use the Platform to launder money or disguise the purpose of a payment.
        </li>
        <li>
          Interfere with the Platform&apos;s operation, attempt to access another user&apos;s
          account, or circumvent any access control or rate limit.
        </li>
        <li>Use the Platform if you are legally prohibited from doing so in your jurisdiction.</li>
      </ul>
      <p>
        We can remove content, reject or reverse a clip&apos;s approval, suspend, or terminate an
        account that violates this section, with or without notice.
      </p>

      <h2>9. Moderation and admin discretion</h2>
      <p>
        Admins can approve or reject clips, change a campaign&apos;s status, suspend or reinstate
        accounts, and configure platform-wide settings (fees, minimum campaign budget, payment
        providers, moderation rules). These decisions are made at our discretion to keep the
        Platform functioning safely and fairly, and are final unless we agree otherwise in
        writing.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We do not
        guarantee that a campaign
        will receive submissions, that a submitted clip will be reviewed within any particular
        time, that view/like counts fetched from third-party platforms are accurate or current, or
        that the Platform will be uninterrupted or error-free.
      </p>
      <p>
        We are not a party to the underlying arrangement between a brand and a creator beyond
        facilitating the campaign payment and payout tracking described above — we don&apos;t
        guarantee the quality, legality, or outcome of any clip, campaign, or the relationship
        between the two.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Clippifi and its operator are not liable for any
        indirect, incidental, special, or consequential damages arising from your use of the
        Platform, including lost income, lost data, or business interruption. Our total liability
        for any claim arising from these Terms is limited to the amount you paid to Clippifi (if
        any) in the three months before the claim arose.
      </p>

      <h2>12. Termination</h2>
      <p>
        You can stop using the Platform and ask us to close your account at any time by contacting{" "}
        <a href="mailto:support@clippii.com">support@clippii.com</a>. We can suspend or terminate
        your account for violating these Terms, for suspected fraud, or where required by law.
        Sections that by their nature should survive termination (ownership, license grants already
        made, disclaimers, limitation of liability) continue to apply.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms as the Platform evolves. If a change is material, we&apos;ll make
        a reasonable effort to let existing users know (for example, an in-app notice). Continuing
        to use the Platform after a change takes effect means you accept the updated Terms.
      </p>

      <h2>14. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to
        its conflict-of-law principles. Any dispute arising from these Terms or your use of the
        Platform will be subject to the exclusive jurisdiction of the courts of Nigeria, unless
        applicable law says otherwise.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:support@clippii.com">support@clippii.com</a>.
      </p>
    </LegalLayout>
  );
}
