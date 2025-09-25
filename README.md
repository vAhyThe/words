# 📚 Personal Dictionary

Modern frontend-only single-page application for managing your personal dictionary with advanced features like drag & drop, search, and CRUD operations.

## 🚀 Features

- **10,000+ words** - Application generates over 10,000 words locally using custom word lists
- **Multi-language support** - English, German, and Czech word generation
- **Drag & Drop** - Change word order by dragging
- **Real-time search** - Fast search with instant filtering
- **CRUD operations** - Add, edit, and delete words
- **Local storage** - All data is saved to localStorage
- **Responsive design** - Works on all devices
- **High performance** - Optimized for working with large amounts of data
- **No external dependencies** - Works without backend server
- **Automatic language switching** - Dictionary resets when language changes

## 🛠️ Technologies

- **Vue.js 3** - Modern JavaScript framework with Composition API
- **Vite** - Fast build tool and dev server
- **Vue Draggable** - Drag & drop functionality
- **Vitest** - Unit testing framework
- **Cypress** - End-to-end testing
- **Custom Word Generator** - Local word generation with language support
- **i18n** - Internationalization support
- **Frontend-only** - No backend dependencies

## 📋 Requirements

- Node.js 16+
- npm or yarn

## 🚀 Installation and Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd personal-dictionary
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the application**

   ```bash
   npm run dev
   ```

4. **Open the application**
   - Application will be available at `http://localhost:5173`

## 🌐 Live Demo

**Try the application online**: [words.tomasvahala.com](https://words.tomasvahala.com)

## 🧪 Testing

### Unit tests

```bash
npm run test:unit
```

### End-to-end tests

```bash
# Interactive mode
npm run test:e2e

# Headless mode
npm run test:e2e:headless

# Reliable E2E tests (works on macOS)
npm run test:e2e:reliable
```

### All tests

```bash
npm run test
```

## 📦 Production Build

```bash
npm run build
```

Built files will be in the `dist/` folder.

## 🎯 Usage

### Basic Operations

- **Adding words**: Enter words in the "New words" field (separated by comma) and click "Add words"
- **Searching**: Use the search field to filter words
- **Editing**: Click the ✏️ icon next to a word to edit it
- **Deleting**: Click the 🗑️ icon next to a word to delete it
- **Reordering**: Drag words to change their order

### Advanced Features

- **Bulk adding**: You can add multiple words at once separated by commas
- **Automatic saving**: All changes are automatically saved to localStorage
- **Language switching**: Change language and dictionary automatically resets
- **Responsive design**: Application adapts to screen size

## 🏗️ Architecture

```
src/
├── components/
│   ├── WordItem.vue          # Individual word component
│   ├── LazyWordList.vue      # Main word list with lazy loading
│   ├── SetupPage.vue         # Initial setup page
│   └── __tests__/            # Unit tests for components
├── services/
│   ├── wordGenerator.js      # Local word generation with language support
│   ├── storageService.js     # localStorage management
│   ├── i18n.js              # Internationalization service
│   └── __tests__/            # Unit tests for services
├── locales/
│   ├── en.js                # English translations
│   ├── de.js                # German translations
│   └── cs.js                # Czech translations
├── App.vue                   # Main application component
├── main.js                   # Entry point
└── style.css                 # Application styles
```

## ⚡ Performance Optimization

The application is optimized for working with large amounts of data:

- **Lazy loading** - Words are loaded in batches (100 words at a time by default)
- **Local generation** - Words are generated locally without network requests
- **Efficient search** - Real-time filtering without delays
- **Minimized re-renders** - Uses Vue 3 Composition API for better performance
- **localStorage cache** - Fast loading on subsequent runs
- **Language-specific word lists** - Pre-defined word lists for each language

## 🐛 Known Issues

- Drag & drop can be slow with large amounts of words (10k+)
- Some browsers may have issues with localStorage with large amounts of data

## 🔮 Future Improvements

- [ ] Export/import dictionary
- [ ] Word categorization
- [ ] Offline mode with Service Worker
- [ ] PWA functionality
- [ ] More languages for word generation
- [ ] Word statistics and analytics

## 📊 Development Time

**Total time: ~8 hours**

- Project setup and configuration: 1 hour
- Basic functionality implementation: 2 hours
- Drag & drop functionality: 1 hour
- Multi-language support: 1.5 hours
- Testing and optimization: 1.5 hours
- Documentation and README: 1 hour

## 📝 Notes

- Application uses custom word generation with language-specific word lists (50 words per language)
- All data is stored locally, no external API or backend server needed
- Drag & drop works using HTML5 Drag & Drop API
- Application is fully responsive and works on all modern browsers
- Frontend-only solution - just run `npm install && npm run dev`
- Supports English, German, and Czech languages
- Automatic dictionary reset when language changes

## 📄 License

MIT License - see LICENSE file for details.

---

**Author**: Vahy  
**Date**: 2024  
**Version**: 1.0.0
