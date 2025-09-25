<template>
  <div
    class="word-item virtual-item"
    :class="{ dragging: isDragging }"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    draggable="true"
  >
    <div v-if="!isEditing" class="word-content">
      <div class="word-text">{{ word.text }}</div>
      <div class="word-actions">
        <button 
          class="btn btn-warning btn-small" 
          @click="startEdit"
          title="Edit word"
        >
          ✏️
        </button>
        <button 
          class="btn btn-danger btn-small" 
          @click="deleteWord"
          title="Delete word"
        >
          🗑️
        </button>
      </div>
    </div>
    
    <div v-else class="word-edit">
      <input
        ref="editInput"
        v-model="editText"
        class="edit-input"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        @blur="saveEdit"
      />
      <div class="word-actions">
        <button 
          class="btn btn-success btn-small" 
          @click="saveEdit"
          title="Save"
        >
          ✓
        </button>
        <button 
          class="btn btn-danger btn-small" 
          @click="cancelEdit"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WordItem',
  props: {
    word: {
      type: Object,
      required: true
    }
  },
  emits: ['update-word', 'delete-word', 'drag-start', 'drag-end'],
  data() {
    return {
      isEditing: false,
      editText: '',
      isDragging: false
    }
  },
  methods: {
    startEdit() {
      this.isEditing = true
      this.editText = this.word.text
      this.$nextTick(() => {
        this.$refs.editInput?.focus()
        this.$refs.editInput?.select()
      })
    },
    
    saveEdit() {
      if (this.editText.trim() && this.editText !== this.word.text) {
        this.$emit('update-word', {
          ...this.word,
          text: this.editText.trim()
        })
      }
      this.cancelEdit()
    },
    
    cancelEdit() {
      this.isEditing = false
      this.editText = ''
    },
    
    deleteWord() {
      if (confirm(`Are you sure you want to delete the word "${this.word.text}"?`)) {
        this.$emit('delete-word', this.word.id)
      }
    },
    
    handleDragStart(event) {
      this.isDragging = true
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', this.word.id)
      this.$emit('drag-start', this.word)
    },
    
    handleDragEnd() {
      this.isDragging = false
      this.$emit('drag-end')
    }
  }
}
</script>

<style scoped>
.virtual-item {
  height: 80px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
</style>
