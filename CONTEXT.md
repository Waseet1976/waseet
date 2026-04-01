# 🧠 CONTEXT.md — État du projet Waseet
> ⚠️ Ce fichier est mis à jour automatiquement après chaque modification majeure.
> Claude doit TOUJOURS lire ce fichier en premier avant de faire quoi que ce soit.

## 📅 Dernière mise à jour
DATE: 31/03/2026 11:36
PROMPT_EN_COURS: Design system harmonisation
FICHIERS_MODIFIES: /app/(auth)/signup/page.tsx, /app/(auth)/login/page.tsx, /components/ui/index.tsx, /lib/design-system.ts, /app/page.tsx

## 📌 Projet
Nom: Waseet
Type: SaaS immobilier multi-pays
Marchés: Belgique (principal) + Maroc (extension)
Stack: Next.js 14 + TypeScript + Prisma + PostgreSQL + NextAuth + Zod + Supabase Auth
Repo local: c:\Users\mydia\Waseet

## ✅ Prompts complétés
- [x] Prompt 1.1 — Setup projet Next.js (package.json, tsconfig, tailwind, next.config, .gitignore)
- [x] Prompt 1.2 — Schéma Prisma (9 modèles complets + enums)
- [x] Prompt 1.3 — Config, utils, middleware (lib/config.ts, lib/utils.ts, middleware.ts, .env.local)
- [x] Prompt 2.1 — Auth backend (lib/auth.ts, api/auth/register, api/auth/login, api/auth/me, useAuth hook)
- [x] Prompt 2.2 — Pages auth UI (layout auth, login page, signup page, composants Button/Input/Logo)
- [x] Prompt 3.1 — Layout dashboard (DashboardShell, Sidebar par rôle, Header, NotificationPanel, Badge, Card)
- [x] Prompt 3.2 — Dashboard Deal Finder (page + api/dashboard/stats avec 5 requêtes parallèles)
- [x] Prompt 4.1 — Formulaire déclaration bien
- [x] Prompt 4.2 — Liste et détail biens
- [x] Prompt 5.1 — Pipeline et commissions
- [x] Prompt 6.1 — Parrainage
- [x] Prompt 6.2 — Profil utilisateur
- [x] Prompt 7.1 — Dashboard Admin
- [x] Prompt 8.1 — Notifications (page + api)
- [x] Prompt 8.2 — Contrats HelloSign
- [x] Prompt 9.1 — Intégrations webhooks (GHL, Twilio)
- [x] Prompt 9.2 — Déploiement Vercel

## 📁 Fichiers créés jusqu'ici
Dernière mise à jour: 31/03/2026 11:36
Fichiers .tsx dans app/: 27
Fichiers .ts dans lib/: 24
Fichiers récemment modifiés:
  - /app/(auth)/signup/page.tsx
  - /app/(auth)/login/page.tsx
  - /components/ui/index.tsx
  - /lib/design-system.ts
  - /app/page.tsx
  - /app/layout.tsx
  - /tailwind.config.ts
  - /components/landing/PricingSection.tsx
  - /components/landing/Hero.tsx
  - /components/landing/Navbar.tsx

