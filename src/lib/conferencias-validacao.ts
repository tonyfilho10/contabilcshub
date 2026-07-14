import type { BalanceteExtraido, ContaBalancete, Natureza, ResumoLinha } from "@/lib/conferencias-ai-parser"

export interface ErroNatureza {
  classificacao: string
  descricao: string
  naturezaEncontrada: Natureza
  naturezaEsperada: Natureza
  motivo: string
}

export interface GrupoDuplicidade {
  descricaoNormalizada: string
  contas: ContaBalancete[]
}

export interface FechamentoResumo {
  linhas: ResumoLinha[]
  totalPositivo: number
  totalNegativo: number
  diferenca: number
  balanceado: boolean
}

export interface ResultadoConferencia {
  totalContas: number
  errosNatureza: ErroNatureza[]
  duplicidades: GrupoDuplicidade[]
  fechamentoAtivoPassivo: FechamentoResumo | null
  fechamentoDebitoCredito: FechamentoResumo | null
}

const RETIFICADORA = /^\(-\)/
const PREJUIZO = /PREJU[IÍ]ZO/i
const AJUSTE_EXERCICIOS_ANTERIORES = /AJUSTES?\s+DE\s+EXERC[IÍ]CIOS?\s+ANTERIORES/i
// Contas retificadoras clássicas do PL que reduzem o patrimônio (natureza devedora),
// mesmo sem o prefixo "(-)": adiantamentos/distribuições de lucros e ações em tesouraria.
const RETIFICADORA_PL = /ADIANTAMENTO\s+DE\s+LUCROS?|DISTRIBUI[CÇ][AÃ]O\s+DE\s+LUCROS?|DIVIDENDOS?\s+(A\s+)?(DISTRIBUIR|PAGAR)|A[CÇ][OÕ]ES?\s+EM\s+TESOURARIA/i

function ehConta(classificacao: string, todas: ContaBalancete[]): boolean {
  return !todas.some((c) => c.classificacao !== classificacao && c.classificacao.startsWith(classificacao + "."))
}

/** Natureza esperada de uma conta segundo as regras de natureza contábil informadas, ou null se a conta não tem natureza fixa definida. */
function naturezaEsperada(conta: ContaBalancete, isLeaf: boolean): { esperada: Natureza | null; motivo: string } {
  const normal = !RETIFICADORA.test(conta.descricao.trim())

  switch (conta.grupo) {
    case "ATIVO":
      return normal
        ? { esperada: "D", motivo: "Contas de ativo têm natureza devedora" }
        : { esperada: "C", motivo: "Conta retificadora de ativo (ex: depreciação/amortização/exaustão acumulada) tem natureza credora" }
    case "PASSIVO":
      return normal
        ? { esperada: "C", motivo: "Contas de passivo têm natureza credora" }
        : { esperada: "D", motivo: "Conta retificadora de passivo tem natureza devedora" }
    case "PL":
      if (AJUSTE_EXERCICIOS_ANTERIORES.test(conta.descricao)) {
        return { esperada: null, motivo: "Ajustes de exercícios anteriores não têm natureza fixa definida" }
      }
      if (!isLeaf) {
        // Subtotais de PL (ex: "PATRIMÔNIO LÍQUIDO") podem legitimamente ser devedores
        // quando há prejuízo acumulado superior ao capital — a natureza decorre da
        // composição das contas analíticas, não é fixa.
        return { esperada: null, motivo: "Subtotal de patrimônio líquido — a natureza decorre da composição das contas analíticas" }
      }
      if (PREJUIZO.test(conta.descricao) || RETIFICADORA_PL.test(conta.descricao)) {
        return { esperada: "D", motivo: "Conta de prejuízo ou retificadora do PL (ex: adiantamento/distribuição de lucros) tem natureza devedora" }
      }
      return { esperada: "C", motivo: "Contas de patrimônio líquido geralmente têm natureza credora" }
    case "DESPESA":
      return { esperada: "D", motivo: "Contas de resultado de despesa precisam ser devedoras" }
    case "RECEITA":
      return normal
        ? { esperada: "C", motivo: "Contas de resultado de receita precisam ser credoras" }
        : { esperada: "D", motivo: "Deduções da receita devem ser devedoras" }
    default:
      return { esperada: null, motivo: "Contas de apuração/compensação não têm natureza fixa definida" }
  }
}

