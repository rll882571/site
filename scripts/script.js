// ============================================================
// 1. MOTOR DE EVENTOS
// ============================================================
document.addEventListener('input', function (event) {
    const target = event.target;

    // A. MÁSCARA CNPJ, CEP E CPF
    if (target.classList.contains('cnpj-input')) {
        maskCNPJ(target);
    }
    if (target.classList.contains('cep-input')) {
        maskCEP(target);
    }
    if (target.classList.contains('cpf-input')) {
        maskCPF(target);
    }

    // B. AUTO-GROW DE TEXTAREAS NA DIGITAÇÃO
    if (target.tagName === 'TEXTAREA' && (target.classList.contains('auto-grow') || target.classList.contains('textarea-projeto'))) {
        ajustarAlturaTextarea(target);
    }

    // C. MÁSCARA DE MOEDA
    if (
        (target.classList.contains('bold-text') && target.closest('.currency-input')) ||
        target.classList.contains('money-input-budget')
    ) {
        maskMoney(target);
    }

    // DISPARA O CÁLCULO EM ESCADA DO ORÇAMENTO AO DIGITAR EM QUALQUER CAMPO DE MOEDA
    if (target.classList.contains('money-input-budget')) {
        calcularTotalOrcamentoResumo();
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

    // DISPARADOR DE SALVAMENTO AUTOMÁTICO
    salvarFormularioAuto();
}, false);

// VIGILANTE PARA SELECTS (dropdowns Sim/Não)
document.addEventListener('change', function (event) {
    if (event.target.tagName === 'SELECT') {
        salvarFormularioAuto();
    }
});


// ============================================================
// 2. FUNÇÕES DE AJUSTE DE ALTURA E FORMATO
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

// MÁSCARA DE CEP
function maskCEP(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    input.value = value;
}

// MÁSCARA DE CPF
function maskCPF(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    input.value = value;
}

// VALIDAÇÃO MATEMÁTICA DE CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// EVENTO PARA CHECAR O CPF AO SAIR DO CAMPO (blur)
document.addEventListener('blur', function (event) {
    if (event.target.classList.contains('cpf-input')) {
        const val = event.target.value.trim();
        if (val !== '' && !validarCPF(val)) {
            alert('CPF inválido! Por favor, digite um número válido.');
        }
    }
}, true);

// VALIDAÇÃO MATEMÁTICA DE CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado == digitos.charAt(1);
}

// EVENTO PARA CHECAR O CNPJ AO SAIR DO CAMPO (blur)
document.addEventListener('blur', function (event) {
    if (event.target.classList.contains('cnpj-input')) {
        const val = event.target.value.trim();
        if (val !== '' && !validarCNPJ(val)) {
            alert('CNPJ inválido! Por favor, digite um número válido.');
        }
    }
}, true);

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

