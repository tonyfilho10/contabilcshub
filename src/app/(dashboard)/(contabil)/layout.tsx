import { ModuleTabs, CONTABIL_TABS } from "@/components/module-tabs"

export default function ContabilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <ModuleTabs tabs={CONTABIL_TABS} />
      <div className="flex flex-col flex-1">
        {children}
      </div>
    </div>
  )
}
