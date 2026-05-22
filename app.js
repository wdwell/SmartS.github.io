/**
 * SmartScan — чек-лист диагностики автомобиля
 * Полностью клиентское SPA: данные и фото в памяти браузера, экспорт в PDF.
 */

// ============================================================================
// Справочник зон и пунктов диагностики
// ============================================================================
const ZONES = [
  {
    id: 'zone1',
    title: 'Зона 1: Салон и первичный приём',
    items: [
      'Работа световой аварийной сигнализации и звукового сигнала',
      'Работа стеклоочистителей и омывателя (состояние щёток)',
      'Исправность ламп салона и подсветки приборов',
      'Ход педали тормоза и стояночного тормоза (ручника)',
      'Люфт рулевого колеса (визуально / на слух)',
      'Индикация ошибок на панели (Check Engine, ABS, Airbag и др.)',
      'Работа отопителя / кондиционера (проверка режимов обдува)',
    ],
  },
  {
    id: 'zone2',
    title: 'Зона 2: Внешний обход (по часовой стрелке)',
    items: [
      'Оптика: ближний/дальний свет, габариты, ДХО',
      'Оптика: указатели поворотов, повторители',
      'Оптика: стоп-сигналы, подсветка номера, задний ход',
      'Ветровое стекло (трещины, сколы в зоне видимости)',
      'Зеркала заднего вида и стекла дверей (целостность)',
      'Люфт и состояние ограничителей дверей, замков капота/багажника',
    ],
  },
  {
    id: 'zone3',
    title: 'Зона 3: Подкапотное пространство (машина на полу)',
    items: [
      'Масло в двигателе (уровень, цвет, консистенция)',
      'Тормозная жидкость (уровень, тест на влагу)',
      'Антифриз (уровень, цвет, видимый осадок)',
      'Жидкость ГУР (если есть — уровень, цвет)',
      'Отсутствие подтеков прокладки клапанной крышки',
      'Отсутствие подтеков по передней/задней крышкам ДВС',
      'Состояние шлангов системы охлаждения (трещины, вздутия)',
      'Состояние и натяжение приводных ремней',
      'Визуальное состояние проводки (перетирания, колхоз)',
      'Аккумулятор (надёжность крепления, окисление клемм)',
      'Посторонние шумы/стуки при работе ДВС',
    ],
  },
  {
    id: 'zone4',
    title: 'Зона 4: Подъёмник — уровень глаз (колёса вывешены)',
    items: [
      'Люфт передних ступичных подшипников (качание вертикально)',
      'Люфт элементов рулевого управления (качание горизонтально)',
      'Люфт задних ступичных подшипников',
      'Износ передних тормозных колодок (остаток в %)',
      'Состояние передних тормозных дисков (буртик, износ)',
      'Износ задних тормозных колодок (остаток в %)',
      'Состояние задних тормозных дисков/барабанов',
      'Тормозные шланги и трубки (трещины, вздутия, коррозия)',
      'Равномерность износа протектора шин (сход-развал)',
      'Наличие грыж, порезов, трещин на шинах от старости',
      'Целостность и геометрия колёсных дисков (визуально)',
    ],
  },
  {
    id: 'zone5',
    title: 'Зона 5: Подъёмник — снизу (машина поднята полностью)',
    items: [
      'Шаровые опоры (люфт, целостность пыльников)',
      'Сайлентблоки передних рычагов (отслоения, трещины)',
      'Втулки и стойки переднего стабилизатора',
      'Передние амортизаторы и пружины (подтеки, трещины витков)',
      'Опорные подшипники (при повороте колёс)',
      'Рулевая рейка (люфт, подтеки, целостность пыльников)',
      'Рулевые тяги и наконечники (люфты, пыльники)',
      'Пыльники ШРУСов (внутренние и наружные — герметичность)',
      'Сальники приводов / КПП / дифференциалов (подтеки)',
      'Люфт крестовин и подвесного подшипника (для RWD/4WD)',
      'Масло в КПП/редукторах (визуальные потеки на корпусах)',
      'Сайлентблоки задних рычагов / балки',
      'Втулки и стойки заднего стабилизатора',
      'Задние амортизаторы и пружины (подтеки, просадка)',
      'Целостность защит ДВС и КПП, пластиковых пыльников днища',
      'Состояние выпуска (герметичность, гофра, подвесы глушителя)',
      'Очаги сильной коррозии лонжеронов и порогов',
    ],
  },
];

