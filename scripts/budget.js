// ============================================================
// CÁLCULOS E ORÇAMENTO (budget.js)
// ============================================================

function calcularTotalOrcamentoResumo() {
    const inputs = document.querySelectorAll('.budget-grid .money-input-budget');
    if (inputs.length < 6) return;

    const inputConcedente = inputs[0]; 
    const inputCorrente = inputs[1];   
    const inputCapital = inputs[2];    

    const inputProponente = inputs[3]; 
    const inputC1 = inputs[4];         
    const inputC2 = inputs[5];         

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

    const totalConcedente = parseValor(inputCorrente.value) + parseValor(inputCapital.value);
    inputConcedente.value = formatarMoeda(totalConcedente);

    const totalProponente = parseValor(inputC1.value) + parseValor(inputC2.value);
    inputProponente.value = formatarMoeda(totalProponente);

    const totalGeral = totalConcedente + totalProponente;
    if (inputTotal) {
        inputTotal.value = formatarMoeda(totalGeral);
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