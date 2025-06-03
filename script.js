// Global Variables
let currentTranslation = null;
let translationHistory = [];
let isRecording = false;
let recognition = null;
let availableModels = [];
let isTranslating = false;

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

// Speech Recognition Languages
const speechLangMap = {
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

// Translation Tones Configuration
const TRANSLATION_TONES = {
    neutral: {
        name: 'خنثی',
        emoji: '🎯',
        description: 'ترجمه استاندارد و بی‌طرف بدون تأکید خاص',
        prompt: 'Translate in a neutral, standard tone without any specific emphasis.'
    },
    formal: {
        name: 'رسمی',
        emoji: '🎩',
        description: 'ترجمه رسمی و محترمانه مناسب برای مکاتبات اداری',
        prompt: 'Translate in a formal, respectful tone suitable for official communications.'
    },
    informal: {
        name: 'غیررسمی',
        emoji: '😊',
        description: 'ترجمه راحت و صمیمی مناسب برای گفتگوهای دوستانه',
        prompt: 'Translate in an informal, relaxed tone suitable for casual conversations.'
    },
    friendly: {
        name: 'دوستانه',
        emoji: '🤝',
        description: 'ترجمه گرم و دوستانه با حس صمیمیت',
        prompt: 'Translate in a warm, friendly tone that conveys closeness and familiarity.'
    },
    professional: {
        name: 'حرفه‌ای',
        emoji: '💼',
        description: 'ترجمه حرفه‌ای مناسب برای محیط کاری',
        prompt: 'Translate in a professional tone suitable for business environments.'
    },
    academic: {
        name: 'آکادمیک',
        emoji: '🎓',
        description: 'ترجمه علمی و آکادمیک با واژگان تخصصی',
        prompt: 'Translate in an academic tone using scholarly language and terminology.'
    },
    business: {
        name: 'تجاری',
        emoji: '📊',
        description: 'ترجمه تجاری مناسب برای مذاکرات و قراردادها',
        prompt: 'Translate in a business tone suitable for negotiations and contracts.'
    },
    casual: {
        name: 'راحت',
        emoji: '😎',
        description: 'ترجمه آزاد و بدون تکلف',
        prompt: 'Translate in a casual, laid-back tone without formality.'
    },
    polite: {
        name: 'مؤدبانه',
        emoji: '🙏',
        description: 'ترجمه مؤدبانه و احترام‌آمیز',
        prompt: 'Translate in a polite, courteous tone showing respect.'
    },
    direct: {
        name: 'مستقیم',
        emoji: '⚡',
        description: 'ترجمه مستقیم و بدون پیچ و خم',
        prompt: 'Translate in a direct, straightforward tone without ambiguity.'
    },
    diplomatic: {
        name: 'دیپلماتیک',
        emoji: '🕊️',
        description: 'ترجمه دیپلماتیک و محتاطانه',
        prompt: 'Translate in a diplomatic, tactful tone suitable for sensitive situations.'
    },
    technical: {
        name: 'فنی',
        emoji: '🔧',
        description: 'ترجمه فنی با اصطلاحات تخصصی',
        prompt: 'Translate in a technical tone using precise terminology and specifications.'
    },
    creative: {
        name: 'خلاقانه',
        emoji: '🎨',
        description: 'ترجمه خلاقانه و هنری',
        prompt: 'Translate in a creative, artistic tone with imaginative expression.'
    },
    poetic: {
        name: 'شاعرانه',
        emoji: '🌹',
        description: 'ترجمه شاعرانه و ادبی',
        prompt: 'Translate in a poetic, literary tone with beautiful and flowing language.'
    },
    humorous: {
        name: 'طنزآمیز',
        emoji: '😄',
        description: 'ترجمه شوخ‌طبعانه و سرگرم‌کننده',
        prompt: 'Translate in a humorous, entertaining tone that brings lightness.'
    },
    serious: {
        name: 'جدی',
        emoji: '😐',
        description: 'ترجمه جدی و رسمی',
        prompt: 'Translate in a serious, grave tone appropriate for important matters.'
    },
    warm: {
        name: 'گرم',
        emoji: '🔥',
        description: 'ترجمه گرم و عاطفی',
        prompt: 'Translate in a warm, emotional tone that conveys feelings and passion.'
    },
    cold: {
        name: 'سرد',
        emoji: '❄️',
        description: 'ترجمه سرد و بی‌عاطفه',
        prompt: 'Translate in a cold, detached tone without emotional involvement.'
    },
    enthusiastic: {
        name: 'پرشور',
        emoji: '🚀',
        description: 'ترجمه پرانرژی و هیجان‌انگیز',
        prompt: 'Translate in an enthusiastic, energetic tone full of excitement.'
    },
    calm: {
        name: 'آرام',
        emoji: '🧘',
        description: 'ترجمه آرام و صلح‌آمیز',
        prompt: 'Translate in a calm, peaceful tone that brings tranquility.'
    },
    persuasive: {
        name: 'متقاعدکننده',
        emoji: '💪',
        description: 'ترجمه متقاعدکننده و تأثیرگذار',
        prompt: 'Translate in a persuasive, convincing tone that influences and motivates.'
    },
    informative: {
        name: 'آموزشی',
        emoji: '📚',
        description: 'ترجمه آموزشی و توضیحی',
        prompt: 'Translate in an informative, educational tone that teaches and explains.'
    },
    conversational: {
        name: 'گفتگویی',
        emoji: '💬',
        description: 'ترجمه گفتگویی مانند صحبت روزمره',
        prompt: 'Translate in a conversational tone as if speaking in everyday dialogue.'
    },
    elegant: {
        name: 'شیک',
        emoji: '✨',
        description: 'ترجمه شیک و زیبا با انتخاب کلمات دقیق',
        prompt: 'Translate in an elegant, refined tone with sophisticated word choices.'
    }
};

// Settings Management System
const SETTINGS_KEY = 'smart_translator_settings';
const HISTORY_KEY = 'smart_translator_history';

// Default settings
const DEFAULT_SETTINGS = {
    apiKey: '',
    selectedModel: 'openai/gpt-4o-mini',
    selectedTone: 'neutral',
    selectedTheme: 'pearl',
    sourceLang: 'auto',
    targetLang: 'en',
    autoSave: true,
    soundEnabled: true,
    animationsEnabled: true,
    lastUsed: Date.now()
};

// Current settings object
let currentSettings = { ...DEFAULT_SETTINGS };

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components in correct order
    initializeSettings(); // This loads all settings first
    initializeThemes();
    initializeToneSelector();
    initializeEventListeners();
    
    // Load available models after settings are loaded
    if (currentSettings.apiKey) {
        loadAvailableModels();
    }
    
    // Focus on input
    document.getElementById('inputText').focus();
    
    console.log('App initialized with settings:', currentSettings);
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
            
            // Set saved model from current settings
            modelSelect.value = currentSettings.selectedModel;
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
        
        // Set saved model from current settings
        modelSelect.value = currentSettings.selectedModel;
    }
}

