# 🚀 Quick Start Guide - Movies Text Splitter

## Prerequisites
- ✅ Node.js installed
- ✅ Supabase account with database set up
- ✅ OpenAI API key
- ✅ Environment variables configured (.env file)

## 🔥 Quick Setup (5 minutes)

### Step 1: Database Setup
Open your Supabase SQL Editor and run these two SQL files:

**1. Create the movies table:**
```sql
-- Copy and paste from: movies_table.sql
create table movies (
  id bigserial primary key,
  content text,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on movies using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

**2. Create the search function:**
```sql
-- Copy and paste from: match_movies.sql
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

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
🚀 Server is running on http://localhost:8080
...
🎬 Movies (Text Splitter Demo):
  🎬 Process Movies: POST /api/movies/process
  📋 Get Movie Chunks: GET /api/movies
  🔎 Search Movies: POST /api/movies/search
...
📄 Pages:
  ...
  🎬 Movies Text Splitter: http://localhost:8080/movies.html
```

### Step 3: Open the Page
Navigate to: **http://localhost:8080/movies.html**

### Step 4: Process the Movies
1. Keep default settings (Chunk Size: 200, Overlap: 50)
2. Click **"🚀 Process & Store Chunks"**
3. Wait ~10-20 seconds (creating embeddings for all chunks)
4. See the chunks appear in the visualization area!

### Step 5: Try a Search
1. Type a query like: **"action movies"**
2. Click **"🔎 Search"**
3. See the results ranked by similarity!

## 🎮 Try These Queries

- "superhero movies" → Finds Blue Beetle, etc.
- "comedy with family" → Finds Barbie, Elemental
- "mystery and detective" → Finds Glass Onion
- "animated films" → Finds Elemental, Super Mario Bros
- "World War II" → Finds Oppenheimer
- "Christopher Nolan" → Finds Oppenheimer
- "Tom Cruise" → Finds Top Gun: Maverick

## 🎨 Features to Explore

### Adjust Chunk Size
- **Small (100-150)**: More granular, specific matches
- **Medium (200-300)**: Balanced context and precision
- **Large (400-600)**: More context per chunk

### Adjust Overlap
- **No overlap (0)**: Completely independent chunks
- **Small (20-50)**: Slight context preservation
- **Medium (50-100)**: Good context preservation
- **Large (100+)**: Maximum context, more redundancy

### Adjust Search Threshold
- **Low (0.3-0.5)**: More results, less strict matching
- **Medium (0.5-0.7)**: Balanced quality and quantity
- **High (0.7-0.9)**: Fewer results, very strict matching

## 🐛 Troubleshooting

### Error: "Database function match_movies not found"
**Solution:** Run the SQL from `match_movies.sql` in Supabase SQL Editor

### Error: "Failed to process movies"
**Solutions:**
- Check OpenAI API key in `.env` file
- Verify Supabase credentials
- Ensure the `movies` table exists

### No chunks showing up
**Solutions:**
- Click "Load Existing Chunks" button
- Check browser console for errors
- Verify server is running on port 8080

### Search returns no results
**Solutions:**
- Lower the similarity threshold (try 0.3)
- Use broader search terms
- Ensure chunks were processed successfully

## 📚 What You're Learning

This demo teaches you about:

1. **Text Splitters** → How to break large documents into chunks
2. **Embeddings** → Converting text to semantic vectors
3. **Vector Databases** → Storing and indexing embeddings
4. **Semantic Search** → Finding content by meaning, not keywords
5. **RAG Systems** → Foundation for retrieval-augmented generation

## 🔗 Related Pages

- 🔢 **Embeddings Demo** → `index.html` - Learn about embeddings
- 💬 **Chatbot** → `chat.html` - AI chat interface
- 🎬 **Text Splitters** → `movies.html` - This page!

## 📖 Documentation

- **MOVIES_README.md** → Detailed documentation
- **IMPLEMENTATION_SUMMARY.md** → Technical overview
- **README.md** → Main project documentation

## ✨ Tips for Best Results

1. **Start with defaults** (200/50) to see how it works
2. **Try different chunk sizes** to see how it affects results
3. **Experiment with queries** - try specific vs. general terms
4. **Check similarity scores** - higher = more relevant
5. **Use the "interpretation"** to understand match quality

---

**Ready to explore text splitters!** 🎬✨

If you have questions, check the documentation files or the browser console for detailed logs.
