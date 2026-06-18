"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { FileText, BookOpen, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

type Filtro = "todos" | "notas" | "pops"

interface GrafoNode { id: string; titulo: string; tipo: "nota" | "pop" }
interface GrafoEdge  { de: string; para: string; paraTipo: string }

function buildNode(n: GrafoNode, index: number, total: number): Node {
  const angle  = (index / total) * 2 * Math.PI
  const radius = Math.min(280 + total * 12, 500)
  return {
    id: n.id,
    type: "default",
    position: {
      x: 400 + radius * Math.cos(angle),
      y: 320 + radius * Math.sin(angle),
    },
    data: { label: n.titulo, tipo: n.tipo },
    style: {
      background: n.tipo === "pop"
        ? "hsl(var(--chart-2) / 0.15)"
        : "hsl(var(--chart-1) / 0.15)",
      border: `1.5px solid ${n.tipo === "pop" ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"}`,
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 12,
      maxWidth: 160,
      cursor: "pointer",
      color: "hsl(var(--foreground))",
    },
  }
}

const FILTROS: { value: Filtro; label: string; icon: React.ReactNode }[] = [
  { value: "todos",  label: "Todos",     icon: <LayoutGrid className="h-3 w-3" /> },
  { value: "notas",  label: "Anotações", icon: <FileText   className="h-3 w-3" /> },
  { value: "pops",   label: "POPs",      icon: <BookOpen   className="h-3 w-3" /> },
]

export function GrafoAnotacoes() {
  const [allNodes, setAllNodes] = useState<GrafoNode[]>([])
  const [allEdges, setAllEdges] = useState<GrafoEdge[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>("todos")

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

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

  // Recalcula nodes/edges visíveis sempre que o filtro mudar
  useEffect(() => {
    const nosFiltrados = filtro === "todos"
      ? allNodes
      : allNodes.filter((n) => (filtro === "notas" ? n.tipo === "nota" : n.tipo === "pop"))

    const idsVisiveis = new Set(nosFiltrados.map((n) => n.id))

    const arestas = allEdges.filter(
      (e) => idsVisiveis.has(e.de) && idsVisiveis.has(e.para)
    )

    setNodes(nosFiltrados.map((n, i) => buildNode(n, i, nosFiltrados.length)))
    setEdges(arestas.map((e, i) => ({
      id: `e${i}`,
      source: e.de,
      target: e.para,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 },
    })))
  }, [filtro, allNodes, allEdges, setNodes, setEdges])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const isPop = (node.data as any).tipo === "pop"
    window.location.href = isPop
      ? `/pops/${node.id}`
      : `/anotacoes/${node.id}/editar`
  }, [])

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-[520px] text-muted-foreground text-sm">
        Carregando grafo…
      </div>
    )
  }

  if (allNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] gap-2 text-muted-foreground">
        <p className="text-sm font-medium">Nenhuma conexão encontrada ainda.</p>
        <p className="text-xs">
          Use <code className="bg-muted px-1 rounded">{"[[título]]"}</code> dentro de uma nota para criar referências.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ height: 540 }}>
      {/* Barra de controle */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        {/* Legenda */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--chart-1)/0.4)] border border-[hsl(var(--chart-1))]" />
            <FileText className="h-3 w-3" /> Anotações
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--chart-2)/0.4)] border border-[hsl(var(--chart-2))]" />
            <BookOpen className="h-3 w-3" /> POPs
          </span>
        </div>

        {/* Filtro segmentado */}
        <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
          {FILTROS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFiltro(value)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                filtro === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode="system"
        style={{ height: "calc(100% - 40px)" }}
      >
        <Background gap={20} size={1} color="hsl(var(--border))" />
        <Controls
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
          }}
        />
        <MiniMap
          nodeStrokeWidth={2}
          zoomable
          pannable
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
          }}
        />
      </ReactFlow>
    </div>
  )
}
