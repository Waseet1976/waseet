"use client";

import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface HeaderProps {
  title?: string;
  userName?: string;
  userAvatar?: string | null;
}

export function Header({ title, userName = "Agent", userAvatar }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-sand-dark flex items-center px-8 gap-4">
      {/* Title */}
      {title && (
        <h1 className="text-lg font-semibold text-obsidian flex-shrink-0">{title}</h1>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-sand transition-colors">
          <Bell className="h-5 w-5 text-charcoal-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l border-sand-dark">
          <Avatar name={userName} src={userAvatar} size="sm" />
          <span className="text-sm font-medium text-obsidian hidden sm:block">{userName}</span>
        </div>
      </div>
    </header>
  );
}
