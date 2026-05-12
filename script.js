document.getElementById('data').valueAsDate = new Date();

const dadosEquipes = {
    "AGLO002M": { encarregado: "JOSE LUIZ DE MELO SOUZA", integrantes: ["Eurico Dos Santos Filho Fernandes", "DIEGO FERNANDO DO SANTOS GOMES", "WILSON ESPEDITO DOS SANTOS", "Rodrigo Da Silva Alves", "CLAITON ROBERTO DE OLIVEIRA", "JACKSON GABRIEL BRAGA"] },
    "AGLO006M": { encarregado: "MOISES VANIR LEITE DA SILVA", integrantes: ["Amilton Jose de Deus", "James Da Cunha Moura", "Jenivaldo Gomes De Souza", "Adriano Vieira Gonçalves", "Francisco De Assis Silva Junior"] },
    "AGLO003M": { encarregado: "SEM2", integrantes: ["SEM3", "SEM4", "SEM5", "SEM6", "SEM7"] },
    "AGLO005M": { encarregado: "LAZARO JOSE DO CARMO NASCIMENTO", integrantes: ["Hailton Sousa Araujo", "Jhonata Lima Morais", "Uelson Soares De Brito", "Lasaro Dos Santos Souza", "Cirnandes Gonçalves Silva", "Romario Patricio da Silva"] },
    "AGLO001M": { encarregado: "MOURES SANTANA GONÇALVES DE ABREU", integrantes: ["Douglas Luiz Silva De Oliveira", "Lucio De Jesus Santana", "Jednelson De Araujo Cunha", "Bruno Fernandes Martins", "Fernando Alves da Silva"] },
    "AGLO004M": { encarregado: "JOSE CARVALHO SOUZA", integrantes: ["Jose Augusto Fernandes Da Silva", "Janio Almeida Vidal", "Pedro Henrique Lopes Da Silva", "Erasmo Campos Nogueira", "Marcio Silva De Medeiros Santos"] },
    "AGLV003M": { encarregado: "JOÃO BATISTA RODRIGUES DA SILVA", integrantes: ["Raimundo Martins De Oliveira", "Eduardo Davi Xavier Dos Santos", "Marivaldo De Carvalho Santos", "Matheus Soares De Araujo"] },
    "AGLV001M": { encarregado: "JOSUEL AFONSO ALVES", integrantes: ["Diego Worthyton Martins Rosa", "JOZIEL COSTA DE CARVALHO", "Antonio Carlos Gomes Moraes", "David Genesis dos Santos da Silva"] },
    "AGLV002M": { encarregado: "JOÃO ALVES NOGUEIRA", integrantes: ["Uanderson de Jesus Paulo", "Malcione Souza Da Silva"] },
    "AGLP001M": { encarregado: "ELIAVAM PATRICIO", integrantes: ["Mauricelio Ferreira De Araujo", "Washington Lopes da Silva"] },
    "AGLB001M": { encarregado: "ANTONIO JARDSON DA SILVA LIMA", integrantes: ["Pedro Furtado Figueiredo Filho", "SEM1"] }
};

function preencherEquipe() {
    const equipeSel = document.getElementById('equipe').value;
    const container = document.querySelector(`#group-integrantes .container-inputs`);
    container.innerHTML = ""; // Limpa os atuais

    if (dadosEquipes[equipeSel]) {
        const dados = dadosEquipes[equipeSel];
        // Preenche encarregado
        document.getElementById('encarregado').value = dados.encarregado;
        // Preenche integrantes
        dados.integrantes.forEach(nome => {
            addInput('group-integrantes', 'Integrante', nome);
        });
    }
}

function addInput(groupId, label, value = "") {
    const container = document.querySelector(`#${groupId} .container-inputs`);
    const div = document.createElement('div');
    div.className = 'input-row';

    const listAttr = (label === 'Integrante') ? 'list="lista-integrantes"' : '';
    const placeholder = (label === 'Integrante') ? 'Nome' : label;

    div.innerHTML = `
                <input type="text" class="doc-input" data-type="${label}" placeholder="${placeholder}" value="${value}" ${listAttr}>
                <button class="btn-remove" onclick="this.parentElement.remove()">X</button>
            `;
    container.appendChild(div);
}