// Load all settings from localStorage
function loadAllSettings() {
    try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
        }
        
        // Apply loaded settings to UI
        applySettingsToUI();
        
        console.log('Settings loaded:', currentSettings);
    } catch (error) {
        console.error('Error loading settings:', error);
        currentSettings = { ...DEFAULT_SETTINGS };
    }
}

// Save all settings to localStorage
function saveAllSettings() {
    try {
        currentSettings.lastUsed = Date.now();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
        console.log('Settings saved:', currentSettings);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Apply settings to UI elements
function applySettingsToUI() {
    // API Key
    if (currentSettings.apiKey) {
        document.getElementById('apiKey').value = currentSettings.apiKey;
    }
    
    // Model Selection
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect && currentSettings.selectedModel) {
        modelSelect.value = currentSettings.selectedModel;
    }
    
    // Tone Selection
    const toneSelect = document.getElementById('toneSelect');
    if (toneSelect && currentSettings.selectedTone) {
        toneSelect.value = currentSettings.selectedTone;
        updateToneDescription(currentSettings.selectedTone);
    }
    
    // Theme Selection
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect && currentSettings.selectedTheme) {
        themeSelect.value = currentSettings.selectedTheme;
        applyTheme(currentSettings.selectedTheme);
        updateThemePreview(currentSettings.selectedTheme);
    }
    
    // Language Selection
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');
    
    if (sourceLangSelect && currentSettings.sourceLang) {
        sourceLangSelect.value = currentSettings.sourceLang;
    }
    
    if (targetLangSelect && currentSettings.targetLang) {
        targetLangSelect.value = currentSettings.targetLang;
    }
}

