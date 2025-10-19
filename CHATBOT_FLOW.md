# RAG Chatbot Flow Diagram

## Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                         (chat.html)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1. User types question
                             │    "Tell me about space podcasts"
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LOGIC                              │
│                       (chat.js)                                  │
│                                                                  │
│  • Add user message to UI                                        │
│  • Show loading animation                                        │
│  • Prepare API request                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 2. POST /api/search-similar
                             │    { query: "...", limit: 1, threshold: 0.3 }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIMILARITY SEARCH                             │
│                    (server.js endpoint)                          │
│                                                                  │
│  Step 1: Create embedding for user question                     │
│          ├─> OpenAI text-embedding-ada-002                      │
│          └─> Returns 1536-dimensional vector                    │
│                                                                  │
│  Step 2: Search Supabase vector DB                              │
│          ├─> RPC: match_documents()                             │
│          ├─> Cosine similarity with threshold                   │
│          └─> Returns top match with score                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 3. Response with context
                             │    { content: "Beyond Mars: ...", similarity: 0.89 }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND PROCESSING                             │
│                       (chat.js)                                  │
│                                                                  │
│  • Receive search results                                        │
│  • Extract top context                                           │
│  • Prepare chat messages array:                                 │
│    [                                                             │
│      { role: 'system', content: 'You are podcast expert...' }   │
│      { role: 'user', content: 'Context: ... Question: ...' }    │
│    ]                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 4. POST /api/chat
                             │    { messages: [...] }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CHAT COMPLETIONS                               │
│                   (server.js endpoint)                           │
│                                                                  │
│  • Receive messages array                                        │
│  • Call OpenAI GPT-3.5-turbo                                    │
│    ├─> model: "gpt-3.5-turbo"                                   │
│    ├─> temperature: 0.7                                         │
│    ├─> max_tokens: 500                                          │
│    └─> messages: [system, user]                                 │
│  • Return AI response + usage stats                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 5. Response with AI answer
                             │    { message: "Based on podcasts...", usage: {...} }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                              │
│                       (chat.js)                                  │
│                                                                  │
│  • Add assistant message to chat history                         │
│  • Remove loading animation                                      │
│  • Display bot message bubble                                    │
│  • Show similarity badge                                         │
│  • Add timestamp                                                 │
│  • Auto-scroll to bottom                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### Input
```
User Question: "Tell me about space exploration podcasts"
```

### Step-by-Step Processing

#### 1. Semantic Search
```javascript
// Search query embedding created
embedding: [0.0023, -0.0145, 0.0087, ...] // 1536 dims

// Database search results
{
  id: 1,
  content: "Beyond Mars (1 hr 15 min): Join space enthusiasts as they speculate...",
  similarity: 0.89
}
```

#### 2. Chat Messages Prepared
```javascript
[
  {
    role: 'system',
    content: 'You are an enthusiastic podcast expert...'
  },
  {
    role: 'user',
    content: `Context: Beyond Mars (1 hr 15 min): Join space enthusiasts...
              
              Question: Tell me about space exploration podcasts`
  }
]
```

#### 3. GPT-3.5 Response
```javascript
{
  message: "Based on the podcasts I know about, I'd highly recommend 'Beyond Mars'! It's a fascinating 1 hour and 15 minute episode where space enthusiasts dive deep into speculating about extraterrestrial life and the mysteries of distant planets. Perfect for anyone interested in space exploration!",
  usage: {
    prompt_tokens: 150,
    completion_tokens: 58,
    total_tokens: 208
  }
}
```

#### 4. Display in Chat
```
┌─────────────────────────────────────────────────────────┐
│ You                                            3:45 PM  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Tell me about space exploration podcasts           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 💬 Podcast Expert AI                           3:45 PM  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Based on the podcasts I know about, I'd highly     │ │
│ │ recommend 'Beyond Mars'! It's a fascinating 1 hour │ │
│ │ and 15 minute episode where space enthusiasts dive │ │
│ │ deep into speculating about extraterrestrial life  │ │
│ │ and the mysteries of distant planets. Perfect for  │ │
│ │ anyone interested in space exploration!            │ │
│ │                                                     │ │
│ │ 3:45 PM  📚 Context match: 89%                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Vanilla JavaScript | Chat UI and logic |
| **Backend** | Express.js | API endpoints |
| **Embeddings** | OpenAI ada-002 | Convert text to vectors |
| **Vector DB** | Supabase + pgvector | Store and search embeddings |
| **LLM** | GPT-3.5-turbo | Generate responses |
| **Search** | Cosine similarity | Find relevant context |

## Performance Metrics

| Operation | Time | Cost |
|-----------|------|------|
| Embedding creation | ~200ms | ~$0.000001 |
| Vector search | ~50ms | Free |
| GPT-3.5 response | ~1-3s | ~$0.0004 |
| **Total per message** | **~1.5-3.5s** | **~$0.0004** |

## Chat History Structure

```javascript
// Example conversation state
chatMessages = [
  { role: 'system', content: 'System prompt...' },
  
  // First exchange
  { role: 'user', content: 'Context: ...\nQuestion: space podcasts?' },
  { role: 'assistant', content: 'I recommend Beyond Mars...' },
  
  // Second exchange (maintains context)
  { role: 'user', content: 'Context: ...\nQuestion: How long is it?' },
  { role: 'assistant', content: 'Beyond Mars is 1 hour and 15 minutes long.' },
  
  // And so on...
];
```

This maintains conversation continuity and allows the AI to reference previous messages!
