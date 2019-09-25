describe("Base React Application", () => {
  it("Shows Learn React", () => {
    cy.visit("/");
    cy.contains('Learn React');
  });
});
