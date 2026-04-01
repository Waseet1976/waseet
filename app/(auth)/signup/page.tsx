"use client";

import { useEffect, Suspense, useState } from "react";
import { useForm }                          from "react-hook-form";
import { zodResolver }                      from "@hookform/resolvers/zod";
import { useRouter, useSearchParams }       from "next/navigation";
import Link                                 from "next/link";
import { Mail, Lock, User, Phone, Gift, Building2, MapPin, ArrowRight, Handshake, Briefcase } from "lucide-react";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useAuth }                           from "@/lib/hooks/useAuth";
import { Input }                             from "@/components/ui/Input";
import { Button }                            from "@/components/ui/Button";
import { cn }                                from "@/lib/utils/cn";

type AccountType = "apporteur" | "professionnel";
type ProType     = "agent"     | "agence";

// ── Sélecteur de type de compte ───────────────────────────────
const ACCOUNT_TYPES: {
  value: AccountType;
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
}[] = [
  {
    value: "apporteur",
    icon: <Handshake className="w-7 h-7" />,
    title: "Apporteur d'affaires",
    description: "Vous connaissez des biens à vendre et souhaitez être rémunéré pour vos apports.",
    bullets: ["Signalez des biens", "Recevez une commission", "Parrainez votre réseau"],
  },
  {
    value: "professionnel",
    icon: <Briefcase className="w-7 h-7" />,
    title: "Professionnel",
    description: "Agent ou agence immobilière souhaitant gérer les opportunités apportées.",
    bullets: ["Gérez votre pipeline", "Suivez vos mandats", "Pilotez vos commissions"],
  },
];