/** Статусы пункта чек-листа */
const STATUS = {
  OK: 'ok',
  WARN: 'warn',
  REPAIR: 'repair',
};

// ============================================================================
// Состояние приложения (только в памяти браузера)
// ============================================================================
const appState = {
  /** @type {Record<string, { status: string|null, comment: string, photos: Array<{id: string, dataUrl: string, caption: string}> }>} */
  items: {},
  /** Общие фото (не привязаны к пункту) */
  generalPhotos: [],
};

let photoIdCounter = 0;

/** Генерация уникального ключа пункта */
function itemKey(zoneId, itemIndex) {
  return `${zoneId}_${itemIndex}`;
}

/** Генерация уникального id для фото */
function nextPhotoId() {
  photoIdCounter += 1;
  return `photo_${Date.now()}_${photoIdCounter}`;
}

/** Инициализация состояния для всех пунктов */
function initState() {
  ZONES.forEach((zone) => {
    zone.items.forEach((_, index) => {
      const key = itemKey(zone.id, index);
      if (!appState.items[key]) {
        appState.items[key] = { status: null, comment: '', photos: [] };
      }
    });
  });
}

// ============================================================================
// Сжатие изображений через Canvas (для лёгкого PDF и Telegram)
// ============================================================================

/**
 * Сжимает изображение: пропорционально до max 1024px, JPEG quality 0.7.
 * Возвращает data URL и реальные размеры (для PDF без искажений).
 * @param {File} file
 * @returns {Promise<{ dataUrl: string, width: number, height: number }>}
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Не удалось декодировать изображение'));

      img.onload = () => {
        const MAX = 1024;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.7),
          width,
          height,
        });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/** Сетка фото в PDF: 1 в ряд */
const PDF_PHOTO_COLS = 1;
/** Базовый макс. размер фото (×1.5 — увеличение по запросу) */
const PDF_PHOTO_SIZE_MULT = 1.5;
const PDF_PAGE_MAX_W = 680;
const PDF_CELL_MAX_W = Math.round(640 * PDF_PHOTO_SIZE_MULT);
const PDF_CELL_MAX_H = Math.round(220 * PDF_PHOTO_SIZE_MULT);

/** Размер для вставки в PDF без искажения сторон */
function getPdfPhotoDisplaySize(width, height) {
  const w = width || 800;
  const h = height || 600;
  const maxW = Math.min(PDF_CELL_MAX_W, PDF_PAGE_MAX_W);
  const maxH = PDF_CELL_MAX_H;
  const ratio = Math.min(maxW / w, maxH / h, 1);
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

/** Подгрузить width/height для старых фото без метаданных */
function ensurePhotoDimensions(photo) {
  if (photo.width && photo.height) {
    return Promise.resolve(photo);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      photo.width = img.naturalWidth;
      photo.height = img.naturalHeight;
      resolve(photo);
    };
    img.onerror = () => resolve(photo);
    img.src = photo.dataUrl;
  });
}

/**
 * Обработка выбранных файлов: сжатие и добавление в массив
 * @param {FileList} files
 * @param {Array} targetArray — куда добавить объекты фото
 * @param {string} captionPrefix — подпись для PDF
 */
async function handlePhotoFiles(files, targetArray, captionPrefix = '') {
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'));

  for (const file of list) {
    try {
      const compressed = await compressImage(file);
      targetArray.push({
        id: nextPhotoId(),
        dataUrl: compressed.dataUrl,
        width: compressed.width,
        height: compressed.height,
        caption: captionPrefix || 'Фото',
      });
    } catch (err) {
      console.error('Ошибка сжатия фото:', err);
      showToast('⚠️ Не удалось обработать одно из фото. Попробуйте снова.', 4000);
    }
  }
}

// ============================================================================
// Построение UI: аккордеон и пункты
// ============================================================================

const zonesAccordionEl = document.getElementById('zonesAccordion');

