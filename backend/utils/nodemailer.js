require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require("../models/user.model.js");

let transporter = nodemailer.createTransport({
 service: 'gmail', // for outlook: use ‘hotmail’
 auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function enviarEmail(destinatario, assunto, texto, html) {
  try {
    let info = await transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to: destinatario,
      subject: assunto,
      text: texto,
      html: html
    });
    console.log('Mensagem enviada. ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    throw err;
  }
}

async function enviarEmailNotificação(tipo, assunto, texto, html) {
  try {
    // Busca todos os users cujo campo "type" seja igual a tipo
    const users = await User.find({ type: tipo }).select('email');
    if (users.length === 0) {
      console.log(`Nenhum usuário encontrado com o cargo "${tipo}".`);
      return;
    }

    // Para cada user, envia um e-mail
    await Promise.all(
      users.map(({ email }) =>
        enviarEmail(email, assunto, texto, html).catch(err => {
          console.error(`Falha ao enviar para ${email}:`, err.message);
        })
      )
    );

    console.log(`E-mails enviados para ${users.length} usuário(s) com cargo "${tipo}".`);
  } catch (err) {
    console.error('Erro ao notificar usuários por cargo:', err);
    throw err;
  }
}
  
module.exports = {
  enviarEmail,
  enviarEmailNotificação
};
