<template>
  <div class="words-container">
    <div v-if="loading" class="loading">
      ⏳ Loading words...
    </div>
    
    <div v-else class="words-grid">
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
    
    <div v-if="hasMoreWords && !loading" class="load-more">
      <button class="btn btn-primary" @click="loadMoreWords">
        Load more words
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import WordItem from './WordItem.vue'
import { WordGenerator } from '../services/wordGenerator.js'
import { StorageService } from '../services/storageService.js'

export default {
  name: 'SimpleWordList',
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
    const words = ref([])
    const loading = ref(true)
    const hasMoreWords = ref(true)
    const currentBatch = ref(0)
    
    const BATCH_SIZE = 100
    const TOTAL_WORDS = 10000
    
    const visibleWords = computed(() => {
      if (!props.searchQuery) {
        return words.value
      }
      
      const query = props.searchQuery.toLowerCase()
      return words.value.filter(word => 
        word.text.toLowerCase().includes(query)
      )
    })
    
    const loadMoreWords = async () => {
      if (loading.value || !hasMoreWords.value) return
      
      loading.value = true
      
      try {
        // Try to load from localStorage
        const savedWords = StorageService.loadWords()
        if (savedWords.length > 0) {
          words.value = savedWords
          hasMoreWords.value = false
          loading.value = false
          return
        }

        // Generate new words in batches
        const newWords = await WordGenerator.generateWordsBatch(BATCH_SIZE, TOTAL_WORDS)
        
        // Add positions for proper ordering
        newWords.forEach((word, index) => {
          word.position = words.value.length + index
        })
        
        words.value.push(...newWords)
        currentBatch.value++
        
        // Save to localStorage
        StorageService.saveWords(words.value)
        
        // Check if we loaded all words
        if (words.value.length >= TOTAL_WORDS) {
          hasMoreWords.value = false
        }
      } catch (error) {
        console.error('Error loading words:', error)
      } finally {
        loading.value = false
      }
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
        emit('delete-word', wordId)
      }
    }
    
    const handleDragStart = (word) => {
      emit('drag-start', word)
    }
    
    const handleDragEnd = () => {
      emit('drag-end')
    }
    
    onMounted(async () => {
      await loadMoreWords()
    })
    
    return {
      words,
      loading,
      hasMoreWords,
      visibleWords,
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  max-height: 70vh;
  overflow-y: auto;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #7f8c8d;
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
}

/* Scrollbar styling */
.words-grid::-webkit-scrollbar {
  width: 8px;
}

.words-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.words-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.words-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
