import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const RITUAIS_SEED = [
  { nome: "Daily", frequencia: "DIARIO", duracaoMin: 15 },
  { nome: "Novas Dez", frequencia: "DIARIO", duracaoMin: 60 },
  { nome: "Reunião de Líderes", frequencia: "SEMANAL", duracaoMin: 60 },
  { nome: "Caso da Semana", frequencia: "QUINZENAL", duracaoMin: 30 },
  { nome: "Café com CEO", frequencia: "MENSAL", duracaoMin: 60 },
  { nome: "Café com Assessorias", frequencia: "MENSAL", duracaoMin: 45 },
  { nome: "Café com Processo", frequencia: "MENSAL", duracaoMin: 45 },
  { nome: "Café com Reforma Tributária", frequencia: "MENSAL", duracaoMin: 60 },
  { nome: "RMR — Revisão Mensal de Resultados", frequencia: "MENSAL", duracaoMin: 120 },
  { nome: "Revisão Estratégica", frequencia: "TRIMESTRAL", duracaoMin: 120 },
]

async function seed() {
  console.log("Seed de rituais — execute manualmente após configurar o banco.")
  console.log("Rituais a inserir:", RITUAIS_SEED.length)
  // Para rodar: npx tsx prisma/seed-rituais.ts
  // Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
}

seed()