// Update specific setting and save
function updateSetting(key, value) {
    currentSettings[key] = value;
    saveAllSettings();
    
    // Show feedback
    showToast(`تنظیمات ذخیره شد`, 'success');
}

// Initialize Settings System
function initializeSettings() {
    // Load all settings first
    loadAllSettings();
    
    // Setup event listeners for all settings
    setupSettingsEventListeners();
}

// Setup event listeners for all settings
function setupSettingsEventListeners() {
    // API Key
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('blur', (e) => {
            updateSetting('apiKey', e.target.value.trim());
        });
        
        apiKeyInput.addEventListener('input', (e) => {
            // Auto-save after 2 seconds of no typing
            clearTimeout(apiKeyInput.saveTimeout);
            apiKeyInput.saveTimeout = setTimeout(() => {
                updateSetting('apiKey', e.target.value.trim());
            }, 2000);
        });
    }
    
    // Model Selection
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', (e) => {
            updateSetting('selectedModel', e.target.value);
        });
    }
    
    // Tone Selection
    const toneSelect = document.getElementById('toneSelect');
    if (toneSelect) {
        toneSelect.addEventListener('change', (e) => {
            updateSetting('selectedTone', e.target.value);
            updateToneDescription(e.target.value);
            
            // Add animation effect
            const toneDescription = document.getElementById('toneDescription');
            if (toneDescription) {
                toneDescription.classList.add('highlight');
                setTimeout(() => {
                    toneDescription.classList.remove('highlight');
                }, 500);
            }
        });
    }
    
    // Theme Selection
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            updateSetting('selectedTheme', selectedTheme);
            applyTheme(selectedTheme);
            updateThemePreview(selectedTheme);
        });
    }
    
    // Language Selection
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');
    
    if (sourceLangSelect) {
        sourceLangSelect.addEventListener('change', (e) => {
            updateSetting('sourceLang', e.target.value);
        });
    }
    
    if (targetLangSelect) {
        targetLangSelect.addEventListener('change', (e) => {
            updateSetting('targetLang', e.target.value);
        });
    }
}

// Initialize Themes with persistence
function initializeThemes() {
    // Apply saved theme immediately
    if (currentSettings.selectedTheme) {
        applyTheme(currentSettings.selectedTheme);
        updateThemePreview(currentSettings.selectedTheme);
    }
}

// Initialize tone selector with persistence
function initializeToneSelector() {
    // Apply saved tone
    if (currentSettings.selectedTone) {
        updateToneDescription(currentSettings.selectedTone);
    }
}

