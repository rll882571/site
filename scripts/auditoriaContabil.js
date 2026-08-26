// ============================================================
// MÓDULO DE AUDITORIA CONTÁBIL E ELEMENTO DE DESPESA (FDID)
// ============================================================

// Tabela Oficial de Referência Contábil para o Prompt da IA
const TABELA_REFERENCIA_CONTABIL = [
    { codigo: "33390.04.00", nome: "Contratação por tempo determinado", tipo: "Corrente", desc: "Salário de pessoal temporário contratado por tempo determinado (ex: educadores, assistentes sociais por prazo fixo)." },
    { codigo: "33390.30.00", nome: "Material de consumo", tipo: "Corrente", desc: "Bens gastáveis e de consumo rápido (durabilidade < 2 anos): papelaria, combustível, lanches de expediente, itens de limpeza." },
    { codigo: "33390.32.00", nome: "Material para distribuição gratuita", tipo: "Corrente", desc: "Bens comprados para DOAÇÃO direta aos beneficiários: cestas básicas, kits escolares, fardamentos, kits de higiene." },
    { codigo: "33390.33.00", nome: "Passagens e despesas com locomoção", tipo: "Corrente", desc: "Bilhetes de transporte aéreo/rodoviário ou vale/reembolso de transporte para deslocamentos da equipe ou beneficiários." },
    { codigo: "33390.35.00", nome: "Serviços de consultoria", tipo: "Corrente", desc: "Serviços técnicos especializados prestados por peritos ou pareceristas altamente qualificados." },
    { codigo: "33390.36.00", nome: "Outros serviços de terceiros – Pessoa Física", tipo: "Corrente", desc: "Serviço pontual prestado por autônomo (CPF) via RPA (ex: palestrantes, eletricistas, pareceristas individuais)." },
    { codigo: "33390.39.00", nome: "Outros serviços de terceiros – Pessoa Jurídica", tipo: "Corrente", desc: "Serviços prestados por empresas (CNPJ): gráficas, locação de ônibus/espaços, internet, energia, refeições prontas/buffet." },
    { codigo: "33390.47.00", nome: "Obrigações tributárias e contributivas", tipo: "Corrente", desc: "Taxas, impostos, IPTU, taxas cartorárias ou licenças governamentais." },
    { codigo: "33390.48.00", nome: "Outros auxílios financeiros a pessoa física", tipo: "Corrente", desc: "Repasse direto de ajuda de custo financeira/assistencial para pessoas em vulnerabilidade social." },
    { codigo: "33390.49.00", nome: "Auxílio-transporte", tipo: "Corrente", desc: "Vale-transporte pago na folha aos funcionários contratados do projeto." },
    { codigo: "4422.52.00", nome: "Equipamentos e material permanente", tipo: "Capital", desc: "Bens móveis duráveis (durabilidade > 2 anos) incorporados ao patrimônio: computadores, ar-condicionado, móveis, veículos." }
];

/**
 * Monta o Prompt direcionado especificamente para a auditoria de Enquadramento Contábil
 */
export function gerarPromptAuditoriaContabil(dadosDespesas) {
    return `
Você é um auditor contábil sênior especializado em Orçamento Público e Legislação do FDID.
Sua missão é verificar se cada despesa do Tópico 5 foi enquadrada no CÓDIGO CONTÁBIL (Elemento de Despesa) correto.

--- TABELA DE REFERÊNCIA OFICIAL DOS CÓDIGOS ---
${JSON.stringify(TABELA_REFERENCIA_CONTABIL, null, 2)}

--- DESPESAS CADASTRADAS NO PLANO DE TRABALHO ---
${JSON.stringify(dadosDespesas, null, 2)}

--- INSTRUÇÕES DE ANÁLISE CONTÁBIL ---

1. VERIFICAÇÃO DE ENQUADRAMENTO:
   - Compare o 'codigo' informado pelo usuário com a 'especificacao' (descrição) e a 'unidade' da despesa.
   - Identifique se o código escolhido condiz com a natureza real do gasto.
   
2. ERROS COMUNS DE CLASSIFICAÇÃO PARA ALERTAR:
   - Alimentos/Refeições comprados de empresa (buffet/restaurante) devem ser '33390.39.00' (Pessoa Jurídica), e NÃO '33390.30.00' (Material de Consumo), a menos que sejam gêneros alimentícios crus para cozinhar.
   - Kits escolares, cestas básicas ou fardamentos comprados para DOAR aos beneficiários devem ser '33390.32.00' (Distribuição Gratuita), e NÃO '33390.30.00'.
   - Pagamentos a palestrantes ou instrutores em CPF devem ser '33390.36.00' (Pessoa Física). Se for empresa (CNPJ), deve ser '33390.39.00'.
   - Compra de bens permanentes (ex: computador, ar-condicionado, impressora) cadastrados como Despesa Corrente (33390) devem ser corrigidos para Despesa de Capital '4422.52.00'.

3. AVISO ORIENTATIVO (SE TIVER CERTEZA, IGNORE):
   - Redija o alerta no tom orientativo e respeitoso.
   - Escreva pareceres no formato: 
     "Item '[Nome do Item]': O código informado foi [Código Atual] ([Nome do Código Atual]), porém, pelo fato de se tratar de [explicação do gasto], o código mais adequado costuma ser o [Código Sugerido] ([Nome do Código Sugerido]). Caso a instituição tenha certeza da natureza da despesa e da dotação aprovada, este aviso pode ser desconsiderado."

--- FORMATO DE RESPOSTA OBRIGATÓRIO (JSON PURO) ---
{
  "possuiInconformidades": true ou false,
  "resumoGeral": "Texto resumindo se os códigos contábeis estão adequados ou se há sugestões de reclassificação.",
  "alertasContabeis": [
    "Texto orientativo do item 1...",
    "Texto orientativo do item 2..."
  ]
}
`;
}

/**
 * Função para extrair apenas as despesas do Tópico 5 com códigos preenchidos
 */
export function extrairDespesasParaAuditoriaContabil() {
    const despesas = [];
    const linhas = document.querySelectorAll('#tabela-despesas-unica tbody tr');

    linhas.forEach(linha => {
        const codigo = linha.querySelector('.input-codigo-despesa')?.value.trim() || '';
        const especificacao = linha.querySelector('.editable')?.innerText.trim() || '';
        const unidade = linha.children[2]?.querySelector('input')?.value.trim() || '';
        const quantidade = linha.children[3]?.querySelector('input')?.value.trim() || '';

        if (codigo || especificacao) {
            despesas.push({ codigo, especificacao, unidade, quantidade });
        }
    });

    return despesas;
}