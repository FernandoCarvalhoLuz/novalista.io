// js/pix.js
document.addEventListener('DOMContentLoaded', () => {
  const EMAIL_TO   = 'fernandocarvalho.c@hotmail.com';
  const serviceID  = 'service_z0i2wae';
  const templateID = 'template_tpponok';

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

  function marcarComoEnviado(card, title, method) {
    card.classList.add('disabled');
    const span = document.createElement('span');
    span.className   = 'status';
    span.textContent = 'Presente Enviado';
    card.querySelector('.actions').appendChild(span);
    sendEmail(title, method);
  }

  document.querySelectorAll('.card').forEach(card => {
    const title  = card.querySelector('h3').textContent;
    const buyBtn = card.querySelector('.buy');
    const pixBtn = card.querySelector('.pix');

    buyBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!confirm(`Confirmar compra de "${title}"?`)) return;
      window.open(buyBtn.href, '_blank');
      marcarComoEnviado(card, title, 'Compra Online');
    });

    pixBtn.addEventListener('click', () => {
      if (!confirm(`Confirmar Pix para "${title}"?`)) return;
      prompt('Copie nossa chave Pix:', pixBtn.dataset.pix);
      marcarComoEnviado(card, title, 'Pix');
    });
  });
});
