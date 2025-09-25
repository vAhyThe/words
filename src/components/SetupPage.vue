<template>
  <div class="setup-page">
    <div class="setup-container">
      <div class="setup-header">
        <h1>{{ t('setup.title') }}</h1>
        <p>{{ t('setup.subtitle') }}</p>
      </div>
      
      <!-- Language Selector -->
      <div class="language-selector">
        <label for="language" class="language-label">
          <span class="label-icon">🌍</span>
          Language
        </label>
        <select 
          id="language" 
          v-model="selectedLanguage" 
          @change="changeLanguage"
          class="language-select"
        >
          <option 
            v-for="lang in availableLanguages" 
            :key="lang.code" 
            :value="lang.code"
          >
            {{ lang.name }}
          </option>
        </select>
      </div>
      
      <div class="setup-form">
        <div class="form-group">
          <label for="totalWords" class="form-label">
            <span class="label-icon">🔢</span>
            {{ t('setup.totalWords') }}
          </label>
          <div class="input-container">
            <input
              id="totalWords"
              v-model.number="totalWords"
              type="number"
              min="100"
              max="100000"
              step="100"
              class="form-input"
              placeholder="10000"
            />
            <span class="input-suffix">{{ t('setup.wordsSuffix') }}</span>
          </div>
          <div class="form-help">
            {{ t('setup.totalWordsHelp') }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="batchSize" class="form-label">
            <span class="label-icon">⚡</span>
            {{ t('setup.batchSize') }}
          </label>
          <div class="input-container">
            <input
              id="batchSize"
              v-model.number="batchSize"
              type="number"
              min="10"
              max="1000"
              step="10"
              class="form-input"
              placeholder="100"
            />
            <span class="input-suffix">{{ t('setup.wordsSuffix') }}</span>
          </div>
          <div class="form-help">
            {{ t('setup.batchSizeHelp') }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="initialWords" class="form-label">
            <span class="label-icon">🚀</span>
            {{ t('setup.initialWords') }}
          </label>
          <div class="input-container">
            <input
              id="initialWords"
              v-model.number="initialWords"
              type="number"
              min="10"
              max="500"
              step="10"
              class="form-input"
              placeholder="100"
            />
            <span class="input-suffix">{{ t('setup.wordsSuffix') }}</span>
          </div>
          <div class="form-help">
            {{ t('setup.initialWordsHelp') }}
          </div>
        </div>
        
        <div class="preview-section">
          <h3>{{ t('setup.preview') }}</h3>
          <div class="preview-stats">
            <div class="preview-item">
              <span class="preview-label">{{ t('setup.totalWordsLabel') }}</span>
              <span class="preview-value">{{ totalWords.toLocaleString() }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">{{ t('setup.batchSizeLabel') }}</span>
              <span class="preview-value">{{ batchSize }} {{ t('setup.wordsSuffix') }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">{{ t('setup.initialWordsLabel') }}</span>
              <span class="preview-value">{{ initialWords }} {{ t('setup.wordsSuffix') }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">{{ t('setup.clicksLabel') }}</span>
              <span class="preview-value">{{ Math.ceil((totalWords - initialWords) / batchSize) }}x</span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            class="btn btn-primary"
            @click="startDictionary"
            :disabled="!isValid"
          >
            {{ t('setup.startButton') }}
          </button>
          <button 
            class="btn btn-secondary"
            @click="resetToDefaults"
          >
            {{ t('setup.resetButton') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { i18n } from '../services/i18n.js'

export default {
  name: 'SetupPage',
  emits: ['setup-complete'],
  setup(props, { emit }) {
    const totalWords = ref(10000)
    const batchSize = ref(100)
    const initialWords = ref(100)
    const selectedLanguage = ref(i18n.getCurrentLanguage())
    const availableLanguages = ref(i18n.getAvailableLanguages())
    
    const isValid = computed(() => {
      return totalWords.value >= 100 && 
             batchSize.value >= 10 && 
             initialWords.value >= 10 &&
             initialWords.value <= totalWords.value &&
             batchSize.value <= totalWords.value
    })
    
    const t = (key, params = {}) => {
      return i18n.t(key, params)
    }
    
    const changeLanguage = () => {
      const success = i18n.setLanguage(selectedLanguage.value)
    }
    
    // Watch for language changes to trigger re-render
    watch(() => i18n.currentLanguage.value, () => {
    })
    
    const startDictionary = () => {
      if (!isValid.value) return
      
      // Set language before saving settings
      const success = i18n.setLanguage(selectedLanguage.value)
      
      const settings = {
        totalWords: totalWords.value,
        batchSize: batchSize.value,
        initialWords: initialWords.value,
        language: selectedLanguage.value
      }
            
      // Save settings to localStorage
            emit('setup-complete', settings)
    }
    
    const resetToDefaults = () => {
      totalWords.value = 10000
      batchSize.value = 100
      initialWords.value = 100
    }
    
    const loadSettings = () => {
      const saved = localStorage.getItem('dictionarySettings')
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          totalWords.value = settings.totalWords || 10000
          batchSize.value = settings.batchSize || 100
          initialWords.value = settings.initialWords || 100
          if (settings.language) {
            selectedLanguage.value = settings.language
            i18n.setLanguage(settings.language)
          }
        } catch (error) {
          console.error('Error loading settings:', error)
        }
      }
    }
    
    onMounted(() => {
      loadSettings()
    })
    
    return {
      totalWords,
      batchSize,
      initialWords,
      selectedLanguage,
      availableLanguages,
      isValid,
      t,
      changeLanguage,
      startDictionary,
      resetToDefaults
    }
  }
}
</script>

<style scoped>
.setup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.setup-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  width: 100%;
}

.setup-header {
  text-align: center;
  margin-bottom: 40px;
}

.setup-header h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 10px;
  font-weight: 700;
}

.setup-header p {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.language-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.language-select {
  padding: 10px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.language-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.label-icon {
  font-size: 1.2rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #2d3748;
  background: #f7fafc;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-suffix {
  position: absolute;
  right: 20px;
  color: #718096;
  font-weight: 500;
  pointer-events: none;
}

.form-help {
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
}

.preview-section {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e2e8f0;
}

.preview-section h3 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.preview-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-label {
  color: #718096;
  font-weight: 500;
}

.preview-value {
  color: #2d3748;
  font-weight: 700;
  font-size: 1.1rem;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f7fafc;
  color: #718096;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

@media (max-width: 640px) {
  .setup-container {
    padding: 20px;
  }
  
  .preview-stats {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    min-width: auto;
  }
}
</style>
