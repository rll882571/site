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

// BLOQUEIO DE FORMATAÇÃO E IMAGENS AO COLAR EM CÉLULAS EDITÁVEIS
document.addEventListener('paste', function(event) {
    if (event.target.classList.contains('editable')) {
        event.preventDefault(); 
        let textoPuro = (event.clipboardData || window.clipboardData).getData('text');
        document.execCommand('insertText', false, textoPuro);
    }
});


// ============================================================
// 2. FUNÇÕES DE AJUSTE DE ALTURA PARA IMPRESSÃO
// ============================================================

function ajustarAlturaTextarea(el) {
    el.style.height = 'auto';
    if (el.classList.contains('input-table-textarea')) {
        el.style.height = (el.scrollHeight > 16 ? el.scrollHeight : 16) + 'px';
    } else {
        el.style.height = (el.scrollHeight + 8) + 'px';
    }
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
// 4. MOTOR DE PERSISTÊNCIA ESTRUTURADA (CHAVE-VALOR E TABELAS)
// ============================================================

function capturarDadosEstruturados() {
    const dadosFormulario = {};

    // 1. Captura todos os inputs, selects e textareas que possuem ID
    document.querySelectorAll("body input[id], body select[id], body textarea[id]").forEach(el => {
        if (el.id) {
            dadosFormulario[el.id] = el.value;
        }
    });

    // 2. Captura Quadro Lógico (Item 24)
    const dadosQuadroLogico = [];
    document.querySelectorAll('#tabela-quadro-logico tbody tr').forEach(tr => {
        const edits = tr.querySelectorAll('.editable');
        if (edits.length >= 5) {
            dadosQuadroLogico.push({
                intervencao: edits[0].innerHTML,
                indicadores: edits[1].innerHTML,
                meios: edits[2].innerHTML,
                prazo: edits[3].innerHTML,
                responsavel: edits[4].innerHTML
            });
        }
    });

    // 3. Captura Entidades Parceiras (Item 23)
    const dadosEntidadesParceiras = [];
    document.querySelectorAll('#tabela-entidades-parceiras tbody tr').forEach(tr => {
        const edits = tr.querySelectorAll('.editable');
        const cnpjInput = tr.querySelector('.cnpj-input');
        dadosEntidadesParceiras.push({
            razaoSocial: edits[0] ? edits[0].innerHTML : '',
            cnpj: cnpjInput ? cnpjInput.value : '',
            tipoApoio: edits[1] ? edits[1].innerHTML : ''
        });
    });

    // 4. Captura Cronograma de Atividades (Item 25)
    const dadosCronograma = [];
    document.querySelectorAll('#tabela-cronograma tbody tr').forEach(tr => {
        const textarea = tr.querySelector('textarea');
        const inputsMes = tr.querySelectorAll('.input-mes');
        const mesesValores = Array.from(inputsMes).map(inp => inp.value);
        dadosCronograma.push({
            atividade: textarea ? textarea.value : '',
            meses: mesesValores
        });
    });

    return {
        camposFixos: dadosFormulario,
        quadroLogico: dadosQuadroLogico,
        entidadesParceiras: dadosEntidadesParceiras,
        cronograma: dadosCronograma
    };
}

function aplicarDadosEstruturados(dados) {
    if (!dados) return;

    // 1. Restaura campos fixos por ID
    if (dados.camposFixos) {
        for (const [id, valor] of Object.entries(dados.camposFixos)) {
            const el = document.getElementById(id);
            if (el) {
                el.value = valor;
            }
        }
    }

    // 2. Restaura Quadro Lógico
    if (dados.quadroLogico && Array.isArray(dados.quadroLogico)) {
        const tbody = document.querySelector('#tabela-quadro-logico tbody');
        if (tbody) {
            tbody.innerHTML = '';
            dados.quadroLogico.forEach(item => {
                adicionarLinhaQuadroLogico([
                    item.intervencao,
                    item.indicadores,
                    item.meios,
                    item.prazo,
                    item.responsavel
                ]);
            });
        }
    }

    // 3. Restaura Entidades Parceiras
    if (dados.entidadesParceiras && Array.isArray(dados.entidadesParceiras)) {
        const tbody = document.querySelector('#tabela-entidades-parceiras tbody');
        if (tbody) {
            tbody.innerHTML = '';
            dados.entidadesParceiras.forEach(item => {
                adicionarLinhaEntidadeParceira([
                    item.razaoSocial,
                    item.cnpj,
                    item.tipoApoio
                ]);
            });
        }
    }

    // 4. Restaura Cronograma
    if (dados.cronograma && Array.isArray(dados.cronograma)) {
        const tbody = document.querySelector('#tabela-cronograma tbody');
        if (tbody) {
            tbody.innerHTML = '';
            dados.cronograma.forEach(item => {
                const valoresLinha = [item.atividade, ...item.meses];
                adicionarLinhaCronograma(valoresLinha);
            });
        }
    }

    calcularTotalPublico();
    calcularIdades();
    prepararParaImprimir();
}

function salvarFormularioAuto() {
    const dados = capturarDadosEstruturados();
    localStorage.setItem("AnexoTresFDID_v2", JSON.stringify(dados));
}

function carregarFormularioAuto() {
    const localData = localStorage.getItem("AnexoTresFDID_v2");
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
        localStorage.removeItem("AnexoTresFDID_v2");
        window.location.reload();
    }
}

