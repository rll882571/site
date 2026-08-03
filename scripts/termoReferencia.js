// ============================================================
// 1. MOTOR DE EVENTOS E CÁLCULOS
// ============================================================
document.addEventListener('input', function (event) {
    const target = event.target;

    // A. AUTO-GROW DE TEXTAREAS NA DIGITAÇÃO
    if (target.tagName === 'TEXTAREA' && (target.classList.contains('auto-grow') || target.classList.contains('textarea-projeto'))) {
        ajustarAlturaTextarea(target);
    }

    // B. MÁSCARA E CÁLCULO DE MOEDA
    if (target.classList.contains('currency-contrapartida') || target.classList.contains('currency-fdid')) {
        maskMoney(target);
        calcularValoresItem();
    }

    // C. MÁSCARA E CÁLCULO DA MÉDIA (ORÇAMENTO DETALHADO)
    if (target.classList.contains('currency-cotacao')) {
        maskMoney(target);
        calcularMediaOrcamento();
    }

    // SALVAMENTO AUTOMÁTICO AO DIGITAR
    salvarFormularioAuto();
}, false);

// MONITOR DE ALTERAÇÕES EM CAMPOS
document.addEventListener('change', function (event) {
    if (event.target.tagName === 'SELECT' || event.target.tagName === 'INPUT') {
        salvarFormularioAuto();
    }
});


// ============================================================
// 2. FUNÇÕES DE AJUSTE DE ALTURA PARA IMPRESSÃO
// ============================================================

