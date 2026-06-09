import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle2, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const stats = [
    { label: "Total de POPs", value: "0", icon: BookOpen, color: "text-blue-500" },
    { label: "Publicados", value: "0", icon: CheckCircle2, color: "text-green-500" },
    { label: "Em Revisão", value: "0", icon: Clock, color: "text-amber-500" },
    { label: "Rascunhos", value: "0", icon: FileText, color: "text-slate-500" },
  ]

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: "CSHUB Contábil", href: "/dashboard" }, { label: "Dashboard" }]}
      >
        <Link href="/pops/novo" className={cn(buttonVariants({ size: "sm" }))}>
          Novo POP
        </Link>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>POPs Recentes</CardTitle>
              <CardDescription>Últimos procedimentos criados ou atualizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">Nenhum POP criado ainda.</p>
                <Link href="/pops/novo" className={cn(buttonVariants({ variant: "link", size: "sm" }), "mt-1")}>
                  Criar primeiro POP
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Comentários e atualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Clock className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">Sem atividade recente.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
