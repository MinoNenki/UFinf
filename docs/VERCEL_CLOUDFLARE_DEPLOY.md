# Vercel + Cloudflare deploy (ufinf.com)

Ten projekt to monorepo. Aplikacja web do deployu jest w katalogu `ai_growth_os`.

## 1) Vercel: import repo z GitHub

1. Wejdz na `https://vercel.com/new`.
2. Importuj repo `UFinf`.
3. W konfiguracji projektu ustaw:
   - Framework Preset: `Next.js`
   - Root Directory: `ai_growth_os`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: zostaw domyslne
4. Kliknij `Deploy`.

## 2) Vercel: zmienne srodowiskowe (Production)

⚠️ **Pełne instrukcje: patrz [docs/ENV_VARIABLES_SETUP.md](./ENV_VARIABLES_SETUP.md)**

Ustaw w `Project Settings -> Environment Variables` dla **Production and Preview**:

### Już ustawione ✅
- `APP_PUBLIC_URL=https://ufinf.com`
- `NEXT_PUBLIC_SITE_URL=https://ufinf.com`

### Wymagane do uzupełnienia ⚠️
- `STRIPE_SECRET_KEY=sk_test_...` (Stripe → Developers → API Keys)
- `STRIPE_WEBHOOK_SECRET=whsec_...` (uzupelnisz po dodaniu webhooka)
- `ADMIN_EMAIL=admin@ufinf.com`
- `ADMIN_PASSWORD=...` (bcrypt hashed, wygeneruj za help docs/ENV_VARIABLES_SETUP.md)
- `ADMIN_SESSION_SECRET=...` (minimum 32 znaki, losowo generuj)
- `ADMIN_TOTP_SECRET=...` (minimum 32 znaki, losowo generuj)

### Opcjonalnie
- `OPENAI_API_KEY` (jeśli używasz GPT)
- `ANTHROPIC_API_KEY` (jeśli używasz Claude)

## 3) Cloudflare -> Vercel: podpiety custom domain

1. W Vercel: `Project -> Settings -> Domains -> Add` dodaj:
   - `ufinf.com`
   - `www.ufinf.com`
2. Vercel pokaze rekordy DNS do dodania.
3. W Cloudflare (`DNS` dla strefy `ufinf.com`) dodaj rekordy dokladnie jak w Vercel:
   - zwykle `A`/`CNAME` dla apex i `CNAME` dla `www`.
4. Poczekaj na status `Valid Configuration` w Vercel.
5. W Vercel ustaw `ufinf.com` jako Primary Domain.

## 4) Stripe webhook (production)

Po tym jak domena dziala:

1. Stripe Dashboard -> Webhooks -> Add endpoint
2. Endpoint URL:
   - `https://ufinf.com/api/stripe/webhook`
3. Zdarzenia:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Skopiuj `Signing secret` i wklej do Vercel jako `STRIPE_WEBHOOK_SECRET`.
5. Zrob `Redeploy` projektu.

## 5) Waluta globalna

Projekt jest ustawiony na USD:
- Stripe checkout tworzy sesje z `currency: 'usd'`.
- Cennik frontendowy uzywa symbolu `$`.

## 6) Szybki test po deployu

1. Otworz `https://ufinf.com`.
2. Wejdz w pricing i kliknij top-up / subscription.
3. Sprawdz przekierowanie do Stripe Checkout.
4. Zrob platnosc testowa w Stripe Test Mode.
5. Potwierdz powrot na `/dashboard/account?payment=success`.
6. Sprawdz log webhooka w Stripe (`200 OK`).
