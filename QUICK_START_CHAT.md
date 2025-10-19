# 🚀 Quick Start Guide - AI Chatbot

## Start Using the Chatbot in 3 Steps

### 1️⃣ Start the Server
```bash
npm start
```

You should see:
```
🚀 Server is running on http://localhost:8080

📊 API Endpoints:
  📊 Single Embedding: POST /api/embeddings
  🔍 Compare Texts: POST /api/compare-embeddings
  📚 Batch Embeddings: POST /api/batch-embeddings

💾 Supabase Integration:
  💿 Store Embeddings: POST /api/store-embeddings
  📋 Get Documents: GET /api/documents
  🔎 Search Similar: POST /api/search-similar
  🗑️  Delete All: DELETE /api/documents?confirm=true

🤖 AI Chat:
  💬 Chat Completions: POST /api/chat

✅ Health Check: GET /api/health

📄 Pages:
  🏠 Embeddings Demo: http://localhost:8080/index.html
  💬 Chatbot: http://localhost:8080/chat.html
```

### 2️⃣ Store Some Podcast Data
Before chatting, you need documents in your vector database!

**Option A: Use Sample Data**
1. Open `http://localhost:8080/index.html`
2. Scroll to "Vector Database" section
3. Click "**Store from content.js**"
4. Confirm to store 10 podcast descriptions

**Option B: Use Custom Data**
1. Go to "Batch Embeddings" section
2. Enter podcast descriptions (one per line)
3. Scroll to "Vector Database" section
4. Click "**Store Custom Batch**"

### 3️⃣ Start Chatting!
1. Click "**💬 Try Chatbot**" button (top right)
2. Or navigate to `http://localhost:8080/chat.html`
3. Try an example question:
   - Click: "Tell me about space exploration podcasts"
   - Or type your own question
4. Press Enter or click Send
5. Wait for the AI response (1-3 seconds)

## Example Chat Session

```
┌──────────────────────────────────────────────────────┐
│ 🎙️ Welcome to Podcast Expert AI!                   │
│                                                      │
│ I'm your AI-powered podcast assistant. I have        │
│ knowledge about various podcast episodes stored in   │
│ a vector database. Ask me anything!                  │
│                                                      │
│ Try asking:                                          │
│ • Tell me about space exploration podcasts          │
│ • What podcasts discuss ocean mysteries?            │
│ • Recommend a podcast about AI and technology       │
└──────────────────────────────────────────────────────┘

You: Tell me about space exploration podcasts

🤖 Podcast Expert AI:
Based on the podcasts I know about, I'd highly recommend 
'Beyond Mars'! It's a fascinating 1 hour and 15 minute 
episode where space enthusiasts dive deep into speculating 
about extraterrestrial life and the mysteries of distant 
planets. Perfect for anyone interested in space exploration!

📚 Context match: 89%

You: How long is it?

🤖 Podcast Expert AI:
'Beyond Mars' is 1 hour and 15 minutes long. It's a great 
length for a deep dive into the fascinating topic of 
extraterrestrial life and distant planets!

📚 Context match: 91%
```

## Troubleshooting

### ❌ "Cannot connect to server"
**Solution:** Make sure server is running with `npm start`

### ❌ "No documents found"
**Solution:** Store some documents first (Step 2 above)

### ❌ "Function match_documents does not exist"
**Solution:** Run the SQL function in Supabase SQL Editor
1. Open `match_documents.sql`
2. Copy contents
3. Go to Supabase Dashboard → SQL Editor
4. Paste and run

### ❌ "Low similarity scores" (<30%)
**Solution:** 
- Store more relevant documents
- Lower threshold in `chat.js` (line 68)
- Try different search terms

### ❌ Generic/unhelpful responses
**Solution:**
- Ensure documents are detailed and descriptive
- Customize system prompt in `chat.js`
- Increase context (change `limit: 1` to `limit: 3`)

## Tips for Best Results

### 🎯 Ask Specific Questions
❌ "Tell me about podcasts"
✅ "What podcasts discuss space exploration?"

### 📝 Store Quality Data
- Use descriptive podcast descriptions
- Include key topics and themes
- Add duration and episode details

### 🔍 Monitor Similarity Scores
- **>80%** = Excellent match, trustworthy answer
- **60-80%** = Good match, relevant answer
- **40-60%** = Moderate match, check response
- **<40%** = Poor match, may be generic

### 💬 Use Follow-up Questions
The chatbot maintains context, so you can:
1. Ask: "Tell me about jazz podcasts"
2. Follow up: "How long is it?"
3. Continue: "What else do you know about music?"

## What to Try

### Basic Usage
- [ ] Ask about different podcast topics
- [ ] Use example questions
- [ ] Try follow-up questions
- [ ] Check similarity scores

### Advanced Usage
- [ ] Store your own podcast data
- [ ] Adjust search threshold
- [ ] Modify system prompt
- [ ] Increase context limit
- [ ] Export conversation

### Experimentation
- [ ] Compare responses with different thresholds
- [ ] Test with various topics
- [ ] See how context affects answers
- [ ] Try edge cases (no matches, etc.)

## Cost Tracking

### Per Message
- Search: ~$0.000001
- Chat: ~$0.0004
- **Total: ~$0.0004** (less than half a cent!)

### Estimated Usage
- **100 messages:** ~$0.04
- **1000 messages:** ~$0.40
- **10,000 messages:** ~$4.00

**Check your usage:** [OpenAI Dashboard](https://platform.openai.com/usage)

## Next Steps

1. ✅ Get chatbot working (this guide)
2. 📚 Read [CHAT_README.md](CHAT_README.md) for details
3. 🔧 Customize system prompt
4. 💾 Add more podcast data
5. 🎨 Personalize the UI
6. 🚀 Share with others!

## Need Help?

### Documentation
- **Chatbot Details:** [CHAT_README.md](CHAT_README.md)
- **How RAG Works:** [CHATBOT_FLOW.md](CHATBOT_FLOW.md)
- **Main README:** [README.md](README.md)
- **Supabase Setup:** [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)

### Common Issues
Check the Troubleshooting section above first!

### Still Stuck?
1. Check browser console (F12) for errors
2. Check server terminal for error messages
3. Verify `.env` file has valid API key
4. Ensure Supabase is connected

---

**Happy Chatting! 💬✨**

Your AI-powered podcast expert is ready to help you discover amazing content!
