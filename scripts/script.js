// ============================================================
// 1. MOTOR DE EVENTOS GLOBAIS (script.js)...
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
        target.classList.contains('money-input-budget') ||
        target.classList.contains('money-mask') // <-- Linha nova adicionada!
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
        event.preventDefault(); 
        let textoPuro = (event.clipboardData || window.clipboardData).getData('text');
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
// 3. VALIDAÇÕES DE CPF E CNPJ NO BLUR
// ============================================================

document.addEventListener('blur', function (event) {
    if (event.target.classList.contains('cpf-input')) {
        const val = event.target.value.trim();
        if (val !== '' && !validarCPF(val)) {
            alert('CPF inválido! Por favor, digite um número válido.');
        }
    }
}, true);

document.addEventListener('blur', function (event) {
    if (event.target.classList.contains('cnpj-input')) {
        const val = event.target.value.trim();
        if (val !== '' && !validarCNPJ(val)) {
            alert('CNPJ inválido! Por favor, digite um número válido.');
        }
    }
}, true);


// ============================================================
// 4. INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================

window.addEventListener("DOMContentLoaded", function() {
    prepararParaImprimir();
    carregarFormularioAuto();
});

document.addEventListener('click', function (event) {
    if (event.target.id === 'resumo-concedente') {
        alert('Este valor é calculado automaticamente! Por favor, preencha os campos Despesas Correntes e Despesas de Capital logo abaixo.');
    }
    
    if (event.target.id === 'resumo-proponente') {
        alert('Este valor é calculado automaticamente! Por favor, preencha os campos Recursos Financeiros (C1) e Bens/Serviços (C2) logo abaixo.');
    }
});


// ============================================================
// 5. GERENCIAMENTO DA TABELA DINÂMICA (CRONOGRAMA DE EXECUÇÃO)
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
// 6. TABELA 5 - DETALHAMENTO DAS DESPESAS
// ============================================================

function addLinhaUnica(tipo) {
    const tableBody = document.querySelector('#tabela-despesas-unica tbody');
    if (!tableBody) return;

    const newRow = document.createElement('tr');
    newRow.classList.add(tipo === 'corrente' ? 'linha-corrente' : 'linha-capital');

    newRow.innerHTML = `
        <td><input type="text" class="input-codigo-despesa" placeholder="00000.00.00" readonly style="cursor: pointer; background-color: #fff;" title="Clique para selecionar o código"></td>
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


// ============================================================
// 7. LÓGICA DE MESCLAGEM DE CÉLULAS
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
        
        criarBotaoCancelarFlutuante();
    } else {
        executarMesclagemSelecao();
    }
}

function criarBotaoCancelarFlutuante() {
    if (document.getElementById('btn-cancelar-mescla-flutuante')) return;
    
    const container = document.querySelector('.export-container');
    if (!container) return;

    const btnCancela = document.createElement('button');
    btnCancela.id = 'btn-cancelar-mescla-flutuante';
    btnCancela.type = 'button';
    btnCancela.innerText = '❌ Cancelar Mesclagem';
    btnCancela.style.cssText = 'background-color: #dc3545; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 4px; margin-left: 5px; font-weight: bold;';
    btnCancela.onclick = resetarModoMesclar;
    
    container.appendChild(btnCancela);
}

function removerBotaoCancelarFlutuante() {
    const btnCancela = document.getElementById('btn-cancelar-mescla-flutuante');
    if (btnCancela) btnCancela.remove();
}

function resetarModoMesclar() {
    modoMesclarAtivo = false;
    celulasSelecionadas.forEach(td => td.classList.remove('celula-selecionada-mescla'));
    celulasSelecionadas = [];
    document.body.classList.remove('modo-mesclar-ativo');
    removerBotaoCancelarFlutuante();

    const btn = document.getElementById('btn-modo-mesclar');
    if (btn) {
        btn.style.backgroundColor = ''; 
        btn.innerText = '🔗 Mesclar Células';
    }
}

// LISTENER DE CLIQUE PARA AS CÉLULAS (CRONOGRAMA E TABELA DE DESPESAS)
document.addEventListener('click', function(e) {
    if (!modoMesclarAtivo) return;
    
    if (e.target.closest('#btn-modo-mesclar') || e.target.closest('#btn-cancelar-mescla-flutuante')) return;

    const td = e.target.closest('#cronograma-table tbody td:not(.coluna-acoes), #tabela-despesas-unica tbody td:not(.coluna-acoes)');
    
    if (td) {
        const indexExistente = celulasSelecionadas.indexOf(td);
        if (indexExistente !== -1) {
            td.classList.remove('celula-selecionada-mescla');
            celulasSelecionadas.splice(indexExistente, 1);
            return;
        }

        if (celulasSelecionadas.length > 0) {
            const primeiraCelula = celulasSelecionadas[0];
            if (primeiraCelula.closest('table') !== td.closest('table') || primeiraCelula.cellIndex !== td.cellIndex) {
                alert('Por favor, selecione células apenas na mesma tabela e na mesma coluna!');
                return;
            }
        }

        td.classList.add('celula-selecionada-mescla');
        celulasSelecionadas.push(td);
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modoMesclarAtivo) {
        resetarModoMesclar();
    }
});

function executarMesclagemSelecao() {
    if (celulasSelecionadas.length < 2) {
        alert("Selecione pelo menos 2 células para mesclar.");
        resetarModoMesclar();
        return;
    }

    // Ordena as células pela ordem das linhas na tabela
    celulasSelecionadas.sort((a, b) => a.parentElement.rowIndex - b.parentElement.rowIndex);

    const primeiraCelula = celulasSelecionadas[0];
    const tabela = primeiraCelula.closest('table');
    const tbody = primeiraCelula.closest('tbody');

    historicoMesclagens.push({
        idTabela: tabela.id,
        html: tbody.innerHTML
    });

    let totalRowspan = 0;
    
    // Pega APENAS o valor da primeira célula para manter igual, sem juntar textos
    const divPrimeira = primeiraCelula.querySelector('.editable');
    const inputPrimeira = primeiraCelula.querySelector('input');
    let valorPrincipal = '';

    if (divPrimeira) {
        valorPrincipal = divPrimeira.innerText.trim();
    } else if (inputPrimeira) {
        valorPrincipal = inputPrimeira.value.trim();
    } else {
        valorPrincipal = primeiraCelula.innerText.trim();
    }

    celulasSelecionadas.forEach((td, index) => {
        const rSpan = parseInt(td.getAttribute('rowspan') || 1, 10);
        totalRowspan += rSpan;

        // Remove as células excedentes que foram mescladas
        if (index > 0) {
            td.remove();
        }
    });

    // Aplica o rowspan unificado na primeira célula
    primeiraCelula.setAttribute('rowspan', totalRowspan);
    
    // Reaplica o valor único original em vez de somar/concatenar
    const divPrincipal = primeiraCelula.querySelector('.editable');
    const inputPrincipal = primeiraCelula.querySelector('input');

    if (divPrincipal) {
        divPrincipal.innerText = valorPrincipal;
    } else if (inputPrincipal) {
        inputPrincipal.value = valorPrincipal;
    }

    resetarModoMesclar();
    salvarFormularioAuto();
    
    // Se for a tabela de despesas ou orçamento, recalcula os totais
    if (typeof calcularTotaisTabelaDespesas === 'function') {
        calcularTotaisTabelaDespesas();
    }
}

function desfazerUltimaMesclagem() {
    if (historicoMesclagens.length === 0) {
        alert("Nenhuma mesclagem recente para desfazer.");
        return;
    }

    const ultimoEstado = historicoMesclagens.pop();
    const tbody = document.querySelector(`#${ultimoEstado.idTabela} tbody`);
    
    if (tbody) {
        tbody.innerHTML = ultimoEstado.html;
        tbody.querySelectorAll('.celula-selecionada-mescla').forEach(td => {
            td.classList.remove('celula-selecionada-mescla');
        });
        resetarModoMesclar();
        salvarFormularioAuto();
        alert("Última mesclagem desfeita com sucesso!");
    }
}

