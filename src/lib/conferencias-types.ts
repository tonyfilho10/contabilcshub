export type Natureza = "D" | "C"
export type ContaGrupo = "ATIVO" | "PASSIVO" | "PL" | "DESPESA" | "RECEITA" | "APURACAO" | "COMPENSACAO"

/** Conta já com a descrição resolvida — resultado da junção do índice com os lotes de descrição. */
export interface ContaBalancete {
  classificacao: string
  descricao: string
  saldoAtual: number
  natureza: Natureza
  grupo: ContaGrupo
}

export interface ResumoLinha {
  descricao: string
  saldoAtual: number
  natureza: Natureza
}

export interface BalanceteExtraido {
  contas: ContaBalancete[]
  resumo: ResumoLinha[]
}
