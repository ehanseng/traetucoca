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
    img.alt = title || '';
    img.loading = 'lazy';
    /* prueba .jpg → .jpeg → .png → .webp; si todo falla, deja el degradado madera */
    const exts = ['jpg', 'jpeg', 'png', 'webp'];
    let i = 0;
    img.onerror = () => {
      i++;
      if (i < exts.length) {
        img.src = `imagenes/matriz/${slug}.${exts[i]}`;
      } else {
        img.remove();
        item.classList.remove('has-image');
        delete item.dataset.imgSrc;
      }
    };
    img.onload = () => {
      item.classList.add('has-image');
      item.dataset.imgSrc = img.src;
    };
    img.src = `imagenes/matriz/${slug}.${exts[0]}`;
    wrap.appendChild(img);
    item.insertBefore(wrap, item.firstChild);
  });

  /* ============ Lightbox de la matriz ============ */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Cerrar">×</button>
    <figure class="lightbox-figure">
      <img class="lightbox-img" alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
  `;
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbCaption.textContent = caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.querySelectorAll('.matrix-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.imgSrc;
      if (!src) return;
      const title = item.querySelector('h3')?.textContent.trim() || '';
      openLightbox(src, title);
    });
  });

  /* ============ Galería del proceso de diseño ============
     Carga dinámica desde imagenes/proceso/. Recorre filas A, B, C, …
     y para automáticamente cuando una fila completa está vacía.
     Cada slot (ej. C2) prueba .jpeg/.jpg/.png/.webp (mayús y minús).
     Click en cualquier tarjeta → lightbox. */
  const procGallery = document.querySelector('.process-gallery[data-gallery="proceso"]');
  if (procGallery) {
    const cols = [1, 2, 3, 4];
    const exts = [
      'jpeg', 'jpg', 'png', 'webp',
      'JPEG', 'JPG', 'PNG', 'WEBP'
    ];
    const allRows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    function probeSlot(slot) {
      return new Promise(resolve => {
        let idx = 0;
        const tryNext = () => {
          if (idx >= exts.length) { resolve(null); return; }
          const url = `imagenes/proceso/${slot}.${exts[idx]}`;
          const probe = new Image();
          probe.onload = () => resolve(url);
          probe.onerror = () => { idx++; tryNext(); };
          probe.src = url;
        };
        tryNext();
      });
    }

    function appendTile(slot, url) {
      const figure = document.createElement('figure');
      figure.className = 'process-item';
      figure.dataset.slot = slot;
      figure.dataset.imgSrc = url;
      const img = document.createElement('img');
      img.alt = `Proceso · ${slot}`;
      img.src = url;
      figure.appendChild(img);
      figure.addEventListener('click', () => {
        openLightbox(url, `Proceso de diseño · ${slot}`);
      });
      procGallery.appendChild(figure);
    }

    (async () => {
      for (const row of allRows) {
        const urls = await Promise.all(cols.map(c => probeSlot(`${row}${c}`)));
        const found = urls.some(u => u !== null);
        if (!found) break; /* primera fila vacía → fin de la galería */
        urls.forEach((url, i) => { if (url) appendTile(`${row}${cols[i]}`, url); });
      }
    })();
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
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
