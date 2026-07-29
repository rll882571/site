// ============================================================
// 1. MOTOR DE EVENTOS
// ============================================================
document.addEventListener('input', function (event) {
    const target = event.target;

    // A. MÁSCARA CNPJ
    if (target.classList.contains('cnpj-input')) {
        maskCNPJ(target);
    }

    // B. AUTO-GROW DE TEXTAREAS NA DIGITAÇÃO
    if (target.tagName === 'TEXTAREA' && (target.classList.contains('auto-grow') || target.classList.contains('textarea-projeto'))) {
        ajustarAlturaTextarea(target);
    }

    // C. MÁSCARA DE MOEDA
    if (target.classList.contains('bold-text') && target.closest('.currency-input')) {
        maskMoney(target);
    }

    // D. RESTRIÇÃO NÚMEROS INTEIROS
    if (
        target.classList.contains('width-day') ||
        target.classList.contains('width-year') ||
        target.classList.contains('width-ddd') ||
        target.classList.contains('width-phone')
    ) {
        target.value = target.value.replace(/\D/g, '');
    }

    // E. SOMAS DE PÚBLICO E IDADES
    if (target.classList.contains('soma-publico')) {
        target.value = target.value.replace(/\D/g, '');
        calcularTotalPublico();
    }

    if (target.classList.contains('soma-idade')) {
        target.value = target.value.replace(/\D/g, '');
        calcularIdades();
    }

    // SALVAMENTO AUTOMÁTICO AO DIGITAR
    salvarFormularioAuto();
}, false);

// MONITOR DE ALTERAÇÕES EM SELECTS (DROPDOWNS)
document.addEventListener('change', function (event) {
    if (event.target.tagName === 'SELECT') {
        salvarFormularioAuto();
    }
});


// ============================================================
// 2. FUNÇÕES DE AJUSTE DE ALTURA PARA IMPRESSÃO
// ============================================================

function ajustarAlturaTextarea(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 8) + 'px'; 
}

function prepararParaImprimir() {
    document.querySelectorAll('textarea.auto-grow, textarea.textarea-projeto').forEach(function (textarea) {
        ajustarAlturaTextarea(textarea);
    });
}

window.addEventListener('beforeprint', prepararParaImprimir);


// ============================================================
// 3. MÁSCARAS E CÁLCULOS
// ============================================================

function maskCNPJ(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 14) value = value.slice(0, 14);

    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");

    input.value = value;
}

function maskMoney(input) {
    let value = input.value.replace(/\D/g, "");
    if (value === "") {
        input.value = "0,00";
        return;
    }
    value = (parseInt(value, 10) / 100).toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    input.value = value;
}

function calcularTotalPublico() {
    let total = 0;
    document.querySelectorAll('.soma-publico').forEach(input => {
        total += parseInt(input.value, 10) || 0;
    });
    const el = document.getElementById('total-publico');
    if (el) el.innerText = total;
}

function calcularIdades() {
    const somarGrupo = (classe) => {
        let soma = 0;
        document.querySelectorAll(classe).forEach(i => soma += (parseInt(i.value, 10) || 0));
        return soma;
    };

    const tFem = somarGrupo('.idade-fem');
    const tMasc = somarGrupo('.idade-masc');
    const tLgbt = somarGrupo('.idade-lgbt');
    const tNi = somarGrupo('.idade-ni');

    if (document.getElementById('total-fem')) document.getElementById('total-fem').innerText = tFem;
    if (document.getElementById('total-masc')) document.getElementById('total-masc').innerText = tMasc;
    if (document.getElementById('total-lgbt')) document.getElementById('total-lgbt').innerText = tLgbt;
    if (document.getElementById('total-ni')) document.getElementById('total-ni').innerText = tNi;

    const sub1 = tFem + tMasc;
    const sub2 = tLgbt + tNi;

    if (document.getElementById('subtotal-1')) document.getElementById('subtotal-1').innerText = sub1;
    if (document.getElementById('subtotal-2')) document.getElementById('subtotal-2').innerText = sub2;
    if (document.getElementById('total-geral-idades')) document.getElementById('total-geral-idades').innerText = sub1 + sub2;
}


