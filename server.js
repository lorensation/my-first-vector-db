import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { openai, supabase } from './config.js';
import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

/**
 * POST /api/embeddings
 * Create embeddings for the provided text input
 * Body: { text: string }
 */
app.post('/api/embeddings', async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide a non-empty text string.' 
      });
    }

    // Create embedding using OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.trim(),
    });

    // Return the embedding data
    res.json({
      success: true,
      text: text.trim(),
      embedding: embedding.data[0].embedding,
      dimensions: embedding.data[0].embedding.length,
      model: "text-embedding-ada-002"
    });

  } catch (error) {
    console.error('Error creating embedding:', error);
    res.status(500).json({ 
      error: 'Failed to create embedding',
      message: error.message 
    });
  }
});

/**
 * POST /api/compare-embeddings
 * Compare similarity between two text inputs using cosine similarity
 * Body: { text1: string, text2: string }
 */
app.post('/api/compare-embeddings', async (req, res) => {
  try {
    const { text1, text2 } = req.body;

    // Validate inputs
    if (!text1 || !text2 || typeof text1 !== 'string' || typeof text2 !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide two non-empty text strings.' 
      });
    }

    // Create embeddings for both texts
    const [embedding1, embedding2] = await Promise.all([
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text1.trim(),
      }),
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text2.trim(),
      })
    ]);

    const vector1 = embedding1.data[0].embedding;
    const vector2 = embedding2.data[0].embedding;

    // Calculate cosine similarity
    const similarity = cosineSimilarity(vector1, vector2);

    res.json({
      success: true,
      text1: text1.trim(),
      text2: text2.trim(),
      similarity: similarity,
      similarityPercentage: (similarity * 100).toFixed(2) + '%',
      interpretation: interpretSimilarity(similarity)
    });

  } catch (error) {
    console.error('Error comparing embeddings:', error);
    res.status(500).json({ 
      error: 'Failed to compare embeddings',
      message: error.message 
    });
  }
});

/**
 * POST /api/batch-embeddings
 * Create embeddings for multiple texts at once
 * Body: { texts: string[] }
 */
app.post('/api/batch-embeddings', async (req, res) => {
  try {
    const { texts } = req.body;

    // Validate input
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide a non-empty array of text strings.' 
      });
    }

    // Filter out empty strings
    const validTexts = texts.filter(text => 
      typeof text === 'string' && text.trim().length > 0
    );

    if (validTexts.length === 0) {
      return res.status(400).json({ 
        error: 'No valid text strings found in the array.' 
      });
    }

    // Create embeddings for all texts in parallel
    const embeddingPromises = validTexts.map(text => 
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text.trim(),
      })
    );

    const embeddingResponses = await Promise.all(embeddingPromises);

    // Pair each text with its embedding
    const results = validTexts.map((text, index) => ({
      content: text.trim(),
      embedding: embeddingResponses[index].data[0].embedding,
      dimensions: embeddingResponses[index].data[0].embedding.length
    }));

    res.json({
      success: true,
      count: results.length,
      results: results,
      model: "text-embedding-ada-002"
    });

  } catch (error) {
    console.error('Error creating batch embeddings:', error);
    res.status(500).json({ 
      error: 'Failed to create batch embeddings',
      message: error.message 
    });
  }
});

/**
 * POST /api/store-embeddings
 * Create embeddings and store them in Supabase
 * Body: { texts: string[] } or { useContentFile: boolean }
 */
app.post('/api/store-embeddings', async (req, res) => {
  try {
    let textsToProcess = [];

    // Check if using content.js file or user input
    if (req.body.useContentFile) {
      // Import content.js dynamically
      const contentModule = await import('./content.js');
      textsToProcess = contentModule.default;
      
      // Validate the imported data
      if (!Array.isArray(textsToProcess)) {
        throw new Error('content.js must export an array of strings');
      }
    } else if (req.body.texts && Array.isArray(req.body.texts)) {
      textsToProcess = req.body.texts;
    } else {
      return res.status(400).json({ 
        error: 'Invalid input. Provide either "texts" array or "useContentFile: true".' 
      });
    }

    // Filter out empty strings
    const validTexts = textsToProcess.filter(text => 
      typeof text === 'string' && text.trim().length > 0
    );

    if (validTexts.length === 0) {
      return res.status(400).json({ 
        error: 'No valid text strings found.' 
      });
    }

    console.log(`📝 Processing ${validTexts.length} texts for embedding and storage...`);

    // Create embeddings for all texts in parallel
    const embeddingPromises = validTexts.map(text => 
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text.trim(),
      })
    );

    const embeddingResponses = await Promise.all(embeddingPromises);

    // Prepare data for Supabase insertion
    const documentsToInsert = validTexts.map((text, index) => ({
      content: text.trim(),
      embedding: embeddingResponses[index].data[0].embedding
    }));

    console.log(`💾 Inserting ${documentsToInsert.length} documents into Supabase...`);

    // Insert into Supabase documents table
    const { data: insertedData, error: insertError } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select();

    if (insertError) {
      console.error('Supabase insertion error:', insertError);
      throw new Error(`Database insertion failed: ${insertError.message}`);
    }

    console.log(`✅ Successfully stored ${insertedData.length} documents in Supabase`);

    res.json({
      success: true,
      count: insertedData.length,
      inserted: insertedData.map(doc => ({
        id: doc.id,
        content: doc.content,
        hasEmbedding: !!doc.embedding
      })),
      message: `Successfully stored ${insertedData.length} embeddings in Supabase`
    });

  } catch (error) {
    console.error('Error storing embeddings:', error);
    res.status(500).json({ 
      error: 'Failed to store embeddings',
      message: error.message 
    });
  }
});

