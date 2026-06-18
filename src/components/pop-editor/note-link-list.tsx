"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { FileText, BookOpen, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NoteLinkItem {
  id: string
  titulo: string
  tipo: "nota" | "pop" | "criar"
}

interface NoteLinkListProps {
  items: NoteLinkItem[]
  command: (item: NoteLinkItem) => void
}

export interface NoteLinkListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const NoteLinkList = forwardRef<NoteLinkListHandle, NoteLinkListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === "Enter") {
          if (items[selectedIndex]) command(items[selectedIndex])
          return true
        }
        return false
      },
    }))

    if (!items.length) {
      return (
        <div className="rounded-lg border bg-popover shadow-md p-2 text-xs text-muted-foreground min-w-[220px]">
          Nenhum resultado
        </div>
      )
    }

    return (
      <div className="rounded-lg border bg-popover shadow-md overflow-hidden min-w-[260px] z-50 max-h-72 overflow-y-auto">
        {items.map((item, i) => (
          <button
            key={`${item.tipo}-${item.id}`}
            type="button"
            onClick={() => command(item)}
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors",
              i === selectedIndex
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {item.tipo === "criar" ? (
              <Plus className="h-3.5 w-3.5 shrink-0" />
            ) : item.tipo === "pop" ? (
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 shrink-0" />
            )}
            <div className="leading-tight min-w-0">
              <p className="font-medium truncate">{item.titulo}</p>
              {item.tipo !== "criar" && (
                <p className={cn("text-[10px] truncate", i === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {item.tipo === "pop" ? "POP" : "Anotação"}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }
)

NoteLinkList.displayName = "NoteLinkList"
