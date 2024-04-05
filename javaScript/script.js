document.addEventListener('DOMContentLoaded', () => { // função para carregar o conteúdo da página
    const inputTarefa = document.getElementById('nome-tarefa');
    const inputDescricao = document.getElementById('descricao');
    const inputEtiqueta = document.getElementById('etiqueta');
    const inputData = document.getElementById('data');
    const botaoSalvar = document.querySelector('.salvar');
    const inputRepositorio = document.getElementById('task-repo');
    const listaTarefas = document.querySelector('.tarefas');

    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || []; // variável para armazenar tarefas
    let indiceEdicao = null; // utilizado armazenar o índice da tarefa que está sendo editada

    const salvarTarefas = () => { // função para salvar tarefas no localStorage
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    };

    init(); // Inicio a aplicação

    async function init() { // Função para buscar repositórios do GitHub

        let userName = localStorage.getItem('userName');
        if (userName === null || userName === '') {
            userName = prompt('Digite seu usuário do GitHub:');
            localStorage.setItem('userName', userName);
        }

        await fetchRepositories(userName);
    }

    async function fetchRepositories(userName) {
        try {
            const response = await fetch(`https://api.github.com/users/${userName}/repos`);
            const repos = await response.json();
            const selectElement = document.getElementById('task-repo');
            repos.forEach(repo => {
                let option = document.createElement('option');
                option.value = repo.html_url;
                option.textContent = repo.name;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar repositórios:', error);
        }
    } document.addEventListener('DOMContentLoaded', init);

    async function init() {

        let userName = localStorage.getItem('userName');
        if (userName === null || userName === '') {
            userName = prompt('Digite seu usuário do GitHub:');
            localStorage.setItem('userName', userName);
        }

        await fetchRepositories(userName);
        restoreTasks();
        document.querySelector('.btn-task').addEventListener('click', toggleModal);
        document.querySelector('.btn-close').addEventListener('click', toggleModal);
        document.querySelector('.form-task').addEventListener('submit', addTask);
    }

    async function fetchRepositories(userName) {
        try {
            const response = await fetch(`https://api.github.com/users/${userName}/repos`);
            const repos = await response.json();
            const selectElement = document.getElementById('task-repo');
            repos.forEach(repo => {
                let option = document.createElement('option');
                option.value = repo.html_url;
                option.textContent = repo.name;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao buscar repositórios:', error);
        }
    }

    const funcionalidadesTarefas = () => { // função para exibir funcionalidades na tarefa
        listaTarefas.innerHTML = '<h2>Lista de Tarefas</h2>';
        tarefas.forEach((tarefa, index) => {
            const dataFormatada = new Date(tarefa.data).toLocaleDateString('pt-BR');
            let nomeRepositorio = '';
            if (tarefa.github) {
                const url = new URL(tarefa.github);
                nomeRepositorio = url.pathname.split('/').pop();
            }
            const divTarefa = document.createElement('div');
            divTarefa.className = `tarefa ${tarefa.concluido ? 'concluida' : ''}`;
            divTarefa.innerHTML = `
                <div class="tarefa-info">
                    <h4>${tarefa.nome}</h4>
                    <p>${tarefa.descricao}</p>
                    <div class="etiqueta-data">
                        <span class="etiqueta">
                        <ion-icon name="pricetag-outline"></ion-icon>
                        ${tarefa.etiqueta}</span>
                        <span class="data">
                            <ion-icon name="calendar-outline"></ion-icon>
                        ${dataFormatada}
                        </span>
                        <span class="github">
                            <a href="${tarefa.github}" target="_blank"><ion-icon name="logo-github"></ion-icon> ${nomeRepositorio}</a>
                        </span>
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

    botaoSalvar.addEventListener('click', () => { // função para salvar tarefas
        const tarefaData = {
            nome: inputTarefa.value,
            descricao: inputDescricao.value,
            etiqueta: inputEtiqueta.value,
            data: inputData.value,
            concluido: indiceEdicao !== null ? tarefas[indiceEdicao].concluido : false,
            github: inputRepositorio.value
        };

        if (indiceEdicao !== null) {
            tarefaData.id = tarefas[indiceEdicao].id;
            tarefas[indiceEdicao] = tarefaData;
        } else {
            tarefaData.id = Date.now();
            tarefas.push(tarefaData);
        }

        salvarTarefas();
        funcionalidadesTarefas();

        inputTarefa.value = '';
        inputDescricao.value = '';
        inputEtiqueta.value = '';
        inputData.value = '';
        indiceEdicao = null;
    });

    listaTarefas.addEventListener('click', (event) => { // função para editar, excluir e concluir tarefas
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
            funcionalidadesTarefas();
        } else if (event.target.closest('.concluir')) {
            const index = parseInt(event.target.closest('.concluir').dataset.index);
            tarefas[index].concluido = !tarefas[index].concluido;
            salvarTarefas();
            funcionalidadesTarefas();
        }
    });

    funcionalidadesTarefas();
});
