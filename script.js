const STORAGE_PESSOAS = 'sga_pessoas_s4';
const STORAGE_ATENDIMENTOS = 'sga_atendimentos_s4';

let pessoas = JSON.parse(localStorage.getItem(STORAGE_PESSOAS) || '[]');
let atendimentos = JSON.parse(localStorage.getItem(STORAGE_ATENDIMENTOS) || '[]');

function uid() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function salvarStorage() {
  localStorage.setItem(STORAGE_PESSOAS, JSON.stringify(pessoas));
  localStorage.setItem(STORAGE_ATENDIMENTOS, JSON.stringify(atendimentos));
}

function navegar(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector(`.nav-btn[data-target="${id}"]`).classList.add('active');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navegar(btn.dataset.target));
});

function badgeStatus(status) {
  if (status === 'Ativo') return '<span class="badge ativo">Ativo</span>';
  if (status === 'Em revisão') return '<span class="badge revisao">Em revisão</span>';
  return '<span class="badge inativo">Inativo</span>';
}

function preencherSelectPessoas() {
  const select = document.getElementById('pessoaAtendimento');
  select.innerHTML = '';
  if (pessoas.length === 0) {
    select.innerHTML = '<option value="">Cadastre uma pessoa primeiro</option>';
    return;
  }
  pessoas.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.nome;
    select.appendChild(option);
  });
}

function renderDashboard() {
  document.getElementById('metricPessoas').textContent = pessoas.length;
  document.getElementById('metricAtendimentos').textContent = atendimentos.length;
  document.getElementById('metricAtivos').textContent = pessoas.filter(p => p.status === 'Ativo').length;
  document.getElementById('metricEncaminhamentos').textContent = atendimentos.filter(a => a.tipo === 'Encaminhamento').length;

  const ultCad = document.getElementById('ultimosCadastros');
  const ultAt = document.getElementById('ultimosAtendimentos');
  ultCad.innerHTML = '';
  ultAt.innerHTML = '';

  if (pessoas.length === 0) {
    ultCad.innerHTML = '<div class="empty">Nenhuma pessoa cadastrada.</div>';
  } else {
    [...pessoas].slice(-3).reverse().forEach(p => {
      ultCad.innerHTML += `
        <div class="item">
          <div class="item-top">
            <strong>${p.nome}</strong>
            ${badgeStatus(p.status)}
          </div>
          <p class="muted">${p.documento}</p>
          <p class="muted">${p.contato || 'Contato não informado'}</p>
        </div>`;
    });
  }

  if (atendimentos.length === 0) {
    ultAt.innerHTML = '<div class="empty">Nenhum atendimento registrado.</div>';
  } else {
    [...atendimentos].slice(-3).reverse().forEach(a => {
      const pessoa = pessoas.find(p => p.id === a.pessoaId);
      ultAt.innerHTML += `
        <div class="item">
          <div class="item-top">
            <strong>${pessoa ? pessoa.nome : 'Pessoa não encontrada'}</strong>
            <span class="badge tipo">${a.tipo}</span>
          </div>
          <p class="muted">${a.data} - ${a.responsavel}</p>
          <p class="muted">${a.descricao}</p>
        </div>`;
    });
  }
}

