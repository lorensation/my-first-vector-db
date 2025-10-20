// Chat Frontend JavaScript
const API_BASE_URL = 'http://localhost:8080/api';

// Chat history with system prompt
const chatMessages = [{
  role: 'system',
  content: `You are an enthusiastic AI assistant with expertise in both podcasts and movies. You have access to a knowledge base containing information about podcast episodes and movie descriptions. When answering questions, you will be provided with relevant context from both sources. Your job is to:
    1. Formulate clear, concise answers using the provided context
    2. Mention whether the information comes from podcasts, movies, or both
    3. If you find relevant information from both sources, feel free to mention both
    4. If you are unsure and cannot find the answer in the context, say "Sorry, I don't know the answer."
    5. Do not make up information - only use what's provided in the context

    Be friendly, enthusiastic, and helpful!`
}];

// DOM Elements
const chatMessagesContainer = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const charCount = document.getElementById('charCount');
const errorToast = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
  displayWelcomeMessage();
  setupEventListeners();
  checkServerConnection();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  sendButton.addEventListener('click', handleSendMessage);
  
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  userInput.addEventListener('input', () => {
    charCount.textContent = userInput.value.length;
    autoResizeTextarea();
  });
}

/**
 * Auto-resize textarea
 */
function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = userInput.scrollHeight + 'px';
}

/**
 * Display welcome message
 */
function displayWelcomeMessage() {
  const welcomeHTML = `
    <div class="message bot welcome-message">
      <div class="message-content">
        <div class="welcome-icon">🤖</div>
        <h2 class="welcome-title">Welcome to AI Knowledge Assistant!</h2>
        <p class="welcome-description">
          I'm your AI-powered assistant with access to a comprehensive knowledge base about 
          <strong>podcasts</strong> 🎙️ and <strong>movies</strong> 🎬! I use vector search 
          to find the most relevant information from both sources to answer your questions.
        </p>
        <div class="welcome-examples">
          <h4>Try asking:</h4>
          <ul>
            <li onclick="fillExample('Tell me about space exploration')">� Tell me about space exploration</li>
            <li onclick="fillExample('What content do you have about mysteries?')">🔍 What content do you have about mysteries?</li>
            <li onclick="fillExample('Recommend something about AI and technology')">🤖 Recommend something about AI and technology</li>
            <li onclick="fillExample('What can I watch or listen to about adventure?')">🗺️ What can I watch or listen to about adventure?</li>
            <li onclick="fillExample('Tell me about comedy content')">😄 Tell me about comedy content</li>
            <li onclick="fillExample('What do you know about World War II?')">⚔️ What do you know about World War II?</li>
          </ul>
        </div>
        <div class="knowledge-sources">
          <span class="source-badge podcast">🎙️ Podcasts</span>
          <span class="source-badge movie">🎬 Movies</span>
        </div>
      </div>
    </div>
  `;
  chatMessagesContainer.innerHTML = welcomeHTML;
}

/**
 * Fill example question
 */
window.fillExample = function(text) {
  userInput.value = text;
  userInput.focus();
  autoResizeTextarea();
  charCount.textContent = text.length;
};

/**
 * Handle send message
 */
