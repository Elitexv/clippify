import RequireAuth from "@/components/dashboard/RequireAuth";
import CreatorCampaignDetailContent from "./CreatorCampaignDetailContent";

// Required for the Capacitor static-export build (output: "export"), which demands at
// least one generated route — this page reads the real campaign id from useParams()
// client-side at runtime via onSnapshot, so the placeholder below is only ever used to
// satisfy the build; it's never actually rendered against real data in the app. Has to
// live in a non-"use client" file, hence the split from the actual page content.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function CreatorCampaignDetailPage() {
  return (
    <RequireAuth area="creator">
      <CreatorCampaignDetailContent />
    </RequireAuth>
  );
}
