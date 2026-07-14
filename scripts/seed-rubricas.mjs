// Seed inicial de rubrica_mapeamentos a partir de "Configuração da Integração
// FOLHA.docx". Extração best-effort (o docx original tem layout em duas
// colunas que embaralha alguns trechos) — cobre só os blocos inequívocos.
// Linhas marcadas com origem "IMPORTADO" devem ser revisadas pelo analista
// na aba Cadastradas.
//
// Uso: node --env-file=.env scripts/seed-rubricas.mjs

import pg from "pg"

/** @typedef {{ codigo: string, descricao: string, grupo: "FOLHA_NORMAL"|"FERIAS"|"RESCISAO"|"EMPRESA", lancamento: string, contaDebito: string|null, contaCredito: string|null, historico: string|null }} Rubrica */

/** @type {Rubrica[]} */
const RUBRICAS = [
  // ── FOLHA NORMAL ──────────────────────────────────────────
  ...["1|HORAS NORMAIS", "5|HORAS AFAST.INSS (P/DOENC", "19|DIFERENCA DE SALARIOS", "990|ESTOURO DO MES", "8294|PARCELA DIFERENCA DE SALARIOS", "8697|HORAS AFAST. P/DOENCA C/DIR.INTEGRAIS", "9524|HORAS AFAST. P/DOENCA IGUAL/INF 15 DIAS"]
    .map((s) => item(s, "FOLHA_NORMAL", "SALÁRIOS", "331 - SALÁRIOS E ORDENADOS", "187 - SALÁRIOS E ORDENADOS A PAGAR", "77 - Vlr. dos Salarios a Pagar Conf.Folha")),
  item("991|ESTOURO MES ANTERIOR", "FOLHA_NORMAL", "ESTOURO DO MES ANTERIOR", null, null, "Vlr. do Estouro do Mês Conf. Folha"),
  item("50|ADIANTAMENTO 13 SALARIO", "FOLHA_NORMAL", "ADIANTAMENTO DE 13º", "817 - 13º A PAGAR", "26 - ADIANTAMENTO DE 13º SALÁRIO", "104 - Valor do Adiantamento de Salario Conf. Folha"),
  ...["8205|DESCONTO DIFERENCA MEDIA HORA 13o", "8206|DESCONTO DIFERENCA MEDIA VALOR 13o"]
    .map((s) => item(s, "FOLHA_NORMAL", "DESCONTO DIFERENÇA 13º", null, null, "Vlr. Desconto Diferença 13º Salário Conf. Folha")),
  item("8134|DESCONTO DIFERENÇA 13º", "FOLHA_NORMAL", "DESCONTO DIFERENÇA 13º", null, null, "Vlr. Desconto Diferença 13º Salário Conf. Folha"),
  item("100|PRO-LABORE", "FOLHA_NORMAL", "PRO-LABORE", "332 - PRÓ-LABORE", "188 - PRÓ-LABORE A PAGAR", "61 - Vlr. do Pro-Labore a pagar"),
  item("8909|SERVICOS AUTONOMO", "FOLHA_NORMAL", "FUNCIONARIOS AUTONOMOS", "150 - SERVIÇOS PRESTADOS POR TERCEIROS", "332 - FUNCIONARIOS AUTONOMOS", "113 - Vlr. de Serviços Tomados Ref. Comp."),
  item("843|INSS EMPREGADOR", "FOLHA_NORMAL", "DESCONTO INSS PRO-LABORE", "188 - PRÓ-LABORE A PAGAR", "191 - INSS A RECOLHER", "51 - Desconto de INSS Conf. folha de Pagamento"),
  item("857|IRRF AUTONOMO", "FOLHA_NORMAL", "IRRF S/ HONORARIOS", "189 - HONORÁRIOS A PAGAR", "178 - IRRF A RECOLHER", "148 - Desconto de IRRF Conf. folha de Pagamento"),
  item("858|INSS AUTONOMO", "FOLHA_NORMAL", "INSS AUTONOMO", "189 - HONORÁRIOS A PAGAR", "191 - INSS A RECOLHER", "51 - Desconto de INSS Conf. folha de Pagamento"),
  item("856|IRRF EMPREGADOR", "FOLHA_NORMAL", "IRRF PRO-LABORE", "188 - PRÓ-LABORE A PAGAR", "178 - IRRF A RECOLHER", "148 - Desconto de IRRF Conf. folha de Pagamento"),
  ...["150|HORAS EXTRAS", "200|HORAS EXTRAS 100%"]
    .map((s) => item(s, "FOLHA_NORMAL", "HORAS EXTRAS", "819 - HORAS EXTRAS", "187 - SALÁRIOS E ORDENADOS A PAGAR", "85 - Vlr. das Horas Extras a pagar Conf. Folha")),
  item("2|HORAS NOTURNAS", "FOLHA_NORMAL", "ADICIONAL NOTURNO", "820 - ADICIONAL NOTURNO", "187 - SALÁRIOS E ORDENADOS A PAGAR", "149 - Vlr. dos Adicional Noturno a Pagar Conf.Folha"),
  ...["8181|DIFERENCA MEDIA HORA 13o", "8182|DIFERENCA MEDIA VALOR 13o"]
    .map((s) => item(s, "FOLHA_NORMAL", "DIFERENÇA 13º", null, null, "Vlr. Diferença 13º Salário a Pagar Conf. Folha")),
  ...["8189|DIFERENCA MEDIA HORA FERIAS", "8190|DIFERENCA MEDIA VALOR FERIAS"]
    .map((s) => item(s, "FOLHA_NORMAL", "DIFERENÇA FÉRIAS", null, null, "Vlr. Diferença Férias a Pagar Conf. Folha")),
  ...["12|13 SALARIO INTEGRAL", "800|MEDIA HORAS 13o", "801|MEDIA VALOR 13o", "833|MEDIA HORAS 13o ADIANTADO", "834|MEDIA VALOR 13o ADIANTADO"]
    .map((s) => item(s, "FOLHA_NORMAL", "13º SALARIO", "195 - PROVISÕES PARA 13º SALÁRIO", "817 - 13º A PAGAR", "78 - Vlr. do 13º a Pagar Conf. Folha")),
  ...["20|GRATIFICACOES", "37|COMISSOES"]
    .map((s) => item(s, "FOLHA_NORMAL", "GRATIFICAÇÃO", "822 - GRATIFICAÇÃO", "187 - SALÁRIOS E ORDENADOS A PAGAR", "151 - Vlr. da Gratificação a Pagar Conf.Folha")),
  item("149|PERICULOSIDADE", "FOLHA_NORMAL", "PERICULOSIDADE", "823 - PERICULOSIDADE", "187 - SALÁRIOS E ORDENADOS A PAGAR", "153 - Vlr. da Periculosidade a Pagar Conf.Folha"),
  ...["10|HORAS REPOUSO REMUNERADO", "250|REFLEXO EXTRAS DSR"]
    .map((s) => item(s, "FOLHA_NORMAL", "REPOUSO SEMANAL REMUNERADO", "795 - REPOUSO SEMANAL REMUNERADO", "187 - SALÁRIOS E ORDENADOS A PAGAR", "155 - Vlr. do DSR a Pagar Conf.Folha")),
  item("9755|ESTORNO DESC PROV EMPRESTIMO TRAB ADIANT", "FOLHA_NORMAL", "ESTORNO EMPR. CRED. TRAB. (ADIANTAMENTO)", null, null, "Vlr. Estorno Empr. Cred. do Trab. Conf. Folha"),
  item("9750|DESC. EMP. CRED. TRAB Nº #CONTRATO", "FOLHA_NORMAL", "DESCONTO DO EMPRÉSTIMO DO TRABALHADOR", null, null, "Vlr. Desc. Empr. Trabalh. Conf. FOLHA"),
  item("996|F.G.T.S DO MES", "FOLHA_NORMAL", "FGTS", null, "192 - FGTS A RECOLHER", "71 - Vlr. do FGTS N/Mes"),
  ...["40|HORAS FALTAS", "8069|HORAS FALTAS PARCIAL"]
    .map((s) => item(s, "FOLHA_NORMAL", "DESCONTO DE HORAS FALTAS", "187 - SALÁRIOS E ORDENADOS A PAGAR", "331 - SALÁRIOS E ORDENADOS", "34 - Desconto Conforme Folha de Pagamento")),
  ...["4|SALARIO MATERNIDADE", "894|MEDIA LIC. MATERNIDADE"]
    .map((s) => item(s, "FOLHA_NORMAL", "SALARIO MATERNIDADE", "191 - INSS A RECOLHER", "187 - SALÁRIOS E ORDENADOS A PAGAR", "102 - Vlr. do Salario Maternidade a Pagar Conf. Folha")),
  item("48|VALE TRANSPORTE", "FOLHA_NORMAL", "VALE TRANSPORTE", "492 - VALE TRANSPORTE", "331 - SALÁRIO E ORDENADOS", "34 - Desconto Conforme Folha de Pagamento"),
  item("204|SERVIÇOS PRESTADOS", "FOLHA_NORMAL", "HONORARIOS CONTABEIS", "361 - ASSISTÊNCIA CONTÁBIL", "189 - HONORÁRIOS A PAGAR", "101 - Vlr. dos Honorarios Contabeis a Pagar"),
  item("994|CONTRIBUICAO SINDICAL", "FOLHA_NORMAL", "CONTRIBUIÇÕES SINDICAIS", "187 - SALÁRIOS E ORDENADOS A PAGAR", "491 - CONTRIBUIÇÃO SINDICAL A RECOLHER", "156 - Desconto da Contribuição Sindical Conf. Folha"),
  item("825|INSS 13o SALARIO", "FOLHA_NORMAL", "INSS S/ 13º", "817 - 13º A PAGAR", "191 - INSS A RECOLHER", "51 - Desconto de INSS Conf. folha de Pagamento"),
  item("804|IRRF 13o", "FOLHA_NORMAL", "IRRF S/ 13º", "817 - 13º A PAGAR", "178 - IRRF A RECOLHER", "34 - Desconto Conforme Folha de Pagamento"),
  item("987|DESCONTO SAL MATERNIDADE", "FOLHA_NORMAL", "DESCONTO SALARIO MATERNIDADE", "187 - SALÁRIOS E ORDENADOS A PAGAR", "191 - INSS A RECOLHER", "34 - Desconto Conforme Folha de Pagamento"),
  ...["940|DIFERENCA DE FERIAS", "8112|DIFERENCA DE 1/3 DE FERIAS"]
    .map((s) => item(s, "FOLHA_NORMAL", "DIFERENÇA DE FÉRIAS", "335 - FÉRIAS", "187 - SALÁRIOS E ORDENADOS A PAGAR", "52 - Vlr. das Ferias a Pagar conf. Folha de Pagamento")),

  // ── FÉRIAS ────────────────────────────────────────────────
  ...["3|HORAS FERIAS", "805|MEDIA VALOR FERIAS", "806|MEDIA HORAS FERIAS"]
    .map((s) => item(s, "FERIAS", "FÉRIAS", "194 - PROVISÕES PARA FÉRIAS", "818 - FÉRIAS A PAGAR", "157 - Vlr. das Ferias a Pagar conf. Recibo")),
  item("931|1/3 DAS FERIAS", "FERIAS", "1/3 DE FÉRIAS", "194 - PROVISÕES PARA FÉRIAS", "818 - FÉRIAS A PAGAR", "157 - Vlr. das Ferias a Pagar conf. Recibo"),
  item("812|INSS FERIAS", "FERIAS", "INSS FÉRIAS", "818 - FÉRIAS A PAGAR", "191 - INSS A RECOLHER", "51 - Desconto de INSS Conf. folha de Pagamento"),
  item("813|FGTS FERIAS", "FERIAS", "FGTS S/ FÉRIAS", "198 - FGTS SOBRE PROVISÕES PARA FÉRIAS", "192 - FGTS A RECOLHER", "71 - Vlr. do FGTS N/Mes"),
  item("937|ADIANTAMENTO DE FERIAS", "FERIAS", "DESCONTO ADIANTAMENTO FÉRIAS", "818 - FÉRIAS A PAGAR", "825 - ADIANTAMENTO DE FÉRIAS", "72 - Vlr. do Adiantamento de Ferias N/Mes"),
  item("9754|ESTORNO DESC PROV EMPRESTIMO TRAB FERIAS", "FERIAS", "ESTORNO EMPR. CRED. TRAB. (FÉRIAS)", null, null, "Vlr. Estorno Empr. Cred. do Trab. Conf. Folha"),

  // ── RESCISÃO ──────────────────────────────────────────────
  ...["28|FERIAS VENCIDAS", "29|FERIAS PROPORCIONAIS"]
    .map((s) => item(s, "RESCISAO", "FÉRIAS RESCISÃO", "194 - PROVISÕES PARA FÉRIAS", "816 - RESCISÃO A PAGAR", "76 - Vlr. das Ferias Proporcionais conf. TRCT")),
  ...["64|1/3 FERIAS RESCISAO", "8169|1/3 FERIAS PROPORCIONAIS RESCISAO"]
    .map((s) => item(s, "RESCISAO", "1/3 FÉRIAS RESCISÃO", "194 - PROVISÕES PARA FÉRIAS", "816 - RESCISÃO A PAGAR", "76 - Vlr. das Ferias Proporcionais conf. TRCT")),
  ...["8550|13 SALARIO INTEGRAL RESCISAO", "8551|MEDIA HORAS 13o RESCISAO", "8552|MEDIA VALOR 13o RESCISAO"]
    .map((s) => item(s, "RESCISAO", "13º RESCISÃO", "195 - PROVISÕES PARA 13º SALÁRIO", "816 - RESCISÃO A PAGAR", null)),
  item("49|AVISO PREVIO REAVIDO", "RESCISAO", "AVISO PREVIO REAVIDO", "816 - RESCISÃO A PAGAR", "338 - INDENIZAÇÕES E AVISO PRÉVIO", "13 - Desconto Conforme Termo Rescisao de Contato de Trab"),
  item("22|AVISO PREVIO", "RESCISAO", "AVISO PRÉVIO", "338 - INDENIZAÇÕES E AVISO PRÉVIO", "816 - RESCISÃO A PAGAR", "79 - Vlr. do Aviso Previo a Pagar conf. TRCT"),
  ...["811|FERIAS 1/12 INDENIZADO", "8126|1/3 FERIAS INDENIZADAS RESC", "8156|MEDIA VALOR FERIAS 1/12 INDENIZADO", "8157|MEDIA HORAS FERIAS 1/12 INDENIZADO"]
    .map((s) => item(s, "RESCISAO", "FÉRIAS RESCISÃO INDENIZADA", "335 - FÉRIAS (DESPESA)", "816 - RESCISÃO A PAGAR (PC)", "52 - Vlr. das Ferias a Pagar conf. Folha de Pagamento")),
  item("9637|F.G.T.S DE AVISO PRÉVIO", "RESCISAO", "FGTS S/ AVISO PREVIO", "335 - FGTS (DESPESA)", "816 - FGTS A RECOLHER (PC)", null),
  item("803|13o 1/12 INDENIZADO", "RESCISAO", "13º RESCISÃO INDENIZADA", "334 - 13º SALÁRIO", "816 - RESCISÃO A PAGAR", "159 - Vlr. do 13º a Pagar Conf. TRCT"),
  item("9391|DESCONTO DIFERENCA 13o RESCISAO", "RESCISAO", "DESC. DIF. 13º RESCISÃO", "816 - RESCISÃO A PAGAR", "195 - PROVISÕES PARA 13º SALÁRIO", "13 - Desconto Conforme Termo Rescisao de Contato de Trab"),
  ...["23|F.G.T.S DE RESCISAO", "32|F.G.T.S 40%"]
    .map((s) => item(s, "RESCISAO", "FGTS", "337 - FGTS", "192 - FGTS A RECOLHER", "71 - Vlr. do FGTS N/Mes")),
  ...["826|INSS SOBRE RESCISAO", "989|INSS 13 SAL.RESCISAO"]
    .map((s) => item(s, "RESCISAO", "DESCONTO INSS", "816 - RESCISÃO A PAGAR", "191 - INSS A RECOLHER", "51 - Desconto de INSS Conf. folha de Pagamento")),
  ...["9180|SALDO DE SALARIO DIAS", "9179|SALDO DE SALARIO HORAS"]
    .map((s) => item(s, "RESCISAO", "SALDO DE SALÁRIO", "331 - SALÁRIOS E ORDENADOS (DESPESA)", "816 - RESCISÃO A PAGAR (PC)", "77 - Vlr. dos Salarios a Pagar Conf.Folha")),
  item("843|INSS EMPREGADOR", "RESCISAO", "INSS EMPREGADOR", "816 - RESCISÃO A PAGAR", "191 - INSS A RECOLHER", "51 - Desconto de INSS Conf. folha de Pagamento"),
  item("995|SALARIO FAMILIA", "RESCISAO", "SALÁRIO FAMÍLIA RESCISÃO", "191 - INSS A RECOLHER", "816 - RESCISÃO A PAGAR", "50 - Vlr. do Salario Familia Conf. Folha de Pagamento"),
  item("981|DESC.ADIANT.SALARIAL", "RESCISAO", "DESCONTO ADIANTAMENTO S/ RESCISÃO", "816 - RESCISÃO A PAGAR", "25 - ADIANTAMENTO DE SALÁRIO", "Desconto de Adiantamento s/ Rescisão n/Mês"),
  item("836|INSS DIF FER DESC A MAIOR", "RESCISAO", "INSS DESC. A MAIOR /// RESCISÃO", "331 - TRIBUTOS FEDERAIS A RECOLHER", "816 - RESCISÃO A PAGAR", "73 - Vlr. do INSS N/Mes"),

  // ── EMPRESA ───────────────────────────────────────────────
  ...["16|INSS Empresa CCT", "39|INSS Empresa Mensal Dirigente sindical"]
    .map((s) => item(s, "EMPRESA", "INSS EMPRESA", "336 - INSS", "191 - INSS A RECOLHER", "73 - Vlr. do INSS N/Mes")),
  ...["17|INSS Terceiros CCT", "40|INSS Terceiros Mensal Dirigente sindical"]
    .map((s) => item(s, "EMPRESA", "INSS TERCEIROS", "336 - INSS", "191 - INSS A RECOLHER", "73 - Vlr. do INSS N/Mes")),
  ...["18|INSS Acid. Trabalho CCT", "21|INSS Acid. Trabalho 13º CCT", "41|INSS Acid. Trabalho Mensal Dirigente sindical"]
    .map((s) => item(s, "EMPRESA", "INSS RAT", "336 - INSS", "191 - INSS A RECOLHER", "73 - Vlr. do INSS N/Mes")),
  ...["9|INSS Pro-Lab/Aut. 13o.", "48|INSS Aut."]
    .map((s) => item(s, "EMPRESA", "INSS PRO-LABORE", "336 - INSS", "191 - INSS A RECOLHER", "73 - Vlr. do INSS N/Mes")),
  item("15|Dedução 13o. lic. maternidade", "EMPRESA", "SALARIO MATERNIDADE", "191 - INSS A RECOLHER", "336 - INSS", "102 - Vlr. do Salario Maternidade a Pagar Conf. Folha"),
  ...["22|INSS Empresa 13º Indenizado", "23|INSS Terceiros 13º Indenizado", "24|INSS Acid. Trabalho 13º Indenizado"]
    .map((s) => item(s, "EMPRESA", "INSS S/13º", "197 - INSS SOBRE PROVISÕES PARA 13º SALÁRIO", "191 - INSS A RECOLHER", "73 - Vlr. do INSS N/Mes")),
  ...["42|INSS Empresa Férias Dirigente sindical", "43|INSS Terceiros Férias Dirigente sindical", "44|INSS Acid. Trabalho Férias Dirigente sindical"]
    .map((s) => item(s, "EMPRESA", "INSS S/ FÉRIAS", "196 - INSS SOBRE PROVISÕES PARA FÉRIAS", "191 - INSS A RECOLHER", "73 - Vlr. do INSS N/Mes")),
]

