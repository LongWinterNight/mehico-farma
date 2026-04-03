# ✅ DEPLOYMENT CHECKLIST - Mehico Farma CPA Analytics Dashboard

## 📁 Файлы для деплоя

### HTML страницы
- [x] `index.html` - Главная (Dashboard Overview)
- [x] `unit-economics.html` - Калькулятор юнит-экономики
- [x] `funnels.html` - Визуализация воронок
- [x] `prompts.html` - База промптов

### CSS файлы
- [x] `style.css` - Основные стили (4744 строки)
- [x] `funnels.css` - Стили для страницы воронок

### JavaScript модули
- [x] `js/app.js` - Главный контроллер
- [x] `js/storage.js` - LocalStorage модуль
- [x] `js/tilt.js` - 3D эффект карт
- [x] `js/counter.js` - Анимация счётчиков
- [x] `js/clipboard.js` - Копирование в буфер
- [x] `js/navigation.js` - Навигация
- [x] `js/unit-economics.js` - CPA калькулятор
- [x] `js/funnels.js` - Визуализация воронок (ES6 module)
- [x] `js/prompt-library.js` - Фильтр промптов

### Конфигурация Netlify
- [x] `netlify.toml` - Конфигурация сборки и заголовков
- [x] `_redirects` - Редиректы (пустой, для чистых URL)
- [x] `README.md` - Документация проекта

## 🚀 Инструкция по деплою

### Netlify Drop (быстрый способ)
1. Откройте https://app.netlify.com/drop
2. Перетащите ВСЮ папку `Mehico_farma-site` в область загрузки
3. Дождитесь завершения загрузки
4. Нажмите "Site settings" → "Change site name" для кастомного имени

### Netlify через Git (рекомендуемый способ)
1. Создайте репозиторий на GitHub
2. Запушьте все файлы проекта
3. В Netlify: "New site from Git" → выберите репозиторий
4. Настройки:
   - Build command: `echo 'No build required - static site'`
   - Publish directory: `/`
5. Нажмите "Deploy site"

## ✅ Проверка после деплоя

### Главная страница
- [ ] Все карточки отображаются
- [ ] 3D tilt эффект работает
- [ ] Навигация активна
- [ ] Счётчики анимируются

### Юнит-экономика
- [ ] Слайдеры перемещаются
- [ ] Значения пересчитываются
- [ ] Сохранение в localStorage работает
- [ ] Экспорт в CSV работает

### Воронки
- [ ] Все 5 карточек pipeline видны
- [ ] Горизонтальная прокрутка работает
- [ ] Карточки не сжимаются (min-width: 280px)
- [ ] Слайдеры пересчитывают метрики
- [ ] Bottleneck определяется правильно

### Промпты
- [ ] Фильтрация по категориям работает
- [ ] Поиск по тегам работает
- [ ] Копирование промптов работает

## 🔧 Настройки Netlify

### Environment Variables (не требуются)
Проект не требует переменных окружения.

### Build Settings
```toml
[build]
  publish = "."
  command = "echo 'No build required - static site'"
```

### Headers
- JS/CSS: Cache-Control `max-age=31536000, immutable`
- HTML: Cache-Control `max-age=0, must-revalidate`
- Security: X-Frame-Options, X-Content-Type-Options

## 🌐 Domain Configuration

### Netlify Subdomain
Ваш сайт будет доступен по адресу:
`https://<your-site-name>.netlify.app`

### Custom Domain (опционально)
1. Site settings → Domain management
2. "Add custom domain"
3. Введите ваш домен
4. Обновите DNS записи согласно инструкциям Netlify

## 📊 Performance

Ожидаемые показатели:
- Lighthouse Performance: 95-100
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle Size: ~50KB (без учёта шрифтов)

## 🐛 Troubleshooting

### Карточки pipeline не отображаются
- Проверьте Console на наличие ошибок JS
- Убедитесь что `funnels.css` подключён после `style.css`
- Проверьте что `funnels.js` импортирован как module

### LocalStorage не работает
- Проверьте что `storage.js` подключён перед другими модулями
- Убедитесь что браузер не в режиме инкогнито

### Стили не применяются
- Проверьте пути к CSS файлам (относительные)
- Очистите кэш браузера (Ctrl+Shift+R)

## 📞 Support

При возникновении проблем:
1. Проверьте Console браузера (F12)
2. Проверьте Network tab на наличие 404 ошибок
3. Убедитесь что все файлы загружены на Netlify

---

**Готово к деплою!** ✅

Все файлы проверены и готовы к загрузке на Netlify.
