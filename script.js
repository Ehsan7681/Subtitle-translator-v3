// Global Variables
let currentTranslation = null;
let translationHistory = [];
let isRecording = false;
let recognition = null;
let currentSettings = {
    apiKey: '',
    model: 'openai/gpt-4o-mini',
    theme: 'pearl'
};
let availableModels = [];

// Language mappings
const languageNames = {
    'auto': 'تشخیص خودکار',
    'fa': 'فارسی',
    'en': 'انگلیسی',
    'ar': 'عربی',
    'fr': 'فرانسوی',
    'de': 'آلمانی',
    'es': 'اسپانیایی',
    'it': 'ایتالیایی',
    'ru': 'روسی',
    'ja': 'ژاپنی',
    'ko': 'کره‌ای',
    'zh': 'چینی',
    'tr': 'ترکی'
};

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    loadSettings();
    await loadAvailableModels();
    loadHistory();
    initializeSpeechRecognition();
    setupEventListeners();
    
    // Apply default theme if none is set
    if (!currentSettings.theme) {
        currentSettings.theme = 'pearl';
        applyTheme('pearl');
    }
    
    // Initialize theme preview
    updateThemePreview(currentSettings.theme);
    
    // Check for saved API key
    if (!currentSettings.apiKey) {
        showToast('لطفاً ابتدا کلید API خود را در تنظیمات وارد کنید', 'warning');
    }
});

// Load available models from OpenRouter API
async function loadAvailableModels() {
    const modelSelect = document.getElementById('modelSelect');
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${currentSettings.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            availableModels = data.data || [];
            
            // Clear existing options
            modelSelect.innerHTML = '';
            
            // Add models to select
            availableModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name || model.id;
                modelSelect.appendChild(option);
            });
            
            // Set saved model
            modelSelect.value = currentSettings.model;
        } else {
            throw new Error('Failed to fetch models');
        }
    } catch (error) {
        console.error('Error loading models:', error);
        
        // Fallback to default models
        const defaultModels = [
            { id: 'openai/gpt-4o-mini', name: 'GPT-4O Mini' },
            { id: 'openai/gpt-4o', name: 'GPT-4O' },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
            { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B' }
        ];
        
        modelSelect.innerHTML = '';
        defaultModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
        
        modelSelect.value = currentSettings.model;
    }
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('translatorSettings');
    if (savedSettings) {
        currentSettings = JSON.parse(savedSettings);
        document.getElementById('apiKey').value = currentSettings.apiKey;
        if (currentSettings.theme) {
            document.getElementById('themeSelect').value = currentSettings.theme;
            applyTheme(currentSettings.theme);
        }
    }
}

// Save settings to localStorage
function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('modelSelect').value;
    const theme = document.getElementById('themeSelect').value;
    
    if (!apiKey) {
        showToast('لطفاً کلید API را وارد کنید', 'error');
        return;
    }
    
    currentSettings = { apiKey, model, theme };
    localStorage.setItem('translatorSettings', JSON.stringify(currentSettings));
    
    // Apply the selected theme
    applyTheme(theme);
    
    showToast('تنظیمات با موفقیت ذخیره شد', 'success');
    toggleSettings();
    
    // Reload models with new API key
    loadAvailableModels();
}

// Load translation history
function loadHistory() {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
        translationHistory = JSON.parse(savedHistory);
    }
}

// Save translation history
function saveHistory() {
    localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
}

