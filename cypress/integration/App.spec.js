describe("Base Reshuffle Application", () => {
  it("Shows Learn Reshuffle", () => {
    cy.visit("/");
    cy.contains('Learn Reshuffle');
  });
});
