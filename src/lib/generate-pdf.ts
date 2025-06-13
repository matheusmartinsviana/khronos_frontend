export interface Cliente {
  name: string
  tipo: "fisica" | "juridica"
  contato: string
  email?: string
  endereco?: string
  cidade?: string
  estado?: string
}

export interface ProdutoSelecionado {
  name: string
  product_type?: string
  quantidade: number
  price: number
  zoneamento?: string
  codigo?: string
}

export interface Venda {
  id?: number
  date: string
  amount: number
  payment_method?: string
  observacoes?: string
  proposta?: string
  contrato?: string
}

export interface User {
  name: string
  telefone?: string
  email?: string
}

// Interface para o formato de dados esperado pelo gerador de PDF
interface VendaParaPDF {
  id: number
  data: string
  proposta?: string
  contrato?: string
  cliente: {
    nome: string
    codigo?: string
    cpf?: string
    cnpj?: string
    telefone?: string
    email?: string
    endereco?: string
    cidade?: string
    estado?: string
  }
  produtos: Array<{
    codigo?: string
    nome: string
    categoria: string
    quantidade: number
    preco: number
    zoneamento?: string
  }>
  servicos: Array<{
    codigo?: string
    nome: string
    quantidade: number
    preco: number
  }>
  total: number
  metodoPagamento: string
  vendedor: {
    nome: string
    telefone?: string
    email?: string
  }
  observacoes?: string
  zoneamento?: string
  senhas?: {
    senha?: string
    contraSenha?: string
    palavraCoacao?: string
  }
}

