"use client";

import { useEffect }            from "react";
import { useForm }              from "react-hook-form";
import { zodResolver }          from "@hookform/resolvers/zod";
import { useRouter }            from "next/navigation";
import Link                     from "next/link";
import { Mail, Lock }           from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth }              from "@/lib/hooks/useAuth";
import { Input }                from "@/components/ui/Input";
import { Button }               from "@/components/ui/Button";

// ── Redirection par rôle ──────────────────────────────────────
const ROLE_REDIRECT: Record<string, string> = {
  ADMIN:       "/admin",
  AGENCY:      "/dashboard",
  AGENT:       "/dashboard",
  DEAL_FINDER: "/dashboard",
};

// ── Page ──────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user, error: authError } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(ROLE_REDIRECT[user.role] ?? "/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const onSubmit = async (data: LoginInput) => {
    const result = await login(data);
    if (!result.success) {
      setError("root", { message: result.error ?? "Erreur de connexion" });
    }
    // La redirection est gérée par le useEffect ci-dessus
  };

  const isWorking = isSubmitting || isLoading;

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <img src="/logo.svg" alt="Waseet logo" className="h-12 w-auto" />
        </div>
        <p className="text-sm text-charcoal-muted mt-2">
          Connectez-vous à votre espace professionnel
        </p>
      </div>

      {/* Card */}
      <div className="bg-white border border-sand-dark rounded-2xl shadow-2xl shadow-black/8 p-8">
        <h1 className="text-2xl font-bold text-black tracking-tight mb-1">Bienvenue sur Waseet</h1>
        <p className="text-sm text-charcoal-muted mb-7">
          Gérez votre activité immobilière en toute simplicité
        </p>

        {/* Erreur globale */}
        {(errors.root || authError) && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
            <p className="text-sm text-red-600">
              {errors.root?.message ?? authError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <Input
            label="Adresse email"
            type="email"
            icon={<Mail />}
            placeholder="vous@exemple.ma"
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-black block">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#635BFF] hover:text-[#4C45E0] transition-colors font-medium"
                tabIndex={-1}
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Input
              type="password"
              icon={<Lock />}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isWorking}
            disabled={isWorking}
            className="mt-2 bg-[#635BFF] hover:bg-[#4C45E0] text-white shadow-[#635BFF]/25"
          >
            Se connecter
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sand-dark" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-charcoal-muted">
              Pas encore de compte ?
            </span>
          </div>
        </div>

        <Link href="/signup">
          <Button variant="outline" fullWidth size="lg" className="border-sand-dark text-[#635BFF] hover:border-[#635BFF] hover:bg-[#635BFF]/5">
            Créer mon compte gratuitement
          </Button>
        </Link>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-charcoal-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Données sécurisées
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          SSL chiffré
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          RGPD conforme
        </span>
      </div>
    </div>
  );
}