// Enhanced Event Listeners with auto-save
function initializeEventListeners() {
    // Translation button
    document.getElementById('translateBtn').addEventListener('click', translateText);
    
    // Enter key for translation
    document.getElementById('inputText').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateText();
        }
    });
    
    // Character count
    document.getElementById('inputText').addEventListener('input', updateCharCount);
    
    // Settings panel toggle
    document.getElementById('settingsBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('settingsPanel').classList.toggle('active');
    });
    
    // Save settings button (manual save)
    document.getElementById('saveSettings').addEventListener('click', () => {
        saveAllSettingsManually();
        document.getElementById('settingsPanel').classList.remove('active');
    });
    
    // History panel
    document.getElementById('historyBtn').addEventListener('click', () => {
        displayHistory();
        document.getElementById('historyPanel').classList.add('active');
    });
    
    // Close history
    document.getElementById('closeHistory').addEventListener('click', closeHistoryPanel);
    
    // Language swap with auto-save
    document.getElementById('swapBtn').addEventListener('click', () => {
        swapLanguagesWithSave();
    });
    
    // Mobile swap button
    const mobileSwapBtn = document.getElementById('mobileSwapBtn');
    if (mobileSwapBtn) {
        mobileSwapBtn.addEventListener('click', () => {
            swapLanguagesWithSave();
        });
    }
    
    // Sync mobile language selectors
    initializeMobileLanguageSync();
    
    // Action buttons
    document.getElementById('clearBtn').addEventListener('click', clearInput);
    document.getElementById('copyBtn').addEventListener('click', copyOutput);
    document.getElementById('pasteBtn').addEventListener('click', pasteInput);
    document.getElementById('voiceBtn').addEventListener('click', toggleVoiceInput);
    document.getElementById('speakBtn').addEventListener('click', speakOutput);
    document.getElementById('shareBtn').addEventListener('click', shareTranslation);
    document.getElementById('saveBtn').addEventListener('click', saveCurrentTranslation);
    
    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
        const settingsPanel = document.getElementById('settingsPanel');
        const historyPanel = document.getElementById('historyPanel');
        const settingsBtn = document.getElementById('settingsBtn');
        const historyBtn = document.getElementById('historyBtn');
        
        // Close settings panel
        if (settingsPanel.classList.contains('active')) {
            const settingsCard = settingsPanel.querySelector('.glass-card');
            if (!settingsCard.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsPanel.classList.remove('active');
            }
        }
        
        // Close history panel
        if (historyPanel.classList.contains('active')) {
            const historyCard = historyPanel.querySelector('.glass-card');
            if (!historyCard.contains(e.target) && !historyBtn.contains(e.target)) {
                historyPanel.classList.remove('active');
            }
        }
    });
    
    // Prevent settings panel from closing when clicking inside
    document.getElementById('settingsPanel').addEventListener('click', (e) => {
        if (e.target.classList.contains('settings-panel')) {
            document.getElementById('settingsPanel').classList.remove('active');
        }
    });
    
    // Prevent history panel from closing when clicking inside
    document.getElementById('historyPanel').addEventListener('click', (e) => {
        if (e.target.classList.contains('history-panel')) {
            document.getElementById('historyPanel').classList.remove('active');
        }
    });
}

// Initialize Mobile Language Synchronization
function initializeMobileLanguageSync() {
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const sourceLangMobile = document.getElementById('sourceLangMobile');
    const targetLangMobile = document.getElementById('targetLangMobile');
    
    if (sourceLangMobile && targetLangMobile) {
        // Sync mobile selectors with main selectors
        sourceLang.addEventListener('change', (e) => {
            sourceLangMobile.value = e.target.value;
        });
        
        targetLang.addEventListener('change', (e) => {
            targetLangMobile.value = e.target.value;
        });
        
        // Sync main selectors with mobile selectors
        sourceLangMobile.addEventListener('change', (e) => {
            sourceLang.value = e.target.value;
            updateSetting('sourceLang', e.target.value);
        });
        
        targetLangMobile.addEventListener('change', (e) => {
            targetLang.value = e.target.value;
            updateSetting('targetLang', e.target.value);
        });
        
        // Initial sync
        sourceLangMobile.value = sourceLang.value;
        targetLangMobile.value = targetLang.value;
    }
}

// Voice Input Implementation
function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند', 'error');
        return;
    }
    
    if (isRecording) {
        stopVoiceRecording();
    } else {
        startVoiceRecording();
    }
}

function startVoiceRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Get selected source language
    const sourceLang = document.getElementById('sourceLang').value;
    const speechLang = speechLangMap[sourceLang] || 'fa-IR';
    
    recognition.lang = speechLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceIcon = document.getElementById('voiceIcon');
    const inputText = document.getElementById('inputText');
    
    recognition.onstart = () => {
        isRecording = true;
        voiceBtn.classList.add('voice-recording');
        voiceIcon.innerHTML = '<div class="voice-waves"></div>';
        showToast('شروع ضبط صدا... صحبت کنید', 'info');
    };
    
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update input text
        const currentText = inputText.value;
        const newText = currentText + finalTranscript;
        inputText.value = newText;
        
        // Show interim results
        if (interimTranscript) {
            const placeholder = inputText.placeholder;
            inputText.placeholder = 'در حال تشخیص: ' + interimTranscript;
            setTimeout(() => {
                inputText.placeholder = placeholder;
            }, 1000);
        }
        
        updateCharCount();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceRecording();
        
        let errorMessage = 'خطا در تشخیص گفتار';
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'صدایی شنیده نشد';
                break;
            case 'audio-capture':
                errorMessage = 'خطا در دسترسی به میکروفون';
                break;
            case 'not-allowed':
                errorMessage = 'دسترسی به میکروفون مجاز نیست';
                break;
        }
        showToast(errorMessage, 'error');
    };
    
    recognition.onend = () => {
        stopVoiceRecording();
    };
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        showToast('خطا در شروع ضبط صدا', 'error');
    }
}

function stopVoiceRecording() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    
    isRecording = false;
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceIcon = document.getElementById('voiceIcon');
    
    voiceBtn.classList.remove('voice-recording');
    voiceIcon.innerHTML = '🎤';
    
    showToast('ضبط صدا متوقف شد', 'success');
}

