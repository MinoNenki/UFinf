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

## Production env (mobile)

Skopiuj `.env.example` do `.env` i ustaw:

- `EXPO_PUBLIC_API_URL` - URL backendu produkcyjnego
- `EXPO_PUBLIC_WEB_URL` - URL web appki
- `EXPO_PUBLIC_GOOGLE_PLAY_URL` - URL listingu Play
- `EXPO_PUBLIC_APP_STORE_URL` - URL listingu App Store

## EAS build (AAB pod Google Play)

```bash
cd mobile_expo
npx eas login
npx eas credentials -p android
npx eas build -p android --profile production
```

Wynik produkcyjny to AAB (`app-bundle`) gotowy do uploadu w Play Console.
