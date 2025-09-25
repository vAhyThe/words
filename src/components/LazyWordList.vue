<template>
  <div class="words-container">
    <div class="words-grid" ref="wordsGrid">
      <WordItem
        v-for="word in visibleWords"
        :key="word.id"
        :word="word"
        @update-word="updateWord"
        @delete-word="deleteWord"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />
    </div>
    
    <!-- Status container with fixed height -->
    <div class="status-container">
      <!-- Loading indicator -->
      <div v-if="loading" class="loading-indicator">
        <div class="loading-spinner">⏳</div>
        <div class="loading-text">{{ t('wordList.loading') }} {{ batchSize }} {{ t('wordList.loadingProgress') }}...</div>
        <div class="loading-progress">{{ words.length }} / {{ totalWords }} {{ t('wordList.loadingProgress') }}</div>
      </div>
      
      <!-- Completion indicator -->
      <div v-else-if="!hasMoreWords" class="completion-indicator">
        <div class="completion-icon">🎉</div>
        <div class="completion-text">{{ t('wordList.allLoaded') }}</div>
        <div class="completion-stats">{{ totalWords }} {{ t('wordList.allLoadedStats') }}</div>
      </div>
      
      <!-- Load more trigger -->
      <div 
        v-else
        ref="loadMoreTrigger" 
        class="load-more-trigger"
        @click="loadMoreWords"
      >
        <div class="trigger-content">
        <div class="trigger-text">{{ t('wordList.loadMore') }} {{ batchSize }} {{ t('wordList.loadingProgress') }}</div>
        <div class="trigger-button">{{ t('wordList.loadMoreClick') }}</div>
        </div>
      </div>
    </div>
    
    <!-- Invisible scroll trigger for automatic loading -->
    <div 
      v-if="hasMoreWords"
      ref="scrollTrigger" 
      class="scroll-trigger"
    ></div>
    
    
    <!-- Progress bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${(words.length / totalWords) * 100}%` }"
        ></div>
      </div>
      <div class="progress-text">
        {{ words.length }} / {{ totalWords }} words ({{ Math.round((words.length / totalWords) * 100) }}%)
      </div>
    </div>
    
    <!-- Stats -->
    <div class="stats-info">
      <div class="stat-row">
        <span class="stat-label">{{ t('wordList.loaded') }}</span>
        <span class="stat-value">{{ words.length }} {{ t('wordList.loadingProgress') }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ t('wordList.displayed') }}</span>
        <span class="stat-value">{{ visibleWords.length }} {{ t('wordList.loadingProgress') }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ t('wordList.status') }}</span>
        <span class="stat-value" :class="{ 'completed': !hasMoreWords }">
          {{ hasMoreWords ? t('wordList.loadingStatus') : t('wordList.completedStatus') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import WordItem from './WordItem.vue'
import { WordGenerator } from '../services/wordGenerator.js'
import { StorageService } from '../services/storageService.js'
import { i18n } from '../services/i18n.js'

export default {
  name: 'LazyWordList',
  components: {
    WordItem
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    totalWords: {
      type: Number,
      default: 10000
    },
    batchSize: {
      type: Number,
      default: 100
    },
    initialWords: {
      type: Number,
      default: 100
    }
  },
  emits: ['update-word', 'delete-word', 'reorder-words', 'words-count-updated'],
  setup(props, { emit }) {
    const words = ref([])
    const loading = ref(false)
    const hasMoreWords = ref(true)
    const wordsGrid = ref(null)
    const loadMoreTrigger = ref(null)
    const scrollTrigger = ref(null)
    const observer = ref(null)
    
    const BATCH_SIZE = computed(() => props.batchSize)
    const TOTAL_WORDS = computed(() => props.totalWords)
    const INITIAL_WORDS = computed(() => props.initialWords)
    
    const visibleWords = computed(() => {
      if (!props.searchQuery) {
        return words.value
      }
      
      const query = props.searchQuery.toLowerCase()
      return words.value.filter(word => 
        word.text.toLowerCase().includes(query)
      )
    })
    
    const loadInitialWords = async (forceRegenerate = false) => {
      loading.value = true
      
      try {
        if (!forceRegenerate) {
          const savedWords = StorageService.loadWords()
          if (savedWords.length > 0) {
            words.value = savedWords
            hasMoreWords.value = savedWords.length < TOTAL_WORDS.value
            emitWordsCount()
            console.log('✅ LazyWordList: Loaded from localStorage:', words.value.length, 'words, hasMoreWords:', hasMoreWords.value)
            return
          }
        }

        // Generate initial words
        const currentLanguage = i18n.currentLanguage.value
        const initialWords = await WordGenerator.generateInitialWords(INITIAL_WORDS.value, currentLanguage || 'en')
        words.value = initialWords
        hasMoreWords.value = initialWords.length < TOTAL_WORDS.value
        StorageService.saveWords(initialWords)
        emitWordsCount()        
      } catch (error) {
        console.error('❌ LazyWordList: Error loading initial words:', error)
      } finally {
        loading.value = false
      }
    }
    
    const loadMoreWords = async () => {
      if (loading.value) {
        return
      }
      
      if (!hasMoreWords.value) {
        return
      }
      
      loading.value = true
      
      try {
        const currentLanguage = i18n.currentLanguage.value
        const newWords = await WordGenerator.generateMoreWords(BATCH_SIZE.value, words.value.length, currentLanguage || 'en')
        words.value.push(...newWords)
        
        // Save to localStorage
        StorageService.saveWords(words.value)
        emitWordsCount()
        
        // Check if we loaded all words
        if (words.value.length >= TOTAL_WORDS.value) {
          hasMoreWords.value = false
        }
        
      } catch (error) {
        console.error('❌ LazyWordList: Error loading more words:', error)
      } finally {
        loading.value = false
      }
    }
    
    const setupIntersectionObserver = () => {
      if (!scrollTrigger.value) {
        return
      }
            
      observer.value = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          
          if (entry.isIntersecting && hasMoreWords.value && !loading.value) {
            loadMoreWords()
          }
        },
        {
          threshold: 0.1,
          rootMargin: '200px'
        }
      )
      
      observer.value.observe(scrollTrigger.value)
      
      // Fallback: scroll listener in case Intersection Observer doesn't work
      const handleScroll = () => {
        if (!hasMoreWords.value || loading.value) return
        
        const trigger = scrollTrigger.value
        if (!trigger) return
        
        const rect = trigger.getBoundingClientRect()
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0
        
        if (isVisible) {
          loadMoreWords()
        }
      }
      
      window.addEventListener('scroll', handleScroll)
      
      // Cleanup function
      const cleanup = () => {
        window.removeEventListener('scroll', handleScroll)
      }
      
      // Store cleanup function for later use
      observer.value.cleanup = cleanup
    }
    
    const updateWord = (updatedWord) => {
      const index = words.value.findIndex(w => w.id === updatedWord.id)
      if (index !== -1) {
        words.value[index] = updatedWord
        StorageService.saveWords(words.value)
        emit('update-word', updatedWord)
      }
    }
    
    const deleteWord = (wordId) => {
      const index = words.value.findIndex(w => w.id === wordId)
      if (index !== -1) {
        words.value.splice(index, 1)
        StorageService.saveWords(words.value)
        emitWordsCount()
        emit('delete-word', wordId)
      }
    }
    
    const handleDragStart = (word) => {
      emit('drag-start', word)
    }
    
    const handleDragEnd = () => {
      emit('drag-end')
    }

    const emitWordsCount = () => {
      emit('words-count-updated', words.value.length)
    }

    const t = (key, params = {}) => {
      return i18n.t(key, params)
    }
    
    onMounted(async () => {
      await loadInitialWords()
      
      // Setup Intersection Observer after DOM is loaded
      await nextTick()
      
      // Wait a bit more for DOM to be completely rendered
      setTimeout(() => {
        setupIntersectionObserver()
      }, 100)
    })
    
    onUnmounted(() => {
      if (observer.value) {
        observer.value.disconnect()
        if (observer.value.cleanup) {
          observer.value.cleanup()
        }
      }
    })
    
    // Watch for changes in searchQuery
    watch(() => props.searchQuery, () => {
      // When searching we don't need lazy loading
      // Show all words
    })
    
    // Watch for language changes to trigger re-render and regenerate words
    watch(() => i18n.currentLanguage.value, async (newLanguage, oldLanguage) => { 
      // Skip if it's the initial load (oldLanguage is undefined)
      if (oldLanguage === undefined) {
        return
      }
      
      // Clear localStorage when language changes to force regeneration
      StorageService.clearStorage()
      
      // Reset state
      words.value = []
      hasMoreWords.value = true
      loading.value = false
      
      // Always regenerate words when language changes
      await loadInitialWords(true)
          })
    
    return {
      words,
      loading,
      hasMoreWords,
      wordsGrid,
      loadMoreTrigger,
      scrollTrigger,
      visibleWords,
      totalWords: TOTAL_WORDS.value,
      batchSize: BATCH_SIZE.value,
      t,
      loadMoreWords,
      updateWord,
      deleteWord,
      handleDragStart,
      handleDragEnd
    }
  }
}
</script>

<style scoped>
.words-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  max-height: 35vh;
  overflow-y: auto;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  background: var(--gradient-card);
  border-radius: 12px;
  border: 2px solid var(--color-border-medium);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  font-size: 20px;
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.loading-progress {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.completion-indicator {
  text-align: center;
  padding: 20px;
  background: var(--gradient-success);
  border-radius: 12px;
  border: 2px solid var(--color-success);
  animation: pulse 2s ease-in-out infinite;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.completion-icon {
  font-size: 24px;
  margin-bottom: 8px;
  animation: bounce 1s ease-in-out infinite;
}

.completion-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-success-text);
  margin-bottom: 6px;
}

.completion-stats {
  font-size: 12px;
  color: var(--color-success-text-dark);
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.load-more-trigger {
  height: 100%;
  width: 100%;
  background: var(--gradient-info);
  border: 3px solid var(--color-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.load-more-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s;
}

.load-more-trigger:hover {
  background: var(--gradient-info-hover);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--shadow-medium);
  border-color: var(--color-primary-dark);
}

.load-more-trigger:hover::before {
  left: 100%;
}

.load-more-trigger:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(33, 150, 243, 0.3);
}

.trigger-content {
  text-align: center;
  color: var(--color-primary-dark);
}

.trigger-text {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-primary-dark);
}

.trigger-button {
  font-size: 14px;
  font-weight: 600;
  background: var(--color-primary-dark);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: 2px solid var(--color-primary-dark);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: pulse 2s ease-in-out infinite;
}

.trigger-button:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.4);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-3px); }
}

.progress-container {
  margin: 20px 0;
  padding: 20px;
  background: var(--color-bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--color-border-medium);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: var(--color-gray-200);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-button);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stats-info {
  margin-top: 20px;
  padding: 20px;
  background: var(--color-bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--color-border-medium);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.stat-value.completed {
  color: var(--color-success);
  font-weight: 700;
}

/* Scrollbar styling */
.words-grid::-webkit-scrollbar {
  width: 8px;
}

.words-grid::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: 4px;
}

.words-grid::-webkit-scrollbar-thumb {
  background: var(--color-border-dark);
  border-radius: 4px;
}

.words-grid::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-darker);
}

/* Status container with fixed height */
.status-container {
  height: 100px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Invisible scroll trigger */
.scroll-trigger {
  height: 1px;
  width: 100%;
  margin: 20px 0;
  background: transparent;
}
</style>


