import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  FileText,
  ClipboardList,
  Megaphone,
  UserCheck,
  Shield,
  Link2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  stats?: {
    pendingProperties?: number;
    pendingVerifications?: number;
    pendingApplications?: number;
    pendingApprovals?: number;
    pendingRoleRequests?: number;
  };
}

const navItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Approvals", url: "/admin/approvals", icon: UserCheck },
  { title: "Role Requests", url: "/admin/role-requests", icon: Shield },
  { title: "Properties", url: "/admin/properties", icon: Building2 },
  { title: "Verifications", url: "/admin/verifications", icon: ShieldCheck },
  { title: "Applications", url: "/admin/applications", icon: FileText },
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
  { title: "Affiliates", url: "/admin/affiliates", icon: Link2 },
  { title: "Activity Log", url: "/admin/activity", icon: ClipboardList },
];

export function AdminSidebar({ stats }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const getBadgeCount = (url: string) => {
    if (!stats) return 0;
    switch (url) {
      case "/admin/approvals": return stats.pendingApprovals || 0;
      case "/admin/role-requests": return stats.pendingRoleRequests || 0;
      case "/admin/properties": return stats.pendingProperties || 0;
      case "/admin/verifications": return stats.pendingVerifications || 0;
      case "/admin/applications": return stats.pendingApplications || 0;
      default: return 0;
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const count = getBadgeCount(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && (
                          <span className="flex-1 flex items-center justify-between">
                            {item.title}
                            {count > 0 && (
                              <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-[10px] px-1">
                                {count}
                              </Badge>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