// ============================================================
// 8. VALIDAÇÃO DE TOTAIS (Resumo vs Detalhamento)
// ============================================================

window.validarTotaisFormulario = function() {
    // Função auxiliar interna para converter string formatada (1.000,00) em número (1000.00)
    const converterParaNumero = (valorString) => {
        if (!valorString) return 0;
        return parseFloat(valorString.replace(/\./g, '').replace(',', '.')) || 0;
    };

    // 1. Coleta os valores digitados/calculados no Tópico 3 (RESUMO)
    const resumoCorrentes = converterParaNumero(document.getElementById('resumo-despesas-correntes')?.value);
    const resumoCapital = converterParaNumero(document.getElementById('resumo-despesas-capital')?.value);
    
    // 2. Coleta os totais calculados automaticamente no Tópico 5 (DETALHAMENTO)
    const detalheCorrentes = converterParaNumero(document.getElementById('total-corrente-geral')?.value);
    const detalheCapital = converterParaNumero(document.getElementById('total-capital-geral')?.value);

    let divergencias = [];

    // 3. Compara os valores
    if (resumoCorrentes !== detalheCorrentes) {
        divergencias.push(`- Despesas Correntes: O resumo informa R$ ${resumoCorrentes.toFixed(2)}, mas o detalhamento soma R$ ${detalheCorrentes.toFixed(2)}.`);
    }

    if (resumoCapital !== detalheCapital) {
        divergencias.push(`- Despesas de Capital: O resumo informa R$ ${resumoCapital.toFixed(2)}, mas o detalhamento soma R$ ${detalheCapital.toFixed(2)}.`);
    }

    // 4. Exibe o aviso, mas deixa você escolher se quer continuar
    if (divergencias.length > 0) {
        const prosseguir = confirm(
            "⚠️ ATENÇÃO: Foram encontradas divergências no formulário!\n\n" + 
            divergencias.join("\n") + 
            "\n\nDeseja prosseguir com a geração do PDF mesmo com os valores divergentes?"
        );
        
        return prosseguir; // Se clicar em OK, gera o PDF. Se clicar em Cancelar, ele para.
    }

    return true;
    };
    // ============================================================
