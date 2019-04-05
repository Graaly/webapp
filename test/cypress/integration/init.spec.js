//import * as ctx from  '../../../quasar.conf.js'

describe('Sanity check', () => {
  it('defaults to "first usage" page', () => {
    cy.visit('/')
    cy.title().should('contain', 'Graaly')
    cy.url().should('contain', '/#/firstusage')
  })
  
  it('lands on login page after touching right arrow several times', () => {
    let nbTouches = 4
    
    cy.visit('/')
    
    for (let i = 0; i < nbTouches; i++) {
      cy.get('.q-carousel-right-arrow').click()
    }
    
    cy.url().should('contain', '/#/user/login')
  })
  
  it('refuses wrong emails', () => {
    cy.visit('/#/user/login')
    cy.get('[test-id="login"] input').type('qqsdfqsdf')
    cy.get('button[type="submit"]').click()
    cy.get('body').click() // leave focus from submit button
    cy.get('[test-id="login"] .q-field__messages').should('contain', 'Veuillez saisir une adresse email valide')
  })
  
  it('allows to create an account (unknown email)', () => {
    cy.visit('/#/user/login')
    cy.get('[test-id="login"] input').type('test@unknown.com')
    cy.get('button[type="submit"]').click()
    cy.url().should('contain', '#/user/createAccount')
    
    cy.get('[test-id="name"] input').type('Test Player')
    
    cy.get('[test-id="sex"] .q-field__append > .fas').click()
    cy.get('[test-id="sex"] .q-local-menu > .q-item:nth-child(1)').click() // man
    
    cy.get('[test-id="age"] .q-field__append > .fas').click()
    cy.get('[test-id="age"] .q-local-menu > .q-item:nth-child(3)').click() // 40-49
    
    cy.get('[type="submit"]').click() // next page
    
    cy.get('[test-id="country"] .q-field__append > .fas').click()
    cy.get('[test-id="country"] .q-local-menu > .q-item:nth-child(5)').click() // note that some countries are not displayed if user does not scrolls down the list
    
    cy.get('[test-id="zip"] input').type('38430')
    
    // next page
    cy.get('[type="submit"]').click()
    
    cy.get('[test-id="password"] input').type('ab12#$XYh')
    
    cy.get('[test-id="terms"] .q-checkbox__check').click()
    cy.get('[test-id="privacy"] .q-checkbox__check').click()
    
    // next page
    cy.get('[type="submit"]').click()
    
    cy.get('[test-id="enter-code"]') // fails if element not found
    
    // we can't go further because the required code is sent by email.
  })
  
  it('logins', () => {
    cy.visit('/#/user/login')
    cy.get('[test-id="login"] input').type('maxime.pacary@gmail.com')
    cy.get('[type="submit"]').click() // next button
    cy.url().should('contain', '#/user/login') // check that URL has not changed
    cy.get('[test-id="password"] input').type('toto')
    cy.get('[type="submit"]').click() // next button
    cy.url().should('contain', '#/map') // map page should be displayed
  })
  
  /*it('shows quests pane', () => {
    cy.visit('/#/map')
  })*/
  
  it('shows profile pane')
  
  it('shows main menu')
  
  it('creates a quest')
  
  it('plays a quest')
  
  it('logouts')
})
