<template>
  <div class="words-container">
    <div class="words-grid" @drop="handleDrop" @dragover="handleDragOver">
      <WordItem
        v-for="word in filteredWords"
        :key="word.id"
        :word="word"
        @update-word="updateWord"
        @delete-word="deleteWord"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />
    </div>
  </div>
</template>

<script>
import WordItem from './WordItem.vue'

export default {
  name: 'WordList',
  components: {
    WordItem
  },
  props: {
    words: {
      type: Array,
      required: true
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['update-word', 'delete-word', 'reorder-words'],
  computed: {
    filteredWords() {
      if (!this.searchQuery) {
        return this.words
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.words.filter(word => 
        word.text.toLowerCase().includes(query)
      )
    }
  },
  data() {
    return {
      draggedWord: null,
      draggedOverWord: null
    }
  },
  methods: {
    updateWord(updatedWord) {
      this.$emit('update-word', updatedWord)
    },
    
    deleteWord(wordId) {
      this.$emit('delete-word', wordId)
    },
    
    handleDragStart(word) {
      this.draggedWord = word
    },
    
    handleDragEnd() {
      this.draggedWord = null
      this.draggedOverWord = null
    },
    
    handleDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    },
    
    handleDrop(event) {
      event.preventDefault()
      
      if (!this.draggedWord) return
      
      const wordId = event.dataTransfer.getData('text/plain')
      const targetElement = event.target.closest('.word-item')
      
      if (!targetElement) return
      
      // Najdeme target slovo
      const targetWord = this.words.find(w => 
        targetElement.textContent.includes(w.text)
      )
      
      if (targetWord && targetWord.id !== this.draggedWord.id) {
        this.reorderWords(this.draggedWord, targetWord)
      }
    },
    
    reorderWords(draggedWord, targetWord) {
      const words = [...this.words]
      const draggedIndex = words.findIndex(w => w.id === draggedWord.id)
      const targetIndex = words.findIndex(w => w.id === targetWord.id)
      
      if (draggedIndex === -1 || targetIndex === -1) return
      
      // Remove dragged word
      const [draggedItem] = words.splice(draggedIndex, 1)
      
      // Insert it at new position
      words.splice(targetIndex, 0, draggedItem)
      
      // Update positions
      words.forEach((word, index) => {
        word.position = index
      })
      
      this.$emit('reorder-words', words)
    }
  }
}
</script>
