import "@/components/pop-editor/pop-print.css"
import { type PopStatus } from "./status-badge"

interface Tag {
  id: string
  nome: string
  cor: string
}

interface PopPrintAreaProps {
  titulo: string
  descricao?: string | null
  conteudo?: string | null
  status: PopStatus
  versao: string
  tags?: Tag[]
  autorNome?: string
  criadoEm?: Date
  atualizadoEm?: Date
}

const STATUS_LABELS: Record<PopStatus, string> = {
  RASCUNHO: "Rascunho",
  EM_REVISAO: "Em Revisão",
  APROVADO: "Aprovado",
  PUBLICADO: "Publicado",
  ARQUIVADO: "Arquivado",
}

function formatDate(date?: Date) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function PopPrintArea({
  titulo,
  descricao,
  conteudo,
  status,
  versao,
  tags = [],
  autorNome,
  criadoEm,
  atualizadoEm,
}: PopPrintAreaProps) {
  return (
    <div id="pop-print-area" className="hidden print:block">
      {/* Cabeçalho */}
      <div className="pop-print-header">
        <div className="pop-print-logo">CSHUB Contábil — Procedimento Operacional Padrão</div>
        <div className="pop-print-title">{titulo}</div>
        <div className="pop-print-meta">
          <span>
            <strong>Versão:</strong>&nbsp;{versao}
          </span>
          {autorNome && (
            <span>
              <strong>Autor:</strong>&nbsp;{autorNome}
            </span>
          )}
          {criadoEm && (
            <span>
              <strong>Criado em:</strong>&nbsp;{formatDate(criadoEm)}
            </span>
          )}
          {atualizadoEm && (
            <span>
              <strong>Atualizado:</strong>&nbsp;{formatDate(atualizadoEm)}
            </span>
          )}
          <span>
            <span className="pop-print-status">{STATUS_LABELS[status]}</span>
          </span>
        </div>
      </div>

      {/* Descrição */}
      {descricao && (
        <div className="pop-print-descricao">{descricao}</div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="pop-print-tags">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="pop-print-tag"
              style={{ color: tag.cor, borderColor: tag.cor }}
            >
              {tag.nome}
            </span>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      <div
        className="pop-print-content"
        dangerouslySetInnerHTML={{ __html: conteudo ?? "<p>Sem conteúdo.</p>" }}
      />

      {/* Rodapé */}
      <div className="pop-print-footer">
        <span>CSHUB Contábil — {titulo} v{versao}</span>
        <span>Impresso em {formatDate(new Date())}</span>
      </div>
    </div>
  )
}
