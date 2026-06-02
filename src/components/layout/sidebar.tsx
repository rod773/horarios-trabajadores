"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
  FileBarChart,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions";
import { Logo } from "@/components/ui/logo";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SUPERVISOR", "WORKER"] },
  { href: "/trabajadores", label: "Trabajadores", icon: Users, roles: ["ADMIN", "SUPERVISOR"] },
  { href: "/horarios", label: "Horarios", icon: Calendar, roles: ["ADMIN", "SUPERVISOR", "WORKER"] },
  { href: "/solicitudes", label: "Solicitudes", icon: ClipboardList, roles: ["ADMIN", "SUPERVISOR", "WORKER"] },
  { href: "/reportes", label: "Reportes", icon: FileBarChart, roles: ["ADMIN", "SUPERVISOR"] },
  { href: "/configuracion", label: "Configuración", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar({ role, collapsed, onClose }: { role: Role; collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const visible = items.filter((i) => i.roles.includes(role));

  return (
    <aside
      className={cn(
        "h-full bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className={cn("flex items-center gap-3 px-5 py-5 border-b border-border", collapsed && "justify-center px-2")}>
        <Logo size={36} className="rounded-lg shadow-sm" />
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col leading-tight"
          >
            <span className="font-semibold tracking-tight">Horarios</span>
            <span className="text-[11px] text-muted-foreground">Gestión de turnos</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 min-h-[40px] sm:min-h-0 sm:py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-primary-foreground/70"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 min-h-[40px] sm:min-h-0 sm:py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
