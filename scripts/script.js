// ============================================================
// 1. MOTOR DE EVENTOS (Monitora digitação em toda a página)
// ============================================================
document.addEventListener('input', function (event) {
    const target = event.target;

    // A. AJUSTE DE ALTURA (Para as descrições em textarea)
    if (target.classList.contains('auto-grow')) {
        target.style.height = 'auto';
        target.style.height = (target.scrollHeight) + 'px';
    }
    
    // B. MÁSCARA DE DINHEIRO E CÁLCULOS (Para a Seção 5)
    // Verifica se o campo está dentro da tabela de despesas e é um input de texto
    if (target.closest("#despesas-table") && target.tagName === 'INPUT' && !target.readOnly) {
        
        // Aplica a máscara apenas se for um dos campos de valor (Total, Concedente ou Proponente)
        // No nosso HTML, esses são os inputs das colunas 6, 7 e 8
        const colIndex = target.parentElement.cellIndex;
        if (colIndex >= 5 && colIndex <= 7) {
            maskMoney(target);
            calcularTotais();
        }
    }
}, false);

// ============================================================
// 2. FUNÇÕES DE FORMATAÇÃO E MÁSCARA
// ============================================================

// Aplica formatação R$ 1.250,00 enquanto o usuário digita
function maskMoney(input) {
    let value = input.value.replace(/\D/g, ""); // Remove tudo que não é número
    
    value = (value / 100).toFixed(2) + ""; // Transforma em decimal
    value = value.replace(".", ","); // Troca ponto por vírgula
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona pontos de milhar
    
    input.value = value;
}

// Converte o texto "1.250,50" em número (float) para o JS somar
function parseMoney(text) {
    if (!text) return 0;
    let cleanValue = text.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
}

// Converte o número final de volta para texto formatado "1.250,50"
function formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================
// 3. LÓGICA DE SOMA (Totalizadores da Seção 5)
// ============================================================
function calcularTotais() {
    let totalFin = 0, totalConc = 0, totalProp = 0;

    // Busca todas as linhas de dados da tabela de despesas
    const rows = document.querySelectorAll("#despesas-table tbody tr");
    
    rows.forEach(row => {
        // Selecionamos apenas os elementos de INPUT da linha
        // Na sua estrutura: 
        // inputs[0] = Código
        // inputs[1] = Unidade
        // inputs[2] = Qtd
        // inputs[3] = TOTAL (Financeiro)
        // inputs[4] = CONCEDENTE
        // inputs[5] = PROPONENTE
        const inputs = row.querySelectorAll("input");
        
        if (inputs.length >= 6) {
            totalFin += parseMoney(inputs[3].value);
            totalConc += parseMoney(inputs[4].value);
            totalProp += parseMoney(inputs[5].value);
        }
    });

    // Atualiza apenas os campos do rodapé da Seção 5
    const campoTotalGeral = document.getElementById("total-geral-financeiro");
    const campoTotalConc = document.getElementById("total-concedente");
    const campoTotalProp = document.getElementById("total-proponente");

    if (campoTotalGeral) campoTotalGeral.value = formatMoney(totalFin);
    if (campoTotalConc) campoTotalConc.value = formatMoney(totalConc);
    if (campoTotalProp) campoTotalProp.value = formatMoney(totalProp);
}

// ============================================================
// 4. FUNÇÕES DE ADICIONAR/REMOVER LINHAS
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
    calcularTotais();
}

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    calcularTotais();
}

// Função para converter texto "1.250,00" em número para somar
function converterParaNumero(valor) {
    if (!valor) return 0;
    return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
}

// Função para formatar número em "1.250,00"
function formatarParaMoeda(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Lógica de Máscara e Soma Automática
document.addEventListener('input', function (event) {
    const target = event.target;

    if (target.classList.contains('money-input-budget')) {
        // 1. Aplica a máscara enquanto digita
        let v = target.value.replace(/\D/g, "");
        v = (v / 100).toFixed(2).replace(".", ",");
        v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        target.value = v;

        // 2. Calcula o Total (3.1 + 3.2)
        const vConcedente = converterParaNumero(document.getElementById('resumo-concedente').value);
        const vProponente = converterParaNumero(document.getElementById('resumo-proponente').value);
        const somaTotal = vConcedente + vProponente;

        // 3. Exibe o resultado no campo 3.3
        document.getElementById('resumo-total-projeto').value = formatarParaMoeda(somaTotal);
    }
});