describe('Tela de vendas', () => {
    before(() => {
        cy.login();
        cy.visit('/vendas')
    })
    it('deve concluir o fluxo completo de venda com stepper', () => {
        // Etapa 1: Iniciar venda
        cy.get('[data-testid="start-sale_button"]').click();
        cy.get('[data-testid="notification"]').should('contain', 'Nova venda iniciada');

        // Etapa 2: Selecionar cliente
        cy.get('[data-testid="clientes-grid"]').should('exist');
        cy.get('[data-testid="cliente-card"]').first().click();
        cy.get('[data-testid="next-step-button"]').click();

        // Etapa 3: Adicionar produtos
        cy.get(':nth-child(1) > [data-testid="card-content"]').first().click();
        cy.get('[data-testid="next-step-button"]').click();

        // Etapa 4: Selecionar serviços
        cy.get('[data-testid="next-step-button"]').click();

        // Etapa 5: Resumo da venda
        cy.get('[data-testid="next-step-button"]').click();

        // Etapa 6: Finalizar venda
        cy.get('[data-testid="finalizar-venda-button"]').click();

        // Verificar notificação de venda concluída
        cy.get('[data-testid="notification"]').should('contain', 'Venda finalizada com sucesso');

    });

})
