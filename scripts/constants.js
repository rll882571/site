// ============================================================
// CONSTANTES E DICIONÁRIOS OFICIAIS (FDID)
// ============================================================

const DESCRICOES_CODIGOS_CORRENTES = {
    "33390.04.00": "Contratação por Tempo Determinado",
    "33390.14.00": "Diárias - Pessoal Civil",
    "33390.18.00": "Auxílio-Fin. a Estudantes",
    "33390.30.00": "Material de Consumo",
    "33390.31.00": "Premiações Culturais, Artísticas, Científicas e Outras",
    "33390.32.00": "Material, Bem ou Serv. para Distribuição Gratuita",
    "33390.33.00": "Passagens e Despesas de Locomoção",
    "33390.35.00": "Serviços de Consultoria",
    "33390.36.00": "Outros Serviços de Terceiros - Pessoa Física",
    "33390.37.00": "Locação de Mão-de-Obra",
    "33390.38.00": "Arrendamento Mercantil",
    "33390.39.00": "Outros Serviços de Terceiros - Pessoa Jurídica",
    "33390.47.00": "Obrigações Tributárias e Contributivas",
    "33390.48.00": "Outros Auxílios Financeiros a Pessoas Físicas",
    "33390.49.00": "Auxílio-Transporte",
    "33390.91.00": "Sentenças Judiciais",
    "33390.93.00": "Indenizações e Restituições",
    "33390.95.00": "Indenizações de Danos"
};

const CODIGOS_DESPESAS_CORRENTES = Object.keys(DESCRICOES_CODIGOS_CORRENTES);

const DESCRICOES_CODIGOS_CAPITAL = {
    "4422.51.00": "Obras e Instalações",
    "4422.52.00": "Equipamentos e Material Permanente"
};

const CODIGOS_DESPESAS_CAPITAL = Object.keys(DESCRICOES_CODIGOS_CAPITAL);