export class StorageService {
  static STORAGE_KEY = "personal_dictionary_words"
  static POSITIONS_KEY = "personal_dictionary_positions"

  static saveWords(words) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(words))
    } catch (error) {
      console.error("Error saving words to localStorage:", error)
    }
  }

  static loadWords() {
    try {
      const words = localStorage.getItem(this.STORAGE_KEY)
      return words ? JSON.parse(words) : []
    } catch (error) {
      console.error("Error loading words from localStorage:", error)
      return []
    }
  }

  static savePositions(positions) {
    try {
      localStorage.setItem(this.POSITIONS_KEY, JSON.stringify(positions))
    } catch (error) {
      console.error("Error saving positions to localStorage:", error)
    }
  }

  static loadPositions() {
    try {
      const positions = localStorage.getItem(this.POSITIONS_KEY)
      return positions ? JSON.parse(positions) : {}
    } catch (error) {
      console.error("Error loading positions from localStorage:", error)
      return {}
    }
  }

  static clearStorage() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.POSITIONS_KEY)
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }
}
