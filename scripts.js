document.addEventListener("DOMContentLoaded", function() {
    // Inicialmente, exibimos a primeira aba (Participantes)
    document.getElementById('participants').style.display = 'block';

    // Ao clicar na primeira aba, mostramos os participantes
    document.getElementsByClassName("tablink")[0].click();

    fetchParticipantsData();
    fetchDebtsData();
});

function openTab(evt, tabName) {
    // Ocultamos todas as abas e mostramos apenas a aba selecionada
    const tabcontents = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}

function fetchParticipantsData() {
    fetch('http://localhost:8080/api/pessoa')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Array de Promises para armazenar todas as Promises de fetchConsumosData
            const fetchPromises = [];

            // Para cada participante, obtemos o consumo de hoje
            data.forEach(participant => {
                // Chamada à função fetchConsumosData para obter os consumos de hoje
                const fetchPromise = fetchConsumosData(participant)
                    .then(consumidosHoje => {
                        // Atualizar o objeto do participante com os consumos de hoje
                        participant.consumidosHoje = consumidosHoje;
                    });

                // Adicionar a Promise à lista de Promises
                fetchPromises.push(fetchPromise);
            });

            // Após todas as Promises serem resolvidas, preenchemos a tabela
            Promise.all(fetchPromises)
                .then(() => {
                    populateParticipantsTable(data);
                })
                .catch(error => console.error('Erro ao buscar consumos de hoje:', error));
        })
        .catch(error => console.error('Erro ao buscar dados dos participantes:', error));
}


function fetchConsumosData(participant) {
    return fetch(`http://localhost:8080/api/consumo/today/${participant.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(totalConsumidos => {
            // Verificar se há consumos hoje
            return totalConsumidos > 0 ? totalConsumidos : 'Não há consumos';
        })
        .catch(error => {
            console.error('Erro ao buscar consumos de hoje:', error);
            return 'Não foi possível obter os consumos';
        });
}


function fetchDebtsData() {
    fetch('http://localhost:8080/api/debito')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            populateDebtsTable(data);
        })
        .catch(error => console.error('Erro ao buscar dados dos débitos:', error));
}

function populateParticipantsTable(participants) {
    const tableBody = document.getElementById('participantsTable');
    tableBody.innerHTML = ''; // Limpar conteúdo existente

    // Criando a linha de cabeçalho da tabela
    const headerRow = document.createElement('tr');

    // Cabeçalhos das colunas
    const headers = ['Nome', 'Total Consumido', 'Total Gasto', 'Consumidos Hoje', 'Último Consumo'];

    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        header.style.backgroundColor = '#4CAF50'; // Verde padrão para os cabeçalhos das colunas
        header.style.color = 'white'; // Texto branco para contraste
        header.style.textAlign = 'center'; // Centralizar o texto
        headerRow.appendChild(header);
    });

    tableBody.appendChild(headerRow);

    // Preenchendo os dados dos participantes na tabela
    participants.forEach(participant => {
        const row = document.createElement('tr');

        // Formatar os valores como moeda real
        const valorTotalFormmat = participant.totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Células dos dados
        const cellsData = [participant.nome, participant.totalConsumidos, valorTotalFormmat, participant.consumidosHoje, participant.updatedAt || 'Não há consumos'];

        cellsData.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            cell.style.textAlign = 'center'; // Centralizar o texto
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

function populateDebtsTable(debts) {
    const tableBody = document.getElementById('debtsTable');
    tableBody.innerHTML = ''; // Limpar conteúdo existente

    // Criando a linha de cabeçalho da tabela
    const headerRow = document.createElement('tr');

    // Cabeçalhos das colunas
    const headers = ['Nome do Devedor', 'Nome do Recebedor', 'Quantidade do Débito', 'Valor Total do Débito', 'Status de Pagamento', 'Último Update'];

    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        header.style.backgroundColor = '#4CAF50'; // Verde padrão para os cabeçalhos das colunas
        header.style.color = 'white'; // Texto branco para contraste
        header.style.textAlign = 'center'; // Centralizar o texto
        headerRow.appendChild(header);
    });

    tableBody.appendChild(headerRow);

    // Preenchendo os dados dos débitos na tabela
    debts.forEach(debt => {
        const row = document.createElement('tr');

        // Formatar os valores como moeda real
        const valorDebitoFormatted = debt.valorSerPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Células dos dados
        const cellsData = [debt.devedor.nome, debt.recebedor.nome, debt.quantidade, valorDebitoFormatted, debt.pago, debt.updatedAt || 'Não há update'];

        cellsData.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            cell.style.textAlign = 'center'; // Centralizar o texto
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}