Structure du projet:
```
├── .github
│   └── workflows
├── app
│   ├── (auth)
│   │   ├── forgot-password
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── register
│   │   │   └── page.tsx
│   │   ├── reset-password
│   │   ├── signup
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)
│   │   ├── calendar
│   │   ├── clients
│   │   │   ├── new
│   │   │   ├── [id]
│   │   │   └── page.tsx
│   │   ├── commissions
│   │   │   └── page.tsx
│   │   ├── contracts
│   │   │   ├── new
│   │   │   ├── [id]
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── deals
│   │   │   ├── new
│   │   │   ├── [id]
│   │   │   └── page.tsx
│   │   ├── declare
│   │   │   └── page.tsx
│   │   ├── messages
│   │   ├── pipeline
│   │   │   └── page.tsx
│   │   ├── profile
│   │   │   └── page.tsx
│   │   ├── properties
│   │   │   ├── new
│   │   │   ├── [id]
│   │   │   └── page.tsx
│   │   ├── referral
│   │   │   └── page.tsx
│   │   ├── reports
│   │   ├── settings
│   │   │   ├── notifications
│   │   │   ├── profile
│   │   │   ├── subscription
│   │   │   └── team
│   │   └── layout.tsx
│   ├── (public)
│   │   └── properties
│   │       └── [id]
│   ├── admin
│   │   ├── commissions
│   │   │   └── page.tsx
│   │   ├── contracts
│   │   │   └── page.tsx
│   │   ├── declarations
│   │   │   └── page.tsx
│   │   ├── duplicates
│   │   │   └── page.tsx
│   │   ├── logs
│   │   │   └── page.tsx
│   │   ├── pipeline
│   │   │   └── page.tsx
│   │   ├── users
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api
│   │   ├── admin
│   │   │   ├── logs
│   │   │   ├── pipeline
│   │   │   ├── stats
│   │   │   ├── users
│   │   │   └── validate-property
│   │   ├── auth
│   │   │   ├── login
│   │   │   ├── me
│   │   │   ├── register
│   │   │   └── [...nextauth]
│   │   ├── clients
│   │   ├── commissions
│   │   │   ├── [id]
│   │   │   └── route.ts
│   │   ├── contracts
│   │   │   ├── [id]
│   │   │   └── route.ts
│   │   ├── dashboard
│   │   │   └── stats
│   │   ├── deals
│   │   ├── geocoding
│   │   │   └── route.ts
│   │   ├── messages
│   │   ├── notifications
│   │   │   ├── read-all
│   │   │   ├── [id]
│   │   │   └── route.ts
│   │   ├── properties
│   │   │   ├── check-duplicate
│   │   │   ├── [id]
│   │   │   └── route.ts
│   │   ├── referrals
│   │   │   ├── bonus
│   │   │   └── route.ts
│   │   ├── upload
│   │   ├── users
│   │   │   ├── password
│   │   │   └── profile
│   │   └── webhooks
│   │       ├── ghl
│   │       ├── hellosign
│   │       ├── stripe
│   │       └── twilio
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── client
│   ├── contract
│   ├── dashboard
│   │   ├── DashboardShell.tsx
│   │   ├── Header.tsx
│   │   ├── NotificationPanel.tsx
│   │   ├── sidebar-context.tsx
│   │   └── Sidebar.tsx
│   ├── deal
│   ├── forms
│   │   └── FileUpload.tsx
│   ├── landing
│   │   ├── Advantages.tsx
│   │   ├── CommissionCalc.tsx
│   │   ├── CTASection.tsx
│   │   ├── Footer.tsx
│   │   ├── ForWho.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Navbar.tsx
│   │   ├── PricingSection.tsx
│   │   └── Security.tsx
│   ├── layout
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── map
│   ├── maps
│   │   └── PropertiesMap.tsx
│   ├── notifications
│   │   └── NotificationItem.tsx
│   ├── profile
│   │   └── NotificationSettings.tsx
│   ├── property
│   │   ├── PipelineVisual.tsx
│   │   └── Timeline.tsx
│   ├── referral
│   │   └── ReferralCodeBox.tsx
│   ├── shared
│   ├── ui
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── index.tsx
│   │   ├── Input.tsx
│   │   ├── Logo.tsx
│   │   └── Skeleton.tsx
│   └── Providers.tsx
├── config
│   └── constants.ts
├── hooks
│   └── useSupabase.ts
├── lib
│   ├── auth
│   ├── email
│   │   └── sendgrid.ts
│   ├── emails
│   │   └── templates.ts
│   ├── hooks
│   │   └── useAuth.tsx
│   ├── maps
│   ├── prisma
│   │   └── client.ts
│   ├── services
│   │   ├── commission.service.ts
│   │   ├── ghl.service.ts
│   │   ├── hellosign.service.ts
│   │   ├── maps.service.ts
│   │   ├── notification.service.ts
│   │   ├── referral-bonus.service.ts
│   │   └── stripe.service.ts
│   ├── sms
│   │   └── twilio.ts
│   ├── stripe
│   │   └── client.ts
│   ├── supabase
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── utils
│   │   └── cn.ts
│   ├── validations
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   └── property.ts
│   ├── auth.ts
│   ├── config.ts
│   ├── design-system.ts
│   ├── prisma.ts
│   └── utils.ts
├── prisma
│   ├── migrations
│   └── schema.prisma
├── public
│   ├── icons
│   └── images
├── scripts
│   ├── save-and-update.bat
│   ├── seed.ts
│   ├── setup-db.ts
│   └── update-context.js
├── styles
├── types
│   ├── index.ts
│   └── next-auth.d.ts
├── utils
│   └── format.ts
├── .eslintrc.json
├── CONTEXT.md
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```
## 🗄 Schéma DB — État actuel
Fichier: prisma/schema.prisma
Provider: PostgreSQL

