const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true
    }
});

const sessoes = {};
const TEMPO_TIMEOUT = 15 * 60 * 1000; // 15 minutos para detectar inatividade

client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Bot Hausen está pronto!");
});

async function enviarMensagem(numero, texto) {
    try {
        if (!numero || numero.includes("@g.us")) return;

        const chat = await client.getChatById(numero);

        await chat.sendStateTyping();
        await new Promise(res => setTimeout(res, 1200));

        await client.sendMessage(numero, texto);
        await chat.clearState();

    } catch (erro) {
        console.error("Erro ao enviar mensagem:", erro);
    }
}

function menuPrincipal() {
    return "Olá, seja bem-vindo(a) à Hausen.\n\n" +
        "Para que possamos encaminhar sua solicitação ao setor responsável, informe o número da opção desejada:\n\n" +
        "1 - Orçamento\n" +
        "2 - Suporte emergêncial\n" +
        "3 - Falar com atendente\n" +
        "4 - Encerrar\n" +
        "5 - Sou fornecedor\n" +
        "6 - Falar com atendente\n" +
        "7 - Encerrar atendimento";
}

function resetTimeout(numero) {
    if (sessoes[numero]?.timeout) {
        clearTimeout(sessoes[numero].timeout);
    }

    sessoes[numero].timeout = setTimeout(async () => {
        await enviarMensagem(numero,
            "Atendimento encerrado por inatividade.\n" +
            "Caso ainda precise de suporte, basta iniciar uma nova conversa.\n" +
            "Permanecemos à disposição.");
        delete sessoes[numero];
    }, TEMPO_TIMEOUT);
}

async function encerrar(numero) {
    delete sessoes[numero];
    await enviarMensagem(numero,
        "*Atendimento encerrado.*\n" +
        "Permanecemos à disposição para futuras solicitações.");
}

client.on("message_create", async message => {

    try {

        if (!message.from) return;
        if (message.from.includes("@g.us")) return;
        if (message.from === "status@broadcast") return;
        if (!message.body) return;

        const numero = message.from;
        const textoOriginal = message.body.trim();
        const texto = textoOriginal.toLowerCase();

        if (message.fromMe) {

            if (texto.includes("estamos encerrando seu atendimento")) {

                const numeroCliente = message.to; // conversa atual

                if (sessoes[numeroCliente] && sessoes[numeroCliente].humano) {

                    if (sessoes[numeroCliente].timeout) {
                        clearTimeout(sessoes[numeroCliente].timeout);
                    }

                    await enviarMensagem(numeroCliente,
                        "*Atendimento encerrado.*\n" +
                        "Permanecemos à disposição para futuras solicitações.");

                    delete sessoes[numeroCliente];

                    console.log("Atendimento finalizado para:", numeroCliente);
                }
            }

            return;
        }


        if (!sessoes[numero]) {
            sessoes[numero] = { etapa: "menu", humano: false };
            resetTimeout(numero);
            return enviarMensagem(numero, menuPrincipal());
        }

        resetTimeout(numero);

        if (sessoes[numero].humano) {
            return;
        }

        if (sessoes[numero].etapa === "menu") {

            switch (texto) {

                case "1":
                    sessoes[numero].etapa = "orcamento";
                    return enviarMensagem(numero,
                        "*Orçamento*\n\n" +
                        "Para darmos andamento à sua solicitação, por favor informe:\n" +
                        "• Nome completo\n" +
                        "• E-mail\n\n" +
                        "Descreva também, de forma detalhada:\n" +
                        "– Tipo de obra\n" +
                        "– Localização\n" +
                        "– Escopo da solicitação\n\n" +
                        "0 – Voltar para o menu principal\n" +
                        "7 – Encerrar atendimento"
                    );

                case "2":
                    sessoes[numero].etapa = "recrutamento";
                    return enviarMensagem(numero,
                        "*Recrutamento*\n\n" +
                        "Agradecemos seu interesse em fazer parte do time Hausen.\n\n" +
                        "Para participar de nossos processos seletivos, envie seu currículo para:\n" +
                        "digite seu email aqui\n\n" +
                        "Se preferir, entre em contato pelo telefone: digite o telefone aqui.\n\n" +
                        "0 – Voltar para o menu principal\n" +
                        "7 – Encerrar atendimento"
                    );

                case "3":
                    sessoes[numero].etapa = "financeiro";
                    return enviarMensagem(numero,
                        "*Financeiro*\n\n" +
                        "Para tratar de assuntos financeiros, envie sua solicitação para:\n" +
                        "digite o email aqui\n\n" +
                        "0 – Voltar para o menu principal\n" +
                        "7 – Encerrar atendimento"
                    );

                case "4":
                    sessoes[numero].etapa = "dp";
                    return enviarMensagem(numero,
                        "*Departamento Pessoal*\n\n" +
                        "Para assuntos relacionados ao Departamento Pessoal, entre em contato pelo telefone:\n" +
                        "Digite o número aqui\n\n" +
                        "0 – Voltar para o menu principal\n" +
                        "7 – Encerrar atendimento"
                    );

                case "5":
                    sessoes[numero].etapa = "fornecedor";
                    return enviarMensagem(numero,
                        "*Fornecedor*\n\n" +
                        "Para realizar o cadastro como fornecedor, preencha o formulário abaixo:\n" +
                        "Caso tenha um formulário acrescente ele aqui\n\n" +
                        "Após o envio, nossa equipe fará a análise das informações.\n\n" +
                        "0 – Voltar para o menu principal\n" +
                        "7 – Encerrar atendimento"
                    );

                case "6":
                    sessoes[numero].humano = true;
                    return enviarMensagem(numero,
                        "*Falar com atendente*\n\n" +
                        "Descreva detalhadamente sua solicitação e aguarde alguns instantes.\n" +
                        "Em breve, nossa equipe dará continuidade ao seu atendimento."
                    );

                case "7":
                    return encerrar(numero);

                default:
                    return enviarMensagem(numero, menuPrincipal());
            }
        }

        if (texto === "0") {
            sessoes[numero].etapa = "menu";
            return enviarMensagem(numero, menuPrincipal());
        }

        if (texto === "7") {
            return encerrar(numero);
        }
        return enviarMensagem(numero,
            "Mensagem recebida.\n\n" +
            "0 – Menu principal\n" +
            "7 – Encerrar atendimento"
        );

    } catch (erro) {
        console.error("Erro geral:", erro);
    }
});

client.initialize();