/**
 * GET /api/documents
 * Retrieve all documents from Supabase
 * Query params: limit (default 50), offset (default 0)
 */
app.get('/api/documents', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const { data, error, count } = await supabase
      .from('documents')
      .select('id, content', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('id', { ascending: false });

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    res.json({
      success: true,
      count: data.length,
      total: count,
      documents: data,
      pagination: {
        limit,
        offset,
        hasMore: count > (offset + limit)
      }
    });

  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve documents',
      message: error.message 
    });
  }
});

/**
 * POST /api/search-similar
 * Search for similar documents using vector similarity (Supabase native)
 * Body: { 
 *   query: string, 
 *   limit: number (optional, default 5),
 *   threshold: number (optional, default 0.5, range 0-1)
 * }
 */
app.post('/api/search-similar', async (req, res) => {
  try {
    const { query, limit = 5, threshold = 0.5 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide a non-empty query string.' 
      });
    }

    // Validate threshold
    const matchThreshold = Math.max(0, Math.min(1, threshold));
    const matchCount = Math.max(1, Math.min(50, limit));

    console.log(`🔍 Searching for documents similar to: "${query}" (threshold: ${matchThreshold}, limit: ${matchCount})`);

    // Create embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Use Supabase's RPC function for native pgvector similarity search
    // This is much faster and more efficient than fetching all documents
    const { data: results, error } = await supabase
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      });

    if (error) {
      // If the function doesn't exist, provide helpful error message
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        throw new Error(
          'Database function "match_documents" not found. ' +
          'Please run the SQL from "match_documents.sql" in your Supabase SQL Editor. ' +
          'See SUPABASE_INTEGRATION.md for setup instructions.'
        );
      }
      throw new Error(`Database query failed: ${error.message}`);
    }

    console.log(`✅ Found ${results.length} similar documents`);

    res.json({
      success: true,
      query: query.trim(),
      count: results.length,
      threshold: matchThreshold,
      results: results.map(r => ({
        id: r.id,
        content: r.content,
        similarity: r.similarity,
        similarityPercentage: (r.similarity * 100).toFixed(2) + '%',
        interpretation: interpretSimilarity(r.similarity)
      }))
    });

  } catch (error) {
    console.error('Error searching similar documents:', error);
    res.status(500).json({ 
      error: 'Failed to search similar documents',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/documents
 * Delete all documents from Supabase (use with caution!)
 */
app.delete('/api/documents', async (req, res) => {
  try {
    const { confirm } = req.query;

    if (confirm !== 'true') {
      return res.status(400).json({ 
        error: 'Confirmation required. Add ?confirm=true to delete all documents.' 
      });
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .neq('id', 0); // Delete all records

    if (error) {
      throw new Error(`Database deletion failed: ${error.message}`);
    }

    console.log('🗑️ All documents deleted from Supabase');

    res.json({
      success: true,
      message: 'All documents deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting documents:', error);
    res.status(500).json({ 
      error: 'Failed to delete documents',
      message: error.message 
    });
  }
});

/**
 * POST /api/movies/process
 * Split movies.txt content using text splitter and store with embeddings
 * Body: { 
 *   chunkSize: number (optional, default 200),
 *   chunkOverlap: number (optional, default 50)
 * }
 */
app.post('/api/movies/process', async (req, res) => {
  try {
    const { chunkSize = 200, chunkOverlap = 50 } = req.body;

    console.log(`🎬 Processing movies.txt with chunkSize=${chunkSize}, chunkOverlap=${chunkOverlap}`);

    // Read movies.txt file
    const filePath = path.join(process.cwd(), 'movies.txt');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Use LangChain's CharacterTextSplitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize,
      chunkOverlap: chunkOverlap,
    });
    
    const chunks = await textSplitter.splitText(content);

    console.log(`📝 Split text into ${chunks.length} chunks`);

    // Create embeddings for all chunks
    const embeddingPromises = chunks.map(chunk => 
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      })
    );

    const embeddingResponses = await Promise.all(embeddingPromises);

    // Prepare data for Supabase insertion
    const moviesToInsert = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddingResponses[index].data[0].embedding
    }));

    console.log(`💾 Inserting ${moviesToInsert.length} movie chunks into Supabase...`);

    // Insert into Supabase movies table
    const { data: insertedData, error: insertError } = await supabase
      .from('movies')
      .insert(moviesToInsert)
      .select();

    if (insertError) {
      console.error('Supabase insertion error:', insertError);
      throw new Error(`Database insertion failed: ${insertError.message}`);
    }

    console.log(`✅ Successfully stored ${insertedData.length} movie chunks in Supabase`);

    res.json({
      success: true,
      count: insertedData.length,
      chunkSize,
      chunkOverlap,
      chunks: insertedData.map(doc => ({
        id: doc.id,
        content: doc.content,
        hasEmbedding: !!doc.embedding
      })),
      message: `Successfully processed and stored ${insertedData.length} movie chunks`
    });

  } catch (error) {
    console.error('Error processing movies:', error);
    res.status(500).json({ 
      error: 'Failed to process movies',
      message: error.message 
    });
  }
});

