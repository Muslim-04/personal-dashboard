# Personal Dashboard

Личный веб-дашборд: финансы по проектам, задачи/режим дня, тренировки.
Next.js + TypeScript + Tailwind, данные хранятся в браузере (localStorage)
и зеркалируются в Google Таблицу через Apps Script.

- Без логина — личное использование одним человеком
- Мобильная нижняя навигация из 3 вкладок, тёмная тема
- Ссылка не индексируется поисковиками (`robots: noindex` в `layout.tsx`)

## Запуск локально

```bash
npm install
npm run dev
```

Откроется на http://localhost:3000.

## Google Таблица — пошаговая настройка (один раз)

Данные и без этого работают локально (localStorage) — синхронизация
с таблицей нужна, только если хотите видеть записи ещё и в Google Sheets.

1. Создайте новую таблицу: [sheets.new](https://sheets.new)
2. В таблице: меню **Расширения → Apps Script**
3. Откройте файл `apps-script/Code.gs` из этого проекта, скопируйте всё содержимое
4. В открывшемся редакторе Apps Script удалите заготовку и вставьте скопированный код
5. Сохраните (Ctrl+S)
6. **Развернуть → Новое развёртывание**
   - Тип: **Веб-приложение**
   - Выполнять как: **Я** (ваш аккаунт)
   - У кого доступ: **Все**
7. Нажмите **Развернуть**. Google запросит авторизацию:
   - «Google не проверил это приложение» — это нормально для собственного скрипта
   - Нажмите **Дополнительно** → **Перейти на страницу ... (небезопасно)** → **Разрешить**
8. Скопируйте выданный **URL веб-приложения** (заканчивается на `/exec`)
9. В корне проекта скопируйте `.env.local.example` в `.env.local` и вставьте URL:
   ```
   NEXT_PUBLIC_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
   NEXT_PUBLIC_SHEETS_TOKEN=personal-dashboard-secret-2024
   ```
10. Перезапустите `npm run dev`

Листы **Finance**, **Tasks**, **Workouts** создадутся в таблице автоматически
при первой записи каждого типа — вручную ничего создавать не нужно.

Если что-то не пишется в таблицу — откройте Apps Script редактор и запустите
вручную функцию `testFinance`, `testTask` или `testWorkout` (выпадающий список
функций сверху → выбрать → ▶ Выполнить) — в логе будет видна ошибка.

## Деплой на Vercel (постоянная ссылка в интернете)

1. Создайте репозиторий на GitHub и запушьте туда проект:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<ваш-логин>/personal-dashboard.git
   git push -u origin main
   ```
2. Зайдите на [vercel.com](https://vercel.com), войдите через GitHub
3. **Add New → Project**, выберите репозиторий `personal-dashboard`
4. Vercel сам определит, что это Next.js — ничего менять не нужно
5. В разделе **Environment Variables** добавьте те же переменные, что в `.env.local`:
   - `NEXT_PUBLIC_SHEETS_WEBHOOK_URL`
   - `NEXT_PUBLIC_SHEETS_TOKEN`
6. **Deploy**

После этого при каждом `git push` в `main` Vercel будет автоматически
пересобирать и обновлять сайт — отдельно ничего запускать не нужно.

Ссылка будет вида `https://personal-dashboard-xxxx.vercel.app` — она не
индексируется поисковиками, но доступна всем, у кого есть сама ссылка
(это не то же самое, что защита паролем).

## Технологии

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- recharts — графики
- lucide-react — иконки
- localStorage — основное хранилище, Google Sheets — синхронизированное зеркало