// Enhanced Translation Function with Better UX
async function translateText() {
    if (isTranslating) {
        return; // Prevent multiple simultaneous translations
    }
    
    const inputText = document.getElementById('inputText').value.trim();
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    const currentTone = getCurrentTone();
    
    if (!inputText) {
        showToast('لطفاً متنی برای ترجمه وارد کنید', 'warning');
        return;
    }
    
    if (inputText.length > 5000) {
        showToast('متن نباید بیش از 5000 کاراکتر باشد', 'error');
        return;
    }
    
    // Use current settings for API key
    const apiKey = currentSettings.apiKey;
    if (!apiKey) {
        showToast('لطفاً ابتدا کلید API را در تنظیمات وارد کنید', 'error');
        document.getElementById('settingsPanel').classList.add('active');
        return;
    }
    
    // Start translation loading
    startTranslationLoading();
    
    try {
        // Use current settings for model
        const model = currentSettings.selectedModel || 'openai/gpt-4o-mini';
        const prompt = buildTranslationPrompt(inputText, sourceLang, targetLang, currentTone);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Smart Translator'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
                // Streaming disabled for better compatibility
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const translatedText = data.choices[0].message.content.trim();
        
        // Remove quotes if present
        const cleanTranslation = translatedText.replace(/^["']|["']$/g, '');
        
        // Apply typewriter effect
        const outputText = document.getElementById('outputText');
        outputText.innerHTML = '';
        await typeWriterEffect(outputText, cleanTranslation, 50);
        
        // Update translation info with tone
        const toneConfig = TRANSLATION_TONES[currentTone];
        const translationInfo = document.getElementById('translationInfo');
        translationInfo.innerHTML = `
            <span>مدل: ${model.split('/').pop()}</span>
            <span class="tone-indicator">
                <span class="tone-emoji">${toneConfig.emoji}</span>
                <span>لحن: ${toneConfig.name}</span>
            </span>
        `;
        
        // Auto-save translation with tone
        autoSaveTranslation(inputText, cleanTranslation, sourceLang, targetLang, currentTone);
        
        showToast('ترجمه با موفقیت انجام شد', 'success');
        
    } catch (error) {
        console.error('Translation error:', error);
        showToast('خطا در ترجمه: ' + error.message, 'error');
        document.getElementById('outputText').innerHTML = '<div class="placeholder">خطا در ترجمه رخ داد</div>';
    } finally {
        stopTranslationLoading();
    }
}

// Start Translation Loading Animation
function startTranslationLoading() {
    isTranslating = true;
    const translateBtn = document.getElementById('translateBtn');
    translateBtn.classList.add('translate-btn-loading');
    translateBtn.textContent = 'در حال ترجمه...';
    
    // Clear output and show loading
    const outputText = document.getElementById('outputText');
    outputText.innerHTML = '<div class="placeholder">در حال ترجمه...</div>';
}

// Stop Translation Loading Animation
function stopTranslationLoading() {
    isTranslating = false;
    const translateBtn = document.getElementById('translateBtn');
    translateBtn.classList.remove('translate-btn-loading');
    translateBtn.innerHTML = '<span class="btn-icon">🚀</span> ترجمه کن';
}

// Typewriter Effect Function
async function typeWriterEffect(element, text, speed = 30) {
    return new Promise((resolve) => {
        let i = 0;
        const timer = setInterval(() => {
            element.textContent = text.slice(0, i + 1);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                resolve();
            }
        }, speed);
    });
}

// Manual save all settings
function saveAllSettingsManually() {
    // Collect all current values
    const apiKey = document.getElementById('apiKey').value.trim();
    const selectedModel = document.getElementById('modelSelect').value;
    const selectedTone = document.getElementById('toneSelect').value;
    const selectedTheme = document.getElementById('themeSelect').value;
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    // Validate API key
    if (!apiKey) {
        showToast('لطفاً کلید API را وارد کنید', 'error');
        return false;
    }
    
    // Update all settings
    currentSettings = {
        ...currentSettings,
        apiKey,
        selectedModel,
        selectedTone,
        selectedTheme,
        sourceLang,
        targetLang
    };
    
    // Save to localStorage
    saveAllSettings();
    
    // Apply theme
    applyTheme(selectedTheme);
    
    showToast('تمام تنظیمات ذخیره شد', 'success');
    return true;
}

// Enhanced swap languages with auto-save and mobile sync
function swapLanguagesWithSave() {
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const sourceLangMobile = document.getElementById('sourceLangMobile');
    const targetLangMobile = document.getElementById('targetLangMobile');
    
    if (sourceLang.value === 'auto') {
        showToast('نمی‌توان زبان تشخیص خودکار را تعویض کرد', 'warning');
        return;
    }
    
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
    
    // Sync mobile selectors
    if (sourceLangMobile && targetLangMobile) {
        sourceLangMobile.value = sourceLang.value;
        targetLangMobile.value = targetLang.value;
    }
    
    // Save language preferences
    updateSetting('sourceLang', sourceLang.value);
    updateSetting('targetLang', targetLang.value);
    
    // Swap texts too
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText').textContent;
    
    if (inputText && outputText && outputText !== 'ترجمه اینجا نمایش داده می‌شود...') {
        document.getElementById('inputText').value = outputText;
        document.getElementById('outputText').textContent = inputText;
        updateCharCount();
    }
    
    showToast('زبان‌ها تعویض شدند', 'success');
}

// Load Settings (legacy function - now calls loadAllSettings)
function loadSettings() {
    loadAllSettings();
}

// Save settings to localStorage (legacy function - now calls saveAllSettings)
function saveSettings() {
    return saveAllSettingsManually();
}

// Auto-save translation with tone
function autoSaveTranslation(sourceText, translatedText, sourceLang, targetLang, tone) {
    const translation = {
        id: Date.now(),
        sourceText: sourceText,
        translatedText: translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        tone: tone,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fa-IR')
    };
    
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    // Check if already exists
    const exists = history.some(item => 
        item.sourceText === sourceText && 
        item.translatedText === translatedText &&
        item.sourceLang === sourceLang &&
        item.targetLang === targetLang
    );
    
    if (!exists) {
        history.unshift(translation);
        
        // Keep only last 50 translations
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        console.log('Translation auto-saved to history with tone:', tone);
    }
}

// Update character count
function updateCharCount() {
    const inputText = document.getElementById('inputText');
    const charCount = document.getElementById('charCount');
    const count = inputText.value.length;
    charCount.textContent = count;
    
    if (count > 4500) {
        charCount.style.color = '#f56565';
    } else if (count > 4000) {
        charCount.style.color = '#ed8936';
    } else {
        charCount.style.color = 'var(--text-secondary)';
    }
}

// Swap languages (legacy function)
function swapLanguages() {
    swapLanguagesWithSave();
}

// Clear input
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').innerHTML = '<div class="placeholder">ترجمه اینجا نمایش داده می‌شود...</div>';
    document.getElementById('translationInfo').innerHTML = '';
    updateCharCount();
    showToast('متن پاک شد', 'success');
}

