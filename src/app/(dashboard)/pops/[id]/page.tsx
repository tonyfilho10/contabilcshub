import { notFound } from "next/navigation"
import Link from "next/link"
import { Edit, ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatusBadge, type PopStatus } from "@/components/pop-editor/status-badge"
import { ExportPdfButton } from "@/components/pop-editor/export-pdf-button"
import { PopPrintArea } from "@/components/pop-editor/pop-print-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Dados mockados enquanto o banco não está configurado
async function getPop(id: string) {
  const mock = {
    id,
    titulo: "Conciliação Bancária Mensal",
    descricao:
      "Procedimento para realização da conciliação bancária ao final de cada mês, garantindo a conferência entre os saldos contábeis e os extratos bancários.",
    conteudo: `<h2>Objetivo</h2><p>Garantir que o saldo contábil da conta bancária esteja em conformidade com o saldo apresentado pelo extrato do banco, identificando e corrigindo eventuais divergências.</p><h2>Periodicidade</h2><p>Mensal — até o 5º dia útil do mês subsequente.</p><h2>Responsável</h2><p>Analista Contábil designado pelo supervisor.</p><h2>Passo a Passo</h2><ol><li>Exportar o extrato bancário do sistema do banco referente ao mês.</li><li>Abrir o livro razão da conta bancária no sistema contábil.</li><li>Comparar os lançamentos, identificando diferenças.</li><li>Registrar ajustes para itens pendentes (cheques em trânsito, débitos automáticos etc.).</li><li>Emitir o relatório de conciliação assinado pelo responsável.</li><li>Arquivar o relatório no sistema.</li></ol><h2>Pontos de Atenção</h2><blockquote>Divergências acima de R$ 500,00 devem ser reportadas imediatamente ao supervisor.</blockquote><p>Verificar lançamentos duplicados, estornos e tarifas bancárias não previstas.</p>`,
    status: "PUBLICADO" as PopStatus,
    versao: "1.2",
    tags: [
      { id: "1", nome: "Contabilidade", cor: "#6366f1" },
      { id: "2", nome: "Mensal", cor: "#22c55e" },
    ],
    autorNome: "Carlos Eduardo",
    criadoEm: new Date("2025-01-10"),
    atualizadoEm: new Date("2025-03-15"),
  }
  return mock
}

export default async function PopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pop = await getPop(id)
  if (!pop) notFound()

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={pop.titulo}
        breadcrumbs={[
          { label: "CSHUB Contábil", href: "/dashboard" },
          { label: "POPs", href: "/pops" },
          { label: pop.titulo },
        ]}
      >
        <Link href="/pops" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Link>
        <ExportPdfButton titulo={pop.titulo} />
        <Link
          href={`/pops/${id}/editar`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Edit className="h-4 w-4 mr-1" />Editar
        </Link>
      </PageHeader>

      {/* Área de impressão — visível só no print */}
      <PopPrintArea
        titulo={pop.titulo}
        descricao={pop.descricao}
        conteudo={pop.conteudo}
        status={pop.status}
        versao={pop.versao}
        tags={pop.tags}
        autorNome={pop.autorNome}
        criadoEm={pop.criadoEm}
        atualizadoEm={pop.atualizadoEm}
      />

      {/* Visualização normal na tela */}
      <main className="flex-1 p-4 md:p-6 print:hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={pop.status} />
            <span className="text-sm text-muted-foreground">v{pop.versao}</span>
            {pop.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  backgroundColor: tag.cor + "18",
                  color: tag.cor,
                  borderColor: tag.cor + "44",
                }}
                className="font-medium"
              >
                {tag.nome}
              </Badge>
            ))}
          </div>

          {/* Descrição */}
          {pop.descricao && (
            <div className="rounded-lg border-l-4 border-primary bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {pop.descricao}
            </div>
          )}

          <Separator />

          {/* Conteúdo */}
          <Card>
            <CardContent className="pt-6">
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: pop.conteudo ?? "" }}
              />
            </CardContent>
          </Card>

          {/* Rodapé de metadados */}
          <div className="flex flex-wrap gap-6 text-xs text-muted-foreground pt-2">
            {pop.autorNome && <span><strong>Autor:</strong> {pop.autorNome}</span>}
            {pop.criadoEm && (
              <span>
                <strong>Criado em:</strong>{" "}
                {new Intl.DateTimeFormat("pt-BR").format(pop.criadoEm)}
              </span>
            )}
            {pop.atualizadoEm && (
              <span>
                <strong>Atualizado:</strong>{" "}
                {new Intl.DateTimeFormat("pt-BR").format(pop.atualizadoEm)}
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