// ============================================================
// 4. MOTOR DE PERSISTÊNCIA (BACKUP JSON E LOCALSTORAGE)
// ============================================================

function capturarDadosEstruturados() {
    const backup = {
        inputsFixos: [],
        selectsFixos: [],
        textareasFixas: []
    };

    document.querySelectorAll("body input[type='text'], body input[type='number'], body input[type='email']").forEach((el, index) => {
        backup.inputsFixos.push({ index: index, value: el.value });
    });

    document.querySelectorAll("body select").forEach((el, index) => {
        backup.selectsFixos.push({ index: index, value: el.value });
    });

    document.querySelectorAll("body textarea").forEach((el, index) => {
        backup.textareasFixas.push({ index: index, value: el.value });
    });

    return backup;
}

function aplicarDadosEstruturados(dados) {
    if (!dados) return;

    if (dados.inputsFixos && Array.isArray(dados.inputsFixos)) {
        const inputsAtuais = document.querySelectorAll("body input[type='text'], body input[type='number'], body input[type='email']");
        dados.inputsFixos.forEach(item => {
            if (inputsAtuais[item.index]) {
                inputsAtuais[item.index].value = item.value;
            }
        });
    }

    if (dados.selectsFixos && Array.isArray(dados.selectsFixos)) {
        const selectsAtuais = document.querySelectorAll("body select");
        dados.selectsFixos.forEach(item => {
            if (selectsAtuais[item.index]) {
                selectsAtuais[item.index].value = item.value;
            }
        });
    }

    if (dados.textareasFixas && Array.isArray(dados.textareasFixas)) {
        const textareasAtuais = document.querySelectorAll("body textarea");
        dados.textareasFixas.forEach(item => {
            if (textareasAtuais[item.index]) {
                textareasAtuais[item.index].value = item.value;
            }
        });
    }

    calcularTotalPublico();
    calcularIdades();
    prepararParaImprimir();
}

function salvarFormularioAuto() {
    const dados = capturarDadosEstruturados();
    localStorage.setItem("AnexoTresFDID_v1", JSON.stringify(dados));
}

function carregarFormularioAuto() {
    const localData = localStorage.getItem("AnexoTresFDID_v1");
    if (localData) {
        try {
            const dados = JSON.parse(localData);
            aplicarDadosEstruturados(dados);
        } catch (e) {
            console.error("Erro ao carregar dados salvos.", e);
        }
    }
}


// ============================================================
// 5. AÇÕES DOS BOTÕES (EXPORTAR, IMPORTAR E RESET)
// ============================================================

function exportarBackup() {
    const dados = capturarDadosEstruturados();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Backup_Anexo_3_FDID.json");
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
            alert("Backup do Anexo 3 carregado com sucesso!");
        } catch (err) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function novoPlano() {
    if (confirm("Atenção: Deseja limpar todas as informações preenchidas neste formulário?")) {
        localStorage.removeItem("AnexoTresFDID_v1");
        window.location.reload();
    }
}

window.addEventListener("DOMContentLoaded", function () {
    prepararParaImprimir();
    carregarFormularioAuto();
});
// ============================================================
// FUNÇÕES DO QUADRO LÓGICO (ITEM 24)
// ============================================================