/** Отрисовка всего чек-листа */
function renderChecklist() {
  zonesAccordionEl.innerHTML = '';

  ZONES.forEach((zone, zoneIndex) => {
    const isFirst = zoneIndex === 0;
    const card = document.createElement('div');
    card.className = 'zone-card';
    card.dataset.zoneId = zone.id;

    const headerBtn = document.createElement('button');
    headerBtn.type = 'button';
    headerBtn.className = `zone-header${isFirst ? '' : ' collapsed-only'}`;
    headerBtn.setAttribute('aria-expanded', isFirst ? 'true' : 'false');
    headerBtn.setAttribute('aria-controls', `body-${zone.id}`);
    headerBtn.innerHTML = `
      <span>${zone.title}</span>
      <span class="zone-chevron"><i class="fa-solid fa-chevron-down"></i></span>
    `;

    const body = document.createElement('div');
    body.id = `body-${zone.id}`;
    body.className = 'zone-body';
    if (!isFirst) body.hidden = true;

    zone.items.forEach((itemTitle, itemIndex) => {
      body.appendChild(createCheckItem(zone, itemIndex, itemTitle));
    });

    headerBtn.addEventListener('click', () => toggleZone(headerBtn, body));

    card.appendChild(headerBtn);
    card.appendChild(body);
    zonesAccordionEl.appendChild(card);
  });
}

/** Раскрытие / сворачивание зоны */
function toggleZone(headerBtn, bodyEl) {
  const expanded = headerBtn.getAttribute('aria-expanded') === 'true';
  headerBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  bodyEl.hidden = expanded;
  headerBtn.classList.toggle('collapsed-only', expanded);
}

/** Создание DOM одного пункта чек-листа */
function createCheckItem(zone, itemIndex, title) {
  const key = itemKey(zone.id, itemIndex);
  const wrap = document.createElement('div');
  wrap.className = 'check-item';
  wrap.dataset.itemKey = key;

  wrap.innerHTML = `
    <p class="check-item-title">${escapeHtml(title)}</p>
    <div class="status-buttons" role="group" aria-label="Статус пункта">
      <button type="button" class="btn-status" data-status="${STATUS.OK}">ОК</button>
      <button type="button" class="btn-status" data-status="${STATUS.WARN}">Внимание</button>
      <button type="button" class="btn-status" data-status="${STATUS.REPAIR}">Ремонт</button>
    </div>
    <div class="item-extra" hidden>
      <label class="item-extra-label">Уточнение (что именно не так?)</label>
      <input type="text" class="comment-input" placeholder="Опишите проблему…" autocomplete="off">
      <label class="btn-camera btn-camera-sm w-full mt-1">
        <i class="fa-solid fa-camera"></i> Сделать фото
      </label>
      <input type="file" class="hidden item-photo-input" accept="image/*" capture="environment">
      <div class="photo-grid item-photo-grid mt-2"></div>
    </div>
  `;

  const statusButtons = wrap.querySelectorAll('.btn-status');
  const extraBlock = wrap.querySelector('.item-extra');
  const commentInput = wrap.querySelector('.comment-input');
  const photoInput = wrap.querySelector('.item-photo-input');
  const photoGrid = wrap.querySelector('.item-photo-grid');
  const cameraLabel = wrap.querySelector('.btn-camera-sm');

  // Клик по кнопкам статуса
  statusButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newStatus = btn.dataset.status;
      const current = appState.items[key].status;

      // Повторный клик по активной кнопке — сброс выбора
      if (current === newStatus) {
        appState.items[key].status = null;
        appState.items[key].comment = '';
        commentInput.value = '';
        updateStatusUI(statusButtons, extraBlock, null);
        extraBlock.hidden = true;
        return;
      }

      appState.items[key].status = newStatus;
      updateStatusUI(statusButtons, extraBlock, newStatus);

      // Поля уточнения и фото только для «Внимание» и «Ремонт»
      if (newStatus === STATUS.WARN || newStatus === STATUS.REPAIR) {
        extraBlock.hidden = false;
        extraBlock.classList.toggle('repair-theme', newStatus === STATUS.REPAIR);
      } else {
        extraBlock.hidden = true;
      }
    });
  });

  commentInput.addEventListener('input', () => {
    appState.items[key].comment = commentInput.value.trim();
  });

  cameraLabel.addEventListener('click', () => photoInput.click());

  /** Обновление превью фото пункта */
  const refreshItemPhotos = () => {
    renderPhotoGrid(photoGrid, appState.items[key].photos, (id) => {
      appState.items[key].photos = appState.items[key].photos.filter((p) => p.id !== id);
      refreshItemPhotos();
    });
  };

  photoInput.addEventListener('change', async (ev) => {
    const files = ev.target.files;
    if (!files?.length) return;

    const caption = `${zone.title} — ${title}`.slice(0, 120);
    await handlePhotoFiles(files, appState.items[key].photos, caption);
    refreshItemPhotos();
    photoInput.value = '';
  });

  return wrap;
}

