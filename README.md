# Bible Bro 📖✨

> Your AI-powered Christian Bible study companion

Bible Bro is a React Native mobile app that provides personalized scripture guidance, interactive AI chat support based on biblical values, and customized reading plans. Built with Expo, Supabase, and OpenAI.

## Features

- 🤖 **AI Bible Chat** - Interactive conversations with Bible Bro, your faith companion
- 📚 **Reading Plans** - Personalized Bible reading plans with progress tracking
- 🏆 **Bible Quiz** - Duolingo-style quiz game to test your knowledge
- 🔥 **Streak Tracking** - Daily engagement tracking with gamification
- 🎯 **Daily Verses** - Inspirational verses delivered each day
- 🔊 **Text-to-Speech** - Listen to verses and chat responses
- 🎨 **Beautiful UI** - Inspired by Duolingo with smooth animations

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: OpenAI GPT-3.5-turbo
- **State Management**: React Hooks
- **Navigation**: React Navigation
- **Animations**: React Native Reanimated
- **Styling**: StyleSheet (inspired by Duolingo)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- A Supabase account (free tier works)
- An OpenAI API key

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd biblebud
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Deploy Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set your OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-openai-key

# Deploy the function
supabase functions deploy chat-with-openai
```

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the App

```bash
# Start Expo development server
npx expo start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

## Project Structure

```
biblebud/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   ├── ProgressCircle.js
│   │   ├── StreakCounter.js
│   │   └── LoadingSpinner.js
│   ├── screens/               # App screens
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ChatScreen.js
│   │   ├── ReadingPlansScreen.js
│   │   ├── QuizScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/            # Navigation setup
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   ├── services/              # API services
│   │   ├── supabase.js       # Supabase client & helpers
│   │   └── tts.js            # Text-to-speech
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.js
│   ├── utils/                 # Utility functions
│   │   └── dateUtils.js
│   └── constants/             # Theme & constants
│       ├── colors.js
│       ├── typography.js
│       ├── theme.js
│       └── animations.js
├── supabase/
│   ├── schema.sql            # Database schema
│   └── functions/
│       └── chat-with-openai/ # Edge function for AI chat
└── assets/                    # Images, fonts, etc.
```

## Environment Variables Explained

### Client App (.env)

These are safe to use in the client app:

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe for client)

### Supabase Edge Function (set via Supabase CLI)

These should NEVER be in your client .env:

- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase
- `OPENAI_API_KEY` - Your OpenAI API key (set via `supabase secrets set`)

## Database Schema

The app uses the following main tables:

- `profiles` - User profiles and preferences
- `conversations` - Chat conversations with Bible Bro
- `messages` - Individual chat messages
- `reading_plans` - User's reading plans
- `daily_progress` - Daily activity tracking
- `daily_verses` - Daily verse content
- `achievements` - User achievements/badges
- `quiz_questions` - Bible quiz questions
- `quiz_results` - User quiz scores

All tables have Row Level Security (RLS) enabled for data protection.

## Key Features Explained

### 1. Bible Chat

The chat feature uses OpenAI's GPT-3.5-turbo model with a carefully crafted system prompt that:

- Provides biblical guidance and scripture references
- Maintains a warm, encouraging tone
- Ensures responses are concise and practical
- Never provides medical/legal advice
- Respects denominational differences

### 2. Reading Plans

Pre-built reading plans include:

- Gospel of John (10 days)
- Overcoming Anxiety (7 days)
- Proverbs Wisdom (14 days)
- New Believer Basics (21 days)

Users can track progress with visual progress circles.

### 3. Bible Quiz

Duolingo-style quiz with:

- Multiple choice questions
- Instant feedback with scripture references
- Celebration animations for correct answers
- Score tracking and results screen

### 4. Gamification

- Daily streak counter
- Progress tracking (reading, chat, quiz)
- Achievement badges
- Visual progress indicators

## Customization

### Changing Colors

Edit `src/constants/colors.js`:

```javascript
export const colors = {
  primary: {
    royalBlue: '#2E4A8C',  // Main brand color
    warmGold: '#D4A574',   // Accent color
    // ...
  },
};
```

### Adding New Reading Plans

Add to `PLAN_TEMPLATES` in `src/screens/ReadingPlansScreen.js`:

```javascript
{
  id: 5,
  title: 'Your Plan Name',
  description: 'Description here',
  total_days: 30,
  icon: 'book',
  color: theme.colors.primary.royalBlue,
}
```

### Customizing AI Behavior

Edit the `SYSTEM_PROMPT` in `supabase/functions/chat-with-openai/index.ts` to change how Bible Bro responds.

## Building for Production

### iOS

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

## Cost Optimization

### OpenAI API

- Using GPT-3.5-turbo (10x cheaper than GPT-4)
- Max tokens limited to 500 per response
- Conversation history limited to last 10 messages
- Estimated cost: ~$0.002 per conversation

### Supabase

- Free tier includes:
  - 500MB database
  - 1GB file storage
  - 2GB bandwidth
  - 50,000 monthly active users
  - 500,000 Edge Function invocations

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
npx expo start --clear
```

### Supabase connection issues

1. Check your `.env` file has correct values
2. Verify Supabase project is active
3. Check RLS policies are enabled

### OpenAI API errors

1. Verify API key is set in Supabase: `supabase secrets list`
2. Check your OpenAI account has credits
3. Review function logs: `supabase functions logs chat-with-openai`

## Contributing

This project is a complete MVP. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning or building your own Bible app!

## Support

For issues or questions:

- Check existing GitHub issues
- Create a new issue with details
- Include error logs and screenshots

## Acknowledgments

- UI Design inspired by Duolingo
- Bible translations from public domain sources
- Icons by Ionicons
- Built with Expo and React Native

---

**Built with ❤️ for the Christian community**

May this app help believers grow in their faith and deepen their understanding of God's Word.
