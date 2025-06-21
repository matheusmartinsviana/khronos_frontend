/// <reference types="cypress" />

Cypress.Commands.add('login', (email = 'erich@khronos.com', password = '123456') => {
  cy.visit('/login')

  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('button[type=submit]').click()

  // Confirma que o login aconteceu (ajuste conforme seu app)
  cy.url().should('not.include', '/login')
})