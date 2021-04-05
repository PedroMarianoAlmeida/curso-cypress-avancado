describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  it('shows the footer', () => {
    cy.visit('/')
    cy.get('footer')
      .should('be.visible')
      .and('contain', 'Icons made by Freepik from www.flaticon.com')
  })

  context('Hiting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStoriesRealAPI')
  
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: newTerm,
          page: '0'
        }
      }).as('getNewTermStoriesRealAPI')
  
      cy.visit('/')
  
      cy.wait('@getStoriesRealAPI')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNextStoriesRealAPI');

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()
      cy.wait('@getNextStoriesRealAPI')

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.get('#search')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStoriesRealAPI');

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStoriesRealAPI');

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Moking the API', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${initialTerm}&page=0`,
        {fixture: 'stories'}
      ).as('getStoriesMockAPI')
  
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: newTerm,
          page: '0'
        }
      }).as('getNewTermStoriesMockAPI')
  
      cy.visit('/')
  
      cy.wait('@getStoriesMockAPI')
    })
    
    context('List of stories', () => {
      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I assert on the data?
      // This is why this test is being skipped.
      // TODO: Find a way to test it out.
      it.skip('shows the right data for all rendered stories', () => { })
  
      it('shows one less story after dimissing the first one', () => {
        cy.get('.button-small')
          .first()
          .click()
  
        cy.get('.item').should('have.length', 1)
      })
  
      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I test ordering?
      // This is why these tests are being skipped.
      // TODO: Find a way to test them out.
      context.skip('Order by', () => {
        it('orders by title', () => { })
  
        it('orders by author', () => { })
  
        it('orders by comments', () => { })
  
        it('orders by points', () => { })
      })
    })
  
    context('Search', () => {
      beforeEach(() => {
        cy.get('#search')
          .clear()
      })
  
      //Instrutor retirou esse teste do treinamento pq um usuário não tem como fazer, mas vou deixar =D
      it('types and submits the form directly', () => {
        cy.get('form input[type="text"]')
          .should('be.visible')
          .clear()
          .type(newTerm)
        cy.get('form').submit()
  
        // Assertion here
        cy.wait('@getNewTermStoriesMockAPI')
  
        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
      })
  
      it('types and hits ENTER', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)
  
        cy.wait('@getNewTermStoriesMockAPI')
  
        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      it('types and clicks the submit button', () => {
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()
  
        cy.wait('@getNewTermStoriesMockAPI')
  
        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')
  
          cy.intercept(
            'GET',
            '**/search**'
          ).as('getRandomStoriesMockAPI')
  
          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
  
            cy.wait('@getRandomStoriesMockAPI')
  
          })
  
          cy.get('.last-searches button')
            .should('have.length', 5)
        })
      })
    })
  })


})

context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { statusCode: 500 }
    ).as('getServerFailure')

    cy.visit('/')

    cy.wait('@getServerFailure')

    cy.get('p:contains(Something went wrong ...)').should('be.visible');

  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept(
      'GET',
      '**/search**',
      { forceNetworkError: true }
    ).as('getNetworkFailure')

    cy.visit('/')

    cy.wait('@getNetworkFailure')

    cy.get('p:contains(Something went wrong ...)').should('be.visible');

  })
})
