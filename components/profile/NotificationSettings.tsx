"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  email: {
    pipelineUpdates:    boolean;
    commissionCreated:  boolean;
    commissionValidated: boolean;
    commissionPaid:     boolean;
    newReferral:        boolean;
    bonusReceived:      boolean;
  };
  sms: {
    commissionPaid: boolean;
    mandateSigned:  boolean;
  };
  whatsapp: {
    enabled: boolean;
  };
  inApp: {
    pipeline:    boolean;
    commissions: boolean;
    referrals:   boolean;
  };
}

const DEFAULT_PREFS: NotificationPrefs = {
  email: {
    pipelineUpdates:     true,
    commissionCreated:   true,
    commissionValidated: true,
    commissionPaid:      true,
    newReferral:         true,
    bonusReceived:       true,
  },
  sms: {
    commissionPaid: false,
    mandateSigned:  false,
  },
  whatsapp: {
    enabled: false,
  },
  inApp: {
    pipeline:    true,
    commissions: true,
    referrals:   true,
  },
};

const STORAGE_KEY = "waseet_notifications";

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked:  boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:ring-offset-2",
        checked   ? "bg-[#635BFF]" : "bg-sand-dark",
        disabled  && "opacity-40 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ── Ligne de préférence ───────────────────────────────────────────────────────

function PrefRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  badge,
}: {
  label:        string;
  description?: string;
  checked:      boolean;
  onChange:     (v: boolean) => void;
  disabled?:    boolean;
  badge?:       string;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-obsidian">{label}</p>
          {badge && (
            <span className="text-[10px] font-semibold bg-charcoal-muted/10 text-charcoal-muted px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-charcoal-muted mt-0.5">{description}</p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Section de notification ───────────────────────────────────────────────────

function NotifSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon:      React.ReactNode;
  title:     string;
  subtitle?: string;
  children:  React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-lg bg-sand flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-obsidian">{title}</p>
          {subtitle && <p className="text-[11px] text-charcoal-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="ml-9 divide-y divide-sand-dark/60">
        {children}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  // Charger depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NotificationPrefs>;
        setPrefs((prev) => ({
          email:    { ...prev.email,    ...parsed.email },
          sms:      { ...prev.sms,      ...parsed.sms },
          whatsapp: { ...prev.whatsapp, ...parsed.whatsapp },
          inApp:    { ...prev.inApp,    ...parsed.inApp },
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Sauvegarder dans localStorage
  function save(updated: NotificationPrefs) {
    setPrefs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function setEmail<K extends keyof NotificationPrefs["email"]>(
    key: K, value: boolean
  ) {
    save({ ...prefs, email: { ...prefs.email, [key]: value } });
  }

  function setSms<K extends keyof NotificationPrefs["sms"]>(
    key: K, value: boolean
  ) {
    save({ ...prefs, sms: { ...prefs.sms, [key]: value } });
  }

  function setInApp<K extends keyof NotificationPrefs["inApp"]>(
    key: K, value: boolean
  ) {
    save({ ...prefs, inApp: { ...prefs.inApp, [key]: value } });
  }

  function setWhatsApp(value: boolean) {
    save({ ...prefs, whatsapp: { enabled: value } });
  }

  return (
    <div className="space-y-6">

      {/* Confirmation de sauvegarde */}
      {saved && (
        <div className="flex items-center gap-2 text-success text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Préférences sauvegardées
        </div>
      )}

      {/* ── Email ──────────────────────────────────────────────────────────── */}
      <NotifSection
        icon={<Mail className="w-4 h-4 text-charcoal-muted" />}
        title="Notifications Email"
        subtitle="Reçues à votre adresse email principale"
      >
        <PrefRow
          label="Mises à jour pipeline"
          description="Quand votre bien avance d'une étape"
          checked={prefs.email.pipelineUpdates}
          onChange={(v) => setEmail("pipelineUpdates", v)}
        />
        <PrefRow
          label="Commission créée"
          description="À la signature de l'acte notarié"
          checked={prefs.email.commissionCreated}
          onChange={(v) => setEmail("commissionCreated", v)}
        />
        <PrefRow
          label="Commission validée"
          description="Quand l'admin confirme le montant"
          checked={prefs.email.commissionValidated}
          onChange={(v) => setEmail("commissionValidated", v)}
        />
        <PrefRow
          label="Commission payée"
          description="Quand votre versement est effectué"
          checked={prefs.email.commissionPaid}
          onChange={(v) => setEmail("commissionPaid", v)}
        />
        <PrefRow
          label="Nouveau filleul"
          description="Quand quelqu'un s'inscrit avec votre code"
          checked={prefs.email.newReferral}
          onChange={(v) => setEmail("newReferral", v)}
        />
        <PrefRow
          label="Bonus parrainage reçu"
          description="Quand votre filleul conclut une vente"
          checked={prefs.email.bonusReceived}
          onChange={(v) => setEmail("bonusReceived", v)}
        />
      </NotifSection>

      <div className="border-t border-sand-dark" />

      {/* ── SMS ────────────────────────────────────────────────────────────── */}
      <NotifSection
        icon={<Smartphone className="w-4 h-4 text-charcoal-muted" />}
        title="Notifications SMS"
        subtitle="Envoyées sur votre numéro de téléphone"
      >
        <PrefRow
          label="Commission payée"
          description="SMS de confirmation du virement"
          checked={prefs.sms.commissionPaid}
          onChange={(v) => setSms("commissionPaid", v)}
        />
        <PrefRow
          label="Mandat signé"
          description="Confirmation de signature du mandat"
          checked={prefs.sms.mandateSigned}
          onChange={(v) => setSms("mandateSigned", v)}
        />
      </NotifSection>

      <div className="border-t border-sand-dark" />

      {/* ── WhatsApp ───────────────────────────────────────────────────────── */}
      <NotifSection
        icon={<MessageSquare className="w-4 h-4 text-charcoal-muted" />}
        title="Notifications WhatsApp"
        subtitle="Via l'application WhatsApp Business"
      >
        <PrefRow
          label="Activer WhatsApp"
          description="Recevoir les alertes importantes sur WhatsApp"
          checked={prefs.whatsapp.enabled}
          onChange={(v) => setWhatsApp(v)}
          badge="Bientôt"
          disabled
        />
      </NotifSection>

      <div className="border-t border-sand-dark" />

      {/* ── In-App ─────────────────────────────────────────────────────────── */}
      <NotifSection
        icon={<Bell className="w-4 h-4 text-charcoal-muted" />}
        title="Notifications In-App"
        subtitle="Clochette en haut à droite de l'interface"
      >
        <PrefRow
          label="Pipeline & biens"
          description="Validations, changements de statut"
          checked={prefs.inApp.pipeline}
          onChange={(v) => setInApp("pipeline", v)}
        />
        <PrefRow
          label="Commissions"
          description="Estimations, validations, paiements"
          checked={prefs.inApp.commissions}
          onChange={(v) => setInApp("commissions", v)}
        />
        <PrefRow
          label="Parrainage & réseau"
          description="Nouveaux filleuls, bonus"
          checked={prefs.inApp.referrals}
          onChange={(v) => setInApp("referrals", v)}
        />
      </NotifSection>
    </div>
  );
}
