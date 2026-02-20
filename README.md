Sistema de automação de atendimento via WhatsApp Web utilizando a biblioteca whatsapp-web.js. O projeto executa em ambiente Node.js e mantém autenticação local por meio de sessão persistente (LocalAuth), permitindo funcionamento contínuo em servidor Windows utilizado como servidor local.

O bot opera com leitura de QR Code para autenticação inicial e gerenciamento de sessões por usuário, controlando etapas de atendimento através de menu interativo. Cada conversa possui controle de estado, identificação de atendimento humano e encerramento automático por inatividade.

Funcionalidades implementadas:

Atendimento automatizado baseado em menu numérico
Controle de sessões individuais por usuário
Encerramento automático por inatividade (timeout configurável)
Simulação de digitação antes do envio de mensagens
Opção de transferência para atendimento humano
Encerramento manual de atendimento
Tratamento de mensagens enviadas pelo próprio número
Ignora grupos e status

Arquitetura técnica:

Node.js
whatsapp-web.js
Puppeteer (headless)
Autenticação persistente com LocalAuth
Execução em servidor Windows local

Objetivo do projeto:

Automatizar o atendimento inicial da empresa Hausen, direcionando solicitações para os setores responsáveis e organizando o fluxo de comunicação via WhatsApp.

Observação:

Este projeto utiliza automação baseada no WhatsApp Web e não na API oficial da Meta. O uso deve considerar as políticas da plataforma.
