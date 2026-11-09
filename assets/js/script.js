// ===== LinguaTrack - Etapa 3 =====

const NOMES_CATEGORIA = { vocabulario: 'Vocabulário', gramatica: 'Gramática', expressao: 'Expressão' };
const NOMES_DOMINIO = { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' };
const NOMES_IDIOMA = { en: 'Inglês' };

const itensIniciais = [
    { id: 1, termo: 'Schedule', traducao: 'Agendar, cronograma', idioma: 'en', categoria: 'vocabulario', dominio: 2, dataRevisao: '2026-09-28', fonetica: '', definicao: '', exemplo: 'We need to schedule a meeting for tomorrow.', criadoEm: 1 },
    { id: 2, termo: 'To call it a day', traducao: 'Dar o dia por encerrado, parar por hoje', idioma: 'en', categoria: 'expressao', dominio: 3, dataRevisao: '2026-09-30', fonetica: '', definicao: '', exemplo: "I'm tired, let's call it a day.", criadoEm: 2 },
    { id: 3, termo: 'Present Perfect', traducao: 'Passado com relevância no presente', idioma: 'en', categoria: 'gramatica', dominio: 1, dataRevisao: '2026-10-02', fonetica: '', definicao: '', exemplo: 'I have studied English for two years.', criadoEm: 3 }
];

const CHAVE_STORAGE = 'linguatrack:itens';

let itens = [];
let idSelecionado = null;

// ----- Elementos do DOM -----
const form = document.getElementById('form-item');
const campoTermo = document.getElementById('termo');
const campoTraducao = document.getElementById('traducao');
const campoIdioma = document.getElementById('idioma');
const campoCategoria = document.getElementById('categoria');
const campoDominio = document.getElementById('dominio');
const campoData = document.getElementById('data-revisao');
const campoFonetica = document.getElementById('fonetica');
const campoDefinicao = document.getElementById('definicao');
const campoExemplo = document.getElementById('exemplo');
const btnLimpar = document.getElementById('btn-limpar');
const mensagem = document.getElementById('mensagem');
const tbody = document.getElementById('lista-itens');
const estadoVazio = document.getElementById('estado-vazio');
const contador = document.getElementById('contador');
const detalhes = document.getElementById('detalhes-conteudo');
const campoId = document.getElementById('item-id');
const tituloForm = document.getElementById('titulo-formulario');
const btnSalvar = document.getElementById('btn-salvar');
const buscaInput = document.getElementById('campo-busca');
const filtroCategoria = document.getElementById('filtro-categoria');
const ordenarPor = document.getElementById('ordenar-por');

// ----- Persistência (localStorage) -----
function carregarItens() {
    try {
        const salvo = localStorage.getItem(CHAVE_STORAGE);
        if (salvo === null) return itensIniciais.slice();
        const lista = JSON.parse(salvo);
        return Array.isArray(lista) ? lista : [];
    } catch (erro) {
        console.error('Erro ao ler localStorage:', erro);
        return [];
    }
}

function salvarItens() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
}

// ----- Utilidades -----
function hoje() {
    return new Date().toISOString().slice(0, 10);
}

