# 🔢 OpenAI Embeddings Showcase & AI Chatbot

A secure, full-stack web application demonstrating OpenAI's text embeddings API with semantic similarity comparison, Supabase vector database integration, LangChain text splitters, and intelligent RAG-powered chatbots. Built following best practices for API key security and production-ready text processing.

## ✨ Features

### Embeddings & Vector Search
- **🔒 Secure API Key Management**: API keys never exposed to the browser
- **📝 Single Text Embedding**: Generate vector embeddings for any text input
- **📚 Batch Embeddings**: Process multiple texts at once with parallel API calls
- **🔍 Semantic Similarity**: Compare two texts and visualize their similarity
- **💾 Vector Database**: Store and search embeddings in Supabase with pgvector
- **🔎 Semantic Search**: Find similar documents using cosine similarity

### Text Processing & LangChain
- **✂️ Text Chunking**: Split large documents into smaller, manageable chunks
- **🔗 LangChain Integration**: Production-ready text splitters from `@langchain/textsplitters`
- **⚙️ Configurable Splitters**: Adjustable chunk size (50-1000 chars) and overlap (0-200 chars)
- **🎯 Smart Boundaries**: Intelligent splitting at sentence/word breaks
- **📦 Batch Processing**: Efficient embedding creation for multiple chunks

### AI Chatbot (Multi-Source RAG!)
- **💬 Conversational AI**: GPT-3.5-turbo powered chatbot
- **🎯 RAG Architecture**: Retrieval-Augmented Generation using vector database semantic similarity search (function implemented in Supabase, check `sql-setup/`)
- **📚 Multi-Source Context**: Searches both podcast transcripts and movie content
- **🔄 Chat History**: Maintains conversation context
- **📊 Similarity Scores**: Shows how relevant the retrieved context is
- **�️ Source Attribution**: Visual badges show which knowledge base answered your question
- **�🎨 Modern UI**: Beautiful chat interface with real-time updates

### Movies Text Splitter Demo
- **📄 Document Processing**: Process large text files (movies.txt) with text splitters
- **👀 Chunk Visualization**: See exactly how your text is split into chunks
- **🔍 Semantic Movie Search**: Find relevant movie content using natural language queries
- **📊 Interactive Demo**: Experiment with different chunk sizes and overlap settings
- **💾 Persistent Storage**: Store and search movie chunks in dedicated database table

### User Experience
- **📊 Interactive UI**: Modern, responsive interface with real-time results
- **🎨 Visual Feedback**: Color-coded similarity scores and progress bars
- **💡 Example Comparisons**: Pre-loaded examples to explore embeddings
- **🎮 Multiple Demos**: Three separate interfaces for different features

## 🏗️ Architecture

### Security-First Design with LangChain Integration

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────┐
│   Browser   │───────▶│    Express.js        │────────▶│   OpenAI    │
│  (Frontend) │  HTTP   │  (Backend + RAG)     │   API   │     API     │
└─────────────┘         └──────────────────────┘         └─────────────┘
                                 │
                                 ├──────────────┐
                                 ▼              ▼
                        ┌──────────────┐  ┌──────────────┐
                        │    .env      │  │  LangChain   │
                        │  API Keys    │  │ Text Splitter│
                        └──────────────┘  └──────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │    Supabase      │
                        │   (pgvector)     │
                        │ - Documents DB   │
                        │ - Movies DB      │
                        └──────────────────┘