// Auto-save translation to history
function autoSaveTranslation(translation) {
    // Check if already exists
    const exists = translationHistory.some(item => 
        item.source === translation.source && 
        item.target === translation.target &&
        item.sourceLang === translation.sourceLang &&
        item.targetLang === translation.targetLang
    );
    
    if (!exists) {
        translationHistory.unshift({
            ...translation,
            id: Date.now()
        });
        
        // Keep only last 50 translations
        if (translationHistory.length > 50) {
            translationHistory = translationHistory.slice(0, 50);
        }
        
        saveHistory();
        console.log('Translation auto-saved to history');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Remove auto-translation - only manual translation now
    document.getElementById('inputText').addEventListener('input', handleInputChange);
    
    // Enter key to translate (Ctrl+Enter)
    document.getElementById('inputText').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            translateText();
        }
    });
    
    // Translation button
    document.getElementById('translateBtn').addEventListener('click', translateText);
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', toggleSettings);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);

    // Theme selector
    document.getElementById('themeSelect').addEventListener('change', handleThemeChange);

    // Language controls
    document.getElementById('swapBtn').addEventListener('click', swapLanguages);

    // Input actions
    document.getElementById('clearBtn').addEventListener('click', clearInput);
    document.getElementById('pasteBtn').addEventListener('click', pasteText);
    document.getElementById('voiceBtn').addEventListener('click', startVoiceInput);

    // Output actions
    document.getElementById('copyBtn').addEventListener('click', copyTranslation);
    document.getElementById('shareBtn').addEventListener('click', shareTranslation);
    document.getElementById('speakBtn').addEventListener('click', speakTranslation);

    // Quick actions
    document.getElementById('saveBtn').addEventListener('click', saveTranslation);
    document.getElementById('historyBtn').addEventListener('click', showHistory);

    // History panel
    document.getElementById('closeHistory').addEventListener('click', closeHistory);
}

// Initialize speech recognition
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'fa-IR';
        
        recognition.onstart = function() {
            isRecording = true;
            document.getElementById('voiceIcon').textContent = '🔴';
            showToast('در حال ضبط صدا...', 'warning');
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('inputText').value = transcript;
            handleInputChange();
            showToast('متن با موفقیت تشخیص داده شد', 'success');
        };
        
        recognition.onerror = function(event) {
            showToast('خطا در تشخیص صدا: ' + event.error, 'error');
        };
        
        recognition.onend = function() {
            isRecording = false;
            document.getElementById('voiceIcon').textContent = '🎤';
        };
    }
}

// Toggle settings panel
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('active');
}

// Swap languages
function swapLanguages() {
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    
    if (sourceLang.value === 'auto') {
        showToast('نمی‌توان زبان تشخیص خودکار را تعویض کرد', 'warning');
        return;
    }
    
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
}

// Handle input change
function handleInputChange() {
    const input = document.getElementById('inputText');
    const charCount = document.getElementById('charCount');
    
    const length = input.value.length;
    charCount.textContent = length;
    
    if (length > 5000) {
        charCount.style.color = '#f56565';
        showToast('حداکثر 5000 کاراکتر مجاز است', 'warning');
    } else if (length > 4000) {
        charCount.style.color = '#ed8936';
    } else {
        charCount.style.color = '#2d3748';
    }
}

// Clear input
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').innerHTML = '<div class="placeholder">ترجمه اینجا نمایش داده می‌شود...</div>';
    document.getElementById('translationInfo').textContent = '';
    handleInputChange();
}

// Paste text
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('inputText').value = text;
        handleInputChange();
        showToast('متن با موفقیت چسبانده شد', 'success');
    } catch (err) {
        showToast('خطا در چسباندن متن', 'error');
    }
}

// Start voice input
function startVoiceInput() {
    if (!recognition) {
        showToast('تشخیص صدا در این مرورگر پشتیبانی نمی‌شود', 'error');
        return;
    }
    
    if (isRecording) {
        recognition.stop();
    } else {
        const sourceLang = document.getElementById('sourceLang').value;
        if (sourceLang !== 'auto') {
            recognition.lang = getRecognitionLang(sourceLang);
        }
        recognition.start();
    }
}

// Get recognition language code
function getRecognitionLang(langCode) {
    const langMap = {
        'fa': 'fa-IR',
        'en': 'en-US',
        'ar': 'ar-SA',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'es': 'es-ES',
        'it': 'it-IT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'tr': 'tr-TR'
    };
    return langMap[langCode] || 'en-US';
}

