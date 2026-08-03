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

    // DISPARADOR DE SALVAMENTO AUTOMÁTICO
    salvarFormularioAuto();
}, false);

// VIGILANTE PARA SELECTS (dropdowns Sim/Não)
document.addEventListener('change', function (event) {
    if (event.target.tagName === 'SELECT') {
        salvarFormularioAuto();
    }
});
// F. BLOQUEIO DE FORMATAÇÃO E IMAGENS AO COLAR (FORÇA TEXTO PURO)
document.addEventListener('paste', function(event) {
    if (event.target.classList.contains('editable')) {
        // Impede o navegador de colar a formatação original (cores, imagens, tabelas)
        event.preventDefault(); 
        
        // Extrai apenas o texto limpo da área de transferência
        let textoPuro = (event.clipboardData || window.clipboardData).getData('text');
        
        // Insere apenas o texto limpo na posição exata do cursor
        document.execCommand('insertText', false, textoPuro);
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

// ============================================================
// 4. MOTOR DE PERSISTÊNCIA (BACKUP E AUTO-SAVE - ANEXO 2)
// ============================================================

function capturarDadosEstruturados() {
    const backup = {
        camposPorId: {},
        editablesFixos: [],
        tbodyCronogramaHtml: '', // Preserva as mesclagens e rowspans da tabela do cronograma
        linhasDespesas: []
    };

    // Salva o HTML completo do tbody do cronograma para manter o layout mesclado
    const tbodyCrono = document.querySelector('#cronograma-table tbody');
    if (tbodyCrono) {
        backup.tbodyCronogramaHtml = tbodyCrono.innerHTML;
    }

    // Captura as linhas criadas dinamicamente nas Despesas (Tópico 5)
    document.querySelectorAll('#tabela-despesas-unica tbody tr').forEach(row => {
        const tipo = row.classList.contains('linha-corrente') ? 'corrente' : 'capital';
        const codigo = row.querySelector('.input-codigo-despesa')?.value || '';
        const desc = row.querySelector('.editable')?.innerHTML || '';
        const unid = row.children[2]?.querySelector('input')?.value || '';
        const qtd = row.children[3]?.querySelector('input')?.value || '';
        const vConced = row.querySelector('.valor-conced')?.value || '0,00';
        const vPropon = row.querySelector('.valor-propon')?.value || '0,00';

        backup.linhasDespesas.push({ tipo, codigo, desc, unid, qtd, vConced, vPropon });
    });

    // Captura TODOS os campos fixos com ID (inputs, textareas, selects e checkboxes)
    document.querySelectorAll("input[id], textarea[id], select[id]").forEach(el => {
        if (el.type === 'checkbox') {
            backup.camposPorId[el.id] = el.checked;
        } else {
            backup.camposPorId[el.id] = el.value;
        }
    });

    // Captura editables fixos fora de tabelas dinâmicas
    document.querySelectorAll("body .editable:not(#cronograma-table .editable):not(#tabela-despesas-unica .editable)").forEach((el, index) => {
        backup.editablesFixos.push({ index: index, innerHTML: el.innerHTML });
    });

    return backup;
}

function aplicarDadosEstruturados(dados) {
    if (!dados) return;

    // 1. Restaura o HTML do Cronograma mantendo as mesclagens (rowspan)
    const tbodyCrono = document.querySelector('#cronograma-table tbody');
    if (tbodyCrono) {
        if (dados.tbodyCronogramaHtml) {
            tbodyCrono.innerHTML = dados.tbodyCronogramaHtml;
        } else if (dados.linhasCronograma && Array.isArray(dados.linhasCronograma)) {
            tbodyCrono.innerHTML = ''; 
            dados.linhasCronograma.forEach(item => {
                addRow();
                const ultimaLinha = tbodyCrono.lastElementChild;
                if (ultimaLinha) {
                    const editables = ultimaLinha.querySelectorAll('.editable');
                    item.editables.forEach((val, idx) => { if (editables[idx]) editables[idx].innerHTML = val; });
                    const inputs = ultimaLinha.querySelectorAll('input');
                    item.inputs.forEach((val, idx) => { if (inputs[idx]) inputs[idx].value = val; });
                }
            });
        }
    }

    // 2. Recria as linhas dinâmicas de Despesas (Tópico 5)
    if (dados.linhasDespesas && Array.isArray(dados.linhasDespesas)) {
        const tbodyDesp = document.querySelector('#tabela-despesas-unica tbody');
        if (tbodyDesp) {
            tbodyDesp.innerHTML = ''; 
            dados.linhasDespesas.forEach(item => {
                addLinhaUnica(item.tipo);
                const ultimaLinha = tbodyDesp.lastElementChild;
                if (ultimaLinha) {
                    if (ultimaLinha.querySelector('.input-codigo-despesa')) ultimaLinha.querySelector('.input-codigo-despesa').value = item.codigo;
                    if (ultimaLinha.querySelector('.editable')) ultimaLinha.querySelector('.editable').innerHTML = item.desc;
                    if (ultimaLinha.children[2]?.querySelector('input')) ultimaLinha.children[2].querySelector('input').value = item.unid;
                    if (ultimaLinha.children[3]?.querySelector('input')) ultimaLinha.children[3].querySelector('input').value = item.qtd;
                    if (ultimaLinha.querySelector('.valor-conced')) ultimaLinha.querySelector('.valor-conced').value = item.vConced;
                    if (ultimaLinha.querySelector('.valor-propon')) ultimaLinha.querySelector('.valor-propon').value = item.vPropon;
                }
            });
        }
    }

    // 3. Aplica valores nos campos fixos via ID
    if (dados.camposPorId) {
        Object.keys(dados.camposPorId).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = dados.camposPorId[id];
                } else {
                    el.value = dados.camposPorId[id];
                }
            }
        });
    }

    // 4. Recalcula os totais do Anexo 2
    calcularTotalOrcamentoResumo();
    calcularTotaisTabelaDespesas();
    prepararParaImprimir();
}

