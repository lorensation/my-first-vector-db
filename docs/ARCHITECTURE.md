# 🎬 Movies Text Splitter - System Architecture

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                        (movies.html)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LOGIC                             │
│                       (movies.js)                               │
│                                                                 │
│  • Process Button Handler                                      │
│  • Load Chunks Handler                                         │
│  • Search Handler                                              │
│  • UI State Management                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                              │
│                       (server.js)                               │
│                                                                 │
│  POST /api/movies/process                                      │
│  ├─ Read movies.txt                                           │
│  ├─ Split into chunks (splitTextByCharacter)                 │
│  ├─ Create embeddings (OpenAI)                               │
│  └─ Store in Supabase                                         │
│                                                                 │
│  GET /api/movies                                               │
│  └─ Retrieve all chunks from database                         │
│                                                                 │
│  POST /api/movies/search                                       │
│  ├─ Create query embedding (OpenAI)                          │
│  ├─ Search with match_movies function                        │
│  └─ Return ranked results                                     │
│                                                                 │
│  DELETE /api/movies                                            │
│  └─ Clear all chunks from database                            │
└─────────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
    ┌───────────────────────┐  ┌───────────────────────┐
    │   OPENAI API          │  │   SUPABASE            │
    │                       │  │   (PostgreSQL +       │
    │  text-embedding-      │  │    pgvector)          │
    │  ada-002              │  │                       │
    │                       │  │  • movies table       │
    │  Input: Text string   │  │  • match_movies()     │
    │  Output: 1536-dim     │  │  • Vector indexing    │
    │          vector       │  │                       │
    └───────────────────────┘  └───────────────────────┘
```

## 🔄 Processing Flow

```
movies.txt (Raw Text)
    │
    │  [Step 1: Text Splitting]
    │  • Configurable chunk size
    │  • Configurable overlap
    │  • Smart boundary detection
    │
    ▼
Text Chunks
    │
    │  Example:
    │  Chunk 1: "Oppenheimer: 2023 | R | 3h | 8.6 rating
    │             'Oppenheimer' is an epic biographical drama..."
    │
    │  Chunk 2: "biographical drama film about the story of
    │             American scientist J. Robert Oppenheimer..."
    │
    │  [Step 2: Embedding Creation]
    │  • Parallel API calls to OpenAI
    │  • Each chunk → 1536-dim vector
    │
    ▼
Embeddings (Vectors)
    │
    │  Example:
    │  Chunk 1 → [0.023, -0.015, 0.041, ... ] (1536 dimensions)
    │  Chunk 2 → [-0.012, 0.033, -0.021, ... ] (1536 dimensions)
    │
    │  [Step 3: Database Storage]
    │  • Insert into Supabase movies table
    │  • Vector indexing with IVFFlat
    │
    ▼
Vector Database
    │
    │  Table: movies
    │  ├─ id: bigserial
    │  ├─ content: text
    │  ├─ embedding: vector(1536)
    │  └─ created_at: timestamp
    │
    │  [Step 4: Semantic Search]
    │  • User query → embedding
    │  • Cosine similarity search
    │  • Return top matches
    │
    ▼
Search Results
    │
    │  Ranked by similarity:
    │  1. "Oppenheimer..." (95.3% similar)
    │  2. "Blue Beetle..." (87.2% similar)
    │  3. "Top Gun..." (82.1% similar)
    │
    ▼
User Interface Display
```

## 🧩 Component Breakdown

### Frontend Components

```
movies.html
├─ Header
│  ├─ Title & Description
│  └─ Navigation Links
│
├─ Process Section
│  ├─ Chunk Size Input
│  ├─ Chunk Overlap Input
│  ├─ Process Button
│  ├─ Load Button
│  └─ Clear Button
│
├─ Visualization Section
│  └─ Chunks Container
│     └─ Chunk Cards (dynamically generated)
│        ├─ Chunk ID
│        ├─ Character Count
│        └─ Content Preview
│
├─ Search Section
│  ├─ Query Input
│  ├─ Result Limit Input
│  ├─ Threshold Input
│  ├─ Search Button
│  └─ Results Container
│     └─ Result Cards (dynamically generated)
│        ├─ Rank Number
│        ├─ Similarity Score
│        ├─ Interpretation
│        └─ Content
│
└─ Info Section
   └─ Educational Content (4 steps)
