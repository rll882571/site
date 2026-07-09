// ============================================================
// 1. MOTOR DE EVENTOS (Monitora digitação e salvamento)
// ============================================================

document.addEventListener('input', function (event) {
    const target = event.target;

    // A. AJUSTE DE ALTURA (Para textareas)
    if (target.classList.contains('auto-grow')) {
        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
    }

    // B. TABELA DE DETALHAMENTO DAS DESPESAS
    const tabelaDespesas = target.closest("#tabela-despesas-unica");

    if (tabelaDespesas && target.tagName === 'INPUT' && !target.readOnly) {
        const colIndex = target.parentElement.cellIndex;

        // Colunas financeiras (Ajustado para os novos índices das colunas 4, 5 e 6)
        if (colIndex >= 4) {
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

// Escuta mudanças em Checkboxes ou elementos contenteditable
document.addEventListener('change', salvarFormularioAuto);
document.addEventListener('blur', function(event) {
    if (event.target.classList.contains('editable')) {
        salvarFormularioAuto();
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

        // Índices corrigidos após a remoção da coluna fantasma[cite: 1]
        const totalInput = row.cells[4]?.querySelector("input");
        const concedInput = row.cells[5]?.querySelector("input");
        const proponInput = row.cells[6]?.querySelector("input");

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

    // Totais Correntes
    document.getElementById('total-corrente-geral').value = formatMoney(corr.t);
    document.getElementById('total-corrente-conced').value = formatMoney(corr.c);
    document.getElementById('total-corrente-propon').value = formatMoney(corr.p);

    // Totais Capital
    document.getElementById('total-capital-geral').value = formatMoney(cap.t);
    document.getElementById('total-capital-conced').value = formatMoney(cap.c);
    document.getElementById('total-capital-propon').value = formatMoney(cap.p);

    // Total Geral
    document.getElementById('total-projeto-geral').value = formatMoney(corr.t + cap.t);
    document.getElementById('total-projeto-conced').value = formatMoney(corr.c + cap.c);
    document.getElementById('total-projeto-propon').value = formatMoney(corr.p + cap.p);
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

    // Ajustado para conter exatamente as 7 colunas de inputs do cabeçalho[cite: 1]
    newRow.innerHTML = `
        <td><input type="text" placeholder="00000.00.0"></td>
        <td><textarea class="auto-grow" rows="1" placeholder="Especificação"></textarea></td>
        <td><input type="text" placeholder="UN"></td>
        <td><input type="number" placeholder="0"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td><input type="text" placeholder="0,00"></td>
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