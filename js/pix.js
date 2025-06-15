// js/pix.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('▶ pix.js carregado');  

  const EMAIL_TO   = 'fernandocarvalho.c@hotmail.com';
  const serviceID  = 'service_z0i2wae';
  const templateID = 'template_tpponok';

  // função para envio de e-mail
  async function sendEmail(itemName, method) {
    console.log(`  → Enviando e-mail: ${itemName} via ${method}`);
    try {
      const res = await emailjs.send(serviceID, templateID, {
        to_email:       EMAIL_TO,
        item_name:      itemName,
        payment_method: method
      });
      console.log('  ✓ Email enviado:', res);
    } catch (err) {
      console.error('  ✗ Erro no envio de e-mail:', err);
      alert('Falha ao enviar e-mail: ' + (err.text || err));
    }
  }

  // desativa visual e dispara o e-mail
  function marcarComoEnviado(card, title, method) {
    console.log(`  → marcando como enviado: ${title}`);
    card.classList.add('disabled');
    const span = document.createElement('span');
    span.className   = 'status';
    span.textContent = 'Presente Enviado';
    card.querySelector('.actions').appendChild(span);
    sendEmail(title, method);
  }

  // percorre cada card
  document.querySelectorAll('.card').forEach(card => {
    const title = card.querySelector('h3').textContent;
    console.log('Bindando card:', title);

    // pega tanto .buy quanto .pix em cada cartão
    const buttons = Array.from(card.querySelectorAll('.buy, .pix'));
    if (buttons.length === 0) {
      console.warn(`  ⚠️ Nenhum botão encontrado para "${title}"`);
    }

    buttons.forEach(btn => {
      console.log(`  → encontrando botão (${btn.className}) em "${title}"`);
      btn.addEventListener('click', e => {
        console.log(`  ✚ clicou em ${btn.className} para "${title}"`);
        e.preventDefault();

        const isBuy = btn.classList.contains('buy');
        const method = isBuy ? 'Compra Online' : 'Pix';
        const msg = isBuy
          ? `Confirmar compra de "${title}"?`
          : `Confirmar Pix para "${title}"?`;

        if (!confirm(msg)) {
          console.log('    ✖ usuário cancelou');
          return;
        }

        if (isBuy) {
          console.log('    → abrindo link de compra');
          window.open(btn.href, '_blank');
        } else {
          console.log('    → mostrando prompt do Pix');
          prompt('Copie nossa chave Pix:', btn.dataset.pix);
        }

        marcarComoEnviado(card, title, method);
      });
    });
  });
});
