# AI Chatbot - Podcast Expert

## Overview

An intelligent chatbot powered by OpenAI's GPT-3.5 Turbo that answers questions about podcasts using Retrieval-Augmented Generation (RAG). The chatbot searches your vector database for relevant podcast information and uses it as context to generate informed, conversational responses.

## How It Works

### 1. **User Input**
- User types a question or topic in the chat interface
- Example: "Tell me about space exploration podcasts"

### 2. **Semantic Search**
- The user's question is converted to a vector embedding
- Searches the Supabase vector database for the most similar podcast content
- Uses a similarity threshold of 0.3 to be inclusive
- Returns the top 1 most relevant result

### 3. **Context-Aware Response**
- The retrieved podcast context is combined with the user's question
- Sent to OpenAI's GPT-3.5 Turbo model
- The AI generates a conversational response based on the context
- Chat history is maintained for contextual conversations

### 4. **Display Results**
- Shows the AI's response in a chat bubble
- Displays similarity score as a badge (context match percentage)
- Includes timestamps for all messages
- Shows loading animation while processing

## Architecture

```
User Question
    ↓
[Frontend: chat.js]
    ↓
POST /api/search-similar (semantic search)
    ↓
[Vector Database Search]
    ↓
Retrieved Context + User Question
    ↓
POST /api/chat (GPT-3.5 Turbo)
    ↓
[OpenAI Chat Completions]
    ↓
AI Response
    ↓
[Display in Chat UI]
```

## System Prompt

The chatbot uses this system prompt to guide responses:

```
You are an enthusiastic podcast expert who loves recommending podcasts to people. 
You will be given two pieces of information - some context about podcasts episodes 
and a question. Your main job is to formulate a short answer to the question using 
the provided context. If you are unsure and cannot find the answer in the context, 
say, "Sorry, I don't know the answer." Please do not make up the answer.
```

## Features

### 🎯 Core Functionality
- **RAG (Retrieval-Augmented Generation)**: Combines vector search with LLM responses
- **Conversational Memory**: Maintains chat history throughout the session
- **Context Display**: Shows similarity score of retrieved information
- **Real-time Feedback**: Loading animations and status indicators

### 🎨 User Interface
- **Welcome Message**: Explains capabilities with example questions
- **Message Bubbles**: Distinct styling for user vs. bot messages
- **Timestamps**: All messages include time sent
- **Character Counter**: Shows remaining characters (500 max)
- **Auto-resize Input**: Text area grows as you type
- **Error Handling**: Toast notifications for errors

### ⚡ Performance
- **Async Processing**: Non-blocking API calls
- **Loading States**: Visual feedback during processing
- **Auto-scroll**: Chat automatically scrolls to new messages
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line

## API Endpoints Used

### POST `/api/search-similar`
Performs semantic search in the vector database.

**Request:**
```json
{
  "query": "space exploration",
  "limit": 1,
  "threshold": 0.3
}
```

**Response:**
```json
{
  "success": true,
  "results": [{
    "id": 1,
    "content": "Beyond Mars: speculating life on distant planets",
    "similarity": 0.89
  }]
}
```

### POST `/api/chat`
Generates conversational responses using GPT-3.5 Turbo.

**Request:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a podcast expert..."
    },
    {
      "role": "user",
      "content": "Context: ...\n\nQuestion: ..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Based on the podcasts I know about...",
  "model": "gpt-3.5-turbo",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 80,
    "total_tokens": 230
  }
}
```

## Chat History Management

The chat maintains conversation history using this structure:

```javascript
const chatMessages = [
  {
    role: 'system',
    content: 'System prompt defining behavior...'
  },
  {
    role: 'user',
    content: 'Context: [Retrieved info]\n\nQuestion: [User question]'
  },
  {
    role: 'assistant',
    content: 'AI generated response'
  }
  // ... continues for full conversation
];
```

## Usage

### Starting the Chat

1. **Navigate to Chat Page**
   - Click "💬 Try Chatbot" from the main embeddings page
   - Or directly visit `http://localhost:8080/chat.html`

2. **Read Welcome Message**
   - Explains chatbot capabilities
   - Shows example questions you can ask