function ajustarAlturaTextarea(el) {
    el.style.height = 'auto';
    if (el.classList.contains('input-table-textarea')) {
        el.style.height = (el.scrollHeight > 20 ? el.scrollHeight : 20) + 'px';
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
// 3. MÁSCARAS E CÁLCULOS FINANCEIROS
// ============================================================

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

function parseMoneyToFloat(valueStr) {
    if (!valueStr) return 0;
    let limpo = valueStr.replace(/\./g, "").replace(",", ".");
    let num = parseFloat(limpo);
    return isNaN(num) ? 0 : num;
}

function floatToMoney(num) {
    let value = num.toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return value;
}

function calcularValoresItem() {
    const inputContra = document.querySelector('.currency-contrapartida');
    const inputFdid = document.querySelector('.currency-fdid');
    const inputTotal = document.querySelector('.currency-total');

    const subC1 = document.querySelector('.subtotal-c1');
    const subFdid = document.querySelector('.subtotal-fdid');
    const subGeral = document.querySelector('.subtotal-geral');

    const valContra = parseMoneyToFloat(inputContra ? inputContra.value : "0");
    const valFdid = parseMoneyToFloat(inputFdid ? inputFdid.value : "0");
    const totalItem = valContra + valFdid;

    if (inputTotal) inputTotal.value = floatToMoney(totalItem);

    // Atualiza subtotais da seção 1.2
    if (subC1) subC1.value = floatToMoney(valContra);
    if (subFdid) subFdid.value = floatToMoney(valFdid);
    if (subGeral) subGeral.value = floatToMoney(totalItem);
}


// ============================================================
// CÁLCULO DA MÉDIA DO ORÇAMENTO DETALHADO (SEÇÃO 7)
// ============================================================

function calcularMediaOrcamento() {
    const inputsCotacao = document.querySelectorAll('.currency-cotacao');
    const inputMedia = document.querySelector('.currency-media');
    
    if (!inputMedia) return;

    let soma = 0;
    let quantidadeValidas = 0;

    inputsCotacao.forEach(input => {
        const valor = parseMoneyToFloat(input.value);
        if (valor > 0) {
            soma += valor;
            quantidadeValidas++;
        }
    });

    if (quantidadeValidas > 0) {
        let media = soma / quantidadeValidas;
        inputMedia.value = floatToMoney(media);
    } else {
        inputMedia.value = "0,00";
    }
}


// ============================================================
// 3.1. VALIDAÇÃO AUTOMÁTICA DE COTAÇÕES MÚLTIPLAS (PDF + GEMINI)
// ============================================================

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Vetor para armazenar os valores extraídos de cada um dos 3 PDFs
let valoresPdfArmazenados = [0, 0, 0];

// Função que processa o PDF individual e guarda o valor na posição certa (0, 1 ou 2)
async function guardarCotacaoPdf(input, indice) {
    const file = input.files[0];
    const statusDiv = document.getElementById('status-validacao-pdf');
    if (!file) return;

    statusDiv.style.display = "block";
    statusDiv.innerHTML = `Lendo Orçamento ${indice + 1}...`;
    statusDiv.style.color = "#007bff";

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const base64Image = canvas.toDataURL('image/png').split(',')[1];

        const apiKey = CONFIG.API_KEY; 
        // URL ajustada para o modelo correto gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const promptAnalise = `
Analise esta imagem de um documento de cotação de compras públicas.
Identifique o PREÇO UNITÁRIO FINAL ou o valor principal do produto em destaque.
Retorne a resposta EXATAMENTE em formato JSON puro, sem blocos de código markdown, contendo apenas:
{
  "valorEncontrado": 0.00
}
onde "valorEncontrado" é um número float (ex: 3266.00). Se não identificar, retorne 0.
`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { inline_data: { mime_type: "image/png", data: base64Image } },
                        { text: promptAnalise }
                    ]
                }],
                generationConfig: { 
                    temperature: 0.1
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API do Gemini: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("A IA não retornou nenhuma resposta válida.");
        }

        const textoResposta = data.candidates[0].content.parts[0].text;
        const jsonLimpo = textoResposta.replace(/```json/g, '').replace(/```/g, '').trim();
        const resultadoJson = JSON.parse(jsonLimpo);
        
        valoresPdfArmazenados[indice] = parseFloat(resultadoJson.valorEncontrado) || 0;

        statusDiv.innerHTML = `✅ Orçamento ${indice + 1} carregado (R$ ${floatToMoney(valoresPdfArmazenados[indice])})`;
        statusDiv.style.color = "#28a745";

    } catch (err) {
        console.error(err);
        statusDiv.innerHTML = `❌ Erro ao ler Orçamento ${indice + 1}.`;
        statusDiv.style.color = "#dc3545";
    }
}

// Função disparada pelo botão "Conferir Média Geral"
function compararMediaComTabela() {
    const statusDiv = document.getElementById('status-validacao-pdf');
    statusDiv.style.display = "block";

    // Verifica se os 3 orçamentos foram carregados
    if (valoresPdfArmazenados.some(val => val <= 0)) {
        statusDiv.innerHTML = "⚠️ Envie os 3 arquivos de orçamento primeiro!";
        statusDiv.style.color = "#ffc107";
        return;
    }

    // Calcula a média dos 3 valores obtidos pela IA
    const somaPdfs = valoresPdfArmazenados.reduce((acc, curr) => acc + curr, 0);
    const mediaPdfs = somaPdfs / 3;

    // Pega o valor da média digitado na tabela do formulário (Seção 7)
    const inputMediaTabela = document.querySelector('.currency-media');
    const mediaTabela = parseMoneyToFloat(inputMediaTabela ? inputMediaTabela.value : "0");

    let compativel = Math.abs(mediaTabela - mediaPdfs) < 0.01;

    if (compativel) {
        statusDiv.innerHTML = `✅ Média Compatível!<br>R$ ${floatToMoney(mediaPdfs)}`;
        statusDiv.style.color = "#28a745";
    } else {
        statusDiv.innerHTML = `❌ Média Divergente!<br>IA indica média de R$ ${floatToMoney(mediaPdfs)}`;
        statusDiv.style.color = "#dc3545";
    }
}


// ============================================================
// 4. MOTOR DE PERSISTÊNCIA (BACKUP JSON E LOCALSTORAGE)
// ============================================================

function capturarDadosEstruturados() {
    const backup = {
        inputsFixos: [],
        selectsFixos: [],
        textareasFixas: []
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

    calcularValoresItem();
    calcularMediaOrcamento();
    prepararParaImprimir();
}

function salvarFormularioAuto() {
    const dados = capturarDadosEstruturados();
    localStorage.setItem("TermoReferenciaFDID_v1", JSON.stringify(dados));
}

function carregarFormularioAuto() {
    const localData = localStorage.getItem("TermoReferenciaFDID_v1");
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
    downloadAnchor.setAttribute("download", "Backup_Termo_Referencia_FDID.json");
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
            alert("Backup do Termo de Referência carregado com sucesso!");
        } catch (err) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function novoPlano() {
    if (confirm("Atenção: Deseja limpar todas as informações preenchidas neste formulário?")) {
        localStorage.removeItem("TermoReferenciaFDID_v1");
        window.location.reload();
    }
}

window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('textarea.auto-grow').forEach(function(el) {
        ajustarAlturaTextarea(el);
    });
    prepararParaImprimir();
    carregarFormularioAuto();
    calcularValoresItem();
    calcularMediaOrcamento();
});