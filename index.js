// Frontend JavaScript - Secure API calls to backend server
const API_BASE_URL = 'http://localhost:8080/api';

// Example texts for batch processing
const EXAMPLE_TEXTS = [
  "Beyond Mars: speculating life on distant planets.",
  "Jazz under stars: a night in New Orleans' music scene.",
  "Mysteries of the deep: exploring uncharted ocean caves.",
  "Rediscovering lost melodies: the rebirth of vinyl culture.",
  "Tales from the tech frontier: decoding AI ethics."
];

// DOM Elements
const createEmbeddingBtn = document.getElementById('createEmbedding');
const compareTextsBtn = document.getElementById('compareTexts');
const generateBatchBtn = document.getElementById('generateBatch');
const loadExampleBtn = document.getElementById('loadExample');
const singleTextInput = document.getElementById('singleText');
const text1Input = document.getElementById('text1');
const text2Input = document.getElementById('text2');
const batchTextInput = document.getElementById('batchText');
const loadingOverlay = document.getElementById('loading');
const exampleButtons = document.querySelectorAll('.example-btn');

// Supabase DOM Elements
const storeContentBtn = document.getElementById('storeContent');
const storeCustomBtn = document.getElementById('storeCustom');
const searchSimilarBtn = document.getElementById('searchSimilar');
const viewDocumentsBtn = document.getElementById('viewDocuments');
const deleteAllBtn = document.getElementById('deleteAll');
const searchQueryInput = document.getElementById('searchQuery');
const searchLimitInput = document.getElementById('searchLimit');
const searchThresholdInput = document.getElementById('searchThreshold');

// Event Listeners
createEmbeddingBtn.addEventListener('click', handleCreateEmbedding);
compareTextsBtn.addEventListener('click', handleCompareTexts);
generateBatchBtn.addEventListener('click', handleBatchEmbeddings);
loadExampleBtn.addEventListener('click', loadExampleTexts);

// Supabase Event Listeners
storeContentBtn.addEventListener('click', () => handleStoreEmbeddings(true));
storeCustomBtn.addEventListener('click', () => handleStoreEmbeddings(false));
searchSimilarBtn.addEventListener('click', handleSearchSimilar);
viewDocumentsBtn.addEventListener('click', handleViewDocuments);
deleteAllBtn.addEventListener('click', handleDeleteAll);

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
 * Load example texts into batch textarea
 */
function loadExampleTexts() {
  batchTextInput.value = EXAMPLE_TEXTS.join('\n');
  batchTextInput.focus();
}

/**
 * Generate batch embeddings
 */
