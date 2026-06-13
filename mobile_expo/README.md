# AI Growth OS Mobile (Expo)

Gotowy ekran mobile-first pod Android/iOS (Expo) z flow:
- One Click Publish (Premium Plus)
- AI Content Brain
- Growth Coach insight

## Start

```bash
cd mobile_expo
npm install
npm run start
```

## Uruchamianie

- Android: `npm run android`
- iOS: `npm run ios`

Wymagania:
- Node.js 20+
- Expo CLI (instalowane lokalnie przez npm scripts)
- Android Studio / Xcode (dla run:android / run:ios)

Opcjonalnie ustaw publiczne linki przed wydaniem:
- `EXPO_PUBLIC_APP_STORE_URL`
- `EXPO_PUBLIC_GOOGLE_PLAY_URL`
- `EXPO_PUBLIC_WEB_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Production env (mobile)

Skopiuj `.env.example` do `.env` i ustaw:

- `EXPO_PUBLIC_API_URL` - URL backendu produkcyjnego
- `EXPO_PUBLIC_WEB_URL` - URL web appki
- `EXPO_PUBLIC_SUPABASE_URL` - URL projektu Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - publiczny anon key Supabase
- `EXPO_PUBLIC_GOOGLE_PLAY_URL` - URL listingu Play
- `EXPO_PUBLIC_APP_STORE_URL` - URL listingu App Store

## Etap A: Upload AAB do Google Play (klik po kliku)

1. Wejdz do Google Play Console i utworz aplikacje:
	- All apps -> Create app
	- App name: AI Growth OS
	- Default language: English (United States)
	- App or game: App
	- Free or paid: Free (lub Paid, jesli chcesz)

2. Uzupelnij podstawy listingu:
	- Main store listing -> App details
	- Dodaj short description i full description
	- Dodaj ikone 512x512 i feature graphic 1024x500
	- Dodaj minimum 2 screenshoty telefonu

3. Uzupelnij polityki:
	- App content -> Privacy Policy (publiczny URL HTTPS)
	- App content -> Data safety
	- App content -> Content rating

4. Zbuduj AAB produkcyjne przez EAS:
	- `cd mobile_expo`
	- `npm install`
	- `npx eas login`
	- `npx eas credentials -p android`
	- `npx eas build -p android --profile production`

5. Wrzuc AAB na testy wewnetrzne:
	- Play Console -> Testing -> Internal testing
	- Create new release -> Upload AAB
	- Save -> Review release -> Start rollout to internal testing

6. Dodaj testerow:
	- Testing -> Internal testing -> Testers
	- Dodaj swoj email i emaile testowe
	- Otworz link opt-in i zainstaluj appke z Play

## Etap B: Google login przez Supabase (kod juz dodany)

### 1) Supabase Dashboard

1. Authentication -> Providers -> Google -> Enable.
2. Wklej Client ID i Client Secret z Google Cloud OAuth.
3. Authentication -> URL Configuration -> Redirect URLs:
	- `ufinfluencer://auth/callback`
4. Authentication -> Settings -> Site URL:
	- `https://ufinf.com`

### 2) Google Cloud Console

1. APIs & Services -> OAuth consent screen:
	- External
	- Uzupelnij App name, support email, developer email
2. APIs & Services -> Credentials -> Create OAuth client ID:
	- Application type: Web application
	- Authorized redirect URI:
	  - URL z Supabase: Authentication -> Providers -> Google (callback URL)

### 3) Mobile env i EAS

1. Ustaw w `mobile_expo/.env`:
	- `EXPO_PUBLIC_SUPABASE_URL`
	- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Ustaw te same wartosci w `mobile_expo/eas.json` w profilu production.
3. Przebuduj appke `npx eas build -p android --profile production`.

### 4) Test akceptacyjny

1. Otworz appke mobilna.
2. Kliknij `Continue with Google`.
3. Po wyborze konta powinno pokazac `Signed in as: ...`.
4. Sesja ma zostac po restarcie appki.

## EAS build (AAB pod Google Play)

```bash
cd mobile_expo
npx eas login
npx eas credentials -p android
npx eas build -p android --profile production
```

Wynik produkcyjny to AAB (`app-bundle`) gotowy do uploadu w Play Console.
