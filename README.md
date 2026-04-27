# I Deserve It

PWA personnelle pour Rebecca. Affirmations quotidiennes, suivi de poids, push notifications iOS aux moments-clés.

**Stack** : Next.js 15 · Supabase (auth + DB + RLS) · Web Push (VAPID) · Vercel (host + cron) · Tailwind · Recharts

---

## 🚀 Déploiement — étapes dans l'ordre

### 1. Pousser le code sur GitHub

```bash
cd i-deserve-it
git init
git add .
git commit -m "init"
git remote add origin https://github.com/wilow445/i-deserve-it.git
git branch -M main
git push -u origin main
```

### 2. Configurer Supabase

1. Va sur ton projet Supabase i-deserve-it
2. **SQL Editor → New Query** : copie-colle tout le contenu de `supabase/migrations/00_init.sql` et clique **Run**
3. **Authentication → Providers → Email** : vérifie que **Email** est activé. Désactive "Confirm email" si tu veux que le magic link marche directement (sinon Rebecca devra confirmer son email d'abord — c'est OK aussi)
4. **Authentication → URL Configuration** :
   - **Site URL** : `https://i-deserve-it.vercel.app` (l'URL que Vercel va te donner)
   - **Redirect URLs** : ajoute `https://i-deserve-it.vercel.app/auth/callback` et `http://localhost:3000/auth/callback` (pour dev local)
5. **Settings → API** : note ces 3 valeurs pour Vercel :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (clic sur "reveal") → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ secret, jamais côté client

### 3. Régénérer les clés VAPID

⚠️ **Ta clé privée a été partagée dans la conversation, regénère-la :**

```bash
sudo npx web-push generate-vapid-keys
```

Note les **deux** clés (publique + privée). Choisis aussi un email pour le `VAPID_SUBJECT` (le tien).

### 4. Configurer Vercel

Sur l'écran **New Project** que tu m'avais montré :

- **Application Preset** : change "Other" → **Next.js**
- **Root Directory** : `./`
- **Build Command** : laisse défaut (`next build`)
- Clique sur **Environment Variables** et ajoute toutes celles-ci :

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJ...
SUPABASE_SERVICE_ROLE_KEY         = eyJ...
NEXT_PUBLIC_VAPID_PUBLIC_KEY      = BK... (la nouvelle)
VAPID_PRIVATE_KEY                 = ... (la nouvelle)
VAPID_SUBJECT                     = mailto:ton-email@example.com
ANTHROPIC_API_KEY                 = sk-ant-... (depuis console.anthropic.com)
CRON_SECRET                       = [random — ex: openssl rand -hex 32]
```

Puis clique **Deploy**. Le premier build prend ~2 min.

### 5. Activer Vercel Cron

Vercel détectera automatiquement `vercel.json` qui définit le cron `* * * * *` (chaque minute) sur `/api/cron/send-notifications`.

⚠️ Sur le plan **Hobby** de Vercel, les cron jobs sont limités. Vérifie dans **Project Settings → Cron Jobs** que ton cron est bien actif. Si Hobby ne te le permet pas en runtime/minute, tu as 2 fallbacks gratuits :

- **cron-job.org** (gratuit, illimité) : crée un cron qui fait `GET https://i-deserve-it.vercel.app/api/cron/send-notifications?secret=TON_CRON_SECRET` toutes les minutes
- **Upstash QStash** (free tier 500 calls/jour, suffisant)

### 6. Installer la PWA sur l'iPhone de Rebecca

1. Sur Safari (pas Chrome) iOS, va sur `https://i-deserve-it.vercel.app`
2. Connecte-toi avec son email → reçoit le magic link → clique
3. **Bouton Partager → Sur l'écran d'accueil → Ajouter** ⚠️ étape obligatoire pour que les push iOS fonctionnent
4. Ouvre l'app depuis l'écran d'accueil (icône rose)
5. Va dans **Réglages** (icône en haut à droite)
6. Clique **Activer** sur "Notifications" → autorise quand iOS demande
7. Ajuste les horaires des 5 catégories (Matin / Repas / Anti-fringale / Sport / Soir) selon ses habitudes
8. Clique **Envoyer une notif test** pour vérifier

### 7. Vérifier que tout marche

- Ouvre les **logs Vercel** (Project → Deployments → ton déploiement → Functions → /api/cron/send-notifications)
- Tu devrais voir le cron tourner chaque minute avec un payload `{ checked: 5, sent: 0 }` quand aucun horaire ne match
- Quand un horaire match, tu verras `sent: 1`

---

## 📁 Architecture

```
i-deserve-it/
├── app/
│   ├── (app)/                    # Layout group authentifié (avec BottomNav)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Today
│   │   ├── plan/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── affirmations/page.tsx
│   │   └── settings/page.tsx     # ⭐ Time pickers
│   ├── api/
│   │   ├── push/{subscribe,test}/route.ts
│   │   ├── cron/send-notifications/route.ts   # ⭐ Run every minute
│   │   └── affirmations/generate/route.ts
│   ├── auth/callback/route.ts    # Magic link callback
│   ├── login/page.tsx
│   ├── globals.css
│   └── layout.tsx                # Root + ServiceWorkerRegister
├── components/
│   ├── ui/                       # Logo, Header, BottomNav, Ornament
│   ├── views/                    # TodayView, PlanView, etc.
│   └── modals/                   # Sheet, WeighInModal, AddAffirmationModal
├── lib/
│   ├── supabase/{client,server,admin}.ts
│   ├── constants.ts              # PLAN, FOODS, SPORT, REWARDS, CATEGORIES
│   ├── affirmations.ts           # 17 phrases par défaut
│   ├── push.ts                   # subscribe/unsubscribe helpers
│   ├── utils.ts
│   └── hooks/use-animated-number.ts
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker (push handler)
│   ├── icon-192.png · icon-512.png · apple-touch-icon.png · favicon.ico
│   └── icon.svg                  # Source
├── supabase/migrations/00_init.sql
├── middleware.ts                 # Auth redirect
├── vercel.json                   # Cron config
└── .env.example
```

---

## 🧪 Dev local (optionnel)

```bash
cp .env.example .env.local
# Remplis avec tes valeurs Supabase + VAPID + Anthropic
npm install
npm run dev
```

Va sur `http://localhost:3000`. Push notifications ne marchent pas en local sur iOS Safari — pour tester, utilise Chrome desktop (les push y marchent en local sur HTTPS… ou `localhost`).

---

## 🔧 Dépannage

**Magic link ne marche pas** → vérifie que les Redirect URLs Supabase incluent `/auth/callback` et que ton Site URL pointe vers le bon domaine Vercel.

**Push test renvoie "no-subscriptions"** → la PWA n'est pas installée sur l'écran d'accueil iOS. Étape obligatoire avant de pouvoir s'abonner.

**Cron tourne mais aucune notif** → check les logs : si `sent: 0` mais des schedules sont actifs, c'est probablement un mismatch de timezone. La table `notification_schedules` stocke un `timezone` qui est défini au moment de l'enregistrement (auto-détecté côté client). Vérifie qu'il vaut bien `Europe/Paris` pour Rebecca.

**Build Vercel échoue** → vérifie que toutes les env vars sont bien définies (surtout `SUPABASE_SERVICE_ROLE_KEY` qui est obligatoire pour le cron).

**iOS reçoit pas la notif** → iOS rate-limit Web Push. Si Rebecca n'a pas ouvert la PWA depuis longtemps, iOS peut "endormir" l'abonnement. Solution : ouvrir l'app de temps en temps, ou augmenter la fréquence des push (mais on ne veut pas).

---

## 🎨 Direction design

Editorial Bloom — voir `design-arsenal/` pour les principes. Direction validée :

- Fonts : Fraunces (display italic) + Manrope (body)
- Palette : crème `#FBF6F0`, bordeaux `#2A1316`, rose `#C8546B`, blush `#F8E1E7`
- Motion : refined, outExpo (cubic-bezier(0.16, 1, 0.3, 1)), 400-1200ms
- Signature : carte affirmation avec aurora subtile + ornement éditorial, sliding pill nav, journey strip 17 points, animated number ticker

---

## 📜 License

Personnel — pas de license publique.