// Copy output
async function copyOutput() {
    const outputText = document.getElementById('outputText').textContent;
    if (!outputText || outputText === 'ترجمه اینجا نمایش داده می‌شود...') {
        showToast('متنی برای کپی وجود ندارد', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(outputText);
        showToast('ترجمه کپی شد', 'success');
    } catch (error) {
        showToast('خطا در کپی کردن', 'error');
    }
}

// Paste input
async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('inputText').value = text;
        updateCharCount();
        showToast('متن چسبانده شد', 'success');
    } catch (error) {
        showToast('خطا در چسباندن متن', 'error');
    }
}

// Speak output (placeholder)
function speakOutput() {
    const outputText = document.getElementById('outputText').textContent;
    if (!outputText || outputText === 'ترجمه اینجا نمایش داده می‌شود...') {
        showToast('متنی برای خواندن وجود ندارد', 'warning');
        return;
    }
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(outputText);
        const targetLang = document.getElementById('targetLang').value;
        
        // Set language for speech
        const speechLangs = {
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
        
        utterance.lang = speechLangs[targetLang] || 'en-US';
        speechSynthesis.speak(utterance);
        showToast('در حال خواندن متن...', 'info');
    } else {
        showToast('مرورگر شما از خواندن متن پشتیبانی نمی‌کند', 'error');
    }
}

