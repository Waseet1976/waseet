"use client";

import Link from "next/link";
import {
  Home, CheckCircle2, XCircle, TrendingUp, Coins,
  CreditCard, Users, Gift, Copy, FileText, PenLine, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { NotificationType } from "@/lib/services/notification.service";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface NotificationData {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  isRead:    boolean;
  link:      string | null;
  createdAt: string;
}

// ── Config par type ───────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  PROPERTY_DECLARED: {
    icon:  <Home       className="w-4 h-4" />,
    color: "text-[#635BFF]",
    bg:    "bg-[#635BFF]/10",
  },
  PROPERTY_VALIDATED: {
    icon:  <CheckCircle2 className="w-4 h-4" />,
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
  },
  PROPERTY_REJECTED: {
    icon:  <XCircle className="w-4 h-4" />,
    color: "text-red-500",
    bg:    "bg-red-50",
  },
  PIPELINE_UPDATED: {
    icon:  <TrendingUp className="w-4 h-4" />,
    color: "text-[#635BFF]",
    bg:    "bg-[#635BFF]/10",
  },
  COMMISSION_ESTIMATED: {
    icon:  <Coins className="w-4 h-4" />,
    color: "text-warning",
    bg:    "bg-warning-bg",
  },
  COMMISSION_VALIDATED: {
    icon:  <Coins className="w-4 h-4" />,
    color: "text-[#635BFF]",
    bg:    "bg-[#635BFF]/10",
  },
  COMMISSION_PAID: {
    icon:  <CreditCard className="w-4 h-4" />,
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
  },
  REFERRAL_JOINED: {
    icon:  <Users className="w-4 h-4" />,
    color: "text-[#635BFF]",
    bg:    "bg-[#635BFF]/10",
  },
  REFERRAL_BONUS: {
    icon:  <Gift className="w-4 h-4" />,
    color: "text-[#635BFF]",
    bg:    "bg-[#635BFF]/10",
  },
  DUPLICATE_DETECTED: {
    icon:  <Copy className="w-4 h-4" />,
    color: "text-orange-500",
    bg:    "bg-orange-50",
  },
  CONTRACT_SENT: {
    icon:  <FileText className="w-4 h-4" />,
    color: "text-[#635BFF]",
    bg:    "bg-[#635BFF]/10",
  },
  CONTRACT_SIGNED: {
    icon:  <PenLine className="w-4 h-4" />,
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
  },
};

const FALLBACK_CONFIG = {
  icon:  <Bell className="w-4 h-4" />,
  color: "text-charcoal-muted",
  bg:    "bg-sand",
};

// ── Temps relatif ─────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s    = Math.floor(diff / 1000);
  if (s < 60)   return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60)   return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)    return `il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short",
  });
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function NotificationItem({
  notification,
  onRead,
  compact = false,
}: {
  notification: NotificationData;
  onRead?:      (id: string) => void;
  compact?:     boolean;
}) {
  const conf = TYPE_CONFIG[notification.type as NotificationType] ?? FALLBACK_CONFIG;

  function handleClick() {
    if (!notification.isRead && onRead) onRead(notification.id);
  }

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors relative",
        !notification.isRead && "bg-[#635BFF]/5",
        notification.link ? "cursor-pointer hover:bg-sand/60" : "cursor-default"
      )}
      onClick={notification.link ? undefined : handleClick}
    >
      {/* Indicateur non lu */}
      {!notification.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
      )}

      {/* Icône type */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
        conf.bg, conf.color
      )}>
        {conf.icon}
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug",
          notification.isRead ? "font-normal text-obsidian" : "font-semibold text-obsidian"
        )}>
          {notification.title}
        </p>
        {!compact && (
          <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-[10px] text-charcoal-muted/70 mt-1">
          {relativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

// ── Liste ──────────────────────────────────────────────────────────────────────

export function NotificationList({
  notifications,
  onRead,
  onReadAll,
  loading = false,
  compact = false,
}: {
  notifications: NotificationData[];
  onRead?:       (id: string) => void;
  onReadAll?:    () => void;
  loading?:      boolean;
  compact?:      boolean;
}) {
  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <Bell className="w-8 h-8 text-charcoal-muted/30" />
        <p className="text-sm text-charcoal-muted">Aucune notification</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header liste */}
      {unread > 0 && onReadAll && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-sand-dark">
          <span className="text-xs text-charcoal-muted">
            {unread} non lue{unread > 1 ? "s" : ""}
          </span>
          <button
            onClick={onReadAll}
            className="text-xs font-medium text-[#635BFF] hover:text-[#4C45E0] transition-colors"
          >
            Tout marquer comme lu
          </button>
        </div>
      )}

      {/* Items */}
      <div className="divide-y divide-sand-dark/50">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onRead={onRead}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
