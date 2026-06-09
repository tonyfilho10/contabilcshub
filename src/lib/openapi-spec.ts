export const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "CSHUB Contábil — API",
    version: "1.0.0",
    description:
      "API interna do Módulo Contábil. Todos os endpoints retornam JSON.",
  },
  servers: [{ url: "/api", description: "Servidor local" }],
  tags: [
    { name: "POPs",         description: "Procedimentos Operacionais Padrão" },
    { name: "Anotações",    description: "Notas pessoais dos usuários" },
    { name: "Usuários",     description: "Administração de usuários e cargos" },
    { name: "Pastas",       description: "Pastas de anotações" },
  ],
  paths: {
    // ── POPs ────────────────────────────────────────────────
    "/pops": {
      get: {
        tags: ["POPs"],
        summary: "Listar POPs",
        description: "Retorna todos os POPs ordenados por data de atualização.",
        responses: {
          "200": { description: "Lista de POPs", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Pop" } } } } },
        },
      },
      post: {
        tags: ["POPs"],
        summary: "Criar POP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PopInput" },
              example: { titulo: "Conciliação Bancária Mensal", descricao: "Reconciliar extratos", status: "RASCUNHO", versao: "1.0" },
            },
          },
        },
        responses: {
          "201": { description: "POP criado" },
          "400": { description: "Título obrigatório" },
        },
      },
    },
    "/pops/{id}": {
      get: {
        tags: ["POPs"],
        summary: "Buscar POP por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "POP encontrado" },
          "404": { description: "Não encontrado" },
        },
      },
      patch: {
        tags: ["POPs"],
        summary: "Atualizar POP",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PopInput" },
            },
          },
        },
        responses: {
          "200": { description: "POP atualizado" },
          "404": { description: "Não encontrado" },
        },
      },
      delete: {
        tags: ["POPs"],
        summary: "Excluir POP",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Excluído com sucesso" },
          "404": { description: "Não encontrado" },
        },
      },
    },

    // ── Anotações ───────────────────────────────────────────
    "/anotacoes": {
      get: {
        tags: ["Anotações"],
        summary: "Listar anotações",
        parameters: [
          { name: "usuarioId", in: "query", schema: { type: "string" }, description: "Filtrar por usuário" },
          { name: "busca",     in: "query", schema: { type: "string" }, description: "Texto livre" },
          { name: "pastaId",   in: "query", schema: { type: "string" }, description: "Filtrar por pasta" },
        ],
        responses: { "200": { description: "Lista de anotações" } },
      },
      post: {
        tags: ["Anotações"],
        summary: "Criar anotação",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AnotacaoInput" },
              example: { titulo: "Reunião com cliente", usuarioId: "abc123", mencionadosIds: [] },
            },
          },
        },
        responses: { "201": { description: "Anotação criada" }, "400": { description: "Campos obrigatórios faltando" } },
      },
    },
    "/anotacoes/{id}": {
      get: {
        tags: ["Anotações"],
        summary: "Buscar anotação por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Anotação encontrada" }, "404": { description: "Não encontrada" } },
      },
      patch: {
        tags: ["Anotações"],
        summary: "Atualizar anotação",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/AnotacaoInput" } } } },
        responses: { "200": { description: "Atualizada" }, "404": { description: "Não encontrada" } },
      },
      delete: {
        tags: ["Anotações"],
        summary: "Excluir anotação",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Excluída" }, "404": { description: "Não encontrada" } },
      },
    },
    "/anotacoes/pastas": {
      get: {
        tags: ["Pastas"],
        summary: "Listar pastas",
        parameters: [{ name: "usuarioId", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Lista de pastas" } },
      },
      post: {
        tags: ["Pastas"],
        summary: "Criar pasta",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { nome: { type: "string" }, cor: { type: "string" }, usuarioId: { type: "string" } }, required: ["nome", "usuarioId"] } } },
        },
        responses: { "201": { description: "Pasta criada" } },
      },
    },

    // ── Usuários ─────────────────────────────────────────────
    "/admin/usuarios": {
      get: {
        tags: ["Usuários"],
        summary: "Listar usuários",
        parameters: [
          { name: "busca", in: "query", schema: { type: "string" }, description: "Nome ou e-mail" },
          { name: "cargo", in: "query", schema: { $ref: "#/components/schemas/Cargo" } },
        ],
        responses: { "200": { description: "Lista de usuários" } },
      },
      post: {
        tags: ["Usuários"],
        summary: "Criar usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioInput" },
              example: { id: "uuid-do-supabase", nome: "Ana Silva", email: "ana@empresa.com", cargo: "ANALISTA", ativo: true },
            },
          },
        },
        responses: { "201": { description: "Usuário criado" }, "409": { description: "E-mail já cadastrado" }, "503": { description: "Banco offline ou tabelas não criadas" } },
      },
    },
    "/admin/usuarios/{id}": {
      patch: {
        tags: ["Usuários"],
        summary: "Editar usuário",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/UsuarioInput" } } } },
        responses: { "200": { description: "Atualizado" }, "404": { description: "Não encontrado" } },
      },
      delete: {
        tags: ["Usuários"],
        summary: "Excluir usuário",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Excluído" }, "404": { description: "Não encontrado" } },
      },
    },
    "/perfil/{id}": {
      get: {
        tags: ["Usuários"],
        summary: "Buscar perfil por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Perfil encontrado" }, "404": { description: "Não encontrado" } },
      },
    },
  },

  components: {
    schemas: {
      Cargo: {
        type: "string",
        enum: ["AUXILIAR", "ASSISTENTE", "ANALISTA", "COORDENADOR", "CONSULTOR", "AUDITOR"],
        description: "Nível de acesso do usuário",
      },
      PopStatus: {
        type: "string",
        enum: ["RASCUNHO", "EM_REVISAO", "APROVADO", "PUBLICADO", "ARQUIVADO"],
      },
      Pop: {
        type: "object",
        properties: {
          id:             { type: "string" },
          titulo:         { type: "string" },
          descricao:      { type: "string", nullable: true },
          status:         { $ref: "#/components/schemas/PopStatus" },
          versao:         { type: "string" },
          mencionadosIds: { type: "array", items: { type: "string" } },
          criadoEm:       { type: "string", format: "date-time" },
          atualizadoEm:   { type: "string", format: "date-time" },
        },
      },
      PopInput: {
        type: "object",
        properties: {
          titulo:         { type: "string" },
          descricao:      { type: "string" },
          conteudo:       { type: "object", description: "TipTap JSON" },
          status:         { $ref: "#/components/schemas/PopStatus" },
          versao:         { type: "string" },
          mencionadosIds: { type: "array", items: { type: "string" } },
          tagIds:         { type: "array", items: { type: "string" } },
        },
        required: ["titulo"],
      },
      AnotacaoInput: {
        type: "object",
        properties: {
          titulo:         { type: "string" },
          conteudo:       { type: "object" },
          usuarioId:      { type: "string" },
          pastaId:        { type: "string", nullable: true },
          mencionadosIds: { type: "array", items: { type: "string" } },
          tagIds:         { type: "array", items: { type: "string" } },
        },
        required: ["titulo", "usuarioId"],
      },
      UsuarioInput: {
        type: "object",
        properties: {
          id:     { type: "string", description: "ID do Supabase Auth" },
          nome:   { type: "string" },
          email:  { type: "string", format: "email" },
          cargo:  { $ref: "#/components/schemas/Cargo" },
          ativo:  { type: "boolean" },
          avatar: { type: "string", nullable: true },
        },
        required: ["id", "nome", "email"],
      },
    },
  },
} as const
