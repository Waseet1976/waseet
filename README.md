# Waseet — Plateforme Immobilière

Plateforme SaaS de gestion de biens immobiliers pour apporteurs d'affaires, agents et agences. Déployée sur **waseet.be** (Belgique) et **waseet.ma** (Maroc).

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Base de données | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Auth | JWT custom (`jsonwebtoken`) |
| UI | Tailwind CSS v4 |
| Formulaires | react-hook-form + Zod |
| Email | SendGrid Dynamic Templates |
| SMS / WhatsApp | Twilio |
| Paiements | Stripe |
| CRM | GoHighLevel |
| Signature | HelloSign (Dropbox Sign) |
| Cartes | Google Maps JS API |
| Stockage | Supabase Storage |

---

## Installation locale

### Prérequis

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL (local ou Supabase)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/ton-org/waseet.git
cd waseet

# 2. Installer les dépendances
npm install

# 3. Copier et remplir les variables d'environnement
cp .env.local.example .env.local
# → éditer .env.local (voir section Variables ENV)

# 4. Configurer la base de données
npm run db:setup      # migrations + seed initial

# 5. Lancer en développement
npm run dev           # → http://localhost:3000
```

---

## Variables d'environnement

Créer `.env.local` à la racine (ne jamais committer) :

```env
# ── Base de données ──────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/waseet

# ── Supabase ─────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Auth JWT ─────────────────────────────────────────────────
JWT_SECRET=votre-secret-jwt-32-chars-minimum
JWT_EXPIRY=7d

# ── Google Maps ──────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...   # restreint au domaine
GOOGLE_MAPS_KEY=AIza...               # sans restriction (geocoding)

# ── SendGrid ─────────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@waseet.be
SENDGRID_TEMPLATE_WELCOME=d-xxx
SENDGRID_TEMPLATE_PROP_VALIDATED=d-xxx
SENDGRID_TEMPLATE_COMMISSION_PAID=d-xxx
SENDGRID_TEMPLATE_REFERRAL_BONUS=d-xxx
SENDGRID_TEMPLATE_NEW_REFERRAL=d-xxx

# ── Twilio ───────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+32...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ── Stripe ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ── GoHighLevel ──────────────────────────────────────────────
GHL_API_KEY=xxx
GHL_PIPELINE_ID=xxx
GHL_WEBHOOK_SECRET=xxx

# ── HelloSign (Dropbox Sign) ─────────────────────────────────
HELLOSIGN_API_KEY=xxx
HELLOSIGN_TEMPLATE_MANDATE=xxx
HELLOSIGN_TEMPLATE_COMPROMISE=xxx
HELLOSIGN_TEMPLATE_DEED=xxx
HELLOSIGN_TEMPLATE_APPORTEUR=xxx
HELLOSIGN_WEBHOOK_SECRET=xxx

# ── Application ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://waseet.be
APP_NAME=Waseet
```

---

## Commandes disponibles

```bash
# Développement
npm run dev               # Serveur local (http://localhost:3000)
npm run build             # Build production
npm run start             # Démarrer le build production
npm run lint              # Linting ESLint

