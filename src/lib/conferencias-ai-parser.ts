import Anthropic from "@anthropic-ai/sdk"

export type ContaGrupo = "ATIVO" | "PASSIVO" | "PL" | "DESPESA" | "RECEITA" | "APURACAO" | "COMPENSACAO"
export type Natureza = "D" | "C"

export interface ContaBalancete {
  codigo: string
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

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    contas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          codigo: { type: "string" },
          classificacao: { type: "string" },
          descricao: { type: "string" },
          saldoAtual: { type: "number" },
          natureza: { type: "string", enum: ["D", "C"] },
          grupo: {
            type: "string",
            enum: ["ATIVO", "PASSIVO", "PL", "DESPESA", "RECEITA", "APURACAO", "COMPENSACAO"],
          },
        },
        required: ["codigo", "classificacao", "descricao", "saldoAtual", "natureza", "grupo"],
        additionalProperties: false,
      },
    },
    resumo: {
      type: "array",
      items: {
        type: "object",
        properties: {
          descricao: { type: "string" },
          saldoAtual: { type: "number" },
          natureza: { type: "string", enum: ["D", "C"] },
        },
        required: ["descricao", "saldoAtual", "natureza"],
        additionalProperties: false,
      },
    },
  },
  required: ["contas", "resumo"],
  additionalProperties: false,
} as const

const client = new Anthropic()

/**
 * Extrai as contas e o resumo de um balancete de verificação a partir do PDF
 * original via Claude — evita depender de extração de texto/tabelas em
 * layouts com colunas alinhadas por espaçamento.
 */
export async function parseBalanceteComIA(pdfBuffer: Buffer): Promise<BalanceteExtraido> {
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 32000,
    output_config: { format: { type: "json_schema", schema: RESPONSE_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBuffer.toString("base64") },
          },
          {
            type: "text",
            text: [
              "Este é um Balancete de Verificação contábil brasileiro. Ele lista contas em uma árvore hierárquica",
              "(colunas: Código, Classificação, Descrição da conta, Saldo Anterior, Débito, Crédito, Saldo Atual),",
              "seguida de uma seção final \"RESUMO DO BALANCETE\".",
              "",
              "1) Em `contas`, extraia TODAS as linhas de conta (sintéticas e analíticas) cujo Saldo Atual seja",
              "diferente de zero. Ignore linhas com Saldo Atual \"0,00\" (sem letra D/C, sem natureza definida).",
              "Para cada conta:",
              "- `codigo`: o número da coluna \"Código\" (identificador da linha).",
              "- `classificacao`: o código hierárquico da coluna \"Classificação\" (ex: \"1.1.1.01.001\").",
              "- `descricao`: a descrição da conta, exatamente como impressa (preserve o prefixo \"(-)\" quando houver).",
              "- `saldoAtual`: o valor numérico do Saldo Atual, sem o sufixo D/C (use ponto decimal, sem separador de milhar).",
              "- `natureza`: \"D\" ou \"C\", conforme o sufixo impresso ao lado do Saldo Atual.",
              "- `grupo`: a que seção de topo do balancete a conta pertence, com base nos cabeçalhos do documento:",
              "  \"ATIVO\" para contas dentro da seção ATIVO; \"PASSIVO\" para contas dentro da seção PASSIVO",
              "  (exceto Patrimônio Líquido); \"PL\" para contas de Patrimônio Líquido (mesmo se numeradas como",
              "  subconta do Passivo, ex: código \"2.4\"); \"DESPESA\" para contas de CONTAS DE RESULTADOS - CUSTOS",
              "  E DESPESAS; \"RECEITA\" para contas de CONTAS DE RESULTADO - RECEITAS; \"APURACAO\" para CONTAS DE",
              "  APURAÇÃO; \"COMPENSACAO\" para CONTAS DE COMPENSAÇÃO.",
              "",
              "2) Em `resumo`, extraia as linhas da tabela \"RESUMO DO BALANCETE\" ao final do documento (ATIVO,",
              "PASSIVO, CONTAS DE RESULTADOS - CUSTOS E DESPESAS, CONTAS DE RESULTADO - RECEITAS, CONTAS DE",
              "APURAÇÃO, CONTAS DE COMPENSAÇÃO, CONTAS DEVEDORAS, CONTAS CREDORAS, etc.), usando a coluna",
              "\"Saldo Atual\" (valor + natureza D/C). Ignore linhas cujo Saldo Atual seja zero.",
              "",
              "Não invente contas ou valores que não estejam no documento.",
            ].join("\n"),
          },
        ],
      },
    ],
  })
  const response = await stream.finalMessage()

  if (response.stop_reason === "max_tokens") {
    throw new Error("O balancete é grande demais para ser analisado em uma única chamada")
  }
  if (response.stop_reason === "refusal") {
    throw new Error("A análise do PDF foi recusada")
  }

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") return { contas: [], resumo: [] }

  return JSON.parse(textBlock.text) as BalanceteExtraido
}
