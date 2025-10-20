# 💾 Supabase Vector Database Integration

## Overview

This project now includes full integration with Supabase to store and search vector embeddings using PostgreSQL with the pgvector extension.

## 🎯 Features

1. **Store Embeddings** - Generate and save embeddings to Supabase
2. **Semantic Search** - Find similar documents using vector similarity
3. **Database Management** - View and manage stored documents
4. **Batch Processing** - Store multiple embeddings in parallel

## 📊 Database Schema

```sql
-- Table: documents
create table documents (
  id bigserial primary key,
  content text,                -- Original text content
  embedding vector(1536)       -- OpenAI embedding (1536 dimensions)
);
```

## 🚀 Setup Instructions

### 1. Supabase Configuration

Your `.env` file already contains:
```env
SUPABASE_URL=https://ulhqasmicitdusumybgb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Enable pgvector Extension

In your Supabase dashboard:
1. Go to **Database** → **Extensions**
2. Search for `vector`
3. Enable the `vector` extension

### 3. Create the Table

Run the SQL from `tables.sql` in your Supabase SQL Editor:
```sql
create table documents (
  id bigserial primary key,
  content text,
  embedding vector(1536)
);
```

### 4. **REQUIRED** - Create Similarity Search Function

For native pgvector similarity search, create this function in Supabase SQL Editor:

```sql
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

**This function is required for the search endpoint to work!**

See `SETUP_VECTOR_SEARCH.md` for detailed setup instructions.

## 🔧 API Endpoints

### POST `/api/store-embeddings`

Store embeddings in Supabase database.

**Option 1: Use content.js file**
```json
{
  "useContentFile": true
}
```

**Option 2: Use custom texts**
```json
{
  "texts": [
    "First document to store",
    "Second document to store"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "inserted": [
    {
      "id": 1,
      "content": "First document to store",
      "hasEmbedding": true
    }
  ],
  "message": "Successfully stored 2 embeddings in Supabase"
}
```

### POST `/api/search-similar`

Search for similar documents using native pgvector similarity search.

**Request:**
```json
{
  "query": "space exploration",
  "limit": 5,
  "threshold": 0.5
}
```

**Parameters:**
- `query` (required) - Search text
- `limit` (optional, default: 5, max: 50) - Number of results
- `threshold` (optional, default: 0.5, range: 0-1) - Minimum similarity score

**Response:**
```json
{
  "success": true,
  "query": "space exploration",
  "count": 3,
  "threshold": 0.5,
  "results": [
    {
      "id": 1,
      "content": "Beyond Mars: speculating life on distant planets.",
      "similarity": 0.89,
      "similarityPercentage": "89.00%",
      "interpretation": "High - Very similar meaning"
    }
  ]
}
```

**Note:** This endpoint uses Supabase's native `match_documents` function for optimal performance.

### GET `/api/documents`

Retrieve stored documents (without embeddings for performance).

**Query Parameters:**
- `limit` (default: 50) - Number of documents to return
- `offset` (default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 10,
  "documents": [
    {
      "id": 1,
      "content": "Document text..."
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### DELETE `/api/documents?confirm=true`

Delete all documents from the database.

**⚠️ WARNING**: This action is irreversible!

**Response:**
```json
{
  "success": true,
  "message": "All documents deleted successfully"
}
```

## 🎨 Frontend Usage

### Store Embeddings

**Option 1: Store content.js**
```javascript
// Click "Store Content.js (10 podcasts)" button
// This stores all podcast descriptions from content.js
```

**Option 2: Store Custom Batch**
```javascript
// 1. Enter texts in "Batch Embeddings" section
// 2. Click "Store Custom Batch" in Database section
// Stores whatever is in the batch textarea
```

### Search Similar Documents

```javascript
// 1. Enter search query (e.g., "space exploration")
// 2. Set number of results (1-20)
// 3. Click "Search Similar"
// Returns most similar documents ranked by similarity
```

### View All Documents

```javascript
// Click "View All Documents" to see all stored content
// Shows ID and content (embeddings not displayed for performance)
```

### Delete All Documents

```javascript
// Click "Delete All Documents"
// Requires double confirmation
// Permanently removes all data
```

## 🔍 How Semantic Search Works

1. **User enters query**: "jazz music"

2. **Generate query embedding**:
   ```javascript
   const queryEmbedding = await openai.embeddings.create({
     model: "text-embedding-ada-002",
     input: "jazz music"
   });
   ```

3. **Calculate similarity with all documents**:
   ```javascript
   // Cosine similarity between query and each document
   similarity = cosineSimilarity(queryEmbedding, documentEmbedding);
   ```

4. **Rank and return top matches**:
   ```javascript
   // Sort by similarity (highest first)
   // Return top N results
   ```

## 📈 Performance Considerations

### Current Implementation
- Fetches all documents and calculates similarity in JavaScript
- Works well for small to medium datasets (< 1000 documents)
- Simple to implement and understand

### Production Optimization

For larger datasets, use Supabase's pgvector operators:

```sql
-- Use built-in vector operators
SELECT id, content, 
  1 - (embedding <=> query_embedding) as similarity
FROM documents
ORDER BY embedding <=> query_embedding
LIMIT 10;
```

**Operators:**
- `<=>` - Cosine distance (recommended)
- `<->` - Euclidean distance
- `<#>` - Inner product

## 🛡️ Security Features

1. **Service Role Key**: Used for server-side operations
2. **No Client Exposure**: Supabase keys never sent to browser
3. **Input Validation**: All inputs validated before processing
4. **Error Handling**: Graceful error messages without leaking sensitive data

## 💡 Example Use Cases

### 1. Podcast Search Engine
```javascript
// Store all podcast descriptions
POST /api/store-embeddings
{ "useContentFile": true }

// Search for episodes about AI
POST /api/search-similar
{ "query": "artificial intelligence ethics", "limit": 3 }
```

### 2. Document Similarity
```javascript
// Store multiple documents
POST /api/store-embeddings
{ "texts": ["Doc1...", "Doc2...", "Doc3..."] }

// Find similar documents
POST /api/search-similar
{ "query": "specific topic", "limit": 5 }
```

### 3. Content Recommendation
```javascript
// Given user's interest
const query = "ocean exploration documentaries";

// Find related content
POST /api/search-similar
{ "query": query, "limit": 10 }
```

## 🐛 Troubleshooting

### Error: "Database insertion failed"
- Check if `documents` table exists in Supabase
- Verify pgvector extension is enabled
- Check Supabase credentials in `.env`

### Error: "Cannot connect to Supabase"
- Verify `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is valid
- Ensure Supabase project is active

### Slow Search Performance
- Current implementation fetches all documents
- For large datasets (>1000), implement pgvector search function
- Add indexes on the embedding column

## 📚 Resources

- [Supabase Vector Documentation](https://supabase.com/docs/guides/ai/vector-columns)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Cosine Similarity Explained](https://en.wikipedia.org/wiki/Cosine_similarity)

## 🎯 Next Steps

1. ✅ Store sample data (content.js)
2. ✅ Test semantic search
3. 🔄 Implement pgvector search function (optional)
4. 🔄 Add indexes for better performance (optional)
5. 🔄 Implement pagination for large result sets (optional)

---

**Happy Vector Searching! 🚀**