// ============================================================
// FUNÇÕES DE SALVAMENTO E CARREGAMENTO AUTOMÁTICO (LOCALSTORAGE)
// ============================================================

function salvarFormularioAuto() {
    const dados = capturarDadosEstruturados();
    localStorage.setItem("AnexoDoisFDID_v1", JSON.stringify(dados));
}

function carregarFormularioAuto() {
    const salvo = localStorage.getItem("AnexoDoisFDID_v1");
    if (salvo) {
        try {
            const dados = JSON.parse(salvo);
            aplicarDadosEstruturados(dados);
        } catch (e) {
            console.error("Erro ao carregar do localStorage:", e);
        }
    }
}

// ============================================================
// 5. FUNÇÕES DOS BOTÕES (EXPORTAR, IMPORTAR, NOVO PLANO)
// ============================================================

function exportarBackup() {
    if (!validarTotaisFormulario()) {
        return;
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

function importarBackup(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            aplicarDadosEstruturados(dados);
            salvarFormularioAuto();
            alert("Backup do Anexo 2 carregado com sucesso!"); 
        } catch (err) {
            alert("Erro ao ler arquivo de backup JSON.");
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function novoPlano() {
    if (confirm("Atenção: Deseja apagar todos os dados preenchidos neste formulário?")) {
        localStorage.removeItem("AnexoDoisFDID_v1"); 
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
// 6. GERENCIAMENTO DA TABELA DINÂMICA (CRONOGRAMA DE EXECUÇÃO)
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
    salvarFormularioAuto();
}

function removeRow(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
        salvarFormularioAuto();
    }
}


// ============================================================
// 7. TABELA 5 - DETALHAMENTO DAS DESPESAS (LINHAS DINÂMICAS E TOTAIS)
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

    const totCorrenteGeral = totCorrenteConced + totCorrentePropon;
    if (document.getElementById('total-corrente-geral')) document.getElementById('total-corrente-geral').value = formatarMoeda(totCorrenteGeral);
    if (document.getElementById('total-corrente-conced')) document.getElementById('total-corrente-conced').value = formatarMoeda(totCorrenteConced);
    if (document.getElementById('total-corrente-propon')) document.getElementById('total-corrente-propon').value = formatarMoeda(totCorrentePropon);

    const totCapitalGeral = totCapitalConced + totCapitalPropon;
    if (document.getElementById('total-capital-geral')) document.getElementById('total-capital-geral').value = formatarMoeda(totCapitalGeral);
    if (document.getElementById('total-capital-conced')) document.getElementById('total-capital-conced').value = formatarMoeda(totCapitalConced);
    if (document.getElementById('total-capital-propon')) document.getElementById('total-capital-propon').value = formatarMoeda(totCapitalPropon);

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

    const resConcedente = parseVal('resumo-concedente');
    const resProponente = parseVal('resumo-proponente');
    const resTotalGeral = parseVal('resumo-total-projeto');

    const despConcedente = parseVal('total-projeto-conced');
    const despProponente = parseVal('total-projeto-propon');
    const despTotalGeral = parseVal('total-projeto-geral');

    let cronoConcedente = 0;
    let cronoProponente = 0;

    const tabelasStatic = document.querySelectorAll('.form-section:has(h4) .static-table');
    
    if (tabelasStatic.length >= 2) {
        [tabelasStatic[0], tabelasStatic[1]].forEach(tab => {
            tab.querySelectorAll('tbody tr input[type="text"]').forEach((inp, idx) => {
                if (idx > 0) {
                    const v = parseFloat(inp.value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
                    cronoConcedente += v;
                }
            });
        });
    }

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

    let erros = [];

    if (Math.abs(resConcedente - despConcedente) > 0.01) {
        erros.push(`- Concedente: Resumo 3.1 (R$ ${formatar(resConcedente)}) não bate com Detalhamento 5 (R$ ${formatar(despConcedente)})`);
    }

    if (Math.abs(resProponente - despProponente) > 0.01) {
        erros.push(`- Proponente: Resumo 3.2 (R$ ${formatar(resProponente)}) não bate com Detalhamento 5 (R$ ${formatar(despProponente)})`);
    }

    if (Math.abs(resTotalGeral - despTotalGeral) > 0.01) {
        erros.push(`- Total do Projeto: Resumo 3.3 (R$ ${formatar(resTotalGeral)}) não bate com Detalhamento 5 (R$ ${formatar(despTotalGeral)})`);
    }

    if (cronoConcedente > 0 && Math.abs(cronoConcedente - despConcedente) > 0.01) {
        erros.push(`- Cronograma 4.2 (R$ ${formatar(cronoConcedente)}) não bate com Total Concedente da Seção 5 (R$ ${formatar(despConcedente)})`);
    }

    if (cronoProponente > 0 && Math.abs(cronoProponente - despProponente) > 0.01) {
        erros.push(`- Cronograma 4.3 (R$ ${formatar(cronoProponente)}) não bate com Total Proponente da Seção 5 (R$ ${formatar(despProponente)})`);
    }

    if (erros.length > 0) {
        const mensagem = "⚠️ ATENÇÃO: DIVERGÊNCIA NOS VALORES ENCONTRADA!\n\n" +
                         erros.join("\n") + 
                         "\n\nDeseja prosseguir mesmo assim?";
        return confirm(mensagem);
    }

    return true;
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

function maskCodigoDespesa(inputEl) {
    const row = inputEl.closest('tr');
    if (!row) return;

    let value = inputEl.value.replace(/\D/g, "");
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


// ============================================================
// EXTRAÇÃO E PROMPT DE AUDITORIA
// ============================================================

window.extrairDadosParaValidacaoIA = function() {
    const dadosTopico4 = [];
    const dadosTopico5 = [];

    const linhasTabela4 = document.querySelectorAll('#cronograma-table tbody tr');
    let ultimaMeta = '';
    let ultimaEtapa = '';

    linhasTabela4.forEach(linha => {
        let colMeta = linha.querySelector('td:nth-child(1) .editable');
        let colEtapa = linha.querySelector('td:nth-child(2) .editable');
        let colDesc = linha.querySelector('td:nth-child(3) .editable');
        
        if (colMeta && colMeta.innerText.trim() !== '') {
            ultimaMeta = colMeta.innerText.trim();
        }
        if (colEtapa && colEtapa.innerText.trim() !== '') {
            ultimaEtapa = colEtapa.innerText.trim();
        }

        const descricao = colDesc ? colDesc.innerText.trim() : '';
        const inputs = linha.querySelectorAll('input');
        const unidade = inputs[0] ? inputs[0].value.trim() : '';
        const quantidade = inputs[1] ? inputs[1].value.trim() : '';

        if (descricao) {
            dadosTopico4.push({ 
                meta: ultimaMeta, 
                etapa: ultimaEtapa, 
                descricao, 
                unidade, 
                quantidade 
            });
        }
    });

    const linhasTabela5 = document.querySelectorAll('#tabela-despesas-unica tbody tr');
    linhasTabela5.forEach(linha => {
        const celulas = linha.children;
        const codigo = celulas[0]?.querySelector('input')?.value.trim() || '';
        const especificacao = celulas[1]?.querySelector('.editable')?.innerText.trim() || '';
        const unidade = celulas[2]?.querySelector('input')?.value.trim() || '';
        const quantidade = celulas[3]?.querySelector('input')?.value.trim() || '';

        if (codigo || especificacao) {
            dadosTopico5.push({ codigo, especificacao, unidade, quantidade });
        }
    });

    return {
        cronogramaExecucao: dadosTopico4,
        detalhamentoDespesas: dadosTopico5
    };
};

window.gerarPromptValidacao = function(dadosExtraidos) {
    return `
Você é um auditor sênior especialista em análise crítica de convênios e planos de trabalho públicos.
Sua missão é emitir um parecer técnico minucioso e equilibrado cobrindo TODAS as inconsistências encontradas entre o Detalhamento de Despesas (Tópico 5) e o Cronograma de Execução (Tópico 4.1).

--- CÓDIGOS DE REFERÊNCIA VÁLIDOS PARA O FDID ---
Despesas Correntes:
- 33390.04.00 (Contratação por tempo determinado)
- 33390.14.00 (Diárias - Civil)
- 33390.18.00 (Auxílio financeiro a estudantes - Bolsa)
- 33390.30.00 (Material de consumo)
- 33390.31.00 (Premiações culturais, artísticas, científicas, desportivas e outros)
- 33390.32.00 (Material, Bens e Serviços para distribuição gratuita)
- 33390.33.00 (Passagens e despesas com locomoção)
- 33390.35.00 (Serviços de consultoria)
- 33390.36.00 (Outros serviços de terceiros – pessoa física)
- 33390.37.00 (Locação de mão-de-obra)
- 33390.38.00 (Arrendamento mercantil)
- 33390.39.00 (Outros serviços de terceiros – pessoa jurídica)
- 33390.47.00 (Obrigações tributárias e contributivas)
- 33390.48.00 (Outros auxílios financeiros a pessoa física)
- 33390.49.00 (Auxílio-transporte)
- 33390.91.00 (Sentenças Judiciais)
- 33390.93.00 (Indenizações e restituições)
- 33390.95.00 (Indenização pela execução trabalhos de campo)

Despesas de Capital:
- 4422.51.00 (Obras e instalações)
- 4422.52.00 (Equipamentos e material permanente)

--- DADOS PARA ANÁLISE ---
${JSON.stringify(dadosExtraidos, null, 2)}

--- CHECKLIST OBRIGATÓRIO DE AUDITORIA (ANALISE TODOS OS PONTOS COM O MESMO RIGOR) ---

1. CLASSIFICAÇÃO ORÇAMENTÁRIA (CÓDIGOS DE DESPESA):
   - Verifique se o 'codigo' informado consta na lista oficial. Se não constar, aponte como inválido.
   - Se o 'codigo' for válido mas for incompatível com a 'especificacao', aponte a divergência e SUGIRA O CÓDIGO E CATEGORIA CORRETOS da lista.
   - Se houver 'codigo' sem 'especificacao', solicite o detalhamento do item.

2. DETALHAMENTO DE EQUIPE TÉCNICA / RECURSOS HUMANOS:
   - Se houver despesas relativas a pessoal/equipe (ex: "Equipe Técnica", "Salários", "Monitores", "Coordenadores"), VERIFIQUE SE HÁ A DISCRIMINAÇÃO INDIVIDUAL DE CARGOS E QUANTIDADES.
   - Se o item for genérico, SOLICITE A ESPECIFICAÇÃO COMPLETA dos profissionais e da quantidade individualizada para cada função.

3. CORRESPONDÊNCIA COM O CRONOGRAMA DE EXECUÇÃO (TÓPICO 4.1):
   - Para cada despesa listada no Tópico 5, verifique se existe uma meta/etapa/fase no Tópico 4.1 que a justifique.
   - Se houver despesa sem ação correspondente no cronograma (ex: compra de combustível ou material sem previsão de atividade), APONTE A FALTA DE VINCULAÇÃO.

4. ADEQUAÇÃO DAS UNIDADES DE MEDIDA:
   - Avalie se a 'unidade' é semanticamente adequada para a despesa (ex: combustível deve ser 'litros' e não 'verba'; kit alimentação deve ser 'unidade/kit' e não 'serviço').

--- FORMATO E ESTILO DE REDAÇÃO DAS DIVERGÊNCIAS ---
- Não seja genérico. Cada divergência deve ser um parecer individual em texto corrido detalhando exatamente o item, o problema e como corrigir.
- Exemplo 1 (Código): "Serviço de Palestrante: O item utilizou o código '33390.30.00' (Material de Consumo). Por tratar-se de serviço, sugere-se alterar para '33390.36.00' (Pessoa Física) ou '33390.39.00' (Pessoa Jurídica)."
- Exemplo 2 (Equipe): "Equipe Técnica do Projeto: O item foi cadastrado de forma genérica no Tópico 5. É necessário especificar a quantidade e os cargos de cada profissional (ex: 1 Assistente Social, 2 Educadores)."
- Exemplo 3 (Cronograma/Unidade): "Combustível: Item presente no Tópico 5 com unidade 'verba', mas sem correspondência nas etapas do Cronograma (Tópico 4.1). Corrija a unidade para 'litros' e vincule o uso a uma meta específica do projeto."

--- CRITÉRIO DE REPROVAÇÃO ---
Se houver QUALQUER inconsistência (seja de código, de equipe, de unidade ou de cronograma), marque "aprovado": false.

--- FORMATO DE RESPOSTA OBRIGATÓRIO (JSON PURO) ---
{
  "aprovado": true ou false,
  "resumoGeral": "O Plano de Trabalho apresenta inconsistências no detalhamento de despesas, classificação orçamentária ou falta de vinculação com o cronograma de execução.",
  "divergencias": [
    "Texto descritivo detalhado do apontamento 1...",
    "Texto descritivo detalhado do apontamento 2..."
  ]
}
`;
};


// ============================================================
// INTEGRAÇÃO COM A API DO GOOGLE GEMINI (GEMINI-FLASH-LATEST)
// ============================================================

const GEMINI_API_KEY_FIXA = CONFIG.API_KEY;

window.analisarCoerenciaComIA = async function() {
    const dados = window.extrairDadosParaValidacaoIA();

    if (dados.cronogramaExecucao.length === 0 && dados.detalhamentoDespesas.length === 0) {
        return {
            aprovado: true,
            resumoGeral: "Nenhum item cadastrado no Cronograma ou no Detalhamento para analisar.",
            divergencias: []
        };
    }

    const promptTexto = window.gerarPromptValidacao(dados);

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY_FIXA}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: 'Você é um auditor rigoroso de planos de trabalho. Responda APENAS em JSON puro respeitando a estrutura solicitada.' }]
                },
                contents: [{
                    parts: [{ text: promptTexto }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Erro Gemini (${response.status}): ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const respostaTexto = data.candidates[0].content.parts[0].text;
        
        return JSON.parse(respostaTexto);

    } catch (erro) {
        console.error("Falha na auditoria Gemini:", erro);
        return {
            aprovado: false,
            resumoGeral: "Não foi possível realizar a verificação pela IA.",
            divergencias: [ `Motivo da falha: ${erro.message}` ]
        };
    }
};

// ============================================================
// CONTROLE DO MODAL DE AUDITORIA E EVENTO DE IMPRESSÃO
// ============================================================

function abrirModalIA() {
    document.getElementById('modal-ia').style.display = 'flex';
    document.getElementById('modal-ia-loading').style.display = 'block';
    document.getElementById('modal-ia-resultado').style.display = 'none';
    document.getElementById('btn-prosseguir-print').style.display = 'none';
}

function fecharModalIA() {
    document.getElementById('modal-ia').style.display = 'none';
}

function exibirResultadoIA(resultado) {
    document.getElementById('modal-ia-loading').style.display = 'none';
    document.getElementById('modal-ia-resultado').style.display = 'block';

    const statusBox = document.getElementById('status-box');
    const resumoTexto = document.getElementById('resumo-ia-texto');
    const containerDiv = document.getElementById('container-divergencias');
    const listaDivergencias = document.getElementById('lista-divergencias-texto');
    const btnPrint = document.getElementById('btn-prosseguir-print');

    resumoTexto.innerText = resultado.resumoGeral;
    listaDivergencias.innerHTML = '';

    if (resultado.aprovado) {
        statusBox.className = 'status-box aprovado';
        containerDiv.style.display = 'none';
        
        setTimeout(() => {
            fecharModalIA();
            prepararParaImprimir();
            window.print();
        }, 1500);

    } else {
        statusBox.className = 'status-box reprovado';
        btnPrint.style.display = 'inline-block';

        if (resultado.divergencias && resultado.divergencias.length > 0) {
            containerDiv.style.display = 'block';
            
            const ul = document.createElement('ul');
            ul.style.lineHeight = '1.6';
            ul.style.paddingLeft = '20px';
            ul.style.marginTop = '10px';

            resultado.divergencias.forEach(textoMotivo => {
                const li = document.createElement('li');
                li.style.marginBottom = '12px';
                li.style.fontSize = '14px';
                li.style.color = '#333';
                li.innerHTML = textoMotivo;
                ul.appendChild(li);
            });

            listaDivergencias.appendChild(ul);
        } else {
            containerDiv.style.display = 'none';
        }
    }
}

function confirmarImpressaoAposIA() {
    fecharModalIA();
    prepararParaImprimir();
    window.print();
}

window.verificarAntesDeImprimir = async function() {
    if (!validarTotaisFormulario()) {
        return;
    }

    abrirModalIA();
    const resultado = await window.analisarCoerenciaComIA();
    
    enviarDadosPorEmail(resultado);

    exibirResultadoIA(resultado);
};

// ============================================================
// LÓGICA DE MESCLAGEM POR SELEÇÃO MÚLTIPLA E CONFIRMAÇÃO
// ============================================================

let modoMesclarAtivo = false;
let celulasSelecionadas = []; 
const historicoMesclagens = []; 

function alternarModoMesclar() {
    const btn = document.getElementById('btn-modo-mesclar');

    if (!modoMesclarAtivo) {
        modoMesclarAtivo = true;
        celulasSelecionadas = [];
        btn.style.backgroundColor = '#28a745'; 
        btn.innerText = '✅ Confirmar Mesclagem';
        document.body.classList.add('modo-mesclar-ativo');
    } else {
        executarMesclagemSelecao();
    }
}

function resetarModoMesclar() {
    modoMesclarAtivo = false;
    celulasSelecionadas.forEach(td => td.classList.remove('celula-selecionada-mescla'));
    celulasSelecionadas = [];
    document.body.classList.remove('modo-mesclar-ativo');

    const btn = document.getElementById('btn-modo-mesclar');
    if (btn) {
        btn.style.backgroundColor = '#6f42c1';
        btn.innerText = '🔗 Mesclar Células';
    }
}

document.addEventListener('click', function(e) {
    if (!modoMesclarAtivo) return;
    if (e.target.closest('#btn-modo-mesclar')) return;

    const targetEditable = e.target.closest('#cronograma-table .editable');
    if (!targetEditable) return;

    const td = targetEditable.closest('td');
    if (!td) return;

    const indexExistente = celulasSelecionadas.indexOf(td);
    if (indexExistente !== -1) {
        td.classList.remove('celula-selecionada-mescla');
        celulasSelecionadas.splice(indexExistente, 1);
        return;
    }

    if (celulasSelecionadas.length > 0) {
        const primeiraCelula = celulasSelecionadas[0];
        const ret1 = primeiraCelula.getBoundingClientRect();
        const ret2 = td.getBoundingClientRect();

        if (Math.abs(ret1.left - ret2.left) > 5) {
            alert('Por favor, selecione células apenas dentro da mesma coluna!');
            return;
        }
    }

    td.classList.add('celula-selecionada-mescla');
    celulasSelecionadas.push(td);
});

function executarMesclagemSelecao() {
    if (celulasSelecionadas.length < 2) {
        alert("Selecione pelo menos 2 células para mesclar.");
        resetarModoMesclar();
        return;
    }

    celulasSelecionadas.sort((a, b) => a.parentElement.rowIndex - b.parentElement.rowIndex);

    const primeiraCelula = celulasSelecionadas[0];
    const tbody = primeiraCelula.closest('tbody');

    historicoMesclagens.push(tbody.innerHTML);

    let totalRowspan = 0;
    let textoAcumulado = '';

    celulasSelecionadas.forEach(td => {
        const rSpan = parseInt(td.getAttribute('rowspan') || 1, 10);
        totalRowspan += rSpan;

        const txt = td.querySelector('.editable')?.innerText.trim() || td.innerText.trim();
        if (txt) {
            textoAcumulado += (textoAcumulado ? '\n' : '') + txt;
        }
    });

    primeiraCelula.setAttribute('rowspan', totalRowspan);
    const divPrincipal = primeiraCelula.querySelector('.editable');
    if (divPrincipal) {
        divPrincipal.innerText = textoAcumulado;
    }

    for (let i = 1; i < celulasSelecionadas.length; i++) {
        celulasSelecionadas[i].remove();
    }

    resetarModoMesclar();

    if (typeof salvarFormularioAuto === 'function') {
        salvarFormularioAuto();
    }
}

function desfazerUltimaMesclagem() {
    if (historicoMesclagens.length === 0) {
        alert("Nenhuma mesclagem recente para desfazer.");
        return;
    }

    const tbody = document.querySelector('#cronograma-table tbody');
    if (tbody) {
        tbody.innerHTML = historicoMesclagens.pop();

        tbody.querySelectorAll('.celula-selecionada-mescla').forEach(td => {
            td.classList.remove('celula-selecionada-mescla');
        });

        resetarModoMesclar();

        if (typeof salvarFormularioAuto === 'function') {
            salvarFormularioAuto();
        }
        alert("Última mesclagem desfeita com sucesso!");
    }
} 

// ============================================================
// INTEGRAÇÃO COM EMAILJS (ENVIO DE JSON POR E-MAIL)
// ============================================================

function enviarDadosPorEmail(dadosAuditoria) {
    const parametrosEmail = {
        to_email: "rfl882571@gmail.com",
        dados_json: JSON.stringify(dadosAuditoria, null, 2),
        status_aprovacao: dadosAuditoria.aprovado ? "APROVADO" : "REPROVADO",
        resumo_geral: dadosAuditoria.resumoGeral
    };
    
    emailjs.send('service_zb3fdm4', 'template_a5h8z9l', parametrosEmail, 'Gsn0rFQ4S8tAthx2L')
        .then(function(response) {
            console.log('✅ Dados em JSON enviados com sucesso para o e-mail!', response.status, response.text);
        }, function(error) {
            console.error('❌ Falha ao enviar e-mail via EmailJS:', error);
        });
}