function proximoId() {
    return itens.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem-feedback ${tipo}`;
}

function formatarData(iso) {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function textoDominio(nivel) {
    return `${NOMES_DOMINIO[nivel]} (${nivel})`;
}

function criarElemento(tag, texto, classe) {
    const el = document.createElement(tag);
    if (texto !== undefined) el.textContent = texto;
    if (classe) el.className = classe;
    return el;
}

// ----- Validação -----
function mostrarErro(campo, texto) {
    document.getElementById(`erro-${campo.id}`).textContent = texto;
    campo.classList.toggle('invalido', texto !== '');
}

function validarFormulario() {
    let valido = true;
    const termo = campoTermo.value.trim();
    const traducao = campoTraducao.value.trim();

    if (termo.length < 2) {
        mostrarErro(campoTermo, 'Informe um termo com pelo menos 2 caracteres.');
        valido = false;
    } else if (itens.some(i => i.termo.toLowerCase() === termo.toLowerCase() && String(i.id) !== campoId.value)) {
        mostrarErro(campoTermo, 'Esse termo já está cadastrado.');
        valido = false;
    } else {
        mostrarErro(campoTermo, '');
    }

    if (traducao.length < 2) {
        mostrarErro(campoTraducao, 'Informe a tradução.');
        valido = false;
    } else {
        mostrarErro(campoTraducao, '');
    }

    if (campoData.value && campoData.value > hoje()) {
        mostrarMensagem('A data da última revisão não pode ser no futuro.', 'erro');
        valido = false;
    }
    return valido;
}

// ----- Pesquisa, filtro e ordenação -----
function obterItensVisiveis() {
    const busca = buscaInput.value.trim().toLowerCase();
    const categoria = filtroCategoria.value;

    const lista = itens.filter(item => {
        const bateBusca = item.termo.toLowerCase().includes(busca) || item.traducao.toLowerCase().includes(busca);
        const bateCategoria = categoria === '' || item.categoria === categoria;
        return bateBusca && bateCategoria;
    });

    const criterio = ordenarPor.value;
    lista.sort((a, b) => {
        if (criterio === 'data-desc') return b.criadoEm - a.criadoEm;
        if (criterio === 'dominio') return a.dominio - b.dominio || a.termo.localeCompare(b.termo);
        return a.termo.localeCompare(b.termo, 'pt-BR', { sensitivity: 'base' });
    });
    return lista;
}

// ----- Listagem -----
function criarLinha(item) {
    const tr = document.createElement('tr');
    tr.appendChild(criarElemento('td', item.termo));
    tr.appendChild(criarElemento('td', item.traducao));
    tr.appendChild(criarElemento('td', NOMES_IDIOMA[item.idioma] || item.idioma));
    tr.appendChild(criarElemento('td', NOMES_CATEGORIA[item.categoria]));
    tr.appendChild(criarElemento('td', textoDominio(item.dominio)));
    tr.appendChild(criarElemento('td', formatarData(item.dataRevisao)));

    const tdAcoes = document.createElement('td');
    [['Ver', 'btn-ver', 'ver'], ['Editar', 'btn-editar', 'editar'], ['Excluir', 'btn-excluir', 'excluir']].forEach(([rotulo, classe, acao]) => {
        const botao = criarElemento('button', rotulo, `btn-acao ${classe}`);
        botao.type = 'button';
        botao.dataset.acao = acao;
        botao.dataset.id = item.id;
        botao.title = `${rotulo} "${item.termo}"`;
        tdAcoes.appendChild(botao);
    });
    tr.appendChild(tdAcoes);
    return tr;
}

function renderizarLista() {
    const visiveis = obterItensVisiveis();
    tbody.innerHTML = '';
    visiveis.forEach(item => tbody.appendChild(criarLinha(item)));
    estadoVazio.hidden = visiveis.length > 0;
    contador.textContent = `(${visiveis.length} de ${itens.length})`;
}

// ----- Detalhes -----
function mostrarDetalhes(id) {
    const item = itens.find(i => i.id === id);
    detalhes.innerHTML = '';
    if (!item) {
        idSelecionado = null;
        detalhes.appendChild(criarElemento('p', 'Clique em "Ver" em um item da lista para ver os detalhes.', 'estado-vazio'));
        return;
    }
    idSelecionado = id;
    const card = criarElemento('article', undefined, 'cartao-detalhe');
    card.appendChild(criarElemento('h4', item.termo));

    const campos = [
        ['Tradução', item.traducao],
        ['Idioma', NOMES_IDIOMA[item.idioma]],
        ['Categoria', NOMES_CATEGORIA[item.categoria]],
        ['Nível de Domínio', textoDominio(item.dominio)],
        ['Última Revisão', formatarData(item.dataRevisao)]
    ];
    if (item.fonetica) campos.push(['Fonética', item.fonetica]);
    if (item.definicao) campos.push(['Definição', item.definicao]);

    campos.forEach(([rotulo, valor]) => {
        const p = document.createElement('p');
        p.appendChild(criarElemento('strong', `${rotulo}: `));
        p.appendChild(document.createTextNode(valor));
        card.appendChild(p);
    });

    const pEx = document.createElement('p');
    pEx.appendChild(criarElemento('strong', 'Exemplo de uso: '));
    pEx.appendChild(criarElemento('em', item.exemplo ? `"${item.exemplo}"` : '—'));
    card.appendChild(pEx);

    detalhes.appendChild(card);
}

// ----- Formulário -----
function limparFormulario() {
    form.reset();
    campoId.value = '';
    campoData.value = hoje();
    tituloForm.textContent = 'Cadastrar Novo Item de Estudo';
    btnSalvar.textContent = 'Salvar Item';
    [campoTermo, campoTraducao].forEach(c => mostrarErro(c, ''));
}

function iniciarEdicao(id) {
    const item = itens.find(i => i.id === id);
    if (!item) return;
    campoId.value = item.id;
    campoTermo.value = item.termo;
    campoTraducao.value = item.traducao;
    campoIdioma.value = item.idioma;
    campoCategoria.value = item.categoria;
    campoDominio.value = item.dominio;
    campoData.value = item.dataRevisao;
    campoFonetica.value = item.fonetica || '';
    campoDefinicao.value = item.definicao || '';
    campoExemplo.value = item.exemplo || '';
    tituloForm.textContent = `Editando: ${item.termo}`;
    btnSalvar.textContent = 'Atualizar Item';
    mostrarMensagem('Modo de edição: altere os campos e clique em "Atualizar Item".', 'info');
    document.getElementById('cadastro').scrollIntoView({ behavior: 'smooth' });
    campoTermo.focus();
}

function salvarItem(evento) {
    evento.preventDefault();
    mostrarMensagem('', '');
    if (!validarFormulario()) return;

    const dados = {
        termo: campoTermo.value.trim(),
        traducao: campoTraducao.value.trim(),
        idioma: campoIdioma.value,
        categoria: campoCategoria.value,
        dominio: Number(campoDominio.value),
        dataRevisao: campoData.value,
        fonetica: campoFonetica.value.trim(),
        definicao: campoDefinicao.value.trim(),
        exemplo: campoExemplo.value.trim()
    };

    let texto;
    if (campoId.value) {
        const id = Number(campoId.value);
        const indice = itens.findIndex(i => i.id === id);
        itens[indice] = { ...itens[indice], ...dados };
        if (idSelecionado === id) mostrarDetalhes(id);
        texto = `"${dados.termo}" atualizado com sucesso!`;
    } else {
        const novo = { id: proximoId(), criadoEm: Date.now(), ...dados };
        itens.push(novo);
        mostrarDetalhes(novo.id);
        texto = `"${dados.termo}" cadastrado com sucesso!`;
    }

    salvarItens();
    renderizarLista();
    limparFormulario();
    mostrarMensagem(texto, 'sucesso');
}

// ----- Excluir -----
function excluirItem(id) {
    const item = itens.find(i => i.id === id);
    if (!item || !confirm(`Deseja realmente excluir "${item.termo}"?`)) return;
    itens = itens.filter(i => i.id !== id);
    salvarItens();
    if (idSelecionado === id) mostrarDetalhes(null);
    if (campoId.value === String(id)) limparFormulario();
    renderizarLista();
    mostrarMensagem(`"${item.termo}" foi excluído.`, 'sucesso');
}

// ----- Eventos -----
form.addEventListener('submit', salvarItem);
btnLimpar.addEventListener('click', () => { limparFormulario(); mostrarMensagem('', ''); });
buscaInput.addEventListener('input', renderizarLista);
filtroCategoria.addEventListener('change', renderizarLista);
ordenarPor.addEventListener('change', renderizarLista);

tbody.addEventListener('click', evento => {
    const botao = evento.target.closest('button[data-acao]');
    if (!botao) return;
    const id = Number(botao.dataset.id);
    if (botao.dataset.acao === 'ver') mostrarDetalhes(id);
    if (botao.dataset.acao === 'editar') iniciarEdicao(id);
    if (botao.dataset.acao === 'excluir') excluirItem(id);
});

// ----- Inicialização -----
itens = carregarItens();
salvarItens();
limparFormulario();
renderizarLista();
if (itens.length) mostrarDetalhes(itens[0].id);