```

### Backend Components

```
server.js
├─ Imports
│  ├─ express
│  ├─ cors
│  ├─ dotenv
│  ├─ fs (for reading movies.txt)
│  └─ path
│
├─ Movies Endpoints
│  ├─ POST /api/movies/process
│  ├─ GET /api/movies
│  ├─ POST /api/movies/search
│  └─ DELETE /api/movies
│
└─ Helper Functions
   ├─ splitTextByCharacter()
   ├─ cosineSimilarity()
   └─ interpretSimilarity()
```

### Database Components

```
Supabase Database
├─ movies (table)
│  ├─ Schema
│  │  ├─ id: bigserial primary key
│  │  ├─ content: text
│  │  ├─ embedding: vector(1536)
│  │  └─ created_at: timestamp
│  │
│  └─ Index
│     └─ IVFFlat on embedding (vector_cosine_ops)
│
└─ match_movies (function)
   ├─ Input
   │  ├─ query_embedding: vector(1536)
   │  ├─ match_threshold: float
   │  └─ match_count: int
   │
   └─ Output
      ├─ id: bigint
      ├─ content: text
      └─ similarity: float
```

## 🎯 Text Splitter Algorithm

```javascript
function splitTextByCharacter(text, chunkSize, chunkOverlap) {
  
  while (not at end of text) {
    
    1. Extract chunk of chunkSize characters
    
    2. Try to break at sentence boundary
       ├─ Look for ". ", "? ", "! "
       └─ If found and reasonable, break there
    
    3. If no sentence boundary:
       ├─ Try word boundary (last space)
       └─ If found and reasonable, break there
    
    4. If no good boundary:
       └─ Use full chunk
    
    5. Add chunk to results
    
    6. Move forward by:
       ├─ (chunk length - overlap)
       └─ This creates overlap between chunks
  }
  
  return chunks;
}
```

## 🔍 Semantic Search Process

```
User Query: "action movies"
    │
    ▼
[Create Query Embedding]
OpenAI API: text-embedding-ada-002
    │
    ▼
Query Vector: [0.045, -0.023, 0.067, ...]
    │
    ▼
[Supabase RPC: match_movies]
Calculate: similarity = 1 - cosine_distance
    │
    ▼
Filter: similarity > threshold
    │
    ▼
Sort: by similarity DESC
    │
    ▼
Limit: top N results
    │
    ▼
Return: id, content, similarity
    │
    ▼
[Frontend Processing]
Add interpretation
Format percentage
    │
    ▼
Display ranked results to user
```

## 💾 Data Storage

```
movies.txt (Source)
    ↓
Chunks in Memory (Temporary)
    ↓
Chunks in Supabase (Persistent)
    │
    ├─ Content: Searchable text
    ├─ Embedding: 1536-dim vector
    └─ Metadata: id, created_at
```

## 🎨 UI States

```
1. Initial State
   ├─ Empty chunks container
   └─ "Process movies.txt" message

2. Loading State (Processing)
   ├─ Spinner animation
   ├─ "Processing..." message
   └─ Disabled buttons

3. Success State (Processed)
   ├─ Chunks displayed in grid
   ├─ Success message with count
   └─ Enabled search functionality

4. Search Loading State
   ├─ Spinner animation
   └─ "Searching..." message

5. Search Results State
   ├─ Results displayed
   ├─ Similarity scores shown
   └─ Ranked by relevance

6. Error State
   ├─ Red error message
   └─ Suggested fixes
```

## 🔗 Integration Points

```
movies.html ←→ movies.js ←→ server.js
                             ├─→ OpenAI API
                             └─→ Supabase
                                 ├─ movies table
                                 └─ match_movies function
```

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable data flow
- ✅ Efficient vector search
- ✅ Responsive UI updates
- ✅ Comprehensive error handling
