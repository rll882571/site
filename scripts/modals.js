// ============================================================
// MODAIS, AUDITORIA DE IA E SELEÇÃO DE CÓDIGOS (modals.js)
// ============================================================


let inputCodigoAtivo = null;

function criarModalCodigosDOM() {
    if (document.getElementById('modal-escolha-codigos')) return;

    const modalDiv = document.createElement('div');
    modalDiv.id = 'modal-escolha-codigos';
    modalDiv.className = 'modal-codigos-overlay no-print';
    modalDiv.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9999; justify-content: center; align-items: center;';
    
    modalDiv.innerHTML = `
        <div class="modal-codigos-content" style="background: #fff; padding: 20px; border-radius: 8px; width: 480px; max-width: 90%; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;">
            <h3 id="titulo-modal-codigos" style="margin-top: 0; font-size: 16px; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 8px;">Selecione o Código Válido</h3>
            <div id="lista-opcoes-codigos" class="lista-codigos-grid" style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; margin: 15px 0; padding-right: 5px;"></div>
            <button type="button" class="btn-fechar-modal-codigos" onclick="fecharModalCodigos()" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; float: right; font-size: 13px;">Cancelar</button>
            <div style="clear: both;"></div>
        </div>
    `;
    document.body.appendChild(modalDiv);
}

window.addEventListener('DOMContentLoaded', criarModalCodigosDOM);

function abrirModalCodigos(inputEl) {
    inputCodigoAtivo = inputEl;
    const row = inputEl.closest('tr');
    if (!row) return;

    const ehCorrente = row.classList.contains('linha-corrente');
    const tit = document.getElementById('titulo-modal-codigos');
    const container = document.getElementById('lista-opcoes-codigos');
    container.innerHTML = '';

    const criarBotaoOpcao = (cod, desc) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-opcao-codigo';
        btn.style.cssText = 'background: #f8f9fa; border: 1px solid #ced4da; padding: 10px 12px; text-align: left; border-radius: 4px; cursor: pointer; font-size: 13px; color: #333; display: flex; flex-direction: column; gap: 2px;';
        btn.innerHTML = `<span style="font-weight: bold; font-size: 14px; color: #0056b3;">${cod}</span><span style="font-size: 12px; color: #666;">${desc}</span>`;
        btn.onmouseover = () => { btn.style.background = '#007bff'; btn.style.color = '#fff'; };
        btn.onmouseout = () => { btn.style.background = '#f8f9fa'; btn.style.color = '#333'; };
        btn.onclick = () => selecionarCodigoModal(cod);
        return btn;
    };

    if (ehCorrente) {
        tit.innerText = "Selecione o Código de Despesa Corrente:";
        CODIGOS_DESPESAS_CORRENTES.forEach(cod => {
            container.appendChild(criarBotaoOpcao(cod, DESCRICOES_CODIGOS_CORRENTES[cod]));
        });
    } else {
        tit.innerText = "Selecione o Código de Despesa de Capital:";
        CODIGOS_DESPESAS_CAPITAL.forEach(cod => {
            container.appendChild(criarBotaoOpcao(cod, DESCRICOES_CODIGOS_CAPITAL[cod]));
        });
    }

    document.getElementById('modal-escolha-codigos').style.display = 'flex';
}

function fecharModalCodigos() {
    const modal = document.getElementById('modal-escolha-codigos');
    if (modal) modal.style.display = 'none';
    inputCodigoAtivo = null;
}

function selecionarCodigoModal(codigo) {
    if (inputCodigoAtivo) {
        inputCodigoAtivo.value = codigo;
        calcularTotaisTabelaDespesas();
        salvarFormularioAuto();
    }
    fecharModalCodigos();
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('input-codigo-despesa')) {
        abrirModalCodigos(event.target);
    }
});

// Auditoria IA
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
            dadosTopico4.push({ meta: ultimaMeta, etapa: ultimaEtapa, descricao, unidade, quantidade });
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

    return { cronogramaExecucao: dadosTopico4, detalhamentoDespesas: dadosTopico5 };
};

window.gerarPromptValidacao = function(dadosExtraidos) {
    return `
Você é um auditor sênior especialista em análise crítica de convênios e planos de trabalho públicos.
Sua missão é emitir um parecer técnico minucioso cobrindo TODAS as inconsistências encontradas entre o Detalhamento de Despesas (Tópico 5) e o Cronograma de Execução (Tópico 4.1).

--- DADOS PARA ANÁLISE ---
${JSON.stringify(dadosExtraidos, null, 2)}

--- FORMATO DE RESPOSTA OBRIGATÓRIO (JSON PURO) ---
{
  "aprovado": true ou false,
  "resumoGeral": "O Plano de Trabalho apresenta inconsistências...",
  "divergencias": ["Texto descritivo..."]
}
`;
};

const GEMINI_API_KEY_FIXA = (typeof CONFIG !== 'undefined' && CONFIG.API_KEY) ? CONFIG.API_KEY : '';

window.analisarCoerenciaComIA = async function() {
    const dados = window.extrairDadosParaValidacaoIA();

    if (dados.cronogramaExecucao.length === 0 && dados.detalhamentoDespesas.length === 0) {
        return { aprovado: true, resumoGeral: "Nenhum item cadastrado para analisar.", divergencias: [] };
    }

    const promptTexto = window.gerarPromptValidacao(dados);

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY_FIXA}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: 'Você é um auditor rigoroso de planos de trabalho. Responda APENAS em JSON puro.' }] },
                contents: [{ parts: [{ text: promptTexto }] }],
                generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Erro Gemini (${response.status}): ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);

    } catch (erro) {
        console.error("Falha na auditoria Gemini:", erro);
        return { aprovado: false, resumoGeral: "Não foi possível realizar a verificação pela IA.", divergencias: [ `Motivo da falha: ${erro.message}` ] };
    }
};

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
    if (!validarTotaisFormulario()) return;
    abrirModalIA();
    const resultado = await window.analisarCoerenciaComIA();
    enviarDadosPorEmail(resultado);
    exibirResultadoIA(resultado);
};

function enviarDadosPorEmail(dadosAuditoria) {
    if (typeof emailjs === 'undefined') return;
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