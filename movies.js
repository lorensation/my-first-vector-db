// API Configuration
const API_BASE_URL = 'http://localhost:8080';

// DOM Elements
const processBtn = document.getElementById('processBtn');
const loadChunksBtn = document.getElementById('loadChunksBtn');
const clearBtn = document.getElementById('clearBtn');
const chunkSizeInput = document.getElementById('chunkSize');
const chunkOverlapInput = document.getElementById('chunkOverlap');
const chunksContainer = document.getElementById('chunksContainer');
const processResult = document.getElementById('processResult');
const processError = document.getElementById('processError');
const loading = document.getElementById('loading');
const chunkCount = document.getElementById('chunkCount');
const processMessage = document.getElementById('processMessage');

const searchBtn = document.getElementById('searchBtn');
const searchQuery = document.getElementById('searchQuery');
const resultLimit = document.getElementById('resultLimit');
const threshold = document.getElementById('threshold');
const searchResults = document.getElementById('searchResults');
const searchError = document.getElementById('searchError');
const searchLoading = document.getElementById('searchLoading');
const resultCount = document.getElementById('resultCount');
const resultsContainer = document.getElementById('resultsContainer');

// State
let currentChunks = [];

// Event Listeners
processBtn.addEventListener('click', processMovies);
loadChunksBtn.addEventListener('click', loadExistingChunks);
clearBtn.addEventListener('click', clearAllChunks);
searchBtn.addEventListener('click', performSearch);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadExistingChunks();
});

/**
 * Process movies.txt file - split into chunks and create embeddings
 */
