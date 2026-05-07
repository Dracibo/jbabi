# JBABI — Tableau de bord patron

Application web de pilotage d'une flotte de livreurs à moto. Lecture des saisies depuis Google Sheets, agrégations à la volée, graphiques interactifs, hébergement Vercel.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Plus Jakarta Sans
- Auth.js v5 (Credentials, email + mot de passe, **un seul compte patron**)
- Google Sheets API v4 via `googleapis` (compte de service)
- Chart.js + `chartjs-plugin-zoom` pour les graphiques (pan/zoom)
- `nuqs` pour l'état de période synchronisé à l'URL
- `date-fns` + `react-day-picker`

## Démarrage local

```bash
cp .env.example .env.local
npm run hash-password "ton_mot_de_passe_admin"   # → coller dans ADMIN_PASSWORD_HASH
npm run dev
```

Ouvre http://localhost:3000 → tu seras redirigé vers `/login`.

## Configuration Google Sheets (requis avant premier lancement)

1. Sur https://console.cloud.google.com, créer un projet.
2. Activer **Google Sheets API**.
3. **IAM & Admin → Service Accounts** → créer un compte de service.
4. Sur le compte de service, **Keys → Add Key → JSON** → télécharger.
5. Récupérer dans le JSON :
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (avec les `\n` littéraux)
6. Ouvrir le Google Sheet, **Partager** → coller le `client_email` (lecture suffisante).
7. Récupérer l'`ID` du sheet (entre `/d/` et `/edit` dans l'URL) → `GOOGLE_SHEET_ID`.

Le code lit la feuille **`Suivi Journalier`**, colonnes A→L (par défaut `'Suivi Journalier'!A1:L` — les apostrophes simples sont requises à cause de l'espace).

Le parser ignore automatiquement les lignes décoratives :
- titres fusionnés ("LIVRAISON PAR MOIS POUR 2026"),
- séparateurs de mois ("MOIS DE JANVIER", "MOIS D'AVRIL", …),
- en-têtes répétés ("Date", "Nom du livreur"),
- lignes vides ou totaux.

Schéma attendu (12 colonnes) :

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Date | Nom du livreur | Solde initial | Nb livraisons | Montant total | Carburant | Réparation | Autres dépenses | Total dépenses | Recette nette | Nouveau solde | Observation |

Le cache Sheets se rafraîchit toutes les 60 secondes côté serveur (`unstable_cache`).

## Déploiement Vercel

1. `git init && git add . && git commit -m "init"`
2. Pousser sur GitHub.
3. Sur https://vercel.com → **New Project** → importer le repo.
4. Définir les variables d'environnement (toutes celles de `.env.example`).
   - **Important :** pour `GOOGLE_PRIVATE_KEY`, coller la valeur entière y compris les `\n`.
5. Deploy.

## Structure

```
app/
  (dashboard)/        # routes protégées par auth
    page.tsx          # Vue d'ensemble
    livraisons/       # Évolution des livraisons
    livreurs/         # Classement et détails
    depenses/         # Analyse Carburant/Réparation/Autres
    historique/       # Toutes les saisies
    layout.tsx        # auth check + sidebar + mobile nav
  login/              # page de connexion
  api/auth/[...nextauth]/route.ts
  globals.css         # palette + composants utilitaires
  layout.tsx          # font + NuqsAdapter
auth.ts               # config NextAuth Credentials
lib/
  sheets/             # client Google Sheets + parsing
  aggregate.ts        # KPIs, séries journalières, agrégations livreur
  period-search-params.ts
  types.ts utils.ts
components/
  charts/             # Chart.js wrappers (line/bar/donut/stack/combo)
  dashboard/          # sidebar, mobile nav, KPI card, period selector, etc.
scripts/
  hash-password.mjs   # bcrypt CLI helper
```

## Gestion du temps

Les filtres période sont synchronisés à l'URL (querystring) :

- `preset` : `today`, `7d`, `30d`, `month`, `lastmonth`, `ytd`, `custom`
- `from`, `to` : `yyyy-mm-dd` (utilisés si `preset=custom`)
- `gran` : `day`, `week`, `month` — granularité d'agrégation des graphiques

Les KPIs comparent automatiquement avec la période précédente équivalente.
