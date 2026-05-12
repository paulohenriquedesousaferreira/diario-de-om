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
    
    // Captura dos dados
    const cidade = document.getElementById('cidade').value;
    const dataCampo = document.getElementById('data').value; // Formato padrão: YYYY-MM-DD
    const equipe = document.getElementById('equipe').value;
    const encarregado = document.getElementById('encarregado').value;
    const projeto = document.getElementById('projeto').value;
    const tensao = document.getElementById('tensao').value;
    const status = document.getElementById('status').value;
    const servicos = document.getElementById('servicos').value;
    const obsFinal = document.getElementById('obsFinal').value;

    // --- FORMATAÇÃO DA DATA PARA O NOME DO ARQUIVO ---
    let dataFormatada = "";
    if (dataCampo) {
        const [ano, mes, dia] = dataCampo.split('-');
        dataFormatada = `${dia}_${mes}_${ano}`; // Ex: 12_05_2026
    } else {
        const d = new Date();
        dataFormatada = `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;
    }

    // Coleta integrantes
    const integrantes = Array.from(document.querySelectorAll('#group-integrantes input'))
                             .map(i => i.value)
                             .filter(v => v !== "")
                             .join('\n👥 - Integrante: ');
    
    const textoDiario = `📂 *DIÁRIO DE OBRAS*\n\n` +
                        `📍 - Cidade: ${cidade}\n` +
                        `📅 - Data: ${dataFormatada.replace(/_/g, '/')}\n` + // Volta para / no texto
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
    
    // Passa a data formatada para o nome do arquivo
    const nomeArquivo = `Relatorio_${equipe} ${dataFormatada}`;
    executarFallback(content, nomeArquivo, textoDiario);
}

async function executarFallback(blob, nomeCompleto, texto) {
    const arquivo = new File([blob], `${nomeCompleto}.zip`, { type: "application/zip" });

    // Tenta abrir a gaveta de compartilhamento (Celular)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        try {
            await navigator.share({
                title: 'Diário de Obras',
                text: texto,
                files: [arquivo]
            });
            return;
        } catch (err) {
            console.log("Share falhou");
        }
    }

    // Plano B (Chrome PC)
    await navigator.clipboard.writeText(texto);

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeCompleto}.zip`; // Nome com equipe e data
    link.click();

    alert("✅ REPORTE GERADO!\n\nArquivo: " + nomeCompleto + ".zip\nO texto foi copiado para o seu CTRL+V.");
}