// ── Formulaire ────────────────────────────────────────────────
function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const refCode      = searchParams.get("ref") ?? "";

  const { register: authRegister, isLoading, isAuthenticated, user } = useAuth();

  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [proType,     setProType]     = useState<ProType>("agent");

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country:      "BE" as const,
      referralCode: refCode || undefined,
    },
  });

  useEffect(() => {
    if (refCode) setValue("referralCode", refCode);
  }, [refCode, setValue]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(
        user.role === "ADMIN" ? "/admin" : "/dashboard"
      );
    }
  }, [isLoading, isAuthenticated, user, router]);

  const onSubmit = async (data: RegisterInput) => {
    const result = await authRegister(data);
    if (!result.success) {
      setError("root", { message: result.error ?? "Erreur lors de l'inscription" });
    }
  };

  const isWorking = isSubmitting || isLoading;

  return (
    <div className="w-full max-w-lg animate-fade-in">

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <img src="/logo.svg" alt="Waseet logo" className="h-12 w-auto" />
        </div>
        <p className="text-sm text-charcoal-muted mt-2">
          Accès sécurisé à votre espace professionnel
        </p>
      </div>

      {/* ── ÉTAPE 1 : Sélecteur de type de compte ─────────────── */}
      <div className="mb-6">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-black tracking-tight">Rejoindre Waseet</h1>
          <p className="text-sm text-charcoal-muted mt-1.5">
            Choisissez votre profil pour commencer
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ACCOUNT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setAccountType(t.value)}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:shadow-lg",
                accountType === t.value
                  ? "border-[#635BFF] bg-[#635BFF]/5 shadow-[#635BFF]/25"
                  : "border-sand-dark bg-white hover:border-[#635BFF]/40"
              )}
            >
              {/* Icône */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                accountType === t.value
                  ? "bg-[#635BFF]/15 text-[#635BFF]"
                  : "bg-sand text-charcoal-muted"
              )}>
                {t.icon}
              </div>

              {/* Titre + description */}
              <div>
                <p className={cn(
                  "font-bold text-sm leading-tight mb-1",
                  accountType === t.value ? "text-black" : "text-charcoal"
                )}>
                  {t.title}
                </p>
                <p className="text-xs text-charcoal-muted leading-snug">
                  {t.description}
                </p>
              </div>

              {/* Bullets */}
              <ul className="space-y-1">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-1.5 text-xs text-charcoal-muted">
                    <span className={cn(
                      "w-1 h-1 rounded-full shrink-0",
                      accountType === t.value ? "bg-[#635BFF]" : "bg-sand-dark"
                    )} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Indicateur sélection */}
              {accountType === t.value && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#635BFF] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── ÉTAPE 2 : Formulaire (apparaît après sélection) ───── */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        accountType ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="bg-white border border-sand-dark rounded-2xl shadow-2xl shadow-black/8 px-8 py-8">

          {/* Titre contextuel */}
          <div className="flex items-center gap-2 mb-6 pb-5 border-b border-sand-dark/50">
            <div className="w-8 h-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF]">
              {accountType === "professionnel" ? <Briefcase className="w-4 h-4" /> : <Handshake className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-black">
                {accountType === "professionnel" ? "Compte professionnel" : "Compte apporteur"}
              </p>
              <button
                type="button"
                onClick={() => setAccountType(null)}
                className="text-xs text-[#635BFF] hover:text-[#4C45E0] transition-colors"
              >
                Changer de profil →
              </button>
            </div>
          </div>

          {/* Erreur globale */}
          {errors.root && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* ── Champs professionnels (conditionnels) ──────────── */}
            {accountType === "professionnel" && (
              <div className="space-y-4 pb-4 border-b border-sand-dark">

                {/* Nom de l'agence */}
                <Input
                  label="Nom de l'agence"
                  type="text"
                  icon={<Building2 />}
                  placeholder="Dupont Immobilier"
                  autoComplete="organization"
                />

                {/* Type : Agent ou Agence */}
                <div>
                  <p className="text-sm font-medium text-black mb-2">Type de profil</p>
                  <div className="flex gap-3">
                    {([
                      { value: "agent",  label: "Agent" },
                      { value: "agence", label: "Agence" },
                    ] as { value: ProType; label: string }[]).map((t) => (
                      <label
                        key={t.value}
                        className={cn(
                          "flex-1 flex items-center gap-2.5 cursor-pointer rounded-xl px-4 py-3 border-2 transition-all",
                          proType === t.value
                            ? "border-[#635BFF] bg-[#635BFF]/5"
                            : "border-sand-dark bg-sand-light hover:border-[#635BFF]/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="proType"
                          value={t.value}
                          checked={proType === t.value}
                          onChange={() => setProType(t.value)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          proType === t.value ? "border-[#635BFF]" : "border-sand-dark"
                        )}>
                          {proType === t.value && (
                            <div className="w-2 h-2 rounded-full bg-[#635BFF]" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-black">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Zone de travail */}
                <Input
                  label="Zone de travail"
                  type="text"
                  icon={<MapPin />}
                  placeholder="Bruxelles, Liège, Wallonie…"
                  autoComplete="off"
                />
              </div>
            )}

            {/* ── Champs communs ─────────────────────────────────── */}

            {/* Prénom / Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                icon={<User />}
                placeholder="Jean"
                autoComplete="given-name"
                autoFocus
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Nom"
                type="text"
                icon={<User />}
                placeholder="Dupont"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            {/* Email */}
            <Input
              label="Adresse email"
              type="email"
              icon={<Mail />}
              placeholder="jean@exemple.be"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Téléphone */}
            <Input
              label="Téléphone"
              type="tel"
              icon={<Phone />}
              placeholder="+32 4 71 00 00 00"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />

            {/* Mot de passe */}
            <Input
              label="Mot de passe"
              type="password"
              icon={<Lock />}
              placeholder="Minimum 8 car., 1 majuscule, 1 chiffre"
              autoComplete="new-password"
              error={errors.password?.message}
              hint="Minimum 8 caractères, une majuscule et un chiffre"
              {...register("password")}
            />

            {/* Code parrainage */}
            <Input
              label={
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#635BFF]" />
                  Code parrainage
                  <span className="text-charcoal-muted font-normal">(optionnel)</span>
                </span> as unknown as string
              }
              type="text"
              placeholder="WST-XXXXXX"
              autoComplete="off"
              error={errors.referralCode?.message}
              hint={refCode ? "✓ Code pré-rempli depuis votre invitation" : undefined}
              className={refCode ? "border-success/60 bg-success-bg/30" : ""}
              {...register("referralCode")}
            />

            {/* CGU */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative shrink-0 mt-0.5">
                <input type="checkbox" className="peer sr-only" required />
                <div className="w-5 h-5 rounded-md border-2 border-sand-dark peer-checked:border-[#635BFF] peer-checked:bg-[#635BFF] transition-all group-hover:border-[#635BFF]/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white hidden peer-checked:block" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-sm text-charcoal leading-snug">
                J&apos;accepte les{" "}
                <Link href="/terms" className="text-[#635BFF] hover:text-[#4C45E0] font-medium" target="_blank">
                  conditions générales d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-[#635BFF] hover:text-[#4C45E0] font-medium" target="_blank">
                  politique de confidentialité
                </Link>
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isWorking}
              disabled={isWorking}
              className="mt-2 bg-[#635BFF] hover:bg-[#4C45E0] text-white shadow-[#635BFF]/25"
            >
              Rejoindre Waseet
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand-dark" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-charcoal-muted/60">Déjà un compte ?</span>
            </div>
          </div>

          <Link href="/login">
            <Button variant="outline" fullWidth size="lg" className="border-sand-dark text-[#635BFF] hover:border-[#635BFF] hover:bg-[#635BFF]/5">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>

      {/* Lien connexion (visible avant sélection) */}
      {!accountType && (
        <div className="mt-5 text-center">
          <p className="text-sm text-charcoal-muted">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-[#635BFF] hover:text-[#4C45E0] font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      )}

      {/* Avantages */}
      {!accountType && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "🏠", text: "Déclarez des biens facilement" },
            { icon: "💰", text: "Gagnez des commissions" },
            { icon: "🤝", text: "Parrainez, bénéficiez de bonus" },
          ].map((item) => (
            <div
              key={item.text}
              className="bg-white rounded-2xl p-3 text-center border border-sand-dark"
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <p className="text-xs text-charcoal-muted leading-tight">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page avec Suspense (requis pour useSearchParams) ──────────
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-card-lg p-8 animate-pulse space-y-4">
            <div className="h-8 bg-sand-dark rounded-xl w-1/2 mx-auto" />
            <div className="h-11 bg-sand-dark rounded-xl" />
            <div className="h-11 bg-sand-dark rounded-xl" />
            <div className="h-11 bg-sand-dark rounded-xl" />
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
