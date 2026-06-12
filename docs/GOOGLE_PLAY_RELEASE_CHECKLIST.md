# Google Play Release Checklist

## 1. Technical Build and Signing
- Confirm package id: `com.aigrowthos.mobile`.
- Use EAS production profile to build AAB:
  - `cd mobile_expo`
  - `npx eas login`
  - `npx eas build -p android --profile production`
- Configure Android upload keystore in EAS credentials:
  - `npx eas credentials -p android`
- Ensure release is signed with upload key (not debug key).

## 2. Environment and Endpoints
- Set production mobile env values in EAS:
  - `EXPO_PUBLIC_API_URL=https://api.usinf.com`
  - `EXPO_PUBLIC_WEB_URL=https://usinf.com`
  - `EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_GOOGLE_PLAY_URL=https://play.google.com/store/apps/details?id=com.aigrowthos.mobile`
- Validate mobile auth flow against production backend.
- Validate protected publish endpoint from mobile app.
- Keep Stripe test and production separated:
  - Test mode: staging URL + test key + test webhook secret
  - Live mode: production URL + live key + live webhook secret
- Make sure one-time packs stay below the Premium Plus monthly value.

## 3. Permissions and Security
- Keep only required Android permissions:
  - `INTERNET`
  - `VIBRATE`
- Remove unnecessary storage and overlay permissions.
- Verify no secrets are embedded in client bundle.

## 3.1 Supabase Google Auth Setup
- Supabase Dashboard:
  - Authentication -> Providers -> Google -> Enable
  - Add Google Client ID + Client Secret
  - Add Redirect URL: `aigrowthos://auth/callback`
- Google Cloud Console:
  - Configure OAuth consent screen
  - Create OAuth Web Client
  - Add Supabase callback URL as authorized redirect URI
- Test on device:
  - Open app -> Continue with Google
  - Confirm user email is shown after login
  - Close and reopen app -> session still active

## 4. Store Listing Assets
- App name and short description.
- Full description with feature/value proposition.
- 512x512 app icon.
- Feature graphic (1024x500).
- Minimum 2 phone screenshots (recommended 6+).
- Support URL and contact email.

## 5. Play Console Policy Compliance
- Privacy policy URL (publicly reachable, HTTPS).
- Data safety form completed (data collected, shared, encrypted in transit).
- Content rating questionnaire completed.
- App access instructions (if auth-gated).
- Ads declaration (if ads SDK present).
- Target API level and Play integrity requirements satisfied.

## 6. Release Process
- Play Console click path:
  - Testing -> Internal testing -> Create new release -> Upload AAB -> Review release -> Start rollout
- Upload AAB to Internal testing first.
- Add test users and verify onboarding/auth/publish flow.
- Check crash-free startup and network error handling.
- Promote to Closed testing, then Production.

## 7. Go/No-Go Gate
- No critical crashes in internal testing.
- Auth, publish workflow, and API fallback errors verified.
- Stripe/subscription flows tested on web and mobile entry points.
- Hybrid AI routing confirmed with selected provider keys.