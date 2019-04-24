//import * as ctx from  '../../../quasar.conf.js'

describe('Account actions', () => {
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
  
  it('logins and logouts', () => {
    doLogin()
    cy.url().should('contain', '#/map') // map page should be displayed
    cy.get('[test-id="btn-profile-pane"]').click()
    cy.get('[test-id="btn-signout"]').click()
    cy.url().should('match', /#\/(user\/login|firstusage)/)
  })
})

describe('Map panels', () => {
  before(() => {
    doLogin()
  })
  
  it('shows quests pane', () => {
    cy.visit('/#/map')
    cy.get('[test-id="btn-quests-pane"]').click()
    cy.get('[test-id="quests-pane"] .q-drawer__content').should('be.visible')
  })
  
  it('shows profile pane', () => {
    cy.visit('/#/map')
    cy.get('[test-id="btn-profile-pane"]').click()
    cy.get('[test-id="profile-pane"] .q-drawer__content').should('be.visible')
  })
  
  it('shows main menu', () => {
    cy.visit('/#/map')
    cy.get('[test-id="btn-bottom-menu"]').click()
    cy.get('[test-id="bottom-menu"]').should('be.visible')
  })
})

describe.only('Quests', () => {
  before(() => {
    doLogin()
  })
  
  it('creates a quest', () => {
    cy.wait(500)
    cy.get('[test-id="btn-bottom-menu"]').click()
    cy.get('[test-id="bottom-menu"]').should('be.visible')
    cy.get('[test-id="btn-create-quest"]').click()
    cy.get('[test-id="btn-create-public-quest"]').click()
    cy.get('[test-id="btn-accept-rules"]').click()
    
    // settings - language
    cy.url().should('contain', '#/quest/setting')
    cy.get('[test-id="btn-save-language"]').click()
    
    // settings - other
    cy.get('#startingplace').type('test')
    cy.wait(200)
    cy.get('.pac-container .pac-item:first-child').trigger('mouseover').click()
    cy.wait(200)
    cy.get('[test-id="btn-save-settings"]').click()
    
    // close notification (can cover input fields & Cypress is not happy when using .type() or .clear())
    cy.get('.q-notification button').click()
    
    // create steps
    /*cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-info-text"]').click({force: true}) // directly force click on button to select step type (could not find an easy way to expand the "expansion item")
    cy.get('[test-id="step-title"] input').clear().type('step 1 title')
    cy.get('[test-id="step-text"] textarea').type('step 1 text')
    doUpload('[test-id="background-upload"]', 'crash-test.jpg', 'image/jpeg')
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click() // preview
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-info-video"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 2 title')
    cy.get('[test-id="step-text"] textarea').type('step 2 text')
    doUpload('[test-id="video-upload"]', 'crash-test.mp4', 'video/mp4')
    cy.get('[test-id="uploaded-video"]').should('be.visible')
    cy.get('[test-id="btn-save-step"]').click()
    // note: could not find a simple way to prevent video autoplay, leaving as is
    cy.get('[test-id="btn-next-step"]').click() // preview
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-new-item"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 3 title')
    cy.get('[test-id="step-text"] textarea').type('step 3 text')
    cy.get('[test-id="radio-select-new-item-in-list"]').click()
    cy.get('.objects-list :nth-child(12)').click()
    cy.get('[test-id="img-new-item"]').should('be.visible')
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click() // preview
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-character"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 4 title')
    cy.get('[test-id="step-text"] textarea').type('step 4 text')
    cy.get('[test-id="radio-character-to-select"]').click()
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click() // preview
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-geolocation"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 5 title')
    cy.get('[test-id="step-text"] textarea').type('step 5 text')
    cy.get('#destination').type('tes')
    cy.wait(200)
    cy.get('.pac-container .pac-item:nth-child(3)').trigger('mouseover').click()
    cy.wait(200)
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-locate-item-ar"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 6 title')
    cy.get('[test-id="step-text"] textarea').type('step 6 text')
    cy.get('[test-id="radio-locate-item-3d"]').click()
    cy.get('#destination').type('cra')
    cy.wait(200)
    cy.get('.pac-container .pac-item:nth-child(3)').trigger('mouseover').click()
    cy.wait(200)
    cy.get('[test-id="select-3d-model"] .q-field__append > .fas').click()
    cy.get('[test-id="select-3d-model"] .q-local-menu > .q-item:nth-child(4)').click() // chest
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click()*/
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-locate-marker"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 7 title')
    cy.get('[test-id="step-text"] textarea').type('step 7 text')
    cy.get('[test-id="btn-open-choose-marker-modal"]').click()
    cy.get('[test-id="btn-select-marker-007"]').click()
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click()
  })
  
  it('plays a quest')
})

function doLogin () {
  cy.visit('/#/user/login')
  cy.get('[test-id="login"] input').type('maxime.pacary@gmail.com')
  cy.get('[type="submit"]').click() // next button
  cy.url().should('contain', '#/user/login') // check that URL has not changed
  cy.get('[test-id="password"] input').type('toto')
  cy.get('[type="submit"]').click() // next button
  cy.url().should('contain', '#/map')
}

// found here: https://github.com/cypress-io/cypress/issues/170#issuecomment-477421775
function doUpload(selector, fixturePath, type) {
  cy.get(selector).then(subject => cy.window().then(win => cy
    .fixture(fixturePath, 'base64')
    .then(Cypress.Blob.base64StringToBlob)
    .then((blob) => {
      const el = subject[0]
      const filename = fixturePath.replace(/^.*[\\\/]/, '')
      const testFile = new win.File([blob], filename, { type })
      const dataTransfer = new win.DataTransfer()
      dataTransfer.items.add(testFile)
      el.files = dataTransfer.files
      cy.wrap(subject).trigger('change', { force: true })
    })))
}