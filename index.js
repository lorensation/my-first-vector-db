// Frontend JavaScript - Secure API calls to backend server
const API_BASE_URL = 'http://localhost:8080/api';

// DOM Elements
const createEmbeddingBtn = document.getElementById('createEmbedding');
const compareTextsBtn = document.getElementById('compareTexts');
const singleTextInput = document.getElementById('singleText');
const text1Input = document.getElementById('text1');
const text2Input = document.getElementById('text2');
const loadingOverlay = document.getElementById('loading');
const exampleButtons = document.querySelectorAll('.example-btn');

// Event Listeners
createEmbeddingBtn.addEventListener('click', handleCreateEmbedding);
compareTextsBtn.addEventListener('click', handleCompareTexts);

// Add example button listeners
exampleButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const text1 = e.target.dataset.text1;
    const text2 = e.target.dataset.text2;
    text1Input.value = text1;
    text2Input.value = text2;
    // Scroll to comparison section
    document.getElementById('compareTexts').scrollIntoView({ behavior: 'smooth' });
  });
});

// Allow Enter key to submit in single text area
singleTextInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleCreateEmbedding();
  }
});

/**
 * Create a single embedding
 */
async function handleCreateEmbedding() {
  const text = singleTextInput.value.trim();
  
  // Validate input
  if (!text) {
    showError('singleError', 'Please enter some text to generate an embedding.');
    return;
  }

  hideError('singleError');
  hideResult('singleResult');
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create embedding');
    }

    displayEmbeddingResult(data);
  } catch (error) {
    showError('singleError', `Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Compare two texts
 */
async function handleCompareTexts() {
  const text1 = text1Input.value.trim();
  const text2 = text2Input.value.trim();

  // Validate inputs
  if (!text1 || !text2) {
    showError('compareError', 'Please enter both texts to compare.');
    return;
  }

  hideError('compareError');
  hideResult('compareResult');
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/compare-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text1, text2 })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to compare embeddings');
    }

    displayComparisonResult(data);
  } catch (error) {
    showError('compareError', `Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Display embedding result
 */
function displayEmbeddingResult(data) {
  const resultDiv = document.getElementById('singleResult');
  const resultText = document.getElementById('resultText');
  const dimensionBadge = document.getElementById('dimensionBadge');
  const embeddingPreview = document.getElementById('embeddingPreview');
  const embeddingFull = document.getElementById('embeddingFull');

  resultText.textContent = data.text;
  dimensionBadge.textContent = `${data.dimensions} dimensions`;
  
  // Show first 10 dimensions
  const preview = data.embedding.slice(0, 10).map((val, idx) => 
    `[${idx}]: ${val.toFixed(6)}`
  ).join('\n');
  embeddingPreview.textContent = preview + '\n...';

  // Show full embedding
  const fullEmbedding = data.embedding.map((val, idx) => 
    `[${idx}]: ${val.toFixed(6)}`
  ).join('\n');
  embeddingFull.textContent = fullEmbedding;

  showResult('singleResult');
}

/**
 * Display comparison result
 */
function displayComparisonResult(data) {
  const resultDiv = document.getElementById('compareResult');
  const similarityScore = document.getElementById('similarityScore');
  const similarityInterpretation = document.getElementById('similarityInterpretation');
  const compText1 = document.getElementById('compText1');
  const compText2 = document.getElementById('compText2');
  const similarityProgress = document.getElementById('similarityProgress');

  compText1.textContent = data.text1;
  compText2.textContent = data.text2;
  similarityScore.textContent = data.similarityPercentage;
  similarityInterpretation.textContent = data.interpretation;
  
  // Update progress bar
  const percentage = (data.similarity * 100).toFixed(0);
  similarityProgress.style.width = `${percentage}%`;
  
  // Color code based on similarity
  if (data.similarity >= 0.85) {
    similarityProgress.className = 'progress high';
  } else if (data.similarity >= 0.70) {
    similarityProgress.className = 'progress moderate';
  } else {
    similarityProgress.className = 'progress low';
  }

  showResult('compareResult');
}

/**
 * Utility functions
 */
function showLoading(show) {
  loadingOverlay.classList.toggle('hidden', !show);
}

function showResult(elementId) {
  document.getElementById(elementId).classList.remove('hidden');
}

function hideResult(elementId) {
  document.getElementById(elementId).classList.add('hidden');
}

function showError(elementId, message) {
  const errorDiv = document.getElementById(elementId);
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError(elementId) {
  document.getElementById(elementId).classList.add('hidden');
}

// Check if server is running on page load
window.addEventListener('load', async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      console.warn('Server health check failed');
    }
  } catch (error) {
    console.error('Cannot connect to server. Please ensure the server is running on port 8080.');
    showError('singleError', '⚠️ Cannot connect to server. Please run "npm start" to start the server.');
  }
});
