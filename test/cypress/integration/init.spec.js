//import * as ctx from  '../../../quasar.conf.js'

describe('Account actions', () => {
  it('defaults to "first usage" page', () => {
    cy.clearCookies()
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
    cy.get('.q-menu > .q-item:nth-child(1)').click() // man
    
    cy.get('[test-id="age"] .q-field__append > .fas').click()
    cy.get('.q-menu > .q-item:nth-child(3)').click() // 40-49
    
    cy.get('[type="submit"]').click() // next page
    
    cy.get('[test-id="country"] .q-field__append > .fas').click()
    cy.get('.q-menu > .q-item:nth-child(5)').click() // note that some countries are not displayed if user does not scrolls down the list
    
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

describe('Quests', () => {
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
    cy.get('[test-id="btn-add-step"]').click()
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
    cy.get('.q-menu > .q-item:nth-child(4)').click() // chest
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-locate-marker"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 7 title')
    cy.get('[test-id="step-text"] textarea').type('step 7 text')
    cy.get('[test-id="btn-open-choose-marker-modal"]').click()
    cy.get('[test-id="btn-select-marker-007"]').click()
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click()
    
    testChooseStepCreation('text')
    
    testChooseStepCreation('image')
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-write-text"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 9 title')
    cy.get('[test-id="step-text"] textarea').type('step 9 question')
    cy.get('[test-id="input-text-answer"] input').type('answer')
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('.answer-text input').type('answerxyz!?') // same test-id but for play step
    cy.get('[test-id="btn-check-text-answer"]').click()
    cy.get('.q-notification').should('be.visible').should('contain', 'Try again') // wrong answer!
    cy.get('.q-notification button').click() // close notification
    cy.get('.answer-text input').clear().type('answer')
    cy.get('[test-id="btn-check-text-answer"]').click()
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-code-keypad"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 10 title')
    cy.get('[test-id="step-text"] textarea').type('step 10 question')
    cy.get('[test-id="input-code"] input').type('73*57#')
    cy.get('[test-id="btn-save-step"]').click()
    enterKeypadCode("123456")
    cy.get('.q-notification').should('be.visible').should('contain', 'Try again') // wrong answer!
    cy.get('.q-notification button').click() // close notification
    enterKeypadCode("73*57#")
    cy.get('.q-notification').should('be.visible').should('contain', 'Good answer') // good answer!
    cy.get('.q-notification button').click() // close notification
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-code-color"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 11 title')
    cy.get('[test-id="step-text"] textarea').type('step 11 question')
    // 3 colors code
    cy.get('[test-id="select-nb-colors"] .q-field__append > .fas').click()
    cy.get('.q-menu > .q-item:nth-child(3)').click()
    // set code to "RGB"
    cy.get('[test-id="select-color-1"] .q-field__append > .fas').click()
    cy.get('.q-menu > .q-item:nth-child(2)').click()
    cy.get('[test-id="select-color-2"] .q-field__append > .fas').click()
    cy.get('.q-menu > .q-item:nth-child(3)').click()
    cy.get('[test-id="btn-save-step"]').click()
    // test play
    cy.get('[test-id="btn-check-color-code"]').click()
    cy.get('.q-notification').should('be.visible').should('contain', 'Try again') // wrong answer!
    cy.get('.q-notification button').click() // close notification
    cy.get('[test-id="color-code-1"]').click() // turns green
    cy.get('[test-id="color-code-2"]').click() // turns green
    cy.get('[test-id="color-code-2"]').click() // turns blue
    cy.get('[test-id="btn-check-color-code"]').click()
    cy.get('.q-notification').should('be.visible').should('contain', 'Good answer') // good answer!
    cy.get('.q-notification button').click() // close notification
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-code-image"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 12 title')
    cy.get('[test-id="step-text"] textarea').type('step 12 question')
    doUpload('[test-id="image-code-0"]', 'crash-test.jpg', 'image/jpeg')
    doUpload('[test-id="image-code-1"]', 'crash-test-2.jpg', 'image/jpeg')
    doUpload('[test-id="image-code-2"]', 'crash-test-3.jpg', 'image/jpeg')
    doUpload('[test-id="image-code-3"]', 'keyboard-testing.jpg', 'image/jpeg')
    // 3 images code
    cy.get('[test-id="select-nb-images-in-code"] .q-field__append > .fas').click()
    cy.get('.q-menu > .q-item:nth-child(3)').click()
    // compose a code: 1=previous, 2=unchanged, 3=next
    cy.get('[test-id="previous-image-0"]').click()
    cy.get('[test-id="next-image-2"]').click()
    cy.get('[test-id="btn-save-step"]').click()
    // test play
    cy.get('[test-id="btn-check-image-code"]').click()
    cy.get('.q-notification').should('be.visible').should('contain', 'Try again') // wrong answer!
    cy.get('.q-notification button').click() // close notification
    cy.get('[test-id="previous-image-0"]').click()
    cy.get('[test-id="next-image-2"]').click()
    cy.get('[test-id="btn-check-image-code"]').click()
    cy.get('.q-notification').should('be.visible').should('contain', 'Good answer') // wrong answer!
    cy.get('.q-notification button').click() // close notification
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-find-item"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 13 title')
    cy.get('[test-id="step-text"] textarea').type('step 13 question')
    doUpload('[test-id="background-upload"]', 'crash-test.jpg', 'image/jpeg')
    cy.get('[test-id="btn-save-step"]').click()
    // test play
    cy.get('[test-id="find-item-picture"]').click(100, 100)
    cy.get('.q-notification').should('be.visible').should('contain', 'Nothing happens')
    cy.get('.q-notification button').click() // close notification
    cy.get('.q-notification').should('not.be.visible')
    cy.get('[test-id="find-item-picture"]').click(205, 280)
    cy.get('.q-notification').should('be.visible').should('contain', 'Well done')
    cy.get('.q-notification button').click() // close notification
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-use-item"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 14 title')
    cy.get('[test-id="step-text"] textarea').type('step 14 question')
    doUpload('[test-id="background-upload"]', 'crash-test-2.jpg', 'image/jpeg')
    cy.get('#useItemPicture').click(120, 330)
    cy.get('.inventory .q-select .q-field__append > .fas').click()
    cy.get('.q-menu > .q-item:nth-child(1)').click()
    cy.get('[test-id="btn-save-step"]').click()
    // test play
    cy.get('[test-id="btn-inventory"]').click()
    cy.get('.inventory-items div:nth-child(1)').click()
    cy.get('[test-id="use-item-picture"]').click(100, 100)
    cy.get('.q-notification').should('be.visible').should('contain', 'Nothing happens')
    cy.get('.q-notification button').click() // close notification
    cy.get('.q-notification').should('not.be.visible')
    cy.get('[test-id="use-item-picture"]').click(130, 350) // image is bigger when playing than when creating
    cy.get('.q-notification').should('be.visible').should('contain', 'Well done')
    cy.get('.q-notification button').click() // close notification
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-jigsaw-puzzle"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 15 title')
    cy.get('[test-id="step-text"] textarea').type('step 15 question')
    doUpload('[test-id="upload-puzzle-image"]', 'crash-test-3.jpg', 'image/jpeg')
    cy.get('.background-upload img').should('be.visible')
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click()
    
    cy.get('[test-id="btn-add-step"]').click()
    cy.get('[test-id="btn-select-step-type-memory"]').click({force: true})
    cy.get('[test-id="step-title"] input').clear().type('step 16 title')
    cy.get('[test-id="step-text"] textarea').type('step 16 question')
    doUpload('[test-id="memory-image-0"]', 'crash-test.jpg', 'image/jpeg')
    doUpload('[test-id="memory-image-1"]', 'crash-test-2.jpg', 'image/jpeg')
    doUpload('[test-id="memory-image-2"]', 'crash-test-3.jpg', 'image/jpeg')
    doUpload('[test-id="memory-image-3"]', 'keyboard-testing.jpg', 'image/jpeg')
    cy.get('[test-id="btn-save-step"]').click()
    cy.get('[test-id="btn-next-step"]').click()
  })
  
  it('plays a quest')
})

/**
 * Does login actions sequence
 */
function doLogin () {
  cy.visit('/#/user/login')
  cy.get('[test-id="login"] input').type('maxime.pacary@free.fr')
  cy.get('[type="submit"]').click() // next button
  cy.url().should('contain', '#/user/login') // check that URL has not changed
  cy.get('[test-id="password"] input').type('toto')
  cy.get('[type="submit"]').click() // next button
  cy.url().should('contain', '#/map')
}

/**
 * Does a file upload
 * Sample code found here: https://github.com/cypress-io/cypress/issues/170#issuecomment-477421775
 */
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

/**
 * test "choose" step creation (choose between several text or image options)
 * @param {String} type 'text' or 'image' 
 */
function testChooseStepCreation(type) {
  if (!['text', 'image'].includes(type)) {
    throw new Error('"choose" step type must be "text" or "image"')
  }
  
  cy.get('[test-id="btn-add-step"]').click()
  cy.get('[test-id="btn-select-step-type-choose"]').click({force: true})
  cy.get('[test-id="step-title"] input').clear().type('step 8 title (' + type + ' choice)')
  cy.get('[test-id="step-text"] textarea').type('step 8 text')
  
  if (type === 'text') {
    cy.get('[test-id="text-answer-0"] input').clear().type('test answer 1')
    cy.get('[test-id="text-answer-1"] input').clear().type('test answer 2')
    cy.get('[test-id="text-answer-2"] input').clear().type('test answer 3')
    cy.get('[test-id="text-answer-3"] input').clear().type('test answer 4')
  } else {
    cy.get('[test-id="radio-choose-images"]').click()
    doUpload('[test-id="image-answer-0"]', 'crash-test.jpg', 'image/jpeg')
    doUpload('[test-id="image-answer-1"]', 'crash-test-2.jpg', 'image/jpeg')
    doUpload('[test-id="image-answer-2"]', 'crash-test-3.jpg', 'image/jpeg')
    doUpload('[test-id="image-answer-3"]', 'keyboard-testing.jpg', 'image/jpeg')
  }
  
  // remove an answer
  cy.get('[test-id="delete-answer-2"]').click()
  cy.get('[test-id="' + type + '-answer-3"]').should('not.exist')
  if (type === 'text') {
    cy.get('[test-id="text-answer-2"] input').should('have.value', 'test answer 4')
  }
  // add an answer
  cy.get('[test-id="add-answer"]').click()
  cy.get('[test-id="' + type + '-answer-3"]')
  if (type === 'text') {
    cy.get('[test-id="text-answer-4"]').should('not.exist')
  } else {
    doUpload('[test-id="image-answer-3"]', 'crash-test-4.jpg', 'image/jpeg')
  }
  // change default answer
  cy.get('[test-id="radio-answer-2"]').click()
  // finish
  cy.get('[test-id="btn-save-step"]').click()
  cy.get('[test-id="answer-' + type + '-2"]').click()
  cy.get('[test-id="btn-next-step"]').click()
}

/**
 * Enters a code on keypad step
 * @param   {String}    code   example: "123456"    
 */
function enterKeypadCode(code) {
  for (let i = 0; i < code.length; i++) {
    cy.get('[test-id="btn-keypad-' + code.charAt(i) + '"]').click()
  }
  cy.get('[test-id="btn-check-keypad-answer"]').click()
}