<template>
  <div class="words-container">
    <div v-if="loading" class="loading">
      ⏳ Loading words...
    </div>
    
    <div v-else class="words-grid">
      <div v-for="word in words" :key="word.id" class="word-item">
        {{ word.text }}
      </div>
    </div>
    
    <div class="debug-info">
      <p>Number of words: {{ words.length }}</p>
      <p>Loading: {{ loading }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'TestWordList',
  setup() {
    const words = ref([])
    const loading = ref(true)
    
    const loadWords = async () => {
      console.log('🔄 TestWordList: Starting to load words...')
      loading.value = true
      
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate 200 words
        const testWords = []
        for (let i = 0; i < 200; i++) {
          testWords.push({
            id: `word_${i + 1}`,
            text: `Slovo${i + 1}`,
            position: i
          })
        }
        
        words.value = testWords        
      } catch (error) {
        console.error('❌ TestWordList: Error:', error)
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      loadWords()
    })
    
    return {
      words,
      loading
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

.word-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #7f8c8d;
}

.debug-info {
  margin-top: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
}
</style>


