// ============================================================
// 1. MOTOR DE EVENTOS (Monitora digitação em toda a página)
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

        // Colunas financeiras
        if (colIndex >= 5) {
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

}, false);


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
// 3. CÁLCULO DOS TOTAIS
// ============================================================

function calcularTotaisUnificados() {
    let corr = { t: 0, c: 0, p: 0 };
    let cap = { t: 0, c: 0, p: 0 };

    const rows = document.querySelectorAll("#tabela-despesas-unica tbody tr");

    rows.forEach(row => {
        const tipo = row.getAttribute("data-tipo");

        const totalInput = row.cells[5]?.querySelector("input");
        const concedInput = row.cells[6]?.querySelector("input");
        const proponInput = row.cells[7]?.querySelector("input");

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
    const table = document.getElementById("cronograma-table")
        .getElementsByTagName('tbody')[0];

    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><textarea class="auto-grow" rows="1"></textarea></td>
        <td><input type="text"></td>
        <td><input type="number"></td>
        <td><input type="date"></td>
        <td><input type="date"></td>
        <td class="no-print">
            <button type="button" class="btn-remove" onclick="removeRow(this)">×</button>
        </td>
    `;
}


// ============================================================
// 5. ADICIONAR LINHAS DE DESPESAS (MODIFICADO)
// ============================================================

function addLinhaUnica(tipo) {
    const tableBody = document.querySelector("#tabela-despesas-unica tbody");
    const newRow = tableBody.insertRow();

    newRow.setAttribute("data-tipo", tipo);

    // AQUI ESTÁ A MUDANÇA
    if (tipo === 'corrente') {
        newRow.classList.add('linha-corrente');
    }

    if (tipo === 'capital') {
        newRow.classList.add('linha-capital');
    }

    newRow.innerHTML = `
        <td><input type="text" placeholder="00000.00.0"></td>
        <td><textarea class="auto-grow" rows="1"></textarea></td>
        <td><textarea class="auto-grow" rows="1"></textarea></td>
        <td><input type="text" placeholder="UN"></td>
        <td><input type="number"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td><input type="text" placeholder="0,00"></td>
        <td class="no-print">
            <button type="button" class="btn-remove" onclick="removeRow(this)">×</button>
        </td>
    `;

    calcularTotaisUnificados();
}


// ============================================================
// 6. REMOVER LINHAS
// ============================================================

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.remove();
    calcularTotaisUnificados();
}