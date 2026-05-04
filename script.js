/* Trae tu Coca — interacción base */

(() => {
  /* mapa: título de la celda → archivo de imagen en imagenes/matriz/ */
  const cellImages = {
    'Selecciona una opción':              '01-selecciona-opcion',
    'Precompra tu almuerzo':              '01-precompra-almuerzo',
    'Come bien siempre':                  '01-come-bien-siempre',
    'Bolsa térmica Tadeo':                '02-bolsa-termica',
    'Coca circular Utadeo':               '02-coca-circular',
    'Lockers térmicos':                   '02-lockers-termicos',
    'Estado de micros en vivo':           '03-micros-vivo',
    'Estación de calentado integral':     '03-calentado-integral',
    'Estaciones móviles':                 '03-estaciones-moviles',
    'Estación de lavado tradicional':     '04-lavado-tradicional',
    'Enjuague express compacto':          '04-enjuague-express',
    'Agua gris circular':                 '04-agua-gris',
    'Contenedor de residuos orgánicos':   '05-residuos-organicos',
    'Compostera del campus':              '05-compostera',
    'Política Cero Residuo':              '05-cero-residuo',
    'Sistema modular madera-metal':       '06-modular-madera-metal',
    'Mesas con energía':                  '06-mesas-energia',
    'Ágora del almuerzo':                 '06-agora-almuerzo',
  };

  document.querySelectorAll('.matrix-item').forEach(item => {
    const title = item.querySelector('h3')?.textContent.trim();
    const slug = cellImages[title];
    if (!slug) return;
    const wrap = document.createElement('div');
    wrap.className = 'cell-img';
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    /* prueba .jpg → .jpeg → .png → .webp; si todo falla, deja el degradado madera */
    const exts = ['jpg', 'jpeg', 'png', 'webp'];
    let i = 0;
    img.onerror = () => {
      i++;
      if (i < exts.length) img.src = `imagenes/matriz/${slug}.${exts[i]}`;
      else img.remove();
    };
    img.src = `imagenes/matriz/${slug}.${exts[0]}`;
    wrap.appendChild(img);
    item.insertBefore(wrap, item.firstChild);
  });

  const chips = document.querySelectorAll('.filters .chip');
  const items = document.querySelectorAll('.matrix-item');

  function applyFilter(filter) {
    items.forEach(item => {
      const tags = (item.dataset.tags || '').split(',').map(t => t.trim());
      const match = filter === 'all' || tags.includes(filter);
      item.classList.toggle('is-dim', !match);
      item.classList.toggle('is-active', match && filter !== 'all');
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      applyFilter(chip.dataset.filter);
    });
  });

  /* etiqueta de horizonte para vista mobile */
  const horizons = ['Corto plazo', 'Mediano plazo', 'Largo plazo'];
  document.querySelectorAll('.matrix-item').forEach((item, i) => {
    item.dataset.horizon = horizons[i % 3];
  });

  /* navegación suave */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
