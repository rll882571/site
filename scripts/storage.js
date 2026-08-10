// ============================================================
// PERSISTÊNCIA, BACKUP E AUTO-SAVE (storage.js)
// ============================================================

function capturarDadosEstruturados() {
    const backup = {
        camposPorId: {},
        editablesFixos: [],
        tbodyCronogramaHtml: '', 
        tbodyDespesasHtml: '', 
        linhasDespesas: [],
        linhasCronograma: [],
        tabelasDesembolso: []
    };

    // 1. CAPTURA OS DADOS DAS LINHAS DO CRONOGRAMA DE EXECUÇÃO (TÓPICO 4.1)
    document.querySelectorAll('#cronograma-table tbody tr').forEach(row => {
        const meta = row.children[0]?.querySelector('.editable')?.innerText.trim() || '';
        const etapa = row.children[1]?.querySelector('.editable')?.innerText.trim() || '';
        const desc = row.children[2]?.querySelector('.editable')?.innerText.trim() || '';
        const unidade = row.children[3]?.querySelector('input')?.value || '';
        const qtd = row.children[4]?.querySelector('input')?.value || '';
        const inicio = row.children[5]?.querySelector('input')?.value || '';
        const termino = row.children[6]?.querySelector('input')?.value || '';

        backup.linhasCronograma.push({ meta, etapa, desc, unidade, qtd, inicio, termino });
    });

    const tbodyCrono = document.querySelector('#cronograma-table tbody');
    if (tbodyCrono) {
        backup.tbodyCronogramaHtml = tbodyCrono.innerHTML;
    }

    // 2. CAPTURA OS DADOS DOS CRONOGRAMAS DE DESEMBOLSO (TÓPICOS 4.2 e 4.3)
    document.querySelectorAll('.form-section:has(h4) .static-table').forEach((tabela, indexTabela) => {
        tabela.querySelectorAll('tbody tr').forEach((row, indexRow) => {
            const meta = row.querySelector('.editable')?.innerText.trim() || row.querySelector('input')?.value || '';
            const valoresMeses = [];
            
            row.querySelectorAll('input[type="text"]').forEach((inp, idx) => {
                if (idx > 0) {
                    valoresMeses.push(inp.value);
                }
            });

            backup.tabelasDesembolso.push({ indexTabela, indexRow, meta, valoresMeses });
        });
    });

    // 3. CAPTURA OS DADOS DA TABELA DE DESPESAS (TÓPICO 5)
    const tbodyDesp = document.querySelector('#tabela-despesas-unica tbody');
    if (tbodyDesp) {
        backup.tbodyDespesasHtml = tbodyDesp.innerHTML; 
    }

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

    // 4. CAPTURA OS CAMPOS COM ID (ORÇAMENTO E DEMAIS INPUTS)
    document.querySelectorAll("input[id], textarea[id], select[id]").forEach(el => {
        if (el.type === 'checkbox') {
            backup.camposPorId[el.id] = el.checked;
        } else {
            backup.camposPorId[el.id] = el.value;
        }
    });

    return backup;
}

