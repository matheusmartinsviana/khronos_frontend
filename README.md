# Khronos | Sistema de Vendas 

Este repositório contém o desenvolvimento de um sistema web criado como parte do Trabalho de Conclusão de Semestre (TCS) no Senac, em parceria com a empresa fictícia **Khronos**. O projeto simula um fluxo completo de autenticação de usuários e registro de vendas, com testes automatizados utilizando Cypress.

---

## ✨ Funcionalidades

- ✅ Autenticação de usuários (login)
- 🛒 Registro de vendas com interface intuitiva
- ⚙️ Gerenciamento modular com TypeScript
- 🧪 Testes end-to-end com Cypress
- 💨 Estilização moderna com Tailwind CSS
- 🔒 Separação de responsabilidades (API, contexto, hooks, schemas)

---

## 🧱 Estrutura do Projeto

KHRONOS_FRONTEND/
├── cypress/ # Testes E2E
├── dist/ # Build gerado
├── node_modules/ # Dependências
├── public/ # Arquivos públicos (favicon, etc)
├── src/ # Código-fonte principal
│ ├── api/ # Comunicação com backend
│ ├── assets/ # Imagens e recursos estáticos
│ ├── components/ # Componentes reutilizáveis
│ ├── context/ # Context API para estado global
│ ├── data/ # Dados estáticos, mocks
│ ├── hooks/ # React Hooks customizados
│ ├── layout/ # Componentes de layout (Navbar, Sidebar, etc)
│ ├── lib/ # Bibliotecas auxiliares
│ ├── pages/ # Páginas da aplicação
│ ├── routes/ # Rotas de páginas da aplicação
│ ├── schemas/ # Validações com Zod
│ ├── types/ # Tipagens TypeScript
│ ├── utils/ # Funções utilitárias
└── .env # Variáveis de ambiente

---

## 📦 Instalação

```bash
# Instalar dependências
npm install
```

```bash
# Rodar ambiente de desenvolvimento
npm run dev
```

```bash
# Abrir painel do Cypress
npx cypress open
```

## 🎓 Objetivo Acadêmico

Projeto desenvolvido para o Trabalho de Conclusão de Semestre (TCS) no Senac, com o objetivo de aplicar conhecimentos práticos em desenvolvimento web, testes automatizados e organização de código utilizando boas práticas de arquitetura front-end.
