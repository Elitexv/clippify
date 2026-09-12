import RequireAuth from "@/components/dashboard/RequireAuth";
import ProfileContent from "@/components/dashboard/ProfileContent";

export default function AccountPage() {
  return (
    <RequireAuth area="account">
      <ProfileContent />
    </RequireAuth>
  );
}