Enums:
- Role: ADMIN, AGENCY, AGENT, DEAL_FINDER ✅
- PipelineStage: DECLARED → COMMISSION_PAID (8 étapes) ✅
- AdminStatus: PENDING, VALIDATED, REJECTED ✅
- CommissionStatus: ESTIMATED, VALIDATED, PAID ✅
- ContractStatus: DRAFT, SENT, SIGNED, REJECTED ✅
- ContractType: MANDATE, COMPROMISE, DEED ✅

Models créés:
- User ✅ (email, password hashé, role, referralCode unique, referredById self-relation)
- Agency ✅ (commissionRate 2.5%, apporteurShare 40%, stripeCustomerId)
- Agent ✅ (profil séparé 1-to-1 avec User, photo, fonction)
- Property ✅ (pipeline, adminStatus, duplicateKey, ghlOpportunityId, photos[], owner info)
- Commission ✅ (estimatedAmount, validatedAmount, apporteurId, agencyId)
- Referral ✅ (referrerId, referredId, bonusAmount, bonusPaid, unique[referrerId+referredId])
- PipelineLog ✅ (historique des changements de stage)
- Contract ✅ (MANDATE/COMPROMISE/DEED, templateUsed, documentUrl)
- Notification ✅ (type, title, message, isRead, link)

## 🔑 Variables ENV configurées
DATABASE_URL: ✅ (à remplir)
NEXT_PUBLIC_SUPABASE_URL: ✅ (à remplir)
NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ (à remplir)
SUPABASE_SERVICE_ROLE_KEY: ✅ (à remplir)
NEXTAUTH_URL: ✅ http://localhost:3000
NEXTAUTH_SECRET: ✅ (à remplir)
JWT_SECRET: ⏳ (à ajouter dans .env.local)
NEXT_PUBLIC_GOOGLE_MAPS_KEY: ⏳
SENDGRID_API_KEY: ⏳
SENDGRID_FROM_EMAIL: ✅ noreply@waseet.be
STRIPE_SECRET_KEY: ⏳
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ⏳
STRIPE_WEBHOOK_SECRET: ⏳
GHL_API_KEY: ⏳
GHL_PIPELINE_ID: ⏳
TWILIO_ACCOUNT_SID: ⏳
TWILIO_AUTH_TOKEN: ⏳
TWILIO_PHONE_NUMBER: ⏳
TWILIO_WHATSAPP_NUMBER: ⏳
NEXT_PUBLIC_APP_URL: ✅ http://localhost:3000
APP_NAME: ✅ Waseet

## ⚙️ Règles métier critiques
1. declaredAt → TOUJOURS new Date() côté serveur, jamais côté client
2. duplicateKey → buildDuplicateKey(country, city, surface, price) — normalisé sans accents
3. isPriority → true si premier à déclarer ce bien (même duplicateKey, count = 1)
4. Commission → créée automatiquement quand pipelineStage passe à DEED_SIGNED
5. Bonus parrainage → 2500 (BONUS_REFERRAL_AMOUNT) quand commission filleul = PAID
6. Pipeline → sens unique, ne peut PAS reculer (DECLARED → … → COMMISSION_PAID)
7. AdminStatus → seul un ADMIN ou AGENCY peut valider/rejeter un bien
8. Token JWT → stocké dans localStorage sous clé "waseet_token"
9. Rôle dans JWT app_metadata (Supabase) ou user_metadata (dev fallback)
10. referralCode → format WST-{2 initiales prénom}{4 derniers chars id}

