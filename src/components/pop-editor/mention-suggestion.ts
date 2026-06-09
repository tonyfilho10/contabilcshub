import { ReactRenderer } from "@tiptap/react"
import tippy, { type Instance as TippyInstance } from "tippy.js"
import type { MutableRefObject } from "react"
import { MentionList, type MentionListHandle, type UsuarioSugestao } from "./mention-list"

/**
 * Recebe um ref mutável para que o items() sempre leia
 * a lista mais recente, mesmo que os usuários carreguem depois.
 */
export function buildMentionSuggestion(usersRef: MutableRefObject<UsuarioSugestao[]>) {
  return {
    char: "@",

    items: ({ query }: { query: string }) => {
      const q = query.toLowerCase()
      return usersRef.current
        .filter((u) =>
          u.nome.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        )
        .slice(0, 8)
    },

    render: () => {
      let component: ReactRenderer<MentionListHandle>
      let popup: TippyInstance[]

      return {
        onStart(props: any) {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          })

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
          if (props.event.key === "Escape") {
            popup[0]?.hide()
            return true
          }
          return component.ref?.onKeyDown(props) ?? false
        },

        onExit() {
          popup[0]?.destroy()
          component.destroy()
        },
      }
    },
  }
}
