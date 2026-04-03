# Mehico Farma - CPA Analytics Dashboard

Аналитическая панель для CPA Affiliate Marketing (LATAM Nutra Arbitrage - Mexico)

## 📁 Структура проекта

```
/
├── index.html              # Главная страница (Dashboard Overview)
├── unit-economics.html     # Калькулятор юнит-экономики
├── funnels.html            # Визуализация воронок трафика
├── prompts.html            # База промптов для AI
├── style.css               # Основные стили
├── funnels.css             # Стили для страницы воронок
├── tests.js                # Тесты
├── netlify.toml            # Конфигурация Netlify
├── _redirects              # Редиректы Netlify
└── js/
    ├── app.js              # Главный контроллер
    ├── storage.js          # LocalStorage модуль
    ├── tilt.js             # 3D эффект карт
    ├── counter.js          # Анимация счётчиков
    ├── clipboard.js        # Копирование в буфер
    ├── navigation.js       # Навигация
    ├── unit-economics.js   # CPA калькулятор
    ├── funnels.js          # Визуализация воронок
    └── prompt-library.js   # Фильтр промптов
```

## 🚀 Деплой на Netlify

### Вариант 1: Drag & Drop

1. Откройте [Netlify Drop](https://app.netlify.com/drop)
2. Перетащите папку с проектом в область загрузки
3. Сайт будет опубликован мгновенно

### Вариант 2: Через Git

1. Создайте репозиторий на GitHub/GitLab
2. Запушьте файлы проекта
3. В Netlify выберите "New site from Git"
4. Подключите репозиторий
5. Настройки сборки:
   - **Build command**: `echo 'No build required - static site'`
   - **Publish directory**: `/` (корень проекта)

### Вариант 3: Через Netlify CLI

```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Авторизуйтесь
netlify login

# Задеплойте
netlify deploy --prod
```

## ⚙️ Конфигурация

Файл `netlify.toml` содержит:
- Настройки кэширования для JS/CSS (1 год)
- Настройки кэширования для HTML (must-revalidate)
- Заголовки безопасности
- SPA роутинг для чистых URL

## 🌐 URL страниц

- **Главная**: `https://your-site.netlify.app/` или `index.html`
- **Юнит-экономика**: `https://your-site.netlify.app/unit-economics.html`
- **Воронки**: `https://your-site.netlify.app/funnels.html`
- **Промпты**: `https://your-site.netlify.app/prompts.html`

## 📊 Функционал

### Главная страница (index.html)
- Обзор метрик проекта
- Knowledge Base карточки
- Формулы воронок

### Юнит-экономика (unit-economics.html)
- Калькулятор CPA
- Расчёт ROI, CPL, CPA, Revenue, Profit
- Пресеты для вертикалей (Nutra, Gambling, Crypto)
- Сценарии (Optimistic, Realistic, Pessimistic)
- Экспорт в CSV

### Воронки (funnels.html)
- 4 слайдера параметров (CTR, Preland, Landing CR, Approval)
- Горизонтальный pipeline конверсии
- Автоматическое определение bottleneck
- Расчёт потенциальной выручки
- Сохранение состояния в localStorage

### Промпты (prompts.html)
- Фильтрация по категориям
- Поиск по тегам
- Копирование промптов

## 🎨 Дизайн-система

- **Шрифт**: Inter (основной), JetBrains Mono (код)
- **Цвета**: Slate palette + Neon accents (Cyan, Purple, Green)
- **Тема**: Dark mode
- **CSS методология**: BEM

## 📦 Зависимости

Проект не использует внешние зависимости кроме:
- Google Fonts (Inter, JetBrains Mono)
- Vanilla JavaScript (ES6+)
- CSS Custom Properties

## 🔧 Local Development

```bash
# Запустите локальный сервер (опционально)
npx http-server -p 8080

# Откройте в браузере
http://localhost:8080
```

## 📝 License

© 2026 Mehico Farma • CPA Analytics Dashboard
