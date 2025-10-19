// Chat Frontend JavaScript
const API_BASE_URL = 'http://localhost:8080/api';

// Chat history with system prompt
const chatMessages = [{
  role: 'system',
  content: `You are an enthusiastic podcast expert who loves recommending podcasts to people. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`
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
        <div class="welcome-icon">🎙️</div>
        <h2 class="welcome-title">Welcome to Podcast Expert AI!</h2>
        <p class="welcome-description">
          I'm your AI-powered podcast assistant. I have knowledge about various podcast episodes 
          stored in a vector database. Ask me anything about podcasts, and I'll search through 
          my knowledge base to give you the best recommendations and insights!
        </p>
        <div class="welcome-examples">
          <h4>Try asking:</h4>
          <ul>
            <li onclick="fillExample('Tell me about space exploration podcasts')">💫 Tell me about space exploration podcasts</li>
            <li onclick="fillExample('What podcasts discuss ocean mysteries?')">🌊 What podcasts discuss ocean mysteries?</li>
            <li onclick="fillExample('Recommend a podcast about AI and technology')">🤖 Recommend a podcast about AI and technology</li>
            <li onclick="fillExample('What can I listen to about music and culture?')">🎵 What can I listen to about music and culture?</li>
          </ul>
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
    // Step 1: Search for similar content
    const searchResponse = await fetch(`${API_BASE_URL}/search-similar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: message, 
        limit: 1,
        threshold: 0.3 // Lower threshold to get results
      })
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(searchData.error || 'Failed to search database');
    }

    // Get the top matching context
    let context = 'No relevant podcast information found.';
    let similarity = 0;
    
    if (searchData.results && searchData.results.length > 0) {
      context = searchData.results[0].content;
      similarity = searchData.results[0].similarity;
    }

    // Step 2: Add context and user question to chat history
    chatMessages.push({
      role: 'user',
      content: `Context: ${context}\n\nQuestion: ${message}`
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

    // Display bot response
    addBotMessage(chatData.message, context, similarity);

  } catch (error) {
    console.error('Error:', error);
    removeLoadingMessage(loadingId);
    showError(error.message);
    addBotMessage('Sorry, I encountered an error processing your request. Please try again.', null, 0);
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
function addBotMessage(message, context, similarity) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let metaHTML = `<span>${timestamp}</span>`;
  
  if (context && similarity > 0) {
    const similarityPercent = (similarity * 100).toFixed(0);
    metaHTML += `<span class="context-badge">📚 Context match: ${similarityPercent}%</span>`;
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