/**
 * GET /api/movies
 * Retrieve all movie chunks from Supabase
 * Query params: limit (default 50), offset (default 0)
 */
app.get('/api/movies', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const { data, error, count } = await supabase
      .from('movies')
      .select('id, content', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    res.json({
      success: true,
      count: data.length,
      total: count,
      movies: data,
      pagination: {
        limit,
        offset,
        hasMore: count > (offset + limit)
      }
    });

  } catch (error) {
    console.error('Error retrieving movies:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve movies',
      message: error.message 
    });
  }
});

/**
 * POST /api/movies/search
 * Search for similar movie chunks using vector similarity
 * Body: { 
 *   query: string, 
 *   limit: number (optional, default 5),
 *   threshold: number (optional, default 0.5, range 0-1)
 * }
 */
app.post('/api/movies/search', async (req, res) => {
  try {
    const { query, limit = 5, threshold = 0.5 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide a non-empty query string.' 
      });
    }

    // Validate threshold
    const matchThreshold = Math.max(0, Math.min(1, threshold));
    const matchCount = Math.max(1, Math.min(50, limit));

    console.log(`🔍 Searching for movies similar to: "${query}" (threshold: ${matchThreshold}, limit: ${matchCount})`);

    // Create embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Use Supabase's RPC function for native pgvector similarity search
    const { data: results, error } = await supabase
      .rpc('match_movies', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      });

    if (error) {
      // If the function doesn't exist, provide helpful error message
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        throw new Error(
          'Database function "match_movies" not found. ' +
          'Please run the SQL from "match_movies.sql" in your Supabase SQL Editor.'
        );
      }
      throw new Error(`Database query failed: ${error.message}`);
    }

    console.log(`✅ Found ${results.length} similar movie chunks`);

    res.json({
      success: true,
      query: query.trim(),
      count: results.length,
      threshold: matchThreshold,
      results: results.map(r => ({
        id: r.id,
        content: r.content,
        similarity: r.similarity,
        similarityPercentage: (r.similarity * 100).toFixed(2) + '%',
        interpretation: interpretSimilarity(r.similarity)
      }))
    });

  } catch (error) {
    console.error('Error searching similar movies:', error);
    res.status(500).json({ 
      error: 'Failed to search similar movies',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/movies
 * Delete all movie chunks from Supabase (use with caution!)
 */
app.delete('/api/movies', async (req, res) => {
  try {
    const { confirm } = req.query;

    if (confirm !== 'true') {
      return res.status(400).json({ 
        error: 'Confirmation required. Add ?confirm=true to delete all movies.' 
      });
    }

    const { error } = await supabase
      .from('movies')
      .delete()
      .neq('id', 0); // Delete all records

    if (error) {
      throw new Error(`Database deletion failed: ${error.message}`);
    }

    console.log('🗑️ All movie chunks deleted from Supabase');

    res.json({
      success: true,
      message: 'All movie chunks deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting movies:', error);
    res.status(500).json({ 
      error: 'Failed to delete movies',
      message: error.message 
    });
  }
});

/**
 * POST /api/chat
 * Chat completions endpoint using GPT-3.5-turbo
 * Body: { messages: array of message objects }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide an array of messages.' 
      });
    }

    console.log(`💬 Processing chat completion with ${messages.length} messages...`);

    // Call OpenAI Chat Completions API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0].message.content;

    console.log(`✅ Chat completion generated successfully`);

    res.json({
      success: true,
      message: assistantMessage,
      model: "gpt-3.5-turbo",
      usage: {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      }
    });

  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({ 
      error: 'Failed to generate chat response',
      message: error.message 
    });
  }
});

/**
 * POST /api/chat/search-all
 * Search both movies and podcasts tables for relevant context
 * Body: { 
 *   query: string,
 *   limit: number (optional, default 3 per table),
 *   threshold: number (optional, default 0.3)
 * }
 */
app.post('/api/chat/search-all', async (req, res) => {
  try {
    const { query, limit = 3, threshold = 0.3 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input. Please provide a non-empty query string.' 
      });
    }

    const matchThreshold = Math.max(0, Math.min(1, threshold));
    const matchCount = Math.max(1, Math.min(10, limit));

    console.log(`🔍 Searching all tables for: "${query}" (threshold: ${matchThreshold}, limit: ${matchCount})`);

    // Create embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search both tables in parallel
    const [podcastResults, movieResults] = await Promise.all([
      supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      }),
      supabase.rpc('match_movies', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      })
    ]);

    // Process podcast results
    const podcasts = (podcastResults.data || []).map(r => ({
      id: r.id,
      content: r.content,
      similarity: r.similarity,
      source: 'podcast',
      similarityPercentage: (r.similarity * 100).toFixed(2) + '%'
    }));

    // Process movie results
    const movies = (movieResults.data || []).map(r => ({
      id: r.id,
      content: r.content,
      similarity: r.similarity,
      source: 'movie',
      similarityPercentage: (r.similarity * 100).toFixed(2) + '%'
    }));

    // Combine and sort by similarity
    const allResults = [...podcasts, ...movies]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, matchCount * 2); // Get top results from both

    console.log(`✅ Found ${podcasts.length} podcasts and ${movies.length} movies`);

    res.json({
      success: true,
      query: query.trim(),
      totalCount: allResults.length,
      podcastCount: podcasts.length,
      movieCount: movies.length,
      results: allResults,
      podcasts: podcasts,
      movies: movies
    });

  } catch (error) {
    console.error('Error searching all tables:', error);
    res.status(500).json({ 
      error: 'Failed to search knowledge base',
      message: error.message 
    });
  }
});

