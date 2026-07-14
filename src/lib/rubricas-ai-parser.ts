import Anthropic from "@anthropic-ai/sdk"
import type { RubricaGrupo } from "@/lib/rubricas-grupos"

export interface RubricaRelatorioItem {
  grupo: RubricaGrupo
  codigo: string
  descricao: string
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    itens: {
      type: "array",
      items: {
        type: "object",
        properties: {
          grupo: { type: "string", enum: ["FOLHA_NORMAL", "FERIAS", "RESCISAO", "EMPRESA"] },
          codigo: { type: "string" },
          descricao: { type: "string" },
        },
        required: ["grupo", "codigo", "descricao"],
        additionalProperties: false,
      },
    },
  },
  required: ["itens"],
  additionalProperties: false,
} as const

const client = new Anthropic()

/**
 * Extrai os itens de um relatório de rubricas/itens não configurados a
 * partir do PDF original via Claude — mais robusto que extração de texto
 * pura para relatórios com layout em colunas, tabelas ou qualidade de
 * digitalização variável.
 */
export async function parseRelatorioRubricasComIA(pdfBuffer: Buffer): Promise<RubricaRelatorioItem[]> {
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
              "Este é um relatório de rubricas de folha de pagamento não configuradas, dividido em seções por grupo (Folha Normal, Férias, Rescisão, Empresa).",
              "Extraia todos os itens do relatório, um por linha de código, mapeando cada seção para o grupo correspondente:",
              "- \"Folha Normal\" → FOLHA_NORMAL",
              "- \"Férias\" → FERIAS",
              "- \"Rescisão\" → RESCISAO",
              "- \"Empresa\" → EMPRESA",
              "Ignore cabeçalhos, rodapés e linhas de \"Código Descrição\". Não invente itens que não estejam no documento.",
            ].join("\n"),
          },
        ],
      },
    ],
  })
  const response = await stream.finalMessage()

  if (response.stop_reason === "max_tokens") {
    throw new Error("O relatório é grande demais para ser analisado em uma única chamada")
  }
  if (response.stop_reason === "refusal") {
    throw new Error("A análise do PDF foi recusada")
  }

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") return []

  const parsed = JSON.parse(textBlock.text) as { itens: RubricaRelatorioItem[] }
  return parsed.itens
}
