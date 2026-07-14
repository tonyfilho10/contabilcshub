"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GRUPO_OPTIONS, type RubricaGrupo } from "@/lib/rubricas-grupos"

export interface RubricaFormData {
  id?: string
  codigo: string
  descricao: string
  grupo: RubricaGrupo
  lancamento: string
  contaDebito: string
  contaCredito: string
  historico: string
}

interface RubricaFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  inicial?: RubricaFormData
  /** Quando vem de um item de conferência sem match, código/descrição/grupo vêm travados */
  travarIdentificacao?: boolean
  onSave: (data: RubricaFormData) => Promise<void>
}

const EMPTY: RubricaFormData = {
  codigo: "",
  descricao: "",
  grupo: "FOLHA_NORMAL",
  lancamento: "",
  contaDebito: "",
  contaCredito: "",
  historico: "",
}

export function RubricaForm({ open, onOpenChange, inicial, travarIdentificacao, onSave }: RubricaFormProps) {
  const [form, setForm] = useState<RubricaFormData>(inicial ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const isEdicao = !!inicial?.id

  useEffect(() => {
    if (open) {
      setForm(inicial ?? EMPTY)
      setErro("")
    }
  }, [open, inicial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.codigo.trim() || !form.descricao.trim()) {
      setErro("Código e descrição são obrigatórios.")
      return
    }
    setErro("")
    setLoading(true)
    try {
      await onSave(form)
      onOpenChange(false)
    } catch (err: unknown) {
      setErro((err as Error)?.message ?? "Erro ao salvar rubrica.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdicao ? "Editar rubrica" : "Cadastrar rubrica"}</DialogTitle>
          <DialogDescription>
            Aponte o grupo e o lançamento contábil correto para essa rubrica.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                disabled={travarIdentificacao}
                placeholder="Ex: 150"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="grupo">Grupo</Label>
              <Select
                value={form.grupo}
                onValueChange={(v) => setForm((f) => ({ ...f, grupo: v as RubricaGrupo }))}
                disabled={travarIdentificacao}
              >
                <SelectTrigger id="grupo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRUPO_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              disabled={travarIdentificacao}
              placeholder="Ex: HORAS EXTRAS"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="lancamento">Lançamento</Label>
            <Input
              id="lancamento"
              value={form.lancamento}
              onChange={(e) => setForm((f) => ({ ...f, lancamento: e.target.value }))}
              placeholder="Ex: HORAS EXTRAS"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="contaDebito">Conta débito</Label>
              <Input
                id="contaDebito"
                value={form.contaDebito}
                onChange={(e) => setForm((f) => ({ ...f, contaDebito: e.target.value }))}
                placeholder="Ex: 819 - HORAS EXTRAS"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contaCredito">Conta crédito</Label>
              <Input
                id="contaCredito"
                value={form.contaCredito}
                onChange={(e) => setForm((f) => ({ ...f, contaCredito: e.target.value }))}
                placeholder="Ex: 187 - SALÁRIOS A PAGAR"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="historico">Histórico</Label>
            <Input
              id="historico"
              value={form.historico}
              onChange={(e) => setForm((f) => ({ ...f, historico: e.target.value }))}
              placeholder="Ex: 85 - Vlr. das Horas Extras a pagar Conf. Folha"
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdicao ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