/**
 * Calculate cosine similarity between two vectors
 * Used for client-side comparison without database
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Interpret similarity score
 */
function interpretSimilarity(score) {
  if (score >= 0.95) return 'Very High - Nearly identical meaning';
  if (score >= 0.85) return 'High - Very similar meaning';
  if (score >= 0.70) return 'Moderate - Related concepts';
  if (score >= 0.50) return 'Low - Somewhat related';
  return 'Very Low - Different concepts';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`  📊 Single Embedding: POST /api/embeddings`);
  console.log(`  🔍 Compare Texts: POST /api/compare-embeddings`);
  console.log(`  📚 Batch Embeddings: POST /api/batch-embeddings`);
  console.log(`\n💾 Supabase Integration:`);
  console.log(`  💿 Store Embeddings: POST /api/store-embeddings`);
  console.log(`  📋 Get Documents: GET /api/documents`);
  console.log(`  🔎 Search Similar: POST /api/search-similar`);
  console.log(`  🗑️  Delete All: DELETE /api/documents?confirm=true`);
  console.log(`\n🎬 Movies (Text Splitter Demo):`);
  console.log(`  🎬 Process Movies: POST /api/movies/process`);
  console.log(`  📋 Get Movie Chunks: GET /api/movies`);
  console.log(`  🔎 Search Movies: POST /api/movies/search`);
  console.log(`  🗑️  Delete All Movies: DELETE /api/movies?confirm=true`);
  console.log(`\n🤖 AI Chat:`);
  console.log(`  💬 Chat Completions: POST /api/chat`);
  console.log(`  🔎 Search All Knowledge: POST /api/chat/search-all`);
  console.log(`\n✅ Health Check: GET /api/health`);
  console.log(`\n📄 Pages:`);
  console.log(`  🏠 Embeddings Demo: http://localhost:${PORT}/index.html`);
  console.log(`  💬 Chatbot: http://localhost:${PORT}/chat.html`);
  console.log(`  🎬 Movies Text Splitter: http://localhost:${PORT}/movies.html`);
});
