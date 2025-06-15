// js/pix.js
document.addEventListener('DOMContentLoaded', () => {
  const EMAIL_TO   = 'fernandocarvalho.c@hotmail.com';
  const serviceID  = 'service_z0i2wae';
  const templateID = 'template_tpponok';

  // Função de envio de e-mail
  async function sendEmail(itemName, method) {
    try {
      const res = await emailjs.send(serviceID, templateID, {
        to_email:       EMAIL_TO,
        item_name:      itemName,
        payment_method: method
      });
      console.log('✓ Email sent:', res);
    } catch (err) {
      console.error('✗ Email error:', err);
      alert('Falha ao enviar e-mail: ' + (err.text || err));
    }
  }

  // Marca o card como enviado e dispara o email
  function marcarComoEnviado(card, title, method) {
    card.classList.add('disabled');
    const span = document.createElement('span');
    span.className   = 'status';
    span.textContent = 'Presente Enviado';
    card.querySelector('.actions').appendChild(span);
    sendEmail(title, method);
  }

  // Para cada botão, “buy” ou “pix”
  document.querySelectorAll('.card').forEach(card => {
    const title = card.querySelector('h3').textContent;

    // juntamos buy e pix num mesmo loop
    card.querySelectorAll('.buy, .pix').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();

        const isBuy = btn.classList.contains('buy');
        const method = isBuy ? 'Compra Online' : 'Pix';

        // chama o confirm
        const msg = isBuy
          ? `Confirmar compra de "${title}"?`
          : `Confirmar Pix para "${title}"?`;
        if (!confirm(msg)) return;

        // ação de compra abre a URL, Pix mostra prompt
        if (isBuy) {
          window.open(btn.href, '_blank');
        } else {
          prompt('Copie nossa chave Pix:', btn.dataset.pix);
        }

        marcarComoEnviado(card, title, method);
      });
    });
  });
});
