# 🔢 OpenAI Embeddings Showcase & AI Chatbot

A secure, full-stack web application demonstrating OpenAI's text embeddings API with semantic similarity comparison, Supabase vector database integration, and an intelligent RAG-powered chatbot. Built following best practices for API key security.

## ✨ Features

### Embeddings & Vector Search
- **🔒 Secure API Key Management**: API keys never exposed to the browser
- **📝 Single Text Embedding**: Generate vector embeddings for any text input
- **📚 Batch Embeddings**: Process multiple texts at once with parallel API calls
- **🔍 Semantic Similarity**: Compare two texts and visualize their similarity
- **💾 Vector Database**: Store and search embeddings in Supabase with pgvector
- **🔎 Semantic Search**: Find similar documents using cosine similarity

### AI Chatbot (NEW!)
- **💬 Conversational AI**: GPT-3.5-turbo powered chatbot
- **🎯 RAG Architecture**: Retrieval-Augmented Generation using vector search
- **📚 Context-Aware**: Pulls information from your vector database
- **🔄 Chat History**: Maintains conversation context
- **📊 Similarity Scores**: Shows how relevant the retrieved context is
- **🎨 Modern UI**: Beautiful chat interface with real-time updates

### User Experience
- **📊 Interactive UI**: Modern, responsive interface with real-time results
- **🎨 Visual Feedback**: Color-coded similarity scores and progress bars
- **💡 Example Comparisons**: Pre-loaded examples to explore embeddings

## 🏗️ Architecture

### Security-First Design

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│  Express.js │────────▶│   OpenAI    │
│  (Frontend) │  HTTP   │  (Backend)  │   API   │     API     │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │  .env    │
                        │ API Key  │
                        └──────────┘
```

**Why this approach?**
- ✅ API key stored server-side in `.env` file
- ✅ Never transmitted to browser
- ✅ Backend acts as secure proxy
- ✅ Follows OpenAI's security best practices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Supabase account ([Create free account](https://supabase.com))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Verify your `.env` file**:
   Ensure your `.env` file contains:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=8080
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Set up Supabase** (Optional - for vector database features):
   - Enable the `vector` extension in your Supabase dashboard
   - Run the SQL from `tables.sql` to create the documents table
   - See `SUPABASE_INTEGRATION.md` for detailed setup

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:8080`

## 📖 Usage

### Generate Single Embedding

1. Enter any text in the first section
2. Click "Generate Embedding"
3. View the resulting 1536-dimensional vector

### Generate Batch Embeddings

1. Enter multiple texts in the batch section (one per line)
2. Or click "Load Example Texts" to use pre-filled examples
3. Click "Generate Batch Embeddings"
4. Click on any result to expand and view its embedding

### Compare Text Similarity

1. Enter two texts to compare
2. Click "Compare Similarity"
3. See the cosine similarity score and interpretation

### Vector Database (Supabase)

**Store Embeddings:**
1. Click "Store Content.js" to save 10 podcast descriptions
2. Or use "Store Custom Batch" to save your own texts

**Search Similar Documents:**
1. Enter a search query (e.g., "space exploration")
2. Set the number of results you want
3. Adjust similarity threshold (0-1)
4. Click "Search Similar" to find matching documents

**Manage Database:**
1. Click "View All Documents" to see stored content
2. Use "Delete All Documents" to clear the database (requires confirmation)

### AI Chatbot 💬

**Access the Chatbot:**
1. Click "💬 Try Chatbot" button on the main page
2. Or navigate to `http://localhost:8080/chat.html`

**How to Use:**
1. Read the welcome message and example questions
2. Type your question about podcasts
3. Press Enter or click Send
4. Wait for the AI to search and respond
5. Continue the conversation - context is maintained!

**Example Questions:**
- "Tell me about space exploration podcasts"
- "What podcasts discuss ocean mysteries?"
- "Recommend a podcast about AI and technology"
- "What can I listen to about music and culture?"

**Features:**
- 🎯 **RAG Architecture**: Searches vector DB for context
- 💬 **Conversational**: Maintains chat history
- 📊 **Similarity Score**: Shows context relevance
- ⚡ **Fast Responses**: Powered by GPT-3.5-turbo

For detailed chatbot documentation, see [CHAT_README.md](CHAT_README.md)

### Try Examples

Click any example button to auto-fill comparison texts and see how different concepts relate.

## 🔧 API Endpoints

### POST `/api/embeddings`
Create an embedding for text input.

**Request:**
```json
{
  "text": "artificial intelligence"
}
```

**Response:**
```json
{
  "success": true,
  "text": "artificial intelligence",
  "embedding": [0.002341, -0.012345, ...],
  "dimensions": 1536,
  "model": "text-embedding-ada-002"
}
```

