# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Credentials & IDs

| Klucz | Wartość |
|-------|---------|
| Bundle ID | `org.reactjs.native.example.KSport` |
| Team ID | `4QMCDMNCWW` |
| Apple ID | `eveo.tomek@gmail.com` |
| App-Specific Password | `rpmo-qlyq-mobs-lzhn` |
| iPhone 17 Pro Max UDID | `B1B7CFDD-9E35-4FF7-80F1-BC97C525B62D` |
| GitHub | `https://github.com/clone147/ksport` |

## Project Overview

KSport - React Native WebView wrapper for k-sport.com.pl e-commerce. Bottom tab navigation (Home, Search, Cart, Profile) with WebView content.

## iOS Simulator

**WAŻNE:** Uruchamiaj TYLKO JEDEN symulator. Przed uruchomieniem zabij istniejące procesy metro.
```bash
# Zabij istniejące metro bundler
pkill -f "react-native.*start" 2>/dev/null || true

# Uruchom symulator (TYLKO iPhone 17 Pro Max)
npx react-native run-ios --simulator="iPhone 17 Pro Max"
```

## Testowanie (ios-simulator-skill)

```bash
# Screenshot + stan aplikacji
python /Users/tomek/.claude/skills/ios-simulator-skill/scripts/app_state_capture.py --udid B1B7CFDD-9E35-4FF7-80F1-BC97C525B62D --app-bundle-id org.reactjs.native.example.KSport --output /tmp/app_state

# Mapowanie ekranu
python /Users/tomek/.claude/skills/ios-simulator-skill/scripts/screen_mapper.py --udid B1B7CFDD-9E35-4FF7-80F1-BC97C525B62D --verbose

# Klik po tekście
python /Users/tomek/.claude/skills/ios-simulator-skill/scripts/navigator.py --udid B1B7CFDD-9E35-4FF7-80F1-BC97C525B62D --find-text "TEKST" --tap

# Swipe
python /Users/tomek/.claude/skills/ios-simulator-skill/scripts/gesture.py --udid B1B7CFDD-9E35-4FF7-80F1-BC97C525B62D --swipe up

# Logi błędów
python /Users/tomek/.claude/skills/ios-simulator-skill/scripts/log_monitor.py --udid B1B7CFDD-9E35-4FF7-80F1-BC97C525B62D --app org.reactjs.native.example.KSport --severity error --duration 30s
```

## iOS Build & TestFlight

```bash
cd ios && \
xcodebuild -workspace KSport.xcworkspace -scheme KSport -configuration Release -archivePath ./build/KSport.xcarchive archive && \
xcodebuild -exportArchive -archivePath ./build/KSport.xcarchive -exportPath ./build/ipa -exportOptionsPlist ExportOptions.plist && \
xcrun altool --upload-app --type ios --file ./build/ipa/KSport.ipa --username eveo.tomek@gmail.com --password rpmo-qlyq-mobs-lzhn
```

**AFTER BUILD:** `git add . && git commit -m "Build X - opis" && git push origin main`

## Architecture

- **App.tsx** - Root: auth state, user credentials (AsyncStorage), session tokens
- **components/TabNavigator.tsx** - Bottom tabs (Home, Search, Cart, Profile), WebView refs, cart badge
- **components/UnifiedWebViewScreen.tsx** - WebView wrapping k-sport.com.pl with JS bridge
- **components/Authentication.tsx** - Login/registration
- **components/ProfileScreen.tsx** - User profile, logout/delete
- **components/CollapsibleHeader.tsx** - Animated header with search

## Key Patterns

- Web content: `https://www.k-sport.com.pl` with `?webview=1` parameter
- WebView ↔ RN: `window.ReactNativeWebView.postMessage()` for cart/login
- Credentials: AsyncStorage key `loginCredentials`
- Profile tab requires auth (redirects to login if not authenticated)