```

**Why this approach?**
- ✅ API key stored server-side in `.env` file
- ✅ Never transmitted to browser
- ✅ Backend acts as secure proxy
- ✅ Follows OpenAI's security best practices
- ✅ Production-ready text processing with LangChain
- ✅ Separate knowledge bases for different content types

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

   This will install all required packages including:
   - `openai` - OpenAI API client
   - `@supabase/supabase-js` - Supabase client
   - `@langchain/textsplitters` - LangChain text splitting tools
   - `express` - Web server framework
   - `dotenv` - Environment variable management

2. **Verify your `.env` file**:
   Ensure your `.env` file contains:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=8080
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Set up Supabase databases**:
   
   **For Podcast/Documents features:**
   - Enable the `vector` extension in your Supabase dashboard
   - Run the SQL from `sql-setup/tables.sql` to create the documents table
   - Run the SQL from `sql-setup/match_documents.sql` to create search function
   
   **For Movies text splitter demo:**
   - Run the SQL from `sql-setup/movies_table.sql` to create the movies table
   - Run the SQL from `sql-setup/match_movies.sql` to create movies search function
   
   See `docs/SUPABASE_INTEGRATION.md` for detailed setup instructions.

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Open your browser**:
   - Main embeddings demo: `http://localhost:8080`
   - AI Chatbot: `http://localhost:8080/chat.html`
   - Movies text splitter: `http://localhost:8080/movies.html`

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
2. Type your question about podcasts or movies
3. Press Enter or click Send
4. Wait for the AI to search both knowledge bases and respond
5. Continue the conversation - context is maintained!

**What Makes This Special:**
- **Multi-Source Search**: Searches both podcast transcripts AND movie content
- **Source Attribution**: Visual badges show where information came from:
  - 🎙️ **Podcast** (purple badge)
  - 🎬 **Movie** (pink badge)
- **Context-Aware**: Combines relevant information from multiple chunks
- **Conversational Memory**: Remembers your chat history

**Example Questions:**
- "Tell me about space exploration podcasts"
- "What movies mention redemption?"
- "Compare what podcasts and movies say about AI"
- "What content do you have about music?"

**Features:**
- 🎯 **RAG Architecture**: Searches vector DB for context
- 💬 **Conversational**: Maintains chat history
- 📊 **Similarity Score**: Shows context relevance
- ⚡ **Fast Responses**: Powered by GPT-3.5-turbo
- 🏷️ **Source Tracking**: Know where each answer comes from

For detailed chatbot documentation, see [docs/CHATBOT_GUIDE.md](docs/CHATBOT_GUIDE.md)

### Movies Text Splitter Demo 🎬

**Access the Demo:**
Navigate to `http://localhost:8080/movies.html`

**What This Demonstrates:**
This feature shows how text chunking works in RAG systems by processing a large text file (movies.txt) containing movie descriptions.

**Step 1: Configure & Process**
1. Set your **Chunk Size** (50-1000 characters)
   - Smaller chunks = more precise search results
   - Larger chunks = more context per result
2. Set your **Chunk Overlap** (0-200 characters)
   - Overlap preserves context across chunk boundaries
3. Click **"🚀 Process & Store Chunks"**

This will:
- Read the movies.txt file
- Split it using LangChain's CharacterTextSplitter
- Create embeddings for each chunk
- Store everything in Supabase

**Step 2: Visualize Chunks**
- See all chunks displayed as cards
- Each card shows the chunk ID, character count, and content
- Click **"📋 Load Existing Chunks"** to reload from database

**Step 3: Search Similar Content**
1. Enter a search query (e.g., "action movies", "romantic comedy")
2. Set the number of results (1-20)
3. Set similarity threshold (0-1, higher = more strict matching)
4. Click **"🔎 Search"**

Results show:
- Similarity percentage
- Match quality interpretation
- The actual text content from matching chunks

**Why This Matters:**
- Learn how text chunking affects search quality
- Experiment with different chunk configurations
- Understand the trade-offs between chunk size and precision
- See LangChain text splitters in action

For detailed documentation, see [docs/MOVIES_README.md](docs/MOVIES_README.md)

### Try Examples

Click any example button to auto-fill comparison texts and see how different concepts relate.

## 🔧 API Endpoints

### Embeddings Endpoints

#### POST `/api/embeddings`
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

#### POST `/api/compare-embeddings`
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

