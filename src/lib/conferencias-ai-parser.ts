import Anthropic from "@anthropic-ai/sdk"
import { PDFParse } from "pdf-parse"
import type { ContaGrupo, Natureza, ResumoLinha } from "@/lib/conferencias-types"

/** Conta sem a descrição — saída enxuta para caber no limite de tempo de uma função serverless. */
export interface ContaIndice {
  classificacao: string
  saldoAtual: number
  natureza: Natureza
  grupo: ContaGrupo
}

export interface DescricaoConta {
  classificacao: string
  descricao: string
}

export interface BalanceteIndice {
  contas: ContaIndice[]
  resumo: ResumoLinha[]
}

const CONTEXTO_BALANCETE = [
  "Este é um Balancete de Verificação contábil brasileiro. Ele lista contas em uma árvore hierárquica",
  "(colunas: Código, Classificação, Descrição da conta, Saldo Anterior, Débito, Crédito, Saldo Atual),",
  "seguida de uma seção final \"RESUMO DO BALANCETE\".",
].join("\n")

const client = new Anthropic()

function documentoPdf(pdfBuffer: Buffer) {
  return {
    type: "document" as const,
    source: { type: "base64" as const, media_type: "application/pdf" as const, data: pdfBuffer.toString("base64") },
    // Permite que chamadas subsequentes com o mesmo PDF reaproveitem o processamento já feito.
    cache_control: { type: "ephemeral" as const },
  }
}

const INDICE_SCHEMA = {
  type: "object",
  properties: {
    contas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          classificacao: { type: "string" },
          saldoAtual: { type: "number" },
          natureza: { type: "string", enum: ["D", "C"] },
          grupo: {
            type: "string",
            enum: ["ATIVO", "PASSIVO", "PL", "DESPESA", "RECEITA", "APURACAO", "COMPENSACAO"],
          },
        },
        required: ["classificacao", "saldoAtual", "natureza", "grupo"],
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

/**
 * Divide o PDF em texto por página (via pdf-parse, sem IA — rápido e determinístico).
 * A extração de texto pode embaralhar a ordem das colunas dentro de cada linha, mas cada
 * conta fica em uma linha própria com todos os valores presentes, o que é suficiente para
 * a IA reconstruir a estrutura.
 */
export async function extrairPaginasTexto(pdfBuffer: Buffer): Promise<string[]> {
  const parser = new PDFParse({ data: pdfBuffer })
  try {
    const resultado = await parser.getText()
    return resultado.pages.map((p) => p.text)
  } finally {
    await parser.destroy()
  }
}

/**
 * Primeira etapa (repetida uma vez por página): extrai só os campos curtos de cada conta
 * (sem a descrição) e, se presente na página, o resumo. Processar por página — em vez do
 * PDF inteiro de uma vez — mantém a saída de cada chamada pequena o bastante para caber no
 * limite de tempo de uma função serverless mesmo em balancetes grandes.
 */
export async function parseIndicePaginaComIA(
  paginaTexto: string,
  paginaNum: number,
  totalPaginas: number
): Promise<BalanceteIndice> {
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    output_config: { format: { type: "json_schema", schema: INDICE_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              `O texto abaixo é a página ${paginaNum} de ${totalPaginas} de um Balancete de Verificação`,
              "contábil brasileiro (extraído via biblioteca de texto de PDF — a ordem das colunas dentro de",
              "cada linha pode estar embaralhada, mas cada conta ocupa uma linha própria e todos os valores",
              "estão presentes).",
              "",
              "TEXTO DA PÁGINA:",
              "```",
              paginaTexto,
              "```",
              "",
              "Em `contas`, extraia TODAS as linhas de conta (sintéticas e analíticas) desta página cujo Saldo",
              "Atual seja diferente de zero. Ignore linhas com Saldo Atual \"0,00\". NÃO inclua a descrição da",
              "conta — apenas:",
              "- `classificacao`: o código hierárquico (ex: \"1.1.1.01.001\").",
              "- `saldoAtual`: o valor numérico do Saldo Atual, sem o sufixo D/C (ponto decimal, sem separador de milhar).",
              "- `natureza`: \"D\" ou \"C\", conforme o sufixo do Saldo Atual.",
              "- `grupo`: a seção de topo do balancete a que a conta pertence. Se o cabeçalho da seção (ATIVO,",
              "  PASSIVO, PATRIMÔNIO LÍQUIDO, CONTAS DE RESULTADOS - CUSTOS E DESPESAS, CONTAS DE RESULTADO -",
              "  RECEITAS, CONTAS DE APURAÇÃO, CONTAS DE COMPENSAÇÃO) não aparecer nesta página (porque a seção",
              "  começou em página anterior), infira pelo prefixo do próprio código de classificação: início",
              "  \"1\" → ATIVO; início \"2.4\" → PL; demais início \"2\" → PASSIVO; início \"3\" → DESPESA; início",
              "  \"4\" → RECEITA; início \"5\" → APURACAO; início \"6\" → COMPENSACAO.",
              "",
              "Se esta página contiver a seção \"RESUMO DO BALANCETE\", extraia também em `resumo` cada linha",
              "com Saldo Atual diferente de zero (descrição + valor + D/C). Caso contrário, deixe `resumo`",
              "como lista vazia.",
              "",
              "Não invente contas ou valores que não estejam no texto desta página.",
            ].join("\n"),
          },
        ],
      },
    ],
  })
  const response = await stream.finalMessage()

  if (response.stop_reason === "max_tokens") {
    throw new Error("A página é grande demais para ser analisada em uma única chamada")
  }
  if (response.stop_reason === "refusal") {
    throw new Error("A análise do PDF foi recusada")
  }

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") return { contas: [], resumo: [] }

  return JSON.parse(textBlock.text) as BalanceteIndice
}

