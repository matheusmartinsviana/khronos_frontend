export class FormatUtils {
  public static formatarPreco(valor?: number): string {
    if (typeof valor !== "number" || isNaN(valor)) {
      return "R$ 0,00"
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  public static formatarData(data?: string): string {
    if (!data) return "—"
    return new Date(data).toLocaleDateString("pt-BR")
  }
}
