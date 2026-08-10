// ============================================================
// GERADOR AUTOMÁTICO DE INSERT SQL PARA O MYSQL
// ============================================================

function gerarInsertSQL() {
    // Captura os valores dos inputs da Seção 1 (Entidade Proponente)
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return '';
        return el.value.replace(/'/g, "''"); // Escapa aspas simples para não quebrar o SQL
    };

    const prop_entidade = getVal('prop-entidade');
    const prop_cnpj = getVal('prop-cnpj');
    const prop_endereco = getVal('prop-endereco');
    const prop_cidade = getVal('prop-cidade');
    const prop_uf = getVal('prop-uf') || 'CE';
    const prop_cep = getVal('prop-cep');
    const prop_telefone = getVal('prop-telefone');
    const prop_email = getVal('prop-email');

    const resp_nome = getVal('resp-nome');
    const resp_cpf = getVal('resp-cpf');
    const resp_ci = getVal('resp-ci');
    const resp_cargo = getVal('resp-cargo');
    const resp_funcao = getVal('resp-funcao');
    const resp_matricula = getVal('resp-matricula');
    const resp_endereco_res = getVal('resp-endereco-res');
    const resp_cep_res = getVal('resp-cep-res');

    const coord_nome = getVal('coord-nome');
    const coord_cpf = getVal('coord-cpf');
    const coord_email = getVal('coord-email');
    const coord_fone = getVal('coord-fone');
    const prop_data = getVal('prop-data') || null;

    // Monta a instrução SQL de INSERT
    const sqlQuery = `USE fdid_db;

INSERT INTO entidade_proponente (
    prop_entidade, prop_cnpj, prop_endereco, prop_cidade, prop_uf, prop_cep, prop_telefone, prop_email,
    resp_nome, resp_cpf, resp_ci, resp_cargo, resp_funcao, resp_matricula, resp_endereco_res, resp_cep_res,
    coord_nome, coord_cpf, coord_email, coord_fone, prop_data
) VALUES (
    '${prop_entidade}', '${prop_cnpj}', '${prop_endereco}', '${prop_cidade}', '${prop_uf}', '${prop_cep}', '${prop_telefone}', '${prop_email}',
    '${resp_nome}', '${resp_cpf}', '${resp_ci}', '${resp_cargo}', '${resp_funcao}', '${resp_matricula}', '${resp_endereco_res}', '${resp_cep_res}',
    '${coord_nome}', '${coord_cpf}', '${coord_email}', '${coord_fone}', ${prop_data ? `'${prop_data}'` : 'NULL'}
);`;

    // Exibe o SQL em uma caixa de texto para fácil cópia ou copia direto para o clipboard
    console.log(sqlQuery);
    
    // Cria um elemento temporário para o usuário copiar ou baixar
    navigator.clipboard.writeText(sqlQuery).then(() => {
        alert("Comando SQL gerado e copiado para a área de transferência! Basta colar no MySQL Workbench.");
    }).catch(err => {
        console.error("Erro ao copiar SQL: ", err);
        prompt("Copie o código SQL abaixo:", sqlQuery);
    });
}