const DESCRICOES_SCHEMA = {
  type: "object",
  properties: {
    descricoes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          classificacao: { type: "string" },
          descricao: { type: "string" },
        },
        required: ["classificacao", "descricao"],
        additionalProperties: false,
      },
    },
  },
  required: ["descricoes"],
  additionalProperties: false,
} as const

/**
 * Segunda etapa (repetida em lotes pequenos): busca só a descrição de um conjunto limitado
 * de contas, identificadas pela classificação já obtida na etapa de índice. Cada lote fica
 * pequeno o bastante para responder bem dentro do limite de tempo de uma função serverless.
 */
export async function parseDescricoesComIA(pdfBuffer: Buffer, classificacoes: string[]): Promise<DescricaoConta[]> {
  if (classificacoes.length === 0) return []

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    output_config: { format: { type: "json_schema", schema: DESCRICOES_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          documentoPdf(pdfBuffer),
          {
            type: "text",
            text: [
              CONTEXTO_BALANCETE,
              "",
              "Extraia APENAS a descrição da conta (coluna \"Descrição da conta\", exatamente como impressa,",
              "preservando o prefixo \"(-)\" quando houver) para cada uma das seguintes contas, identificadas",
              "pelo código da coluna \"Classificação\":",
              "",
              classificacoes.join(", "),
              "",
              "Ignore todas as demais contas do documento. Não invente descrições para códigos que não",
              "existam no documento — nesse caso, simplesmente omita o item.",
            ].join("\n"),
          },
        ],
      },
    ],
  })
  const response = await stream.finalMessage()

  if (response.stop_reason === "max_tokens") {
    throw new Error("Lote de contas grande demais para ser analisado em uma única chamada")
  }
  if (response.stop_reason === "refusal") {
    throw new Error("A análise do PDF foi recusada")
  }

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") return []

  const parsed = JSON.parse(textBlock.text) as { descricoes: DescricaoConta[] }
  return parsed.descricoes
}
