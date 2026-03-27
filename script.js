const KEY_PESSOAS = 'sga_pessoas';
const KEY_ATEND = 'sga_atendimentos';
const KEY_USER = 'sga_usuario';

const loginBox = document.getElementById('loginBox');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const cadastroForm = document.getElementById('cadastroForm');
const atendimentoForm = document.getElementById('atendimentoForm');

function getData(key){ return JSON.parse(localStorage.getItem(key) || '[]'); }
function setData(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

function updateDashboard(){
  const pessoas = getData(KEY_PESSOAS);
  const atend = getData(KEY_ATEND);
  document.getElementById('totalPessoas').textContent = pessoas.length;
  document.getElementById('totalAtendimentos').textContent = atend.length;
  document.getElementById('ultimoAtendimento').textContent = atend.length ? atend[atend.length-1].data : 'Nenhum';
  renderPessoas();
  renderAtendimentos();
  populatePessoaSelect();
}

function renderPessoas(){
  const target = document.getElementById('listaPessoas');
  const pessoas = getData(KEY_PESSOAS);
  target.innerHTML = pessoas.length ? pessoas.map(p => `
    <div class="list-card">
      <strong>${p.nome}</strong><br>
      <small>${p.telefone} • ${p.curso} • ${p.status}</small>
    </div>`).join('') : '<p>Nenhuma pessoa cadastrada.</p>';
}

function renderAtendimentos(){
  const target = document.getElementById('listaAtendimentos');
  const atend = getData(KEY_ATEND);
  target.innerHTML = atend.length ? atend.map(a => `
    <div class="list-card">
      <strong>${a.pessoa}</strong><br>
      <small>${a.data} • ${a.tipo} • ${a.responsavel}</small>
      <p>${a.descricao}</p>
    </div>`).join('') : '<p>Nenhum atendimento registrado.</p>';
}

function populatePessoaSelect(){
  const select = document.getElementById('pessoaSelect');
  const pessoas = getData(KEY_PESSOAS);
  select.innerHTML = pessoas.length ? pessoas.map((p, i) => `<option value="${p.nome}">${p.nome}</option>`).join('') : '<option value="">Cadastre uma pessoa primeiro</option>';
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();
  if(!usuario || senha !== '1234'){
    alert('Use qualquer usuário e a senha 1234.');
    return;
  }
  localStorage.setItem(KEY_USER, usuario);
  loginBox.classList.add('hidden');
  app.classList.remove('hidden');
  updateDashboard();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(KEY_USER);
  app.classList.add('hidden');
  loginBox.classList.remove('hidden');
});

cadastroForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pessoas = getData(KEY_PESSOAS);
  pessoas.push({
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    curso: document.getElementById('curso').value,
    status: document.getElementById('status').value,
    observacoes: document.getElementById('observacoes').value
  });
  setData(KEY_PESSOAS, pessoas);
  cadastroForm.reset();
  updateDashboard();
  alert('Cadastro salvo com sucesso.');
});

atendimentoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const atendimentos = getData(KEY_ATEND);
  atendimentos.push({
    pessoa: document.getElementById('pessoaSelect').value,
    data: document.getElementById('dataAtendimento').value,
    tipo: document.getElementById('tipoAtendimento').value,
    responsavel: document.getElementById('responsavel').value,
    descricao: document.getElementById('descricaoAtendimento').value
  });
  setData(KEY_ATEND, atendimentos);
  atendimentoForm.reset();
  updateDashboard();
  alert('Atendimento salvo com sucesso.');
});

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(view).classList.remove('hidden');
  });
});

if(localStorage.getItem(KEY_USER)){
  loginBox.classList.add('hidden');
  app.classList.remove('hidden');
  updateDashboard();
}