async function handleBatchEmbeddings() {
  const batchText = batchTextInput.value.trim();
  
  // Validate input
  if (!batchText) {
    showError('batchError', 'Please enter at least one text (one per line).');
    return;
  }

  // Split by newlines and filter empty lines
  const texts = batchText.split('\n').filter(line => line.trim().length > 0);

  if (texts.length === 0) {
    showError('batchError', 'Please enter at least one non-empty text.');
    return;
  }

  hideError('batchError');
  hideResult('batchResult');
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/batch-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create batch embeddings');
    }

    displayBatchResults(data);
  } catch (error) {
    showError('batchError', `Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Display batch embedding results
 */
function displayBatchResults(data) {
  const batchCount = document.getElementById('batchCount');
  const batchList = document.getElementById('batchList');

  batchCount.textContent = `${data.count} embeddings created`;
  
  // Clear previous results
  batchList.innerHTML = '';

  // Create a card for each text-embedding pair
  data.results.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'batch-item';
    
    const preview = item.embedding.slice(0, 5).map(val => val.toFixed(4)).join(', ');
    
    card.innerHTML = `
      <div class="batch-item-header" onclick="toggleBatchItem(${index})">
        <div class="batch-item-number">#${index + 1}</div>
        <div class="batch-item-content">
          <p class="batch-item-text">${escapeHtml(item.content)}</p>
          <p class="batch-item-preview">First 5 dimensions: [${preview}...]</p>
        </div>
        <div class="batch-item-toggle">▼</div>
      </div>
      <div class="batch-item-body" id="batch-item-${index}" style="display: none;">
        <div class="batch-item-details">
          <p><strong>Dimensions:</strong> ${item.dimensions}</p>
          <details>
            <summary>View First 10 Dimensions</summary>
            <pre>${item.embedding.slice(0, 10).map((val, idx) => `[${idx}]: ${val.toFixed(6)}`).join('\n')}
...</pre>
          </details>
          <details>
            <summary>View Complete Embedding Vector</summary>
            <pre>${item.embedding.map((val, idx) => `[${idx}]: ${val.toFixed(6)}`).join('\n')}</pre>
          </details>
        </div>
      </div>
    `;
    
    batchList.appendChild(card);
  });

  showResult('batchResult');
}

/**
 * Toggle batch item expansion
 */
window.toggleBatchItem = function(index) {
  const itemBody = document.getElementById(`batch-item-${index}`);
  const toggle = itemBody.previousElementSibling.querySelector('.batch-item-toggle');
  
  if (itemBody.style.display === 'none') {
    itemBody.style.display = 'block';
    toggle.textContent = '▲';
  } else {
    itemBody.style.display = 'none';
    toggle.textContent = '▼';
  }
};

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

// ==================== SUPABASE FUNCTIONS ====================

/**
 * Store embeddings in Supabase
 */
async function handleStoreEmbeddings(useContentFile) {
  let requestBody;

  if (useContentFile) {
    if (!confirm('This will store 10 podcast descriptions from content.js in Supabase. Continue?')) {
      return;
    }
    requestBody = { useContentFile: true };
  } else {
    // Use the batch text input
    const batchText = batchTextInput.value.trim();
    
    if (!batchText) {
      showError('databaseError', 'Please enter texts in the Batch Embeddings section first.');
      return;
    }

    const texts = batchText.split('\n').filter(line => line.trim().length > 0);
    if (texts.length === 0) {
      showError('databaseError', 'No valid texts found to store.');
      return;
    }

    if (!confirm(`This will store ${texts.length} embeddings in Supabase. Continue?`)) {
      return;
    }

    requestBody = { texts };
  }

  hideError('databaseError');
  hideResult('databaseResult');
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/store-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to store embeddings');
    }

    displayDatabaseResult('Stored Successfully', data.count, 
      `<div class="success-message">
        <p><strong>✅ ${data.message}</strong></p>
        <div class="stored-items">
          ${data.inserted.map(item => `
            <div class="stored-item">
              <span class="item-id">#${item.id}</span>
              <span class="item-content">${escapeHtml(item.content.substring(0, 80))}${item.content.length > 80 ? '...' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>`
    );

  } catch (error) {
    showError('databaseError', `Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Search for similar documents using Supabase native vector search
 */
async function handleSearchSimilar() {
  const query = searchQueryInput.value.trim();
  const limit = parseInt(searchLimitInput.value) || 5;
  const threshold = parseFloat(searchThresholdInput.value) || 0.5;

  if (!query) {
    showError('databaseError', 'Please enter a search query.');
    return;
  }

  // Validate threshold
  if (threshold < 0 || threshold > 1) {
    showError('databaseError', 'Similarity threshold must be between 0 and 1.');
    return;
  }

  hideError('databaseError');
  hideResult('databaseResult');
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/search-similar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit, threshold })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to search similar documents');
    }

    if (data.results.length === 0) {
      displayDatabaseResult('No Results', 0, 
        `<div class="no-results">
          <p>No documents found matching your criteria.</p>
          <p>Try:</p>
          <ul>
            <li>Lowering the similarity threshold (currently: ${(threshold * 100).toFixed(0)}%)</li>
            <li>Using different search terms</li>
            <li>Storing more documents in the database</li>
          </ul>
        </div>`
      );
      return;
    }

    const resultsHTML = `
      <div class="search-results">
        <div class="search-info">
          <p><strong>Query:</strong> "${escapeHtml(data.query)}"</p>
          <p><strong>Min Similarity:</strong> ${(data.threshold * 100).toFixed(0)}%</p>
        </div>
        <div class="results-list">
          ${data.results.map((result, index) => `
            <div class="search-result-item">
              <div class="result-rank">#${index + 1}</div>
              <div class="result-details">
                <p class="result-content">${escapeHtml(result.content)}</p>
                <div class="result-meta">
                  <span class="result-id">ID: ${result.id}</span>
                  <span class="result-similarity ${getSimilarityClass(result.similarity)}">
                    ${result.similarityPercentage} match
                  </span>
                  <span class="result-interpretation">${result.interpretation}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    displayDatabaseResult('Search Results', data.count, resultsHTML);

  } catch (error) {
    showError('databaseError', `Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * View all documents
 */
async function handleViewDocuments() {
  hideError('databaseError');
  hideResult('databaseResult');
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/documents?limit=50`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to retrieve documents');
    }

    if (data.documents.length === 0) {
      displayDatabaseResult('No Documents', 0, 
        `<p>No documents found in the database. Store some embeddings first!</p>`
      );
      return;
    }

    const documentsHTML = `
      <div class="documents-list">
        <p class="documents-info">Showing ${data.count} of ${data.total} total documents</p>
        <div class="documents-grid">
          ${data.documents.map(doc => `
            <div class="document-item">
              <span class="doc-id">#${doc.id}</span>
              <span class="doc-content">${escapeHtml(doc.content)}</span>
            </div>
          `).join('')}
        </div>
        ${data.pagination.hasMore ? '<p class="pagination-note">More documents available...</p>' : ''}
      </div>
    `;

    displayDatabaseResult('All Documents', data.total, documentsHTML);

  } catch (error) {
    showError('databaseError', `Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Delete all documents
 */
async function handleDeleteAll() {
  if (!confirm('⚠️ WARNING: This will permanently delete ALL documents from your Supabase database. Are you absolutely sure?')) {
    return;
  }

  if (!confirm('This action cannot be undone. Type YES in your mind and click OK to confirm deletion.')) {
    return;
  }

  hideError('databaseError');
  hideResult('databaseResult');
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/documents?confirm=true`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete documents');
    }

    displayDatabaseResult('Deleted Successfully', 0, 
      `<div class="success-message">
        <p><strong>🗑️ ${data.message}</strong></p>
        <p>Your database is now empty.</p>
      </div>`
    );

  } catch (error) {
    showError('databaseError', `Error: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

/**
 * Display database operation results
 */
function displayDatabaseResult(title, count, contentHTML) {
  const resultTitle = document.getElementById('databaseResultTitle');
  const resultCount = document.getElementById('databaseCount');
  const resultContent = document.getElementById('databaseResultContent');

  resultTitle.textContent = title;
  resultCount.textContent = count > 0 ? `${count} items` : '';
  resultContent.innerHTML = contentHTML;

  showResult('databaseResult');
}

/**
 * Get CSS class based on similarity score
 */
function getSimilarityClass(similarity) {
  if (similarity >= 0.85) return 'similarity-high';
  if (similarity >= 0.70) return 'similarity-moderate';
  return 'similarity-low';
}