// Share translation
async function shareTranslation() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText').textContent;
    
    if (!inputText || !outputText || outputText === 'ترجمه اینجا نمایش داده می‌شود...') {
        showToast('ترجمه‌ای برای اشتراک‌گذاری وجود ندارد', 'warning');
        return;
    }
    
    const shareData = {
        title: 'مترجم هوشمند',
        text: `متن اصلی: ${inputText}\n\nترجمه: ${outputText}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('ترجمه اشتراک‌گذاری شد', 'success');
        } catch (error) {
            if (error.name !== 'AbortError') {
                fallbackShare(shareData.text);
            }
        }
    } else {
        fallbackShare(shareData.text);
    }
}

// Fallback share
async function fallbackShare(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('ترجمه کپی شد - می‌توانید آن را اشتراک‌گذاری کنید', 'success');
    } catch (error) {
        showToast('خطا در اشتراک‌گذاری', 'error');
    }
}

// Save current translation
function saveCurrentTranslation() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText').textContent;
    
    if (!inputText || !outputText || outputText === 'ترجمه اینجا نمایش داده می‌شود...') {
        showToast('ترجمه‌ای برای ذخیره وجود ندارد', 'warning');
        return;
    }
    
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    const currentTone = getCurrentTone();
    
    autoSaveTranslation(inputText, outputText, sourceLang, targetLang, currentTone);
    showToast('ترجمه ذخیره شد', 'success');
}

// Close history panel
function closeHistoryPanel() {
    document.getElementById('historyPanel').classList.remove('active');
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

// Update tone description
function updateToneDescription(toneKey) {
    const toneDescription = document.getElementById('toneDescription');
    const tone = TRANSLATION_TONES[toneKey];
    
    if (tone) {
        toneDescription.innerHTML = `
            <p><strong>${tone.emoji} ${tone.name}:</strong> ${tone.description}</p>
        `;
    }
}

// Get current tone for translation
function getCurrentTone() {
    const toneSelect = document.getElementById('toneSelect');
    return toneSelect.value || 'neutral';
}

// Build translation prompt with tone
function buildTranslationPrompt(text, sourceLang, targetLang, tone) {
    const toneConfig = TRANSLATION_TONES[tone] || TRANSLATION_TONES.neutral;
    
    const sourceLanguages = {
        'auto': 'auto-detect',
        'fa': 'Persian',
        'en': 'English',
        'ar': 'Arabic',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'tr': 'Turkish'
    };
    
    const targetLanguages = {
        'fa': 'Persian',
        'en': 'English',
        'ar': 'Arabic',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'tr': 'Turkish'
    };
    
    const sourceLanguageName = sourceLanguages[sourceLang] || 'auto-detect';
    const targetLanguageName = targetLanguages[targetLang] || 'English';
    
    return `Please translate the following text from ${sourceLanguageName} to ${targetLanguageName}.

${toneConfig.prompt}

Make sure the translation:
- Maintains the original meaning accurately
- Uses appropriate ${tone} tone and style
- Sounds natural in the target language
- Preserves any cultural context when possible

Text to translate:
"${text}"

Please provide only the translation without any additional explanations.`;
}

// Update history display to show tone
function displayHistory() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <span class="empty-icon">📝</span>
                <p>هنوز ترجمه‌ای ذخیره نشده است</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const toneConfig = TRANSLATION_TONES[item.tone] || TRANSLATION_TONES.neutral;
        return `
            <div class="history-item" onclick="loadTranslation('${item.id}')">
                <div class="history-item-header">
                    <span class="history-langs">${getLanguageName(item.sourceLang)} → ${getLanguageName(item.targetLang)}</span>
                    <span class="history-date">${item.date}</span>
                </div>
                <div class="history-text">${item.sourceText}</div>
                <div class="history-tone">
                    <span class="tone-indicator">
                        <span class="tone-emoji">${toneConfig.emoji}</span>
                        <span>${toneConfig.name}</span>
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Load translation from history
function loadTranslation(id) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const translation = history.find(item => item.id == id);
    
    if (translation) {
        document.getElementById('inputText').value = translation.sourceText;
        document.getElementById('outputText').textContent = translation.translatedText;
        document.getElementById('sourceLang').value = translation.sourceLang;
        document.getElementById('targetLang').value = translation.targetLang;
        
        // Sync mobile selectors if they exist
        const sourceLangMobile = document.getElementById('sourceLangMobile');
        const targetLangMobile = document.getElementById('targetLangMobile');
        
        if (sourceLangMobile) {
            sourceLangMobile.value = translation.sourceLang;
        }
        
        if (targetLangMobile) {
            targetLangMobile.value = translation.targetLang;
        }
        
        // Set tone if available and update settings
        if (translation.tone) {
            document.getElementById('toneSelect').value = translation.tone;
            updateToneDescription(translation.tone);
            updateSetting('selectedTone', translation.tone);
        }
        
        // Update language settings
        updateSetting('sourceLang', translation.sourceLang);
        updateSetting('targetLang', translation.targetLang);
        
        updateCharCount();
        closeHistoryPanel();
        showToast('ترجمه بارگذاری شد', 'success');
    }
}

// Get language name in Persian
function getLanguageName(langCode) {
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
    return languageNames[langCode] || langCode;
}

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available
                            showToast('نسخه جدید در دسترس است. صفحه را رفرش کنید.', 'info');
                        }
                    });
                });
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    });
} 