class PhishingGame {
    constructor() {
        this.score = 0;
        this.foundErrors = 0;
        this.totalErrors = 7; // Total fixo de 7 erros
        this.currentEmailIndex = 0;
        this.gameActive = false;
        this.startTime = null;
        this.timerInterval = null;
        this.foundErrorIds = new Set();
        this.completedEmails = new Set();
        this.currentEmailErrors = new Set(); // Erros encontrados no email atual
        this.userErrorsByEmail = new Map(); // Rastrear erros do usuário por email
        
        // Banco de emails (7 phishing, 7 legítimos) com erros sutis
        this.emails = [
            {
                id: 1,
                type: 'phishing',
                senderName: 'Banco do Brasil',
                senderEmail: 'noreply@bancodobrasil.com',
                date: '15 de Dezembro, 2024',
                subject: 'Atualização de Segurança - Sua Conta',
                body: `
                    <p>Prezado Cliente,</p>
                    <p>O Banco do Brasil está constantemente trabalhando para melhorar a segurança de suas contas. Recentemente, implementamos novas medidas de proteção para garantir que suas transações sejam sempre seguras.</p>
                    <p>Para manter sua conta atualizada com os novos padrões de segurança, solicitamos que você acesse sua área do cliente e confirme algumas informações básicas. Esta atualização é obrigatória e deve ser realizada em até 30 dias.</p>
                    <p>Para sua conveniência, você pode acessar diretamente através do link abaixo:</p>
                    <div class="action-button">
                        <a href="#" class="btn-primary" id="bank-link">Acessar Minha Conta</a>
                    </div>
                    <p>Lembramos que o Banco do Brasil nunca solicita senhas ou dados pessoais por email. Esta atualização é apenas para confirmar informações já cadastradas em nosso sistema.</p>
                    <p>Em caso de dúvidas, entre em contato conosco através dos canais oficiais disponíveis em nosso site.</p>
                    <p>Atenciosamente,<br>Equipe de Segurança<br>Banco do Brasil</p>
                `,
                errors: [
                    { id: 'bank-request', description: 'Instituição financeira pedindo acesso à conta por email', element: null }
                ]
            },
            {
                id: 2,
                type: 'legitimate',
                senderName: 'Netflix',
                senderEmail: 'info@netflix.com',
                date: '14 de Dezembro, 2024',
                subject: 'Confirmação de pagamento - Assinatura Netflix',
                body: `
                    <p>Olá,</p>
                    <p>Recebemos seu pagamento de R$ 39,90 para sua assinatura Netflix Premium.</p>
                    <p>Detalhes da transação:</p>
                    <ul>
                        <li>Data: 14/12/2024 às 15:30</li>
                        <li>Valor: R$ 39,90</li>
                        <li>Método de pagamento: Cartão de crédito terminado em ****1234</li>
                        <li>Número da transação: NF-2024-123456789</li>
                    </ul>
                    <p>Sua assinatura está ativa e você pode continuar assistindo a todos os filmes e séries disponíveis em nossa plataforma.</p>
                    <p>Se você não reconhece esta cobrança, entre em contato conosco imediatamente através da sua conta Netflix.</p>
                    <p>Obrigado por escolher a Netflix!</p>
                    <p>Atenciosamente,<br>Equipe Netflix Brasil</p>
                `,
                errors: []
            },
            {
                id: 3,
                type: 'phishing',
                senderName: 'PayPal',
                senderEmail: 'security@paypal-secure.com',
                date: '13 de Dezembro, 2024',
                subject: 'Verificação de Segurança - Conta PayPal',
                body: `
                    <p>Prezado usuário,</p>
                    <p>Como parte de nossos esforços contínuos para manter sua conta PayPal segura, detectamos uma atividade incomum em sua conta. Para sua proteção, implementamos medidas de segurança temporárias.</p>
                    <p>Para verificar que você é o proprietário legítimo da conta, solicitamos que confirme algumas informações básicas. Esta verificação é rápida e leva apenas alguns minutos.</p>
                    <p>Para sua conveniência, você pode acessar diretamente através do link abaixo:</p>
                    <div class="action-button">
                        <a href="#" class="btn-primary" id="paypal-link">Verificar Minha Conta</a>
                    </div>
                    <p>Após a verificação, sua conta será liberada imediatamente e você poderá continuar usando todos os serviços normalmente.</p>
                    <p>Se você não reconhece esta atividade, entre em contato conosco através dos canais oficiais do PayPal.</p>
                    <p>Atenciosamente,<br>Equipe de Segurança PayPal</p>
                `,
                errors: [
                    { id: 'urgent-verification', description: 'Solicitação urgente de verificação de identidade por email', element: null }
                ]
            },
            {
                id: 4,
                type: 'legitimate',
                senderName: 'Amazon',
                senderEmail: 'shipment-tracking@amazon.com',
                date: '12 de Dezembro, 2024',
                subject: 'Seu pedido foi enviado - Amazon',
                body: `
                    <p>Olá,</p>
                    <p>Seu pedido #123-4567890-1234567 foi enviado e está a caminho!</p>
                    <p>Detalhes do envio:</p>
                    <ul>
                        <li>Produto: Smartphone Samsung Galaxy S23</li>
                        <li>Quantidade: 1 unidade</li>
                        <li>Data estimada de entrega: 15/12/2024</li>
                        <li>Transportadora: Correios</li>
                        <li>Código de rastreamento: BR123456789BR</li>
                    </ul>
                    <p>Você pode acompanhar seu pedido através do link de rastreamento disponível em sua conta Amazon ou diretamente no site dos Correios.</p>
                    <p>Em caso de dúvidas sobre sua entrega, entre em contato conosco através da sua conta Amazon.</p>
                    <p>Agradecemos sua compra!</p>
                    <p>Equipe Amazon Brasil</p>
                `,
                errors: []
            },
            {
                id: 5,
                type: 'phishing',
                senderName: 'Microsoft',
                senderEmail: 'support@microsoft-security.com',
                date: '11 de Dezembro, 2024',
                subject: 'Atualização de Segurança - Windows Defender',
                body: `
                    <p>Prezado usuário,</p>
                    <p>O Microsoft Windows Defender detectou uma ameaça potencial em seu sistema. Para garantir a segurança de seus dados, recomendamos que você execute uma verificação completa do sistema.</p>
                    <p>Nossa equipe de segurança desenvolveu uma ferramenta especializada para remover esta ameaça. Esta ferramenta é gratuita e compatível com todas as versões do Windows.</p>
                    <p>Para baixar e instalar a ferramenta de segurança, clique no link abaixo:</p>
                    <div class="action-button">
                        <a href="#" class="btn-primary" id="microsoft-link">Baixar Ferramenta de Segurança</a>
                    </div>
                    <p>Esta ferramenta irá:</p>
                    <ul>
                        <li>Verificar seu sistema em busca de ameaças</li>
                        <li>Remover qualquer malware detectado</li>
                        <li>Atualizar suas definições de segurança</li>
                        <li>Otimizar o desempenho do seu computador</li>
                    </ul>
                    <p>Após a instalação, recomendamos que você reinicie seu computador para garantir que todas as atualizações sejam aplicadas corretamente.</p>
                    <p>Atenciosamente,<br>Equipe de Segurança Microsoft</p>
                `,
                errors: [
                    { id: 'fake-antivirus', description: 'Empresa oferecendo ferramenta de segurança gratuita por email', element: null }
                ]
            },
            {
                id: 6,
                type: 'legitimate',
                senderName: 'Spotify',
                senderEmail: 'noreply@spotify.com',
                date: '10 de Dezembro, 2024',
                subject: 'Sua fatura do Spotify Premium',
                body: `
                    <p>Olá,</p>
                    <p>Recebemos seu pagamento de R$ 19,90 para sua assinatura Spotify Premium.</p>
                    <p>Detalhes da cobrança:</p>
                    <ul>
                        <li>Data: 10/12/2024</li>
                        <li>Valor: R$ 19,90</li>
                        <li>Plano: Premium Individual</li>
                        <li>Método de pagamento: Cartão de crédito</li>
                    </ul>
                    <p>Sua assinatura está ativa e você pode continuar desfrutando de música sem anúncios, downloads ilimitados e qualidade de áudio superior.</p>
                    <p>Para visualizar seu histórico de pagamentos ou alterar seu método de pagamento, acesse sua conta Spotify.</p>
                    <p>Obrigado por escolher o Spotify!</p>
                    <p>Equipe Spotify</p>
                `,
                errors: []
            },
            {
                id: 7,
                type: 'phishing',
                senderName: 'Itaú',
                senderEmail: 'noreply@itau-bank.com',
                date: '9 de Dezembro, 2024',
                subject: 'Confirmação de Transação - Cartão de Crédito',
                body: `
                    <p>Prezado Cliente,</p>
                    <p>Detectamos uma transação em seu cartão de crédito Itaú que pode não ter sido realizada por você. Por segurança, sua conta foi temporariamente bloqueada até confirmarmos a legitimidade da operação.</p>
                    <p>Detalhes da transação suspeita:</p>
                    <ul>
                        <li>Data: 09/12/2024 às 14:23</li>
                        <li>Valor: R$ 1.250,00</li>
                        <li>Estabelecimento: Loja Online</li>
                        <li>Local: São Paulo, SP</li>
                    </ul>
                    <p>Para confirmar se esta transação foi realizada por você e desbloquear sua conta, acesse o link abaixo:</p>
                    <div class="action-button">
                        <a href="#" class="btn-primary" id="itau-link">Confirmar Transação</a>
                    </div>
                    <p>Se você não reconhece esta transação, entre em contato conosco imediatamente através dos canais oficiais do Itaú.</p>
                    <p>Atenciosamente,<br>Equipe de Segurança Itaú</p>
                `,
                errors: [
                    { id: 'suspicious-transaction', description: 'Detalhes de transação muito específicos para parecer real', element: null }
                ]
            },
            {
                id: 8,
                type: 'legitimate',
                senderName: 'Uber',
                senderEmail: 'receipts@uber.com',
                date: '8 de Dezembro, 2024',
                subject: 'Recibo da sua viagem - Uber',
                body: `
                    <p>Olá,</p>
                    <p>Aqui está o recibo da sua viagem de hoje:</p>
                    <p>Detalhes da viagem:</p>
                    <ul>
                        <li>Data: 08/12/2024</li>
                        <li>Horário: 19:30 - 19:45</li>
                        <li>Origem: Shopping Center</li>
                        <li>Destino: Sua casa</li>
                        <li>Distância: 3,2 km</li>
                        <li>Valor: R$ 12,50</li>
                        <li>Método de pagamento: Cartão cadastrado</li>
                    </ul>
                    <p>Obrigado por escolher o Uber!</p>
                    <p>Se você tiver alguma dúvida sobre esta viagem, entre em contato conosco através do aplicativo Uber.</p>
                    <p>Equipe Uber</p>
                `,
                errors: []
            },
            {
                id: 9,
                type: 'phishing',
                senderName: 'Google',
                senderEmail: 'security@google-account.com',
                date: '7 de Dezembro, 2024',
                subject: 'Alerta de Segurança - Conta Google',
                body: `
                    <p>Prezado usuário,</p>
                    <p>Detectamos uma tentativa de login em sua conta Google de um dispositivo não reconhecido. Por segurança, sua conta foi temporariamente protegida.</p>
                    <p>Detalhes da tentativa de acesso:</p>
                    <ul>
                        <li>Data: 07/12/2024 às 16:45</li>
                        <li>Local: São Paulo, Brasil</li>
                        <li>Dispositivo: Computador Windows</li>
                        <li>Navegador: Chrome</li>
                    </ul>
                    <p>Para verificar se esta tentativa de acesso foi realizada por você e desbloquear sua conta, clique no link abaixo:</p>
                    <div class="action-button">
                        <a href="#" class="btn-primary" id="google-link">Verificar Acesso</a>
                    </div>
                    <p>Se você não reconhece esta tentativa de acesso, recomendamos que você altere sua senha imediatamente através das configurações de segurança da sua conta Google.</p>
                    <p>Atenciosamente,<br>Equipe de Segurança Google</p>
                `,
                errors: [
                    { id: 'login-attempt', description: 'Empresa alertando sobre tentativa de login por email', element: null }
                ]
            },
            {
                id: 10,
                type: 'legitimate',
                senderName: 'iFood',
                senderEmail: 'pedidos@ifood.com.br',
                date: '6 de Dezembro, 2024',
                subject: 'Pedido confirmado - iFood',
                body: `
                    <p>Olá,</p>
                    <p>Seu pedido foi confirmado e está sendo preparado!</p>
                    <p>Detalhes do pedido:</p>
                    <ul>
                        <li>Restaurante: Pizza Express</li>
                        <li>Pedido: Pizza Margherita + Refrigerante</li>
                        <li>Valor: R$ 45,90</li>
                        <li>Taxa de entrega: R$ 5,00</li>
                        <li>Total: R$ 50,90</li>
                        <li>Tempo estimado: 30-45 minutos</li>
                    </ul>
                    <p>Você pode acompanhar seu pedido em tempo real através do aplicativo iFood.</p>
                    <p>Agradecemos sua preferência!</p>
                    <p>Equipe iFood</p>
                `,
                errors: []
            },
            {
                id: 11,
                type: 'phishing',
                senderName: 'Apple',
                senderEmail: 'support@apple-id.com',
                date: '5 de Dezembro, 2024',
                subject: 'Verificação Necessária - Apple ID',
                body: `
                    <p>Prezado usuário,</p>
                    <p>Como parte de nossos procedimentos de segurança, detectamos uma atividade incomum em sua conta Apple ID. Para garantir a proteção de seus dados pessoais, solicitamos uma verificação adicional.</p>
                    <p>Esta verificação é obrigatória e deve ser realizada em até 24 horas para evitar a suspensão temporária de sua conta.</p>
                    <p>Para completar a verificação, acesse o link abaixo e confirme suas informações:</p>
                    <div class="action-button">
                        <a href="#" class="btn-primary" id="apple-link">Verificar Apple ID</a>
                    </div>
                    <p>Após a verificação, sua conta será liberada imediatamente e você poderá continuar usando todos os serviços Apple normalmente.</p>
                    <p>Se você não reconhece esta atividade, entre em contato conosco através dos canais oficiais da Apple.</p>
                    <p>Atenciosamente,<br>Equipe de Suporte Apple</p>
                `,
                errors: [
                    { id: 'account-suspension', description: 'Ameaça de suspensão de conta com prazo curto', element: null }
                ]
            },
            {
                id: 12,
                type: 'legitimate',
                senderName: 'Nubank',
                senderEmail: 'comunicacoes@nubank.com.br',
                date: '4 de Dezembro, 2024',
                subject: 'Extrato do seu cartão - Nubank',
                body: `
                    <p>Olá,</p>
                    <p>Seu extrato do cartão Nubank está disponível para visualização.</p>
                    <p>Resumo do período:</p>
                    <ul>
                        <li>Período: 01/12/2024 a 04/12/2024</li>
                        <li>Total de compras: R$ 1.250,00</li>
                        <li>Limite disponível: R$ 3.750,00</li>
                        <li>Data de vencimento: 15/12/2024</li>
                    </ul>
                    <p>Para visualizar o extrato completo e detalhes de todas as transações, acesse o aplicativo Nubank.</p>
                    <p>Lembre-se de pagar sua fatura até a data de vencimento para evitar juros.</p>
                    <p>Equipe Nubank</p>
                `,
                errors: []
            },
            {
                id: 13,
                type: 'phishing',
                senderName: 'WhatsApp',
                senderEmail: 'security@whatsapp-web.com',
                date: '3 de Dezembro, 2024',
                subject: 'Alerta de Segurança - Conta WhatsApp',
                body: `
                    <p>Prezado usuário,</p>
                    <p>Detectamos uma tentativa de acesso não autorizado à sua conta WhatsApp. Por segurança, implementamos medidas de proteção temporárias.</p>
                    <p>Para verificar que você é o proprietário legítimo da conta e remover as restrições, solicitamos que confirme algumas informações básicas.</p>
                    <p>Esta verificação é rápida e leva apenas alguns minutos. Para sua conveniência, você pode acessar diretamente através do link abaixo:</p>
                    <div class="action-button">
                        <a href="#" class="btn-primary" id="whatsapp-link">Verificar Conta WhatsApp</a>
                    </div>
                    <p>Após a verificação, sua conta será liberada imediatamente e você poderá continuar usando o WhatsApp normalmente.</p>
                    <p>Se você não reconhece esta tentativa de acesso, recomendamos que você altere sua senha e ative a verificação em duas etapas.</p>
                    <p>Atenciosamente,<br>Equipe de Segurança WhatsApp</p>
                `,
                errors: [
                    { id: 'whatsapp-security', description: 'Aplicativo de mensagem pedindo verificação de conta por email', element: null }
                ]
            },
            {
                id: 14,
                type: 'legitimate',
                senderName: 'Mercado Livre',
                senderEmail: 'compras@mercadolivre.com.br',
                date: '2 de Dezembro, 2024',
                subject: 'Compra aprovada - Mercado Livre',
                body: `
                    <p>Olá,</p>
                    <p>Sua compra foi aprovada e está sendo processada!</p>
                    <p>Detalhes da compra:</p>
                    <ul>
                        <li>Produto: Fone de Ouvido Bluetooth</li>
                        <li>Vendedor: Eletrônicos Express</li>
                        <li>Valor: R$ 89,90</li>
                        <li>Frete: Grátis</li>
                        <li>Total: R$ 89,90</li>
                        <li>Data estimada de entrega: 05/12/2024</li>
                    </ul>
                    <p>Você pode acompanhar sua compra através do link de rastreamento disponível em sua conta Mercado Livre.</p>
                    <p>Agradecemos sua compra!</p>
                    <p>Equipe Mercado Livre</p>
                `,
                errors: []
            }
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.bindElements();
        this.bindEvents();
        this.loadEmail(0);
        this.updateDisplay();
        this.updateNavigation();
    }
    
    bindElements() {
        this.elements = {
            score: document.getElementById('score'),
            foundErrors: document.getElementById('found-errors'),
            currentEmail: document.getElementById('current-email'),
            timer: document.getElementById('timer'),
            startGame: document.getElementById('start-game'),
            resetGame: document.getElementById('reset-game'),
            showHints: document.getElementById('show-hints'),
            nextEmailBtn: document.getElementById('next-email-btn'),
            finishGame: document.getElementById('finish-game'),
            hintsPanel: document.getElementById('hints-panel'),
            resultsModal: document.getElementById('results-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            finalStats: document.getElementById('final-stats'),
            errorList: document.getElementById('error-list'),
            playAgain: document.getElementById('play-again'),
            learnMore: document.getElementById('learn-more'),
            gameContainer: document.querySelector('.game-container'),
            prevEmail: document.getElementById('prev-email'),
            nextEmail: document.getElementById('next-email'),
            emailCounter: document.getElementById('email-counter'),
            emailStatus: document.getElementById('email-status'),
            senderName: document.getElementById('sender-name'),
            senderEmail: document.getElementById('sender-email'),
            emailDate: document.getElementById('email-date'),
            emailSubject: document.getElementById('email-subject'),
            emailBody: document.getElementById('email-body')
        };
    }
    
    bindEvents() {
        this.elements.startGame.addEventListener('click', () => this.startGame());
        this.elements.resetGame.addEventListener('click', () => this.resetGame());
        this.elements.showHints.addEventListener('click', () => this.toggleHints());
        this.elements.nextEmailBtn.addEventListener('click', () => this.nextEmail());
        this.elements.finishGame.addEventListener('click', () => this.finishGame());
        this.elements.playAgain.addEventListener('click', () => this.resetGame());
        this.elements.learnMore.addEventListener('click', () => this.showLearnMore());
        this.elements.prevEmail.addEventListener('click', () => this.previousEmail());
        this.elements.nextEmail.addEventListener('click', () => this.nextEmail());
        
        // Fechar modal ao clicar fora
        this.elements.resultsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.resultsModal) {
                this.hideModal();
            }
        });
    }
    
    loadEmail(index) {
        const email = this.emails[index];
        this.currentEmailIndex = index;
        
        // Atualizar conteúdo do email
        this.elements.senderName.textContent = email.senderName;
        this.elements.senderEmail.textContent = email.senderEmail;
        this.elements.emailDate.textContent = email.date;
        this.elements.emailSubject.textContent = email.subject;
        this.elements.emailBody.innerHTML = email.body;
        
        // Configurar elementos clicáveis
        this.setupClickableElements();
        
        // Resetar erros do email atual
        this.currentEmailErrors.clear();
        
        // Atualizar status
        this.updateEmailStatus();
        this.updateDisplay();
        this.updateNavigation();
        
        // Resetar elementos clicáveis
        this.resetClickableElements();
    }
    
    setupClickableElements() {
        const email = this.emails[this.currentEmailIndex];
        
        // Remover classes antigas
        document.querySelectorAll('.clickable-element').forEach(el => {
            el.classList.remove('clickable-element', 'correct', 'incorrect', 'found');
        });
        
        // Adicionar classe clicável a todos os elementos de texto
        const textElements = [
            this.elements.senderName,
            this.elements.senderEmail,
            this.elements.emailSubject,
            ...this.elements.emailBody.querySelectorAll('p'),
            ...this.elements.emailBody.querySelectorAll('li'),
            ...this.elements.emailBody.querySelectorAll('a')
        ];
        
        textElements.forEach(element => {
            if (element) {
                element.classList.add('clickable-element');
                element.addEventListener('click', (e) => this.handleElementClick(e, element));
            }
        });
        
        // Configurar erros específicos
        email.errors.forEach(error => {
            switch (error.id) {
                case 'bank-request':
                    error.element = this.elements.emailBody.querySelector('p:nth-child(3)');
                    break;
                case 'urgent-verification':
                    error.element = this.elements.emailBody.querySelector('p:nth-child(3)');
                    break;
                case 'fake-antivirus':
                    error.element = this.elements.emailBody.querySelector('p:nth-child(3)');
                    break;
                case 'suspicious-transaction':
                    error.element = this.elements.emailBody.querySelector('ul:first-of-type');
                    break;
                case 'login-attempt':
                    error.element = this.elements.emailBody.querySelector('p:nth-child(2)');
                    break;
                case 'account-suspension':
                    error.element = this.elements.emailBody.querySelector('p:nth-child(3)');
                    break;
                case 'whatsapp-security':
                    error.element = this.elements.emailBody.querySelector('p:nth-child(3)');
                    break;
            }
        });
    }
    
    handleElementClick(event, element) {
        if (!this.gameActive) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const email = this.emails[this.currentEmailIndex];
        
        // Verificar se o elemento clicado contém algum erro
        let isCorrect = false;
        let errorFound = null;
        
        email.errors.forEach(error => {
            if (error.element === element) {
                isCorrect = true;
                errorFound = error;
            }
        });
        
        if (isCorrect && errorFound) {
            // Clique correto
            element.classList.add('correct');
            this.currentEmailErrors.add(errorFound.id);
            this.foundErrors++;
            this.foundErrorIds.add(errorFound.id);
            
            this.updateDisplay();
        } else {
            // Clique incorreto - apenas marcar visualmente
            element.classList.add('incorrect');
            
            // Remover classe incorreta após 1 segundo
            setTimeout(() => {
                element.classList.remove('incorrect');
            }, 1000);
        }
    }
    

    

    
    previousEmail() {
        if (this.currentEmailIndex > 0) {
            this.loadEmail(this.currentEmailIndex - 1);
        }
    }
    
    nextEmail() {
        if (this.currentEmailIndex < this.emails.length - 1) {
            this.loadEmail(this.currentEmailIndex + 1);
        }
    }
    
    updateNavigation() {
        this.elements.prevEmail.disabled = this.currentEmailIndex === 0;
        this.elements.nextEmail.disabled = this.currentEmailIndex === this.emails.length - 1;
        this.elements.emailCounter.textContent = `Email ${this.currentEmailIndex + 1} de ${this.emails.length}`;
    }
    
    updateEmailStatus() {
        const email = this.emails[this.currentEmailIndex];
        const statusElement = this.elements.emailStatus;
        
        statusElement.className = 'status-indicator';
        
        if (this.completedEmails.has(this.currentEmailIndex)) {
            statusElement.classList.add('completed');
            statusElement.innerHTML = '<span class="status-text">✅ Completado</span>';
        } else if (email.type === 'phishing') {
            statusElement.classList.add('phishing');
            statusElement.innerHTML = '<span class="status-text">🚨 Email de Phishing</span>';
        } else {
            statusElement.classList.add('legitimate');
            statusElement.innerHTML = '<span class="status-text">✅ Email Legítimo</span>';
        }
    }
    
    resetClickableElements() {
        document.querySelectorAll('.clickable-element').forEach(el => {
            el.classList.remove('correct', 'incorrect', 'found');
        });
    }
    
    startGame() {
        this.gameActive = true;
        this.startTime = Date.now();
        this.elements.gameContainer.classList.add('game-active');
        this.elements.startGame.disabled = true;
        this.elements.startGame.textContent = 'Jogo em Andamento...';
        
        this.startTimer();
        this.showNotification('Jogo iniciado! Clique nos elementos suspeitos para encontrar erros de phishing.', 'info');
    }
    
    resetGame() {
        this.score = 0;
        this.foundErrors = 0;
        this.foundErrorIds.clear();
        this.currentEmailErrors.clear();
        this.completedEmails.clear();
        this.userErrorsByEmail.clear();
        this.gameActive = false;
        this.elements.gameContainer.classList.remove('game-active');
        this.elements.startGame.disabled = false;
        this.elements.startGame.textContent = 'Iniciar Jogo';
        
        this.loadEmail(0);
        this.stopTimer();
        this.hideModal();
        this.hideHints();
        
        this.showNotification('Jogo reiniciado! Clique em "Iniciar Jogo" para começar.', 'info');
    }
    
    endGame() {
        this.gameActive = false;
        this.stopTimer();
        this.elements.gameContainer.classList.remove('game-active');
        
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = Math.floor(timeElapsed % 60);
        
        // Bônus final por tempo
        const timeBonus = Math.max(0, 500 - Math.floor(timeElapsed * 2));
        this.score += timeBonus;
        
        this.showResults(minutes, seconds);
    }
    
    showResults(minutes, seconds) {
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Gerar análise detalhada dos emails
        let analysisHTML = '';
        let correctClassifications = 0;
        let correctErrors = 0;
        
        this.emails.forEach((email, emailIndex) => {
            const userErrors = this.getUserErrorsForEmail(emailIndex);
            const userClassifiedAsPhishing = userErrors.size > 0;
            const correctClassification = (email.type === 'phishing' && userClassifiedAsPhishing) ||
                                        (email.type === 'legitimate' && !userClassifiedAsPhishing);
            
            if (correctClassification) correctClassifications++;
            
            const correctErrorIds = email.errors.map(e => e.id);
            const userCorrectErrors = correctErrorIds.filter(id => userErrors.has(id));
            correctErrors += userCorrectErrors.length;
            
            analysisHTML += `
                <div class="email-analysis ${correctClassification ? 'correct' : 'incorrect'}">
                    <h4>Email ${emailIndex + 1}: ${email.type === 'phishing' ? 'Phishing' : 'Legítimo'}</h4>
                    <p><strong>Classificação:</strong> ${correctClassification ? '✅ Correta' : '❌ Incorreta'}</p>
                    <p><strong>Erros apontados:</strong> ${userErrors.size}</p>
                    <p><strong>Erros corretos:</strong> ${userCorrectErrors.length}/${correctErrorIds.length}</p>
                    ${userCorrectErrors.length > 0 ? `<p><strong>Erros identificados:</strong> ${userCorrectErrors.map(id => email.errors.find(e => e.id === id).description).join(', ')}</p>` : ''}
                </div>
            `;
        });
        
        this.elements.modalTitle.textContent = 'Resultados do Jogo 🎯';
        this.elements.modalMessage.textContent = `Você finalizou o jogo em ${timeString}!`;
        
        // Estatísticas finais
        this.elements.finalStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Pontuação Final:</span>
                <span class="stat-value">${this.score} pontos</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Tempo Total:</span>
                <span class="stat-value">${timeString}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Classificações Corretas:</span>
                <span class="stat-value">${correctClassifications}/14</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Erros Corretos:</span>
                <span class="stat-value">${correctErrors}/7</span>
            </div>
        `;
        
        // Análise detalhada
        this.elements.errorList.innerHTML = `
            <h3>Análise Detalhada</h3>
            ${analysisHTML}
        `;
        
        this.elements.resultsModal.style.display = 'block';
    }
    
    hideModal() {
        this.elements.resultsModal.style.display = 'none';
    }
    
    toggleHints() {
        const isVisible = this.elements.hintsPanel.style.display === 'block';
        if (isVisible) {
            this.hideHints();
        } else {
            this.showHints();
        }
    }
    
    showHints() {
        this.elements.hintsPanel.style.display = 'block';
        this.elements.showHints.textContent = 'Ocultar Dicas';
    }
    
    hideHints() {
        this.elements.hintsPanel.style.display = 'none';
        this.elements.showHints.textContent = 'Dicas';
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.startTime) {
                const elapsed = Date.now() - this.startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                this.elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        this.elements.score.textContent = this.score;
        this.elements.foundErrors.textContent = `${this.foundErrors}/${this.totalErrors}`;
        this.elements.currentEmail.textContent = `${this.currentEmailIndex + 1}/${this.emails.length}`;
    }
    
    nextEmail() {
        // Salvar erros do usuário para este email
        this.userErrorsByEmail.set(this.currentEmailIndex, new Set(this.currentEmailErrors));
        
        // Marcar email como completado
        this.completedEmails.add(this.currentEmailIndex);
        
        // Ir para o próximo email
        if (this.currentEmailIndex < this.emails.length - 1) {
            this.loadEmail(this.currentEmailIndex + 1);
        }
    }
    
    finishGame() {
        this.gameActive = false;
        this.stopTimer();
        this.elements.gameContainer.classList.remove('game-active');
        
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = Math.floor(timeElapsed % 60);
        
        // Calcular pontuação final
        this.calculateFinalScore();
        
        this.showResults(minutes, seconds);
    }
    
    calculateFinalScore() {
        this.score = 0;
        
        // Calcular pontuação baseada nos erros corretos
        this.emails.forEach((email, emailIndex) => {
            const userErrors = this.getUserErrorsForEmail(emailIndex);
            const correctErrors = email.errors.map(e => e.id);
            
            // Pontos por erros corretos
            correctErrors.forEach(errorId => {
                if (userErrors.has(errorId)) {
                    this.score += 50; // Pontos base por erro correto
                }
            });
            
            // Pontos por classificação correta do email
            const userClassifiedAsPhishing = userErrors.size > 0;
            if ((email.type === 'phishing' && userClassifiedAsPhishing) ||
                (email.type === 'legitimate' && !userClassifiedAsPhishing)) {
                this.score += 100; // Bônus por classificação correta
            }
        });
        
        // Bônus de tempo
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const timeBonus = Math.max(0, 500 - Math.floor(timeElapsed * 2));
        this.score += timeBonus;
    }
    
    getUserErrorsForEmail(emailIndex) {
        return this.userErrorsByEmail.get(emailIndex) || new Set();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    showLearnMore() {
        const learnMoreContent = `
            <div style="text-align: left; line-height: 1.6;">
                <h3>🔒 Como se proteger do phishing:</h3>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li><strong>Verifique o remetente:</strong> Sempre confirme se o email vem de um domínio oficial</li>
                    <li><strong>Não clique em links suspeitos:</strong> Passe o mouse sobre links para ver o destino real</li>
                    <li><strong>Desconfie de urgência:</strong> Phishers criam sensação de urgência para pressionar</li>
                    <li><strong>Verifique erros de gramática:</strong> Emails oficiais raramente têm erros</li>
                    <li><strong>Não forneça dados pessoais:</strong> Bancos nunca pedem senhas por email</li>
                    <li><strong>Use autenticação de dois fatores:</strong> Adicione uma camada extra de segurança</li>
                    <li><strong>Mantenha software atualizado:</strong> Atualizações incluem correções de segurança</li>
                </ul>
                
                <h3>🚨 Sinais de alerta:</h3>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>Endereços de email com domínios estranhos</li>
                    <li>Assuntos com urgência excessiva</li>
                    <li>Erros de gramática e ortografia</li>
                    <li>Links suspeitos ou encurtados</li>
                    <li>Pedidos de dados pessoais</li>
                    <li>Ameaças ou pressão psicológica</li>
                    <li>Promessas de dinheiro fácil</li>
                </ul>
            </div>
        `;
        
        this.elements.modalTitle.textContent = '📚 Aprenda mais sobre phishing';
        this.elements.modalMessage.innerHTML = learnMoreContent;
        this.elements.finalStats.innerHTML = '';
        this.elements.errorList.innerHTML = '';
        this.elements.resultsModal.style.display = 'block';
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const game = new PhishingGame();
    
    // Adicionar funcionalidades extras
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            game.hideModal();
        }
        if (e.key === 'h' || e.key === 'H') {
            game.toggleHints();
        }
        if (e.key === 'ArrowLeft' && game.currentEmailIndex > 0) {
            game.previousEmail();
        }
        if (e.key === 'ArrowRight' && game.currentEmailIndex < game.emails.length - 1) {
            game.nextEmail();
        }
    });
    
    // Prevenir que links de phishing funcionem
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.href === '#') {
            e.preventDefault();
            if (game.gameActive) {
                game.showNotification('⚠️ Este é um link malicioso! Não clique em links suspeitos.', 'warning');
            }
        }
    });
}); 