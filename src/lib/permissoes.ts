export type Cargo =
  | "AUXILIAR"
  | "ASSISTENTE"
  | "ANALISTA"
  | "COORDENADOR"
  | "CONSULTOR"
  | "AUDITOR"

export interface PermissaoSet {
  pops: {
    visualizar: boolean
    criar: boolean
    editar: boolean
    excluir: boolean
    aprovar: boolean
    publicar: boolean
  }
  anotacoes: {
    criar: boolean
    editar: boolean
    excluir: boolean
  }
  admin: {
    verUsuarios: boolean
    criarUsuario: boolean
    editarUsuario: boolean
    excluirUsuario: boolean
    gerenciarCargos: boolean
  }
}

export const PERMISSOES: Record<Cargo, PermissaoSet> = {
  AUXILIAR: {
    pops:      { visualizar: true,  criar: false, editar: false, excluir: false, aprovar: false, publicar: false },
    anotacoes: { criar: true,       editar: true, excluir: true },
    admin:     { verUsuarios: false, criarUsuario: false, editarUsuario: false, excluirUsuario: false, gerenciarCargos: false },
  },
  ASSISTENTE: {
    pops:      { visualizar: true,  criar: true,  editar: true,  excluir: false, aprovar: false, publicar: false },
    anotacoes: { criar: true,       editar: true, excluir: true },
    admin:     { verUsuarios: false, criarUsuario: false, editarUsuario: false, excluirUsuario: false, gerenciarCargos: false },
  },
  ANALISTA: {
    pops:      { visualizar: true,  criar: true,  editar: true,  excluir: true,  aprovar: false, publicar: false },
    anotacoes: { criar: true,       editar: true, excluir: true },
    admin:     { verUsuarios: true,  criarUsuario: true,  editarUsuario: true,  excluirUsuario: false, gerenciarCargos: false },
  },
  COORDENADOR: {
    pops:      { visualizar: true,  criar: true,  editar: true,  excluir: true,  aprovar: true,  publicar: true  },
    anotacoes: { criar: true,       editar: true, excluir: true },
    admin:     { verUsuarios: true,  criarUsuario: true,  editarUsuario: true,  excluirUsuario: false, gerenciarCargos: true  },
  },
  CONSULTOR: {
    pops:      { visualizar: true,  criar: true,  editar: true,  excluir: false, aprovar: true,  publicar: false },
    anotacoes: { criar: true,       editar: true, excluir: true },
    admin:     { verUsuarios: true,  criarUsuario: false, editarUsuario: false, excluirUsuario: false, gerenciarCargos: false },
  },
  AUDITOR: {
    pops:      { visualizar: true,  criar: false, editar: false, excluir: false, aprovar: false, publicar: false },
    anotacoes: { criar: true,       editar: true, excluir: true },
    admin:     { verUsuarios: true,  criarUsuario: false, editarUsuario: false, excluirUsuario: false, gerenciarCargos: false },
  },
}

export const CARGO_CONFIG: Record<Cargo, { label: string; cor: string; descricao: string }> = {
  AUXILIAR:    { label: "Auxiliar",    cor: "#94a3b8", descricao: "Visualiza POPs e cria anotações" },
  ASSISTENTE:  { label: "Assistente",  cor: "#60a5fa", descricao: "Cria e edita POPs, sem aprovação" },
  ANALISTA:    { label: "Analista",    cor: "#818cf8", descricao: "CRUD completo de POPs" },
  COORDENADOR: { label: "Coordenador", cor: "#f97316", descricao: "Aprova, publica POPs e gerencia equipe" },
  CONSULTOR:   { label: "Consultor",   cor: "#34d399", descricao: "Cria, edita e aprova POPs" },
  AUDITOR:     { label: "Auditor",     cor: "#fbbf24", descricao: "Visualiza e audita POPs e usuários" },
}

export const CARGOS_ORDENADOS: Cargo[] = [
  "AUXILIAR", "ASSISTENTE", "ANALISTA", "COORDENADOR", "CONSULTOR", "AUDITOR",
]