async function processMovies() {
    const chunkSize = parseInt(chunkSizeInput.value);
    const chunkOverlap = parseInt(chunkOverlapInput.value);

    // Validation
    if (chunkSize < 50 || chunkSize > 1000) {
        showError('Chunk size must be between 50 and 1000 characters', processError);
        return;
    }

    if (chunkOverlap < 0 || chunkOverlap >= chunkSize) {
        showError('Chunk overlap must be between 0 and less than chunk size', processError);
        return;
    }

    try {
        // Show loading state
        showLoading(loading);
        hideElement(processResult);
        hideElement(processError);
        disableButtons(true);

        // Call API to process movies
        const response = await fetch(`${API_BASE_URL}/api/movies/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chunkSize,
                chunkOverlap
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to process movies');
        }

        // Update state
        currentChunks = data.chunks;

        // Show success message
        chunkCount.textContent = `${data.count} chunks`;
        processMessage.textContent = data.message;
        showElement(processResult);

        // Display chunks
        displayChunks(data.chunks);

        console.log('✅ Movies processed successfully:', data);

    } catch (error) {
        console.error('Error processing movies:', error);
        showError(error.message, processError);
    } finally {
        hideLoading(loading);
        disableButtons(false);
    }
}

/**
 * Load existing chunks from database
 */
async function loadExistingChunks() {
    try {
        // Show loading state
        showLoading(loading);
        hideElement(processResult);
        hideElement(processError);

        // Call API to get existing chunks
        const response = await fetch(`${API_BASE_URL}/api/movies?limit=100`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to load chunks');
        }

        if (data.count === 0) {
            chunksContainer.innerHTML = `
                <div class="empty-state">
                    <p>🎬 No chunks found. Process the movies.txt file to create chunks!</p>
                </div>
            `;
            return;
        }

        // Update state
        currentChunks = data.movies;

        // Display chunks
        displayChunks(data.movies);

        console.log('✅ Loaded existing chunks:', data.count);

    } catch (error) {
        console.error('Error loading chunks:', error);
        showError(error.message, processError);
        
        // Show empty state
        chunksContainer.innerHTML = `
            <div class="empty-state">
                <p>🎬 No chunks loaded yet. Process the movies.txt file above to see the chunks!</p>
            </div>
        `;
    } finally {
        hideLoading(loading);
    }
}

/**
 * Clear all chunks from database
 */
async function clearAllChunks() {
    if (!confirm('Are you sure you want to delete all movie chunks? This cannot be undone.')) {
        return;
    }

    try {
        // Show loading state
        showLoading(loading);
        hideElement(processResult);
        hideElement(processError);
        disableButtons(true);

        // Call API to delete all chunks
        const response = await fetch(`${API_BASE_URL}/api/movies?confirm=true`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to clear chunks');
        }

        // Clear state
        currentChunks = [];

        // Clear display
        chunksContainer.innerHTML = `
            <div class="empty-state">
                <p>🎬 All chunks cleared. Process the movies.txt file to create new chunks!</p>
            </div>
        `;

        // Clear search results
        hideElement(searchResults);

        console.log('✅ All chunks cleared');

    } catch (error) {
        console.error('Error clearing chunks:', error);
        showError(error.message, processError);
    } finally {
        hideLoading(loading);
        disableButtons(false);
    }
}

/**
 * Display chunks in the visualization area
 */
function displayChunks(chunks) {
    if (!chunks || chunks.length === 0) {
        chunksContainer.innerHTML = `
            <div class="empty-state">
                <p>🎬 No chunks to display</p>
            </div>
        `;
        return;
    }

    chunksContainer.innerHTML = chunks.map((chunk, index) => `
        <div class="chunk-card">
            <div class="chunk-header">
                <span class="chunk-id">Chunk #${chunk.id || index + 1}</span>
                <span class="chunk-length">${chunk.content.length} chars</span>
            </div>
            <div class="chunk-content">${escapeHtml(chunk.content)}</div>
        </div>
    `).join('');
}

/**
 * Perform semantic search
 */
async function performSearch() {
    const query = searchQuery.value.trim();
    const limit = parseInt(resultLimit.value);
    const thresholdValue = parseFloat(threshold.value);

    // Validation
    if (!query) {
        showError('Please enter a search query', searchError);
        return;
    }

    if (limit < 1 || limit > 20) {
        showError('Result limit must be between 1 and 20', searchError);
        return;
    }

    if (thresholdValue < 0 || thresholdValue > 1) {
        showError('Threshold must be between 0 and 1', searchError);
        return;
    }

    try {
        // Show loading state
        showLoading(searchLoading);
        hideElement(searchResults);
        hideElement(searchError);

        // Call API to search
        const response = await fetch(`${API_BASE_URL}/api/movies/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                limit,
                threshold: thresholdValue
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to search');
        }

        // Display results
        displaySearchResults(data.results, data.query);

        console.log('✅ Search completed:', data);

    } catch (error) {
        console.error('Error searching:', error);
        showError(error.message, searchError);
    } finally {
        hideLoading(searchLoading);
    }
}

/**
 * Display search results
 */
function displaySearchResults(results, query) {
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <p>🔍 No results found for "${escapeHtml(query)}". Try adjusting your query or lowering the threshold.</p>
            </div>
        `;
        showElement(searchResults);
        resultCount.textContent = '0 results';
        return;
    }

    resultCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;

    resultsContainer.innerHTML = results.map((result, index) => `
        <div class="result-item">
            <div class="result-item-header">
                <span class="result-rank">#${index + 1}</span>
                <div class="similarity-score">
                    <span class="score-percentage">${result.similarityPercentage}</span>
                    <span class="score-interpretation">${result.interpretation}</span>
                </div>
            </div>
            <div class="result-content">
                ${escapeHtml(result.content)}
            </div>
        </div>
    `).join('');

    showElement(searchResults);
}

/**
 * Utility Functions
 */

function showError(message, element) {
    element.textContent = `❌ ${message}`;
    showElement(element);
}

function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showLoading(element) {
    showElement(element);
}

function hideLoading(element) {
    hideElement(element);
}

function disableButtons(disabled) {
    processBtn.disabled = disabled;
    loadChunksBtn.disabled = disabled;
    clearBtn.disabled = disabled;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
