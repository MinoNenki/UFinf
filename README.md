# AI Growth OS — MVP localhost

Gotowy projekt Next.js do odpalenia w VS Code. To jest nowa wersja produktu dla influencerów i twórców: TikTok, YouTube Shorts, Instagram Reels, Facebook i X.

## Jak uruchomić

W root workspace (`ai-growth-os-mvp`) mozesz uruchomic web jednym poleceniem:

```bash
npm run dev
```

To uruchamia projekt z folderu `ai_growth_os` przez `--prefix`.

Alternatywnie bezposrednio w projekcie web:

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Otwórz: http://localhost:3000

## Co jest gotowe

- Profesjonalna strona główna / szata graficzna.
- Demo AI Content Factory.
- Backend API routes:
  - `POST /api/generate`
  - `POST /api/budget-check`
- Anti-loss / API budget guard:
  - limit kosztu jednego requestu,
  - osobne limity planów Free / Pro / Premium Plus,
  - dzienny globalny limit budżetu AI,
  - dzienne limity generacji per plan,
  - tryb safe demo mode bez spalania kluczy API,
  - trwały zapis ustawień i API keys w backendzie (`/api/settings`).
- Funkcje Premium Plus:
  - One Click Publish (feature flag),
  - AI Content Brain (feature flag).
- Walidacja konfiguracji przy starcie:
  - kontrola `.env.local`,
  - walidacja kluczowych limitów liczbowych.
- Model cenowy pod kontrolę kosztów.
- Struktura gotowa do podłączenia OpenAI, Supabase, Stripe i OAuth platform.

## Ważne

Ten MVP dziala bez kluczy API, zeby nie spalac budzetu podczas testow. Dopiero po ustawieniu platnosci, limitow i logowania nalezy podlaczyc prawdziwe API.

## API backend

- `POST /api/generate` - generowanie pakietu tresci z aktywnym anti-loss.
- `POST /api/budget-check` - podglad kosztu requestu i statusu limitow.
- `GET /api/settings` - odczyt ustawien (tylko admin).
- `PATCH /api/settings` - zapis ustawien anti-loss oraz kluczy API (tylko admin).
- `POST /api/publish/start` - One Click Publish (kolejka + retry per platforma).
- `POST /api/publish/start` - One Click Publish (realne konektory API + idempotency key + kolejka/retry).
- `POST /api/publish/worker` - worker retry dla jobow publish.
- `GET /api/publish/jobs` - lista ostatnich jobow.
- `GET /api/publish/jobs/:jobId` - status konkretnego joba.
- `POST /api/publish/jobs/:jobId?force=1` - wymuszone przetworzenie retry (manual ops).
- `POST /api/content-brain/ingest` - ingest realnych metryk do AI Content Brain v2.
- `GET /api/content-brain/insights` - ranking tematow/godzin i rekomendacje.
- `POST /api/admin/login` / `POST /api/admin/logout` / `GET /api/admin/session` - sesja admin (RBAC + 2FA TOTP).

## Security hardening

- Admin login wymaga: email + haslo + kod TOTP (2FA).
- Sesja admin zawiera role RBAC (`super_admin`, `ops_admin`, `security_admin`, `analyst`).
- `settings` ma permission check (`settings:read`, `settings:write`) + rate limiting.
- Admin login i settings zapisują audit log do `.runtime/security-audit.jsonl`.
- Publish queue wspiera idempotency i dead-letter queue (`.runtime/publish-queue.json`).

Uwaga: klucze API sa trzymane po stronie serwera i nigdy nie sa zwracane w GET.

## Co z Twoim ZIP-em

W dostarczonym ZIP-ie były przydatne pliki `app/*` i SQL z poprzedniego SaaS, ale brakowało plików startowych projektu (`package.json`, `tsconfig.json`, `next.config`). Dlatego najbezpieczniej było stworzyć czysty projekt i wykorzystać koncepcję układu: dashboard, pricing, admin, integracje, limity i Supabase jako kierunek rozwoju.

## Mobile i web landing

- Root workspace ma skrypty do uruchamiania Android, iOS i Expo web przez `npm run dev:mobile`, `npm run android`, `npm run ios` i `npm run web:mobile`.
- Landing page ma teraz sekcje prezentacji platformy oraz pobierania aplikacji ze sklepow.
