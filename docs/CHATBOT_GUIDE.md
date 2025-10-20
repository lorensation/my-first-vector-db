# Complete Chatbot Guide

A comprehensive guide to the AI Knowledge Assistant - a multi-source RAG (Retrieval-Augmented Generation) chatbot that searches both podcast transcripts and movie content.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Overview](#overview)
3. [Architecture & Flow](#architecture--flow)
4. [Multi-Source Search](#multi-source-search)
5. [Features](#features)
6. [API Reference](#api-reference)
7. [Usage Examples](#usage-examples)
8. [Customization](#customization)
9. [Troubleshooting](#troubleshooting)
10. [Performance & Costs](#performance--costs)

---

## Quick Start

### Prerequisites
- Completed setup from main README.md
- Both `documents` (podcasts) and `movies` tables populated
- OpenAI API key configured
- Server running on http://localhost:3000

### 3 Steps to Start Chatting

#### Step 1: Navigate to Chat Page
```
http://localhost:3000/chat.html
```

#### Step 2: Ask Questions
The chatbot can answer questions from both sources:
- **Podcast questions**: "What does the podcast say about AI?"
- **Movie questions**: "Tell me about The Shawshank Redemption"
- **General questions**: "What content do you have about redemption?"

#### Step 3: Review Responses
Each response includes:
- AI-generated answer based on retrieved context
- Source badges showing where information came from:
  - 🎙️ **Podcast** (purple badge)
  - 🎬 **Movie** (pink badge)
- Relevant chunks from the knowledge base

### Example Chat Session

```
You: What does the podcast say about startups?

AI Assistant: Based on the podcast, startups require...
[Shows purple podcast badges with matching chunks]

You: Tell me about The Godfather

AI Assistant: The Godfather is a classic film about...
[Shows pink movie badges with matching chunks]
```

### Quick Troubleshooting
- **Empty responses?** → Check server console for errors
- **No sources shown?** → Verify tables have data with embeddings
- **Slow responses?** → Normal for first query; subsequent queries are faster

---

## Overview

### What is the AI Knowledge Assistant?

The AI Knowledge Assistant is an intelligent chatbot that uses **Retrieval-Augmented Generation (RAG)** to answer questions based on your knowledge base. It combines:

1. **Vector Search**: Finds relevant information from multiple sources
2. **LLM Generation**: Uses GPT-3.5-turbo to create natural language responses
3. **Source Attribution**: Shows exactly where information comes from

### Key Technologies

| Technology | Purpose | Details |
|------------|---------|---------|
| **OpenAI Embeddings** | Convert text to vectors | `text-embedding-ada-002` (1536 dimensions) |
| **OpenAI Chat** | Generate responses | `gpt-3.5-turbo` with RAG context |
| **Supabase pgvector** | Vector similarity search | Cosine similarity with ivfflat index |
| **Express.js** | Backend API | REST endpoints for chat and search |
| **Vanilla JS** | Frontend | Simple, dependency-free UI |

### System Prompt

The chatbot uses this system prompt to guide its behavior:

```
You are a helpful AI assistant with access to a knowledge base containing 
podcast transcripts and movie information. Answer questions based on the 
provided context. If the context doesn't contain relevant information, 
say so honestly. When referencing information, mention the source type 
(podcast or movie).
```

---

## Architecture & Flow

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                         │
│  User types question in chat.html: "What is machine learning?"  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (chat.js)                         │
│  1. Capture user input                                          │
│  2. Display user message in chat                                │
│  3. POST to /api/chat/search-all                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (server.js)                        │
│  Step 1: Generate embedding for user query                      │
│          OpenAI embedding API → vector[1536]                    │
│                                                                  │
│  Step 2: Parallel search both tables                            │
│          ┌─────────────────┬─────────────────┐                 │
│          │                 │                 │                  │
│          ▼                 ▼                 │                  │
│    match_documents()  match_movies()         │                  │
│    (podcasts table)   (movies table)         │                  │
│          │                 │                 │                  │
│          └────────┬────────┘                 │                  │
│                   │                          │                  │
│  Step 3: Combine and sort results            │                  │
│          All results sorted by similarity    │                  │
│          Top 5 most relevant chunks          │                  │
│                                              │                  │
│  Step 4: Build context from chunks           │                  │
│          Format: "source: [content]"         │                  │
│                                              │                  │
│  Step 5: Call OpenAI Chat API                │                  │
│          System prompt + context + question  │                  │
│          GPT-3.5-turbo generates answer      │                  │
│                                              │                  │
│  Step 6: Return response with sources        │                  │
│          { answer, sources: [...] }          │                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (chat.js)                         │
│  1. Display AI response                                         │
│  2. Render source badges (🎙️ podcast / 🎬 movie)               │
│  3. Show relevant chunks with similarity scores                 │
│  4. Update chat history                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Example

**User Query**: "What is discussed about entrepreneurship?"

**Step 1 - Embedding Generation**:
```json
{
  "query": "What is discussed about entrepreneurship?",
  "embedding": [0.023, -0.015, 0.041, ..., 0.008]  // 1536 dimensions
}
```

**Step 2 - Parallel Vector Search**:
```javascript
// Both searches run simultaneously
Promise.all([
  supabase.rpc('match_documents', {...}),  // Podcasts
  supabase.rpc('match_movies', {...})      // Movies
])
```

**Step 3 - Combined Results** (sorted by similarity):
```json
[
  {
    "content": "Entrepreneurship requires resilience...",
    "similarity": 0.87,
    "source": "podcast"
  },
  {
    "content": "The Social Network depicts startup culture...",
    "similarity": 0.82,
    "source": "movie"
  },
  // ... more results
]
```

**Step 4 - Context Building**:
```
podcast: Entrepreneurship requires resilience...
movie: The Social Network depicts startup culture...
podcast: Building a business from scratch involves...
```

**Step 5 - OpenAI Chat Completion**:
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "system", "content": "You are a helpful AI assistant..."},
    {"role": "user", "content": "Context:\n[context]\n\nQuestion: What is discussed about entrepreneurship?"}
  ]
}
```

**Step 6 - Response to User**:
- AI-generated answer based on context
- Source badges showing podcast and movie sources
- Relevant chunks displayed with similarity scores

### Chat History Structure

Chat history is maintained in memory during the session:

```javascript
chatHistory = [
  {
    role: "user",
    content: "What is machine learning?",
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    role: "assistant", 
    content: "Machine learning is...",
    sources: [
      {content: "...", similarity: 0.85, source: "podcast"},
      {content: "...", similarity: 0.78, source: "movie"}
    ],
    timestamp: "2024-01-15T10:30:02Z"
  }
]
```

### Performance Metrics

- **Embedding Generation**: ~200-500ms per query
- **Vector Search** (per table): ~50-200ms (depends on table size)
- **Parallel Search** (both tables): ~50-200ms (same as single table due to parallelization)
- **LLM Response**: ~1-3 seconds (depends on response length)
- **Total Response Time**: ~2-4 seconds average

**Optimization Note**: Searching both tables in parallel means the total search time is not doubled - it's limited by the slower of the two searches.

---

## Multi-Source Search

### How It Works

The chatbot searches **two separate knowledge bases simultaneously**:

1. **Documents (Podcasts)**: `documents` table
2. **Movies**: `movies` table

Both tables have:
- `content` column (text)
- `embedding` column (vector[1536])
- Corresponding `match_*` RPC functions

### Multi-Source Endpoint

**POST** `/api/chat/search-all`

Searches both tables in parallel and combines results:

```javascript
// Parallel search
const [podcastResults, movieResults] = await Promise.all([
  supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 5
  }),
  supabase.rpc('match_movies', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 5
  })
]);

// Combine and sort by similarity
const allResults = [
  ...podcastResults.map(r => ({...r, source: 'podcast'})),
  ...movieResults.map(r => ({...r, source: 'movie'}))
].sort((a, b) => b.similarity - a.similarity);

// Take top 5 results
const topResults = allResults.slice(0, 5);
```

### Source Attribution

Each response includes visual source indicators:

- 🎙️ **Podcast** - Purple badge (`#9333ea` background)
- 🎬 **Movie** - Pink badge (`#ec4899` background)

Sources are displayed:
- In the response text (when AI mentions them)
- As badges next to relevant chunks
- In the sources list below the answer

### Benefits

1. **Comprehensive answers**: Draws from multiple knowledge domains
2. **Transparent sourcing**: Users know exactly where information comes from
3. **Efficient search**: Parallel searches maintain fast response times
4. **Flexible expansion**: Easy to add more sources by adding tables

---

## Features

### 1. Intelligent Context Retrieval
- Uses vector similarity search to find relevant information
- Searches both podcast transcripts and movie content
- Returns top 5 most relevant chunks across all sources

### 2. Natural Language Responses
- Powered by GPT-3.5-turbo
- Contextual understanding of follow-up questions
- Honest about knowledge limitations

### 3. Source Transparency
- Every response shows which sources were used
- Visual badges distinguish podcasts from movies
- Similarity scores indicate relevance

### 4. Persistent Chat History
- Maintains conversation context within session
- Displays full conversation history
- User and assistant messages clearly distinguished

### 5. Responsive Design
- Works on desktop and mobile devices
- Clean, modern interface
- Smooth scrolling and auto-focus

### 6. Real-time Feedback
- Loading indicators during processing
- Error messages for failed requests
- Auto-scroll to latest messages

---

## API Reference

### POST /api/chat

Single-source chat endpoint (documents/podcasts only).

**Request Body**:
```json
{
  "message": "Your question here",
  "chatHistory": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ]
}
```

**Response**:
```json
{
  "response": "AI-generated answer",
  "sources": [
    {
      "content": "Relevant chunk from podcast",
      "similarity": 0.85
    }
  ]
}
```

### POST /api/chat/search-all

Multi-source chat endpoint (podcasts + movies).

**Request Body**:
```json
{
  "message": "Your question here",
  "chatHistory": [...]
}
```

**Response**:
```json
{
  "response": "AI-generated answer",
  "sources": [
    {
      "content": "Relevant chunk",
      "similarity": 0.87,
      "source": "podcast"
    },
    {
      "content": "Another relevant chunk",
      "similarity": 0.82,
      "source": "movie"
    }
  ]
}
```

**Key Differences**:
- `/api/chat`: Searches only `documents` table
- `/api/chat/search-all`: Searches both `documents` and `movies` tables
- Multi-source response includes `source` field for each chunk

---

## Usage Examples

### Basic Question
```
User: What is the main topic of the podcast?
AI: The podcast primarily discusses...
Sources: 🎙️ Podcast (3 chunks)
```

### Movie-Specific Question
```
User: Tell me about Inception
AI: Inception is a science fiction film...
Sources: 🎬 Movie (2 chunks)
```

### Cross-Source Question
```
User: What do you know about dreams?
AI: Dreams are explored in multiple contexts...
Sources: 🎙️ Podcast (2 chunks), 🎬 Movie (2 chunks)
```

### Follow-Up Question
```
User: What is machine learning?
AI: Machine learning is a subset of AI that...

User: Can you give me an example?
AI: Sure! For instance, [uses context from previous answer]...
```

### No Relevant Context
```
User: What's the weather today?
AI: I don't have access to current weather information. My knowledge is limited to the podcast transcripts and movie content in my database.
```

---

## Customization

### Adjusting Search Parameters

In `server.js`, modify the search thresholds:

```javascript
const { data: results } = await supabase.rpc('match_documents', {
  query_embedding: embedding,
  match_threshold: 0.5,    // Lower = more results (0-1)
  match_count: 5           // Number of results per table
});
```

**Parameters**:
- `match_threshold`: Minimum similarity score (0-1)
  - Higher = more strict matching
  - Lower = more lenient matching
  - Default: 0.5 (moderate)
  
- `match_count`: Maximum results per table
  - Default: 5
  - Increase for more context
  - Decrease for faster responses

### Modifying the System Prompt

In `server.js`, update the chatbot's behavior:

```javascript
const systemPrompt = `You are a helpful AI assistant with access to a knowledge base 
containing podcast transcripts and movie information. Answer questions based on the 
provided context. If the context doesn't contain relevant information, say so honestly. 
When referencing information, mention the source type (podcast or movie).`;
```

**Customization Ideas**:
- Change tone (formal, casual, technical)
- Add domain expertise (e.g., "You are a film critic...")
- Set response constraints (e.g., "Keep answers under 100 words")
- Add formatting rules (e.g., "Always use bullet points")

### Changing the LLM Model

In `server.js`:

```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',  // Options: gpt-3.5-turbo, gpt-4, gpt-4-turbo
  messages: messages,
  temperature: 0.7,        // 0-2: Lower = more focused, Higher = more creative
  max_tokens: 500         // Maximum response length
});
```

**Model Options**:
- `gpt-3.5-turbo`: Fast, cost-effective (current default)
- `gpt-4`: More capable, higher quality, slower, more expensive
- `gpt-4-turbo`: Balance of quality and speed

### UI Customization

**Change Source Badge Colors** (`chat.css`):

```css
.source-badge.podcast {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  /* Change colors here */
}

.source-badge.movie {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  /* Change colors here */
}
```

**Modify Chat Appearance** (`chat.css`):

```css
.user-message {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  /* User message styling */
}

.bot-message {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  /* Bot message styling */
}
```

### Adding More Sources

To add a third source (e.g., `articles` table):

1. **Create table** with embedding column
2. **Create match function** (`match_articles`)
3. **Update server.js**:
   ```javascript
   const [podcastResults, movieResults, articleResults] = await Promise.all([
     supabase.rpc('match_documents', {...}),
     supabase.rpc('match_movies', {...}),
     supabase.rpc('match_articles', {...})  // New source
   ]);
   
   const allResults = [
     ...podcastResults.map(r => ({...r, source: 'podcast'})),
     ...movieResults.map(r => ({...r, source: 'movie'})),
     ...articleResults.map(r => ({...r, source: 'article'}))  // New source
   ];
   ```
4. **Update chat.css** with new badge style
5. **Update system prompt** to mention new source

---

## Troubleshooting

### Empty or Generic Responses

**Symptoms**:
- AI says "I don't have information about that"
- Responses are vague or generic

**Possible Causes & Solutions**:

1. **No matching content**:
   - Lower `match_threshold` in server.js (try 0.3 instead of 0.5)
   - Increase `match_count` to retrieve more chunks
   
2. **Tables not populated**:
   ```sql
   -- Check if tables have data
   SELECT COUNT(*) FROM documents WHERE embedding IS NOT NULL;
   SELECT COUNT(*) FROM movies WHERE embedding IS NOT NULL;
   ```
   
3. **Poor query formulation**:
   - Try rephrasing your question
   - Be more specific
   - Use keywords that might appear in the content

### Server Errors

**Symptoms**:
- "Failed to get response" message in chat
- Console errors in browser or server

**Check Server Console**:
```powershell
# Look for error messages in the terminal running the server
# Common errors:
# - OpenAI API key invalid
# - Supabase connection failed
# - Rate limits exceeded
```

**Solutions**:

1. **OpenAI API Issues**:
   - Verify API key in `.env` file
   - Check OpenAI account has credits
   - Check for rate limit errors
   
2. **Supabase Issues**:
   - Verify Supabase URL and key in `.env`
   - Check database connection
   - Verify RPC functions exist
   
3. **Network Issues**:
   - Check internet connection
   - Verify server is running on port 3000
   - Try restarting the server

### Slow Responses

**Normal Behavior**:
- First query: 3-5 seconds (cold start)
- Subsequent queries: 2-3 seconds

**If Slower Than Expected**:

1. **Reduce context size**:
   - Lower `match_count` in server.js
   - Reduce `max_tokens` in OpenAI call
   
2. **Optimize database**:
   ```sql
   -- Ensure indexes exist
   SELECT * FROM pg_indexes WHERE tablename IN ('documents', 'movies');
   ```
   
3. **Check API latency**:
   - Monitor OpenAI API response times
   - Consider using a faster model (gpt-3.5-turbo)

### No Source Badges Displayed

**Symptoms**:
- Responses show but no 🎙️ or 🎬 badges appear

**Solutions**:

1. **Check endpoint**:
   - Verify using `/api/chat/search-all` (not `/api/chat`)
   - Check browser network tab for correct endpoint
   
2. **Verify source field**:
   ```javascript
   // In chat.js, check console for source data
   console.log(data.sources);
   ```
   
3. **CSS not loaded**:
   - Check browser console for CSS errors
   - Verify `chat.css` is linked in `chat.html`

### Chat History Not Working

**Symptoms**:
- Bot doesn't remember previous context
- Each question is treated independently

**Solutions**:

1. **Check chatHistory array**:
   ```javascript
   // In chat.js, verify chatHistory is populated
   console.log(chatHistory);
   ```
   
2. **Session persistence**:
   - Chat history resets on page refresh (expected behavior)
   - To persist: implement localStorage or database storage
   
3. **Context window exceeded**:
   - Long conversations may exceed token limits
   - Clear chat or limit history length

### Common Errors & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch` | Server not running | Start server: `node server.js` |
| `Invalid API key` | Wrong OpenAI key | Check `.env` file |
| `Rate limit exceeded` | Too many requests | Wait or upgrade OpenAI plan |
| `No embedding` | Tables not processed | Run embedding scripts |
| `CORS error` | Cross-origin issue | Check server CORS settings |

### Getting Help

If you're still experiencing issues:

1. **Check server logs**: Look at terminal running `node server.js`
2. **Check browser console**: F12 in browser → Console tab
3. **Verify setup**: Review README.md setup steps
4. **Test endpoints**: Use Postman or curl to test API directly

---

## Performance & Costs

### OpenAI API Costs

**Per Query Breakdown**:

1. **Embedding Generation** (~$0.0001):
   - Model: `text-embedding-ada-002`
   - Price: $0.0001 per 1K tokens
   - Average query: ~20 tokens = $0.000002
   
2. **Chat Completion** (~$0.0015-0.003):
   - Model: `gpt-3.5-turbo`
   - Price: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
   - Average: ~1K input + 500 output = $0.0025

**Total Cost Per Query**: ~$0.0025-0.003 (less than a third of a cent)

**Monthly Estimates** (based on usage):
- 100 queries/day: ~$7.50-9/month
- 1,000 queries/day: ~$75-90/month
- 10,000 queries/day: ~$750-900/month

### Cost Optimization Tips

1. **Use GPT-3.5-turbo** instead of GPT-4:
   - 10x cheaper
   - Still high quality for most use cases
   
2. **Reduce context size**:
   - Lower `match_count` (fewer chunks = less input tokens)
   - Trim long chunks before sending to OpenAI
   
3. **Implement caching**:
   - Cache common questions and answers
   - Reduce duplicate OpenAI calls
   
4. **Set max_tokens**:
   - Limit response length to control output costs
   
5. **Monitor usage**:
   ```javascript
   // Log token usage
   console.log('Tokens used:', completion.usage);
   ```

### Performance Metrics

**Typical Response Times**:
- Embedding generation: 200-500ms
- Vector search (both tables): 50-200ms
- LLM generation: 1-3 seconds
- **Total**: 2-4 seconds

**Database Performance**:
- Index type: `ivfflat` (good balance of speed and accuracy)
- Search complexity: O(√n) approximate
- Typical search: <100ms for thousands of vectors

**Optimization Checklist**:
- ✅ Use vector indexes (ivfflat or hnsw)
- ✅ Limit match_count to necessary minimum
- ✅ Use parallel searches for multiple sources
- ✅ Cache embeddings (don't regenerate for same query)
- ✅ Use connection pooling for Supabase

### Scaling Considerations

**For Small Scale** (<1K queries/day):
- Current setup is sufficient
- Default settings work well
- Costs are minimal

**For Medium Scale** (1K-10K queries/day):
- Consider implementing Redis cache
- Monitor OpenAI rate limits
- Optimize database indexes
- Budget ~$75-100/month for OpenAI

**For Large Scale** (>10K queries/day):
- Implement response caching
- Consider fine-tuned models
- Use load balancing
- Set up monitoring and alerts
- Budget increases proportionally

---

## Next Steps

### Immediate Improvements

1. **Add Authentication**:
   - Implement user login
   - Track usage per user
   - Set query limits
   
2. **Persistent Chat History**:
   - Save conversations to database
   - Allow users to review past chats
   - Implement chat sessions
   
3. **Enhanced UI**:
   - Add chat clearing button
   - Implement typing indicators
   - Add copy response button
   - Enable markdown rendering

### Advanced Features

1. **Multi-modal Support**:
   - Add image understanding
   - Support document uploads
   - Handle audio/video content
   
2. **Better Context Management**:
   - Implement sliding window for long conversations
   - Add conversation summarization
   - Support multi-turn context
   
3. **Analytics Dashboard**:
   - Track most common queries
   - Monitor response quality
   - Analyze source usage patterns
   
4. **More Sources**:
   - Add articles, books, documentation
   - Support web scraping
   - Import from external APIs

### Learning Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Supabase Vector Guide**: https://supabase.com/docs/guides/ai
- **LangChain Docs**: https://js.langchain.com/docs
- **RAG Best Practices**: Search for "Retrieval-Augmented Generation tutorials"

---

## Summary

You now have a complete understanding of the AI Knowledge Assistant:

✅ **Quick Start**: Get up and running in 3 steps  
✅ **Architecture**: Understand the full RAG flow  
✅ **Multi-Source**: Search podcasts and movies simultaneously  
✅ **Features**: Know all capabilities and how to use them  
✅ **API**: Reference for all endpoints  
✅ **Customization**: Adapt the chatbot to your needs  
✅ **Troubleshooting**: Solve common issues  
✅ **Costs**: Understand and optimize expenses  

**Happy chatting!** 🚀
