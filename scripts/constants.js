// ============================================================
// CONSTANTES E DICIONÁRIOS OFICIAIS (FDID)
// ============================================================

const DESCRICOES_CODIGOS_CORRENTES = {
    "33390.04.00": "Contratação por Tempo Determinado",
    "33390.30.00": "Material de Consumo",
    "33390.32.00": "Material, Bem ou Serv. para Distribuição Gratuita",
    "33390.33.00": "Passagens e Despesas de Locomoção",
    "33390.35.00": "Serviços de Consultoria",
    "33390.36.00": "Outros Serviços de Terceiros - Pessoa Física",
    "33390.39.00": "Outros Serviços de Terceiros - Pessoa Jurídica",
    "33390.47.00": "Obrigações Tributárias e Contributivas",
    "33390.48.00": "Outros Auxílios Financeiros a Pessoas Físicas",
    "33390.49.00": "Auxílio-Transporte",
};

const CODIGOS_DESPESAS_CORRENTES = Object.keys(DESCRICOES_CODIGOS_CORRENTES);

const DESCRICOES_CODIGOS_CAPITAL = {
    "4422.52.00": "Equipamentos e Material Permanente"
};

const CODIGOS_DESPESAS_CAPITAL = Object.keys(DESCRICOES_CODIGOS_CAPITAL);