"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Code2,
  Image, Link, Undo, Redo,
  Highlighter, Minus, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useEffect, useRef, useState } from "react"

const HIGHLIGHT_COLORS = [
  { label: "Amarelo",  color: "#fef08a" },
  { label: "Verde",    color: "#bbf7d0" },
  { label: "Azul",     color: "#bfdbfe" },
  { label: "Laranja",  color: "#fed7aa" },
  { label: "Rosa",     color: "#fbcfe8" },
  { label: "Roxo",     color: "#e9d5ff" },
]

interface FloatingToolbarProps {
  editor: Editor
  onAddImage?: () => void
  onAddLink?: () => void
}

function Btn({
  onClick, isActive, disabled, title, children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded text-sm transition-colors hover:bg-accent",
        "disabled:pointer-events-none disabled:opacity-40",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </button>
  )
}

export function FloatingToolbar({ editor, onAddImage, onAddLink }: FloatingToolbarProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [showColors, setShowColors] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const { from, to } = editor.state.selection
      if (from === to) {
        setVisible(false)
        setShowColors(false)
        return
      }

      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) { setVisible(false); return }

      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (!rect.width) { setVisible(false); return }

      const toolbarW = toolbarRef.current?.offsetWidth ?? 400
      const left = Math.min(
        Math.max(8, rect.left + rect.width / 2 - toolbarW / 2),
        window.innerWidth - toolbarW - 8
      )

      setPos({ top: rect.top - 44, left })
      setVisible(true)
    }

    editor.on("selectionUpdate", update)
    editor.on("transaction", update)
    document.addEventListener("selectionchange", update)
    return () => {
      editor.off("selectionUpdate", update)
      editor.off("transaction", update)
      document.removeEventListener("selectionchange", update)
    }
  }, [editor])

  if (!visible) return null

  return (
    <div
      ref={toolbarRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 50 }}
      className="flex flex-wrap items-center gap-0.5 rounded-lg border bg-popover shadow-lg px-1.5 py-1 animate-in fade-in-0 zoom-in-95 duration-100"
    >
      {/* Desfazer / Refazer */}
      <Btn title="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-3.5 w-3.5" />
      </Btn>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Títulos */}
      <Btn title="Título 1" isActive={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Título 2" isActive={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Título 3" isActive={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-3.5 w-3.5" />
      </Btn>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Formatação inline */}
      <Btn title="Negrito" isActive={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Itálico" isActive={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Sublinhado" isActive={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Tachado" isActive={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-3.5 w-3.5" />
      </Btn>

      {/* Marcador de texto colorido */}
      <div className="relative">
        <button
          type="button"
          title="Marcador de texto"
          onMouseDown={(e) => { e.preventDefault(); setShowColors((v) => !v) }}
          className={cn(
            "inline-flex h-7 items-center gap-0.5 px-1 rounded text-sm transition-colors hover:bg-accent",
            editor.isActive("highlight") && "bg-accent text-accent-foreground"
          )}
        >
          <Highlighter className="h-3.5 w-3.5" />
          <ChevronDown className="h-2.5 w-2.5" />
        </button>

        {showColors && (
          <div className="absolute bottom-full left-0 mb-1 flex flex-col gap-1.5 rounded-lg border bg-popover p-2 shadow-lg z-50 min-w-[140px]">
            <div className="flex flex-wrap gap-1.5">
              {HIGHLIGHT_COLORS.map(({ label, color }) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor.chain().focus().toggleHighlight({ color }).run()
                    setShowColors(false)
                  }}
                  className="h-5 w-5 rounded-full border border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                editor.chain().focus().unsetHighlight().run()
                setShowColors(false)
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded px-1 py-0.5 transition-colors text-left"
            >
              Remover marcador
            </button>
          </div>
        )}
      </div>

      <Btn title="Código inline" isActive={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-3.5 w-3.5" />
      </Btn>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Blocos */}
      <Btn title="Lista" isActive={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Lista numerada" isActive={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Citação" isActive={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Bloco de código" isActive={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Linha horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-3.5 w-3.5" />
      </Btn>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Imagem e Link */}
      {onAddImage && (
        <Btn title="Inserir imagem" onClick={onAddImage}>
          <Image className="h-3.5 w-3.5" />
        </Btn>
      )}
      {onAddLink && (
        <Btn title="Inserir link" isActive={editor.isActive("link")} onClick={onAddLink}>
          <Link className="h-3.5 w-3.5" />
        </Btn>
      )}
    </div>
  )
}
