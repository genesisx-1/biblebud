# iOS Deployment Guide for Bible Bro

## Pre-Deployment Checklist

### ✅ Completed
- [x] All packages are compatible with Expo SDK 54
- [x] TTS functionality works on both ChatScreen and HomeScreen
- [x] Male voice configured for text-to-speech
- [x] App.json configured with proper iOS settings
- [x] Bundle identifier set: `com.biblebro.app`
- [x] iOS permissions configured (Microphone, Speech Recognition)
- [x] EAS build configuration created

## Required Steps Before Deployment

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo Account
```bash
eas login
```

### 3. Configure Your App
Update `eas.json` with your details:
- Apple ID
- App Store Connect App ID
- Apple Team ID

### 4. Environment Variables
Make sure your `.env` file has:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Build for iOS

**For Testing (Simulator Build):**
```bash
eas build --platform ios --profile development
```

**For TestFlight (Internal Testing):**
```bash
eas build --platform ios --profile preview
```

**For App Store (Production):**
```bash
eas build --platform ios --profile production
```

### 6. Submit to App Store
```bash
eas submit --platform ios
```

## iOS Requirements

### Apple Developer Account
- Must have an active Apple Developer account ($99/year)
- Bundle ID: `com.biblebro.app`

### App Store Connect Setup
1. Create app in App Store Connect
2. Add app icons (1024x1024)
3. Add screenshots (required sizes for iPhone)
4. Fill in app description and metadata
5. Set age rating
6. Add privacy policy URL

### Assets Needed
- App icon: 1024x1024px (already at `./assets/icon.png`)
- Splash screen: (already at `./assets/splash-icon.png`)
- Screenshots for:
  - 6.7" iPhone (1290 x 2796)
  - 6.5" iPhone (1242 x 2688)
  - 5.5" iPhone (1242 x 2208)

## Testing Before Submission

### 1. Test on Real Device
```bash
npm run ios
# Or use TestFlight after preview build
```

### 2. Test All Features
- [ ] User registration/login
- [ ] Bible reading with TTS (male voice)
- [ ] Chat with Bible Bro
- [ ] Quiz functionality with animations
- [ ] Reading plans
- [ ] Profile settings
- [ ] Verse of the day with TTS

### 3. Performance Check
- [ ] App starts quickly
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] TTS works reliably

## Common Issues

### Build Errors
- **Missing credentials**: Run `eas credentials` to configure
- **Bundle ID conflicts**: Make sure it's unique in App Store Connect
- **Permission errors**: Check `app.json` iOS permissions

### Submission Errors
- **Missing privacy policy**: Add URL to App Store Connect
- **Age rating**: Set appropriate rating
- **Export compliance**: Set `usesNonExemptEncryption: false` (already done)

## Post-Deployment

### Monitor
- App Store Connect → Analytics
- TestFlight feedback
- Crash reports

### Updates
To push updates:
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## Current Package Versions (All Compatible)
- Expo SDK: ~54.0.25
- React: 19.1.0
- React Native: 0.81.5
- React Navigation: ^7.x (latest)
- Supabase: ^2.81.1

All packages are up-to-date and compatible with iOS deployment.

