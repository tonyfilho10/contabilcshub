"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import UnderlineExt from "@tiptap/extension-underline"
import ImageExt from "@tiptap/extension-image"
import LinkExt from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import MentionExt from "@tiptap/extension-mention"
import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { EditorToolbar } from "./toolbar"
import { FloatingToolbar } from "./floating-toolbar"
import { buildMentionSuggestion } from "./mention-suggestion"
import type { UsuarioSugestao } from "./mention-list"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import "tippy.js/dist/tippy.css"

interface PopEditorProps {
  content?: string
  onChange?: (content: string) => void
  onMentionsChange?: (ids: string[]) => void
  placeholder?: string
  currentUserId?: string
}

function extractMentionIds(editor: ReturnType<typeof useEditor>): string[] {
  if (!editor) return []
  const ids: string[] = []
  editor.state.doc.descendants((node) => {
    if (node.type.name === "mention") ids.push(node.attrs.id as string)
  })
  return [...new Set(ids)]
}

export function PopEditor({ content, onChange, onMentionsChange, placeholder, currentUserId }: PopEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")

  // Ref mutable: sempre aponta para a lista mais recente de usuários
  const usersRef = useRef<UsuarioSugestao[]>([])

  // Ref para currentUserId — renderHTML lê em tempo de execução
  const currentUserIdRef = useRef<string | undefined>(currentUserId)

  // Suggestion criada UMA vez; o items() lê o ref em tempo de execução
  const suggestion = useMemo(() => buildMentionSuggestion(usersRef), [])

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((d: UsuarioSugestao[]) => {
        if (Array.isArray(d)) usersRef.current = d
      })
      .catch(() => {})
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExt,
      ImageExt.configure({ allowBase64: true }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Descreva o procedimento detalhadamente…",
      }),
      Highlight.configure({ multicolor: true }),
      Typography,
      MentionExt.extend({
        // NodeView: renderiza "@você" reativamente sem manipular o DOM
        // do ProseMirror diretamente (o que corrompia o mapeamento de
        // posições e quebrava a aplicação de estilos via toolbar).
        addNodeView() {
          return ({ node }) => {
            const span = document.createElement("span")
            span.className = "mention"

            const render = () => {
              const isMe = !!currentUserIdRef.current && node.attrs.id === currentUserIdRef.current
              const label = isMe ? "você" : (node.attrs.label ?? node.attrs.id)
              span.textContent = `@${label}`
              span.dataset.id = node.attrs.id
              if (isMe) span.dataset.me = "true"
              else delete span.dataset.me
            }
            render()

            return {
              dom: span,
              update: (updatedNode) => {
                if (updatedNode.type !== node.type) return false
                node = updatedNode
                render()
                return true
              },
              ignoreMutation: () => true,
            }
          }
        },
      }).configure({
        HTMLAttributes: { class: "mention" },
        suggestion,
        renderHTML({ options, node }) {
          const isMe = currentUserIdRef.current && node.attrs.id === currentUserIdRef.current
          const label = isMe ? "você" : (node.attrs.label ?? node.attrs.id)
          return [
            "span",
            {
              ...options.HTMLAttributes,
              "data-id": node.attrs.id,
              ...(isMe ? { "data-me": "true" } : {}),
            },
            `@${label}`,
          ]
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
      onMentionsChange?.(extractMentionIds(editor))
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[700px] p-4",
      },
    },
  })

  // Quando currentUserId chega (ou muda), atualiza o ref e dispara uma
  // transação vazia para que os node views das menções se re-renderizem
  // e mostrem "@você" para o usuário logado.
  useEffect(() => {
    currentUserIdRef.current = currentUserId
    if (!editor) return
    editor.view.dispatch(editor.state.tr)
  }, [currentUserId, editor])

  const insertImage = useCallback(() => {
    if (!imageUrl || !editor) return
    editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
    setImageUrl(""); setImageAlt(""); setImageDialogOpen(false)
  }, [editor, imageUrl, imageAlt])

  const insertLink = useCallback(() => {
    if (!linkUrl || !editor) return
    if (editor.state.selection.empty && linkText) {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setLinkUrl(""); setLinkText(""); setLinkDialogOpen(false)
  }, [editor, linkUrl, linkText])

  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <EditorToolbar
        editor={editor}
        onAddImage={() => setImageDialogOpen(true)}
        onAddLink={() => setLinkDialogOpen(true)}
      />
      {editor && (
        <FloatingToolbar
          editor={editor}
          onAddImage={() => setImageDialogOpen(true)}
          onAddLink={() => setLinkDialogOpen(true)}
        />
      )}
      <EditorContent editor={editor} />

      {/* Dialog Imagem */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Inserir Imagem</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>URL da imagem</Label>
              <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Texto alternativo</Label>
              <Input placeholder="Descrição da imagem" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Cancelar</Button>
            <Button onClick={insertImage} disabled={!imageUrl}>Inserir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Link */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Inserir Link</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Texto do link (opcional)</Label>
              <Input placeholder="Texto exibido" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
            <Button onClick={insertLink} disabled={!linkUrl}>Inserir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
