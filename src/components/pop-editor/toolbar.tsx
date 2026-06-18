"use client"

import { type Editor } from "@tiptap/react"
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Code2,
  Image, Link, Undo, Redo,
  Highlighter, Minus, ChevronDown,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useState } from "react"

const HIGHLIGHT_COLORS = [
  { label: "Amarelo",  color: "#fef08a" },
  { label: "Verde",    color: "#bbf7d0" },
  { label: "Azul",     color: "#bfdbfe" },
  { label: "Laranja",  color: "#fed7aa" },
  { label: "Rosa",     color: "#fbcfe8" },
  { label: "Roxo",     color: "#e9d5ff" },
]

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, tooltip, children }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          isActive && "bg-accent text-accent-foreground"
        )}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

interface EditorToolbarProps {
  editor: Editor | null
  onAddImage?: () => void
  onAddLink?: () => void
}

export function EditorToolbar({ editor, onAddImage, onAddLink }: EditorToolbarProps) {
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5 bg-muted/30">
      <ToolbarButton tooltip="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton tooltip="Título 1" isActive={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Título 2" isActive={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Título 3" isActive={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton tooltip="Negrito" isActive={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Itálico" isActive={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Sublinhado" isActive={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Tachado" isActive={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      {/* Marcador de texto com paleta de cores */}
      <div className="relative">
        <Tooltip>
          <TooltipTrigger
            type="button"
            onClick={() => setShowHighlightPicker((v) => !v)}
            className={cn(
              "inline-flex h-8 items-center gap-0.5 px-1.5 rounded-md text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none",
              editor.isActive("highlight") && "bg-accent text-accent-foreground"
            )}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <ChevronDown className="h-2.5 w-2.5" />
          </TooltipTrigger>
          <TooltipContent>Marcador de texto</TooltipContent>
        </Tooltip>

        {showHighlightPicker && (
          <div className="absolute top-full left-0 mt-1 z-50 flex flex-col gap-1 rounded-lg border bg-popover p-2 shadow-lg min-w-[160px]">
            <p className="text-[10px] font-semibold text-muted-foreground px-1 mb-0.5">Marcador de texto</p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {HIGHLIGHT_COLORS.map(({ label, color }) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run()
                    setShowHighlightPicker(false)
                  }}
                  className="h-5 w-5 rounded-full border border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run()
                setShowHighlightPicker(false)
              }}
              className="mt-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors text-left"
            >
              Remover marcador
            </button>
          </div>
        )}
      </div>
      <ToolbarButton tooltip="Código inline" isActive={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton tooltip="Lista" isActive={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Lista numerada" isActive={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Citação" isActive={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Bloco de código" isActive={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton tooltip="Linha horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {onAddImage && (
        <ToolbarButton tooltip="Inserir imagem" onClick={onAddImage}>
          <Image className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}
      {onAddLink && (
        <ToolbarButton tooltip="Inserir link" isActive={editor.isActive("link")} onClick={onAddLink}>
          <Link className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}
    </div>
  )
}
