import { PageHeader } from "@/components/page-header"

export default function GestaoHomePage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Gestão"
        breadcrumbs={[{ label: "CSHUB", href: "/dashboard" }, { label: "Gestão" }]}
      />
      <main className="flex-1 p-6">
        <p className="text-muted-foreground">Módulos de gestão disponíveis na sidebar.</p>
      </main>
    </div>
  )
}
