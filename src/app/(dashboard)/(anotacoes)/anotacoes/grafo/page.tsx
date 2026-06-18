"use client"

import { useEffect, useState, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { PageHeader } from "@/components/page-header"
import { FileText, BookOpen } from "lucide-react"

interface GrafoNode { id: string; titulo: string; tipo: "nota" | "pop" }
interface GrafoEdge { de: string; para: string; paraTipo: string }

function notaNode(n: GrafoNode, index: number, total: number): Node {
  const angle = (index / total) * 2 * Math.PI
  const radius = Math.min(300 + total * 15, 600)
  return {
    id: n.id,
    type: "default",
    position: {
      x: 500 + radius * Math.cos(angle),
      y: 400 + radius * Math.sin(angle),
    },
    data: { label: n.titulo },
    style: {
      background: n.tipo === "pop" ? "hsl(var(--chart-2) / 0.15)" : "hsl(var(--chart-1) / 0.15)",
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

export default function GrafoPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch("/api/grafo")
      .then((r) => r.json())
      .then(({ nodes: ns, edges: es }: { nodes: GrafoNode[]; edges: GrafoEdge[] }) => {
        setNodes(ns.map((n, i) => notaNode(n, i, ns.length)))
        setEdges(
          es.map((e, i) => ({
            id: `e${i}`,
            source: e.de,
            target: e.para,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 },
            animated: false,
          }))
        )
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Navega para a nota/pop ao clicar no nó
    const tipo = (node.style?.border as string ?? "").includes("chart-2") ? "pop" : "nota"
    window.location.href = tipo === "pop"
      ? `/pops/${node.id}`
      : `/anotacoes/${node.id}/editar`
  }, [])

  return (
    <div className="flex flex-col flex-1 h-full">
      <PageHeader
        title="Grafo de Conhecimento"
        breadcrumbs={[
          { label: "Anotações", href: "/anotacoes" },
          { label: "Grafo" },
        ]}
      >
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-1)/0.4)] border border-[hsl(var(--chart-1))]" />
            <FileText className="h-3 w-3" /> Anotações
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-2)/0.4)] border border-[hsl(var(--chart-2))]" />
            <BookOpen className="h-3 w-3" /> POPs
          </span>
        </div>
      </PageHeader>

      <div className="flex-1 relative">
        {carregando ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Carregando grafo…
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <p className="text-sm">Nenhuma conexão encontrada ainda.</p>
            <p className="text-xs">Use <code className="bg-muted px-1 rounded">[[título]]</code> dentro de uma nota para criar referências.</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            colorMode="system"
          >
            <Background gap={20} size={1} color="hsl(var(--border))" />
            <Controls
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
        )}
      </div>
    </div>
  )
}
