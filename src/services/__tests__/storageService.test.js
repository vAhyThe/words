import { StorageService } from "../storageService.js"
import { vi } from "vitest"

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("StorageService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementations
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.getItem.mockImplementation(() => null)
  })

  describe("saveWords", () => {
    it("saves words to localStorage", () => {
      const words = [
        { id: "1", text: "word1", position: 0 },
        { id: "2", text: "word2", position: 1 },
      ]

      StorageService.saveWords(words)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "personal_dictionary_words",
        JSON.stringify(words)
      )
    })

    it("handles errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      StorageService.saveWords([])

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving words to localStorage:",
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe("loadWords", () => {
    it("loads words from localStorage", () => {
      const words = [
        { id: "1", text: "word1", position: 0 },
        { id: "2", text: "word2", position: 1 },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(words))

      const result = StorageService.loadWords()

      expect(result).toEqual(words)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "personal_dictionary_words"
      )
    })

    it("returns empty array when no words in localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = StorageService.loadWords()

      expect(result).toEqual([])
    })

    it("handles JSON parse errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid json")

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const result = StorageService.loadWords()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading words from localStorage:",
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe("savePositions", () => {
    it("saves positions to localStorage", () => {
      const positions = { word1: 0, word2: 1 }

      StorageService.savePositions(positions)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "personal_dictionary_positions",
        JSON.stringify(positions)
      )
    })

    it("handles errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error")
      })

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      StorageService.savePositions({ word1: 0 })

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving positions to localStorage:",
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe("loadPositions", () => {
    it("loads positions from localStorage", () => {
      const positions = { word1: 0, word2: 1 }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(positions))

      const result = StorageService.loadPositions()

      expect(result).toEqual(positions)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "personal_dictionary_positions"
      )
    })

    it("returns empty object when no positions in localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = StorageService.loadPositions()

      expect(result).toEqual({})
    })
  })

  describe("clearStorage", () => {
    it("clears all storage keys", () => {
      StorageService.clearStorage()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "personal_dictionary_words"
      )
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "personal_dictionary_positions"
      )
    })
  })
})
