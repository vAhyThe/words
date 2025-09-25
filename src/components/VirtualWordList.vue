<template>
  <div class="virtual-words-container">
    <div 
      ref="scrollContainer"
      class="virtual-scroll-container"
      @scroll="handleScroll"
    >
      <div :style="{ height: totalHeight + 'px' }">
        <div 
          class="words-viewport"
          :style="{ transform: `translateY(${offsetY}px)` }"
        >
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
      </div>
    </div>
    
    <div v-if="loading" class="loading-indicator">
      ⏳ Loading more words...
    </div>
    
    <div v-if="hasReachedEnd && !loading" class="end-indicator">
      ✅ All words have been loaded
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import WordItem from './WordItem.vue'
import { WordGenerator } from '../services/wordGenerator.js'
import { StorageService } from '../services/storageService.js'

export default {
  name: 'VirtualWordList',
  components: {
    WordItem
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['update-word', 'delete-word', 'reorder-words'],
  setup(props, { emit }) {
    const scrollContainer = ref(null)
    const words = ref([])
    const loading = ref(false)
    const hasReachedEnd = ref(false)
    const scrollTop = ref(0)
    const containerHeight = ref(0)
    
    // Virtual scrolling configuration
    const ITEM_HEIGHT = 80 // Height of one word in px
    const BUFFER_SIZE = 5 // Number of extra items for smooth scroll
    const BATCH_SIZE = 50 // Number of words loaded at once
    const TOTAL_WORDS = 10000 // Total number of words
    
    const totalHeight = computed(() => TOTAL_WORDS * ITEM_HEIGHT)
    
    const startIndex = computed(() => {
      return Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER_SIZE)
    })
    
    const endIndex = computed(() => {
      const visibleCount = Math.ceil(containerHeight.value / ITEM_HEIGHT)
      return Math.min(
        TOTAL_WORDS - 1,
        startIndex.value + visibleCount + BUFFER_SIZE * 2
      )
    })
    
    const visibleWords = computed(() => {
      if (props.searchQuery) {
        const query = props.searchQuery.toLowerCase()
        return words.value.filter(word => 
          word.text.toLowerCase().includes(query)
        )
      }
      return words.value.slice(startIndex.value, endIndex.value + 1)
    })
    
    const offsetY = computed(() => startIndex.value * ITEM_HEIGHT)
    
    const loadMoreWords = async () => {
      if (loading.value || hasReachedEnd.value) return
      
      loading.value = true
      
      try {
        // Try to load from localStorage
        const savedWords = StorageService.loadWords()
        if (savedWords.length > 0) {
          words.value = savedWords
          hasReachedEnd.value = true
          loading.value = false
          return
        }

        // If not in localStorage, generate new ones gradually
        const newWords = await WordGenerator.generateWordsBatch(BATCH_SIZE, TOTAL_WORDS)
        
        // Add positions for proper ordering
        newWords.forEach((word, index) => {
          word.position = words.value.length + index
        })
        
        words.value.push(...newWords)
        
        // Save to localStorage
        StorageService.saveWords(words.value)
        
        // Check if we loaded all words
        if (words.value.length >= TOTAL_WORDS) {
          hasReachedEnd.value = true
        }
      } catch (error) {
        console.error('Error loading words:', error)
      } finally {
        loading.value = false
      }
    }
    
    let scrollTimeout = null
    
    const handleScroll = () => {
      if (!scrollContainer.value) return
      
      scrollTop.value = scrollContainer.value.scrollTop
      
      // Throttling for better performance
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      scrollTimeout = setTimeout(() => {
        // Load more words when approaching the end
        const scrollPercentage = scrollTop.value / (totalHeight.value - containerHeight.value)
        if (scrollPercentage > 0.7 && !loading.value && !hasReachedEnd.value) {
          loadMoreWords()
        }
      }, 16) // ~60fps
    }
    
    const updateWord = (updatedWord) => {
      const index = words.value.findIndex(w => w.id === updatedWord.id)
      if (index !== -1) {
        words.value[index] = updatedWord
        emit('update-word', updatedWord)
      }
    }
    
    const deleteWord = (wordId) => {
      const index = words.value.findIndex(w => w.id === wordId)
      if (index !== -1) {
        words.value.splice(index, 1)
        emit('delete-word', wordId)
      }
    }
    
    const handleDragStart = (word) => {
      // Drag & drop implementation for virtual scrolling
      emit('drag-start', word)
    }
    
    const handleDragEnd = () => {
      emit('drag-end')
    }
    
    const updateContainerHeight = () => {
      if (scrollContainer.value) {
        containerHeight.value = scrollContainer.value.clientHeight
      }
    }
    
    onMounted(async () => {
      updateContainerHeight()
      
      // Load first batch of words
      await loadMoreWords()
      
      // If we don't have words, load them gradually
      if (words.value.length === 0) {
        // Generate all words at once for first run
        const allWords = await WordGenerator.generateWords(10000)
        words.value = allWords
        StorageService.saveWords(allWords)
        hasReachedEnd.value = true
      }
      
      // Setup resize listener
      window.addEventListener('resize', updateContainerHeight)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', updateContainerHeight)
    })
    
    // Watch for changes in searchQuery
    watch(() => props.searchQuery, () => {
      // When searching we don't need virtual scrolling
      // Show all words
    })
    
    return {
      scrollContainer,
      words,
      loading,
      hasReachedEnd,
      totalHeight,
      visibleWords,
      offsetY,
      updateWord,
      deleteWord,
      handleDragStart,
      handleDragEnd
    }
  }
}
</script>

<style scoped>
.virtual-words-container {
  height: 70vh;
  position: relative;
}

.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.words-viewport {
  position: relative;
  width: 100%;
}

.loading-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 10;
}

.end-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(46, 204, 113, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 10;
}

/* Scrollbar styling */
.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
