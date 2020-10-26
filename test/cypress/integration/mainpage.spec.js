describe("Login Page", () => {
  it("defaults to login page", () => {
    cy.clearCookies();
    cy.visit('/');
    cy.title().should('contain', 'Graaly');
    cy.url().should('contain', '/user/login');
  });

  it("Should go to sign-up page and back", () => {
    cy.visit('/');
    cy.get('div.centered > a').click();
    cy.url().should('contain', '/user/createAccount/generic');
    cy.get('a').click();
    cy.url().should('contain', '/user/login');
  });

  it("Should open forgotten password popup", () => {
    cy.get(':nth-child(1) > .centered > a').click();
    cy.get('#qf_8a93b966-733f-19b3-ed41-3f65a1a8df2a');
  });

  it("Should go to sign-up page", () => {
    cy.get('div.centered > a').click();
    cy.url().should('contain', '/user/createAccount/generic');
  });

  it("GotoMainPage", () => {
    cy.visit('/');
  });
});
