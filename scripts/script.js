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
