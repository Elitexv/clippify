import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  DollarSign,
  Heart,
  Home,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Upload,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { Role } from "@/lib/auth/mock-users";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
  badge?: number;
};

export const accountNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Browse Clips", href: "/dashboard/browse", icon: Search },
  { label: "Hire Streamers", href: "/dashboard/hire", icon: Users, roles: ["brand"] },
  { label: "Competitions", href: "/dashboard/competitions", icon: Trophy },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingBag, roles: ["brand"] },
  { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign, roles: ["creator"] },
  { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: 3 },
];

export const accountCreateItems: NavItem[] = [
  { label: "Upload Video", href: "/dashboard/upload", icon: Upload, roles: ["creator"] },
  { label: "Post a Job", href: "/dashboard/post-job", icon: Briefcase, roles: ["brand"] },
];

export const accountMobileNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Browse", href: "/dashboard/browse", icon: Search },
  { label: "Compete", href: "/dashboard/competitions", icon: Trophy },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: 3 },
];

export const adminMobileNavItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: UserCog },
  { label: "Competitions", href: "/admin/competitions", icon: Trophy },
  { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
];

export const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: UserCog },
  { label: "Competitions", href: "/admin/competitions", icon: Trophy },
  { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
  { label: "Payouts", href: "/admin/payouts", icon: Wallet },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function isNavItemVisible(item: NavItem, role: Role): boolean {
  if (!item.roles) return true;
  if (role === "both") return true;
  return item.roles.includes(role);
}
