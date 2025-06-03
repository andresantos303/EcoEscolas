require('dotenv').config();
const nodemailer = require('nodemailer');

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
  
module.exports = {
  enviarEmail
};