// 9. CRONOGRAMA DE DESEMBOLSO DO CONCEDENTE (TÓPICO 4.2) DINÂMICO
// ============================================================

function addLinhaDesembolsoConcedente(tipo, dadosLinha = null) {
    const tbody1 = document.getElementById('tbody-desembolso-concedente-1');
    const tbody2 = document.getElementById('tbody-desembolso-concedente-2');
    if (!tbody1 || !tbody2) return;

    const rotuloTipo = tipo === 'corrente' ? 'Corrente' : 'Capital';
    const idUnico = 'desemp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const metaTexto = dadosLinha && dadosLinha.meta ? dadosLinha.meta : '';

    // 1. Cria a linha da Tabela 1 (Mês 01 a 06)
    const row1 = document.createElement('tr');
    row1.setAttribute('data-id-vinculo', idUnico);
    row1.classList.add(tipo === 'corrente' ? 'linha-corrente' : 'linha-capital');

    row1.innerHTML = `
        <td>${rotuloTipo}</td>
        <td><div class="editable meta-desembolso" contenteditable="true" data-placeholder="Meta">${metaTexto}</div></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[0] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[1] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[2] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[3] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[4] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[5] || '') : ''}"></td>
        <td class="no-print coluna-acoes">
            <button type="button" class="btn-remove" onclick="removeLinhaDesembolsoConcedente('${idUnico}')">×</button>
        </td>
    `;

    // 2. Cria a linha da Tabela 2 (Mês 07 a 12)
    const row2 = document.createElement('tr');
    row2.setAttribute('data-id-vinculo', idUnico);
    row2.classList.add(tipo === 'corrente' ? 'linha-corrente' : 'linha-capital');

    row2.innerHTML = `
        <td>${rotuloTipo}</td>
        <td><div class="editable meta-desembolso" contenteditable="true" data-placeholder="Meta">${metaTexto}</div></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[6] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[7] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[8] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[9] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[10] || '') : ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${dadosLinha && dadosLinha.meses ? (dadosLinha.meses[11] || '') : ''}"></td>
        <td class="no-print coluna-acoes">
            <button type="button" class="btn-remove" onclick="removeLinhaDesembolsoConcedente('${idUnico}')">×</button>
        </td>
    `;

    // Sincronização em tempo real e salvamento automático ao digitar na Meta
    const divMeta1 = row1.querySelector('.meta-desembolso');
    const divMeta2 = row2.querySelector('.meta-desembolso');

    divMeta1.addEventListener('input', () => {
        divMeta2.innerText = divMeta1.innerText;
        salvarFormularioAuto();
    });

    divMeta2.addEventListener('input', () => {
        divMeta1.innerText = divMeta2.innerText;
        salvarFormularioAuto();
    });

    tbody1.appendChild(row1);
    tbody2.appendChild(row2);

    if (!dadosLinha) {
        salvarFormularioAuto();
    }
}

function removeLinhaDesembolsoConcedente(idVinculo) {
    const linhas = document.querySelectorAll(`tr[data-id-vinculo="${idVinculo}"]`);
    linhas.forEach(row => row.remove());
    salvarFormularioAuto();
}

// ============================================================
// CRONOGRAMA DE DESEMBOLSO DO CONCEDENTE (TÓPICO 4.2) INDEPENDENTE
// ============================================================

function addLinhaTabelaUnica(idTabelaAlvo, tipo, dadosLinha = null) {
    const tabela = document.getElementById(idTabelaAlvo);
    if (!tabela) return;
    const tbody = tabela.querySelector('tbody');
    if (!tbody) return;

    const rotuloTipo = tipo === 'corrente' ? 'Corrente' : 'Capital';
    const metaTexto = dadosLinha && dadosLinha.meta ? dadosLinha.meta : '';
    const mesesValores = dadosLinha && dadosLinha.meses ? dadosLinha.meses : Array(6).fill('');

    const row = document.createElement('tr');
    row.classList.add(tipo === 'corrente' ? 'linha-corrente' : 'linha-capital');

    row.innerHTML = `
        <td>${rotuloTipo}</td>
        <td><div class="editable meta-desembolso" contenteditable="true" data-placeholder="Meta">${metaTexto}</div></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${mesesValores[0] || ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${mesesValores[1] || ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${mesesValores[2] || ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${mesesValores[3] || ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${mesesValores[4] || ''}"></td>
        <td><input type="text" class="money-mask" placeholder="0,00" value="${mesesValores[5] || ''}"></td>
        <td class="no-print coluna-acoes">
            <button type="button" class="btn-remove" onclick="removeLinhaUnicaDesembolso(this)">×</button>
        </td>
    `;

    tbody.appendChild(row);

    if (!dadosLinha && typeof salvarFormularioAuto === 'function') {
        salvarFormularioAuto();
    }
}

function removeLinhaUnicaDesembolso(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
        if (typeof salvarFormularioAuto === 'function') {
            salvarFormularioAuto();
        }
    }
}