async function handleSendMessage() {
  const message = userInput.value.trim();
  
  if (!message) {
    showError('Please enter a message');
    return;
  }

  if (message.length > 500) {
    showError('Message is too long. Maximum 500 characters.');
    return;
  }

  // Clear input
  userInput.value = '';
  charCount.textContent = '0';
  autoResizeTextarea();

  // Disable send button
  sendButton.disabled = true;

  // Add user message to chat
  addUserMessage(message);

  // Add loading indicator
  const loadingId = addLoadingMessage();

  try {
    // Step 1: Search for similar content in both tables
    const searchResponse = await fetch(`${API_BASE_URL}/chat/search-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: message, 
        limit: 3,
        threshold: 0.3
      })
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(searchData.error || 'Failed to search knowledge base');
    }

    // Build context from all sources
    let contextParts = [];
    let sources = [];
    
    if (searchData.podcasts && searchData.podcasts.length > 0) {
      const podcastContext = searchData.podcasts
        .map((p, i) => `Podcast ${i + 1}: ${p.content}`)
        .join('\n\n');
      contextParts.push(`=== PODCAST CONTENT ===\n${podcastContext}`);
      sources.push(`${searchData.podcastCount} podcast${searchData.podcastCount !== 1 ? 's' : ''}`);
    }
    
    if (searchData.movies && searchData.movies.length > 0) {
      const movieContext = searchData.movies
        .map((m, i) => `Movie ${i + 1}: ${m.content}`)
        .join('\n\n');
      contextParts.push(`=== MOVIE CONTENT ===\n${movieContext}`);
      sources.push(`${searchData.movieCount} movie${searchData.movieCount !== 1 ? 's' : ''}`);
    }

    let context = 'No relevant information found in the knowledge base.';
    let maxSimilarity = 0;
    
    if (contextParts.length > 0) {
      context = contextParts.join('\n\n');
      maxSimilarity = Math.max(
        ...searchData.results.map(r => r.similarity)
      );
    }

    // Step 2: Add context and user question to chat history
    chatMessages.push({
      role: 'user',
      content: `Context from knowledge base:\n\n${context}\n\nUser Question: ${message}`
    });

    // Step 3: Get chat completion from OpenAI
    const chatResponse = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: chatMessages 
      })
    });

    const chatData = await chatResponse.json();

    if (!chatResponse.ok) {
      throw new Error(chatData.error || 'Failed to get AI response');
    }

    // Add assistant response to chat history
    chatMessages.push({
      role: 'assistant',
      content: chatData.message
    });

    // Remove loading indicator
    removeLoadingMessage(loadingId);

    // Display bot response with source information
    addBotMessage(chatData.message, sources.join(' and '), maxSimilarity, searchData);

  } catch (error) {
    console.error('Error:', error);
    removeLoadingMessage(loadingId);
    showError(error.message);
    addBotMessage('Sorry, I encountered an error processing your request. Please try again.', null, 0, null);
  } finally {
    sendButton.disabled = false;
    userInput.focus();
  }
}

/**
 * Add user message to chat
 */
function addUserMessage(message) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const messageHTML = `
    <div class="message user">
      <div class="message-avatar">You</div>
      <div class="message-content">
        <p class="message-text">${escapeHtml(message)}</p>
        <div class="message-meta">
          <span>${timestamp}</span>
        </div>
      </div>
    </div>
  `;
  
  chatMessagesContainer.insertAdjacentHTML('beforeend', messageHTML);
  scrollToBottom();
}

/**
 * Add bot message to chat
 */
function addBotMessage(message, sources, similarity, searchData) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let metaHTML = `<span>${timestamp}</span>`;
  
  if (sources && similarity > 0) {
    const similarityPercent = (similarity * 100).toFixed(0);
    metaHTML += `<span class="context-badge">📚 Sources: ${sources} (${similarityPercent}% match)</span>`;
  }
  
  // Add source breakdown if available
  let sourceBreakdown = '';
  if (searchData && (searchData.podcastCount > 0 || searchData.movieCount > 0)) {
    const badges = [];
    if (searchData.podcastCount > 0) {
      badges.push(`<span class="source-badge podcast">🎙️ ${searchData.podcastCount} Podcast${searchData.podcastCount !== 1 ? 's' : ''}</span>`);
    }
    if (searchData.movieCount > 0) {
      badges.push(`<span class="source-badge movie">🎬 ${searchData.movieCount} Movie${searchData.movieCount !== 1 ? 's' : ''}</span>`);
    }
    sourceBreakdown = `<div class="source-breakdown">${badges.join('')}</div>`;
  }
  
  const messageHTML = `
    <div class="message bot">
      <div class="message-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="message-content">
        <p class="message-text">${escapeHtml(message)}</p>
        ${sourceBreakdown}
        <div class="message-meta">
          ${metaHTML}
        </div>
      </div>
    </div>
  `;
  
  chatMessagesContainer.insertAdjacentHTML('beforeend', messageHTML);
  scrollToBottom();
}

/**
 * Add loading message
 */
function addLoadingMessage() {
  const loadingId = `loading-${Date.now()}`;
  
  const loadingHTML = `
    <div class="loading-message" id="${loadingId}">
      <div class="message-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="loading-content">
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `;
  
  chatMessagesContainer.insertAdjacentHTML('beforeend', loadingHTML);
  scrollToBottom();
  
  return loadingId;
}

/**
 * Remove loading message
 */
function removeLoadingMessage(loadingId) {
  const loadingElement = document.getElementById(loadingId);
  if (loadingElement) {
    loadingElement.remove();
  }
}

/**
 * Scroll to bottom of chat
 */
function scrollToBottom() {
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

/**
 * Show error toast
 */
function showError(message) {
  errorMessage.textContent = message;
  errorToast.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideErrorToast();
  }, 5000);
}

/**
 * Hide error toast
 */
window.hideErrorToast = function() {
  errorToast.classList.add('hidden');
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
 * Check server connection
 */
async function checkServerConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      showError('Server connection issues detected');
    }
  } catch (error) {
    showError('Cannot connect to server. Please ensure the server is running.');
  }
}
