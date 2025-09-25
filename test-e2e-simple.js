#!/usr/bin/env node

const http = require("http")
const { spawn } = require("child_process")

console.log("🧪 Spouštím jednoduché E2E testy...")

// Test 1: Aplikace se načítá
function testAppLoads() {
  return new Promise((resolve, reject) => {
    const req = http.get("http://localhost:5173/", (res) => {
      if (res.statusCode === 200) {
        console.log("✅ Test 1: Aplikace se načítá (HTTP 200)")
        resolve(true)
      } else {
        console.log(
          "❌ Test 1: Aplikace se nenačítá (HTTP " + res.statusCode + ")"
        )
        reject(false)
      }
    })

    req.on("error", (err) => {
      console.log("❌ Test 1: Chyba při načítání aplikace:", err.message)
      reject(false)
    })

    req.setTimeout(5000, () => {
      console.log("❌ Test 1: Timeout při načítání aplikace")
      reject(false)
    })
  })
}

// Test 2: Aplikace obsahuje správné elementy
function testAppContent() {
  return new Promise((resolve, reject) => {
    const req = http.get("http://localhost:5173/", (res) => {
      let data = ""

      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        if (data.includes('id="app"') && data.includes("vite")) {
          console.log("✅ Test 2: Aplikace obsahuje správné elementy")
          resolve(true)
        } else {
          console.log("❌ Test 2: Aplikace neobsahuje očekávané elementy")
          reject(false)
        }
      })
    })

    req.on("error", (err) => {
      console.log("❌ Test 2: Chyba při testování obsahu:", err.message)
      reject(false)
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

// Spustit všechny testy
async function runTests() {
  const tests = [
    { name: "App Loads", fn: testAppLoads },
    { name: "App Content", fn: testAppContent },
    { name: "Build", fn: testBuild },
    { name: "Unit Tests", fn: testUnitTests },
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
    process.exit(0)
  } else {
    console.log("\n💥 Některé testy selhaly!")
    process.exit(1)
  }
}

runTests().catch(console.error)
