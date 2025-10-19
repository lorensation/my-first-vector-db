import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import openai from './config.js';

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
 * Calculate cosine similarity between two vectors
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
  console.log(`📊 Embeddings API: http://localhost:${PORT}/api/embeddings`);
  console.log(`🔍 Compare API: http://localhost:${PORT}/api/compare-embeddings`);
});
