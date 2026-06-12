# UFInf — Google Play Release Instrukcja

## Cel
Wgrać aplikację mobilną Expo na Google Play Store pod nazwą **"UFInf - Ultra Future Influencer"**.

## Wymagania wstępne
- Google Play Console account (lub nowe konto)
- Konto EAS (Expo Application Services) z uprawnień
- Wygenerowany AAB (Android App Bundle) z EAS Build
- Cena: $25 (rejestracja dewelopera Google Play, jednorazowo)

---

## KROK 1: Przygotowanie na lokalnej maszynie

### 1.1 Login EAS i konfiguracja
```bash
cd ai_growth_os/mobile_expo
eas login
# Wpisz email i hasło konta EAS
```

### 1.2 Sprawdzenie konfiguracji app.json
```bash
cat app.json
```

**Oczekiwane wartości:**
```json
{
  "expo": {
    "name": "UFInf - Ultra Future Influencer",
    "slug": "ufinfluencer-mobile",
    "scheme": "ufinfluencer",
    "ios": {
      "bundleIdentifier": "com.ufinfluencer.mobile"
    },
    "android": {
      "package": "com.ufinfluencer.mobile"
    }
  }
}
```

---

## KROK 2: Build AAB na EAS

```bash
cd ai_growth_os/mobile_expo
eas build --platform android --type app-bundle
```

**Opcje:**
- `--profile production` — jeśli chcesz production config
- `--wait` — czekaj na zakończenie (może trwać 10-15 minut)

**Wynik:**
- Link do pobranego AAB pliku (`.aab`)
- Zapisz sobie ten URL

---

## KROK 3: Wygenerowanie keystore i podpisania (jeśli pierwszy raz)

Jeśli to pierwszy build:

```bash
eas credentials
# Wybierz: Android
# Wybierz: Keystore
# Wybierz: Generate new keystore
# Zgódź się na upload do EAS
```

Keystore będzie użyty automatycznie do podpisania AAB.

---

## KROK 4: Rejestracja w Google Play Console

### 4.1 Wejdź na https://play.google.com/console

### 4.2 Utwórz nową aplikację
1. **"Create app"** → Nowa aplikacja
2. **App name**: `UFInf - Ultra Future Influencer`
3. **Default language**: English (US)
4. **App category**: Productivity
5. **App type**: Mobile app
6. Zgódź się z polityką Developer Program Policies
7. Kliknij **"Create app"**

### 4.3 Uzupełnij szczegóły aplikacji
- **Short description**: "AI Content Engine for Creators"
- **Full description**: 
  ```
  UFInf — Ultra Future Influencer is your AI-powered content engine.
  Publish across TikTok, YouTube, Instagram, Facebook, and X with one click.
  
  Features:
  - One Click Publish: Create platform-optimized content from one asset
  - AI Trend Radar: Real-time trend signals and topic suggestions
  - AI Growth Coach: Daily action plan tailored to your niche
  - Smart Inbox: Unified comments from all platforms
  - Revenue AI: Monetization potential scoring
  
  Start for free. Scale your creator business without limits.
  ```
- **Screenshots** (min. 2, max. 8): Dodaj screenshoty z phone mockupów
- **Icon**: 512x512 PNG
- **Feature graphic**: 1024x500 PNG
- **Privacy policy URL**: Jeśli trzeba, utwórz prostą stronę
- **Content rating questionnaire**: Wypełnij
- **Target audience**: Adults (18+)

---

## KROK 5: Wgranie AAB i Launch Setup

### 5.1 Przejdź do sekcji "Release" w Play Console

### 5.2 Wgranie AAB
1. **Left menu** → "Release" → "Production"
2. **"Create new release"**
3. **"Upload AAB"** → Załaduj plik `.aab` z kroku 2
4. Verifikacja automatyczna (1-2 minuty)

### 5.3 Uzupełnij release notes
```
Version 1.0.0 - Launch

Initial release of UFInf - Ultra Future Influencer.

Features:
- One Click Publish across 5 platforms
- AI Content Brain with trend analysis
- Smart Growth Coaching
- Real-time analytics
- Multi-language support (PL, EN, ES)

Available now on Google Play.
```

### 5.4 Ustaw kraj/region dostępności
- **Available in these countries**: Select All (lub tylko EU + US na start)
- **Rating**: Ustaw wiek (4+, 12+, 16+, 18+) — zazwyczaj 4+

---

## KROK 6: Finalne informacje o aplikacji

### 6.1 App signing
- **Google Play app signing**: Zgódź się (automatycznie)
- Google podpisze AAB production keystore

### 6.2 Testing
- Utwórz internal testing track i zaproś testów
- **Left menu** → "Testing" → "Internal testing"
- Dodaj google account do testowania

---

## KROK 7: Submit do Review

### 7.1 Sprawdź compliance checklist
- ✅ Icony i grafiki (512x512, 1024x500)
- ✅ Opis aplikacji (min. 80 znaków)
- ✅ Privacy policy (jeśli zbierasz data)
- ✅ Content rating (wypełniona)
- ✅ Target audience

### 7.2 Kliknij "Review" i "Submit"

**Czas review**: 2-24 godziny (zwykle 2-4h)

---

## KROK 8: Monitoring status

### Po submicie:
1. **Left menu** → "Release" → "Production"
2. Refresh co 1 godzinę
3. Status będzie: **"Pending review"** → **"In review"** → **"Approved"** / **"Rejected"**

---

## Jeśli aplikacja zostanie zatwierdzona

✅ Aplikacja pojawi się w Google Play Store pod:
```
https://play.google.com/store/apps/details?id=com.ufinfluencer.mobile
```

Linki do udostępnienia:
- **Google Play**: `https://play.google.com/store/apps/details?id=com.ufinfluencer.mobile`
- **Direct install**: Użytkownicy mogą pobrać prosto z Play Store

---

## Troubleshooting

### "Build failed" na EAS
```bash
eas build-cancel  # anuluj
eas build --platform android --type app-bundle --wait
```

### "Upload failed" w Play Console
- Sprawdź czy AAB jest poprawny: `unzip -t app.aab` (powinien być ZIP)
- Spróbuj ponownie

### "Pending review" zajęło >24h
- Kliknij na release i sprawdź policy violations
- Jeśli jest problem, Play Console pokaże wiadomość

### App Store Optimization (ASO)
- **App title**: "UFInf - Ultra Future Influencer" (max 50 chars)
- **Short description**: "AI Content Engine for Creators" (max 80 chars)
- **Keywords**: "creator economy, ai, content, automation, tiktok, youtube" (max 100 chars)

---

## Następne kroki (po zatwierdzeniu)

1. **Marketing**: Udostępnij link do Play Store
2. **Updates**: Każda nowa wersja trzeba submisować ponownie (powtórz kroki 2-7)
3. **Monitoring**: Obserwaj reviews w Play Console

---

## Przydatne linki

- [EAS Build Documentation](https://docs.expo.dev/build/setup/)
- [Google Play Console](https://play.google.com/console)
- [App signing na Play](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Content policies](https://play.google.com/about/developer-content-policy/)

---

**Czas całego procesu**: ~30 minut (+ 2-4 godziny review)
**Koszt**: $25 (rejestracja) + EAS Build (darmowe dla Expo Free tier)
