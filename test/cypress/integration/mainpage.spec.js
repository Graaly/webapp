describe("My First Test", () => {
  it("defaults to login page", () => {
    cy.clearCookies()
    cy.visit('/')
    cy.title().should('contain', 'Graaly')
    cy.url().should('contain', '/#/user/login')    
  });
});
