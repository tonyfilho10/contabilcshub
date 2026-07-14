"use client"

import { useRef, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Loader2, CheckCircle2, XCircle, AlertTriangle, Scale } from "lucide-react"
import { formatBRL } from "@/lib/format-currency"
import { cn } from "@/lib/utils"

type Natureza = "D" | "C"

interface ErroNatureza {
  classificacao: string
  descricao: string
  naturezaEncontrada: Natureza
  naturezaEsperada: Natureza
  motivo: string
}

interface ContaResumida {
  codigo: string
  classificacao: string
  descricao: string
  saldoAtual: number
  natureza: Natureza
}

interface GrupoDuplicidade {
  descricaoNormalizada: string
  contas: ContaResumida[]
}

interface FechamentoResumo {
  linhas: { descricao: string; saldoAtual: number; natureza: Natureza }[]
  totalPositivo: number
  totalNegativo: number
  diferenca: number
  balanceado: boolean
}

interface ResultadoConferencia {
  totalContas: number
  errosNatureza: ErroNatureza[]
  duplicidades: GrupoDuplicidade[]
  fechamentoAtivoPassivo: FechamentoResumo | null
  fechamentoDebitoCredito: FechamentoResumo | null
}

function naturezaLabel(n: Natureza) {
  return n === "D" ? "Devedora (D)" : "Credora (C)"
}

export default function ConferenciasPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Conferências"
        breadcrumbs={[{ label: "CSHUB Contábil", href: "/dashboard" }, { label: "Conferências" }]}
      />
      <main className="flex-1 p-4 md:p-6">
        <BalanceteTab />
      </main>
    </div>
  )
}

function BalanceteTab() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoConferencia | null>(null)
  const [erro, setErro] = useState("")

  const handleArquivo = async (file: File) => {
    setEnviando(true)
    setErro("")
    try {
      const formData = new FormData()
      formData.append("arquivo", file)
      const res = await fetch("/api/conferencias/importar", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar o balancete")
      setResultado(data)
    } catch (err: unknown) {
      setErro((err as Error)?.message ?? "Erro ao processar o balancete")
      setResultado(null)
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Balancete de verificação</p>
          <p className="text-xs text-muted-foreground">
            Envie o balancete em PDF — o CSHUB confere a natureza de cada conta, o fechamento Ativo × Passivo
            e possíveis contas em duplicidade.
          </p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={enviando} className="shrink-0">
          {enviando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {enviando ? "Analisando…" : "Enviar PDF"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleArquivo(e.target.files[0])}
        />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {resultado && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <FechamentoCard
              titulo="Ativo × Passivo"
              fechamento={resultado.fechamentoAtivoPassivo}
            />
            <ResumoCard
              titulo="Naturezas de conta"
              ok={resultado.errosNatureza.length === 0}
              okLabel={`${resultado.totalContas} contas conferidas, nenhum erro`}
              erroLabel={`${resultado.errosNatureza.length} erro${resultado.errosNatureza.length !== 1 ? "s" : ""} de natureza`}
            />
            <ResumoCard
              titulo="Contas em duplicidade"
              ok={resultado.duplicidades.length === 0}
              okLabel="Nenhuma duplicidade encontrada"
              erroLabel={`${resultado.duplicidades.length} grupo${resultado.duplicidades.length !== 1 ? "s" : ""} de possível duplicidade`}
            />
          </div>

          {resultado.fechamentoDebitoCredito && !resultado.fechamentoDebitoCredito.balanceado && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Total de contas devedoras ({formatBRL(resultado.fechamentoDebitoCredito.totalPositivo)}) diferente do
                total de contas credoras ({formatBRL(resultado.fechamentoDebitoCredito.totalNegativo)}) — diferença de{" "}
                {formatBRL(Math.abs(resultado.fechamentoDebitoCredito.diferenca))}.
              </p>
            </div>
          )}

          {resultado.errosNatureza.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <p className="text-sm font-medium">Erros de natureza de conta</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Classificação</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-36">Natureza encontrada</TableHead>
                    <TableHead className="w-36">Natureza esperada</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.errosNatureza.map((e) => (
                    <TableRow key={e.classificacao}>
                      <TableCell className="font-mono text-sm">{e.classificacao}</TableCell>
                      <TableCell className="text-sm">{e.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">{naturezaLabel(e.naturezaEncontrada)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-600 bg-emerald-500/10">
                          {naturezaLabel(e.naturezaEsperada)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.motivo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {resultado.duplicidades.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <p className="text-sm font-medium">Possíveis contas em duplicidade</p>
                <p className="text-xs text-muted-foreground">
                  Contas analíticas diferentes com a mesma descrição — verifique se não deveriam ser uma única conta.
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Classificação</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-32">Natureza</TableHead>
                    <TableHead className="w-40 text-right">Saldo atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.duplicidades.flatMap((grupo) => [
                    ...grupo.contas.map((c) => (
                      <TableRow key={c.classificacao}>
                        <TableCell className="font-mono text-sm">{c.classificacao}</TableCell>
                        <TableCell className="text-sm">{c.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{naturezaLabel(c.natureza)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-mono">{formatBRL(c.saldoAtual)}</TableCell>
                      </TableRow>
                    )),
                  ])}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ResumoCard({ titulo, ok, okLabel, erroLabel }: { titulo: string; ok: boolean; okLabel: string; erroLabel: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {ok ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-sm", ok ? "text-emerald-600" : "text-destructive")}>
          {ok ? okLabel : erroLabel}
        </p>
      </CardContent>
    </Card>
  )
}

function FechamentoCard({ titulo, fechamento }: { titulo: string; fechamento: FechamentoResumo | null }) {
  const ok = fechamento?.balanceado ?? false
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {!fechamento ? (
            <Scale className="h-4 w-4 text-muted-foreground" />
          ) : ok ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!fechamento ? (
          <p className="text-sm text-muted-foreground">Resumo do balancete não encontrado no PDF</p>
        ) : ok ? (
          <p className="text-sm text-emerald-600">
            Fechado — {formatBRL(fechamento.totalPositivo)} (D) = {formatBRL(fechamento.totalNegativo)} (C)
          </p>
        ) : (
          <p className="text-sm text-destructive">
            Não bate: {formatBRL(fechamento.totalPositivo)} (D) vs {formatBRL(fechamento.totalNegativo)} (C) —
            diferença de {formatBRL(Math.abs(fechamento.diferenca))}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
