"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { RouteTransition } from "./route-transition";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  user: { id: string; name: string; email: string; role: Role; team: string | null };
  weekLabel: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  children: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function AppShell({
  user,
  weekLabel,
  onPrevWeek,
  onNextWeek,
  children,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar role={user.role} collapsed={collapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar role={user.role} collapsed={false} onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={user}
          weekLabel={weekLabel}
          onPrevWeek={onPrevWeek}
          onNextWeek={onNextWeek}
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              setMobileOpen((s) => !s);
            } else {
              setCollapsed((c) => !c);
            }
          }}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />
        <main className={cn("flex-1 p-3 sm:p-6")}>
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </div>
  );
}