/** Обновление визуала кнопок статуса */
function updateStatusUI(buttons, extraBlock, activeStatus) {
  buttons.forEach((btn) => {
    const s = btn.dataset.status;
    btn.classList.remove('active-ok', 'active-warn', 'active-repair', 'dimmed');

    if (!activeStatus) return;

    if (s === activeStatus) {
      if (s === STATUS.OK) btn.classList.add('active-ok');
      if (s === STATUS.WARN) btn.classList.add('active-warn');
      if (s === STATUS.REPAIR) btn.classList.add('active-repair');
    } else {
      btn.classList.add('dimmed');
    }
  });

  if (activeStatus === STATUS.OK) {
    extraBlock.hidden = true;
  }
}

/** Сколько фото — переключаемся на режим галереи (горизонтальная лента + просмотр) */
const GALLERY_MIN_PHOTOS = 2;

// ============================================================================
// Галерея фото (пропорции без обрезки, полноэкранный просмотр)
// ============================================================================

const photoLightboxEl = document.getElementById('photoLightbox');
const lightboxImageEl = document.getElementById('lightboxImage');
const lightboxCounterEl = document.getElementById('lightboxCounter');
const lightboxPrevBtn = photoLightboxEl?.querySelector('.lightbox-prev');
const lightboxNextBtn = photoLightboxEl?.querySelector('.lightbox-next');
const lightboxCloseBtn = photoLightboxEl?.querySelector('.lightbox-close');

let lightboxPhotos = [];
let lightboxIndex = 0;
let lightboxTouchStartX = 0;