3. **Ask a Question**
   - Type in the input box at the bottom
   - Click send button or press Enter
   - Wait for the AI to respond

### Example Conversations

**Example 1: Specific Topic**
```
User: Tell me about space exploration podcasts
Bot: Based on the podcasts I know about, there's "Beyond Mars" 
     which is a fascinating 1 hour and 15 minute episode where 
     space enthusiasts speculate about extraterrestrial life and 
     the mysteries of distant planets. It's perfect if you're 
     interested in space exploration!
     
📚 Context match: 89%
```

**Example 2: General Query**
```
User: What can I listen to about music?
Bot: I'd recommend "Jazz under stars" - it's a 55-minute 
     experience that captures a captivating night in New Orleans 
     where jazz melodies echo under the moonlit sky. It's perfect 
     for music lovers!
     
📚 Context match: 76%
```

**Example 3: No Match**
```
User: Tell me about cooking shows
Bot: Sorry, I don't know the answer. I don't have any information 
     about cooking podcasts in my current knowledge base.
     
📚 Context match: 12%
```

## File Structure

```
chat.html       - Chat page HTML structure
chat.css        - Chat page styling
chat.js         - Chat frontend logic
server.js       - Backend with /api/chat endpoint
CHAT_README.md  - This documentation
```

## Customization

### Adjusting Search Parameters

In `chat.js`, modify the search call:

```javascript
const searchResponse = await fetch(`${API_BASE_URL}/search-similar`, {
  body: JSON.stringify({ 
    query: message, 
    limit: 1,        // Get top 1 result (increase for more context)
    threshold: 0.3   // Lower = more permissive (range: 0-1)
  })
});
```

### Customizing System Prompt

Modify the system message in `chat.js`:

```javascript
const chatMessages = [{
  role: 'system',
  content: `Your custom instructions here...`
}];
```

### Adjusting GPT-3.5 Parameters

In `server.js`, modify the chat endpoint:

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: messages,
  temperature: 0.7,      // Creativity (0-2, lower = more focused)
  max_tokens: 500,       // Response length limit
});
```

## Cost Considerations

### GPT-3.5 Turbo Pricing (as of 2024)
- **Input**: ~$0.0015 per 1K tokens
- **Output**: ~$0.002 per 1K tokens

### Typical Chat Cost
- Average query: ~150 input tokens + 80 output tokens
- **Cost per message**: ~$0.00038 (less than half a cent!)
- **1000 messages**: ~$0.38

### Embeddings Cost
- **text-embedding-ada-002**: ~$0.0001 per 1K tokens
- Search query embedding: ~10 tokens
- **Cost per search**: ~$0.000001 (essentially free)

## Troubleshooting

### Chat Not Responding
1. Check server is running: `npm start`
2. Verify Supabase connection in `config.js`
3. Ensure `match_documents` SQL function is installed
4. Check browser console for errors

### Poor Responses
1. **Low similarity scores**: Lower the threshold (currently 0.3)
2. **Generic answers**: Store more specific podcast data
3. **Inaccurate info**: Refine system prompt instructions

### No Context Found
1. Verify documents are stored: Check `/api/documents`
2. Run embedding storage: Use "Store from content.js" button
3. Lower similarity threshold for more matches

## Best Practices

1. **Clear Questions**: Ask specific questions for better results
2. **Context Matters**: Ensure your vector database has relevant data
3. **Review Similarity**: Low scores (<50%) may indicate poor matches
4. **Conversation Flow**: Use follow-up questions for better context
5. **Monitor Costs**: Check OpenAI usage dashboard regularly

## Future Enhancements

- [ ] Stream responses for real-time typing effect
- [ ] Multi-document context (use top 3 instead of top 1)
- [ ] Conversation export/import
- [ ] Voice input/output
- [ ] Message editing and regeneration
- [ ] Response rating system
- [ ] Custom knowledge base upload
- [ ] Conversation persistence (save to database)

## Related Documentation

- [README.md](README.md) - Main project documentation
- [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md) - Vector database setup
- [SETUP_VECTOR_SEARCH.md](SETUP_VECTOR_SEARCH.md) - Search optimization
- [OpenAI Chat API Docs](https://platform.openai.com/docs/api-reference/chat)