window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('textarea.auto-grow').forEach(function(el) {
        ajustarAlturaTextarea(el);
    });
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
        <td><div class="editable" contenteditable="true" data-placeholder="Lógica de intervenção..."></div></td>
        <td><div class="editable" contenteditable="true" data-placeholder="Indicadores..."></div></td>
        <td><div class="editable" contenteditable="true" data-placeholder="Meios de verificação..."></div></td>
        <td><div class="editable" contenteditable="true" data-placeholder="Prazo/frequência..."></div></td>
        <td><div class="editable" contenteditable="true" data-placeholder="Responsável..."></div></td>
        <td class="no-print text-center"><button type="button" class="btn-remove-row" onclick="removerLinhaQuadroLogico(this)">❌</button></td>
    `;

    tbody.appendChild(tr);

    if (dadosValores && Array.isArray(dadosValores)) {
        const edits = tr.querySelectorAll('.editable');
        dadosValores.forEach((val, idx) => {
            if (edits[idx]) edits[idx].innerHTML = val;
        });
    }

    salvarFormularioAuto();
}

function removerLinhaQuadroLogico(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.parentElement;
    
    if (tbody.querySelectorAll('tr').length > 1) {
        tr.remove();
        salvarFormularioAuto();
    } else {
        alert("O quadro lógico deve conter pelo menos uma linha.");
    }
}


// ============================================================
// FUNÇÕES DAS ENTIDADES PARCEIRAS (ITEM 23)
// ============================================================

function adicionarLinhaEntidadeParceira(dadosValores = null) {
    const tbody = document.querySelector('#tabela-entidades-parceiras tbody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><div class="editable" contenteditable="true" data-placeholder="Ex: Instituição..."></div></td>
        <td><input type="text" class="cnpj-input" maxlength="18" placeholder="00.000.000/0000-00"></td>
        <td><div class="editable" contenteditable="true" data-placeholder="Descreva o tipo de apoio..."></div></td>
        <td class="no-print text-center"><button type="button" class="btn-remove-row" onclick="removerLinhaEntidadeParceira(this)">❌</button></td>
    `;

    tbody.appendChild(tr);

    if (dadosValores && Array.isArray(dadosValores)) {
        const edits = tr.querySelectorAll('.editable');
        const cnpjInput = tr.querySelector('.cnpj-input');
        if (edits[0] && dadosValores[0]) edits[0].innerHTML = dadosValores[0];
        if (cnpjInput && dadosValores[1]) cnpjInput.value = dadosValores[1];
        if (edits[1] && dadosValores[2]) edits[1].innerHTML = dadosValores[2];
    }

    salvarFormularioAuto();
}

function removerLinhaEntidadeParceira(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.parentElement;
    
    if (tbody.querySelectorAll('tr').length > 1) {
        tr.remove();
        salvarFormularioAuto();
    } else {
        alert("A tabela de parcerias deve conter pelo menos uma linha.");
    }
}


// ============================================================
// FUNÇÕES DO CRONOGRAMA DE ATIVIDADES (ITEM 25)
// ============================================================

function adicionarLinhaCronograma(dadosValores = null) {
    const tbody = document.querySelector('#tabela-cronograma tbody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><textarea class="auto-grow" rows="2" placeholder="(Exemplo: Realização de atividade...)"></textarea></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td><input type="text" class="input-mes" maxlength="2" placeholder=""></td>
        <td class="no-print text-center"><button type="button" class="btn-remove-row" onclick="removerLinhaCronograma(this)">❌</button></td>
    `;

    tbody.appendChild(tr);

    if (dadosValores && Array.isArray(dadosValores)) {
        const elementos = tr.querySelectorAll('textarea, .input-mes');
        dadosValores.forEach((val, idx) => {
            if (elementos[idx]) {
                elementos[idx].value = val;
            }
        });
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


// ============================================================
// FIX: GARANTIR QUE AS FUNÇÕES ESTEJAM NO ESCOPO GLOBAL
// ============================================================

window.adicionarLinhaCronograma = adicionarLinhaCronograma;
window.removerLinhaCronograma = removerLinhaCronograma;
window.adicionarLinhaQuadroLogico = adicionarLinhaQuadroLogico;
window.removerLinhaQuadroLogico = removerLinhaQuadroLogico;
window.adicionarLinhaEntidadeParceira = adicionarLinhaEntidadeParceira;
window.removerLinhaEntidadeParceira = removerLinhaEntidadeParceira;

console.log('✅ Todas as funções globais registradas com sucesso!');