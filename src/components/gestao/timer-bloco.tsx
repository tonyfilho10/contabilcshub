"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipForward } from "lucide-react"

const BLOCOS = [
  { nome: "Travado",     minutos: 10, descricao: "Cada sócio traz 1 impedimento" },
  { nome: "Tema do Dia", minutos: 25, descricao: "Conversa estruturada" },
  { nome: "Decisões",    minutos: 15, descricao: "Definir: o quê / quem / prazo / contexto" },
  { nome: "Delegação",   minutos: 10, descricao: "Registrar e enviar para responsáveis" },
]

export function TimerBloco() {
  const [blocoIdx, setBlocoIdx] = useState(0)
  const [segundos, setSegundos] = useState(BLOCOS[0].minutos * 60)
  const [rodando, setRodando] = useState(false)

  const bloco = BLOCOS[blocoIdx]

  useEffect(() => {
    setSegundos(bloco.minutos * 60)
    setRodando(false)
  }, [blocoIdx, bloco.minutos])

  useEffect(() => {
    if (!rodando) return
    const id = setInterval(() => setSegundos(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [rodando])

  const mm = String(Math.floor(segundos / 60)).padStart(2, "0")
  const ss = String(segundos % 60).padStart(2, "0")
  const progresso = ((bloco.minutos * 60 - segundos) / (bloco.minutos * 60)) * 100

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Bloco {blocoIdx + 1}/{BLOCOS.length}</p>
          <h3 className="font-semibold">{bloco.nome}</h3>
          <p className="text-xs text-muted-foreground">{bloco.descricao}</p>
        </div>
        <div className="text-3xl font-mono font-bold">{mm}:{ss}</div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${progresso}%` }} />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => setRodando(r => !r)}>
          {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {rodando ? "Pausar" : "Iniciar"}
        </Button>
        {blocoIdx < BLOCOS.length - 1 && (
          <Button size="sm" variant="ghost" onClick={() => setBlocoIdx(i => i + 1)}>
            <SkipForward className="h-4 w-4 mr-1" />Próximo bloco
          </Button>
        )}
        <div className="ml-auto flex gap-1 flex-wrap">
          {BLOCOS.map((b, i) => (
            <Badge
              key={i}
              variant={i === blocoIdx ? "default" : i < blocoIdx ? "secondary" : "outline"}
              className="cursor-pointer text-[10px]"
              onClick={() => setBlocoIdx(i)}
            >
              {b.nome}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
