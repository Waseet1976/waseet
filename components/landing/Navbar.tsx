"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#how",         label: "Comment ça marche" },
    { href: "#for-who",     label: "Pour qui" },
    { href: "#advantages",  label: "Fonctionnalités" },
    { href: "#calc",        label: "Simulateur" },
  ];

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
        : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

       {/* Logo */}
<Link href="/" className="flex items-center gap-3 flex-shrink-0">
  <img src="/logo.svg" alt="Waseet logo" className="h-9 w-auto" />
</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-charcoal hover:text-obsidian transition-colors px-4 py-2 rounded-xl hover:bg-sand"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white bg-[#635BFF] hover:bg-[#4C45E0] transition-colors px-5 py-2.5 rounded-xl shadow-sm"
          >
            Essai gratuit
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-sand-dark px-5 py-5 space-y-1 shadow-lg">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm text-charcoal hover:text-obsidian hover:bg-sand-light rounded-lg transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-3">
            <Link
              href="/login"
              className="text-sm font-medium text-center py-2.5 border border-sand-dark rounded-xl hover:bg-sand-light transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-center text-white bg-[#635BFF] hover:bg-[#4C45E0] py-2.5 rounded-xl transition-colors"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