function toggleParcial() {
    const status = document.getElementById('status').value;
    document.getElementById('descParcial').className = status === 'PARCIAL' ? '' : 'hidden';
}

// 1. FUNÇÃO PRINCIPAL (Acionada pelo botão REPORTAR)
async function gerarEEnviar() {
    const zip = new JSZip();
    
    // Captura dos dados (Certifique-se que os IDs batem com seu HTML)
    const cidade = document.getElementById('cidade').value;
    const data = document.getElementById('data').value;
    const equipe = document.getElementById('equipe').value;
    const encarregado = document.getElementById('encarregado').value;
    const projeto = document.getElementById('projeto').value;
    const tensao = document.getElementById('tensao').value;
    const status = document.getElementById('status').value;
    const servicos = document.getElementById('servicos').value;
    const obsFinal = document.getElementById('obsFinal').value;

    // Coleta integrantes (Pega todos os inputs dentro do grupo de integrantes)
    const integrantes = Array.from(document.querySelectorAll('#group-integrantes input'))
                             .map(i => i.value)
                             .filter(v => v !== "") // Remove campos vazios
                             .join('\n👥 - Integrante: ');
    
    // Montagem do Texto do Diário (Igual ao que você mandou na foto)
    const textoDiario = `📂 *DIÁRIO DE OBRAS*\n\n` +
                        `📍 - Cidade: ${cidade}\n` +
                        `📅 - Data: ${data}\n` +
                        `👷 - Equipe: ${equipe}\n` +
                        `⚒️ - Enc: ${encarregado}\n` +
                        `👥 - Integrante: ${integrantes}\n\n` +
                        `🏗️ - Proj: ${projeto}\n` +
                        `⚡ - Tensão: ${tensao}\n` +
                        `📝 - Status: ${status}\n` +
                        `⚙️ - Serviços: ${servicos}\n` +
                        `📌 - Obs: ${obsFinal}`;

    // Adiciona as mídias ao ZIP
    const midiaInput = document.getElementById('midia');
    if (midiaInput.files.length > 0) {
        for (let i = 0; i < midiaInput.files.length; i++) {
            const file = midiaInput.files[i];
            zip.file(file.name, file);
        }
    }

    const content = await zip.generateAsync({ type: "blob" });
    
    // Chama a lógica de compartilhamento ou download
    executarFallback(content, equipe, textoDiario);
}

async function executarFallback(blob, nomeEquipe, texto) {
    const arquivo = new File([blob], `Relatorio_${nomeEquipe}.zip`, { type: "application/zip" });

    // 1. TENTA ABRIR A OPÇÃO DE COMPARTILHAMENTO (GAVETA DO CELULAR)
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Diário de Obras',
                text: texto,    // O texto vira a legenda
                files: [arquivo] // O arquivo ZIP vai junto
            });
            // Se o usuário enviou com sucesso, não faz mais nada
            return; 
        } catch (err) {
            // Se der erro ou o usuário cancelar, ele tenta o plano B abaixo
            console.log("Compartilhamento não concluído:", err);
        }
    }

    // 2. PLANO B (PARA CHROME NO PC OU SE O SHARE FALHAR)
    // Se chegou aqui, é porque o navegador não tem a "gaveta" de compartilhar
    
    // Copia o texto para o seu CTRL+V
    await navigator.clipboard.writeText(texto);

    // Baixa o ZIP
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_${nomeEquipe}.zip`;
    link.click();

    // Mensagem de sucesso
    alert("✅ REPORTE GERADO!\n\nComo este navegador não suporta compartilhamento direto:\n1. O ZIP foi baixado.\n2. O texto foi copiado.\n\nBasta colar no WhatsApp!");
}

// 3. FUNÇÃO DE DOWNLOAD (A que faz o arquivo descer no navegador)
function fazerDownloadManual(blob, nomeEquipe) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_${nomeEquipe}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
}