/** Открыть полноэкранную галерею с указанного снимка */
function openPhotoLightbox(photos, startIndex = 0) {
  if (!photos.length || !photoLightboxEl) return;

  lightboxPhotos = photos;
  lightboxIndex = Math.max(0, Math.min(startIndex, photos.length - 1));
  updateLightboxSlide();
  photoLightboxEl.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePhotoLightbox() {
  if (!photoLightboxEl) return;
  photoLightboxEl.classList.add('hidden');
  document.body.style.overflow = '';
  lightboxImageEl.src = '';
}

function updateLightboxSlide() {
  const photo = lightboxPhotos[lightboxIndex];
  if (!photo) return;

  lightboxImageEl.src = photo.dataUrl;
  lightboxCounterEl.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;

  const onePhoto = lightboxPhotos.length <= 1;
  lightboxPrevBtn.disabled = onePhoto || lightboxIndex === 0;
  lightboxNextBtn.disabled = onePhoto || lightboxIndex === lightboxPhotos.length - 1;
}

function lightboxStep(delta) {
  const next = lightboxIndex + delta;
  if (next < 0 || next >= lightboxPhotos.length) return;
  lightboxIndex = next;
  updateLightboxSlide();
}

if (lightboxCloseBtn) {
  lightboxCloseBtn.addEventListener('click', closePhotoLightbox);
}
if (lightboxPrevBtn) {
  lightboxPrevBtn.addEventListener('click', () => lightboxStep(-1));
}
if (lightboxNextBtn) {
  lightboxNextBtn.addEventListener('click', () => lightboxStep(1));
}
if (photoLightboxEl) {
  photoLightboxEl.addEventListener('click', (e) => {
    if (e.target === photoLightboxEl || e.target.classList.contains('lightbox-stage')) {
      closePhotoLightbox();
    }
  });

  photoLightboxEl.addEventListener(
    'touchstart',
    (e) => {
      lightboxTouchStartX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  photoLightboxEl.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].clientX - lightboxTouchStartX;
      if (Math.abs(dx) < 50) return;
      lightboxStep(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );
}

/**
 * Отрисовка превью: пропорции сохраняются (object-fit: contain).
 * При 2+ фото — горизонтальная галерея, по тапу — полноэкранный просмотр.
 */
function renderPhotoGrid(container, photos, onDelete) {
  const isItemGrid = container.classList.contains('item-photo-grid');
  const baseGridClass = isItemGrid ? 'photo-grid item-photo-grid' : 'photo-grid';

  container.innerHTML = '';
  container.className = baseGridClass;
  if (!photos.length) return;

  const isGallery = photos.length >= GALLERY_MIN_PHOTOS;
  const mountEl = document.createElement('div');
  mountEl.className = isGallery ? `${baseGridClass} is-gallery` : baseGridClass;

  if (isGallery) {
    const hint = document.createElement('p');
    hint.className = 'photo-grid-hint';
    hint.innerHTML =
      '<i class="fa-solid fa-images"></i> Галерея — листайте и нажмите на фото для просмотра';
    container.appendChild(hint);
    container.appendChild(mountEl);
  } else {
    mountEl.className = baseGridClass;
    container.appendChild(mountEl);
  }

  photos.forEach((photo, index) => {
    const cell = document.createElement('div');
    cell.className = 'photo-thumb';
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Фото ${index + 1} из ${photos.length}`);

    const img = document.createElement('img');
    img.src = photo.dataUrl;
    img.alt = `Фото ${index + 1}`;
    img.draggable = false;
    if (photo.width && photo.height) {
      img.setAttribute('width', photo.width);
      img.setAttribute('height', photo.height);
    }

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'photo-delete';
    delBtn.setAttribute('aria-label', 'Удалить фото');
    delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closePhotoLightbox();
      onDelete(photo.id);
    });

    const openViewer = () => openPhotoLightbox(photos, index);
    cell.addEventListener('click', openViewer);
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openViewer();
      }
    });

    cell.appendChild(img);
    cell.appendChild(delBtn);
    mountEl.appendChild(cell);
  });
}

// ============================================================================
// Общие фото
// ============================================================================

const generalPhotoInput = document.getElementById('generalPhotoInput');
const generalPhotoGrid = document.getElementById('generalPhotoGrid');

generalPhotoInput.addEventListener('change', async (ev) => {
  const files = ev.target.files;
  if (!files?.length) return;

  await handlePhotoFiles(files, appState.generalPhotos, 'Общее фото');
  refreshGeneralPhotoGrid();
  generalPhotoInput.value = '';
});

function refreshGeneralPhotoGrid() {
  renderPhotoGrid(generalPhotoGrid, appState.generalPhotos, (id) => {
    appState.generalPhotos = appState.generalPhotos.filter((p) => p.id !== id);
    refreshGeneralPhotoGrid();
  });
}

// ============================================================================
// Генерация PDF-отчёта
// ============================================================================

const btnGeneratePdf = document.getElementById('btnGeneratePdf');
const pdfSourceEl = document.getElementById('pdfSource');

btnGeneratePdf.addEventListener('click', generatePdfReport);

/**
 * Сбор дефектов (только «Внимание» и «Ремонт»)
 */
function collectDefects() {
  const defects = [];

  ZONES.forEach((zone) => {
    zone.items.forEach((itemTitle, index) => {
      const key = itemKey(zone.id, index);
      const data = appState.items[key];
      if (data.status === STATUS.WARN || data.status === STATUS.REPAIR) {
        defects.push({
          zone: zone.title,
          title: itemTitle,
          status: data.status === STATUS.WARN ? 'Внимание' : 'Ремонт',
          statusClass: data.status === STATUS.WARN ? 'pdf-status-warn' : 'pdf-status-repair',
          comment: data.comment || '—',
        });
      }
    });
  });

  return defects;
}

/** Все фото для блока фотофиксации в PDF */
function collectAllPhotos() {
  const photos = [];

  ZONES.forEach((zone) => {
    zone.items.forEach((itemTitle, index) => {
      const key = itemKey(zone.id, index);
      appState.items[key].photos.forEach((p) => {
        photos.push({ ...p, caption: p.caption || `${zone.title}: ${itemTitle}` });
      });
    });
  });

  appState.generalPhotos.forEach((p) => {
    photos.push({ ...p, caption: p.caption || 'Общее фото' });
  });

  return photos;
}

/** Форматирование даты для отчёта и имени файла */
function formatDateForReport() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateForFilename() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Безопасное имя файла */
function sanitizeFilename(str) {
  return (str || 'Авто')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 60);
}

/** HTML печатной формы */
function buildPdfHtml() {
  const carModel = document.getElementById('carModel').value.trim() || '—';
  const mileage = document.getElementById('mileage').value.trim() || '—';
  const generalNotes = document.getElementById('generalNotes').value.trim();
  const dateStr = formatDateForReport();
  const defects = collectDefects();
  const allPhotos = collectAllPhotos();

  let defectsBlock = '';

  if (defects.length === 0) {
    defectsBlock = '<div class="pdf-no-defects">Дефектов не обнаружено</div>';
  } else {
    const rows = defects
      .map(
        (d) => `
      <tr>
        <td>${escapeHtml(d.zone)}</td>
        <td>${escapeHtml(d.title)}</td>
        <td class="${d.statusClass}">${escapeHtml(d.status)}</td>
        <td>${escapeHtml(d.comment)}</td>
      </tr>`
      )
      .join('');

    defectsBlock = `
      <table class="pdf-defects-table">
        <colgroup>
          <col style="width:22%">
          <col style="width:34%">
          <col style="width:14%">
          <col style="width:30%">
        </colgroup>
        <thead>
          <tr>
            <th>Зона</th>
            <th>Название узла</th>
            <th>Статус</th>
            <th>Уточнение</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  let photosBlock = '';
  if (allPhotos.length > 0) {
    const items = allPhotos
      .map((p) => {
        const size = getPdfPhotoDisplaySize(p.width, p.height);
        return `
        <div class="pdf-photo-item">
          <img
            src="${p.dataUrl}"
            alt=""
            width="${size.width}"
            height="${size.height}"
            style="width:${size.width}px;height:${size.height}px;max-width:100%;"
          >
          <div class="pdf-photo-caption">${escapeHtml(p.caption)}</div>
        </div>`;
      })
      .join('');
    photosBlock = `
      <div class="pdf-section-title pdf-photo-section">Фотофиксация повреждений</div>
      <div class="pdf-photo-list">${items}</div>`;
  }

  let notesBlock = '';
  if (generalNotes) {
    notesBlock = `
      <div class="pdf-section-title">Общие заметки мастера</div>
      <div class="pdf-notes-block">${escapeHtml(generalNotes)}</div>`;
  }

  return `
    <div class="pdf-report">
      <h1>АКТ ДИАГНОСТИКИ АВТОМОБИЛЯ</h1>
      <p class="pdf-subtitle">SmartService - протокол осмотра</p>

      <table class="pdf-info-table">
        <tr><td>Марка / модель</td><td>${escapeHtml(carModel)}</td></tr>
        <tr><td>Пробег</td><td>${escapeHtml(mileage)} км</td></tr>
        <tr><td>Дата и время</td><td>${escapeHtml(dateStr)}</td></tr>
      </table>

      <div class="pdf-section-title">Сводка выявленных неисправностей</div>
      ${defectsBlock}
      ${notesBlock}
      ${photosBlock}

      <div class="pdf-footer">
        Документ сформирован автоматически в SmartService.
      </div>
    </div>`;
}

/**
 * Ожидание загрузки всех img в отчёте (иначе canvas может быть пустым)
 * @param {HTMLElement} container
 */
function waitForImages(container) {
  const imgs = Array.from(container.querySelectorAll('img'));
  if (!imgs.length) return Promise.resolve();

  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
          // Таймаут на случай зависшей загрузки data URL
          setTimeout(resolve, 3000);
        })
    )
  );
}

