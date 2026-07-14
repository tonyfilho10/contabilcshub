const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatBRL(valor: number): string {
  return BRL.format(valor)
}