function renderListagem() {
  const busca = document.getElementById('busca').value.toLowerCase();
  const filtroStatus = document.getElementById('filtroStatus').value;
  const listaPessoas = document.getElementById('listaPessoas');
  const listaAtendimentos = document.getElementById('listaAtendimentos');
  listaPessoas.innerHTML = '';
  listaAtendimentos.innerHTML = '';

  const pessoasFiltradas = pessoas.filter(p => {
    const base = `${p.nome} ${p.documento} ${p.contato || ''} ${p.observacao || ''}`.toLowerCase();
    const bateBusca = base.includes(busca);
    const bateStatus = filtroStatus === 'Todos' || p.status === filtroStatus;
    return bateBusca && bateStatus;
  });

  const atendimentosFiltrados = atendimentos.filter(a => {
    const pessoa = pessoas.find(p => p.id === a.pessoaId);
    const base = `${pessoa ? pessoa.nome : ''} ${a.tipo} ${a.responsavel} ${a.descricao}`.toLowerCase();
    return base.includes(busca);
  });

  if (pessoasFiltradas.length === 0) {
    listaPessoas.innerHTML = '<div class="empty">Nenhum cadastro encontrado.</div>';
  } else {
    pessoasFiltradas.forEach(p => {
      listaPessoas.innerHTML += `
        <div class="item">
          <div class="item-top">
            <strong>${p.nome}</strong>
            ${badgeStatus(p.status)}
          </div>
          <p class="muted">${p.documento}</p>
          <p class="muted">${p.contato || 'Contato não informado'}</p>
          <p class="muted">${p.observacao || 'Sem observações.'}</p>
          <div class="row-actions">
            <button class="mini-btn edit" onclick="editarPessoa(${p.id})">Editar</button>
            <button class="mini-btn delete" onclick="excluirPessoa(${p.id})">Excluir</button>
          </div>
        </div>`;
    });
  }

  if (atendimentosFiltrados.length === 0) {
    listaAtendimentos.innerHTML = '<div class="empty">Nenhum atendimento encontrado.</div>';
  } else {
    atendimentosFiltrados.forEach(a => {
      const pessoa = pessoas.find(p => p.id === a.pessoaId);
      listaAtendimentos.innerHTML += `
        <div class="item">
          <div class="item-top">
            <strong>${pessoa ? pessoa.nome : 'Pessoa não encontrada'}</strong>
            <span class="badge tipo">${a.tipo}</span>
          </div>
          <p class="muted">${a.data} - ${a.responsavel}</p>
          <p class="muted">${a.descricao}</p>
          <div class="row-actions">
            <button class="mini-btn edit" onclick="editarAtendimento(${a.id})">Editar</button>
            <button class="mini-btn delete" onclick="excluirAtendimento(${a.id})">Excluir</button>
          </div>
        </div>`;
    });
  }
}

document.getElementById('formPessoa').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('pessoaId').value;
  const nome = document.getElementById('nome').value.trim();
  const documento = document.getElementById('documento').value.trim();
  const status = document.getElementById('statusPessoa').value;
  const contato = document.getElementById('contatoPessoa').value.trim();
  const observacao = document.getElementById('obsPessoa').value.trim();

  if (!nome || !documento) {
    alert('Preencha nome e documento.');
    return;
  }

  if (id) {
    const index = pessoas.findIndex(p => p.id == id);
    pessoas[index] = { id: Number(id), nome, documento, status, contato, observacao };
    alert('Cadastro atualizado com sucesso.');
  } else {
    pessoas.push({ id: uid(), nome, documento, status, contato, observacao });
    alert('Cadastro realizado com sucesso.');
  }

  e.target.reset();
  document.getElementById('pessoaId').value = '';
  salvarStorage();
  preencherSelectPessoas();
  renderDashboard();
  renderListagem();
  navegar('listagem');
});

document.getElementById('formAtendimento').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('atendimentoId').value;
  const pessoaId = Number(document.getElementById('pessoaAtendimento').value);
  const tipo = document.getElementById('tipoAtendimento').value;
  const responsavel = document.getElementById('responsavel').value.trim();
  const data = document.getElementById('dataAtendimento').value;
  const descricao = document.getElementById('descricaoAtendimento').value.trim();

  if (!pessoaId || !responsavel || !data || !descricao) {
    alert('Preencha todos os campos do atendimento.');
    return;
  }

  if (id) {
    const index = atendimentos.findIndex(a => a.id == id);
    atendimentos[index] = { id: Number(id), pessoaId, tipo, responsavel, data, descricao };
    alert('Atendimento atualizado com sucesso.');
  } else {
    atendimentos.push({ id: uid(), pessoaId, tipo, responsavel, data, descricao });
    alert('Atendimento registrado com sucesso.');
  }

  e.target.reset();
  document.getElementById('atendimentoId').value = '';
  salvarStorage();
  renderDashboard();
  renderListagem();
  navegar('listagem');
});

function editarPessoa(id) {
  const pessoa = pessoas.find(p => p.id === id);
  if (!pessoa) return;
  navegar('cadastro');
  document.getElementById('pessoaId').value = pessoa.id;
  document.getElementById('nome').value = pessoa.nome;
  document.getElementById('documento').value = pessoa.documento;
  document.getElementById('statusPessoa').value = pessoa.status;
  document.getElementById('contatoPessoa').value = pessoa.contato || '';
  document.getElementById('obsPessoa').value = pessoa.observacao || '';
}