### POST `/api/compare-embeddings`
Compare similarity between two texts.

**Request:**
```json
{
  "text1": "dog",
  "text2": "puppy"
}
```

**Response:**
```json
{
  "success": true,
  "text1": "dog",
  "text2": "puppy",
  "similarity": 0.923,
  "similarityPercentage": "92.30%",
  "interpretation": "Very High - Nearly identical meaning"
}
```

### POST `/api/batch-embeddings`
Create embeddings for multiple texts at once.

**Request:**
```json
{
  "texts": [
    "Beyond Mars: speculating life on distant planets.",
    "Jazz under stars: a night in New Orleans' music scene.",
    "Mysteries of the deep: exploring uncharted ocean caves."
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "content": "Beyond Mars: speculating life on distant planets.",
      "embedding": [0.002341, -0.012345, ...],
      "dimensions": 1536
    },
    {
      "content": "Jazz under stars: a night in New Orleans' music scene.",
      "embedding": [0.003456, -0.023456, ...],
      "dimensions": 1536
    },
    {
      "content": "Mysteries of the deep: exploring uncharted ocean caves.",
      "embedding": [0.004567, -0.034567, ...],
      "dimensions": 1536
    }
  ],
  "model": "text-embedding-ada-002"
}
```

### GET `/api/health`
Health check endpoint.

## 📁 Project Structure

```
my-first-vector-db/
├── server.js              # Express backend (secure API proxy)
├── config.js              # OpenAI & Supabase client configuration
├── content.js             # Sample podcast data
├── index.html             # Embeddings demo UI
├── index.js               # Embeddings frontend logic
├── index.css              # Embeddings page styling
├── chat.html              # Chatbot page UI
├── chat.js                # Chatbot frontend logic
├── chat.css               # Chatbot page styling
├── tables.sql             # Supabase table schema
├── match_documents.sql    # Vector search function
├── .env                   # Environment variables (API keys)
├── package.json           # Dependencies and scripts
├── README.md              # Main documentation
├── CHAT_README.md         # Chatbot detailed docs
├── CHATBOT_FLOW.md        # RAG architecture diagram
├── SUPABASE_INTEGRATION.md # Database setup guide
└── SETUP_VECTOR_SEARCH.md  # Search optimization guide
```

## 🔧 API Endpoints

### Embeddings Endpoints

#### POST `/api/embeddings`
Create an embedding for text input.

#### POST `/api/compare-embeddings`
Compare similarity between two texts.

#### POST `/api/batch-embeddings`
Create embeddings for multiple texts.

### Database Endpoints

#### POST `/api/store-embeddings`
Store embeddings in Supabase.

#### GET `/api/documents`
Retrieve documents from database.

#### POST `/api/search-similar`
Search for similar documents using vector similarity.

#### DELETE `/api/documents`
Delete all documents (requires confirmation).

### Chat Endpoint (NEW!)

#### POST `/api/chat`
Generate conversational responses using GPT-3.5-turbo.

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a podcast expert..." },
    { "role": "user", "content": "Context: ...\n\nQuestion: ..." }
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

For complete API documentation, see endpoint-specific documentation files.

## 🧮 Understanding Embeddings

**What are embeddings?**
Embeddings are numerical representations of text that capture semantic meaning. Similar concepts have similar vectors.

**The Model: text-embedding-ada-002**
- Dimensions: 1536
- Use cases: Search, clustering, recommendations, anomaly detection
- Cost-effective and high-performance

**Cosine Similarity**
Measures how similar two vectors are:
- 1.0 = Identical
- 0.9+ = Very similar
- 0.7-0.9 = Related
- <0.7 = Different

## 🤖 RAG Architecture (Chatbot)

The chatbot uses **Retrieval-Augmented Generation**:

1. **User Query** → Convert to embedding
2. **Vector Search** → Find relevant context in database
3. **Augment Prompt** → Combine context + question
4. **LLM Generation** → GPT-3.5 generates answer
5. **Response** → User gets contextual answer

**Benefits:**
- ✅ Answers grounded in your data
- ✅ Reduces hallucinations
- ✅ Cost-effective (~$0.0004 per message)
- ✅ Maintains conversation history

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Embeddings**: OpenAI text-embedding-ada-002
- **Chat**: OpenAI GPT-3.5-turbo
- **Vector DB**: Supabase with pgvector extension
- **Security**: dotenv, CORS, server-side API keys

## 📝 Development

### Run in Development Mode
```bash
npm run dev
```

### Environment Variables
```env
OPENAI_API_KEY=sk-...           # Your OpenAI API key
PORT=8080                        # Server port (default: 8080)
```

## 🤝 Contributing

Part of the Scrimba AI Engineer Course. Feel free to fork and experiment!
