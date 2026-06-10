# Anti-loss / API Security

Zasada: użytkownik nie może spalić Twoich kluczy API ani budżetu.

## Warstwy ochrony
1. Klucze API tylko po stronie server/API routes.
2. Frontend nigdy nie dostaje `OPENAI_API_KEY`.
3. Każdy request idzie przez `budgetGuard()`.
4. Każdy plan ma limit kosztu jednego requestu.
5. Każdy plan ma dzienny limit generacji.
6. Tryb demo działa bez prawdziwego AI.
7. Produkcyjnie dodać tabelę `usage_events` i blokadę po przekroczeniu limitu.

## Proponowane ceny
- Free: 0$, 3 generacje/dzień, tylko demo lub tanie modele.
- Pro: 29$, 40 generacji/dzień.
- Premium Plus: 79$, 120 generacji/dzień + One Click Publish.

## Kolejne zabezpieczenia do dodania
- Rate limit IP.
- Rate limit user_id.
- Captcha przy Free.
- Stripe required dla funkcji ciężkich.
- Hard global kill switch w admin panelu.
- Queue dla zadań wideo, żeby nie odpalać wielu drogich requestów naraz.

## Aktualny hardening (wdrożone)
1. Admin auth przez podpisana sesje cookie (HMAC SHA-256).
2. Ochrona endpointow admin (`/api/settings`) - wymagany zalogowany admin.
3. Walidacja `.env.local` przy starcie + wymagania produkcyjne dla sekretow.
4. One Click Publish dziala przez kolejke z retry per platforma.
5. AI Content Brain v2 zapisuje metryki i zwraca ranking tematow/godzin.
6. Admin login ma 2FA TOTP + rate limiting + audit log.
7. Settings API ma RBAC (`settings:read`, `settings:write`) + rate limiting + audit log.
8. Publish queue ma idempotency key i dead-letter queue po max retry.

## Zmienne krytyczne
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ADMIN_SESSION_SECRET (>=32 znaki w produkcji)
- ADMIN_ROLE
- ADMIN_TOTP_SECRET (base32)
- TIKTOK_ACCESS_TOKEN / TIKTOK_OPEN_ID
- YOUTUBE_ACCESS_TOKEN / YOUTUBE_CHANNEL_ID
- INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID
- FACEBOOK_ACCESS_TOKEN / FACEBOOK_PAGE_ID
- X_BEARER_TOKEN
