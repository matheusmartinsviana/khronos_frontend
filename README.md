# Khronos | Sistema de Vendas (SFA)

Este repositório contém o desenvolvimento de um sistema web criado como parte do Trabalho de Conclusão de Semestre (TCS) no Senac, em parceria com a empresa **Khronos**.

---

## ✨ Funcionalidades

- ✅ Autenticação de usuários (login)
- 🛒 Registro de vendas com interface intuitiva
- ⚙️ Gerenciamento modular com TypeScript
- 🧪 Testes end-to-end com Cypress
- 💨 Estilização moderna com Tailwind CSS
- 🔒 Separação de responsabilidades (API, contexto, hooks, schemas)

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

# 📁 Project Structure – KHRONOS_FRONTEND

This is a **React + TypeScript + Vite** project with TailwindCSS, ESLint, and Cypress configured for a modern development experience.

---

## 🌳 Folder Structure

```bash
KHRONOS_FRONTEND/
├── cypress/               # E2E tests (Cypress)
├── dist/                  # Production build output (auto-generated)
├── node_modules/          # Project dependencies
├── public/                # Static public assets

├── src/                   # Application source code
│   ├── api/               # API calls and services
│   ├── assets/            # Static assets (images, icons, etc.)
│   ├── components/        # Reusable UI components
│   ├── context/           # React context (Auth, Theme, etc.)
│   ├── data/              # Static or mock data
│   ├── hooks/             # Custom React hooks
│   ├── layout/            # Layout components (Header, Footer, etc.)
│   ├── lib/               # Utility libraries/helpers
│   ├── pages/             # Application pages (route views)
│   ├── routes/            # Routing setup (React Router)
│   ├── schemas/           # Validation schemas (e.g., Zod, Yup)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root application component
│   ├── App.css            # Global styles for App
│   ├── index.css          # Tailwind/global styles
│   ├── main.tsx           # App entry point
│   └── vite-env.d.ts      # Vite environment types

├── .env                   # Environment variables
├── .gitignore             # Files/folders to ignore in Git
├── components.json        # Custom component configuration
├── cypress.config.js      # Cypress configuration
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML template (used by Vite)
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked versions of dependencies
├── postcss.config.ts      # PostCSS configuration (for Tailwind)
├── README.md              # Project documentation
├── tailwind.config.ts     # TailwindCSS configuration
├── tsconfig.app.json      # TypeScript config (app-specific)
├── tsconfig.json          # Base TypeScript config
├── tsconfig.node.json     # TypeScript config (node-specific)
└── vite.config.ts         # Vite configuration