function excluirPessoa(id) {
  if (!confirm('Deseja realmente excluir este cadastro?')) return;
  pessoas = pessoas.filter(p => p.id !== id);
  atendimentos = atendimentos.filter(a => a.pessoaId !== id);
  salvarStorage();
  preencherSelectPessoas();
  renderDashboard();
  renderListagem();
}

function editarAtendimento(id) {
  const atendimento = atendimentos.find(a => a.id === id);
  if (!atendimento) return;
  navegar('atendimentos');
  document.getElementById('atendimentoId').value = atendimento.id;
  document.getElementById('pessoaAtendimento').value = atendimento.pessoaId;
  document.getElementById('tipoAtendimento').value = atendimento.tipo;
  document.getElementById('responsavel').value = atendimento.responsavel;
  document.getElementById('dataAtendimento').value = atendimento.data;
  document.getElementById('descricaoAtendimento').value = atendimento.descricao;
}

function excluirAtendimento(id) {
  if (!confirm('Deseja realmente excluir este atendimento?')) return;
  atendimentos = atendimentos.filter(a => a.id !== id);
  salvarStorage();
  renderDashboard();
  renderListagem();
}

document.getElementById('cancelarPessoa').addEventListener('click', () => {
  document.getElementById('formPessoa').reset();
  document.getElementById('pessoaId').value = '';
});

document.getElementById('cancelarAtendimento').addEventListener('click', () => {
  document.getElementById('formAtendimento').reset();
  document.getElementById('atendimentoId').value = '';
});

document.getElementById('busca').addEventListener('input', renderListagem);
document.getElementById('filtroStatus').addEventListener('change', renderListagem);

document.getElementById('resetDados').addEventListener('click', () => {
  if (!confirm('Deseja limpar todos os dados?')) return;
  pessoas = [];
  atendimentos = [];
  salvarStorage();
  preencherSelectPessoas();
  renderDashboard();
  renderListagem();
});

document.getElementById('popularDemo').addEventListener('click', () => {
  if (pessoas.length > 0 || atendimentos.length > 0) {
    alert('Já existem dados cadastrados.');
    return;
  }
  const p1 = { id: uid(), nome: 'Paulo Júnior', documento: '62985369812 - ADS', status: 'Ativo', contato: 'paulojunior3gtr@gmail.com', observacao: 'Acompanhamento acadêmico' };
  const p2 = { id: uid(), nome: 'Carlos Mendes', documento: '00011122233 - Coord.', status: 'Em revisão', contato: 'contato institucional', observacao: 'Registro para demonstração do MVP' };
  pessoas.push(p1, p2);
  atendimentos.push(
    { id: uid(), pessoaId: p1.id, tipo: 'Orientação', responsavel: 'Paulo Júnior', data: '2026-03-27', descricao: 'Atendimento inicial com registro validado.' },
    { id: uid(), pessoaId: p2.id, tipo: 'Encaminhamento', responsavel: 'Equipe', data: '2026-03-28', descricao: 'Encaminhamento realizado para acompanhamento interno.' }
  );
  salvarStorage();
  preencherSelectPessoas();
  renderDashboard();
  renderListagem();
  alert('Demonstração carregada com sucesso.');
});

document.getElementById('baixarResumo').addEventListener('click', () => {
  const linhas = [
    'Sistema de Gestão de Atendimentos - Sprint 04',
    '',
    `Total de pessoas: ${pessoas.length}`,
    `Total de atendimentos: ${atendimentos.length}`,
    `Pessoas ativas: ${pessoas.filter(p => p.status === 'Ativo').length}`,
    `Encaminhamentos: ${atendimentos.filter(a => a.tipo === 'Encaminhamento').length}`,
    '',
    'Versão final do MVP com cadastro, atendimentos, edição, exclusão e dashboard.'
  ];
  const blob = new Blob([linhas.join('\\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'resumo_sprint4.txt';
  a.click();
});

preencherSelectPessoas();
renderDashboard();
renderListagem();
