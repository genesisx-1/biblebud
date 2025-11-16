# Bible Bro - Complete Setup Guide

This guide will walk you through setting up Bible Bro from scratch. Follow each step carefully.

## 📋 Prerequisites

- A computer with Node.js installed (v16+)
- A Supabase account (free)
- An OpenAI account (requires payment setup)
- A code editor (VS Code, Cursor, etc.)

## 🚀 Step-by-Step Setup

### Step 1: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Click on your profile → "View API keys"
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)
6. **IMPORTANT**: Save this key somewhere safe - you won't see it again!

**Cost Note**: OpenAI charges per token. With GPT-3.5-turbo, expect:
- ~$0.002 per conversation
- $5 credit should handle ~2,500 conversations

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Bible Bro
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
5. Wait 2-3 minutes for project to be created

### Step 3: Set Up Supabase Database

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open the file `supabase/schema.sql` in your code editor
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

**What this does**: Creates all the tables, security policies, and sample data.

### Step 4: Get Supabase API Keys

1. In Supabase, go to **Settings** → **API** (left sidebar)
2. You'll see two important values:

   **Project URL**:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key** (under "Project API keys"):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Copy both of these - you'll need them in a moment

### Step 5: Install Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login
```

This will open a browser window to authorize the CLI.

### Step 6: Link Your Project

```bash
# In your biblebud directory
cd /path/to/biblebud

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

**Where to find project-ref**:
- In Supabase, go to Settings → General
- Look for "Reference ID" (it's a short code like `abcdefghijklm`)

### Step 7: Deploy Edge Function

```bash
# Set your OpenAI API key as a secret
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-key-here

# Deploy the chat function
supabase functions deploy chat-with-openai

# Verify it deployed
supabase functions list
```

You should see `chat-with-openai` in the list.

### Step 8: Create .env File

```bash
# In your biblebud directory
cp .env.example .env
```

Now edit `.env` with your actual values:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANT**:
- ✅ DO put the URL and anon key in `.env`
- ❌ DO NOT put your service role key in `.env`
- ❌ DO NOT put your OpenAI key in `.env`

### Step 9: Install Dependencies

```bash
npm install
```

This will take a few minutes to install all packages.

### Step 10: Start the App

```bash
npx expo start
```

You should see:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Step 11: Run on Your Device

**Option A: Physical Device (Recommended)**

1. Download "Expo Go" app:
   - iOS: App Store
   - Android: Google Play Store
2. Open Expo Go
3. Scan the QR code from the terminal
4. Wait for the app to load

**Option B: iOS Simulator (Mac only)**

1. Install Xcode from Mac App Store
2. Press `i` in the terminal
3. Wait for simulator to start

**Option C: Android Emulator**

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Press `a` in the terminal

## 🧪 Testing the App

1. **Create an account**:
   - Tap "Sign Up"
   - Enter name, email, password
   - Complete onboarding questions

2. **Test Bible Chat**:
   - Go to Chat tab
   - Type a question like "How do I find peace?"
   - Bible Bro should respond with verses

3. **Test Reading Plans**:
   - Go to Plans tab
   - Start "Gospel of John"
   - Check progress

4. **Test Quiz**:
   - Go to Quiz tab
   - Answer questions
   - See results screen

## 🔧 Troubleshooting

### "Network request failed"

**Cause**: Can't connect to Supabase

**Fix**:
1. Check your `.env` file has correct values
2. Make sure no extra spaces or quotes
3. Restart Expo: `npx expo start --clear`

### "OpenAI API error"

**Cause**: Edge function can't access OpenAI

**Fix**:
1. Check secret is set: `supabase secrets list`
2. Should see `OPENAI_API_KEY` in the list
3. If not, set it again: `supabase secrets set OPENAI_API_KEY=sk-...`
4. Redeploy function: `supabase functions deploy chat-with-openai`

### "Cannot find module"

**Cause**: Dependencies not installed properly

**Fix**:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Edge Function Logs

To see what's happening in your edge function:

```bash
supabase functions logs chat-with-openai --follow
```

This shows real-time logs when users chat.

### Database Issues

To check if tables exist:

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. You should see: profiles, conversations, messages, etc.
4. If not, re-run the schema.sql file

## 📊 Monitoring Usage

### Supabase Usage

1. Go to Supabase Dashboard
2. Click "Usage" in left sidebar
3. Monitor:
   - Database size
   - API requests
   - Edge function invocations

### OpenAI Usage

1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Monitor:
   - API requests
   - Tokens used
   - Costs

## 🎨 Customization

### Change App Name

Edit `app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change Colors

Edit `src/constants/colors.js`:

```javascript
primary: {
  royalBlue: '#YOUR_COLOR',
  warmGold: '#YOUR_COLOR',
}
```

### Change AI Personality

Edit `supabase/functions/chat-with-openai/index.ts`:

Find `SYSTEM_PROMPT` and modify the instructions.

After editing, redeploy:

```bash
supabase functions deploy chat-with-openai
```

## 📱 Building for Production

### iOS App Store

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Google Play Store

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

## 💰 Cost Breakdown

### Development (Free Tier)

- Supabase: $0/month (free tier)
- OpenAI: ~$5-10 for testing
- Expo: $0/month (free tier)

**Total**: ~$5-10 one-time setup

### Production (Estimated)

**For 100 active users/month**:

- Supabase: $0 (still within free tier)
- OpenAI: ~$20-40/month
  - Assuming 5 conversations/user/month
  - 500 total conversations × $0.04 = $20

**For 1,000 active users/month**:

- Supabase: $25/month (Pro plan recommended)
- OpenAI: ~$200-400/month
  - 5,000 conversations × $0.04 = $200

**For 10,000 active users/month**:

- Supabase: $25-100/month
- OpenAI: ~$2,000-4,000/month
  - Consider rate limiting or subscription model

## 🎯 Next Steps

Now that your app is running:

1. ✅ Test all features thoroughly
2. ✅ Customize colors and branding
3. ✅ Add your own content (verses, questions, etc.)
4. ✅ Create app icons and splash screens
5. ✅ Build and publish to app stores

## 📞 Support

If you get stuck:

1. Check the error message carefully
2. Search for the error in Google
3. Check Supabase logs
4. Check Edge Function logs
5. Create a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Screenshots

## ✅ Final Checklist

Before deploying to production:

- [ ] All environment variables set correctly
- [ ] Database schema deployed
- [ ] Edge function deployed and working
- [ ] Tested signup/login flow
- [ ] Tested all main features
- [ ] App icons created
- [ ] Splash screen created
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] App store listings prepared

---

**Congratulations!** You now have a fully functional Bible study app. May it bless many people! 🙏
