# Deploy Updated Edge Function

The AI chat has been updated to be more natural and friendly! Here's what changed:

## Changes Made

### 1. **Shorter, More Natural Responses**
- AI now keeps responses to 1-2 short paragraphs (3-4 sentences each)
- Uses casual, conversational language like talking to a friend
- Less formal/religious tone

### 2. **Personalized with User's Name**
- AI addresses users by their first name naturally in conversations
- Name is pulled from the signup form (already required)
- Falls back gracefully if name isn't available

### 3. **Updated Response Style**
The AI now follows this template:
```
"Hey [Name], I hear you. [empathy in 1 sentence]. 

[Bible verse citation] says '[key part]' - which means [brief explanation]. 

Here's what might help: [1-2 practical steps]. You've got this!"
```

## Deployment Steps

To deploy the updated Edge Function to Supabase:

```bash
# 1. Make sure you're logged in to Supabase
supabase login

# 2. Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# 3. Deploy the updated function
supabase functions deploy chat-with-openai

# 4. Verify deployment
supabase functions list
```

## Testing

After deploying:
1. Open the app and go to Bible Chat
2. Send a message
3. The AI should:
   - Greet you by your first name (from signup)
   - Give shorter, more conversational responses
   - Still include Bible verses and practical advice

## Example Before vs After

**Before (long and formal):**
> "I understand you're struggling with anxiety. That's a really common challenge in today's world, and you're not alone in experiencing these feelings. Many believers throughout history have dealt with anxiety and worry.
>
> The Bible speaks directly to this in Philippians 4:6-7: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' This passage reminds us that we can bring our worries to God through prayer, and He will provide peace that goes beyond what we can understand.
>
> Here's how you might apply this: Start each day with prayer, specifically naming your anxieties and thanking God for His presence. When anxious thoughts arise, pause and pray immediately. Consider keeping a gratitude journal to help maintain a thankful heart. Remember, God meets us where we are and walks with us through every challenge."

**After (short and natural):**
> "Hey [Your Name], I totally get it - anxiety can feel overwhelming. 
>
> Philippians 4:6-7 says 'don't be anxious about anything, but pray about everything' - basically, God wants to carry those worries with you. 
>
> Try this: when anxiety hits, pause and talk to God like a friend. Just name what's stressing you out and thank Him for one good thing. You've got this, and God's with you every step!"

## Files Changed

- `supabase/functions/chat-with-openai/index.ts` - Updated AI prompt and added name support
- `src/screens/ChatScreen.js` - Fetches and passes user's name to AI
- `src/services/supabase.js` - Updated chatWithAI function signature

---

**Need help?** Check Supabase function logs:
```bash
supabase functions logs chat-with-openai
```