function item(codigoDescricao, grupo, lancamento, contaDebito, contaCredito, historico) {
  const [codigo, descricao] = codigoDescricao.split("|")
  return { codigo, descricao, grupo, lancamento, contaDebito, contaCredito, historico }
}

async function main() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error("DATABASE_URL não definida (use: node --env-file=.env scripts/seed-rubricas.mjs)")
  const u = new URL(raw)

  const client = new pg.Client({
    host: u.hostname,
    port: Number(u.port) || 5432,
    database: u.pathname.replace(/^\//, ""),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  let inseridos = 0
  for (const r of RUBRICAS) {
    const res = await client.query(
      `INSERT INTO rubrica_mapeamentos
         (id, codigo, descricao, grupo, lancamento, "contaDebito", "contaCredito", historico, origem, "atualizadoEm")
       VALUES (gen_random_uuid()::text, $1, $2, $3::"RubricaGrupo", $4, $5, $6, $7, 'IMPORTADO', now())
       ON CONFLICT (codigo, grupo) DO NOTHING`,
      [r.codigo, r.descricao, r.grupo, r.lancamento, r.contaDebito, r.contaCredito, r.historico]
    )
    inseridos += res.rowCount
  }

  console.log(`Seed concluído: ${inseridos} de ${RUBRICAS.length} linhas inseridas (demais já existiam).`)
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
