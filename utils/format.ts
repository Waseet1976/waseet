import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CURRENCY_SYMBOL } from "@/config/constants";

// Prix
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("fr-MA", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + ` ${CURRENCY_SYMBOL}`;
}

// Surface
export function formatSurface(surface: number | null | undefined): string {
  if (!surface) return "—";
  return `${surface} m²`;
}

// Date
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy", { locale: fr });
}

export function formatDatetime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy à HH:mm", { locale: fr });
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

// Nom complet
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

// Initiales
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Téléphone (format marocain)
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
  }
  return phone;
}

// Commission
export function formatCommission(amount: number | null, pct: number | null): string {
  if (amount && pct) return `${formatPrice(amount)} (${pct}%)`;
  if (amount) return formatPrice(amount);
  if (pct) return `${pct}%`;
  return "—";
}

// Référence propriété
export function generatePropertyRef(agencySlug: string, id: string): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const short = id.slice(-6).toUpperCase();
  return `${agencySlug.slice(0, 3).toUpperCase()}-${year}-${short}`;
}
