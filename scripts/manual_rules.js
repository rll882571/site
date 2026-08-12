// ============================================================
// REGRAS DE VALIDAÇÃO ORÇAMENTÁRIA - MCASP (mcasp_rules.js)
// ============================================================

const REGRAS_VALIDACAO_MCASP = {
    "diretrizesGerais": "O auditor deve verificar se a natureza da despesa descrita pelo usuário condiz com o Elemento e o Código orçamentário selecionado conforme o MCASP 11ª Edição.",
    
    "regrasCriticas": [
        {
            "elementoIncorreto": "33390.30.00",
            "nomeElemento": "Material de Consumo",
            "condicaoErro": "Se o item descrito for um bem durável, equipamento, mobiliário, ferramenta de trabalho ou item esportivo.",
            "elementoCorreto": "4422.52.00 ou equivalente de Capital/Permanente",
            "mensagemErro": "Itens duráveis e permanentes não podem ser classificados como Material de Consumo (Elemento 30). Devem ser alocados no Elemento 52 (Material Permanente)."
        },
        {
            "elementoIncorreto": "33390.39.00",
            "nomeElemento": "Outros Serviços de Terceiros - PJ",
            "condicaoErro": "Se o item descrito for aquisição de bens físicos entregues prontos ou locação de mão de obra quantificada.",
            "elementoCorreto": "Elemento 37 (Locação de Mão-de-Obra) ou Elemento 52",
            "mensagemErro": "Serviços de terceiros PJ não devem ser usados para aquisição de bens duráveis ou postos de trabalho com quantitativo físico dedicado (que exigem Elemento 37)."
        }
    ]
};