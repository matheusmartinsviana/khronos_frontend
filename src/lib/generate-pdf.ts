import type { Cliente, ProdutoSelecionado, Venda, User } from "@/types"

// Interface para o formato de dados esperado pelo gerador de PDF
interface VendaParaPDF {
  id: number
  data: string
  cliente: {
    nome: string
    cpf?: string
    cnpj?: string
    contatos: Array<{
      email?: string
      numero?: string
    }>
  }
  produtos: Array<{
    nome: string
    categoria: string
    quantidade: number
    preco: number
    zoneamento?: string
  }>
  total: number
  metodoPagamento: string
  vendedor: {
    nome: string
  }
  observacoes?: string
}

export function generatePDF(venda: VendaParaPDF): string {
  const dataFormatada = new Date(venda.data).toLocaleDateString("pt-BR")
  const horaFormatada = new Date(venda.data).toLocaleTimeString("pt-BR")

  // Criar conteúdo do PDF como HTML profissional
  const conteudo = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Relatório de Venda #${venda.id} - KHRONOS</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
          background: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #a31c1e 0%, #d32f2f 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1;
        }
        
        .company-subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }
        
        .document-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        
        .document-info {
          font-size: 16px;
          opacity: 0.95;
          position: relative;
          z-index: 1;
        }
        
        .content {
          padding: 30px;
        }
        
        .info-section {
          margin-bottom: 30px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #a31c1e;
        }
        
        .info-section h2 {
          color: #a31c1e;
          font-size: 20px;
          margin: 0 0 15px 0;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .info-section h2::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #a31c1e;
          border-radius: 50%;
          margin-right: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .info-item {
          background: white;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }
        
        .info-label {
          font-weight: 600;
          color: #495057;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .info-value {
          color: #212529;
          font-size: 15px;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .products-table thead {
          background: linear-gradient(135deg, #a31c1e 0%, #d32f2f 100%);
          color: white;
        }
        
        .products-table th {
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .products-table td {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
          vertical-align: top;
        }
        
        .products-table tbody tr:hover {
          background: #f8f9fa;
        }
        
        .products-table tbody tr:last-child td {
          border-bottom: none;
        }
        
        .item-number {
          background: #a31c1e;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .product-name {
          font-weight: 600;
          color: #212529;
          margin-bottom: 4px;
        }
        
        .product-category {
          font-size: 12px;
          color: #6c757d;
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 4px;
        }
        
        .product-zone {
          font-size: 11px;
          color: #495057;
          font-style: italic;
        }
        
        .price {
          font-weight: 600;
          color: #28a745;
        }
        
        .quantity {
          text-align: center;
          font-weight: 600;
        }
        
        .subtotal {
          font-weight: 600;
          color: #a31c1e;
        }
        
        .total-section {
          background: linear-gradient(135deg, #a31c1e 0%, #d32f2f 100%);
          color: white;
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
          text-align: center;
        }
        
        .total-label {
          font-size: 18px;
          margin-bottom: 10px;
          opacity: 0.9;
        }
        
        .total-value {
          font-size: 36px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .payment-method {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          color: #1565c0;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 25px;
          text-align: center;
          border-top: 3px solid #a31c1e;
          margin-top: 40px;
        }
        
        .footer-logo {
          font-size: 18px;
          font-weight: bold;
          color: #a31c1e;
          margin-bottom: 10px;
        }
        
        .footer-info {
          font-size: 12px;
          color: #6c757d;
          line-height: 1.5;
        }
        
        .generation-info {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
          font-size: 11px;
          color: #868e96;
        }
        
        .status-badge {
          background: #28a745;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: rgba(163, 28, 30, 0.05);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
        
        @media (max-width: 768px) {
          .container {
            margin: 10px;
            border-radius: 0;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .products-table {
            font-size: 12px;
          }
          
          .products-table th,
          .products-table td {
            padding: 8px 6px;
          }
        }
      </style>
    </head>
    <body>
      <div class="watermark">KHRONOS</div>
      
      <div class="container">
        <div class="header">
          <div class="logo">KHRONOS</div>
          <div class="company-subtitle">Sistemas de Segurança</div>
          <div class="document-title">Relatório de Venda #${venda.id}</div>
          <div class="document-info">
            ${dataFormatada} às ${horaFormatada}
            <span class="status-badge">Finalizada</span>
          </div>
        </div>
        
        <div class="content">
          <!-- Informações da Venda -->
          <div class="info-section">
            <h2>Informações da Venda</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">ID da Venda</div>
                <div class="info-value">#${venda.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data e Hora</div>
                <div class="info-value">${dataFormatada} às ${horaFormatada}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Vendedor</div>
                <div class="info-value">${venda.vendedor?.nome || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">Finalizada</div>
              </div>
            </div>
          </div>
          
          <!-- Dados do Cliente -->
          <div class="info-section">
            <h2>Dados do Cliente</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nome</div>
                <div class="info-value">${venda.cliente.nome}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Documento</div>
                <div class="info-value">${venda.cliente.cpf || venda.cliente.cnpj || "Não informado"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${venda.cliente.contatos[0]?.email || "Não informado"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Telefone</div>
                <div class="info-value">${venda.cliente.contatos[0]?.numero || "Não informado"}</div>
              </div>
            </div>
          </div>
          
          <!-- Produtos -->
          <div class="info-section">
            <h2>Produtos Vendidos</h2>
            <table class="products-table">
              <thead>
                <tr>
                  <th style="width: 50px;">Item</th>
                  <th>Produto</th>
                  <th style="width: 80px;">Qtd</th>
                  <th style="width: 120px;">Valor Unit.</th>
                  <th style="width: 120px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${venda.produtos
                  .map(
                    (produto, index) => `
                  <tr>
                    <td style="text-align: center;">
                      <span class="item-number">${index + 1}</span>
                    </td>
                    <td>
                      <div class="product-name">${produto.nome}</div>
                      <div class="product-category">${produto.categoria}</div>
                      ${produto.zoneamento ? `<div class="product-zone">Zoneamento: ${produto.zoneamento}</div>` : ""}
                    </td>
                    <td class="quantity">${produto.quantidade}</td>
                    <td class="price">R$ ${produto.preco}</td>
                    <td class="subtotal">R$ ${(produto.quantidade * produto.preco)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <!-- Método de Pagamento -->
          <div class="payment-method">
            <strong>Método de Pagamento:</strong> ${(venda.metodoPagamento || "Não informado").toUpperCase()}
          </div>
          
          <!-- Total -->
          <div class="total-section">
            <div class="total-label">Valor Total da Venda</div>
            <div class="total-value">R$ ${venda.total}</div>
          </div>
          
          ${
            venda.observacoes
              ? `
          <div class="info-section">
            <h2>Observações</h2>
            <div class="info-value">${venda.observacoes}</div>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="footer">
          <div class="footer-logo">KHRONOS Sistemas de Segurança</div>
          <div class="footer-info">
            Este documento comprova a realização da venda e não possui valor fiscal.<br>
            Para dúvidas ou suporte, entre em contato com nossa equipe.
          </div>
          <div class="generation-info">
            Documento gerado automaticamente em ${new Date().toLocaleString("pt-BR")}<br>
            Sistema KHRONOS v2.0 - Todos os direitos reservados
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return conteudo
}

export function downloadPDF(venda: VendaParaPDF): void {
  const conteudoHTML = generatePDF(venda)

  // Criar um Blob com o conteúdo HTML
  const blob = new Blob([conteudoHTML], { type: "text/html;charset=utf-8" })

  // Criar URL para o Blob
  const url = URL.createObjectURL(blob)

  // Criar um elemento <a> para download
  const link = document.createElement("a")
  link.href = url
  link.download = `Relatorio_Venda_${venda.id}_${new Date().toISOString().slice(0, 10)}.html`
  link.style.display = "none"

  // Adicionar ao documento, clicar e remover
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Liberar a URL após um pequeno delay
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

// Função para abrir o PDF em nova aba (opcional)
export function openPDFInNewTab(venda: VendaParaPDF): void {
  const conteudoHTML = generatePDF(venda)
  const newWindow = window.open("", "_blank")

  if (newWindow) {
    newWindow.document.write(conteudoHTML)
    newWindow.document.close()
  }
}

// Função utilitária para converter dados da venda para o formato do PDF
export function convertVendaForPDF(
  venda: Venda,
  cliente: Cliente,
  produtos: ProdutoSelecionado[],
  user: User,
): VendaParaPDF {
  return {
    id: venda.id || 0,
    data: venda.date,
    cliente: {
      nome: cliente.name,
      cpf: cliente.tipo === "fisica" ? cliente.contato : undefined,
      cnpj: cliente.tipo === "juridica" ? cliente.contato : undefined,
      contatos: [
        {
          email: cliente.email || "",
          numero: cliente.contato || "",
        },
      ],
    },
    produtos: produtos.map((p) => ({
      nome: p.name,
      categoria: p.product_type || "N/A",
      quantidade: p.quantidade,
      preco: p.price,
      zoneamento: p.zoneamento || "",
    })),
    total: venda.amount,
    metodoPagamento: venda.payment_method || "dinheiro",
    vendedor: {
      nome: user.name,
    },
    observacoes: venda.observacoes,
  }
}
