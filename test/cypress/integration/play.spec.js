describe("Login Page", () => {
  it("defaults to login page", () => {
    cy.clearCookies();
    cy.visit('/');
    cy.title().should('contain', 'Graaly');
    cy.url().should('contain', '/user/login');
  });

  it("general test", () => {
    cy.get('[test-id = qrcodestart]')
      .should("not.exist");
  });

  it("Should type in testinformation", () => {
    cy.get('[test-id = emailLogin]')
      .type("richardadrien0@gmail.com")
      .should('have.value', "richardadrien0@gmail.com")

    cy.get('[test-id = passLogin]')
      .type("Toto1234")
      .should('have.value', "Toto1234")
  });

  it("shoudl go back to login page"), () => {
    cy.get('[test-id = gobacktosignup]').click();
    cy.url().should('contain', '/user/login');
  }

  it("GotoMainPage", () => {
    cy.visit('/');
  });
});
