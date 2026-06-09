import { ModuleTabs, ADMIN_TABS } from "@/components/module-tabs"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs tabs={ADMIN_TABS} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
