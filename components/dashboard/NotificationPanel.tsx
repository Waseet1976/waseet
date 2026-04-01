"use client";

import { useEffect, useRef, useState } from "react";
import Link                             from "next/link";
import { X, Bell, CheckCheck, Loader2 } from "lucide-react";
import { cn }                           from "@/lib/utils/cn";
import { formatRelativeDate }           from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface Notification {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  isRead:    boolean;
  link:      string | null;
  createdAt: string;
}

interface NotificationPanelProps {
  isOpen:   boolean;
  onClose:  () => void;
  /** Met à jour le compteur dans le header */
  onCountChange?: (count: number) => void;
}

// ── Icône par type ────────────────────────────────────────────
function notifIcon(type: string): string {
  const map: Record<string, string> = {
    WELCOME:              "🎉",
    COMMISSION_VALIDATED: "💰",
    COMMISSION_PAID:      "✅",
    PROPERTY_VALIDATED:   "🏠",
    PROPERTY_REJECTED:    "❌",
    PIPELINE_UPDATE:      "📊",
    REFERRAL_BONUS:       "🤝",
    DEFAULT:              "🔔",
  };
  return map[type] ?? map.DEFAULT;
}

// ── Composant ─────────────────────────────────────────────────
export function NotificationPanel({ isOpen, onClose, onCountChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [marking, setMarking]             = useState(false);
  const panelRef                          = useRef<HTMLDivElement>(null);

  // Fermer au clic à l'extérieur
  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Charger les notifications à l'ouverture
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("waseet_token");
    if (!token) return;

    setLoading(true);
    fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.notifications) {
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n: Notification) => !n.isRead).length;
          onCountChange?.(unread);
        }
      })
      .catch(() => {/* API pas encore disponible */})
      .finally(() => setLoading(false));
  }, [isOpen, onCountChange]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    if (!unreadCount) return;
    const token = localStorage.getItem("waseet_token");
    if (!token) return;

    setMarking(true);
    try {
      await fetch("/api/notifications/read-all", {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onCountChange?.(0);
    } catch {/* noop */}
    finally { setMarking(false); }
  };

  const markOneRead = async (id: string) => {
    const token = localStorage.getItem("waseet_token");
    if (!token) return;

    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
    );
    onCountChange?.(Math.max(0, unreadCount - 1));

    await fetch(`/api/notifications/${id}/read`, {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute right-0 top-full mt-2 w-[380px] max-h-[520px]",
        "bg-white rounded-2xl border border-sand-dark/70",
        "shadow-[0_8px_40px_rgba(15,15,14,0.14)]",
        "flex flex-col overflow-hidden z-50",
        "transition-all duration-200 origin-top-right",
        isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sand-dark/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-charcoal-muted" />
          <span className="font-semibold text-obsidian text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-[#635BFF] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="flex items-center gap-1.5 text-xs text-[#635BFF] hover:text-[#4C45E0] font-medium px-2 py-1 rounded-lg hover:bg-[#635BFF]/5 transition-colors disabled:opacity-50"
            >
              {marking
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <CheckCheck className="w-3 h-3" />}
              Tout lire
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-muted hover:bg-sand-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-charcoal-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-charcoal-muted" />
            </div>
            <p className="text-sm font-medium text-charcoal">Aucune notification</p>
            <p className="text-xs text-charcoal-muted mt-1">Vous êtes à jour !</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const item = (
              <div
                key={notif.id}
                className={cn(
                  "flex gap-3 px-5 py-3.5 cursor-pointer group",
                  "hover:bg-sand-light transition-colors border-b border-sand-dark/40 last:border-0",
                  !notif.isRead && "bg-[#635BFF]/4"
                )}
                onClick={() => markOneRead(notif.id)}
              >
                {/* Icône */}
                <div className="w-9 h-9 rounded-xl bg-sand flex items-center justify-center flex-shrink-0 text-lg">
                  {notifIcon(notif.type)}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm leading-snug", notif.isRead ? "text-charcoal font-normal" : "text-obsidian font-semibold")}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#635BFF] flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-charcoal-muted/70 mt-1.5">
                    {formatRelativeDate(notif.createdAt)}
                  </p>
                </div>
              </div>
            );

            return notif.link ? (
              <Link key={notif.id} href={notif.link}>
                {item}
              </Link>
            ) : (
              <div key={notif.id}>{item}</div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex-shrink-0 px-5 py-3 border-t border-sand-dark/60">
          <Link
            href="/notifications"
            onClick={onClose}
            className="text-xs text-[#635BFF] hover:text-[#4C45E0] font-medium transition-colors"
          >
            Voir toutes les notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
