import RequireAuth from "@/components/dashboard/RequireAuth";
import ProfileContent from "@/components/dashboard/ProfileContent";

export default function AdminAccountPage() {
  return (
    <RequireAuth area="admin">
      <ProfileContent />
    </RequireAuth>
  );
}
