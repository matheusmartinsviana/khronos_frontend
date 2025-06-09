import type { Cliente, Produto } from "../types"

export const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "Clóvis de Barro Filho",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    tipo: "fisica",
    dataNascimento: "1980-05-15",
    contatos: [{ id: "1", tipo: "celular", numero: "+55(47) 99999-9999", email: "clovis@teste.com.br" }],
    observacoes: "Cliente preferencial",
  },
  {
    id: "2",
    nome: "Maria Silva Santos",
    cpf: "987.654.321-00",
    tipo: "fisica",
    dataNascimento: "1975-08-22",
    contatos: [{ id: "2", tipo: "celular", numero: "+55(47) 88888-8888", email: "maria@teste.com.br" }],
  },
  {
    id: "3",
    nome: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    tipo: "juridica",
    contatos: [{ id: "3", tipo: "comercial", numero: "+55(47) 3333-3333", email: "contato@abc.com.br" }],
  },
]

export const mockProdutos: Produto[] = [
  {
    id: "1",
    nome: "Sistema de Segurança Básico",
    preco: 1500.0,
    categoria: "Segurança",
    descricao: "Sistema básico com 4 câmeras HD",
    disponivel: true,
  },
  {
    id: "2",
    nome: "Sistema de Segurança Premium",
    preco: 3500.0,
    categoria: "Segurança",
    descricao: "Sistema premium com 8 câmeras 4K e monitoramento 24h",
    disponivel: true,
  },
  {
    id: "3",
    nome: "Alarme Residencial",
    preco: 800.0,
    categoria: "Alarme",
    descricao: "Sistema de alarme para residências com sensores",
    disponivel: true,
  },
  {
    id: "4",
    nome: "Controle de Acesso",
    preco: 2200.0,
    categoria: "Acesso",
    descricao: "Sistema de controle de acesso biométrico",
    disponivel: true,
  },
  {
    id: "5",
    nome: "Câmera IP Externa",
    preco: 450.0,
    categoria: "Câmeras",
    descricao: "Câmera IP para área externa com visão noturna",
    disponivel: false,
  },
  {
    id: "6",
    nome: "Central de Monitoramento",
    preco: 1200.0,
    categoria: "Monitoramento",
    descricao: "Central para monitoramento remoto",
    disponivel: true,
  },
]
