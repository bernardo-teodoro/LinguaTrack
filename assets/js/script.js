// ===== LinguaTrack - Etapa 3 =====

let itens = [];

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
    } else if (itens.some(i => i.termo.toLowerCase() === termo.toLowerCase())) {
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

// ----- Formulário -----
function limparFormulario() {
    form.reset();
    campoData.value = hoje();
    [campoTermo, campoTraducao].forEach(c => mostrarErro(c, ''));
}

function salvarItem(evento) {
    evento.preventDefault();
    mostrarMensagem('', '');
    if (!validarFormulario()) return;

    const novo = {
        id: proximoId(),
        criadoEm: Date.now(),
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

    itens.push(novo);
    limparFormulario();
    mostrarMensagem(`"${novo.termo}" cadastrado com sucesso!`, 'sucesso');
}

// ----- Eventos -----
form.addEventListener('submit', salvarItem);
btnLimpar.addEventListener('click', () => { limparFormulario(); mostrarMensagem('', ''); });

// ----- Inicialização -----
limparFormulario();