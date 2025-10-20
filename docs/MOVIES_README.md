# Movies Text Splitter Demo

This feature demonstrates how text splitters work with embeddings and vector databases using the movies.txt file.

## 🎯 What This Does

1. **Text Splitting**: Breaks down the movies.txt content into smaller, manageable chunks
2. **Embeddings**: Creates vector embeddings for each text chunk using OpenAI's API
3. **Vector Database**: Stores chunks and embeddings in Supabase with pgvector
4. **Semantic Search**: Enables similarity search to find relevant movie content

## 📋 Setup Instructions

### 1. Create the Database Table

Run the SQL from `movies_table.sql` in your Supabase SQL Editor:

```sql
-- This creates the movies table with vector support
create table movies (
  id bigserial primary key,
  content text,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster searches
create index on movies using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

### 2. Create the Search Function

Run the SQL from `match_movies.sql` in your Supabase SQL Editor:

```sql
-- This creates the semantic search function
create or replace function match_movies (
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
    movies.id,
    movies.content,
    1 - (movies.embedding <=> query_embedding) as similarity
  from movies
  where 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

### 3. Start the Server

```bash
npm start
```

### 4. Open the Movies Page

Navigate to: `http://localhost:8080/movies.html`

## 🎮 How to Use

### Step 1: Process Movies Text

1. Set your desired **Chunk Size** (default: 200 characters)
2. Set your desired **Chunk Overlap** (default: 50 characters)
3. Click **"🚀 Process & Store Chunks"**

This will:
- Read the movies.txt file
- Split it into chunks based on your settings
- Create embeddings for each chunk
- Store everything in Supabase

### Step 2: Visualize Text Chunks

After processing, you'll see all the chunks displayed as cards showing:
- Chunk ID
- Character count
- The actual text content

You can also click **"📋 Load Existing Chunks"** to reload chunks from the database.

### Step 3: Search Similar Content

1. Enter a search query (e.g., "action movies", "comedy about family")
2. Set the number of results you want (1-20)
3. Set the similarity threshold (0-1, higher = more strict)
4. Click **"🔎 Search"**

The results will show:
- Similarity percentage
- Interpretation of the match quality
- The matching text content

## 🔧 API Endpoints

### Process Movies
```
POST /api/movies/process
Body: { chunkSize: 200, chunkOverlap: 50 }
```

### Get Movie Chunks
```
GET /api/movies?limit=100&offset=0
```

### Search Movies
```
POST /api/movies/search
Body: { query: "action movies", limit: 5, threshold: 0.5 }
```

### Delete All Movies
```
DELETE /api/movies?confirm=true
```

## 📊 Understanding Text Splitters

### Chunk Size
- **Smaller chunks** (100-200): More granular, better for specific searches
- **Larger chunks** (500-1000): More context, better for general searches

### Chunk Overlap
- **No overlap** (0): Completely separate chunks
- **Small overlap** (20-50): Some context preservation
- **Large overlap** (100+): Significant context preservation but more redundancy

### Why Use Text Splitters?

1. **Token Limits**: Language models have input size limits
2. **Precision**: Smaller chunks = more precise search results
3. **Cost**: Smaller chunks = less tokens to process
4. **Context**: Overlap preserves context across boundaries

## 🎓 Learning Resources

- **Text Splitters**: How to break down large documents
- **Embeddings**: Converting text to numerical vectors
- **Vector Databases**: Storing and searching embeddings efficiently
- **Semantic Search**: Finding similar content by meaning, not just keywords

## 🛠️ Troubleshooting

### "Database function match_movies not found"
- Make sure you ran the SQL from `match_movies.sql` in Supabase

### "Failed to process movies"
- Check your OpenAI API key in `.env`
- Ensure Supabase credentials are correct
- Make sure the movies table exists

### No results found
- Try lowering the similarity threshold
- Use more general search terms
- Ensure chunks were processed and stored

## 🚀 Next Steps

Try experimenting with:
- Different chunk sizes and overlaps
- Various search queries
- Different similarity thresholds
- Adding your own text files

Enjoy exploring text splitters, embeddings, and vector search! 🎬✨
