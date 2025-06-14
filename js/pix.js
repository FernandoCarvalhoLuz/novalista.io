document.querySelectorAll('.pix').forEach(btn => {
  btn.addEventListener('click', () => {
    const chave = '164.836.197-82';
    // opcional: gerar QR dinamicamente com API ou exibir imagem estática
    // aqui só exibimos a chave para copiar
    prompt('Copie nossa chave Pix:', chave);
  });
});
