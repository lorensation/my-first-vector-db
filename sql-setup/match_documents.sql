-- Enable the pgvector extension (if not already enabled)
-- This should be done in Supabase Dashboard > Database > Extensions

-- Create a function to search for similar documents using vector similarity
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

-- Example usage:
-- SELECT * FROM match_documents(
--   '[0.1, 0.2, ...]'::vector(1536),
--   0.5,
--   5
-- );

-- Note: The <=> operator is the cosine distance operator from pgvector
-- Similarity = 1 - cosine_distance
-- Higher similarity values (closer to 1) mean more similar documents
