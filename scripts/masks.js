// ============================================================
// MÁSCARAS E VALIDAÇÕES DE INPUTS (masks.js)
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

function maskCEP(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    input.value = value;
}

function maskCPF(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    input.value = value;
}

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
// ============================================================
// CONSULTA AUTOMÁTICA DE CNPJ (BrasilAPI)
// ============================================================

async function consultarCNPJAutomatico(inputCnpjEl) {
    let cnpjLimpo = inputCnpjEl.value.replace(/\D/g, "");
    
    if (cnpjLimpo.length !== 14) return;

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
        if (!response.ok) throw new Error("CNPJ não encontrado na base de dados.");

        const dados = await response.json();

        // Preenche automaticamente os campos correspondentes no formulário, se existirem
        const inputEntidade = document.getElementById('prop-entidade');
        if (inputEntidade && !inputEntidade.value) {
            inputEntidade.value = dados.razao_social || dados.nome_fantasia || '';
        }

        const inputEndereco = document.getElementById('prop-endereco');
        if (inputEndereco && !inputEndereco.value) {
            let logradouro = dados.logradouro ? `${dados.tipo_logradouro || ''} ${dados.logradouro}`.trim() : '';
            let numero = dados.numero ? `, ${dados.numero}` : '';
            let bairro = dados.bairro ? ` - ${dados.bairro}` : '';
            inputEndereco.value = `${logradouro}${numero}${bairro}`;
        }

        const inputCidade = document.getElementById('prop-cidade');
        if (inputCidade && !inputCidade.value) {
            inputCidade.value = dados.municipio || '';
        }

        const inputCep = document.getElementById('prop-cep');
        if (inputCep && !inputCep.value && dados.cep) {
            inputCep.value = dados.cep.replace(/^(\d{5})(\d{3})/, "$1-$2");
        }

        const inputEmail = document.getElementById('prop-email');
        if (inputEmail && !inputEmail.value && dados.email) {
            inputEmail.value = dados.email;
        }

        const inputTelefone = document.getElementById('prop-telefone');
        if (inputTelefone && !inputTelefone.value && dados.ddd_telefone_1) {
            inputTelefone.value = dados.ddd_telefone_1;
        }

        // Dispara o salvamento automático para persistir os dados preenchidos
        if (typeof salvarFormularioAuto === 'function') {
            salvarFormularioAuto();
        }

    } catch (erro) {
        console.error("Erro na consulta do CNPJ:", erro);
    }
}

// Ouve o evento de "blur" (quando o usuário sai do campo de CNPJ) para disparar a busca
document.addEventListener('blur', function (event) {
    if (event.target.classList.contains('cnpj-input') && event.target.id === 'prop-cnpj') {
        consultarCNPJAutomatico(event.target);
    }
}, true);