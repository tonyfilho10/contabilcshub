export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    { id: string; nome: string; email: string; avatar: string | null; cargo: string; ativo: boolean; criadoEm: string }
        Insert: { id: string; nome: string; email: string; avatar?: string | null; cargo?: string; ativo?: boolean; criadoEm?: string }
        Update: { id?: string; nome?: string; email?: string; avatar?: string | null; cargo?: string; ativo?: boolean }
      }
      pops: {
        Row:    { id: string; titulo: string; descricao: string | null; conteudo: Json | null; status: string; versao: string; criadoEm: string; atualizadoEm: string; publicadoEm: string | null; autorId: string | null; mencionadosIds: string[] }
        Insert: { id: string; titulo: string; descricao?: string | null; conteudo?: Json | null; status?: string; versao?: string; criadoEm?: string; atualizadoEm?: string; publicadoEm?: string | null; autorId?: string | null; mencionadosIds?: string[] }
        Update: { titulo?: string; descricao?: string | null; conteudo?: Json | null; status?: string; versao?: string; atualizadoEm?: string; publicadoEm?: string | null; autorId?: string | null; mencionadosIds?: string[] }
      }
      tags: {
        Row:    { id: string; nome: string; cor: string; tipo: string; icone: string | null }
        Insert: { id: string; nome: string; cor?: string; tipo?: string; icone?: string | null }
        Update: { nome?: string; cor?: string; tipo?: string; icone?: string | null }
      }
      pop_tags: {
        Row:    { popId: string; tagId: string }
        Insert: { popId: string; tagId: string }
        Update: { popId?: string; tagId?: string }
      }
      comentarios: {
        Row:    { id: string; texto: string; criadoEm: string; popId: string; autorId: string | null; parentId: string | null }
        Insert: { id: string; texto: string; popId: string; autorId?: string | null; parentId?: string | null; criadoEm?: string }
        Update: { texto?: string; autorId?: string | null }
      }
      anexos: {
        Row:    { id: string; nome: string; url: string; tipo: string; tamanho: number | null; criadoEm: string; popId: string }
        Insert: { id: string; nome: string; url: string; tipo: string; tamanho?: number | null; popId: string; criadoEm?: string }
        Update: { nome?: string; url?: string }
      }
      historico_versoes: {
        Row:    { id: string; versao: string; conteudo: Json | null; descricao: string | null; criadoEm: string; autorId: string | null; popId: string }
        Insert: { id: string; versao: string; popId: string; conteudo?: Json | null; descricao?: string | null; autorId?: string | null; criadoEm?: string }
        Update: { descricao?: string | null }
      }
      pastas_anotacoes: {
        Row:    { id: string; nome: string; cor: string; icone: string | null; criadoEm: string; usuarioId: string }
        Insert: { id: string; nome: string; usuarioId: string; cor?: string; icone?: string | null; criadoEm?: string }
        Update: { nome?: string; cor?: string; icone?: string | null }
      }
      tags_anotacoes: {
        Row:    { id: string; nome: string; cor: string }
        Insert: { id: string; nome: string; cor?: string }
        Update: { nome?: string; cor?: string }
      }
      anotacoes: {
        Row:    { id: string; titulo: string; conteudo: Json | null; criadoEm: string; atualizadoEm: string; usuarioId: string; pastaId: string | null; mencionadosIds: string[] }
        Insert: { id: string; titulo: string; usuarioId: string; conteudo?: Json | null; criadoEm?: string; atualizadoEm?: string; pastaId?: string | null; mencionadosIds?: string[] }
        Update: { titulo?: string; conteudo?: Json | null; atualizadoEm?: string; pastaId?: string | null; mencionadosIds?: string[] }
      }
      anotacao_tags: {
        Row:    { anotacaoId: string; tagId: string }
        Insert: { anotacaoId: string; tagId: string }
        Update: { anotacaoId?: string; tagId?: string }
      }
    }
    Views:    Record<string, never>
    Functions: Record<string, never>
    Enums:    Record<string, never>
  }
}
