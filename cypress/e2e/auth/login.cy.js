describe('Tela de Login', () => {
    beforeEach(() => {
        cy.visit('/login') // ajuste conforme a sua rota real
    })

    it('deve exibir os campos de email e senha corretamente', () => {
        cy.get('input#email').should('be.visible').and('have.attr', 'type', 'email')
        cy.get('input#password').should('be.visible').and('have.attr', 'type', 'password')
        cy.get('button[type=submit]').should('contain', 'Entrar')
    })

    it('deve mostrar mensagem de erro com credenciais inválidas', () => {
        cy.get('#email').type('email@invalido.com')
        cy.get('#password').type('senhaerrada')
        cy.get('button[type=submit]').click()

        cy.contains('Erro ao fazer login').should('exist')
    })

    it('deve logar com sucesso com credenciais válidas', () => {
        cy.get('#email').type('erich@khronos.com')
        cy.get('#password').type('123456')
        cy.get('button[type=submit]').click()

        // Aguarda redirecionamento e verifica se o usuário está logado
        cy.url().should('not.include', '/login')
        cy.contains('dashboard', { matchCase: false }) // ajuste conforme sua dashboard
    })

    it('deve validar e-mail incorreto em tempo real', () => {
        cy.get('#email').type('emailinvalido')
        cy.contains('Por favor, insira um e-mail válido').should('exist')
    })

    it('deve validar senha muito curta em tempo real', () => {
        cy.get('#password').type('123')
        cy.contains('A senha deve ter pelo menos 6 caracteres').should('exist')
    })
})
