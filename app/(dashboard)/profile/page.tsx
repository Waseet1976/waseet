"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm }      from "react-hook-form";
import { zodResolver }  from "@hookform/resolvers/zod";
import { z }            from "zod";
import {
  User, Lock, Bell, Plug, FileText,
  Camera, Check, AlertTriangle, Eye, EyeOff,
  ExternalLink, Building2,
} from "lucide-react";

import { useAuth }               from "@/lib/hooks/useAuth";
import { NotificationSettings }  from "@/components/profile/NotificationSettings";
import { Badge }                 from "@/components/ui/Badge";
import { createClient }          from "@/lib/supabase/client";
import { getInitials, formatDate } from "@/lib/utils";
import { ROLES }                   from "@/lib/config";
import { cn }                      from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileData {
  id:           string;
  email:        string;
  firstName:    string;
  lastName:     string;
  phone?:       string | null;
  country?:     string | null;
  role:         string;
  referralCode: string;
  isActive:     boolean;
  ghlContactId?: string | null;
  agencyId?:     string | null;
  agency?: {
    id: string; name: string; email: string; phone?: string | null;
    commissionRate: number; apporteurShare: number;
    stripeCustomerId?: string | null;
  } | null;
  agentProfile?: {
    photo?:    string | null;
    fonction?: string | null;
  } | null;
}

interface ContractItem {
  id:          string;
  type:        string;
  status:      string;
  createdAt:   string;
  signedAt?:   string | null;
  documentUrl?: string | null;
  property:    { reference: string; city: string | null };
}

// ── Schémas ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Requis").max(50),
  lastName:  z.string().trim().min(1, "Requis").max(50),
  phone:     z.string().trim().max(20).optional(),
  country:   z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Requis"),
  newPassword:     z.string()
    .min(8, "Min. 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  confirmPassword: z.string().min(1, "Requis"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path:    ["confirmPassword"],
});

type ProfileFormData  = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ── Labels ────────────────────────────────────────────────────────────────────

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  MANDATE:    "Mandat",
  COMPROMISE: "Compromis",
  DEED:       "Acte de vente",
};
const CONTRACT_STATUS_BADGE: Record<string, { label: string; variant: "success" | "gold" | "warning" | "muted" | "danger" }> = {
  DRAFT:    { label: "Brouillon",  variant: "muted"    },
  SENT:     { label: "En attente", variant: "warning"  },
  SIGNED:   { label: "Signé",      variant: "success"  },
  REJECTED: { label: "Rejeté",     variant: "danger"   },
};

// ── Navigation latérale ───────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "info",          icon: <User className="w-4 h-4" />,     label: "Informations" },
  { id: "security",      icon: <Lock className="w-4 h-4" />,     label: "Sécurité"     },
  { id: "notifications", icon: <Bell className="w-4 h-4" />,     label: "Notifications"},
  { id: "integrations",  icon: <Plug className="w-4 h-4" />,     label: "Intégrations" },
  { id: "contracts",     icon: <FileText className="w-4 h-4" />, label: "Contrats"     },
];