# Base de données
npm run db:generate       # Générer le client Prisma
npm run db:push           # Push schema → DB (dev, sans migration)
npm run db:migrate        # Créer et appliquer une migration
npm run db:studio         # Interface graphique Prisma Studio
npm run db:seed           # Seeder les données de base
npm run db:setup          # Setup complet (migrations + seed)
```

---

## Architecture du projet

```
waseet/
├── app/
│   ├── (dashboard)/          # Pages utilisateur (auth requise)
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── properties/       # Liste + détail des biens
│   │   ├── pipeline/         # Kanban pipeline
│   │   ├── commissions/      # Mes commissions
│   │   ├── referral/         # Parrainage
│   │   ├── contracts/        # Mes contrats
│   │   └── profile/          # Profil + paramètres
│   ├── admin/                # Espace administrateur
│   │   ├── layout.tsx        # Sidebar admin (ADMIN only)
│   │   ├── page.tsx          # Dashboard KPIs
│   │   ├── declarations/     # Valider les biens déclarés
│   │   ├── duplicates/       # Gérer les doublons
│   │   ├── users/            # Gestion utilisateurs
│   │   └── commissions/      # Toutes les commissions
│   ├── api/
│   │   ├── auth/             # login, register, refresh
│   │   ├── properties/       # CRUD biens
│   │   ├── commissions/      # CRUD commissions
│   │   ├── referrals/        # Parrainage
│   │   ├── contracts/        # Contrats + HelloSign
│   │   ├── notifications/    # Notifications in-app
│   │   ├── geocoding/        # Google Geocoding
│   │   ├── admin/            # Routes admin
│   │   └── webhooks/
│   │       ├── stripe/       # Événements Stripe
│   │       ├── ghl/          # Événements GoHighLevel
│   │       └── hellosign/    # Événements HelloSign
│   └── login/                # Pages publiques
├── components/
│   ├── maps/                 # PropertiesMap (Google Maps + clustering)
│   ├── notifications/        # NotificationItem + NotificationList
│   ├── profile/              # NotificationSettings
│   └── referral/             # ReferralCodeBox
├── lib/
│   ├── prisma.ts             # Client Prisma singleton
│   ├── auth.ts               # JWT helpers
│   ├── config.ts             # Constantes métier
│   ├── utils.ts              # Formatage, helpers
│   ├── utils/cn.ts           # Tailwind cn()
│   ├── emails/templates.ts   # Templates SendGrid
│   └── services/
│       ├── commission.service.ts
│       ├── referral-bonus.service.ts
│       ├── notification.service.ts
│       ├── hellosign.service.ts
│       ├── ghl.service.ts
│       ├── stripe.service.ts
│       └── maps.service.ts
├── prisma/
│   └── schema.prisma         # Modèles Prisma
├── scripts/
│   ├── seed.ts               # Données initiales
│   └── setup-db.ts           # Setup complet DB
├── .github/workflows/
│   └── deploy.yml            # CI/CD GitHub Actions
├── vercel.json               # Configuration Vercel
└── .env.local                # Variables d'env (non commité)
```

### Modèles de données clés

| Modèle | Rôle |
|--------|------|
| `User` | Tous les utilisateurs (ADMIN/AGENCY/AGENT/DEAL_FINDER) |
| `Agency` | Agences immobilières (abonnées Stripe) |
| `Agent` | Profil agent (photo, fonction) |
| `Property` | Bien déclaré avec pipeline 8 étapes |
| `Commission` | Commission apporteur (ESTIMATED→VALIDATED→PAID) |
| `Referral` | Lien parrain/filleul + bonus |
| `Contract` | Contrat signé via HelloSign |
| `PipelineLog` | Historique des avances pipeline |
| `Notification` | Notifications in-app |

### Pipeline des 8 étapes

```
DECLARED → VALIDATED → IN_REVIEW → MANDATE_SIGNED →
COMPROMISE_SIGNED → DEED_SIGNED → COMMISSION_VALIDATED → COMMISSION_PAID
```

---

## Guide de déploiement (waseet.be)

### 1. Base de données PostgreSQL

**Option A — Supabase (recommandé)**
```
1. Créer un projet sur supabase.com
2. Copier DATABASE_URL depuis Settings > Database
3. Activer "Connection Pooling" (PgBouncer mode)
4. Ajouter DIRECT_URL pour les migrations
```

**Option B — Railway**
```
1. Créer un service PostgreSQL sur railway.app
2. Copier la DATABASE_URL depuis les variables
```

### 2. Déploiement Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Connecter au projet
vercel link

# Configurer les variables d'env sur Vercel Dashboard
# Settings > Environment Variables → ajouter toutes les vars

# Premier déploiement
vercel --prod

# Les déploiements suivants sont automatiques via GitHub Actions
```

### 3. Configuration DNS waseet.be

```
Type  Nom     Valeur
A     @       76.76.21.21      (IP Vercel)
CNAME www     cname.vercel-dns.com
```

Vérification : `nslookup waseet.be`

### 4. Webhooks à configurer

| Service | URL webhook | Événements |
|---------|-------------|-----------|
| Stripe | `https://waseet.be/api/webhooks/stripe` | `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed` |
| GoHighLevel | `https://waseet.be/api/webhooks/ghl` | `opportunity.stageChanged`, `contact.created` |
| HelloSign | `https://waseet.be/api/webhooks/hellosign` | `signature_request_all_signed` |

### 5. Secrets GitHub Actions

Ajouter dans `Settings > Secrets > Actions` :

```
VERCEL_TOKEN         # Vercel > Account Settings > Tokens
DATABASE_URL         # Connection string PostgreSQL
JWT_SECRET           # Secret JWT (min. 32 chars)
NEXT_PUBLIC_APP_URL  # https://waseet.be
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_GOOGLE_MAPS_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### 6. Google Maps — Restriction domaine

Dans Google Cloud Console → Credentials → Clé API :
- **Restrictions d'application** : Sites Web HTTP
- **Sites autorisés** :
  ```
  https://waseet.be/*
  https://www.waseet.be/*
  http://localhost:3000/*
  ```

### 7. HTTPS

Vercel active HTTPS automatiquement avec Let's Encrypt lors de l'ajout du domaine.

### 8. Checklist finale

```
☐ DATABASE_URL configuré sur Vercel
☐ Toutes les variables ENV renseignées
☐ npx prisma migrate deploy exécuté en production
☐ npm run db:seed exécuté (compte admin créé)
☐ DNS waseet.be pointant vers Vercel
☐ HTTPS actif (certificat Let's Encrypt)
☐ Stripe webhooks configurés et testés
☐ GHL webhooks configurés
☐ HelloSign webhooks configurés
☐ SendGrid domaine expéditeur vérifié
☐ Google Maps clé API restreinte au domaine
☐ Supabase bucket "avatars" créé (public)
☐ GitHub Actions secrets configurés
```

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `ADMIN` | Toute la plateforme + espace `/admin` |
| `AGENCY` | Biens de son agence, pipeline, commissions |
| `AGENT` | Biens assignés |
| `DEAL_FINDER` | Ses propres biens déclarés + commissions + parrainage |

## Comptes de test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@waseet.be | WaseetAdmin2024! |
| Agence BE | agence.be@waseet.be | Agence2024! |
| Agence MA | agence.ma@waseet.ma | Agence2024! |
| Apporteur BE | apporteur.be@test.com | Apporteur2024! |
| Apporteur MA | apporteur.ma@test.com | Apporteur2024! |

---

## Licence

Propriétaire — © 2024 Waseet. Tous droits réservés.
#   r e b u i l d  
 