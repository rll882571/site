// ============================================================
// 1. MOTOR DE EVENTOS (Monitora digitação e salvamento)
// ============================================================


// VIGILANTE A: Monitora quando você DIGITA algo (input)
document.addEventListener('input', function (event) {
    const target = event.target;

    // A. AJUSTE DE ALTURA (Para textareas)
    if (target.classList.contains('auto-grow')) {
        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
    }

    // B. TABELA DE DETALHAMENTO DAS DESPESAS (Com máscara de código e dinheiro)
    const tabelaDespesas = target.closest("#tabela-despesas-unica");
    if (tabelaDespesas && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.readOnly) {
        
        const colIndex = target.parentElement.cellIndex;

        // SE FOR A PRIMEIRA COLUNA (CÓDIGO), APLICA A MÁSCARA AUTOMÁTICA
        if (colIndex === 0) {
            maskCodigo(target);
        }

        // Verifica se o usuário está digitando em um dos campos de dinheiro
        if (target.classList.contains('campo-total') || 
            target.classList.contains('campo-concedente') || 
            target.classList.contains('campo-proponente')) {
            
            maskMoney(target);
            calcularTotaisUnificados();
        }
    }

    // C. RESUMO DO ORÇAMENTO
    if (target.classList.contains('money-input-budget')) {
        maskMoney(target);

        const vConcedente = parseMoney(document.getElementById('resumo-concedente')?.value);
        const vProponente = parseMoney(document.getElementById('resumo-proponente')?.value);

        const somaTotal = vConcedente + vProponente;

        const campoTotalResumo = document.getElementById('resumo-total-projeto');
        if (campoTotalResumo) {
            campoTotalResumo.value = formatMoney(somaTotal);
        }
    }

    // DISPARADOR DE SALVAMENTO AUTOMÁTICO
    salvarFormularioAuto();

}, false);


// VIGILANTE B: Monitora quando você SAI de um campo (blur)
document.addEventListener('blur', function (event) {
    const target = event.target;
    
    // Verifica se o campo pertence à tabela de despesas e é a primeira coluna (Código)
    const tabelaDespesas = target.closest("#tabela-despesas-unica");
    if (tabelaDespesas && target.tagName === 'INPUT' && !target.readOnly) {
        const colIndex = target.parentElement.cellIndex;
        
        // Se saiu do campo de Código (índice 0), faz a validação do Pop-up
        if (colIndex === 0) {
            validarCodigoDespesa(target);
        }
    }
}, true);


// ============================================================
// 2. FUNÇÕES DE FORMATAÇÃO
// ============================================================

function maskMoney(input) {
    let value = input.value.replace(/\D/g, "");

    if (value === "") {
        input.value = "0,00";
        return;
    }

    value = (value / 100).toFixed(2);
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    input.value = value;
}

function parseMoney(text) {
    if (!text) return 0;

    let cleanValue = text
        .replace(/\./g, '')
        .replace(',', '.');

    return parseFloat(cleanValue) || 0;
}

function formatMoney(value) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// ============================================================
// 3. CÁLCULO DOS TOTAIS (Ajustado com os índices corretos)
// ============================================================



function calcularTotaisUnificados() {
    let corr = { t: 0, c: 0, p: 0 };
    let cap = { t: 0, c: 0, p: 0 };

    const rows = document.querySelectorAll("#tabela-despesas-unica tbody tr");

    rows.forEach(row => {
        const tipo = row.getAttribute("data-tipo");

        const totalInput = row.querySelector(".campo-total");
        const concedInput = row.querySelector(".campo-concedente");
        const proponInput = row.querySelector(".campo-proponente");

        const total = parseMoney(totalInput?.value);
        const conced = parseMoney(concedInput?.value);
        const propon = parseMoney(proponInput?.value);

        if (tipo === "corrente") {
            corr.t += total;
            corr.c += conced;
            corr.p += propon;
        }

        if (tipo === "capital") {
            cap.t += total;
            cap.c += conced;
            cap.p += propon;
        }
    });

    // Atualiza Totais Correntes apenas se os elementos existirem no HTML
    const elCorrGeral = document.getElementById('total-corrente-geral');
    const elCorrConced = document.getElementById('total-corrente-conced');
    const elCorrPropon = document.getElementById('total-corrente-propon');
    if (elCorrGeral) elCorrGeral.value = formatMoney(corr.t);
    if (elCorrConced) elCorrConced.value = formatMoney(corr.c);
    if (elCorrPropon) elCorrPropon.value = formatMoney(corr.p);

    // Atualiza Totais Capital apenas se os elementos existirem no HTML
    const elCapGeral = document.getElementById('total-capital-geral');
    const elCapConced = document.getElementById('total-capital-conced');
    const elCapPropon = document.getElementById('total-capital-propon');
    if (elCapGeral) elCapGeral.value = formatMoney(cap.t);
    if (elCapConced) elCapConced.value = formatMoney(cap.c);
    if (elCapPropon) elCapPropon.value = formatMoney(cap.p);

    // Atualiza Total Geral do Projeto apenas se os elementos existirem no HTML
    const elProjGeral = document.getElementById('total-projeto-geral');
    const elProjConced = document.getElementById('total-projeto-conced');
    const elProjPropon = document.getElementById('total-projeto-propon');
    if (elProjGeral) elProjGeral.value = formatMoney(corr.t + cap.t);
    if (elProjConced) elProjConced.value = formatMoney(corr.c + cap.c);
    if (elProjPropon) elProjPropon.value = formatMoney(corr.p + cap.p);
}


