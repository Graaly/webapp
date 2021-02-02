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
      .type("coucoumail")
      .should('have.value', "coucoumail")
      .clear()
      .type("coucou@mail.com")
      .should('have.value', "coucou@mail.com")

    cy.get('[test-id = passLogin]')
      .type("coucoupass")
      .should('have.value', "coucoupass")
  });

  it("Should open forgotten password popup", () => {
    cy.get('[test-id = openForgotPass]').click();

    cy.get('[test-id = closeForgotpassPopup]')
      .should('be.visible');

    cy.get('[test-id = forgotpassInput]')
      .type("coucoumail")
      // .should('have.value', "coucoumail")
      .clear()
      .type("coucou@mail.com")
      .should('have.value', "coucou@mail.com");

    cy.get('[test-id = closeForgotpassPopup]').click();
  });

  it("Should go to sign-up page", () => {
    cy.visit('/');
    cy.get('[test-id = signupButton]').click();
    cy.url().should('contain', '/user/createAccount/generic');
  });

  it("Should enter test information", () => {
    cy.get('[test-id = username]')
      .type("testuser")
      .should('have.value', "testuser")
      .clear()
      .type("test urser 1234")
      .should('have.value', "test urser 1234");

    cy.get('[test-id = emailsignup]')
      .type("coucoumail")
      .should('have.value', "coucoumail")
      .clear()
      .type("coucou@mail.com")
      .should('have.value', "coucou@mail.com");

    cy.get('[test-id = password]')
      .type("passwordTest12345")
      .should('have.value', "passwordTest12345")
      .clear()
      .type("1KFHJKBFo__hzmlfj1JMLK")
      .should('have.value', "1KFHJKBFo__hzmlfj1JMLK");

 /*   cy.get('[test-id=submitform]')
      .click();

    cy.get('[test-id = sex]')
      .type("passwordtest12345")
      .should('have.value', "passwordtest12345")
      .clear()
      .type("1KFHJKBFo_'è_hzmlfj1JMLK")
      .should('have.value', "1KFHJKBFo_'è_hzmlfj1JMLK");*/

  });

  it("shoudl go back to login page"), () => {
    cy.get('[test-id = gobacktosignup]').click();
    cy.url().should('contain', '/user/login');
  }

  it("GotoMainPage", () => {
    cy.visit('/');
  });
});
