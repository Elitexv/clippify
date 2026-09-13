import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Refund & Payout Policy — Clippifi",
  description: "How campaign payments, refunds, and creator payouts work on Clippifi.",
};

const UPDATED = "September 13, 2026";

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund & Payout Policy" updated={UPDATED}>
      <p>
        This policy explains what happens to money on Clippifi: when a brand&apos;s campaign
        payment is and isn&apos;t refundable, and how a creator&apos;s earnings from an approved
        clip get tracked and paid out. Read this alongside our{" "}
        <Link href="/terms">Terms of Service</Link>, which governs your use of the Platform more
        generally.
      </p>

      <h2>1. Campaign payments</h2>
      <p>
        When a brand posts a campaign, the total charged at checkout is the campaign budget plus
        the processing fee shown at that time. Payment is processed by a third-party provider
        (Paystack, or another provider an admin has enabled) and the campaign goes live immediately
        once payment succeeds.
      </p>
      <p>
        We keep a record of every payment attempt — successful or failed — including the amount,
        provider, and a reference ID, visible to admins for support and accounting purposes.
      </p>

      <h2>2. When a campaign payment is refundable</h2>
      <ul>
        <li>
          <strong>Failed or duplicate charges</strong> — if you were charged but the payment
          provider or our own records show the campaign was never actually created, or you were
          charged twice for the same campaign, contact us and we&apos;ll refund the erroneous
          charge.
        </li>
        <li>
          <strong>Cancelling before any clips are approved</strong> — if you cancel a campaign
          before any submitted clip has been approved on it, contact us to request a refund of the
          unspent portion. We evaluate these on a case-by-case basis; the processing fee is
          generally non-refundable once a campaign has gone live, since it covers the cost of
          running the campaign regardless of outcome.
        </li>
        <li>
          <strong>Fraud or platform error</strong> — if we determine a charge resulted from fraud
          on someone else&apos;s part, or from a bug on our end, we&apos;ll refund it in full.
        </li>
      </ul>
      <h3>When it generally isn&apos;t refundable</h3>
      <ul>
        <li>
          Once a campaign has one or more <strong>approved</strong> clips, the budget is considered
          committed to paying those creators — cancelling the campaign at that point does not
          refund the brand for approvals already made.
        </li>
        <li>
          Simply not receiving as many submissions as hoped for, or being unhappy with the quality
          of submissions you chose to approve, is not grounds for a refund — approving a clip is
          the brand&apos;s own decision (see Section 4 of our{" "}
          <Link href="/terms">Terms of Service</Link>).
        </li>
      </ul>
      <p>
        To request a refund, email{" "}
        <a href="mailto:support@clippii.com">support@clippii.com</a> with your account email and
        the campaign in question. We aim to respond within a few business days.
      </p>

      <h2>3. How a creator earns a payout</h2>
      <p>
        A campaign sets a payout amount per approved clip. When your clip submitted to that
        campaign is <strong>approved</strong> (by the brand or an admin), that amount is credited
        to your Earnings at the rate the campaign had set at the moment you submitted — a rate
        change the brand makes afterward doesn&apos;t apply retroactively to clips you&apos;d
        already submitted. A rejected or still-pending clip earns nothing.
      </p>
      <p>
        Your Earnings page shows a running total of what you&apos;ve earned across all approved
        clips.
      </p>

      <h2>4. How and when payouts are actually paid out</h2>
      <p>
        <strong>Please read this section carefully.</strong> Right now, Clippifi&apos;s Earnings
        and admin Payouts pages <em>track</em> what each creator has earned and is owed — they are
        a ledger, not an automated bank transfer. Actual disbursement of your earnings currently
        happens outside the automated part of the Platform (for example, arranged directly with an
        admin), rather than through an in-app &quot;withdraw&quot; button. We are working toward
        automating this; until an in-app payout method is available, expect payout timing and
        method to be coordinated manually. If you have an outstanding balance and haven&apos;t
        heard from us about payment, contact{" "}
        <a href="mailto:support@clippii.com">support@clippii.com</a>.
      </p>
      <p>
        Once an automated payout method is added, this section will be updated with the specific
        schedule, minimum payout threshold, and method(s) available, and existing creators will be
        notified.
      </p>

      <h2>5. Disputed or reversed approvals</h2>
      <p>
        If a clip is approved and later found to violate our Terms (for example, it wasn&apos;t
        actually the creator&apos;s own content, or it used fraudulent view/like data), we may
        reverse the approval and the associated earnings, and may recover any amount already paid
        out through other means.
      </p>

      <h2>6. Taxes</h2>
      <p>
        You&apos;re responsible for determining and paying any taxes owed on income you earn
        through Clippifi. We don&apos;t withhold taxes on your behalf or provide tax advice.
      </p>

      <h2>7. Changes to this policy</h2>
      <p>
        We&apos;ll update this page as our payment and payout mechanics evolve — most notably once
        an automated payout method is introduced. Material changes will be flagged in-app where
        practical.
      </p>

      <h2>8. Contact</h2>
      <p>
        Payment or payout questions can be sent to{" "}
        <a href="mailto:support@clippii.com">support@clippii.com</a>.
      </p>
    </LegalLayout>
  );
}
