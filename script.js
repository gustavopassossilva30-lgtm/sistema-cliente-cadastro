const form = document.getElementById('form-cliente');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputTelefone = document.getElementById('telefone');
const inputCidade = document.getElementById('cidade');
const inputCpf = document.getElementById('cpf');
const inputPesquisa = document.getElementById('pesquisa');

const btnSalvar = document.getElementById('btn-salvar');
const btnLimparForm = document.getElementById('btn-limpar-form');
const btnLimparTudo = document.getElementById('btn-limpar-tudo');
const tabelaCorpo = document.getElementById('tabela-corpo');
const badgeTotal = document.getElementById('badge-total');

let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let idEdicao = null;

function salvarLocalStorage() {
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

function limparFormulario() {
  form.reset();
  idEdicao = null;
  btnSalvar.textContent = 'Salvar cliente';
}

function renderizarTabela() {
  // 1. Organizar os clientes em ordem alfabética pelo nome
  clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // 2. Exibir a quantidade total de clientes cadastrados
  badgeTotal.textContent = `Total: ${clientes.length}`;

  const termo = inputPesquisa.value.trim().toLowerCase();
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(termo) ||
      c.email.toLowerCase().includes(termo)
  );

  tabelaCorpo.innerHTML = '';

  if (clientesFiltrados.length === 0) {
    tabelaCorpo.innerHTML = `
      <tr>
        <td colspan="6" class="mensagem-vazia">Nenhum cliente encontrado.</td>
      </tr>
    `;
    return;
  }

  clientesFiltrados.forEach((cliente) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.email}</td>
      <td>${cliente.cpf}</td>
      <td>${cliente.telefone}</td>
      <td>${cliente.cidade}</td>
      <td class="acoes-cell">
        <button type="button" class="btn-verde" onclick="editarCliente('${cliente.id}')">Editar</button>
        <button type="button" class="btn-vermelho" onclick="excluirCliente('${cliente.id}')">Excluir</button>
      </td>
    `;
    tabelaCorpo.appendChild(tr);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  const email = inputEmail.value.trim().toLowerCase();
  const telefone = inputTelefone.value.trim();
  const cidade = inputCidade.value.trim();
  const cpf = inputCpf.value.trim();

  // 3. Impedir o cadastro de clientes com e-mails duplicados
  const emailDuplicado = clientes.some(
    (c) => c.email === email && c.id !== idEdicao
  );

  if (emailDuplicado) {
    alert('Já existe um cliente cadastrado com este e-mail.');
    inputEmail.focus();
    return;
  }

  if (idEdicao) {
    const index = clientes.findIndex((c) => c.id === idEdicao);
    if (index !== -1) {
      clientes[index] = { id: idEdicao, nome, email, cpf, telefone, cidade };
    }
  } else {
    clientes.push({
      id: Date.now().toString(),
      nome,
      email,
      cpf,
      telefone,
      cidade
    });
  }

  salvarLocalStorage();
  limparFormulario();
  renderizarTabela();
});

window.editarCliente = function (id) {
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) return;

  inputNome.value = cliente.nome;
  inputEmail.value = cliente.email;
  inputCpf.value = cliente.cpf;
  inputTelefone.value = cliente.telefone;
  inputCidade.value = cliente.cidade;

  idEdicao = cliente.id;
  btnSalvar.textContent = 'Atualizar cliente';
  inputNome.focus();
};

window.excluirCliente = function (id) {
  if (confirm('Deseja realmente excluir este cliente?')) {
    clientes = clientes.filter((c) => c.id !== id);
    if (idEdicao === id) limparFormulario();
    salvarLocalStorage();
    renderizarTabela();
  }
};

// 4. Opção para limpar todos os registros
btnLimparTudo.addEventListener('click', () => {
  if (clientes.length === 0) {
    alert('Não há registros para limpar.');
    return;
  }

  if (confirm('Tem certeza que deseja apagar TODOS os clientes cadastrados?')) {
    clientes = [];
    localStorage.removeItem('clientes');
    limparFormulario();
    renderizarTabela();
  }
});

btnLimparForm.addEventListener('click', limparFormulario);
inputPesquisa.addEventListener('input', renderizarTabela);

// Renderização inicial
renderizarTabela();