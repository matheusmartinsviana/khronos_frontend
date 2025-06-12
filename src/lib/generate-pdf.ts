export interface Cliente {
  name: string
  tipo: "fisica" | "juridica"
  contato: string
  email?: string
}

export interface ProdutoSelecionado {
  name: string
  product_type?: string
  quantidade: number
  price: number
  zoneamento?: string
}

export interface Venda {
  id?: number
  date: string
  amount: number
  payment_method?: string
  observacoes?: string
}

export interface User {
  name: string
}

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

export function generatePDFContent(venda: VendaParaPDF): string {
  const dataFormatada = new Date(venda.data).toLocaleDateString("pt-BR")
  const horaFormatada = new Date(venda.data).toLocaleTimeString("pt-BR")

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background: white; color: #333; line-height: 1.6;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #a31c1e 0%, #d32f2f 100%); color: white; padding: 30px; text-align: center;">
        <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">KHRONOS</div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 20px;">Sistemas de Segurança</div>
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Relatório de Venda #${venda.id}</div>
        <div style="font-size: 16px; opacity: 0.95;">
          ${dataFormatada} às ${horaFormatada}
          <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 10px;">FINALIZADA</span>
        </div>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px;">
        <!-- Informações da Venda -->
        <div style="margin-bottom: 30px; background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #a31c1e;">
          <h2 style="color: #a31c1e; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">Informações da Venda</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">ID da Venda</div>
              <div style="color: #212529; font-size: 15px;">#${venda.id}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">Data e Hora</div>
              <div style="color: #212529; font-size: 15px;">${dataFormatada} às ${horaFormatada}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">Vendedor</div>
              <div style="color: #212529; font-size: 15px;">${venda.vendedor?.nome || "N/A"}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">Status</div>
              <div style="color: #212529; font-size: 15px;">Finalizada</div>
            </div>
          </div>
        </div>
        
        <!-- Dados do Cliente -->
        <div style="margin-bottom: 30px; background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #a31c1e;">
          <h2 style="color: #a31c1e; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">Dados do Cliente</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">Nome</div>
              <div style="color: #212529; font-size: 15px;">${venda.cliente.nome}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">Documento</div>
              <div style="color: #212529; font-size: 15px;">${venda.cliente.cpf || venda.cliente.cnpj || "Não informado"}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">Email</div>
              <div style="color: #212529; font-size: 15px;">${venda.cliente.contatos[0]?.email || "Não informado"}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef;">
              <div style="font-weight: 600; color: #495057; font-size: 14px; margin-bottom: 4px;">Telefone</div>
              <div style="color: #212529; font-size: 15px;">${venda.cliente.contatos[0]?.numero || "Não informado"}</div>
            </div>
          </div>
        </div>
        
        <!-- Produtos -->
        <div style="margin-bottom: 30px; background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #a31c1e;">
          <h2 style="color: #a31c1e; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">Produtos Vendidos</h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <thead style="background: linear-gradient(135deg, #a31c1e 0%, #d32f2f 100%); color: white;">
              <tr>
                <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 14px;">Item</th>
                <th style="padding: 15px 12px; text-align: left; font-weight: 600; font-size: 14px;">Produto</th>
                <th style="padding: 15px 12px; text-align: center; font-weight: 600; font-size: 14px;">Qtd</th>
                <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 14px;">Valor Unit.</th>
                <th style="padding: 15px 12px; text-align: right; font-weight: 600; font-size: 14px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${venda.produtos
                .map(
                  (produto, index) => `
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 12px; text-align: center;">
                    <span style="background: #a31c1e; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
                  </td>
                  <td style="padding: 12px;">
                    <div style="font-weight: 600; color: #212529; margin-bottom: 4px;">${produto.nome}</div>
                    <div style="font-size: 12px; color: #6c757d; background: #e9ecef; padding: 2px 8px; border-radius: 12px; display: inline-block; margin-bottom: 4px;">${produto.categoria}</div>
                    ${produto.zoneamento ? `<div style="font-size: 11px; color: #495057; font-style: italic;">Zoneamento: ${produto.zoneamento}</div>` : ""}
                  </td>
                  <td style="padding: 12px; text-align: center; font-weight: 600;">${produto.quantidade}</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600; color: #28a745;">R$ ${produto.preco.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600; color: #a31c1e;">R$ ${(produto.quantidade * produto.preco).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        
        <!-- Método de Pagamento -->
        <div style="background: #e3f2fd; border: 1px solid #2196f3; color: #1565c0; padding: 12px 20px; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0;">
          <strong>Método de Pagamento:</strong> ${(venda.metodoPagamento || "Não informado").toUpperCase()}
        </div>
        
        <!-- Total -->
        <div style="background: linear-gradient(135deg, #a31c1e 0%, #d32f2f 100%); color: white; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <div style="font-size: 18px; margin-bottom: 10px; opacity: 0.9;">Valor Total da Venda</div>
          <div style="font-size: 36px; font-weight: bold;">R$ ${venda.total.toFixed(2)}</div>
        </div>
        
        ${
          venda.observacoes
            ? `
        <div style="margin-bottom: 30px; background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #a31c1e;">
          <h2 style="color: #a31c1e; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">Observações</h2>
          <div style="color: #212529; font-size: 15px;">${venda.observacoes}</div>
        </div>
        `
            : ""
        }
      </div>
      
      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 3px solid #a31c1e; margin-top: 40px;">
        <div style="font-size: 18px; font-weight: bold; color: #a31c1e; margin-bottom: 10px;">KHRONOS Sistemas de Segurança</div>
        <div style="font-size: 12px; color: #6c757d; line-height: 1.5;">
          Este documento comprova a realização da venda e não possui valor fiscal.<br>
          Para dúvidas ou suporte, entre em contato com nossa equipe.
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6; font-size: 11px; color: #868e96;">
          Documento gerado automaticamente em ${new Date().toLocaleString("pt-BR")}<br>
          Sistema KHRONOS v2.0 - Todos os direitos reservados
        </div>
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
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Função auxiliar para adicionar nova página se necessário
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // CABEÇALHO
    pdf.setFillColor(163, 28, 30)
    pdf.rect(0, 0, pageWidth, 60, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text("KHRONOS", pageWidth / 2, 20, { align: "center" })

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text("Sistemas de Segurança", pageWidth / 2, 28, { align: "center" })

    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    pdf.text(`Relatório de Venda #${venda.id}`, pageWidth / 2, 40, { align: "center" })

    const dataFormatada = new Date(venda.data).toLocaleDateString("pt-BR")
    const horaFormatada = new Date(venda.data).toLocaleTimeString("pt-BR")
    pdf.setFontSize(10)
    pdf.text(`${dataFormatada} às ${horaFormatada} - FINALIZADA`, pageWidth / 2, 50, { align: "center" })

    yPosition = 80
    pdf.setTextColor(0, 0, 0)

    // INFORMAÇÕES DA VENDA
    checkPageBreak(40)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(163, 28, 30)
    pdf.text("INFORMAÇÕES DA VENDA", margin, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0)

    const infoVenda = [
      [`ID da Venda: #${venda.id}`, `Vendedor: ${venda.vendedor?.nome || "N/A"}`],
      [`Data: ${dataFormatada} às ${horaFormatada}`, `Status: Finalizada`],
    ]

    infoVenda.forEach((row) => {
      checkPageBreak(8)
      pdf.text(row[0], margin, yPosition)
      pdf.text(row[1], margin + contentWidth / 2, yPosition)
      yPosition += 8
    })

    yPosition += 10

    // DADOS DO CLIENTE
    checkPageBreak(40)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(163, 28, 30)
    pdf.text("DADOS DO CLIENTE", margin, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0)

    const infoCliente = [
      [`Nome: ${venda.cliente.nome}`, `Documento: ${venda.cliente.cpf || venda.cliente.cnpj || "Não informado"}`],
      [
        `Email: ${venda.cliente.contatos[0]?.email || "Não informado"}`,
        `Telefone: ${venda.cliente.contatos[0]?.numero || "Não informado"}`,
      ],
    ]

    infoCliente.forEach((row) => {
      checkPageBreak(8)
      pdf.text(row[0], margin, yPosition)
      pdf.text(row[1], margin + contentWidth / 2, yPosition)
      yPosition += 8
    })

    yPosition += 15

    // PRODUTOS
    checkPageBreak(50)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(163, 28, 30)
    pdf.text("PRODUTOS VENDIDOS", margin, yPosition)
    yPosition += 15

    // Cabeçalho da tabela
    pdf.setFillColor(163, 28, 30)
    pdf.rect(margin, yPosition - 5, contentWidth, 10, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "bold")

    const colWidths = [15, 80, 25, 35, 35]
    let xPos = margin

    pdf.text("Item", xPos + 7, yPosition)
    xPos += colWidths[0]
    pdf.text("Produto", xPos + 2, yPosition)
    xPos += colWidths[1]
    pdf.text("Qtd", xPos + 10, yPosition)
    xPos += colWidths[2]
    pdf.text("Valor Unit.", xPos + 15, yPosition)
    xPos += colWidths[3]
    pdf.text("Subtotal", xPos + 15, yPosition)

    yPosition += 10

    // Produtos
    pdf.setTextColor(0, 0, 0)
    pdf.setFont("helvetica", "normal")

    venda.produtos.forEach((produto, index) => {
      checkPageBreak(20)

      xPos = margin

      pdf.text((index + 1).toString(), xPos + 7, yPosition)
      xPos += colWidths[0]

      const produtoText = `${produto.nome}\n${produto.categoria}${produto.zoneamento ? `\n${produto.zoneamento}` : ""}`
      const lines = pdf.splitTextToSize(produtoText, colWidths[1] - 4)
      pdf.text(lines, xPos + 2, yPosition)
      xPos += colWidths[1]

      pdf.text(produto.quantidade.toString(), xPos + 10, yPosition)
      xPos += colWidths[2]

      pdf.text(`R$ ${produto.preco.toFixed(2)}`, xPos + 2, yPosition)
      xPos += colWidths[3]

      pdf.text(`R$ ${(produto.quantidade * produto.preco).toFixed(2)}`, xPos + 2, yPosition)

      const lineHeight = Math.max(lines.length * 4, 12)
      yPosition += lineHeight

      pdf.setDrawColor(200, 200, 200)
      pdf.line(margin, yPosition, margin + contentWidth, yPosition)
      yPosition += 5
    })

    yPosition += 10

    // MÉTODO DE PAGAMENTO
    checkPageBreak(20)
    pdf.setFillColor(227, 242, 253)
    pdf.rect(margin, yPosition - 5, contentWidth, 15, "F")
    pdf.setTextColor(21, 101, 192)
    pdf.setFont("helvetica", "bold")
    pdf.text(
      `MÉTODO DE PAGAMENTO: ${(venda.metodoPagamento || "Não informado").toUpperCase()}`,
      pageWidth / 2,
      yPosition + 3,
      { align: "center" },
    )

    yPosition += 25

    // TOTAL
    checkPageBreak(30)
    pdf.setFillColor(163, 28, 30)
    pdf.rect(margin, yPosition - 5, contentWidth, 25, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.text("VALOR TOTAL DA VENDA", pageWidth / 2, yPosition + 5, { align: "center" })

    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text(`R$ ${venda.total.toFixed(2)}`, pageWidth / 2, yPosition + 15, { align: "center" })

    yPosition += 35

    // OBSERVAÇÕES (se houver)
    if (venda.observacoes) {
      checkPageBreak(30)
      pdf.setTextColor(163, 28, 30)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("OBSERVAÇÕES", margin, yPosition)
      yPosition += 10

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const lines = pdf.splitTextToSize(venda.observacoes, contentWidth)
      pdf.text(lines, margin, yPosition)
      yPosition += lines.length * 5 + 10
    }

    // RODAPÉ
    const footerY = pageHeight - 40
    pdf.setFillColor(248, 249, 250)
    pdf.rect(0, footerY - 10, pageWidth, 50, "F")

    pdf.setDrawColor(163, 28, 30)
    pdf.setLineWidth(1)
    pdf.line(0, footerY - 10, pageWidth, footerY - 10)

    pdf.setTextColor(163, 28, 30)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("KHRONOS Sistemas de Segurança", pageWidth / 2, footerY, { align: "center" })

    pdf.setTextColor(108, 117, 125)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text("Este documento comprova a realização da venda e não possui valor fiscal.", pageWidth / 2, footerY + 8, {
      align: "center",
    })
    pdf.text("Para dúvidas ou suporte, entre em contato com nossa equipe.", pageWidth / 2, footerY + 14, {
      align: "center",
    })

    pdf.setTextColor(134, 142, 150)
    pdf.setFontSize(7)
    pdf.text(`Documento gerado automaticamente em ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, footerY + 22, {
      align: "center",
    })
    pdf.text("Sistema KHRONOS v2.0 - Todos os direitos reservados", pageWidth / 2, footerY + 27, { align: "center" })

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
