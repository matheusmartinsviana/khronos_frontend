import type { Venda } from "@/types"

export function generatePDF(venda: Venda): string {
  // Esta função simula a geração de um PDF
  // Em uma implementação real, você usaria uma biblioteca como jsPDF ou pdfmake

  const dataFormatada = new Date(venda.data).toLocaleDateString("pt-BR")
  const horaFormatada = new Date(venda.data).toLocaleTimeString("pt-BR")

  // Criar conteúdo do PDF como HTML
  const conteudo = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Relatório de Venda #${venda.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #a31c1e;
          padding-bottom: 10px;
        }
        .logo {
          color: #a31c1e;
          font-size: 24px;
          font-weight: bold;
        }
        h1 {
          font-size: 18px;
          margin: 5px 0;
        }
        .info-section {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .total {
          text-align: right;
          font-weight: bold;
          font-size: 16px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">KHRONOS</div>
        <h1>Relatório de Venda #${venda.id}</h1>
        <p>Data: ${dataFormatada} - Hora: ${horaFormatada}</p>
      </div>
      
      <div class="info-section">
        <h2>Dados do Cliente</h2>
        <p><strong>Nome:</strong> ${venda.cliente.nome}</p>
        <p><strong>Documento:</strong> ${venda.cliente.cpf || venda.cliente.cnpj || "Não informado"}</p>
        <p><strong>Contato:</strong> ${
          venda.cliente.contatos[0]?.email || venda.cliente.contatos[0]?.numero || "Não informado"
        }</p>
      </div>
      
      <div class="info-section">
        <h2>Produtos</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Descrição</th>
              <th>Qtd</th>
              <th>Valor Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${venda.produtos
              .map(
                (produto, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  ${produto.nome}<br>
                  <small>${produto.categoria}</small>
                  ${produto.zoneamento ? `<br><small><em>Zoneamento: ${produto.zoneamento}</em></small>` : ""}
                </td>
                <td>${produto.quantidade}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>R$ ${(produto.quantidade * produto.preco).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total: R$ ${venda.total.toFixed(2)}</p>
        </div>
        
        <p><strong>Método de Pagamento:</strong> ${venda.metodoPagamento.toUpperCase()}</p>
      </div>
      
      <div class="footer">
        <p>Khronos Sistemas de Segurança - Documento gerado em ${new Date().toLocaleString("pt-BR")}</p>
        <p>Este documento não possui valor fiscal</p>
      </div>
    </body>
    </html>
  `

  // Em uma implementação real, você converteria este HTML para PDF
  // Aqui, estamos apenas retornando o HTML como string para download
  return conteudo
}

export function downloadPDF(venda: Venda): void {
  const conteudoHTML = generatePDF(venda)

  // Criar um Blob com o conteúdo HTML
  const blob = new Blob([conteudoHTML], { type: "text/html" })

  // Criar URL para o Blob
  const url = URL.createObjectURL(blob)

  // Criar um elemento <a> para download
  const link = document.createElement("a")
  link.href = url
  link.download = `venda-${venda.id}.html`

  // Adicionar ao documento, clicar e remover
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Liberar a URL
  URL.revokeObjectURL(url)
}
