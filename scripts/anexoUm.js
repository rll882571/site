// ============================================================
// 1. MOTOR DE EVENTOS (Centraliza todas as ações de digitação)
// ============================================================
document.addEventListener('input', function (event) {
    const target = event.target;

    // A. AJUSTE DE ALTURA (Textareas auto-grow)
    if (target.classList.contains('auto-grow')) {
        target.style.height = 'auto';
        target.style.height = (target.scrollHeight) + 'px';
    }

    // B. MÁSCARAS E CÁLCULOS DE MOEDA (Seção 3 e 5)
    if (target.classList.contains('money-input-budget') || target.closest("#despesas-table")) {
        // Se for na tabela de despesas, verificamos as colunas de valor
        if (target.closest("#despesas-table")) {
            const colIndex = target.parentElement.cellIndex;
            if (colIndex >= 5 && colIndex <= 7) {
                maskMoney(target);
                calcularTotaisDespesas();
            }
        } else {
            // Se for o resumo da seção 3
            maskMoney(target);
            calcularResumoOrcamento();
        }
    }

    // C. PÚBLICO ALVO - INTEIROS E SOMA (Seção 18)
    if (target.classList.contains('soma-publico')) {
        target.value = target.value.replace(/[^0-9]/g, ''); // Trava inteiros
        calcularTotalPublico();
    }

    // D. FAIXA ETÁRIA - INTEIROS E SOMA (Seção 19)
    if (target.classList.contains('soma-idade')) {
        target.value = target.value.replace(/[^0-9]/g, ''); // Trava inteiros
        calcularIdades();
    }
}, false);

// ============================================================
// 2. FUNÇÕES DE APOIO (Moeda e Conversão)
// ============================================================

function maskMoney(input) {
    let value = input.value.replace(/\D/g, "");
    value = (value / 100).toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    input.value = value;
}

function parseMoney(text) {
    if (!text) return 0;
    return parseFloat(text.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================
// 3. LÓGICAS DE CÁLCULO ESPECÍFICAS
// ============================================================

// Cálculo da Seção 3.3
function calcularResumoOrcamento() {
    const vConcedente = parseMoney(document.getElementById('resumo-concedente').value);
    const vProponente = parseMoney(document.getElementById('resumo-proponente').value);
    document.getElementById('resumo-total-projeto').value = formatMoney(vConcedente + vProponente);
}

// Cálculo da Seção 5 (Tabela de Despesas)
function calcularTotaisDespesas() {
    let totalFin = 0, totalConc = 0, totalProp = 0;
    const rows = document.querySelectorAll("#despesas-table tbody tr");
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");
        if (inputs.length >= 6) {
            totalFin += parseMoney(inputs[3].value);
            totalConc += parseMoney(inputs[4].value);
            totalProp += parseMoney(inputs[5].value);
        }
    });

    if (document.getElementById("total-geral-financeiro")) 
        document.getElementById("total-geral-financeiro").value = formatMoney(totalFin);
    if (document.getElementById("total-concedente")) 
        document.getElementById("total-concedente").value = formatMoney(totalConc);
    if (document.getElementById("total-proponente")) 
        document.getElementById("total-proponente").value = formatMoney(totalProp);
}

// Cálculo da Seção 18 (Público Geral)
function calcularTotalPublico() {
    let total = 0;
    document.querySelectorAll('.soma-publico').forEach(input => {
        total += parseInt(input.value, 10) || 0;
    });
    const el = document.getElementById('total-publico');
    if (el) el.innerText = total;
}

// Cálculo da Seção 19 (Tabela de Idades Complexa)
function calcularIdades() {
    const somarGrupo = (classe) => {
        let soma = 0;
        document.querySelectorAll(classe).forEach(i => soma += (parseInt(i.value) || 0));
        return soma;
    };

    const tFem = somarGrupo('.idade-fem');
    const tMasc = somarGrupo('.idade-masc');
    const tLgbt = somarGrupo('.idade-lgbt');
    const tNi = somarGrupo('.idade-ni');

    if(document.getElementById('total-fem')) document.getElementById('total-fem').innerText = tFem;
    if(document.getElementById('total-masc')) document.getElementById('total-masc').innerText = tMasc;
    if(document.getElementById('total-lgbt')) document.getElementById('total-lgbt').innerText = tLgbt;
    if(document.getElementById('total-ni')) document.getElementById('total-ni').innerText = tNi;

    const sub1 = tFem + tMasc;
    const sub2 = tLgbt + tNi;
    if(document.getElementById('subtotal-1')) document.getElementById('subtotal-1').innerText = sub1;
    if(document.getElementById('subtotal-2')) document.getElementById('subtotal-2').innerText = sub2;
    if(document.getElementById('total-geral-idades')) document.getElementById('total-geral-idades').innerText = sub1 + sub2;
}

// ============================================================
// 4. MANIPULAÇÃO DE LINHAS (Add/Remove)
// ============================================================

function addRow() {
    const table = document.getElementById("cronograma-table").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><textarea class="auto-grow" rows="1"></textarea></td>
        <td><input type="text"></td>
        <td><input type="number"></td>
        <td><input type="date"></td>
        <td><input type="date"></td>
        <td class="no-print"><button type="button" class="btn-remove" onclick="removeRow(this)">×</button></td>
    `;
}

function addDespesaRow() {
    const table = document.getElementById("despesas-table").getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="00000.00.0"></td>
        <td><textarea class="auto-grow" rows="1"></textarea></td>
        <td><textarea class="auto-grow" rows="1"></textarea></td>
        <td><input type="text" placeholder="MÊS"></td>
        <td><input type="number"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td class="no-print"><button type="button" class="btn-remove" onclick="removeRow(this)">×</button></td>
    `;
    calcularTotaisDespesas();
}

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    calcularTotaisDespesas();
}