// Main translation function
async function translateText() {
    const inputText = document.getElementById('inputText').value.trim();
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    if (!inputText) {
        showToast('لطفاً متنی برای ترجمه وارد کنید', 'warning');
        return;
    }
    
    if (!currentSettings.apiKey) {
        showToast('لطفاً ابتدا کلید API خود را در تنظیمات وارد کنید', 'error');
        toggleSettings();
        return;
    }
    
    if (inputText.length > 5000) {
        showToast('متن نباید بیش از 5000 کاراکتر باشد', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const startTime = Date.now();
        
        // Prepare the prompt
        const sourceLanguage = sourceLang === 'auto' ? 'detect the language automatically' : languageNames[sourceLang];
        const targetLanguage = languageNames[targetLang];
        
        const prompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
        
Rules:
1. Provide only the translation, no explanations
2. Maintain the original tone and style
3. Keep formatting if any
4. If source language is auto-detect, first identify the language then translate
5. For Persian text, use proper Persian grammar and vocabulary
6. For technical terms, use appropriate equivalents

Text to translate: "${inputText}"`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentSettings.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Smart Translator'
            },
            body: JSON.stringify({
                model: currentSettings.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const translation = data.choices[0].message.content.trim();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1);
        
        // Display translation
        document.getElementById('outputText').textContent = translation;
        document.getElementById('translationInfo').innerHTML = `
            <span>مدل: ${currentSettings.model.split('/')[1] || currentSettings.model}</span>
            <span>زمان: ${duration}s</span>
        `;
        
        // Save current translation
        currentTranslation = {
            source: inputText,
            target: translation,
            sourceLang: sourceLang,
            targetLang: targetLang,
            model: currentSettings.model,
            timestamp: new Date().toISOString()
        };
        
        // Auto-save to history
        autoSaveTranslation(currentTranslation);
        
        showToast('ترجمه با موفقیت انجام شد', 'success');
        
    } catch (error) {
        console.error('Translation error:', error);
        document.getElementById('outputText').innerHTML = `<div class="placeholder" style="color: #f56565;">خطا در ترجمه: ${error.message}</div>`;
        showToast('خطا در ترجمه: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Copy translation
async function copyTranslation() {
    const outputText = document.getElementById('outputText').textContent;
    
    if (!outputText || outputText.includes('ترجمه اینجا نمایش داده می‌شود')) {
        showToast('متن ترجمه‌ای برای کپی وجود ندارد', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(outputText);
        showToast('ترجمه کپی شد', 'success');
    } catch (err) {
        showToast('خطا در کپی کردن', 'error');
    }
}

// Speak translation
function speakTranslation() {
    const outputText = document.getElementById('outputText').textContent;
    const targetLang = document.getElementById('targetLang').value;
    
    if (!outputText || outputText.includes('ترجمه اینجا نمایش داده می‌شود')) {
        showToast('متن ترجمه‌ای برای خواندن وجود ندارد', 'warning');
        return;
    }
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(outputText);
        utterance.lang = getSpeechLang(targetLang);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
        showToast('در حال خواندن متن...', 'success');
    } else {
        showToast('خواندن متن در این مرورگر پشتیبانی نمی‌شود', 'error');
    }
}

// Get speech language code
function getSpeechLang(langCode) {
    const langMap = {
        'fa': 'fa-IR',
        'en': 'en-US',
        'ar': 'ar-SA',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'es': 'es-ES',
        'it': 'it-IT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'tr': 'tr-TR'
    };
    return langMap[langCode] || 'en-US';
}

// Share translation
async function shareTranslation() {
    const inputText = document.getElementById('inputText').value.trim();
    const outputText = document.getElementById('outputText').textContent;
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    if (!outputText || outputText.includes('ترجمه اینجا نمایش داده می‌شود')) {
        showToast('متن ترجمه‌ای برای اشتراک‌گذاری وجود ندارد', 'warning');
        return;
    }
    
    const shareText = `🌐 مترجم هوشمند\n\n📝 متن اصلی (${languageNames[sourceLang]}):\n${inputText}\n\n✨ ترجمه (${languageNames[targetLang]}):\n${outputText}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'مترجم هوشمند',
                text: shareText
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                fallbackShare(shareText);
            }
        }
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share method
async function fallbackShare(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('متن برای اشتراک‌گذاری کپی شد', 'success');
    } catch (err) {
        showToast('خطا در اشتراک‌گذاری', 'error');
    }
}