/** Даём браузеру отрисовать DOM перед захватом canvas */
function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

/** Позиция прокрутки до генерации PDF */
let savedScrollY = 0;

/**
 * Подготовка контейнера захвата: в начало body, scrollY = 0.
 * Иначе при прокрутке к пунктам «Внимание» шапка PDF обрезается сверху.
 */
function preparePdfCapture(reportEl) {
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  window.scrollTo(0, 0);

  const w = 718;
  pdfSourceEl.classList.add('is-capturing');
  pdfSourceEl.setAttribute('aria-hidden', 'false');
  pdfSourceEl.style.width = `${w}px`;
  pdfSourceEl.style.maxWidth = `${w}px`;
  reportEl.style.width = `${w}px`;
  reportEl.style.maxWidth = `${w}px`;

  document.body.insertBefore(pdfSourceEl, document.body.firstChild);
}

/** Сброс контейнера и восстановление прокрутки */
function cleanupPdfCapture() {
  pdfSourceEl.classList.remove('is-capturing');
  pdfSourceEl.setAttribute('aria-hidden', 'true');
  pdfSourceEl.innerHTML = '';
  pdfSourceEl.removeAttribute('style');

  window.scrollTo(0, savedScrollY);
}

/** Основная функция экспорта PDF */
async function generatePdfReport() {
  const carModel = document.getElementById('carModel').value.trim();

  if (!carModel) {
    showToast('⚠️ Укажите марку и модель автомобиля в шапке формы.', 3500);
    document.getElementById('carModel').focus();
    return;
  }

  btnGeneratePdf.disabled = true;
  btnGeneratePdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Формируем PDF…';

  const overlay = document.createElement('div');
  overlay.className = 'pdf-generating-overlay';
  overlay.innerHTML =
    '<i class="fa-solid fa-file-pdf"></i><span>Формируем PDF-отчёт…</span>';

  try {
    document.body.appendChild(overlay);

    const allPhotosForPdf = collectAllPhotos();
    await Promise.all(allPhotosForPdf.map(ensurePhotoDimensions));

    pdfSourceEl.innerHTML = buildPdfHtml();
    const reportEl = pdfSourceEl.querySelector('.pdf-report');

    if (!reportEl) {
      throw new Error('Не удалось собрать шаблон отчёта');
    }

    preparePdfCapture(reportEl);
    await waitForImages(reportEl);
    await waitForPaint();
    await new Promise((r) => setTimeout(r, 200));

    const filename = `Диагностика_${sanitizeFilename(carModel)}_${formatDateForFilename()}.pdf`;

    const canvasWidth = reportEl.offsetWidth || 718;

    // Поля 10mm; scrollY всегда 0 — иначе при прокрутке чек-листа режется шапка акта
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.75 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: canvasWidth,
        windowWidth: canvasWidth,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: ['.pdf-photo-item', 'img', 'tr'],
      },
    };

    await html2pdf().set(opt).from(reportEl).save();

    showToast(
      "📄 PDF-отчёт успешно сохранён в папку «Загрузки»! Откройте Telegram и прикрепите файл к сообщению.",
      8000
    );
  } catch (err) {
    console.error('Ошибка генерации PDF:', err);
    showToast('❌ Не удалось создать PDF. Попробуйте ещё раз или уменьшите число фото.', 5000);
  } finally {
    cleanupPdfCapture();
    overlay.remove();
    btnGeneratePdf.disabled = false;
    btnGeneratePdf.innerHTML =
      '<i class="fa-solid fa-file-pdf"></i> Сформировать и скачать PDF-отчёт';
  }
}

// ============================================================================
// Toast-уведомления
// ============================================================================

const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toastMessage');
const toastCloseEl = document.getElementById('toastClose');
let toastTimer = null;

function showToast(message, duration = 6000) {
  toastMessageEl.textContent = message;
  toastEl.classList.remove('hidden');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), duration);
}

function hideToast() {
  toastEl.classList.add('hidden');
  if (toastTimer) clearTimeout(toastTimer);
}

toastCloseEl.addEventListener('click', hideToast);

// ============================================================================
// Утилиты
// ============================================================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Старт приложения
// ============================================================================

initState();
renderChecklist();