// CÁLCULO EM ESCADA DO RESUMO DO ORÇAMENTO (Subitens -> 3.1 e 3.2 -> 3.3)
function calcularTotalOrcamentoResumo() {
    const inputs = document.querySelectorAll('.budget-grid .money-input-budget');
    if (inputs.length < 6) return;

    const inputConcedente = inputs[0]; // 3.1 Cabeçalho
    const inputCorrente = inputs[1];   // Despesas Correntes
    const inputCapital = inputs[2];    // Despesas de Capital

    const inputProponente = inputs[3]; // 3.2 Cabeçalho
    const inputC1 = inputs[4];         // Recursos Financeiros (C1)
    const inputC2 = inputs[5];         // Bens e Serviços (C2)

    const inputTotal = document.getElementById('resumo-total-projeto');

    const parseValor = (val) => {
        if (!val) return 0;
        const limpo = val.replace(/\./g, '').replace(',', '.');
        return parseFloat(limpo) || 0;
    };

    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // 1. Soma Despesas Correntes + Capital e atualiza 3.1
    const totalConcedente = parseValor(inputCorrente.value) + parseValor(inputCapital.value);
    inputConcedente.value = formatarMoeda(totalConcedente);

    // 2. Soma Recursos C1 + C2 e atualiza 3.2
    const totalProponente = parseValor(inputC1.value) + parseValor(inputC2.value);
    inputProponente.value = formatarMoeda(totalProponente);

    // 3. Soma 3.1 + 3.2 e atualiza 3.3 Total Geral
    const totalGeral = totalConcedente + totalProponente;
    if (inputTotal) {
        inputTotal.value = formatarMoeda(totalGeral);
    }
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
// 4. MOTOR DE PERSISTÊNCIA (BACKUP E AUTO-SAVE - ANEXO 3)
// ============================================================

function capturarDadosEstruturados() {
    const backup = {
        inputsFixos: [],
        selectsFixos: [],
        textareasFixas: [],
        editablesFixos: [] // Adicionado suporte para divs editáveis
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

    // Mapeia todas as divs editáveis do documento
    document.querySelectorAll("body .editable").forEach((el, index) => {
        backup.editablesFixos.push({ index: index, innerHTML: el.innerHTML });
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

    // Restaura o conteúdo das divs editáveis
    if (dados.editablesFixos && Array.isArray(dados.editablesFixos)) {
        const editablesAtuais = document.querySelectorAll("body .editable");
        dados.editablesFixos.forEach(item => {
            if (editablesAtuais[item.index]) {
                editablesAtuais[item.index].innerHTML = item.innerHTML;
            }
        });
    }

    calcularTotalPublico();
    calcularIdades();
    calcularTotalOrcamentoResumo();
    calcularTotaisTabelaDespesas();
    prepararParaImprimir();
}

function aplicarDadosEstruturados(dados) {
    if (!dados) return;

    // Restaura Inputs
    if (dados.inputsFixos && Array.isArray(dados.inputsFixos)) {
        const inputsAtuais = document.querySelectorAll("body input[type='text'], body input[type='number'], body input[type='email']");
        dados.inputsFixos.forEach(item => {
            if (inputsAtuais[item.index]) {
                inputsAtuais[item.index].value = item.value;
            }
        });
    }

    // Restaura Selects
    if (dados.selectsFixos && Array.isArray(dados.selectsFixos)) {
        const selectsAtuais = document.querySelectorAll("body select");
        dados.selectsFixos.forEach(item => {
            if (selectsAtuais[item.index]) {
                selectsAtuais[item.index].value = item.value;
            }
        });
    }

    // Restaura Textareas
    if (dados.textareasFixas && Array.isArray(dados.textareasFixas)) {
        const textareasAtuais = document.querySelectorAll("body textarea");
        dados.textareasFixas.forEach(item => {
            if (textareasAtuais[item.index]) {
                textareasAtuais[item.index].value = item.value;
            }
        });
    }

    // Recalcula totais dinâmicos e alturas de caixa de texto
    calcularTotalPublico();
    calcularIdades();
    calcularTotalOrcamentoResumo();
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
            console.error("Erro ao carregar dados salvos do Anexo 3.", e);
        }
    }
}


// ============================================================
// 5. FUNÇÕES DOS BOTÕES (EXPORTAR, IMPORTAR, NOVO PLANO)
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
            alert("Erro ao ler arquivo de backup JSON.");
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function novoPlano() {
    if (confirm("Atenção: Deseja apagar todos os dados preenchidos neste formulário?")) {
        localStorage.removeItem("AnexoTresFDID_v1");
        window.location.reload();
    }
}

// Inicialização automática ao carregar a página
window.addEventListener("DOMContentLoaded", function() {
    prepararParaImprimir();
    carregarFormularioAuto();
});

// POP-UP ORIENTATIVO AO CLICAR NOS CABEÇALHOS DO RESUMO
document.addEventListener('click', function (event) {
    if (event.target.id === 'resumo-concedente') {
        alert('Este valor é calculado automaticamente! Por favor, preencha os campos Despesas Correntes e Despesas de Capital logo abaixo.');
    }
    
    if (event.target.id === 'resumo-proponente') {
        alert('Este valor é calculado automaticamente! Por favor, preencha os campos Recursos Financeiros (C1) e Bens/Serviços (C2) logo abaixo.');
    }
});
// ============================================================
// 6. GERAÇÃO DE PDF E IMPRESSÃO
// ============================================================

function verificarAntesDeImprimir() {
    if (!validarTotaisFormulario()) {
        return; // Cancela a impressão se o usuário clicar em Cancelar no pop-up
    }
    prepararParaImprimir();
    window.print();
}

// Substitua no Bloco 5 (Exportar Backup)
function exportarBackup() {
    if (!validarTotaisFormulario()) {
        return; // Cancela o download do JSON se o usuário clicar em Cancelar no pop-up
    }
    const dados = capturarDadosEstruturados();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Backup_Anexo_3_FDID.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
// ============================================================
// 7. GERENCIAMENTO DA TABELA DINÂMICA (CRONOGRAMA DE EXECUÇÃO)
// ============================================================

function addRow() {
    const tableBody = document.querySelector('#cronograma-table tbody');
    if (!tableBody) return;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><div class="editable" contenteditable="true"></div></td>
        <td><div class="editable" contenteditable="true"></div></td>
        <td><div class="editable" contenteditable="true"></div></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td class="no-print coluna-acoes">
            <button type="button" class="btn-remove" onclick="removeRow(this)">×</button>
        </td>
    `;

    tableBody.appendChild(newRow);

    // Salva o estado do formulário após adicionar a linha
    salvarFormularioAuto();
}

function removeRow(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
        // Salva o estado do formulário após remover a linha
        salvarFormularioAuto();
    }
}
// ============================================================
// 8. TABELA 5 - DETALHAMENTO DAS DESPESAS (LINHAS DINÂMICAS E TOTAIIS)
// ============================================================

function addLinhaUnica(tipo) {
    const tableBody = document.querySelector('#tabela-despesas-unica tbody');
    if (!tableBody) return;

    const newRow = document.createElement('tr');
    newRow.classList.add(tipo === 'corrente' ? 'linha-corrente' : 'linha-capital');

    newRow.innerHTML = `
        <td><input type="text" class="input-codigo-despesa" placeholder="00000.00.00"></td>
        <td><div class="editable" contenteditable="true" data-placeholder="Descrição da despesa"></div></td>
        <td><input type="text" placeholder="Unid"></td>
        <td><input type="text" class="width-day" placeholder="Qtd"></td>
        <td><input type="text" class="money-input-despesa" placeholder="0,00" readonly></td>
        <td><input type="text" class="money-input-despesa valor-conced" placeholder="0,00"></td>
        <td><input type="text" class="money-input-despesa valor-propon" placeholder="0,00"></td>
        <td class="no-print coluna-acoes">
            <button type="button" class="btn-remove" onclick="removeLinhaDespesa(this)">×</button>
        </td>
    `;

    tableBody.appendChild(newRow);

    // Observa tanto os inputs quanto a div.editable para salvar e recalcular ao digitar
    newRow.querySelectorAll('input, .editable').forEach(el => {
        el.addEventListener('input', function() {
            if (this.classList.contains('money-input-despesa')) {
                maskMoney(this);
            }
            calcularTotaisTabelaDespesas();
        });
    });

    salvarFormularioAuto();
}

function removeLinhaDespesa(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
        calcularTotaisTabelaDespesas();
        salvarFormularioAuto();
    }
}

function calcularTotaisTabelaDespesas() {
    const parseValor = (val) => {
        if (!val) return 0;
        const limpo = val.replace(/\./g, '').replace(',', '.');
        return parseFloat(limpo) || 0;
    };

    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    let totCorrenteConced = 0, totCorrentePropon = 0;
    let totCapitalConced = 0, totCapitalPropon = 0;

    // Recalcula linha por linha (linha = concedente + proponente)
    document.querySelectorAll('#tabela-despesas-unica tbody tr').forEach(row => {
        const inputConced = row.querySelector('.valor-conced');
        const inputPropon = row.querySelector('.valor-propon');
        const inputTotalLinha = row.children[4]?.querySelector('input');

        const vConced = parseValor(inputConced?.value);
        const vPropon = parseValor(inputPropon?.value);
        const totalLinha = vConced + vPropon;

        if (inputTotalLinha) inputTotalLinha.value = formatarMoeda(totalLinha);

        if (row.classList.contains('linha-corrente')) {
            totCorrenteConced += vConced;
            totCorrentePropon += vPropon;
        } else if (row.classList.contains('linha-capital')) {
            totCapitalConced += vConced;
            totCapitalPropon += vPropon;
        }
    });

    // Subtotais 5.1 (Correntes)
    const totCorrenteGeral = totCorrenteConced + totCorrentePropon;
    if (document.getElementById('total-corrente-geral')) document.getElementById('total-corrente-geral').value = formatarMoeda(totCorrenteGeral);
    if (document.getElementById('total-corrente-conced')) document.getElementById('total-corrente-conced').value = formatarMoeda(totCorrenteConced);
    if (document.getElementById('total-corrente-propon')) document.getElementById('total-corrente-propon').value = formatarMoeda(totCorrentePropon);

    // Subtotais 5.2 (Capital)
    const totCapitalGeral = totCapitalConced + totCapitalPropon;
    if (document.getElementById('total-capital-geral')) document.getElementById('total-capital-geral').value = formatarMoeda(totCapitalGeral);
    if (document.getElementById('total-capital-conced')) document.getElementById('total-capital-conced').value = formatarMoeda(totCapitalConced);
    if (document.getElementById('total-capital-propon')) document.getElementById('total-capital-propon').value = formatarMoeda(totCapitalPropon);

    // Total Geral do Projeto (5.1 + 5.2)
    const totProjetoGeral = totCorrenteGeral + totCapitalGeral;
    const totProjetoConced = totCorrenteConced + totCapitalConced;
    const totProjetoPropon = totCorrentePropon + totCapitalPropon;

    if (document.getElementById('total-projeto-geral')) document.getElementById('total-projeto-geral').value = formatarMoeda(totProjetoGeral);
    if (document.getElementById('total-projeto-conced')) document.getElementById('total-projeto-conced').value = formatarMoeda(totProjetoConced);
    if (document.getElementById('total-projeto-propon')) document.getElementById('total-projeto-propon').value = formatarMoeda(totProjetoPropon);
}
// ============================================================
// VALIDAÇÃO DE CONFRONTO DE VALORES (POP-UP DE ALERTA)
// ============================================================

function validarTotaisFormulario() {
    const parseVal = (id) => {
        const el = document.getElementById(id);
        if (!el || !el.value) return 0;
        return parseFloat(el.value.replace(/\./g, '').replace(',', '.')) || 0;
    };

    const formatar = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 1. Pega os valores da Seção 3 (Resumo)
    const resConcedente = parseVal('resumo-concedente');
    const resProponente = parseVal('resumo-proponente');
    const resTotalGeral = parseVal('resumo-total-projeto');

    // 2. Pega os valores do Rodapé da Seção 5 (Detalhamento)
    const despConcedente = parseVal('total-projeto-conced');
    const despProponente = parseVal('total-projeto-propon');
    const despTotalGeral = parseVal('total-projeto-geral');

    // 3. Soma os meses das tabelas 4.2 (Concedente) e 4.3 (Contrapartida)
    let cronoConcedente = 0;
    let cronoProponente = 0;

    const tabelasStatic = document.querySelectorAll('.form-section:has(h4) .static-table');
    
    // Tabelas 4.2 (Concedente) -> Índice 0 e 1
    if (tabelasStatic.length >= 2) {
        [tabelasStatic[0], tabelasStatic[1]].forEach(tab => {
            tab.querySelectorAll('tbody tr input[type="text"]').forEach((inp, idx) => {
                if (idx > 0) { // Pula a coluna 'Meta'
                    const v = parseFloat(inp.value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
                    cronoConcedente += v;
                }
            });
        });
    }

    // Tabelas 4.3 (Contrapartida) -> Índice 2 e 3
    if (tabelasStatic.length >= 4) {
        [tabelasStatic[2], tabelasStatic[3]].forEach(tab => {
            tab.querySelectorAll('tbody tr input[type="text"]').forEach((inp, idx) => {
                if (idx > 0) {
                    const v = parseFloat(inp.value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
                    cronoProponente += v;
                }
            });
        });
    }

    // 4. Mapeia os erros encontrados
    let erros = [];

    // Diferença Concedente (Seção 3 vs Seção 5)
    if (Math.abs(resConcedente - despConcedente) > 0.01) {
        erros.push(`- Concedente: Resumo 3.1 (R$ ${formatar(resConcedente)}) não bate com Detalhamento 5 (R$ ${formatar(despConcedente)})`);
    }

    // Diferença Proponente (Seção 3 vs Seção 5)
    if (Math.abs(resProponente - despProponente) > 0.01) {
        erros.push(`- Proponente: Resumo 3.2 (R$ ${formatar(resProponente)}) não bate com Detalhamento 5 (R$ ${formatar(despProponente)})`);
    }

    // Diferença Total Geral (Seção 3 vs Seção 5)
    if (Math.abs(resTotalGeral - despTotalGeral) > 0.01) {
        erros.push(`- Total do Projeto: Resumo 3.3 (R$ ${formatar(resTotalGeral)}) não bate com Detalhamento 5 (R$ ${formatar(despTotalGeral)})`);
    }

    // Diferença Cronograma Concedente (4.2 vs Seção 5)
    if (cronoConcedente > 0 && Math.abs(cronoConcedente - despConcedente) > 0.01) {
        erros.push(`- Cronograma 4.2 (R$ ${formatar(cronoConcedente)}) não bate com Total Concedente da Seção 5 (R$ ${formatar(despConcedente)})`);
    }

    // Diferença Cronograma Proponente (4.3 vs Seção 5)
    if (cronoProponente > 0 && Math.abs(cronoProponente - despProponente) > 0.01) {
        erros.push(`- Cronograma 4.3 (R$ ${formatar(cronoProponente)}) não bate com Total Proponente da Seção 5 (R$ ${formatar(despProponente)})`);
    }

    // 5. Exibe o Pop-up se houver divergências
    if (erros.length > 0) {
        const mensagem = "⚠️ ATENÇÃO: DIVERGÊNCIA NOS VALORES ENCONTRADA!\n\n" +
                         erros.join("\n") + 
                         "\n\nDeseja prosseguir mesmo assim?";
        return confirm(mensagem); // Retorna true se clicar OK, false se clicar Cancelar
    }

    return true; // Sem erros
}
// ============================================================
// VALIDAÇÃO E MÁSCARA AUTOMÁTICA DE CÓDIGOS DE DESPESAS (FDID)
// ============================================================

const CODIGOS_DESPESAS_CORRENTES = [
    "33390.04.00", "33390.14.00", "33390.18.00", "33390.30.00",
    "33390.31.00", "33390.32.00", "33390.33.00", "33390.35.00",
    "33390.36.00", "33390.37.00", "33390.38.00", "33390.39.00",
    "33390.47.00", "33390.48.00", "33390.49.00", "33390.91.00",
    "33390.93.00", "33390.95.00"
];

const CODIGOS_DESPESAS_CAPITAL = [
    "4422.51.00", "4422.52.00"
];

// MÁSCARA EM TEMPO REAL AO DIGITAR
function maskCodigoDespesa(inputEl) {
    const row = inputEl.closest('tr');
    if (!row) return;

    let value = inputEl.value.replace(/\D/g, ""); // Apenas números
    const ehCorrente = row.classList.contains('linha-corrente');
    const ehCapital = row.classList.contains('linha-capital');

    if (ehCorrente) {
        if (value.length > 9) value = value.slice(0, 9);

        if (value.length > 7) {
            value = value.replace(/^(\d{5})(\d{2})(\d{1,2})$/, "$1.$2.$3");
        } else if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d{1,2})$/, "$1.$2");
        }
    } else if (ehCapital) {
        if (value.length > 8) value = value.slice(0, 8);

        if (value.length > 6) {
            value = value.replace(/^(\d{4})(\d{2})(\d{1,2})$/, "$1.$2.$3");
        } else if (value.length > 4) {
            value = value.replace(/^(\d{4})(\d{1,2})$/, "$1.$2");
        }
    }

    inputEl.value = value;
}

// VALIDAÇÃO AO SAIR DO CAMPO (BLUR)
function validarCodigoDespesaInput(inputEl) {
    const row = inputEl.closest('tr');
    if (!row) return true;

    const codDigitado = inputEl.value.trim();
    if (codDigitado === '') return true;

    const ehCorrente = row.classList.contains('linha-corrente');
    const ehCapital = row.classList.contains('linha-capital');

    if (ehCorrente) {
        if (!CODIGOS_DESPESAS_CORRENTES.includes(codDigitado)) {
            alert(`⚠️ Código "${codDigitado}" é inválido para Despesa Corrente!\n\nCódigos válidos:\n` + CODIGOS_DESPESAS_CORRENTES.join('\n'));
            return false;
        }
    } else if (ehCapital) {
        if (!CODIGOS_DESPESAS_CAPITAL.includes(codDigitado)) {
            alert(`⚠️ Código "${codDigitado}" é inválido para Despesa de Capital!\n\nCódigos válidos:\n` + CODIGOS_DESPESAS_CAPITAL.join('\n'));
            return false;
        }
    }

    return true;
}

// OUVINTES DE EVENTOS
document.addEventListener('input', function (event) {
    if (event.target.classList.contains('input-codigo-despesa')) {
        maskCodigoDespesa(event.target);
    }
});

document.addEventListener('blur', function (event) {
    if (event.target.classList.contains('input-codigo-despesa')) {
        validarCodigoDespesaInput(event.target);
    }
}, true);