// Save translation to history (manual save)
function saveTranslation() {
    if (!currentTranslation) {
        showToast('ترجمه‌ای برای ذخیره وجود ندارد', 'warning');
        return;
    }
    
    // Check if already saved
    const exists = translationHistory.some(item => 
        item.source === currentTranslation.source && 
        item.target === currentTranslation.target
    );
    
    if (exists) {
        showToast('این ترجمه قبلاً ذخیره شده است', 'warning');
        return;
    }
    
    translationHistory.unshift({
        ...currentTranslation,
        id: Date.now()
    });
    
    // Keep only last 50 translations
    if (translationHistory.length > 50) {
        translationHistory = translationHistory.slice(0, 50);
    }
    
    saveHistory();
    showToast('ترجمه ذخیره شد', 'success');
}

// Show history panel
function showHistory() {
    const panel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');
    
    if (translationHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <span class="empty-icon">📝</span>
                <p>هنوز ترجمه‌ای ذخیره نشده است</p>
            </div>
        `;
    } else {
        historyList.innerHTML = translationHistory.map(item => `
            <div class="history-item" onclick="loadHistoryItem(${item.id})">
                <div class="history-item-header">
                    <span class="history-langs">${languageNames[item.sourceLang]} → ${languageNames[item.targetLang]}</span>
                    <span class="history-date">${formatDate(item.timestamp)}</span>
                </div>
                <div class="history-text">${item.source}</div>
            </div>
        `).join('');
    }
    
    panel.classList.add('active');
}

// Close history panel
function closeHistory() {
    document.getElementById('historyPanel').classList.remove('active');
}

// Load history item
function loadHistoryItem(id) {
    const item = translationHistory.find(h => h.id === id);
    if (item) {
        document.getElementById('inputText').value = item.source;
        document.getElementById('outputText').textContent = item.target;
        document.getElementById('sourceLang').value = item.sourceLang;
        document.getElementById('targetLang').value = item.targetLang;
        
        currentTranslation = item;
        handleInputChange();
        closeHistory();
        showToast('ترجمه بارگذاری شد', 'success');
    }
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'همین الان';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' دقیقه پیش';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ساعت پیش';
    
    return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300);
    }, 3000);
}

// Close panels when clicking outside
document.addEventListener('click', function(e) {
    const settingsPanel = document.getElementById('settingsPanel');
    const historyPanel = document.getElementById('historyPanel');
    
    // Close settings panel when clicking outside
    if (settingsPanel.classList.contains('active')) {
        const settingsCard = settingsPanel.querySelector('.glass-card');
        if (!settingsCard.contains(e.target) && !e.target.closest('.settings-btn')) {
            toggleSettings();
        }
    }
    
    // Close history panel when clicking outside
    if (historyPanel.classList.contains('active')) {
        const historyCard = historyPanel.querySelector('.glass-card');
        if (!historyCard.contains(e.target) && !e.target.closest('.quick-btn')) {
            closeHistory();
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to translate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        translateText();
    }
    
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('inputText').focus();
    }
    
    // Escape to close panels
    if (e.key === 'Escape') {
        const settingsPanel = document.getElementById('settingsPanel');
        const historyPanel = document.getElementById('historyPanel');
        
        if (settingsPanel.classList.contains('active')) {
            toggleSettings();
        } else if (historyPanel.classList.contains('active')) {
            closeHistory();
        }
    }
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Apply theme
function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    updateThemePreview(themeName);
}

// Update theme preview
function updateThemePreview(themeName) {
    const preview = document.getElementById('themePreview');
    if (preview) {
        preview.setAttribute('data-theme', themeName);
    }
}

// Handle theme change
function handleThemeChange() {
    const selectedTheme = document.getElementById('themeSelect').value;
    updateThemePreview(selectedTheme);
} 