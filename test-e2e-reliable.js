#!/usr/bin/env node

const http = require("http")
const { spawn } = require("child_process")
const fs = require("fs")

console.log("🧪 Spouštím spolehlivé E2E testy...")

// Test 1: Aplikace se načítá
function testAppLoads() {
  return new Promise((resolve, reject) => {
    console.log("🌐 Test 1: Testuji načítání aplikace...")

    const curl = spawn("curl", [
      "-s",
      "-o",
      "/dev/null",
      "-w",
      "%{http_code}",
      "http://localhost:5173/",
    ])

    let output = ""

    curl.stdout.on("data", (data) => {
      output += data.toString()
    })

    curl.stderr.on("data", (data) => {
      output += data.toString()
    })

    curl.on("close", (code) => {
      if (code === 0 && output.trim() === "200") {
        console.log("✅ Test 1: Aplikace se načítá (HTTP 200)")
        resolve(true)
      } else {
        console.log(
          "❌ Test 1: Aplikace se nenačítá (HTTP " +
            output.trim() +
            ", exit code: " +
            code +
            ")"
        )
        reject(false)
      }
    })
  })
}

// Test 2: Aplikace obsahuje správné elementy
function testAppContent() {
  return new Promise((resolve, reject) => {
    console.log("🔍 Test 2: Testuji obsah aplikace...")

    const curl = spawn("curl", ["-s", "http://localhost:5173/"])

    let data = ""

    curl.stdout.on("data", (chunk) => {
      data += chunk.toString()
    })

    curl.stderr.on("data", (data) => {
      // Ignore stderr for curl
    })

    curl.on("close", (code) => {
      if (code === 0 && data.includes('id="app"') && data.includes("vite")) {
        console.log("✅ Test 2: Aplikace obsahuje správné elementy")
        resolve(true)
      } else {
        console.log("❌ Test 2: Aplikace neobsahuje očekávané elementy")
        reject(false)
      }
    })
  })
}

// Test 3: Build funguje
function testBuild() {
  return new Promise((resolve, reject) => {
    console.log("🔨 Test 3: Testuji build...")

    const build = spawn("npm", ["run", "build"], { stdio: "pipe" })

    build.stdout.on("data", (data) => {
      process.stdout.write(data)
    })

    build.stderr.on("data", (data) => {
      process.stderr.write(data)
    })

    build.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Test 3: Build funguje")
        resolve(true)
      } else {
        console.log("❌ Test 3: Build selhal (exit code: " + code + ")")
        reject(false)
      }
    })
  })
}

// Test 4: Unit testy fungují
function testUnitTests() {
  return new Promise((resolve, reject) => {
    console.log("🧪 Test 4: Testuji unit testy...")

    const test = spawn("npm", ["run", "test:unit"], { stdio: "pipe" })

    let output = ""

    test.stdout.on("data", (data) => {
      output += data.toString()
    })

    test.stderr.on("data", (data) => {
      output += data.toString()
    })

    test.on("close", (code) => {
      if (code === 0 && output.includes("passed")) {
        console.log("✅ Test 4: Unit testy fungují")
        resolve(true)
      } else {
        console.log("❌ Test 4: Unit testy selhaly (exit code: " + code + ")")
        console.log("Output:", output)
        reject(false)
      }
    })
  })
}

// Test 5: Cypress testy jsou připravené
function testCypressReady() {
  return new Promise((resolve, reject) => {
    console.log("🔧 Test 5: Kontroluji Cypress testy...")

    // Zkontroluj, jestli existují Cypress soubory
    const cypressFiles = [
      "cypress.config.js",
      "cypress/e2e/dictionary.cy.js",
      "cypress/support/commands.js",
      "cypress/support/e2e.js",
    ]

    let allExist = true
    for (const file of cypressFiles) {
      if (!fs.existsSync(file)) {
        console.log("❌ Test 5: Chybí soubor:", file)
        allExist = false
      }
    }

    if (allExist) {
      console.log("✅ Test 5: Cypress testy jsou připravené")
      resolve(true)
    } else {
      console.log("❌ Test 5: Cypress testy nejsou kompletní")
      reject(false)
    }
  })
}

// Test 6: Aplikace má správné závislosti
function testDependencies() {
  return new Promise((resolve, reject) => {
    console.log("📦 Test 6: Kontroluji závislosti...")

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
    const requiredDeps = ["vue"]
    const requiredDevDeps = ["cypress", "vitest", "vite"]

    let allDepsOk = true

    // Zkontroluj dependencies
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        console.log("❌ Test 6: Chybí dependency:", dep)
        allDepsOk = false
      }
    }

    // Zkontroluj devDependencies
    for (const dep of requiredDevDeps) {
      if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
        console.log("❌ Test 6: Chybí devDependency:", dep)
        allDepsOk = false
      }
    }

    if (allDepsOk) {
      console.log("✅ Test 6: Všechny závislosti jsou v pořádku")
      resolve(true)
    } else {
      console.log("❌ Test 6: Některé závislosti chybí")
      reject(false)
    }
  })
}

// Test 7: Aplikace má správnou strukturu
function testAppStructure() {
  return new Promise((resolve, reject) => {
    console.log("🏗️ Test 7: Kontroluji strukturu aplikace...")

    const requiredFiles = [
      "src/App.vue",
      "src/main.js",
      "src/components/LazyWordList.vue",
      "src/components/SetupPage.vue",
      "src/services/wordGenerator.js",
      "src/services/i18n.js",
      "src/services/storageService.js",
      "src/locales/en.js",
      "src/locales/de.js",
      "src/locales/cs.js",
    ]

    let allExist = true
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.log("❌ Test 7: Chybí soubor:", file)
        allExist = false
      }
    }

    if (allExist) {
      console.log("✅ Test 7: Struktura aplikace je v pořádku")
      resolve(true)
    } else {
      console.log("❌ Test 7: Struktura aplikace není kompletní")
      reject(false)
    }
  })
}

// Spustit všechny testy
async function runTests() {
  const tests = [
    { name: "App Loads", fn: testAppLoads },
    { name: "App Content", fn: testAppContent },
    { name: "Build", fn: testBuild },
    { name: "Unit Tests", fn: testUnitTests },
    { name: "Cypress Ready", fn: testCypressReady },
    { name: "Dependencies", fn: testDependencies },
    { name: "App Structure", fn: testAppStructure },
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      await test.fn()
      passed++
    } catch (error) {
      failed++
    }
  }

  console.log("\n📊 Výsledky testů:")
  console.log(`✅ Prošlo: ${passed}`)
  console.log(`❌ Selhalo: ${failed}`)
  console.log(
    `📈 Úspěšnost: ${Math.round((passed / (passed + failed)) * 100)}%`
  )

  if (failed === 0) {
    console.log("\n🎉 Všechny testy prošly!")
    console.log("\n💡 Pro E2E testování použij:")
    console.log("   npm run test:unit  - Unit testy (funguje)")
    console.log("   npm run build      - Build test (funguje)")
    console.log("   npm run dev        - Manuální testování")
    process.exit(0)
  } else {
    console.log("\n💥 Některé testy selhaly!")
    process.exit(1)
  }
}

runTests().catch(console.error)
