// js/pix.js (modo module)
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
  const EMAIL_TO   = 'fernandocarvalho.c@hotmail.com';
  const serviceID  = 'service_z0i2wae';
  const templateID = 'template_tpponok';

  // 1) Buscar no Firestore quais IDs já estão comprados
  const purchased = [];
  const gifts = ['cesto-jolitex','garrafa-tramontina','sapateira-safira','cortina-blackout','varal-chao'];
  for (const id of gifts) {
    const snap = await getDoc(doc(db, 'presents', id));
    if (snap.exists() && snap.data().bought === true) {
      purchased.push(id);
      // já desativa o card
      const card = document.querySelector(`.card[data-id="${id}"]`);
      if (card) disableCard(card);
    }
  }

  // 2) Bind nos botões, igual seu código de confirm + email
  document.querySelectorAll('.card').forEach(card => {
    const id     = card.dataset.id;
    const title  = card.querySelector('h3').textContent;
    const buyBtn = card.querySelector('.buy');
    const pixBtn = card.querySelector('.pix');

    buyBtn.addEventListener('click', async e => {
      e.preventDefault();
      if (!confirm(`Comprar "${title}"?`)) return;
      window.open(buyBtn.href, '_blank');
      await afterPurchase(id, card, title, 'Compra Online');
    });
    pixBtn.addEventListener('click', async () => {
      if (!confirm(`Pix para "${title}"?`)) return;
      prompt('Copie nossa chave Pix:', pixBtn.dataset.pix);
      await afterPurchase(id, card, title, 'Pix');
    });
  });

  // 3) Função unificada
  async function afterPurchase(id, card, title, method) {
    disableCard(card);
    await sendEmail(title, method);
    // 4) Grava no Firestore
    await setDoc(doc(db, 'presents', id), { bought: true }, { merge: true });
  }

  // 5) Funções auxiliares
  async function sendEmail(itemName, method) {
    await emailjs.send(serviceID, templateID, {
      to_email:       EMAIL_TO,
      item_name:      itemName,
      payment_method: method
    });
  }
  function disableCard(card) {
    card.classList.add('disabled');
    if (!card.querySelector('.status')) {
      const span = document.createElement('span');
      span.className   = 'status';
      span.textContent = 'Presente Enviado';
      card.querySelector('.actions').appendChild(span);
    }
  }
});