export function generatePDFContent(venda: VendaParaPDF): string {
  const dataFormatada = new Date(venda.data).toLocaleDateString("pt-BR")
  const horaFormatada = new Date(venda.data).toLocaleTimeString("pt-BR")

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; color: #000; font-size: 12px; line-height: 1.4;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <img src="https://khronos-sfa.vercel.app/logo.webp" alt="KHRONOS Logo" style="height: 60px; margin-bottom: 10px;" />
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">KHRONOS SISTEMAS DE SEGURANÇA</div>
        <div style="font-size: 11px; margin-bottom: 10px;">Rua Valmor Schroeder, 2519, Bela Vista, São José SC</div>
        <div style="font-size: 11px; margin-bottom: 15px;">Fone: (48) 3381-9999</div>
        <div style="font-size: 14px; font-weight: bold;">RELATÓRIO DE VENDA</div>
        <div style="font-size: 12px;">Proposta ${venda.proposta || venda.id}</div>
      </div>
      
      <!-- Informações do Contrato e Cliente -->
      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 8px;"><strong>Contrato:</strong> ${venda.contrato || "N/A"}.</div>
        <div style="margin-bottom: 8px;"><strong>Data da Venda:</strong> ${dataFormatada} às ${horaFormatada}.</div>
        <div style="margin-bottom: 8px;"><strong>Cliente:</strong> ${venda.cliente.nome}${venda.cliente.codigo ? ` - CÓDIGO CLIENTE: ${venda.cliente.codigo}` : ""}.</div>
        ${venda.cliente.telefone ? `<div style="margin-bottom: 8px;"><strong>Telefone:</strong> ${venda.cliente.telefone}.</div>` : ""}
        ${venda.cliente.endereco ? `<div style="margin-bottom: 8px;"><strong>Endereço:</strong> ${venda.cliente.endereco}${venda.cliente.cidade ? `, ${venda.cliente.cidade}` : ""}${venda.cliente.estado ? ` / ${venda.cliente.estado}` : ""}.</div>` : ""}
        <div style="margin-bottom: 8px;"><strong>Vendedor:</strong> ${venda.vendedor.nome}${venda.vendedor.telefone ? ` - ${venda.vendedor.telefone}` : ""}.</div>
        ${venda.vendedor.email ? `<div style="margin-bottom: 8px;"><strong>Email do Vendedor:</strong> ${venda.vendedor.email}.</div>` : ""}
      </div>

      ${
        venda.observacoes
          ? `
      <div style="margin-bottom: 20px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Observações:</div>
        <div style="white-space: pre-line; background: #f5f5f5; padding: 10px; border-left: 3px solid #a31c1e;">${venda.observacoes}</div>
      </div>
      `
          : ""
      }

      <!-- Serviços -->
      ${
        venda.servicos && venda.servicos.length > 0
          ? `
      <div style="margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-size: 11px; font-weight: bold;">Cód.</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-size: 11px; font-weight: bold;">Descrição</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">Quantidade</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="4" style="border: 1px solid #000; padding: 6px; background: #e8e8e8; font-weight: bold; font-size: 11px;">SERVIÇOS</td>
            </tr>
            ${venda.servicos
              .map(
                (servico) => `
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">${servico.codigo || ""}</td>
              <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">${servico.nome}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px;">${servico.quantidade}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right; font-size: 10px;">${servico.preco.toFixed(2)}</td>
            </tr>
            `,
              )
              .join("")}
            <tr>
              <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; font-size: 11px;">Total:</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; font-size: 11px;">${venda.servicos.reduce((sum, s) => sum + s.quantidade * s.preco, 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      `
          : ""
      }

      <!-- Produtos/Equipamentos -->
      ${
        venda.produtos && venda.produtos.length > 0
          ? `
      <div style="margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-size: 11px; font-weight: bold;">Cód.</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-size: 11px; font-weight: bold;">Descrição</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">Quantidade</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 11px; font-weight: bold;">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="4" style="border: 1px solid #000; padding: 6px; background: #e8e8e8; font-weight: bold; font-size: 11px;">EQUIPAMENTOS</td>
            </tr>
            ${venda.produtos
              .map(
                (produto) => `
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">${produto.codigo || ""}</td>
              <td style="border: 1px solid #000; padding: 6px; font-size: 10px;">
                ${produto.nome}
                ${produto.categoria ? `<br><span style="font-style: italic; color: #666;">${produto.categoria}</span>` : ""}
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px;">${produto.quantidade}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right; font-size: 10px;">${(produto.quantidade * produto.preco).toFixed(2)}</td>
            </tr>
            `,
              )
              .join("")}
            <tr>
              <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; font-size: 11px;">Total:</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; font-size: 11px;">${venda.produtos.reduce((sum, p) => sum + p.quantidade * p.preco, 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      `
          : ""
      }

      <!-- Informações de Contato e Senhas -->
      ${
        venda.cliente.telefone || venda.senhas
          ? `
      <div style="margin-bottom: 20px;">
        ${venda.cliente.telefone ? `<div style="margin-bottom: 8px;"><strong>Contato Principal:</strong> ${venda.cliente.nome} - Telefone: ${venda.cliente.telefone}.</div>` : ""}
        ${venda.senhas?.senha ? `<div style="margin-bottom: 8px;"><strong>Senha:</strong> ${venda.senhas.senha}${venda.senhas.contraSenha ? ` - Contra Senha: ${venda.senhas.contraSenha}` : ""}.</div>` : ""}
        ${venda.senhas?.palavraCoacao ? `<div style="margin-bottom: 8px;"><strong>Palavra de Coação:</strong> ${venda.senhas.palavraCoacao}.</div>` : ""}
      </div>
      `
          : ""
      }

      <!-- Zoneamento -->
      ${
        venda.zoneamento
          ? `
      <div style="margin-bottom: 20px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Zoneamento:</div>
        <div style="white-space: pre-line; background: #f9f9f9; padding: 10px; border: 1px solid #ddd;">${venda.zoneamento}</div>
      </div>
      `
          : ""
      }

      <!-- Método de Pagamento -->
      <div style="margin-bottom: 20px; background: #f0f8ff; border: 1px solid #4a90e2; padding: 12px; text-align: center;">
        <strong>MÉTODO DE PAGAMENTO: ${(venda.metodoPagamento || "Não informado").toUpperCase()}</strong>
      </div>

      <!-- Total Geral -->
      <div style="background: #a31c1e; color: white; padding: 15px; text-align: center; margin: 20px 0; font-size: 16px; font-weight: bold;">
        VALOR TOTAL DA VENDA: R$ ${venda.total.toFixed(2)}
      </div>

      <!-- Assinaturas -->
      <div style="margin-top: 40px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 30px;"></div>
            <div style="text-align: center; font-size: 11px;"><strong>NOME DO CLIENTE</strong></div>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 30px;"></div>
            <div style="text-align: center; font-size: 11px;"><strong>RESPONSÁVEL KHRONOS</strong></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666;">
        <div style="margin-bottom: 5px;">São José, ${dataFormatada}</div>
        <div style="margin-bottom: 10px;">KHRONOS Sistemas de Segurança - Todos os direitos reservados</div>
        <div>Documento gerado automaticamente em ${new Date().toLocaleString("pt-BR")}</div>
      </div>
    </div>
  `
}

// Função principal para gerar e baixar PDF diretamente
export async function downloadPDF(venda: VendaParaPDF): Promise<void> {
  try {
    // Import jsPDF dinamicamente
    const { default: jsPDF } = await import("jspdf")

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Função auxiliar para adicionar nova página se necessário
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin - 20) {
        pdf.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // CABEÇALHO
    const logoWidth = 30
    const logoHeight = 30
    const logoX = (pageWidth - logoWidth) / 2
    pdf.addImage("/logo.png", "PNG", logoX, yPosition, logoWidth, logoHeight)
    yPosition += logoHeight

    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    yPosition += 8
    pdf.text("KHRONOS SISTEMAS DE SEGURANÇA", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text("Rua Valmor Schroeder, 2519, Bela Vista, São José SC", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 5
    pdf.text("Fone: (48) 3381-9999", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 10

    // Linha separadora
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("RELATÓRIO DE VENDA", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.text(`Proposta ${venda.id}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // INFORMAÇÕES GERAIS
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    const dataFormatada = new Date(venda.data).toLocaleDateString("pt-BR")
    const horaFormatada = new Date(venda.data).toLocaleTimeString("pt-BR")

    const infoLines = [
      `Contrato: ${venda.contrato || "N/A"}.`,
      `Data da Venda: ${dataFormatada} às ${horaFormatada}.`,
      `Cliente: ${venda.cliente.nome}${venda.cliente.codigo ? ` - CÓDIGO CLIENTE: ${venda.cliente.codigo}` : ""}.`,
    ]

    if (venda.cliente.telefone) {
      infoLines.push(`Telefone: ${venda.cliente.telefone}.`)
    }

    if (venda.cliente.endereco) {
      infoLines.push(
        `Endereço: ${venda.cliente.endereco}${venda.cliente.cidade ? `, ${venda.cliente.cidade}` : ""}${venda.cliente.estado ? ` / ${venda.cliente.estado}` : ""}.`,
      )
    }

    infoLines.push(`Vendedor: ${venda.vendedor.nome}${venda.vendedor.telefone ? ` - ${venda.vendedor.telefone}` : ""}.`)

    if (venda.vendedor.email) {
      infoLines.push(`Email do Vendedor: ${venda.vendedor.email}.`)
    }

    infoLines.forEach((line) => {
      checkPageBreak(6)
      pdf.text(line, margin, yPosition)
      yPosition += 6
    })

    yPosition += 5

    // OBSERVAÇÕES
    if (venda.observacoes) {
      checkPageBreak(20)
      pdf.setFont("helvetica", "bold")
      pdf.text("Observações:", margin, yPosition)
      yPosition += 6

      pdf.setFont("helvetica", "normal")
      const obsLines = pdf.splitTextToSize(venda.observacoes, contentWidth - 10)
      obsLines.forEach((line: string) => {
        checkPageBreak(5)
        pdf.text(line, margin + 5, yPosition)
        yPosition += 5
      })
      yPosition += 8
    }

    // SERVIÇOS
    if (venda.servicos && venda.servicos.length > 0) {
      checkPageBreak(30)

      // Cabeçalho da tabela de serviços
      pdf.setFillColor(240, 240, 240)
      pdf.rect(margin, yPosition, contentWidth, 8, "F")
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(9)
      pdf.text("SERVIÇOS", margin + 2, yPosition + 5)
      yPosition += 10

      // Cabeçalhos das colunas
      const colWidths = [25, 100, 25, 30]
      let xPos = margin

      pdf.text("Cód.", xPos + 2, yPosition)
      xPos += colWidths[0]
      pdf.text("Descrição", xPos + 2, yPosition)
      xPos += colWidths[1]
      pdf.text("Qtd", xPos + 2, yPosition)
      xPos += colWidths[2]
      pdf.text("Valor Total", xPos + 2, yPosition)

      yPosition += 6

      // Linha separadora
      pdf.setLineWidth(0.3)
      pdf.line(margin, yPosition, margin + contentWidth, yPosition)
      yPosition += 3

      // Serviços
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)

      venda.servicos.forEach((servico) => {
        checkPageBreak(8)
        xPos = margin

        pdf.text(servico.codigo || "", xPos + 2, yPosition)
        xPos += colWidths[0]

        const descLines = pdf.splitTextToSize(servico.nome, colWidths[1] - 4)
        pdf.text(descLines, xPos + 2, yPosition)
        xPos += colWidths[1]

        pdf.text(servico.quantidade.toString(), xPos + 2, yPosition)
        xPos += colWidths[2]

        pdf.text(servico.preco.toFixed(2), xPos + 2, yPosition)

        yPosition += Math.max(descLines.length * 3, 6)
      })

      // Total dos serviços
      const totalServicos = venda.servicos.reduce((sum, s) => sum + s.quantidade * s.preco, 0)
      yPosition += 3
      pdf.setLineWidth(0.3)
      pdf.line(margin, yPosition, margin + contentWidth, yPosition)
      yPosition += 5

      pdf.setFont("helvetica", "bold")
      pdf.text("Total:", margin + colWidths[0] + colWidths[1] + 2, yPosition)
      pdf.text(totalServicos.toFixed(2), margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition)

      yPosition += 15
    }

    // PRODUTOS/EQUIPAMENTOS
    if (venda.produtos && venda.produtos.length > 0) {
      checkPageBreak(30)

      // Cabeçalho da tabela de produtos
      pdf.setFillColor(240, 240, 240)
      pdf.rect(margin, yPosition, contentWidth, 8, "F")
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(9)
      pdf.text("EQUIPAMENTOS", margin + 2, yPosition + 5)
      yPosition += 10

      // Cabeçalhos das colunas
      const colWidths = [25, 100, 25, 30]
      let xPos = margin

      pdf.text("Cód.", xPos + 2, yPosition)
      xPos += colWidths[0]
      pdf.text("Descrição", xPos + 2, yPosition)
      xPos += colWidths[1]
      pdf.text("Qtd", xPos + 2, yPosition)
      xPos += colWidths[2]
      pdf.text("Valor Total", xPos + 2, yPosition)

      yPosition += 6

      // Linha separadora
      pdf.setLineWidth(0.3)
      pdf.line(margin, yPosition, margin + contentWidth, yPosition)
      yPosition += 3

      // Produtos
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)

      venda.produtos.forEach((produto) => {
        checkPageBreak(12)
        xPos = margin

        pdf.text(produto.codigo || "", xPos + 2, yPosition)
        xPos += colWidths[0]

        let descText = produto.nome
        if (produto.categoria) {
          descText += `\n${produto.categoria}`
        }
        const descLines = pdf.splitTextToSize(descText, colWidths[1] - 4)
        pdf.text(descLines, xPos + 2, yPosition)
        xPos += colWidths[1]

        pdf.text(produto.quantidade.toString(), xPos + 2, yPosition)
        xPos += colWidths[2]

        pdf.text((produto.quantidade * produto.preco).toFixed(2), xPos + 2, yPosition)

        yPosition += Math.max(descLines.length * 3, 6)
      })

      // Total dos produtos
      const totalProdutos = venda.produtos.reduce((sum, p) => sum + p.quantidade * p.preco, 0)
      yPosition += 3
      pdf.setLineWidth(0.3)
      pdf.line(margin, yPosition, margin + contentWidth, yPosition)
      yPosition += 5

      pdf.setFont("helvetica", "bold")
      pdf.text("Total:", margin + colWidths[0] + colWidths[1] + 2, yPosition)
      pdf.text(totalProdutos.toFixed(2), margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition)

      yPosition += 15
    }

    // ZONEAMENTO
    if (venda.zoneamento) {
      checkPageBreak(20)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.text("Zoneamento:", margin, yPosition)
      yPosition += 6

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(9)
      const zoneLines = pdf.splitTextToSize(venda.zoneamento, contentWidth)
      zoneLines.forEach((line: string) => {
        checkPageBreak(5)
        pdf.text(line, margin, yPosition)
        yPosition += 5
      })
      yPosition += 10
    }

    // MÉTODO DE PAGAMENTO
    checkPageBreak(15)
    pdf.setFillColor(240, 248, 255)
    pdf.rect(margin, yPosition - 3, contentWidth, 12, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text(
      `MÉTODO DE PAGAMENTO: ${(venda.metodoPagamento || "Não informado").toUpperCase()}`,
      pageWidth / 2,
      yPosition + 3,
      { align: "center" },
    )
    yPosition += 20

    // TOTAL GERAL
    checkPageBreak(20)
    pdf.setFillColor(163, 28, 30)
    pdf.rect(margin, yPosition - 3, contentWidth, 15, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.text(`VALOR TOTAL DA VENDA: R$ ${venda.total.toFixed(2)}`, pageWidth / 2, yPosition + 5, { align: "center" })
    pdf.setTextColor(0, 0, 0)
    yPosition += 25

    // ASSINATURAS
    checkPageBreak(30)
    yPosition += 10

    const signatureWidth = (contentWidth - 20) / 2

    // Linha para assinatura do cliente
    pdf.line(margin, yPosition, margin + signatureWidth, yPosition)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(8)
    pdf.text("NOME DO CLIENTE", margin + signatureWidth / 2, yPosition + 5, { align: "center" })

    // Linha para assinatura do responsável
    pdf.line(margin + signatureWidth + 20, yPosition, margin + contentWidth, yPosition)
    pdf.text("RESPONSÁVEL KHRONOS", margin + signatureWidth + 20 + signatureWidth / 2, yPosition + 5, {
      align: "center",
    })

    yPosition += 20

    // RODAPÉ
    const footerY = pageHeight - 25
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text(`São José, ${dataFormatada}`, pageWidth / 2, footerY, { align: "center" })
    pdf.text("KHRONOS Sistemas de Segurança - Todos os direitos reservados", pageWidth / 2, footerY + 5, {
      align: "center",
    })
    pdf.setFontSize(7)
    pdf.text(`Documento gerado automaticamente em ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, footerY + 10, {
      align: "center",
    })

    // Fazer download do PDF
    const fileName = `Relatorio_Venda_${venda.id}_${new Date().toISOString().slice(0, 10)}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    throw error
  }
}

// Função para visualizar PDF em nova aba
export function openPDFInNewTab(venda: VendaParaPDF): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Relatório de Venda #${venda.id} - KHRONOS</title>
      <style>
        body { margin: 0; padding: 20px; }
        @media print {
          body { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      ${generatePDFContent(venda)}
      <script>
        // Auto print quando abrir em nova aba
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `

  const newWindow = window.open("", "_blank")
  if (newWindow) {
    newWindow.document.write(htmlContent)
    newWindow.document.close()
  }
}

// Função utilitária para converter dados da venda para o formato do PDF
export function convertVendaForPDF(
  venda: Venda,
  cliente: Cliente,
  produtos: ProdutoSelecionado[],
  user: User,
  servicos: Array<{ codigo?: string; nome: string; quantidade: number; preco: number }> = [],
  zoneamento?: string,
  senhas?: { senha?: string; contraSenha?: string; palavraCoacao?: string },
): VendaParaPDF {
  return {
    id: (venda as any).sale_id ?? venda.id ?? 0,
    data: venda.date,
    proposta: venda.proposta,
    contrato: venda.contrato,
    cliente: {
      nome: cliente.name,
      cpf: cliente.tipo === "fisica" ? cliente.contato : undefined,
      cnpj: cliente.tipo === "juridica" ? cliente.contato : undefined,
      telefone: cliente.contato,
      email: cliente.email,
      endereco: (cliente as any).adress ?? cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
    },
    produtos: produtos.map((p) => ({
      codigo: (p as any).codigo ?? undefined,
      nome: p.name,
      categoria: p.product_type || "N/A",
      quantidade: (p as any).quantidade ?? (p as any).quantity ?? 1,
      preco: p.price,
      zoneamento: (p as any).zoneamento ?? (p as any).zoning ?? "",
    })),
    servicos: servicos,
    total: venda.amount,
    metodoPagamento: venda.payment_method || "dinheiro",
    vendedor: {
      nome: user.name,
      telefone: user.telefone,
      email: user.email,
    },
    observacoes: (venda as any).observation ?? venda.observacoes,
    zoneamento: (venda as any).zoning ?? zoneamento,
    senhas: senhas,
  }
}
