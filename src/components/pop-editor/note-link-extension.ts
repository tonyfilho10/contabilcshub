import { Node, mergeAttributes } from "@tiptap/core"
import { ReactRenderer } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import tippy, { type Instance as TippyInstance } from "tippy.js"
import { NoteLinkList, type NoteLinkListHandle, type NoteLinkItem } from "./note-link-list"

async function buscarReferencias(query: string): Promise<NoteLinkItem[]> {
  const res = await fetch(`/api/referencias?q=${encodeURIComponent(query)}&limit=8`)
  if (!res.ok) return []
  return res.json()
}

export const NoteLinkExtension = Node.create({
  name: "noteLink",
  group: "inline",
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      id:     { default: null },
      titulo: { default: "" },
      tipo:   { default: "nota" },
    }
  },

  parseHTML() {
    return [{ tag: "a[data-note-link]" }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-note-link": "",
        "data-id": node.attrs.id,
        "data-tipo": node.attrs.tipo,
        href: node.attrs.tipo === "pop"
          ? `/pops/${node.attrs.id}`
          : `/anotacoes/${node.attrs.id}`,
        class: "note-link",
      }),
      node.attrs.titulo,
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const a = document.createElement("a")
      a.dataset.noteLink = ""
      a.dataset.id = node.attrs.id
      a.dataset.tipo = node.attrs.tipo
      a.href = node.attrs.tipo === "pop"
        ? `/pops/${node.attrs.id}`
        : `/anotacoes/${node.attrs.id}`
      a.className = "note-link"
      a.textContent = node.attrs.titulo
      a.addEventListener("click", (e) => {
        e.preventDefault()
        window.location.href = a.href
      })
      return { dom: a, ignoreMutation: () => true }
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "[[",
        allowSpaces: true,

        items: async ({ query }: { query: string }) => {
          const resultados = await buscarReferencias(query)
          const criarItem: NoteLinkItem = {
            id: "__criar__",
            titulo: query.trim() ? `Criar nota: "${query.trim()}"` : "Criar nova nota…",
            tipo: "criar",
          }
          return [criarItem, ...resultados]
        },

        command: ({ editor, range, props }: { editor: any; range: any; props: NoteLinkItem }) => {
          const afterRange = { from: range.from, to: range.to }
          if (props.tipo === "criar") {
            const titulo = props.titulo.replace(/^Criar nota: "|"$/g, "").replace(/^Criar nova nota…$/, "Nova nota")
            fetch("/api/anotacoes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ titulo }),
            })
              .then((r) => r.json())
              .then((nota) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(afterRange)
                  .insertContent({
                    type: "noteLink",
                    attrs: { id: nota.id, titulo: nota.titulo, tipo: "nota" },
                  })
                  .run()
              })
            return
          }
          editor
            .chain()
            .focus()
            .deleteRange(afterRange)
            .insertContent({
              type: "noteLink",
              attrs: { id: props.id, titulo: props.titulo, tipo: props.tipo },
            })
            .run()
        },

        render: () => {
          let component: ReactRenderer<NoteLinkListHandle>
          let popup: TippyInstance[]

          return {
            onStart(props: any) {
              component = new ReactRenderer(NoteLinkList, { props, editor: props.editor })
              if (!props.clientRect) return
              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })
            },
            onUpdate(props: any) {
              component.updateProps(props)
              if (!props.clientRect) return
              popup[0]?.setProps({ getReferenceClientRect: props.clientRect })
            },
            onKeyDown(props: any) {
              if (props.event.key === "Escape") { popup[0]?.hide(); return true }
              return component.ref?.onKeyDown(props) ?? false
            },
            onExit() {
              popup[0]?.destroy()
              component.destroy()
            },
          }
        },
      }),
    ]
  },
})
