<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#f8fafc">
  <title>SmartScan — Диагностика авто</title>

  <!-- TailwindCSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <!-- Кастомные стили -->
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen pb-32">

  <!-- Шапка приложения -->
  <header class="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-sm">
    <div class="px-4 py-3">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <i class="fa-solid fa-car-side text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold leading-tight">SmartScan</h1>
          <p class="text-sm text-slate-500">Чек-лист диагностики</p>
        </div>
      </div>

      <!-- Поля ввода данных -->
      <div class="space-y-3">
        <div>
          <label for="carModel" class="field-label">Марка / Модель авто</label>
          <input type="text" id="carModel" class="field-input" placeholder="Например: Fiat Multipla" autocomplete="off">
        </div>
        <div>
          <label for="mileage" class="field-label">Пробег (км)</label>
          <input type="number" id="mileage" class="field-input" placeholder="125000" inputmode="numeric" min="0">
        </div>
      </div>
    </div>
  </header>

  <main class="px-4 py-4 max-w-lg mx-auto">
    <!-- Аккордеон зон осмотра -->
    <div id="zonesAccordion" class="space-y-3" aria-label="Зоны диагностики"></div>

    <!-- Общие заметки и фото -->
    <section class="mt-6 bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
      <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
        <i class="fa-solid fa-note-sticky text-blue-600"></i>
        Общие заметки
      </h2>
      <textarea id="generalNotes" class="field-input min-h-[120px] resize-y" placeholder="Дополнительные комментарии мастера по автомобилю…"></textarea>

      <div class="mt-4">
        <label class="btn-camera w-full" for="generalPhotoInput">
          <i class="fa-solid fa-camera"></i>
          Добавить фото с камеры
        </label>
        <input type="file" id="generalPhotoInput" class="hidden" accept="image/*" multiple capture="environment">
      </div>

      <div id="generalPhotoGrid" class="photo-grid mt-3"></div>
    </section>
  </main>

  <!-- Кнопка генерации PDF -->
  <footer class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
    <div class="max-w-lg mx-auto">
      <button type="button" id="btnGeneratePdf" class="btn-pdf w-full">
        <i class="fa-solid fa-file-pdf"></i>
        Сформировать и скачать PDF-отчёт
      </button>
    </div>
  </footer>

  <!-- Toast уведомление -->
  <div id="toast" class="toast hidden" role="alert" aria-live="polite">
    <div class="toast-inner">
      <i class="fa-solid fa-circle-check text-green-500 text-2xl shrink-0"></i>
      <p id="toastMessage" class="text-sm font-medium leading-snug"></p>
      <button type="button" id="toastClose" class="toast-close" aria-label="Закрыть">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>

  <!-- Полноэкранная галерея фото -->
  <div id="photoLightbox" class="photo-lightbox hidden" role="dialog" aria-modal="true" aria-label="Просмотр фото">
    <button type="button" class="lightbox-close" aria-label="Закрыть">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <button type="button" class="lightbox-nav lightbox-prev" aria-label="Предыдущее фото">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <button type="button" class="lightbox-nav lightbox-next" aria-label="Следующее фото">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
    <div class="lightbox-stage">
      <img id="lightboxImage" class="lightbox-image" src="" alt="Фото">
    </div>
    <p id="lightboxCounter" class="lightbox-counter"></p>
  </div>

  <!-- Скрытый контейнер для печатной формы PDF -->
  <div id="pdfSource" class="pdf-source" aria-hidden="true"></div>

  <!-- html2pdf.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script src="app.js"></script>
</body>
</html>