// ── Composant principal ───────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth();

  const [profile,   setProfile]   = useState<ProfileData | null>(null);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeSection, setActiveSection] = useState("info");

  const [profileSaved,  setProfileSaved]  = useState(false);
  const [profileError,  setProfileError]  = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [photoLoading,  setPhotoLoading]  = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch profil ──────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("waseet_token");
    const res   = await fetch("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setProfile(d.user);
      setContracts(d.contracts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && authUser) fetchProfile();
  }, [authLoading, authUser, fetchProfile]);

  // ── Forms ─────────────────────────────────────────────────────────────────
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName ?? "",
      lastName:  profile?.lastName  ?? "",
      phone:     profile?.phone     ?? "",
      country:   "BE",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  // ── Submit profil ─────────────────────────────────────────────────────────
  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileError(null);
    const token = localStorage.getItem("waseet_token");
    const res = await fetch("/api/users/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(data),
    });
    const d = await res.json();
    if (!res.ok) { setProfileError(d.error ?? "Erreur"); return; }
    setProfile((prev) => prev ? { ...prev, ...d.user } : d.user);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // ── Submit mot de passe ───────────────────────────────────────────────────
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null);
    const token = localStorage.getItem("waseet_token");
    const res = await fetch("/api/users/password", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(data),
    });
    const d = await res.json();
    if (!res.ok) {
      setPasswordError(d.error ?? "Erreur");
      if (d.field) passwordForm.setError(d.field as keyof PasswordFormData, { message: d.error });
      return;
    }
    setPasswordSaved(true);
    passwordForm.reset();
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  // ── Upload photo ──────────────────────────────────────────────────────────
  const handlePhotoUpload = async (file: File) => {
    if (!profile) return;
    setPhotoLoading(true);
    const supabase = createClient();
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `avatars/${profile.id}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) { setPhotoLoading(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

    const token = localStorage.getItem("waseet_token");
    const res   = await fetch("/api/users/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ photoUrl: urlData.publicUrl }),
    });
    const d = await res.json();
    if (res.ok) {
      setProfile((prev) =>
        prev ? { ...prev, agentProfile: { ...prev.agentProfile, photo: urlData.publicUrl } } : prev
      );
    }
    setPhotoLoading(false);
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-7 bg-sand-dark rounded w-36" />
        <div className="h-64 bg-sand-dark rounded-2xl" />
      </div>
    );
  }

  const photoUrl  = profile?.agentProfile?.photo;
  const initials  = getInitials(profile?.firstName ?? "", profile?.lastName ?? "");
  const roleCfg   = ROLES[profile?.role as keyof typeof ROLES];

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-obsidian mb-6">Mon profil</h1>

      <div className="flex flex-col md:flex-row gap-6">

        {/* ── Sidebar navigation ─────────────────────────────────────────── */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
            {NAV_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                  activeSection === s.id
                    ? "bg-[#635BFF]/10 text-[#635BFF]"
                    : "text-charcoal-muted hover:bg-sand hover:text-charcoal"
                )}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Contenu ────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ════ Informations personnelles ═════════════════════════════════ */}
          {activeSection === "info" && (
            <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-6 space-y-6">
              <SectionTitle icon={<User className="w-4 h-4" />} title="Informations personnelles" />

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#635BFF]/10 border-2 border-[#635BFF]/30 flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#635BFF] font-bold text-2xl">{initials}</span>
                    )}
                  </div>
                  {/* Bouton upload */}
                  {profile?.agentProfile !== undefined && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#635BFF] text-white flex items-center justify-center shadow-sm hover:bg-[#4C45E0] transition-colors"
                        title="Changer la photo"
                      >
                        {photoLoading
                          ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          : <Camera className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhotoUpload(f);
                        }}
                      />
                    </>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-obsidian">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-sm text-charcoal-muted">{profile?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="gold" className="text-[10px]">
                      {roleCfg?.label ?? profile?.role}
                    </Badge>
                    {profile?.agency && (
                      <span className="text-xs text-charcoal-muted flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {profile.agency.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prénom" error={profileForm.formState.errors.firstName?.message}>
                    <input
                      {...profileForm.register("firstName")}
                      className="input w-full"
                      placeholder="Prénom"
                    />
                  </Field>
                  <Field label="Nom" error={profileForm.formState.errors.lastName?.message}>
                    <input
                      {...profileForm.register("lastName")}
                      className="input w-full"
                      placeholder="Nom"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Téléphone" error={profileForm.formState.errors.phone?.message}>
                    <input
                      {...profileForm.register("phone")}
                      className="input w-full"
                      placeholder="+32 4 71 00 00 00"
                    />
                  </Field>
                  <Field label="Pays">
                    <input
                      value="🇧🇪 Belgique"
                      disabled
                      className="input w-full opacity-60 cursor-not-allowed"
                    />
                  </Field>
                </div>

                <Field label="Email (non modifiable)">
                  <input
                    value={profile?.email ?? ""}
                    disabled
                    className="input w-full opacity-50 cursor-not-allowed"
                  />
                </Field>

                {/* Code parrainage (lecture seule) */}
                <Field label="Code de parrainage">
                  <input
                    value={profile?.referralCode ?? ""}
                    disabled
                    className="input w-full font-mono opacity-60 cursor-not-allowed"
                  />
                </Field>

                {profileError && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {profileError}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={profileForm.formState.isSubmitting}
                    className="btn-primary px-6"
                  >
                    {profileForm.formState.isSubmitting ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  {profileSaved && (
                    <span className="text-success text-sm font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> Enregistré
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ════ Sécurité ══════════════════════════════════════════════════ */}
          {activeSection === "security" && (
            <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-6">
              <SectionTitle icon={<Lock className="w-4 h-4" />} title="Changer le mot de passe" />
              <p className="text-sm text-charcoal-muted mb-6">
                Utilisez un mot de passe fort : au moins 8 caractères, une majuscule et un chiffre.
              </p>

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                {/* Mot de passe actuel */}
                <Field label="Mot de passe actuel" error={passwordForm.formState.errors.currentPassword?.message}>
                  <div className="relative">
                    <input
                      {...passwordForm.register("currentPassword")}
                      type={showCurrent ? "text" : "password"}
                      className="input w-full pr-10"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>

                {/* Nouveau mot de passe */}
                <Field label="Nouveau mot de passe" error={passwordForm.formState.errors.newPassword?.message}>
                  <div className="relative">
                    <input
                      {...passwordForm.register("newPassword")}
                      type={showNew ? "text" : "password"}
                      className="input w-full pr-10"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>

                {/* Confirmation */}
                <Field label="Confirmer le nouveau mot de passe" error={passwordForm.formState.errors.confirmPassword?.message}>
                  <input
                    {...passwordForm.register("confirmPassword")}
                    type="password"
                    className="input w-full"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </Field>

                {passwordError && (
                  <p className="text-sm text-danger flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {passwordError}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={passwordForm.formState.isSubmitting}
                    className="btn-primary px-6"
                  >
                    {passwordForm.formState.isSubmitting ? "Mise à jour…" : "Changer le mot de passe"}
                  </button>
                  {passwordSaved && (
                    <span className="text-success text-sm font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> Mot de passe mis à jour
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ════ Notifications ═════════════════════════════════════════════ */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-6">
              <SectionTitle icon={<Bell className="w-4 h-4" />} title="Préférences de notifications" />
              <p className="text-sm text-charcoal-muted mb-6">
                Configurez comment et quand vous souhaitez être notifié.
              </p>
              <NotificationSettings />
            </div>
          )}

          {/* ════ Intégrations ══════════════════════════════════════════════ */}
          {activeSection === "integrations" && (
            <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card p-6 space-y-6">
              <SectionTitle icon={<Plug className="w-4 h-4" />} title="Intégrations" />

              {/* GoHighLevel */}
              <IntegrationCard
                title="GoHighLevel (GHL)"
                description="CRM connecté pour le suivi des opportunités"
                status={!!profile?.ghlContactId}
                statusLabel={profile?.ghlContactId ? "Connecté" : "Non configuré"}
              >
                {profile?.ghlContactId && (
                  <p className="text-xs font-mono text-charcoal-muted mt-2">
                    Contact ID : {profile.ghlContactId}
                  </p>
                )}
              </IntegrationCard>

              {/* Stripe (agence seulement) */}
              {profile?.role === "AGENCY" && (
                <IntegrationCard
                  title="Stripe"
                  description="Paiements et abonnements de l'agence"
                  status={!!profile?.agency?.stripeCustomerId}
                  statusLabel={profile?.agency?.stripeCustomerId ? "Connecté" : "Non configuré"}
                >
                  {profile?.agency?.stripeCustomerId && (
                    <p className="text-xs font-mono text-charcoal-muted mt-2">
                      Customer : {profile.agency.stripeCustomerId}
                    </p>
                  )}
                </IntegrationCard>
              )}

              {/* Agence */}
              {profile?.agency && (
                <IntegrationCard
                  title={profile.agency.name}
                  description="Agence partenaire associée à votre compte"
                  status
                  statusLabel="Associé"
                >
                  <div className="mt-2 space-y-1 text-xs text-charcoal-muted">
                    <p>Commission agence : <strong>{profile.agency.commissionRate}%</strong></p>
                    <p>Part apporteur : <strong>{profile.agency.apporteurShare}%</strong></p>
                    <p>Email : {profile.agency.email}</p>
                  </div>
                </IntegrationCard>
              )}
            </div>
          )}

          {/* ════ Contrats ══════════════════════════════════════════════════ */}
          {activeSection === "contracts" && (
            <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card overflow-hidden">
              <div className="px-6 py-5 border-b border-sand-dark">
                <SectionTitle icon={<FileText className="w-4 h-4" />} title="Mon contrat avec Waseet" />
                <p className="text-sm text-charcoal-muted mt-1">
                  Mandats, compromis et actes liés à vos biens déclarés.
                </p>
              </div>

              {contracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-charcoal-muted" />
                  </div>
                  <p className="text-sm font-semibold text-charcoal mb-1">Aucun contrat</p>
                  <p className="text-xs text-charcoal-muted">
                    Les contrats apparaîtront ici une fois générés par l'agence.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-sand-dark">
                  {contracts.map((c) => {
                    const statusCfg = CONTRACT_STATUS_BADGE[c.status];
                    return (
                      <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-sand/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-charcoal-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-obsidian">
                              {CONTRACT_TYPE_LABEL[c.type] ?? c.type}
                            </p>
                            <Badge variant={statusCfg.variant} className="text-[10px]">
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-charcoal-muted mt-0.5">
                            Réf. <span className="text-[#635BFF] font-mono font-medium">{c.property.reference}</span>
                            {c.property.city && ` · ${c.property.city}`}
                            {" · "}{formatDate(c.createdAt)}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          {c.documentUrl && (
                            <a
                              href={c.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-medium text-[#635BFF] hover:text-[#4C45E0] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Voir
                            </a>
                          )}
                          {c.status === "SENT" && (
                            <a
                              href={c.documentUrl ?? "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 px-3 py-1 rounded-lg transition-colors"
                            >
                              Signer
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF]">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-obsidian">{title}</h2>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label:     string;
  error?:    string;
  children:  React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  status,
  statusLabel,
  children,
}: {
  title:        string;
  description:  string;
  status:       boolean;
  statusLabel:  string;
  children?:    React.ReactNode;
}) {
  return (
    <div className="border border-sand-dark rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-obsidian">{title}</p>
          <p className="text-xs text-charcoal-muted mt-0.5">{description}</p>
          {children}
        </div>
        <Badge variant={status ? "success" : "muted"} dot>
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
