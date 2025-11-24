# App Store Assets Requirements for Bible Bro

## Required Assets for iOS App Store

### 1. App Icon (REQUIRED)
**File:** `./assets/icon.png`
**Size:** 1024 x 1024 pixels
**Format:** PNG
**Requirements:**
- ✅ No transparency (must have solid background)
- ✅ No rounded corners (Apple adds them automatically)
- ✅ No text or UI elements (just the icon/logo)
- ✅ High quality, sharp edges
- ✅ Square format

**Current Status:** Check if your `icon.png` is exactly 1024x1024px

### 2. App Store Screenshots (REQUIRED)
You need screenshots for at least ONE device size. Apple will scale them if needed, but it's better to provide specific sizes.

#### Minimum Required (iPhone 6.7" - iPhone 14 Pro Max)
- **Size:** 1290 x 2796 pixels
- **Format:** PNG or JPEG
- **Quantity:** At least 1, up to 10 screenshots
- **Content:** Show your app's main features

#### Recommended Sizes (Provide for better quality):
1. **iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)**
   - 1290 x 2796 pixels
   - Portrait orientation

2. **iPhone 6.5" (iPhone 11 Pro Max, XS Max)**
   - 1242 x 2688 pixels
   - Portrait orientation

3. **iPhone 5.5" (iPhone 8 Plus, 7 Plus, 6s Plus)**
   - 1242 x 2208 pixels
   - Portrait orientation

#### Screenshot Content Suggestions:
1. **Home Screen** - Show daily verse and greeting
2. **Bible Chat** - Show conversation with Bible Bro
3. **Bible Reader** - Show reading interface
4. **Quiz Screen** - Show quiz with questions
5. **Reading Plans** - Show available plans
6. **Profile** - Show user profile and achievements

### 3. App Preview Video (OPTIONAL but Recommended)
- **Size:** Same as screenshots (1290 x 2796 for 6.7")
- **Format:** MOV or MP4
- **Duration:** 15-30 seconds
- **Content:** Show app in action

## How to Create Screenshots

### Option 1: Using iOS Simulator
1. Open your app in iOS Simulator
2. Navigate to the screen you want to capture
3. Use `Cmd + S` to save screenshot
4. Or use `xcrun simctl io booted screenshot screenshot.png`
5. Resize to required dimensions using image editor

### Option 2: Using Real Device
1. Take screenshots on iPhone (Power + Volume Up)
2. Transfer to computer
3. Resize to required dimensions

### Option 3: Using Design Tools
- Use Figma, Sketch, or Photoshop
- Create mockups at exact dimensions
- Export as PNG

## Quick Checklist

### Before Submission:
- [ ] App icon is 1024x1024px PNG (no transparency)
- [ ] At least 1 screenshot at 1290x2796px (6.7" iPhone)
- [ ] Screenshots show key features
- [ ] All images are high quality
- [ ] No placeholder text in screenshots
- [ ] Screenshots match current app version

## File Structure
```
assets/
├── icon.png              (1024x1024 - App Store icon)
├── splash-icon.png       (Already configured)
├── adaptive-icon.png     (Android)
└── favicon.png           (Web)

screenshots/              (Create this folder)
├── iphone-6.7-home.png
├── iphone-6.7-chat.png
├── iphone-6.7-quiz.png
└── ...
```

## App Store Connect Upload
1. Go to App Store Connect
2. Select your app
3. Go to "App Store" tab
4. Scroll to "App Screenshots"
5. Upload screenshots for each device size
6. Upload app icon (1024x1024)

## Tips
- **Show real content** - Don't use placeholder text
- **Highlight features** - Show what makes your app unique
- **Keep it clean** - Remove any debug info or test data
- **Use consistent style** - All screenshots should look cohesive
- **Show the value** - First screenshot should be your best feature

## Current Configuration
Your `app.json` is already configured correctly:
- Icon path: `./assets/icon.png` ✅
- Splash screen: `./assets/splash-icon.png` ✅

Just make sure `icon.png` is exactly 1024x1024px!

