"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { FileText, BookOpen, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

// Canvas precisa do browser — sem SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

type Filtro = "todos" | "notas" | "pops"

interface GrafoNode { id: string; titulo: string; tipo: "nota" | "pop" }
interface GrafoEdge  { de: string; para: string; paraTipo: string }

const FILTROS: { value: Filtro; label: string; icon: React.ReactNode }[] = [
  { value: "todos",  label: "Todos",     icon: <LayoutGrid className="h-3 w-3" /> },
  { value: "notas",  label: "Anotações", icon: <FileText   className="h-3 w-3" /> },
  { value: "pops",   label: "POPs",      icon: <BookOpen   className="h-3 w-3" /> },
]

interface GrafoAnotacoesProps {
  initialFiltro?: Filtro
}

export function GrafoAnotacoes({ initialFiltro = "todos" }: GrafoAnotacoesProps) {
  const [allNodes, setAllNodes]   = useState<GrafoNode[]>([])
  const [allEdges, setAllEdges]   = useState<GrafoEdge[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro]       = useState<Filtro>(initialFiltro)
  const [dark, setDark]           = useState(false)
  const graphRef                  = useRef<any>(null)
  const [dims, setDims]           = useState({ w: 800, h: 500 })

  // Detecta dark mode
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Dimensões baseadas no viewport — sem ResizeObserver (evita loop)
  useEffect(() => {
    function update() {
      // sidebar ≈ 256px; header+tabs+padding ≈ 240px
      setDims({
        w: Math.max(window.innerWidth - 256 - 48, 300),
        h: Math.max(window.innerHeight - 240, 300),
      })
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    fetch("/api/grafo")
      .then((r) => r.json())
      .then(({ nodes: ns, edges: es }: { nodes: GrafoNode[]; edges: GrafoEdge[] }) => {
        setAllNodes(ns)
        setAllEdges(es)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  const graphData = (() => {
    const nos = filtro === "todos" ? allNodes
      : allNodes.filter((n) => (filtro === "notas" ? n.tipo === "nota" : n.tipo === "pop"))
    const ids = new Set(nos.map((n) => n.id))
    const links = allEdges
      .filter((e) => ids.has(e.de) && ids.has(e.para))
      .map((e) => ({ source: e.de, target: e.para }))
    return {
      nodes: nos.map((n) => ({ ...n })),
      links,
    }
  })()

  const onNodeClick = useCallback((node: any) => {
    window.location.href = node.tipo === "pop"
      ? `/pops/${node.id}`
      : `/anotacoes/${node.id}`
  }, [])

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isPop  = node.tipo === "pop"
    const radius = 5
    const label  = node.titulo as string
    const fontSize = Math.max(10 / globalScale, 3)

    // Círculo
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = isPop
      ? (dark ? "#34d399" : "#10b981")   // verde para POPs
      : (dark ? "#818cf8" : "#6366f1")   // índigo para notas
    ctx.fill()

    // Anel ao redor
    ctx.strokeStyle = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Label
    ctx.font = `${fontSize}px Inter, sans-serif`
    ctx.textAlign  = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle  = dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)"
    ctx.fillText(label.length > 24 ? label.slice(0, 22) + "…" : label, node.x, node.y + radius + fontSize)
  }, [dark])

  const bg    = dark ? "#09090b" : "#fafafa"
  const link  = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"

  if (carregando) return (
    <div className="flex items-center justify-center h-[540px] text-muted-foreground text-sm">
      Carregando grafo…
    </div>
  )

  if (allNodes.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[540px] gap-2 text-muted-foreground">
      <p className="text-sm font-medium">Nenhuma conexão encontrada ainda.</p>
      <p className="text-xs">Use <code className="bg-muted px-1 rounded">{"[[título]]"}</code> dentro de uma nota para criar referências.</p>
    </div>
  )

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Barra */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: dark ? "#818cf8" : "#6366f1" }} />
            <FileText className="h-3 w-3" /> Anotações
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: dark ? "#34d399" : "#10b981" }} />
            <BookOpen className="h-3 w-3" /> POPs
          </span>
        </div>
        <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
          {FILTROS.map(({ value, label, icon }) => (
            <button key={value} type="button" onClick={() => setFiltro(value)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                filtro === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-hidden">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dims.w}
          height={dims.h}
          backgroundColor={bg}
          linkColor={() => link}
          linkWidth={1.2}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
            ctx.fill()
          }}
          onNodeClick={onNodeClick}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          onEngineStop={() => graphRef.current?.zoomToFit(400, 60)}
        />
      </div>
    </div>
  )
}
