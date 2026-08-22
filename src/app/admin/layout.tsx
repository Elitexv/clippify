import RequireAuth from "@/components/dashboard/RequireAuth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth area="admin">
      <DashboardShell area="admin">{children}</DashboardShell>
    </RequireAuth>
  );
}