// ============================================================
// 4. ADICIONAR LINHAS (CRONOGRAMA)
// ============================================================

function addRow() {
    const table = document.getElementById("cronograma-table").getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td><div class="editable" contenteditable="true"></div></td>
        <td><div class="editable" contenteditable="true"></div></td>
        <td><div class="editable" contenteditable="true"></div></td>
        <td><input type="text"></td>
        <td><input type="number"></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td class="no-print">
            <button type="button" class="btn-remove" onclick="removeRow(this)">×</button>
        </td>
    `;
    salvarFormularioAuto();
}


// ============================================================
// 5. ADICIONAR LINHAS DE DESPESAS (Ajustado - Sem coluna fantasma)
// ============================================================

function addLinhaUnica(tipo) {
    const tableBody = document.querySelector("#tabela-despesas-unica tbody");
    const newRow = tableBody.insertRow();

    newRow.setAttribute("data-tipo", tipo);

    if (tipo === 'corrente') {
        newRow.classList.add('linha-corrente');
    }

    if (tipo === 'capital') {
        newRow.classList.add('linha-capital');
    }

    newRow.innerHTML = `
        <td><input type="text" placeholder="00000.00.0"></td>
        <td><textarea class="auto-grow" rows="1" placeholder="Especificação"></textarea></td>
        <td><input type="text" placeholder="UN"></td>
        <td><input type="number" placeholder="0"></td>
        <td><input type="text" placeholder="0,00" class="campo-total"></td>
        <td><input type="text" placeholder="0,00" class="campo-concedente"></td>
        <td><input type="text" placeholder="0,00" class="campo-proponente"></td>
        <td class="no-print">
            <button type="button" class="btn-remove" onclick="removeRow(this)">×</button>
        </td>
    `;

    calcularTotaisUnificados();
    salvarFormularioAuto();
}


// ============================================================
// 6. REMOVER LINHAS
// ============================================================

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.remove();
    calcularTotaisUnificados();
    salvarFormularioAuto();
}


// ============================================================
// 7. MOTOR DE PERSISTÊNCIA (Ajustado para a nova estrutura)
// ============================================================

function capturarDadosEstruturados() {
    const backup = {
        camposEstaticos: {},
        cronograma: [],
        despesas: []
    };

    // 1. Mapear inputs e textareas fixos com IDs
    document.querySelectorAll("input, textarea").forEach((campo) => {
        if (campo.id) {
            if (campo.type === "checkbox") {
                backup.camposEstaticos[campo.id] = campo.checked;
            } else {
                backup.camposEstaticos[campo.id] = campo.value;
            }
        }
    });

    // Mapear inputs estruturados sem ID por ordem de aparição
    let totalInputsFixos = [];
    document.querySelectorAll("section:not(.dynamic-table):not(#tabela-despesas-unica) input, section:not(.dynamic-table):not(#tabela-despesas-unica) textarea").forEach((el, index) => {
         if(!el.closest('table')) {
             totalInputsFixos.push({index: index, value: el.type === 'checkbox' ? el.checked : el.value, type: el.type});
         }
    });
    backup.inputsFixosEstruturados = totalInputsFixos;

    // 2. Mapear linhas dinâmicas do Cronograma
    document.querySelectorAll("#cronograma-table tbody tr").forEach(row => {
        const divEditables = row.querySelectorAll(".editable");
        const inputs = row.querySelectorAll("input");
        if(divEditables.length >= 3) {
            backup.cronograma.push({
                meta: divEditables[0].innerHTML,
                etapa: divEditables[1].innerHTML,
                descricao: divEditables[2].innerHTML,
                unidade: inputs[0]?.value || "",
                qtd: inputs[1]?.value || "",
                inicio: inputs[2]?.value || "",
                termino: inputs[3]?.value || ""
            });
        }
    });

    // 3. Mapear linhas dinâmicas de Despesas (Ajustado para 7 inputs de dados)[cite: 1]
    document.querySelectorAll("#tabela-despesas-unica tbody tr").forEach(row => {
        const tipo = row.getAttribute("data-tipo");
        const inputs = row.querySelectorAll("input, textarea");
        if (inputs.length >= 7) {
            backup.despesas.push({
                tipo: tipo,
                codigo: inputs[0].value,
                especificacao: inputs[1].value,
                unidade: inputs[2].value,
                quantidade: inputs[3].value,
                total: inputs[4].value,
                concedente: inputs[5].value,
                proponente: inputs[6].value
            });
        }
    });

    return backup;
}

function aplicarDadosEstruturados(dados) {
    if (!dados) return;

    // Limpar tabelas dinâmicas atuais
    document.querySelector("#cronograma-table tbody").innerHTML = "";
    document.querySelector("#tabela-despesas-unica tbody").innerHTML = "";

    // Restaurar Cronograma
    if (dados.cronograma && Array.isArray(dados.cronograma)) {
        dados.cronograma.forEach(item => {
            addRow();
            const rows = document.querySelectorAll("#cronograma-table tbody tr");
            const lastRow = rows[rows.length - 1];
            if (lastRow) {
                const editables = lastRow.querySelectorAll(".editable");
                const inputs = lastRow.querySelectorAll("input");
                if (editables[0]) editables[0].innerHTML = item.meta;
                if (editables[1]) editables[1].innerHTML = item.etapa;
                if (editables[2]) editables[2].innerHTML = item.descricao;
                if (inputs[0]) inputs[0].value = item.unidade;
                if (inputs[1]) inputs[1].value = item.qtd;
                if (inputs[2]) inputs[2].value = item.inicio;
                if (inputs[3]) inputs[3].value = item.termino;
            }
        });
    }

    // Restaurar Despesas (Ajustado para as 7 colunas corretas)[cite: 1]
    if (dados.despesas && Array.isArray(dados.despesas)) {
        dados.despesas.forEach(item => {
            addLinhaUnica(item.tipo);
            const rows = document.querySelectorAll("#tabela-despesas-unica tbody tr");
            const lastRow = rows[rows.length - 1];
            if (lastRow) {
                const inputs = lastRow.querySelectorAll("input, textarea");
                if (inputs[0]) inputs[0].value = item.codigo;
                if (inputs[1]) inputs[1].value = item.especificacao;
                if (inputs[2]) inputs[2].value = item.unidade;
                if (inputs[3]) inputs[3].value = item.quantidade;
                if (inputs[4]) inputs[4].value = item.total;
                if (inputs[5]) inputs[5].value = item.concedente;
                if (inputs[6]) inputs[6].value = item.proponente;
            }
        });
    }

    // Restaurar demais campos fixos estruturados
    if (dados.inputsFixosEstruturados && Array.isArray(dados.inputsFixosEstruturados)) {
        const fixosAtuais = [];
        document.querySelectorAll("section:not(.dynamic-table):not(#tabela-despesas-unica) input, section:not(.dynamic-table):not(#tabela-despesas-unica) textarea").forEach(el => {
            if(!el.closest('table')) fixosAtuais.push(el);
        });

        dados.inputsFixosEstruturados.forEach(item => {
            const el = fixosAtuais[item.index];
            if (el) {
                if (item.type === "checkbox") {
                    el.checked = item.value;
                } else {
                    el.value = item.value;
                }
            }
        });
    }

    // Atualiza cálculos e redimensionamento de campos de texto
    calcularTotaisUnificados();
    document.querySelectorAll('.auto-grow').forEach(textarea => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    });
}

function salvarFormularioAuto() {
    const dados = capturarDadosEstruturados();
    localStorage.setItem("PlanoFDID_v2", JSON.stringify(dados));
}

function carregarFormularioAuto() {
    const localData = localStorage.getItem("PlanoFDID_v2");
    if (localData) {
        try {
            const dados = JSON.parse(localData);
            aplicarDadosEstruturados(dados);
        } catch (e) {
            console.error("Erro ao carregar dados automáticos.", e);
        }
    }
}


// ============================================================
// 8. CONTROLES ADICIONAIS (Backup externo e Novo Plano)
// ============================================================

function exportarBackup() {
    const dados = capturarDadosEstruturados();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Plano_de_Trabalho_FDID.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarBackup(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            aplicarDadosEstruturados(dados);
            salvarFormularioAuto();
            alert("Backup carregado com sucesso!");
        } catch (err) {
            alert("Erro ao processar arquivo de backup. Verifique se o arquivo JSON é válido.");
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function novoPlano() {
    if (confirm("Atenção: Deseja apagar todo o plano de trabalho atual? Dados não salvos externamente serão perdidos definitivamente.")) {
        localStorage.removeItem("PlanoFDID_v2");
        window.location.reload();
    }
}

// Inicialização imediata assim que a estrutura do documento estiver pronta
window.addEventListener("DOMContentLoaded", carregarFormularioAuto);

function validarCodigoDespesa(input) {
    // Lista de códigos autorizados
    const codigosValidos = [
        "33390.04.00", "33390.14.00", "33390.18.00", "33390.30.00", 
        "33390.31.00", "33390.32.00", "33390.33.00", "33390.35.00", 
        "33390.36.00", "33390.37.00", "33390.38.00", "33390.39.00", 
        "33390.47.00", "33390.48.00", "33390.49.00", "33390.91.00", 
        "33390.93.00", "33390.95.00", "4422.51.00", "4422.52.00"
    ];

    const valorDigitado = input.value.trim();

    // Se estiver vazio, não faz nada
    if (valorDigitado === "") {
        input.style.color = ""; // Volta a cor padrão do texto
        return true;
    }

    // Se o código for válido
    if (codigosValidos.includes(valorDigitado)) {
        input.style.color = "#28a745"; // Texto fica verde (opcional, indica sucesso)
        return true;
    } else {
        // Se o código for inválido
        input.style.color = "#dc3545"; // Deixa os NÚMEROS vermelhos
        
        // Abre o pop-up de aviso na tela
        alert("Código fora do padrão!");
        
        return false;
    }
}
function maskCodigo(input) {
    // Remove tudo o que não for número
    let value = input.value.replace(/\D/g, "");
    
    // Se começar com 3 (padrão 33390.00.00)
    if (value.startsWith("3")) {
        if (value.length > 5 && value.length <= 7) {
            value = value.replace(/^(\d{5})(\d+)/, "$1.$2");
        } else if (value.length > 7) {
            value = value.replace(/^(\d{5})(\d{2})(\d+)/, "$1.$2.$3");
        }
    } 
    // Se começar com 4 (padrão 4422.51.00)
    else if (value.startsWith("4")) {
        if (value.length > 4 && value.length <= 6) {
            value = value.replace(/^(\d{4})(\d+)/, "$1.$2");
        } else if (value.length > 6) {
            value = value.replace(/^(\d{4})(\d{2})(\d+)/, "$1.$2.$3");
        }
    }

    // Limita o tamanho máximo de caracteres para não passar do padrão
    input.value = value.slice(0, 11);
}
function verificarAntesDeImprimir() {
    // 1. Pega os textos dos dois campos de totais
    const textoTotalResumo = document.getElementById('resumo-total-projeto')?.value || "0,00";
    const textoTotalDetalhamento = document.getElementById('total-projeto-geral')?.value || "0,00";

    // 2. Converte os textos para números decimais para podermos comparar matematicamente
    const valorResumo = parseMoney(textoTotalResumo);
    const valorDetalhamento = parseMoney(textoTotalDetalhamento);

    // 3. Se os valores forem diferentes, exibe o pop-up de confirmação
    if (valorResumo !== valorDetalhamento) {
        const mensagem = 
            "⚠️ Atenção: Os valores totais do projeto não coincidem!\n\n" +
            "• Valor no Resumo (Tópico 3): R$ " + textoTotalResumo + "\n" +
            "• Valor no Detalhamento (Tópico 5): R$ " + textoTotalDetalhamento + "\n\n" +
            "Deseja gerar o PDF mesmo assim?";
        
        // Se o usuário clicar em "Cancelar", a função para aqui e não imprime
        if (!confirm(mensagem)) {
            return; 
        }
    }

    // 4. Se os valores forem iguais OU se o usuário clicou em "OK" no aviso, abre a tela de impressão
    window.print();
}