#### POST `/api/batch-embeddings`
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
    }
  ],
  "model": "text-embedding-ada-002"
}
```

### Database Endpoints (Documents)

#### POST `/api/store-embeddings`
Store embeddings in Supabase documents table.

**Request:**
```json
{
  "texts": ["text1", "text2"]
}
```

#### GET `/api/documents`
Retrieve documents from database.

**Query params:** `limit`, `offset`

#### POST `/api/search-similar`
Search for similar documents using vector similarity.

**Request:**
```json
{
  "query": "space exploration",
  "limit": 5,
  "threshold": 0.5
}
```

#### DELETE `/api/documents`
Delete all documents (requires confirmation).

### Movies Endpoints (Text Splitter Demo)

#### POST `/api/movies/process`
Process movies.txt with LangChain text splitter and store chunks.

**Request:**
```json
{
  "chunkSize": 200,
  "chunkOverlap": 50
}
```

**Response:**
```json
{
  "success": true,
  "chunksCreated": 45,
  "totalCharacters": 8732,
  "chunks": [
    {
      "id": 1,
      "content": "The Shawshank Redemption...",
      "length": 198
    }
  ]
}
```

#### GET `/api/movies`
Retrieve movie chunks from database.

**Query params:** `limit`, `offset`

#### POST `/api/movies/search`
Semantic search in movie chunks.

**Request:**
```json
{
  "query": "action movies",
  "limit": 5,
  "threshold": 0.5
}
```

#### DELETE `/api/movies`
Clear all movie chunks (requires `confirm=true` query param).

### Chat Endpoint

#### POST `/api/chat`
Generate conversational responses using GPT-3.5-turbo with RAG.

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant..." },
    { "role": "user", "content": "Tell me about space podcasts" }
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

### Health Check

#### GET `/api/health`
Server health check endpoint.

For complete API documentation, see endpoint-specific documentation files in `/docs`.

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

## ✂️ Text Chunking with LangChain

**What is text chunking?**
Text chunking splits large documents into smaller pieces that:
- Fit within model token limits
- Provide focused, relevant context
- Enable more precise search results

**Why use LangChain's CharacterTextSplitter?**
- ✅ Production-ready and battle-tested
- ✅ Smart boundary detection (respects sentences/words)
- ✅ Configurable chunk size and overlap
- ✅ Industry-standard implementation
- ✅ Less code to maintain

**Key Concepts:**

**Chunk Size** (50-1000 characters):
- **Smaller chunks** (100-200): More granular, better for specific searches
- **Larger chunks** (500-1000): More context, better for general searches

**Chunk Overlap** (0-200 characters):
- **No overlap** (0): Completely separate chunks
- **Small overlap** (20-50): Some context preservation
- **Large overlap** (100+): Significant context preservation but more redundancy

**Benefits:**
1. **Token Limits**: Language models have input size limits
2. **Precision**: Smaller chunks = more precise search results
3. **Cost**: Smaller chunks = fewer tokens to process
4. **Context**: Overlap preserves context across boundaries

**LangChain Implementation:**
```javascript
import { CharacterTextSplitter } from '@langchain/textsplitters';

const textSplitter = new CharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 50,
});