function adicionarLinhaQuadroLogico(dadosValores = null) {
    const tbody = document.querySelector('#tabela-quadro-logico tbody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><textarea class="auto-grow" rows="2" placeholder="Lógica de intervenção..."></textarea></td>
        <td><textarea class="auto-grow" rows="2" placeholder="Indicadores..."></textarea></td>
        <td><textarea class="auto-grow" rows="2" placeholder="Meios de verificação..."></textarea></td>
        <td><textarea class="auto-grow" rows="2" placeholder="Prazo/frequência..."></textarea></td>
        <td><textarea class="auto-grow" rows="2" placeholder="Responsável..."></textarea></td>
        <td class="no-print text-center"><button type="button" class="btn-remove-row" onclick="removerLinhaQuadroLogico(this)">❌</button></td>
    `;

    tbody.appendChild(tr);

    // Aplica os valores se vierem do backup ou restauração
    if (dadosValores && Array.isArray(dadosValores)) {
        const textareas = tr.querySelectorAll('textarea');
        dadosValores.forEach((val, idx) => {
            if (textareas[idx]) textareas[idx].value = val;
        });
    }

    // Recalcula alturas e vincula o autosave
    tr.querySelectorAll('textarea').forEach(ajustarAlturaTextarea);
    salvarFormularioAuto();
}

function removerLinhaQuadroLogico(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.parentElement;
    
    // Mantém pelo menos uma linha visível
    if (tbody.querySelectorAll('tr').length > 1) {
        tr.remove();
        salvarFormularioAuto();
    } else {
        alert("O quadro lógico deve conter pelo menos uma linha.");
    }
}
// ============================================================
// FUNÇÕES DO CRONOGRAMA DE ATIVIDADES (ITEM 25)
// ============================================================

function adicionarLinhaCronograma(dadosLinha = null) {
    const tbody = document.querySelector('#tabela-cronograma tbody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    
    let tdsMeses = '';
    for (let i = 1; i <= 12; i++) {
        tdsMeses += `<td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>`;
    }

    tr.innerHTML = `
        <td><textarea class="auto-grow" rows="2" placeholder="Descreva a atividade..."></textarea></td>
        ${tdsMeses}
        <td class="no-print text-center"><button type="button" class="btn-remove-row" onclick="removerLinhaCronograma(this)">❌</button></td>
    `;

    tbody.appendChild(tr);

    // Se houver dados (backup / localStorage)
    if (dadosLinha) {
        if (dadosLinha.atividade) {
            const ta = tr.querySelector('textarea');
            if (ta) ta.value = dadosLinha.atividade;
        }
        if (dadosLinha.meses && Array.isArray(dadosLinha.meses)) {
            const inputs = tr.querySelectorAll('.input-mes');
            dadosLinha.meses.forEach((val, idx) => {
                if (inputs[idx]) inputs[idx].value = val;
            });
        }
    }

    tr.querySelectorAll('textarea').forEach(ajustarAlturaTextarea);
    salvarFormularioAuto();
}

function removerLinhaCronograma(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.parentElement;
    
    if (tbody.querySelectorAll('tr').length > 1) {
        tr.remove();
        salvarFormularioAuto();
    } else {
        alert("O cronograma deve conter pelo menos uma linha.");
    }
}
function extrairDadosParaValidacaoIA() {
    const dadosTópico4 = [];
    const dadosTópico5 = [];

    // --- A. Extração do Tópico 4.1 (Cronograma de Execução) ---
    const linhasTabela4 = document.querySelectorAll('#cronograma-table tbody tr');
    
    linhasTabela4.forEach(linha => {
        const celulas = linha.children;
        
        // Pega a div editable ou input correspondente em cada coluna
        const descricao = celulas[2]?.querySelector('.editable')?.innerText.trim() || '';
        const unidade = celulas[3]?.querySelector('input')?.value.trim() || '';
        const quantidade = celulas[4]?.querySelector('input')?.value.trim() || '';

        // Só adiciona se houver descrição preenchida
        if (descricao) {
            dadosTópico4.push({
                descricao: descricao,
                unidade: unidade,
                quantidade: quantidade
            });
        }
    });

    // --- B. Extração do Tópico 5 (Detalhamento das Despesas) ---
    const linhasTabela5 = document.querySelectorAll('#tabela-despesas-unica tbody tr');

    linhasTabela5.forEach(linha => {
        const celulas = linha.children;

        // Tópico 5: Coluna 1 = Especificação (div.editable), Coluna 2 = Unidade, Coluna 3 = Qtd
        const especificacao = celulas[1]?.querySelector('.editable')?.innerText.trim() || '';
        const unidade = celulas[2]?.querySelector('input')?.value.trim() || '';
        const quantidade = celulas[3]?.querySelector('input')?.value.trim() || '';

        if (especificacao) {
            dadosTópico5.push({
                especificacao: especificacao,
                unidade: unidade,
                quantidade: quantidade
            });
        }
    });

    return {
        cronogramaExecucao: dadosTópico4,
        detalhamentoDespesas: dadosTópico5
    };
}