function aplicarDadosEstruturados(dados) {
    if (!dados) return;

    // 1. RESTAURA O CRONOGRAMA DE EXECUÇÃO E SEUS VALORES NAS COLUNAS (4.1)
    const tbodyCrono = document.querySelector('#cronograma-table tbody');
    if (tbodyCrono && dados.tbodyCronogramaHtml) {
        tbodyCrono.innerHTML = dados.tbodyCronogramaHtml;
        
        if (dados.linhasCronograma && dados.linhasCronograma.length > 0) {
            const linhas = tbodyCrono.querySelectorAll('tr');
            dados.linhasCronograma.forEach((item, index) => {
                if (linhas[index]) {
                    const r = linhas[index];
                    if (r.children[3]?.querySelector('input')) r.children[3].querySelector('input').value = item.unidade || '';
                    if (r.children[4]?.querySelector('input')) r.children[4].querySelector('input').value = item.qtd || '';
                    if (r.children[5]?.querySelector('input')) r.children[5].querySelector('input').value = item.inicio || '';
                    if (r.children[6]?.querySelector('input')) r.children[6].querySelector('input').value = item.termino || '';
                }
            });
        }
    }

    // 2. RESTAURA OS DADOS DOS CRONOGRAMAS DE DESEMBOLSO (4.2 e 4.3)
    if (dados.tabelasDesembolso && dados.tabelasDesembolso.length > 0) {
        const tabelasStatic = document.querySelectorAll('.form-section:has(h4) .static-table');
        dados.tabelasDesembolso.forEach(item => {
            const tabela = tabelasStatic[item.indexTabela];
            if (tabela) {
                const row = tabela.querySelectorAll('tbody tr')[item.indexRow];
                if (row) {
                    const divMeta = row.querySelector('.editable');
                    if (divMeta) divMeta.innerText = item.meta;

                    const inputs = row.querySelectorAll('input[type="text"]');
                    let inputIdx = 0;
                    inputs.forEach((inp, idx) => {
                        if (idx > 0 && item.valoresMeses[inputIdx] !== undefined) {
                            inp.value = item.valoresMeses[inputIdx];
                            inputIdx++;
                        }
                    });
                }
            }
        });
    }

    // 3. RESTAURA A TABELA DE DESPESAS (TÓPICO 5) COM DADOS COMPLETOS
    const tbodyDesp = document.querySelector('#tabela-despesas-unica tbody');
    if (tbodyDesp) {
        tbodyDesp.innerHTML = ''; 

        if (dados.linhasDespesas && dados.linhasDespesas.length > 0) {
            dados.linhasDespesas.forEach(item => {
                const newRow = document.createElement('tr');
                newRow.classList.add(item.tipo === 'corrente' ? 'linha-corrente' : 'linha-capital');

                newRow.innerHTML = `
                    <td><input type="text" class="input-codigo-despesa" value="${item.codigo || ''}" placeholder="00000.00.00" readonly style="cursor: pointer; background-color: #fff;" title="Clique para selecionar o código"></td>
                    <td><div class="editable" contenteditable="true" data-placeholder="Descrição da despesa">${item.desc || ''}</div></td>
                    <td><input type="text" value="${item.unid || ''}" placeholder="Unid"></td>
                    <td><input type="text" class="width-day" value="${item.qtd || ''}" placeholder="Qtd"></td>
                    <td><input type="text" class="money-input-despesa" placeholder="0,00" readonly></td>
                    <td><input type="text" class="money-input-despesa valor-conced" value="${item.vConced || '0,00'}" placeholder="0,00"></td>
                    <td><input type="text" class="money-input-despesa valor-propon" value="${item.vPropon || '0,00'}" placeholder="0,00"></td>
                    <td class="no-print coluna-acoes">
                        <button type="button" class="btn-remove" onclick="removeLinhaDespesa(this)">×</button>
                    </td>
                `;

                tbodyDesp.appendChild(newRow);

                newRow.querySelectorAll('input, .editable').forEach(el => {
                    el.addEventListener('input', function() {
                        if (this.classList.contains('money-input-despesa')) {
                            maskMoney(this);
                        }
                        calcularTotaisTabelaDespesas();
                    });
                });
            });
        } else if (dados.tbodyDespesasHtml) {
            tbodyDesp.innerHTML = dados.tbodyDespesasHtml;
        }
    }

    // 4. RESTAURA OS CAMPOS POR ID
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

    calcularTotaisTabelaDespesas();
    calcularTotalOrcamentoResumo();
    prepararParaImprimir();
}

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

function exportarBackup() {
    if (!validarTotaisFormulario()) {
        return;
    }
    const dados = capturarDadosEstruturados();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Backup_Anexo_2_FDID.json");
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