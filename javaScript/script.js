document.addEventListener('DOMContentLoaded', () => {
    const inputTarefa = document.getElementById('nome-tarefa');
    const inputDescricao = document.getElementById('descricao');
    const inputEtiqueta = document.getElementById('etiqueta');
    const inputData = document.getElementById('data');
    const botaoSalvar = document.querySelector('.salvar');
    const listaTarefas = document.querySelector('.tarefas');

    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    let indiceEdicao = null;

    const salvarTarefas = () => {
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    };

    init();

    async function init() {

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
