import RequireAuth from "@/components/dashboard/RequireAuth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth area="account">
      <DashboardShell area="account">{children}</DashboardShell>
    </RequireAuth>
  );
}
