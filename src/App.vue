<template>
  <div id="app">
    <!-- Setup Page -->
    <SetupPage 
      v-if="!isSetupComplete"
      @setup-complete="handleSetupComplete"
    />
    
    <!-- Main Dictionary -->
    <div v-else>
      <header class="header">
        <h1>{{ t('main.title') }}</h1>
        <p>{{ t('main.subtitle') }}</p>
        
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ wordsCount }}</span>
            <div class="stat-label">{{ t('main.loadedWords') }}</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalWords.toLocaleString() }}</span>
            <div class="stat-label">{{ t('main.totalWords') }}</div>
          </div>
          <div class="stat-item">
            <span class="stat-number">⚡</span>
            <div class="stat-label">{{ t('main.step') }}: {{ batchSize }}</div>
          </div>
        </div>
        
        <div class="search-container">
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            :placeholder="t('main.searchPlaceholder')"
          />
          <button 
            v-if="searchQuery" 
            class="btn btn-primary"
            @click="clearSearch"
          >
            {{ t('main.clearSearch') }}
          </button>
        </div>
        
        <div class="add-word-container">
          <input
            v-model="newWord"
            class="add-input"
            type="text"
            :placeholder="t('main.newWordsPlaceholder')"
            @keyup.enter="addWords"
          />
          <button 
            class="btn btn-success"
            @click="addWords"
            :disabled="!newWord.trim()"
          >
            {{ t('main.addWords') }}
          </button>
          <button 
            class="btn btn-danger"
            @click="resetWords"
            :title="t('main.resetWords')"
          >
            {{ t('main.resetWords') }}
          </button>
          <button 
            class="btn btn-secondary"
            @click="showSetup"
            :title="t('main.settings')"
          >
            {{ t('main.settings') }}
          </button>
        </div>
        
        <!-- Language Selector -->
        <div class="language-selector">
          <label for="language" class="language-label">
            {{ t('main.language') }}:
          </label>
          <select
            id="language" 
            v-model="currentLanguage" 
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
      </header>

      <main>
        <LazyWordList
          :search-query="searchQuery"
          :total-words="totalWords"
          :batch-size="batchSize"
          :initial-words="initialWords"
          @update-word="updateWord"
          @delete-word="deleteWord"
          @reorder-words="reorderWords"
          @words-count-updated="updateWordsCount"
        />
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import LazyWordList from './components/LazyWordList.vue'
import SetupPage from './components/SetupPage.vue'
import { StorageService } from './services/storageService.js'
import { i18n } from './services/i18n.js'

export default {
  name: 'App',
  components: {
    LazyWordList,
    SetupPage
  },
  setup() {
    const searchQuery = ref('')
    const newWord = ref('')
    const wordsCount = ref(0)
    const totalWords = ref(10000)
    const batchSize = ref(100)
    const initialWords = ref(100)
    const isSetupComplete = ref(false)
    const currentLanguage = ref(i18n.getCurrentLanguage())
    const availableLanguages = ref(i18n.getAvailableLanguages())

    const addWords = () => {
      if (!newWord.value.trim()) return

      const wordTexts = newWord.value
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0)

      if (wordTexts.length === 0) return

      const savedWords = StorageService.loadWords()
      const newWords = wordTexts.map((text, index) => ({
        id: `word_${Date.now()}_${index}`,
        text: text.charAt(0).toUpperCase() + text.slice(1),
        position: savedWords.length + index,
        createdAt: new Date().toISOString()
      }))

      const updatedWords = [...savedWords, ...newWords]
      StorageService.saveWords(updatedWords)
      wordsCount.value = updatedWords.length
      newWord.value = ''
      
      window.location.reload()
    }

    const updateWord = (updatedWord) => {
      const savedWords = StorageService.loadWords()
      const index = savedWords.findIndex(w => w.id === updatedWord.id)
      if (index !== -1) {
        savedWords[index] = updatedWord
        StorageService.saveWords(savedWords)
      }
    }

    const deleteWord = (wordId) => {
      const savedWords = StorageService.loadWords()
      const index = savedWords.findIndex(w => w.id === wordId)
      if (index !== -1) {
        savedWords.splice(index, 1)
        
        savedWords.forEach((word, idx) => {
          word.position = idx
        })
        
        StorageService.saveWords(savedWords)
      }
    }

    const reorderWords = (reorderedWords) => {
      StorageService.saveWords(reorderedWords)
    }

    const clearSearch = () => {
      searchQuery.value = ''
    }

    const resetWords = async () => {
      if (confirm('Do you really want to generate new words? This will delete all existing words!')) {
        StorageService.clearStorage()
        window.location.reload()
      }
    }

    const updateWordsCount = (count) => {
      wordsCount.value = count
    }

    const t = (key, params = {}) => {
      return i18n.t(key, params)
    }

    const handleSetupComplete = (settings) => {
      totalWords.value = settings.totalWords
      batchSize.value = settings.batchSize
      initialWords.value = settings.initialWords
      if (settings.language) {
        i18n.setLanguage(settings.language)
      }
      isSetupComplete.value = true
    }

    const showSetup = () => {
      isSetupComplete.value = false
    }
    
    const changeLanguage = () => {
      const success = i18n.setLanguage(currentLanguage.value)

      // Update settings
      const settings = {
        totalWords: totalWords.value,
        batchSize: batchSize.value,
        initialWords: initialWords.value,
        language: currentLanguage.value
      }
      localStorage.setItem('dictionarySettings', JSON.stringify(settings))
    }
    
    // Watch for language changes to trigger re-render
    watch(() => i18n.currentLanguage.value, () => {
      console.log('🌍 Language changed in App, triggering re-render')
    })

    // Initialize on mount
    onMounted(() => {
      // Check if we have saved settings
      const savedSettings = localStorage.getItem('dictionarySettings')
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          totalWords.value = settings.totalWords || 10000
          batchSize.value = settings.batchSize || 100
          initialWords.value = settings.initialWords || 100
          // Set language from settings
          if (settings.language) {
            i18n.setLanguage(settings.language)
          }
          isSetupComplete.value = true
        } catch (error) {
          console.error('Error loading settings:', error)
          isSetupComplete.value = false
        }
      } else {
        // First run - show setup
        isSetupComplete.value = false
      }
      
      // Load word count if we already have data
      if (isSetupComplete.value) {
        const savedWords = StorageService.loadWords()
        wordsCount.value = savedWords.length
      }
    })

    return {
      searchQuery,
      newWord,
      wordsCount,
      totalWords,
      batchSize,
      initialWords,
      isSetupComplete,
      currentLanguage,
      availableLanguages,
      t,
      addWords,
      updateWord,
      deleteWord,
      reorderWords,
      clearSearch,
      resetWords,
      updateWordsCount,
      handleSetupComplete,
      showSetup,
      changeLanguage
    }
  }
}
</script>
