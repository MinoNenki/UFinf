# Zmienne Środowiskowe (Environment Variables) - Vercel Setup

## Przegląd wymaganych zmiennych

Wszystkie zmienne powinny być ustawione w **Vercel Project Settings → Environment Variables** dla środowiska **Production and Preview**.

### Zmienne już ustawione ✅
- `APP_PUBLIC_URL=https://ufinf.com`
- `NEXT_PUBLIC_SITE_URL=https://ufinf.com`

### Zmienne do uzupełnienia ⚠️

#### 1. **Stripe Payment Integration**

| Zmienna | Opis | Gdzie znaleźć |
|---------|------|---------------|
| `STRIPE_SECRET_KEY` | Secret API key (test/live) | Stripe Dashboard → Developers → API Keys → Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks → Signing secret (generowany po skonfig. webhook) |
| `STRIPE_PUBLISHABLE_KEY` (opcjonalnie) | Publiczny klucz Stripe | Stripe Dashboard → Developers → API Keys → Publishable Key |

**Stripe Test Mode:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

**Stripe Live Mode (Production):**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

#### 2. **Admin Panel Security**

| Zmienna | Opis | Wygenerować |
|---------|------|-----------|
| `ADMIN_EMAIL` | Email do admin logowania | Wybierz własny (np. admin@ufinf.com) |
| `ADMIN_PASSWORD` | Hasło (bcrypt hash) | Wygeneruj bezpieczne hasło i zhashuj |
| `ADMIN_SESSION_SECRET` | JWT secret (minimum 32 znaki) | `openssl rand -base64 32` |
| `ADMIN_TOTP_SECRET` | Base32 secret do 2FA (minimum 32 znaki) | `openssl rand -base64 32` lub `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

**Przykład generowania secretów w PowerShell:**
```powershell
# SESSION_SECRET
[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))

# TOTP_SECRET (samo secret)
[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))

# Hasło - użyj biblioteki bcrypt
npm install -g bcryptjs
node -e "console.log(require('bcryptjs').hashSync('twoje-haslo-tutaj', 10))"
```

#### 3. **AI Providers (opcjonalnie)**

| Zmienna | Opis | Gdzie znaleźć |
|---------|------|---------------|
| `OPENAI_API_KEY` | OpenAI API key | OpenAI Platform → API Keys |
| `ANTHROPIC_API_KEY` | Anthropic API key | Anthropic Console → API Keys |

---

## Kroki konfiguracji w Vercel

### Metoda 1: UI Vercel (wolna, ale bezpieczna)

1. Wejdź na: `https://vercel.com/minonenkis-projects/u-finf/settings/environment-variables`
2. Kliknij **"Add Environment Variable"**
3. Dla każdej zmiennej:
   - Pole **Key**: wprowadź nazwę zmiennej (np. `ADMIN_EMAIL`)
   - Pole **Value**: wprowadź wartość
   - **Sensitive**: zaznacz (dla kluczy Stripe i secretów)
   - **Environments**: `Production and Preview`
   - Kliknij **Save**

### Metoda 2: .env.local (do testowania lokalnie)

Stwórz plik w `ai_growth_os/.env.local`:

```env
# Production URLs
APP_PUBLIC_URL=https://ufinf.com
NEXT_PUBLIC_SITE_URL=https://ufinf.com

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_WEBHOOK_SECRET_HERE

# Admin Panel
ADMIN_EMAIL=admin@ufinf.com
ADMIN_PASSWORD=your_bcrypt_hashed_password_here
ADMIN_SESSION_SECRET=your_32_char_secret_here
ADMIN_TOTP_SECRET=your_32_char_totp_secret_here

# Optional AI providers
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
```

⚠️ **Nigdy nie wrzucaj .env.local do Git!** Plik jest na `.gitignore`.

---

## Konfiguracja Stripe Webhook w Production

Po skonfigurowaniu zmiennych Stripe i gdy domena `ufinf.com` będzie działać:

1. Wejdź do **Stripe Dashboard → Developers → Webhooks**
2. Kliknij **"Add endpoint"**
3. Endpoint URL: `https://ufinf.com/api/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Kliknij **"Add endpoint"**
6. Skopiuj **Signing secret** (whsec_...)
7. W Vercel → Environment Variables ustaw: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Weryfikacja zmiennych w Vercel

Po ustawieniu wszystkich zmiennych:

1. Przejdź do **Deployments** w Vercel
2. Trigger nowy deployment: `git push` lub **Redeploy** w UI
3. Weryfikuj w **Logs** że build się powiedł
4. Test zmiennych: Odwiedź `https://ufinf.com` → Admin panel powinen być dostępny

---

## Troubleshooting

### Build fails: "Missing required environment variable"
- Sprawdź czy zmienna jest ustawiona dla **Production and Preview** (nie tylko Production)
- Weryfikuj dokładną nazwę zmiennej (case-sensitive!)

### Stripe webhook returns 401/403
- Sprawdzić czy `STRIPE_WEBHOOK_SECRET` jest poprawny
- Weryfikować że secret to `whsec_...` a nie secret API key
- Zrestartować deployment po zmianie webhook secret

### Admin login fails
- Weryfikować czy `ADMIN_PASSWORD` jest bcrypt hashed
- Sprawdzić czy `ADMIN_EMAIL` dokładnie matches (case-sensitive)
- Logowanie wymaga `ADMIN_SESSION_SECRET` - musi być ustawione

---

## Notatki bezpieczeństwa

✅ **Dobre praktyki:**
- Wszystkie secrety oznacz jako **Sensitive** w Vercel (będą maskowane w logs)
- Używaj **Test keys** z Stripe do desenvolvimento, **Live keys** do production
- Regularnie rotuj secrety (szczególnie `ADMIN_SESSION_SECRET`, `ADMIN_TOTP_SECRET`)
- Nikdy nie pushuj .env.local do Git

⚠️ **Nigdy:**
- Nie share'uj secret keys publicznie
- Nie umieszczaj secretów w kodzie (zawsze z env vars)
- Nie commituj .env lub .env.local

---

## Status deployment

- ✅ Vercel project created: `u-finf`
- ✅ Domena `ufinf.com` i `www.ufinf.com` added
- ✅ DNS configured (awaiting propagation)
- ⏳ Environment variables: w trakcie konfiguracji
- ⏳ Stripe webhook: czeka na production domain
- 📋 Next: complete env vars setup → test deployment

