require('dotenv').config();
const readline = require('readline');
const brevo = require('brevo');

// Configuração do Brevo
const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const senderName = process.env.BREVO_SENDER_NAME || 'Ecommerce';

if (!apiKey || !senderEmail) {
  console.error('❌ Erro: BREVO_API_KEY e BREVO_SENDER_EMAIL são obrigatórios no .env');
  process.exit(1);
}

// Inicializa o cliente Brevo
const defaultClient = brevo.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = apiKey;

const apiInstance = new brevo.TransactionalEmailsApi();

// Interface para ler entrada do terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Função para substituir placeholders no HTML
function replacePlaceholders(html, data) {
  return html
    .replace(/\{\{nome\}\}/g, data.nome || 'Cliente')
    .replace(/\{\{email\}\}/g, data.email || '');
}

// Função principal de envio
async function sendEmail(toEmail, nome = 'Cliente') {
  try {
    // Carrega o template HTML
    const fs = require('fs');
    const path = require('path');
    const htmlPath = path.join(__dirname, 'template.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Substitui os placeholders
    htmlContent = replacePlaceholders(htmlContent, { nome, email: toEmail });

    // Configura o e-mail
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Bem-vindo ao Ecommerce – Sua loja online está pronta!';
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { email: senderEmail, name: senderName };
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.replyTo = { email: senderEmail, name: senderName };

    // Envia
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ E-mail enviado com sucesso!`);
    console.log(`📨 Message ID: ${response.messageId}`);
    console.log(`📬 Destinatário: ${toEmail}`);
    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensagem: ${JSON.stringify(error.response.body, null, 2)}`);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Início do script
console.log('📧 Envio de E-mail via Brevo (Ecommerce)');
console.log('----------------------------------------');

rl.question('Digite o e-mail do destinatário: ', (email) => {
  if (!email || !email.includes('@')) {
    console.error('❌ E-mail inválido. Tente novamente.');
    rl.close();
    process.exit(1);
  }

  rl.question('Digite o nome do destinatário (opcional, Enter para "Cliente"): ', async (nome) => {
    rl.close();

    const nomeFinal = nome.trim() || 'Cliente';
    console.log(`\n📤 Enviando para ${email} (${nomeFinal})...\n`);
    try {
      await sendEmail(email, nomeFinal);
    } catch (err) {
      console.error('❌ Falha no envio.');
      process.exit(1);
    }
    process.exit(0);
  });
});