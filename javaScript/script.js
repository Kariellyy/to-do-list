document.addEventListener('DOMContentLoaded', () => {
    const inputTarefa = document.getElementById('nome-tarefa');
    const inputDescricao = document.getElementById('descricao');
    const inputEtiqueta = document.getElementById('etiqueta');
    const inputData = document.getElementById('data');
    const botaoSalvar = document.querySelector('.salvar');
    const listaTarefas = document.querySelector('.tarefas');

    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    let indiceEdicao = null; // Adicionado para rastrear se estamos editando

    const salvarTarefas = () => {
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    };

    const renderizarTarefas = () => {
        listaTarefas.innerHTML = '<h2>Lista de Tarefas</h2>';
        tarefas.forEach((tarefa, index) => {
            const divTarefa = document.createElement('div');
            divTarefa.className = 'tarefa';
            divTarefa.innerHTML = `
                <div class="tarefa-info">
                    <h3>${tarefa.nome}</h3>
                    <p>${tarefa.descricao}</p>
                    <ion-icon class="etiqueta" name="pricetag-outline"></ion-icon> ${tarefa.etiqueta}
                    <ion-icon class="data" name="calendar-outline"></ion-icon> ${tarefa.data}
                </div>
                <div class="tarefa-actions">
                    <button class="editar" data-index="${index}"><ion-icon name="create-outline"></ion-icon></button>
                    <button class="excluir" data-index="${index}"><ion-icon name="trash-outline"></ion-icon></button>
                </div>
            `;
            listaTarefas.appendChild(divTarefa);
        });
    };

    // Consolidando o evento de clique para adicionar e atualizar tarefas
    botaoSalvar.addEventListener('click', () => {
        const tarefaData = {
            nome: inputTarefa.value,
            descricao: inputDescricao.value,
            etiqueta: inputEtiqueta.value,
            data: inputData.value
        };

        if (indiceEdicao !== null) {
            tarefas[indiceEdicao] = { ...tarefas[indiceEdicao], ...tarefaData };
        } else {
            tarefaData.id = Date.now();
            tarefas.push(tarefaData);
        }

        salvarTarefas();
        renderizarTarefas();

        // Resetar os campos e o índice de edição
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
        }
    });

    renderizarTarefas();
});