## 🎨 Design system
Fichier: tailwind.config.ts
Police: Inter (latin)
Fond général: sand (#F5EFE0)
Sidebar: charcoal (#1C1C1A)

Couleurs:
- gold:    #C9973A  (gold-light: #E5B85C, gold-dark: #A67A28)
- sand:    #F5EFE0  (sand-dark: #EDE4CC, sand-light: #FAF7F0)
- obsidian:#0F0F0E
- charcoal:#1C1C1A  (charcoal-light: #2C2C2A, charcoal-muted: #3C3C3A)
- success: #3A8A5A  (bg: #F0FBF4)
- danger:  #C93A3A  (bg: #FFF0F0)
- warning: #C97A3A  (bg: #FFF8F0)

Classes Tailwind custom (globals.css):
- .btn-primary / .btn-secondary / .btn-outline / .btn-ghost
- .card / .card-hover
- .input / .input-error
- .badge / .badge-gold / .badge-success / .badge-danger / .badge-warning
- .skeleton
- .text-gradient-gold
- .bg-gradient-waseet / .bg-gradient-gold

Composants UI disponibles:
- components/ui/Button.tsx  (variants: primary, secondary, outline, ghost, danger)
- components/ui/Input.tsx   (icon, label, error, hint, password toggle)
- components/ui/Logo.tsx    (variants: light, dark — sizes: sm, md, lg)
- components/ui/Badge.tsx   (variants: gold, success, warning, danger, info, muted)
- components/ui/Card.tsx    (CardHeader, CardTitle, CardBody, CardContent, CardFooter)
- components/ui/Avatar.tsx
- components/ui/Skeleton.tsx

## 📐 Architecture fichiers
```
app/
├── (auth)/          → layout.tsx, login/, signup/, forgot-password/, reset-password/
├── (dashboard)/     → layout.tsx → DashboardShell (sidebar + header)
│   ├── dashboard/   → page.tsx (DEAL_FINDER dashboard avec stats)
│   ├── properties/  → page.tsx (liste — à faire)
│   ├── clients/     → page.tsx
│   ├── deals/       → page.tsx
│   ├── contracts/   → page.tsx
│   ├── calendar/    → page.tsx
│   ├── messages/    → page.tsx
│   ├── reports/     → page.tsx
│   └── settings/    → profile/, subscription/, notifications/, team/
├── api/
│   ├── auth/        → register/, login/, me/, [...nextauth]/
│   ├── dashboard/   → stats/
│   ├── properties/
│   ├── clients/
│   ├── contracts/
│   ├── deals/
│   ├── messages/
│   ├── upload/
│   └── webhooks/    → stripe/
├── globals.css
├── layout.tsx       → root layout (Inter font, metadata)
└── page.tsx         → landing page

lib/
├── auth.ts          → hashPassword, verifyPassword, generateToken, verifyToken, extractBearerToken
├── config.ts        → PIPELINE_STAGES, ROLES, COMMISSION_STATUSES, COUNTRIES, PROPERTY_TYPES, BONUS_REFERRAL_AMOUNT
├── utils.ts         → cn, formatPrice, formatDate, getInitials, generateReferralCode, calculateCommission, buildDuplicateKey
├── prisma.ts        → singleton PrismaClient
├── hooks/
│   └── useAuth.ts   → login(), register(), logout(), user, isAuthenticated, isLoading
├── supabase/        → client.ts, server.ts, middleware.ts
├── stripe/          → client.ts
├── email/           → sendgrid.ts
├── sms/             → twilio.ts
└── validations/
    ├── auth.ts      → registerSchema, loginSchema
    ├── property.ts  → propertySchema
    └── client.ts    → clientSchema

components/
├── dashboard/
│   ├── DashboardShell.tsx  → layout client avec SidebarProvider
│   ├── Sidebar.tsx         → nav par rôle, user block, code parrainage
│   ├── Header.tsx          → titre auto, search, notifs, user dropdown
│   ├── NotificationPanel.tsx → panel notifications
│   └── sidebar-context.tsx → SidebarContext + useSidebar hook
└── ui/
    ├── Button.tsx / Input.tsx / Logo.tsx / Badge.tsx / Card.tsx
    ├── Avatar.tsx / Skeleton.tsx
    └── ...

middleware.ts → protection routes par rôle (ADMIN/AGENCY/AGENT/DEAL_FINDER)
prisma/schema.prisma → 9 modèles + 6 enums
```

## 🚨 Dernières erreurs connues
Aucune pour le moment.

## 📝 Notes importantes
- [31/03/2026 11:36] lib/design-system.ts cree, components/ui/index.tsx cree (Button/Input/Select/Card/Badge/StatCard/PageTitle/Divider), variables CSS globales ajoutees dans globals.css, pages auth harmonisees visuellement
- [31/03/2026 11:25] PricingSection créé, aucune erreur TypeScript
- Belgique = EUR (€), Maroc = MAD (DH) — formatPrice(amount, countryCode)
- HelloSign prévu pour signature électronique légale des contrats
- Middleware protège /dashboard /admin /agency /agent (redirect /login si non connecté)
- Rôles: ADMIN > AGENCY > AGENT > DEAL_FINDER
- Prisma v5.22.0 (Node 20.12.1 — incompatible avec v7)
- Zod v4.x installé — utiliser z.email() et .pipe() (pas z.string().email() déprécié)
- auth-helpers-nextjs déprécié → utiliser @supabase/ssr
