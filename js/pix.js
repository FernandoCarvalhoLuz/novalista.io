// js/pix.js (modo module)
// 1) Importa apenas o Firestore do CDN
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
  // 2) Constantes de configuração
  const EMAIL_TO   = 'fernandocarvalho.c@hotmail.com';
  const serviceID  = 'service_z0i2wae';
  const templateID = 'template_tpponok';

  // 3) ID de todos os presentes (deve casar com data-id de cada .card)
  const gifts = [
    'cesto-jolitex',
    'garrafa-tramontina',
    'sapateira-safira',
    'cortina-blackout',
    'varal-chao'
  ];

  // 4) Recupera do Firestore quais já foram comprados e desativa no DOM
  for (const id of gifts) {
    try {
      const snap = await getDoc(doc(db, 'presents', id));
      if (snap.exists() && snap.data().bought === true) {
        const card = document.querySelector(`.card[data-id="${id}"]`);
        if (card) applyDisabledState(card);
      }
    } catch (e) {
      console.error(`Erro ao checar status do presente ${id}:`, e);
    }
  }

  // 5) Associa eventos a cada botão de compra/Pix
  document.querySelectorAll('.card').forEach(card => {
    const id     = card.dataset.id;
    const title  = card.querySelector('h3').textContent;
    const buyBtn = card.querySelector('.buy');
    const pixBtn = card.querySelector('.pix');

    buyBtn.addEventListener('click', async e => {
      e.preventDefault();
      if (!confirm(`Você está prestes a comprar "${title}". Deseja continuar?`)) return;
      window.open(buyBtn.href, '_blank');
      await handlePurchase(id, card, title, 'Compra Online');
    });

    pixBtn.addEventListener('click', async () => {
      if (!confirm(`Você está prestes a pagar via Pix "${title}". Deseja continuar?`)) return;
      prompt('Copie nossa chave Pix:', pixBtn.dataset.pix);
      await handlePurchase(id, card, title, 'Pix');
    });
  });

  // 6) Função unificada: desativa visual, envia e-mail e grava no Firestore
  async function handlePurchase(id, card, title, method) {
    applyDisabledState(card);
    await sendEmail(title, method);
    try {
      await setDoc(doc(db, 'presents', id), { bought: true }, { merge: true });
    } catch (e) {
      console.error(`Erro ao gravar Firestore para ${id}:`, e);
    }
  }

  // 7) Envia o e-mail via EmailJS (já inicializado no HTML)
  async function sendEmail(itemName, method) {
    try {
      await emailjs.send(serviceID, templateID, {
        to_email:       EMAIL_TO,
        item_name:      itemName,
        payment_method: method
      });
    } catch (e) {
      console.error('Erro ao enviar e-mail:', e);
    }
  }

  // 8) Aplica estilo “desativado” e badge de status
  function applyDisabledState(card) {
    if (card.classList.contains('disabled')) return;
    card.classList.add('disabled');
    const span = document.createElement('span');
    span.className   = 'status';
    span.textContent = 'Presente Enviado';
    card.querySelector('.actions').appendChild(span);
  }
});