export function validarNaturezas(contas: ContaBalancete[]): ErroNatureza[] {
  const erros: ErroNatureza[] = []
  for (const conta of contas) {
    const { esperada, motivo } = naturezaEsperada(conta, ehConta(conta.classificacao, contas))
    if (esperada !== null && esperada !== conta.natureza) {
      erros.push({
        classificacao: conta.classificacao,
        descricao: conta.descricao,
        naturezaEncontrada: conta.natureza,
        naturezaEsperada: esperada,
        motivo,
      })
    }
  }
  return erros
}

const DIACRITICOS = new RegExp("[̀-ͯ]", "g")

function normalizarDescricao(descricao: string): string {
  return descricao
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .replace(/^\(-\)\s*/, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
}

/** Contas analíticas (sem filhas) com a mesma descrição normalizada, mas classificações diferentes. */
export function encontrarDuplicidades(contas: ContaBalancete[]): GrupoDuplicidade[] {
  const analiticas = contas.filter((c) => ehConta(c.classificacao, contas))
  const porDescricao = new Map<string, ContaBalancete[]>()

  for (const conta of analiticas) {
    const chave = normalizarDescricao(conta.descricao)
    if (!chave) continue
    const grupo = porDescricao.get(chave) ?? []
    grupo.push(conta)
    porDescricao.set(chave, grupo)
  }

  const duplicidades: GrupoDuplicidade[] = []
  for (const [descricaoNormalizada, grupo] of porDescricao) {
    const classificacoesUnicas = new Set(grupo.map((c) => c.classificacao))
    if (classificacoesUnicas.size > 1) {
      duplicidades.push({ descricaoNormalizada, contas: grupo })
    }
  }
  return duplicidades.sort((a, b) => a.descricaoNormalizada.localeCompare(b.descricaoNormalizada))
}

const TOLERANCIA = 0.01

function montarFechamento(linhas: ResumoLinha[]): FechamentoResumo | null {
  if (linhas.length === 0) return null
  const totalPositivo = linhas.filter((l) => l.natureza === "D").reduce((s, l) => s + l.saldoAtual, 0)
  const totalNegativo = linhas.filter((l) => l.natureza === "C").reduce((s, l) => s + l.saldoAtual, 0)
  const diferenca = totalPositivo - totalNegativo
  return { linhas, totalPositivo, totalNegativo, diferenca, balanceado: Math.abs(diferenca) < TOLERANCIA }
}

function linhasResumo(resumo: ResumoLinha[], padroes: RegExp[]): ResumoLinha[] {
  return resumo.filter((l) => padroes.some((p) => p.test(l.descricao)))
}

export function validarFechamento(resumo: ResumoLinha[]): {
  ativoPassivo: FechamentoResumo | null
  debitoCredito: FechamentoResumo | null
} {
  const ativoPassivo = montarFechamento(
    linhasResumo(resumo, [/^ATIVO$/i, /^PASSIVO$/i, /PATRIM[ÔO]NIO\s+L[IÍ]QUIDO/i])
  )
  const debitoCredito = montarFechamento(
    linhasResumo(resumo, [/^CONTAS\s+DEVEDORAS$/i, /^CONTAS\s+CREDORAS$/i])
  )
  return { ativoPassivo, debitoCredito }
}

export function validarBalancete(extraido: BalanceteExtraido): ResultadoConferencia {
  const errosNatureza = validarNaturezas(extraido.contas)
  const duplicidades = encontrarDuplicidades(extraido.contas)
  const { ativoPassivo, debitoCredito } = validarFechamento(extraido.resumo)

  return {
    totalContas: extraido.contas.length,
    errosNatureza,
    duplicidades,
    fechamentoAtivoPassivo: ativoPassivo,
    fechamentoDebitoCredito: debitoCredito,
  }
}