const chunks = await textSplitter.splitText(document);
```

For more information, see [docs/LANGCHAIN_UPDATE.md](docs/LANGCHAIN_UPDATE.md)

## 🤖 RAG Architecture (Chatbot)

The chatbot uses **Retrieval-Augmented Generation** with multi-source search:

### Single-Source RAG Flow:
1. **User Query** → Convert to embedding
2. **Vector Search** → Find relevant context in database
3. **Augment Prompt** → Combine context + question
4. **LLM Generation** → GPT-3.5 generates answer
5. **Response** → User gets contextual answer

### Multi-Source Enhancement:
The chatbot searches **both** the documents (podcasts) and movies tables:
1. **Parallel Search** → Searches both knowledge bases simultaneously
2. **Source Attribution** → Tracks which database provided each chunk
3. **Combined Context** → Merges relevant chunks from both sources
4. **Source Badges** → Visual indicators (🎙️ Podcast, 🎬 Movie) show origins

**Benefits:**
- ✅ Answers grounded in your data
- ✅ Reduces hallucinations
- ✅ Cost-effective (~$0.0004 per message)
- ✅ Maintains conversation history
- ✅ Multi-source knowledge integration
- ✅ Transparent source attribution

**RAG + Text Chunking:**
The combination of text chunking and RAG enables:
- Precise information retrieval from large documents
- Contextual responses without overwhelming the LLM
- Efficient token usage
- Scalable knowledge base expansion

For detailed architecture diagrams, see [docs/CHATBOT_GUIDE.md](docs/CHATBOT_GUIDE.md)

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Embeddings**: OpenAI text-embedding-ada-002 (1536 dimensions)
- **Chat**: OpenAI GPT-3.5-turbo
- **Text Processing**: LangChain CharacterTextSplitter (`@langchain/textsplitters`)
- **Vector DB**: Supabase with pgvector extension
- **Security**: dotenv, CORS, server-side API keys

## 📚 Key Learning Topics

This project demonstrates:

1. **Vector Embeddings**
   - Converting text to numerical representations
   - Semantic similarity calculations
   - Batch processing optimization

2. **Text Chunking & Splitting**
   - LangChain integration for production-ready splitting
   - Configurable chunk sizes and overlaps
   - Boundary detection for optimal chunks

3. **Vector Databases**
   - Supabase pgvector for similarity search
   - IVFFlat indexing for performance
   - Multiple table management (documents + movies)

4. **RAG (Retrieval-Augmented Generation)**
   - Multi-source context retrieval
   - Prompt engineering with context injection
   - Source attribution and tracking

5. **Full-Stack Development**
   - Secure API key management
   - RESTful API design
   - Modern responsive UI/UX

## 📖 Documentation

- **[README.md](README.md)** - Main documentation (this file)
- **[docs/LANGCHAIN_UPDATE.md](docs/LANGCHAIN_UPDATE.md)** - LangChain integration guide
- **[docs/MOVIES_README.md](docs/MOVIES_README.md)** - Text splitter demo guide
- **[docs/CHATBOT_GUIDE.md](docs/CHATBOT_GUIDE.md)** - Complete chatbot documentation
- **[docs/SUPABASE_INTEGRATION.md](docs/SUPABASE_INTEGRATION.md)** - Database setup guide
- **[docs/SETUP_VECTOR_SEARCH.md](docs/SETUP_VECTOR_SEARCH.md)** - Search optimization guide
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture overview
- **[docs/IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)** - Implementation details

## 📝 Development

### Run in Development Mode
```bash
npm run dev
```

### Environment Variables
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...           # Your OpenAI API key

# Server Configuration
PORT=8080                        # Server port (default: 8080)

# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Project Evolution

**Phase 1: Embeddings & Similarity** ✅
- Single and batch embeddings
- Cosine similarity comparison
- Basic vector operations

**Phase 2: Vector Database** ✅
- Supabase pgvector integration
- Document storage and retrieval
- Semantic search functionality

**Phase 3: LangChain Integration** ✅ (NEW!)
- Production-ready text splitting
- CharacterTextSplitter implementation
- Configurable chunking strategies

**Phase 4: Text Splitter Visualization** ✅ (NEW!)
- Movies demo page
- Interactive chunk configuration
- Real-time processing and search

**Phase 5: RAG Chatbot** ✅ (ENHANCED!)
- Multi-source knowledge base search
- Conversational AI with context
- Source attribution system

## 🚀 Quick Start Guide

### For Embeddings Demo:
1. `npm install`
2. Configure `.env` with OpenAI API key
3. `npm start`
4. Open `http://localhost:8080`

### For Text Splitter Demo:
1. Complete embeddings setup above
2. Set up Supabase and run `sql-setup/movies_table.sql`
3. Run `sql-setup/match_movies.sql`
4. Open `http://localhost:8080/movies.html`
5. Click "🚀 Process & Store Chunks"

### For Chatbot:
1. Complete embeddings setup
2. Set up both database tables (documents + movies)
3. Populate databases with content
4. Open `http://localhost:8080/chat.html`
5. Start asking questions!

For detailed guides, see the `/docs` folder.

## 🤝 Contributing

Part of the Scrimba AI Engineer Course. Feel free to fork and experiment!

## 🎓 Learning Path

This project is perfect for learning:

1. **Start Simple**: Embeddings and similarity (main page)
2. **Add Persistence**: Vector database integration
3. **Scale Up**: Text chunking with LangChain (movies demo)
4. **Build Intelligence**: RAG chatbot with multi-source search

Each feature builds on the previous, creating a complete understanding of modern AI applications.

## 📄 License

See [LICENSE](LICENSE) file for details.

---

*Demonstrating embeddings, vector search, LangChain text processing, and RAG architecture in a production-ready full-stack application.*
