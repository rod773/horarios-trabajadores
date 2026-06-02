"use client";

import * as React from "react";
import { CalendarDays, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/lib/types";

export interface TopbarProps {
  user: { name: string; email: string; role: Role; team: string | null };
  weekLabel: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToggleSidebar?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({
  user,
  weekLabel,
  onPrevWeek,
  onNextWeek,
  onToggleSidebar,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Alternar menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 mr-2">
          <div className="hidden md:flex items-center gap-1 text-sm font-medium bg-secondary text-secondary-foreground rounded-md px-2 py-1">
            <CalendarDays className="h-4 w-4" />
            <span className="capitalize">{weekLabel}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={onPrevWeek} aria-label="Semana anterior">
              ‹
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={onNextWeek} aria-label="Semana siguiente">
              ›
            </Button>
          </div>
        </div>

        {onSearchChange !== undefined && (
          <div className="flex-1 max-w-md hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder ?? "Buscar..."}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-[11px] text-muted-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
