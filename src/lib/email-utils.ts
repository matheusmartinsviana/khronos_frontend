import type { Venda, Cliente, ProdutoSelecionado, ServicoSelecionado, User } from "@/types"
import type { EmailData } from "@/api/email"

export function generateReportHTML(
  venda: Venda,
  cliente: Cliente,
  produtos: ProdutoSelecionado[],
  servicos: ServicoSelecionado[],
  salesperson: User,
): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  console.log("Generating report HTML for sale:", venda)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const allItems = [
    ...produtos.map((p) => ({ ...p, type: "produto" as const })),
    ...servicos.map((s) => ({ ...s, type: "servico" as const })),
  ]

  const total = allItems.reduce((sum, item) => sum + item.price * item.quantidade, 0)

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comprovante de Venda #${venda.sale_id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.5; 
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header {
          background: #b91c1c;
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo {
          max-width: 100px;
          height: auto;
          margin-bottom: 15px;
          background: white;
          padding: 10px;
          border-radius: 8px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .sale-number {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .thank-you {
          margin-top: 10px;
          font-size: 14px;
        }
        
        .content {
          padding: 30px 20px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #b91c1c;
          margin-bottom: 15px;
          border-bottom: 2px solid #b91c1c;
          padding-bottom: 5px;
        }
        
        .info-grid {
          display: table;
          width: 100%;
          border-collapse: collapse;
        }
        
        .info-row {
          display: table-row;
        }
        
        .info-label {
          display: table-cell;
          font-weight: bold;
          color: #666;
          padding: 8px 0;
          width: 30%;
          vertical-align: top;
        }
        
        .info-value {
          display: table-cell;
          padding: 8px 0;
          color: #333;
          vertical-align: top;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        .items-table th {
          background: #b91c1c;
          color: white;
          padding: 12px 8px;
          font-size: 12px;
          font-weight: bold;
          text-align: left;
        }
        
        .items-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        
        .items-table tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .item-name {
          font-weight: bold;
          color: #333;
        }
        
        .item-code {
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        }
        
        .type-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .type-produto {
          background: #10b981;
          color: white;
        }
        
        .type-servico {
          background: #3b82f6;
          color: white;
        }
        
        .quantity-cell {
          text-align: center;
          font-weight: bold;
        }
        
        .price-cell {
          text-align: right;
          font-weight: bold;
        }
        
        .total-section {
          background: #b91c1c;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-top: 20px;
        }
        
        .total-label {
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .total-amount {
          font-size: 28px;
          font-weight: bold;
        }
        
        .observacoes-section {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }
        
        .observacoes-title {
          font-weight: bold;
          color: #92400e;
          margin-bottom: 8px;
        }
        
        .observacoes-text {
          color: #92400e;
          font-size: 14px;
        }
        
        .footer {
          background: #f9f9f9;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
        }
        
        .footer-brand {
          color: #b91c1c;
          font-weight: bold;
          text-decoration: none;
        }
        
        .footer-date {
          margin-top: 5px;
          font-size: 11px;
        }
        
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          
          .content {
            padding: 20px 15px;
          }
          
          .header {
            padding: 20px 15px;
          }
          
          .info-grid {
            display: block;
          }
          
          .info-row {
            display: block;
            margin-bottom: 10px;
          }
          
          .info-label,
          .info-value {
            display: block;
            width: 100%;
            padding: 2px 0;
          }
          
          .items-table {
            font-size: 11px;
          }
          
          .items-table th,
          .items-table td {
            padding: 8px 4px;
          }
          
          .total-amount {
            font-size: 24px;
          }
          
          .logo {
            max-width: 80px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://khronos-sfa.vercel.app/logo.png" alt="KHRONOS Logo" class="logo" width="70" height="70" />
          <div class="company-name">KHRONOS</div>
          <div class="sale-number">Venda #${venda.sale_id}</div>
          <div class="thank-you">Obrigado pela sua compra!</div>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Detalhes da Venda</div>
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Data da Venda:</div>
                <div class="info-value">${formatDate(venda.date)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Método de Pagamento:</div>
                <div class="info-value">${venda.payment_method}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Tipo de Venda:</div>
                <div class="info-value">${venda.sale_type}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Vendedor</div>
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Nome:</div>
                <div class="info-value">${salesperson.name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${salesperson.email}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Informações do Cliente</div>
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Nome:</div>
                <div class="info-value">${cliente.name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${cliente.email || "Não informado"}</div>
              </div>
              ${
                cliente.contato
                  ? `
              <div class="info-row">
                <div class="info-label">Contato:</div>
                <div class="info-value">${cliente.contato}</div>
              </div>
              `
                  : ""
              }
              ${
                cliente.endereco
                  ? `
              <div class="info-row">
                <div class="info-label">Endereço:</div>
                <div class="info-value">${cliente.endereco}</div>
              </div>
              `
                  : ""
              }
            </div>
          </div>

          <div class="section">
            <div class="section-title">Itens Adquiridos</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produto/Serviço</th>
                  <th>Tipo</th>
                  <th style="text-align: center;">Qtd</th>
                  <th style="text-align: right;">Preço Unit.</th>
                  <th>Zoneamento</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${allItems
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      <div class="item-name">${item.name}</div>
                      ${item.code ? `<div class="item-code">Código: ${item.code}</div>` : ""}
                    </td>
                    <td>
                      <span class="type-badge type-${item.type}">
                        ${item.type === "produto" ? "Produto" : "Serviço"}
                      </span>
                    </td>
                    <td class="quantity-cell">${item.quantidade}</td>
                    <td class="price-cell">${formatCurrency(item.price)}</td>
                    <td>${item.zoneamento || "N/A"}</td>
                    <td class="price-cell">${formatCurrency(item.price * item.quantidade)}</td>
                  </tr>
                  `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-label">Valor Total da Compra</div>
            <div class="total-amount">${formatCurrency(total)}</div>
          </div>

          ${
            venda.observacoes
              ? `
          <div class="observacoes-section">
            <div class="observacoes-title">📝 Observações Importantes</div>
            <div class="observacoes-text">${venda.observacoes}</div>
          </div>
          `
              : ""
          }
        </div>

        <div class="footer">
          <p>Este comprovante foi gerado automaticamente pelo sistema <a href="#" class="footer-brand">KHRONOS</a></p>
          <div class="footer-date">Gerado em: ${new Date().toLocaleString("pt-BR")}</div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function prepareEmailData(
  venda: Venda,
  cliente: Cliente,
  produtos: ProdutoSelecionado[],
  servicos: ServicoSelecionado[],
  user: User,
  reportHTML: string,
): EmailData {
  const allItems = [
    ...produtos.map((p) => ({
      name: p.name,
      quantity: p.quantidade,
      price: p.price,
      type: "produto" as const,
      zoneamento: p.zoneamento,
    })),
    ...servicos.map((s) => ({
      name: s.name,
      quantity: s.quantidade,
      price: s.price,
      type: "servico" as const,
      zoneamento: s.zoneamento,
    })),
  ]

  return {
    type: "both", // Enviar para cliente e vendedor
    customerEmail: cliente.email || "",
    customerName: cliente.name,
    sellerEmail: user.email,
    sellerName: user.name,
    saleData: { sale_id: venda.sale_id || 0 },
    customerData: {
      name: cliente.name,
      email: cliente.email || "",
    },
    saleItems: allItems,
    reportHTML,
  }
}
