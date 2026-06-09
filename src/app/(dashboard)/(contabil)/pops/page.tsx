import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function POPsPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="POPs"
        breadcrumbs={[
          { label: "CSHUB Contábil", href: "/dashboard" },
          { label: "POPs" },
        ]}
      >
        <Link href="/pops/novo" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Novo POP
        </Link>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-3 opacity-25" />
            <p className="text-base font-medium">Nenhum POP criado ainda</p>
            <p className="text-sm mt-1">Comece criando o primeiro procedimento operacional padrão.</p>
            <Link href="/pops/novo" className={cn(buttonVariants(), "mt-4")}>
              <Plus className="h-4 w-4 mr-1" />Criar POP
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
