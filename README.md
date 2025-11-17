criptotrade-mobile

## Mobile changes implemented

This README documents the mobile-side integrations and UX changes added to the Expo React Native app.

### Summary of features added

- Biometric authentication (FaceID / Fingerprint) support using `expo-local-authentication`.
- PIN fallback (set/verify) saved in `expo-secure-store` for devices without biometrics or when biometric fails.
- Haptic feedback for security actions using `expo-haptics` (toggle, save, verify results).
- `CoinPicker` component: modal searchable list of coins (used by Dashboard).
- `Sparkline` component: small SVG sparkline for crypto cards (robust handling of edge cases).
- `AuthContext` extended with biometric and PIN APIs and session restore helpers.

### Files changed / created (mobile)

- `contexts/AuthContext.tsx` — added:
  - Biometry detection (`biometryAvailable`), preference (`biometryEnabled`).
  - `enableBiometry(enabled)` to enable/disable with biometric confirmation.
  - `tryBiometricUnlock()` to attempt biometric unlock and restore stored user.
  - `setPin(pin)`, `verifyPin(pin)` and `hasPin` for PIN fallback stored in SecureStore.

- `app/security.tsx` — updated:
  - UI toggle to enable/disable biometrics.
  - "Testar" biometric button.
  - Modal to set/change a fallback PIN.
  - Modal to verify PIN (verify-only) to restore session.
  - Haptic feedback on actions.

- `components/Sparkline.tsx` — fixed rendering for empty arrays/single values and added proper SVG viewBox.
- `components/CoinPicker.tsx` — new modal component with search and selectable coins.
- `components/CryptoCard.tsx` — accepts optional `onPress` callback so parent can react (select coin).
- `app/(tabs)/index.tsx` — Dashboard: coin selector row and integration with `CoinPicker` to select coin.

### How biometric & PIN flows work

1. Normal login path (existing):
	- User logs in using `login()` (handled by `lib/authService.ts`), which stores the access token (`token`) in `SecureStore` and saves a `user` object in `SecureStore` where possible.

2. Enable biometric:
	- In `Configurações → Segurança`, toggle the Biometria switch.
	- The app calls `enableBiometry(true)` which triggers `LocalAuthentication.authenticateAsync` (system prompt). On success the preference `biometryEnabled` is stored in SecureStore.

3. Biometric unlock:
	- When the user taps "Testar" (Biometria) the app calls `tryBiometricUnlock()` which runs `LocalAuthentication.authenticateAsync` and, on success, attempts to restore the `user` from SecureStore into `AuthContext` so the app considers the user signed-in.
	- Note: For security, if the user had previously signed out (which deletes the token), biometric unlock will only restore the stored `user` object — to resume a valid authenticated session against the backend you should implement a refresh-token flow (see next steps).

4. PIN fallback:
	- You can define a PIN in `Configurações → Segurança → PIN de fallback`. The PIN is saved in `SecureStore` under key `biometryPin`.
	- If biometrics are not available or you want to test, use the "Testar" → PIN modal to enter the PIN and call `verifyPin(pin)`. If it matches, the stored `user` is restored into `AuthContext`.

### Haptics

- Small haptic feedbacks are added for:
  - Toggle success (selection)
  - Save/verify success or error (notification feedback)

### Installation (required native modules)

Run these in the project root:
```powershell
expo install expo-local-authentication
expo install expo-haptics
```

### Security notes and next steps

- PIN storage: currently the PIN is stored in `SecureStore` in plain form. For production, consider hashing the PIN or using the PIN only to encrypt a refresh token, or better — implement a server-issued `refreshToken` and store it securely and use it to obtain a fresh access token when biometric or PIN unlock occurs.
- Refresh-token flow: backend must support it (e.g., `POST /auth/refresh`). If available, I can update `lib/authService.ts` to save `refreshToken` and modify `AuthContext.tryBiometricUnlock()` to call refresh and set a new access token.

### How to test quickly

1. Start Expo:
```powershell
expo start
```
2. Install native modules listed above.
3. On a device or simulator, login once with your credentials so `user` and `token` are saved.
4. Open Configurações → Segurança and enable biometrics; test biometric and PIN flows.

---

If you want, I can now implement the refresh-token flow (server dependent) so biometric unlock securely refreshes the access token instead of relying on a stored `user`. Also can add more haptics or polish UI spacing for mobile one-hand use. Tell me which next step you prefer and I'll continue updating the README as I go.
