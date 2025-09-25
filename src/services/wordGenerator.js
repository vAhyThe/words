export class WordGenerator {
  static async generateWords(count = 200, language = "en") {
    console.log(
      "🎲 WordGenerator: Starting to generate",
      count,
      "words in",
      language
    )

    return this.generateWordsLocal(count, language)
  }

  static async generateWordsLocal(count = 200, language = "en") {
    console.log("🎯 WordGenerator: Generating words locally in", language)

    // Language-specific word lists
    const wordLists = {
      en: this.getEnglishWords(),
      de: this.getGermanWords(),
      cs: this.getCzechWords(),
    }

    const wordList = wordLists[language] || wordLists.en
    console.log(
      `📚 WordGenerator: Using ${wordList.length} words from ${language} list`
    )

    // Generate random words from the word list
    const words = []
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length)
      const word = wordList[randomIndex]
      // Capitalize first letter if it's the first word
      const formattedWord =
        i === 0 ? word.slice(0, 1).toUpperCase() + word.slice(1) : word
      words.push(formattedWord)
    }

    console.log(
      "✅ WordGenerator: Generated",
      words.length,
      "words locally in",
      language
    )

    const result = words.map((word, index) => ({
      id: `word_${Date.now()}_${index}`,
      text: word,
      position: index,
      createdAt: new Date().toISOString(),
      source: "local",
    }))

    console.log("🎉 WordGenerator: Returning", result.length, "words")
    return result
  }

  static getEnglishWords() {
    return [
      "apple",
      "banana",
      "cherry",
      "dog",
      "elephant",
      "forest",
      "garden",
      "house",
      "island",
      "jungle",
      "kitten",
      "lion",
      "mountain",
      "ocean",
      "penguin",
      "queen",
      "river",
      "sun",
      "tree",
      "umbrella",
      "violet",
      "water",
      "xylophone",
      "yellow",
      "zebra",
      "adventure",
      "beautiful",
      "crystal",
      "diamond",
      "energy",
      "fantasy",
      "guitar",
      "harmony",
      "imagination",
      "journey",
      "knowledge",
      "laughter",
      "magic",
      "nature",
      "ocean",
      "peace",
      "rainbow",
      "sunshine",
      "treasure",
      "universe",
      "victory",
      "wisdom",
      "youth",
    ]
  }

  static getGermanWords() {
    return [
      "Apfel",
      "Banane",
      "Kirsche",
      "Hund",
      "Elefant",
      "Wald",
      "Garten",
      "Haus",
      "Insel",
      "Dschungel",
      "Kätzchen",
      "Löwe",
      "Berg",
      "Ozean",
      "Pinguin",
      "Königin",
      "Fluss",
      "Sonne",
      "Baum",
      "Regenschirm",
      "Veilchen",
      "Wasser",
      "Xylophon",
      "Gelb",
      "Zebra",
      "Abenteuer",
      "Schön",
      "Kristall",
      "Diamant",
      "Energie",
      "Fantasy",
      "Gitarre",
      "Harmonie",
      "Phantasie",
      "Reise",
      "Wissen",
      "Lachen",
      "Magie",
      "Natur",
      "Ozean",
      "Frieden",
      "Regenbogen",
      "Sonnenschein",
      "Schatz",
      "Universum",
      "Sieg",
      "Weisheit",
      "Jugend",
    ]
  }

  static getCzechWords() {
    return [
      "jablko",
      "banán",
      "třešeň",
      "pes",
      "slon",
      "les",
      "zahrada",
      "dům",
      "ostrov",
      "džungle",
      "kotě",
      "lev",
      "hora",
      "oceán",
      "tučňák",
      "královna",
      "řeka",
      "slunce",
      "strom",
      "deštník",
      "fialka",
      "voda",
      "xylofon",
      "žlutý",
      "zebra",
      "dobrodružství",
      "krásný",
      "krystal",
      "diamant",
      "energie",
      "fantazie",
      "kytara",
      "harmonie",
      "představivost",
      "cesta",
      "vědění",
      "smích",
      "magie",
      "příroda",
      "oceán",
      "mír",
      "duha",
      "sluneční světlo",
      "poklad",
      "vesmír",
      "vítězství",
      "moudrost",
      "mládí",
    ]
  }

  static async generateInitialWords(count = 20, language = "en") {
    console.log(
      "🚀 WordGenerator: Generating initial",
      count,
      "words in",
      language
    )

    return this.generateWordsLocal(count, language)
  }

  static async generateMoreWords(
    batchSize = 20,
    startIndex = 0,
    language = "en"
  ) {
    console.log(
      "📦 WordGenerator: Generating more",
      batchSize,
      "words from index",
      startIndex,
      "in",
      language
    )

    const words = await this.generateWordsLocal(batchSize, language)

    // Update positions to continue from startIndex
    return words.map((word, index) => ({
      ...word,
      position: startIndex + index,
    }))
  }

  static async generateWordsBatch(
    batchSize = 100,
    totalCount = 10000,
    language = "en"
  ) {
    console.log(
      "📦 WordGenerator: Generating batch of",
      batchSize,
      "words in",
      language
    )

    return this.generateWordsLocal(batchSize, language)
  }

  /**
   * Get available languages
   */
  static getAvailableLanguages() {
    return ["en", "de", "cs"]
  }
}
