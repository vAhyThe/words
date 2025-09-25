import { ref } from "vue"
import en from "../locales/en.js"
import de from "../locales/de.js"
import cs from "../locales/cs.js"

const translations = {
  en,
  de,
  cs,
}

class I18nService {
  constructor() {
    this.currentLanguage = ref(this.getStoredLanguage() || "en")
    this.translations = translations
  }

  getStoredLanguage() {
    try {
      return localStorage.getItem("dictionaryLanguage") || "en"
    } catch (error) {
      console.error("Error loading language:", error)
      return "en"
    }
  }

  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage.value = language
      localStorage.setItem("dictionaryLanguage", language)
      return true
    }
    return false
  }

  getAvailableLanguages() {
    return [
      { code: "en", name: "English" },
      { code: "de", name: "Deutsch" },
      { code: "cs", name: "Čeština" },
    ]
  }

  t(key, params = {}) {
    const keys = key.split(".")
    let translation = this.translations[this.currentLanguage.value]

    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k]
      } else {
        // Fallback to English
        translation = this.translations.en
        for (const k of keys) {
          if (translation && translation[k]) {
            translation = translation[k]
          } else {
            return key // Return key if translation doesn't exist
          }
        }
        break
      }
    }

    // Replace parameters in text
    if (typeof translation === "string") {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match
      })
    }

    return translation || key
  }

  getCurrentLanguage() {
    return this.currentLanguage.value
  }
}

export const i18n = new I18nService()
