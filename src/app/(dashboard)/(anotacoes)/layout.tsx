import { ModuleTabs, ANOTACOES_TABS } from "@/components/module-tabs"

export default function AnotacoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <ModuleTabs tabs={ANOTACOES_TABS} />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  )
}
