-- Enable the pgvector extension (if not already enabled)
-- This should be done in Supabase Dashboard > Database > Extensions

-- Create a function to search for similar movies using vector similarity
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

-- Example usage:
-- SELECT * FROM match_movies(
--   '[0.1, 0.2, ...]'::vector(1536),
--   0.5,
--   5
-- );

-- Note: The <=> operator is the cosine distance operator from pgvector
-- Similarity = 1 - cosine_distance
-- Higher similarity values (closer to 1) mean more similar movie chunks

