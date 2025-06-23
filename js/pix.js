// js/pix.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('▶ pix.js carregado');  

  const EMAIL_TO   = 'fernandocarvalho.c@hotmail.com';
  const serviceID  = 'service_z0i2wae';
  const templateID = 'template_tpponok';
  const SHEETDB_API = 'https://sheetdb.io/api/v1/4p6p79c7eideg';

  // Função para obter e salvar status no localStorage
  function getEnviados() {
    return JSON.parse(localStorage.getItem('presentesEnviados') || '{}');
  }
  function setEnviado(id) {
    const enviados = getEnviados();
    enviados[id] = true;
    localStorage.setItem('presentesEnviados', JSON.stringify(enviados));
  }

  // função para envio de e-mail
  async function sendEmail(itemName, method, nome, mensagem) {
    console.log(`  → Enviando e-mail: ${itemName} via ${method}`);
    try {
      const res = await emailjs.send(serviceID, templateID, {
        to_email:       EMAIL_TO,
        item_name:      itemName,
        payment_method: method,
        nome_comprador: nome || '',
        mensagem:       mensagem || ''
      });
      console.log('  ✓ Email enviado:', res);
    } catch (err) {
      console.error('  ✗ Erro no envio de e-mail:', err);
      alert('Falha ao enviar e-mail: ' + (err.text || err));
    }
  }

  // Função para exibir formulário de nome e mensagem
  function showForm(callback) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    const form = document.createElement('form');
    form.style.background = '#fff';
    form.style.padding = '2rem';
    form.style.borderRadius = '8px';
    form.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    form.innerHTML = `
      <h3 style="margin-bottom:1rem">Quem está enviando o presente?</h3>
      <label>Seu nome:<br><input name="nome" required style="width:100%;margin-bottom:1rem"></label><br>
      <label>Mensagem para os noivos (opcional):<br><textarea name="mensagem" style="width:100%;margin-bottom:1rem"></textarea></label><br>
      <button type="submit" class="btn" style="background:#c9a66b;color:#fff">Enviar</button>
      <button type="button" class="btn" style="margin-left:8px" id="cancelar">Cancelar</button>
    `;
    overlay.appendChild(form);
    document.body.appendChild(overlay);

    form.nome.focus();

    form.onsubmit = e => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const mensagem = form.mensagem.value.trim();
      document.body.removeChild(overlay);
      callback(nome, mensagem);
    };
    form.querySelector('#cancelar').onclick = () => {
      document.body.removeChild(overlay);
    };
  }

  // Atualiza status do presente na planilha
  function marcarComoEnviadoAPI(id) {
    return fetch(`${SHEETDB_API}/id/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { status: 'enviado' } })
    }).then(res => res.json());
  }

  // desativa visual e dispara o e-mail
  function marcarComoEnviado(card, title, method, id, nome, mensagem) {
    if (id === 'presente-simbolico') return; // nunca descontinuar
    console.log(`  → marcando como enviado: ${title}`);
    card.classList.add('disabled');
    if (!card.querySelector('.status')) {
      const span = document.createElement('span');
      span.className   = 'status';
      span.textContent = 'Presente Enviado';
      card.querySelector('.actions').appendChild(span);
    }
    sendEmail(title, method, nome, mensagem);
    marcarComoEnviadoAPI(id);
  }

  // Busca status dos presentes na API e inicializa os cards
  fetch(SHEETDB_API)
    .then(res => res.json())
    .then(data => {
      // data é um array de objetos {id, status}
      const statusMap = {};
      data.forEach(item => {
        statusMap[item.id] = item.status;
      });

      document.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('h3').textContent;
        const id = card.getAttribute('data-id');
        console.log('Bindando card:', title);

        // Desabilita se status for enviado
        if (statusMap[id] === 'enviado') {
          card.classList.add('disabled');
          if (!card.querySelector('.status')) {
            const span = document.createElement('span');
            span.className = 'status';
            span.textContent = 'Presente Enviado';
            card.querySelector('.actions').appendChild(span);
          }
          // Adiciona botão WhatsApp mesmo se já enviado
          if (!card.querySelector('.whatsapp-link')) {
            const waBtn = document.createElement('a');
            waBtn.href = 'https://wa.me/5521988297170?text=Ol%C3%A1%2C%20passando%20para%20confirmar%20o%20envio%20do%20presente%20de%20voc%C3%AAs...';
            waBtn.target = '_blank';
            waBtn.className = 'btn whatsapp-link';
            waBtn.style.background = '#25D366';
            waBtn.style.color = 'white';
            waBtn.style.marginLeft = '8px';
            waBtn.textContent = 'Notificar os noivos via WhatsApp';
            waBtn.style.pointerEvents = 'auto';
            waBtn.style.opacity = '1';
            card.querySelector('.actions').appendChild(waBtn);
          }
        }

        // pega tanto .buy quanto .pix em cada cartão
        const buttons = Array.from(card.querySelectorAll('.buy, .pix'));
        if (buttons.length === 0) {
          console.warn(`  ⚠️ Nenhum botão encontrado para "${title}"`);
        }

        buttons.forEach(btn => {
          console.log(`  → encontrando botão (${btn.className}) em "${title}"`);
          btn.addEventListener('click', e => {
            if (card.classList.contains('disabled')) {
              e.preventDefault();
              return;
            }
            // AVISO DE DESCONTINUAÇÃO
            if (id !== 'presente-simbolico') {
              if (!confirm('Atenção: ao continuar, este item será descontinuado do site e não poderá ser comprado novamente. Tem certeza que deseja comprar?')) {
                e.preventDefault();
                return;
              }
            }
            e.preventDefault();
            // FORMULÁRIO DE NOME E MENSAGEM
            showForm((nome, mensagem) => {
              const isBuy = btn.classList.contains('buy');
              const method = isBuy ? 'Compra Online' : 'Pix';
              // Só marcar como enviado se não for presente-simbolico
              marcarComoEnviado(card, title, method, id, nome, mensagem);
              // OPÇÃO DE NOTIFICAR OS NOIVOS VIA WHATSAPP
              setTimeout(() => {
                if (!card.querySelector('.whatsapp-link')) {
                  const waBtn = document.createElement('a');
                  waBtn.href = 'https://wa.me/5521988297170?text=Ol%C3%A1%2C%20passando%20para%20confirmar%20o%20envio%20do%20presente%20de%20voc%C3%AAs...';
                  waBtn.target = '_blank';
                  waBtn.className = 'btn whatsapp-link';
                  waBtn.style.background = '#25D366';
                  waBtn.style.color = 'white';
                  waBtn.style.marginLeft = '8px';
                  waBtn.textContent = 'Notificar os noivos via WhatsApp';
                  waBtn.style.pointerEvents = 'auto';
                  waBtn.style.opacity = '1';
                  waBtn.style.display = 'block';
                  waBtn.style.width = '100%';
                  waBtn.style.margin = '16px 0 0 0';
                  card.querySelector('.actions').appendChild(waBtn);
                }
              }, 300);
              // Após o envio, abrir link de compra ou mostrar Pix
              if (isBuy) {
                window.open(btn.href, '_blank');
              } else {
                prompt('Copie nossa chave Pix:', btn.dataset.pix);
              }
            });
          });
        });
      });
    });
});
