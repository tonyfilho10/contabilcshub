export type RubricaGrupo = "FOLHA_NORMAL" | "FERIAS" | "RESCISAO" | "EMPRESA"

export const GRUPO_OPTIONS: { value: RubricaGrupo; label: string }[] = [
  { value: "FOLHA_NORMAL", label: "Folha Normal" },
  { value: "FERIAS", label: "Férias" },
  { value: "RESCISAO", label: "Rescisão" },
  { value: "EMPRESA", label: "Empresa" },
]

export const GRUPO_LABEL: Record<RubricaGrupo, string> = Object.fromEntries(
  GRUPO_OPTIONS.map((g) => [g.value, g.label])
) as Record<RubricaGrupo, string>
