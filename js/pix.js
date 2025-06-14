// js/pix.js
document.addEventListener('DOMContentLoaded', () => {
  // ← seus IDs do EmailJS
  const EMAIL_TO    = 'fernandocarvalho.c@hotmail.com';
  const serviceID   = 'service_z0i2wae';
  const templateID  = 'template_tpponok';
  const userID      = '_DUdaeVfhVHnkL3YJ';

  // Função para enviar e-mail via EmailJS
  function sendEmail(itemName, method) {
    return emailjs.send(
      serviceID,
      templateID,
      {
        to_email:       EMAIL_TO,
        item_name:      itemName,
        payment_method: method
      },
      userID
    );
  }

  // Função comum para desativar card e notificar
  async function marcarComoEnviado(card, title, method) {
    // 1) Desativa visualmente o card
    card.classList.add('disabled');
    const span = document.createElement('span');
    span.className   = 'status';
    span.textContent = 'Presente Enviado';
    card.querySelector('.actions').appendChild(span);

    // 2) Envia o e-mail de notificação
    try {
      await sendEmail(title, method);
      console.log('E-mail enviado com sucesso.');
    } catch (err) {
      console.error('Erro ao enviar e-mail:', err);
    }
  }

  // Associa eventos a cada card
  document.querySelectorAll('.card').forEach(card => {
    const title  = card.querySelector('h3').textContent;
    const buyBtn = card.querySelector('.buy');
    const pixBtn = card.querySelector('.pix');

    // Compras Online
    buyBtn.addEventListener('click', event => {
      event.preventDefault();
      const confirmMsg = `Você está prestes a comprar "${title}".\n\n` +
                         `Após confirmar, este item ficará indisponível.\n\n` +
                         `Deseja continuar?`;
      if (!confirm(confirmMsg)) return;

      window.open(buyBtn.href, '_blank');
      marcarComoEnviado(card, title, 'Compra Online');
    });

    // Pagamento via Pix
    pixBtn.addEventListener('click', () => {
      const confirmMsg = `Você está prestes a pagar via Pix "${title}".\n\n` +
                         `Após confirmar, este item ficará indisponível.\n\n` +
                         `Deseja continuar?`;
      if (!confirm(confirmMsg)) return;

      // mostra a chave Pix para copiar
      const pixKey = '164.836.197-82';
      prompt('Copie nossa chave Pix:', pixKey);

      marcarComoEnviado(card, title, 'Pix');
    });
  });
});
