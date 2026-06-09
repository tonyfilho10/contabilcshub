"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import UnderlineExt from "@tiptap/extension-underline"
import ImageExt from "@tiptap/extension-image"
import LinkExt from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import { useState, useCallback } from "react"
import { EditorToolbar } from "./toolbar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface PopEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export function PopEditor({ content, onChange, placeholder }: PopEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      UnderlineExt,
      ImageExt.configure({ allowBase64: true }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline cursor-pointer" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Descreva o procedimento detalhadamente…" }),
      Highlight,
      Typography,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  })

  const insertImage = useCallback(() => {
    if (!imageUrl || !editor) return
    editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
    setImageUrl("")
    setImageAlt("")
    setImageDialogOpen(false)
  }, [editor, imageUrl, imageAlt])

  const insertLink = useCallback(() => {
    if (!linkUrl || !editor) return
    if (editor.state.selection.empty && linkText) {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setLinkUrl("")
    setLinkText("")
    setLinkDialogOpen(false)
  }, [editor, linkUrl, linkText])

  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <EditorToolbar
        editor={editor}
        onAddImage={() => setImageDialogOpen(true)}
        onAddLink={() => setLinkDialogOpen(true)}
      />
      <EditorContent editor={editor} />

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Imagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>URL da imagem</Label>
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Texto alternativo</Label>
              <Input
                placeholder="Descrição da imagem"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Cancelar</Button>
            <Button onClick={insertImage} disabled={!imageUrl}>Inserir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Texto do link (opcional)</Label>
              <Input
                placeholder="Texto exibido"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
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
