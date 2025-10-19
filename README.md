# 🔢 OpenAI Embeddings Showcase

A secure, full-stack web application demonstrating OpenAI's text embeddings API with semantic similarity comparison. Built following best practices for API key security.

## ✨ Features

- **📝 Single Text Embedding**: Generate vector embeddings for any text input
- **🔍 Semantic Similarity**: Compare two texts and visualize their similarity
- **📊 Interactive UI**: Modern, responsive interface with real-time results
- **🎨 Visual Feedback**: Color-coded similarity scores and progress bars
- **💡 Example Comparisons**: Pre-loaded examples to explore embeddings

## 🏗️ Architecture

### Security-First Design

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│  Express.js │────────▶│   OpenAI    │
│  (Frontend) │  HTTP   │  (Backend)  │   API   │     API     │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │  .env    │
                        │ API Key  │
                        └──────────┘
```

**Why this approach?**
- ✅ API key stored server-side in `.env` file
- ✅ Never transmitted to browser
- ✅ Backend acts as secure proxy
- ✅ Follows OpenAI's security best practices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Verify your `.env` file**:
   Ensure your `.env` file contains:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=8080
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:8080`

## 📖 Usage

### Generate Single Embedding

1. Enter any text in the first section
2. Click "Generate Embedding"
3. View the resulting 1536-dimensional vector

### Compare Text Similarity

1. Enter two texts to compare
2. Click "Compare Similarity"
3. See the cosine similarity score and interpretation

### Try Examples

Click any example button to auto-fill comparison texts and see how different concepts relate.

## 🔧 API Endpoints

### POST `/api/embeddings`
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

### POST `/api/compare-embeddings`
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

### GET `/api/health`
Health check endpoint.

## 📁 Project Structure

```
my-first-vector-db/
├── server.js          # Express backend (secure API proxy)
├── config.js          # OpenAI client configuration
├── index.html         # Frontend UI structure
├── index.js           # Frontend JavaScript (API calls)
├── index.css          # Styling and responsive design
├── .env               # Environment variables (API key)
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

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

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: OpenAI Embeddings API (text-embedding-ada-002)
- **Security**: dotenv, CORS

## 📝 Development

### Run in Development Mode
```bash
npm run dev
```

### Environment Variables
```env
OPENAI_API_KEY=sk-...           # Your OpenAI API key
PORT=8080                        # Server port (default: 8080)
```

## 🤝 Contributing

Part of the Scrimba AI Engineer Course. Feel free to fork and experiment!
