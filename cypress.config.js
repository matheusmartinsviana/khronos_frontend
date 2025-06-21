import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // ou a URL do seu front
    setupNodeEvents(on, config) {
      // configurações adicionais se precisar
    },
  },
})
