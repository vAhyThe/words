// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add("addWord", (word) => {
  cy.get(".add-input").type(word)
  cy.get(".btn-success").click()
  // Wait for page reload after adding words
  cy.wait(1000)
})

Cypress.Commands.add("searchWord", (query) => {
  cy.get(".search-input").type(query)
})

Cypress.Commands.add("clearSearch", () => {
  cy.get(".btn-primary").contains("Clear").click()
})

Cypress.Commands.add("waitForWordsToLoad", () => {
  // Wait for loading to finish
  cy.get(".loading", { timeout: 10000 }).should("not.exist")
  // Wait for words to appear
  cy.get(".word-item", { timeout: 10000 }).should("have.length.greaterThan", 0)
})

Cypress.Commands.add("waitForSetupComplete", () => {
  // Wait for setup page to disappear
  cy.get(".setup-page", { timeout: 10000 }).should("not.exist")
  // Wait for main app to load
  cy.get(".header", { timeout: 10000 }).should("be.visible")
})

Cypress.Commands.add("completeSetup", () => {
  // Fill setup form
  cy.get("#totalWords").clear().type("1000")
  cy.get("#batchSize").clear().type("50")
  cy.get("#initialWords").clear().type("50")
  cy.get("#language").select("en")

  // Start dictionary
  cy.get(".btn-primary").contains("Start Dictionary").click()

  // Wait for setup to complete
  cy.waitForSetupComplete()
})
