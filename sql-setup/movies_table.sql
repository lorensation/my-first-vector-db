-- Create a table to store movie text chunks with embeddings
-- This table will store the split chunks from movies.txt

create table movies (
  id bigserial primary key,
  content text, -- the text chunk from movies.txt
  embedding vector(1536), -- 1536 works for OpenAI embeddings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on the embedding column for faster similarity searches
-- This uses the ivfflat indexing method which is optimized for vector similarity
create index on movies using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Note: Run this SQL in your Supabase SQL Editor to create the movies table
