describe("Personal Dictionary App", () => {
  it("should validate word input", () => {
    cy.visit("/")

    // Check if setup page is shown
    cy.get("body").then(($body) => {
      if ($body.find(".setup-page").length > 0) {
        // Complete setup if needed
        cy.completeSetup()
      }
    })

    cy.waitForWordsToLoad()

    // Try to add empty word
    cy.get(".add-input").focus()
    cy.get(".btn-success").should("be.disabled")

    // Try to add word with only spaces
    cy.get(".add-input").type("   ")
    cy.get(".btn-success").should("be.disabled")
  })

  it("should show setup page on first visit", () => {
    // Clear localStorage to simulate first visit
    cy.clearLocalStorage()
    cy.visit("/")

    // Should show setup page
    cy.get(".setup-page").should("be.visible")
    cy.get("#totalWords").should("be.visible")
    cy.get("#language").should("be.visible")
  })
})
