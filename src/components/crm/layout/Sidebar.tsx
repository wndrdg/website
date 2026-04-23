"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Droplets,
  Microscope,
  FolderOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCrmStore } from "@/lib/crm/store";
import { Badge } from "@/components/crm/ui/badge";
import { Button } from "@/components/crm/ui/button";
import { Separator } from "@/components/crm/ui/separator";
import { Avatar, AvatarFallback } from "@/components/crm/ui/avatar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/waitlist", label: "Waitlist", icon: ClipboardList, countKey: "waitlistCount" as const },
  { href: "/blood-draws", label: "Calendar", icon: Droplets },
  { href: "/vet-review", label: "Vet Review", icon: Microscope, countKey: "pendingReviewCount" as const },
  { href: "/vet-records", label: "Vet Records", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const store = useCrmStore();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="h-14" />

      <Separator />

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const count = item.countKey ? store[item.countKey] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <Badge variant="default" className="text-xs px-1.5 py-0">
                  {count}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <Separator />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              PA
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Patrick</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
