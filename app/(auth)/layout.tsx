import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Authentification", template: "%s | Waseet" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* ── Fond crème avec pattern ─────────────────────────── */}
      <div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: "#faf8f5" }}
      />
      {/* Grille de points subtile */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #C9973A22 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Tache violette floue en haut à droite */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full -z-10 opacity-10"
        style={{
          background:
            "radial-gradient(circle, #C9973A 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Tache violette floue en bas à gauche */}
      <div
        className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full -z-10 opacity-10"
        style={{
          background:
            "radial-gradient(circle, #C9973A 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* ── Contenu ─────────────────────────────────────────── */}
      {children}

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="mt-10 text-center text-xs text-charcoal-muted space-x-4">
        <span>© {new Date().getFullYear()} Waseet</span>
        <span>·</span>
        <a href="/legal/cgu"              className="hover:text-[#635BFF] transition-colors">CGU</a>
        <span>·</span>
        <a href="/legal/confidentialite" className="hover:text-[#635BFF] transition-colors">Confidentialité</a>
      </footer>
    </div>
  );
}
