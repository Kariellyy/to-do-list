document.addEventListener('DOMContentLoaded', () => {
    const inputTarefa = document.getElementById('nome-tarefa');
    const inputDescricao = document.getElementById('descricao');
    const inputEtiqueta = document.getElementById('etiqueta');
    const inputData = document.getElementById('data');
    const botaoSalvar = document.querySelector('.salvar');
    const listaTarefas = document.querySelector('.tarefas');

    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    let indiceEdicao = null;

    verificarAutenticacao();

    const salvarTarefas = () => {
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    };

    const url = 'https://api.todoist.com/rest/v2/tasks';
    let accessToken = null;
    let isAuthenticated = false;

    function solicitarAutorizacaoOAuth() {
        const clientID = '034ca46d4e4e4135bbbd7ba5b4df91f7';
        const scope1 = 'task:add';
        const scope2 = 'data:delete';
        const scope3 = 'data:read';
        const scope4 = 'data:read_write';
        const scope = `${scope1},${scope2},${scope3},${scope4}`;
        const state = '78678868685856';

        const urlAutorizacao = `https://todoist.com/oauth/authorize?client_id=${clientID}&scope=${scope}&state=${state}`;

        window.location.href = urlAutorizacao;
    }

    async function trocarCodigoPorAccessToken(codigo) {
        const clientID = '034ca46d4e4e4135bbbd7ba5b4df91f7';
        const clientSecret = '37de435e4c254a10a167e4f3b2d82efa';
        const redirectURI = 'https://ifpi-picos.github.io/js-dom-api-Kariellyy/';

        const urlTrocaToken = 'https://todoist.com/oauth/access_token';

        const parametros = {
            client_id: clientID,
            client_secret: clientSecret,
            code: codigo,
            redirect_uri: redirectURI
        };

        try {
            const resposta = await fetch(urlTrocaToken, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(parametros)
            });

            if (!resposta.ok) {
                throw new Error('Erro ao trocar código por token de acesso');
            }

            const dados = await resposta.json();
            accessToken = dados.access_token;
            isAuthenticated = true;

            localStorage.setItem('accessToken', accessToken);

            console.log('Token de acesso obtido:', accessToken);
        } catch (erro) {
            console.error('Ocorreu um erro ao trocar código por token de acesso:', erro);
        }
    }

    function verificarAutenticacao() {
        const urlAtual = new URL(window.location.href);
        const codigo = urlAtual.searchParams.get('code');

        if (codigo) {
            trocarCodigoPorAccessToken(codigo);
        } else {
            alert('Usuário não autenticado. Redirecionando para a página de autenticação para logar no Todoist.');
            solicitarAutorizacaoOAuth();
        }
    }

    async function fazerChamadaAPI(url, options) {
        if (!isAuthenticated) {
            console.error('Usuário não autenticado');
            return;
        }

        options.headers.Authorization = `Bearer ${accessToken}`;

        try {
            const resposta = await fetch(url, options);
            return resposta.json();
        } catch (erro) {
            console.error('Ocorreu um erro ao fazer chamada à API:', erro);
        }
    }

    const renderizarTarefas = () => {
        listaTarefas.innerHTML = '<h2>Lista de Tarefas</h2>';
        tarefas.forEach((tarefa, index) => {
            const divTarefa = document.createElement('div');
            divTarefa.className = `tarefa ${tarefa.concluido ? 'concluida' : ''}`;
            divTarefa.innerHTML = `
                <div class="tarefa-info">
                    <h3>${tarefa.nome}</h3>
                    <p>${tarefa.descricao}</p>
                    <div class="etiqueta-data">
                        <ion-icon class="etiqueta" name="pricetag-outline"></ion-icon> ${tarefa.etiqueta}
                        <ion-icon class="data" name="calendar-outline"></ion-icon> ${tarefa.data}
                    </div>
                </div>
                <div class="tarefa-actions">
                    <button class="editar" data-index="${index}"><ion-icon name="create-outline"></ion-icon></button>
                    <button class="excluir" data-index="${index}"><ion-icon name="trash-outline"></ion-icon></button>
                    <button class="concluir" data-index="${index}"><ion-icon name="${tarefa.concluido ? 'close' : 'checkmark'}-outline"></ion-icon></button>
                </div>
            `;
            listaTarefas.appendChild(divTarefa);
        });
    };

    botaoSalvar.addEventListener('click', () => {
        const tarefaData = {
            nome: inputTarefa.value,
            descricao: inputDescricao.value,
            etiqueta: inputEtiqueta.value,
            data: inputData.value,
            concluido: indiceEdicao !== null ? tarefas[indiceEdicao].concluido : false
        };

        if (indiceEdicao !== null) {
            tarefaData.id = tarefas[indiceEdicao].id;
            tarefas[indiceEdicao] = tarefaData;
        } else {
            tarefaData.id = Date.now();
            tarefas.push(tarefaData);
        }

        salvarTarefas();
        renderizarTarefas();

        inputTarefa.value = '';
        inputDescricao.value = '';
        inputEtiqueta.value = '';
        inputData.value = '';
        indiceEdicao = null;
    });

    listaTarefas.addEventListener('click', (event) => {
        if (event.target.closest('.editar')) {
            indiceEdicao = parseInt(event.target.closest('.editar').dataset.index);
            const tarefa = tarefas[indiceEdicao];
            inputTarefa.value = tarefa.nome;
            inputDescricao.value = tarefa.descricao;
            inputEtiqueta.value = tarefa.etiqueta;
            inputData.value = tarefa.data;
        } else if (event.target.closest('.excluir')) {
            const index = parseInt(event.target.closest('.excluir').dataset.index);
            tarefas.splice(index, 1);
            salvarTarefas();
            renderizarTarefas();
        } else if (event.target.closest('.concluir')) {
            const index = parseInt(event.target.closest('.concluir').dataset.index);
            tarefas[index].concluido = !tarefas[index].concluido;
            salvarTarefas();
            renderizarTarefas();
        }
    });

    renderizarTarefas();
});
