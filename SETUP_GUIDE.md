# 🎓 NOBILIS ACADEMY - Инструкция по запуску

## 📋 Что нужно для запуска

1. **Supabase аккаунт** (бесплатно) - https://supabase.com
2. **Node.js** (версия 18+) - https://nodejs.org
3. **Vercel аккаунт** (бесплатно) - https://vercel.com (для хостинга)

---

## 🚀 Шаг 1: Настройка Supabase

### 1.1. Создание проекта
1. Зайдите на https://supabase.com и войдите/зарегистрируйтесь
2. Нажмите **"New Project"**
3. Выберите организацию или создайте новую
4. Заполните:
   - **Name**: `nobilis-academy`
   - **Database Password**: придумайте надёжный пароль (сохраните его!)
   - **Region**: выберите ближайший (например, Frankfurt для СНГ)
5. Нажмите **"Create new project"**
6. Подождите 2-3 минуты пока создаётся база

### 1.2. Настройка базы данных
1. В левом меню нажмите **"SQL Editor"**
2. Нажмите **"New query"**
3. Скопируйте весь код из файла `supabase-schema.sql` и вставьте в редактор
4. Нажмите **"Run"** (или Ctrl+Enter)
5. Дождитесь сообщения "Success"

### 1.3. Создание Storage bucket для файлов
1. В левом меню нажмите **"Storage"**
2. Нажмите **"New bucket"**
3. Создайте bucket:
   - **Name**: `documents`
   - **Public bucket**: ✅ включите
4. Нажмите **"Create bucket"**

### 1.4. Получение ключей API
1. В левом меню нажмите **"Settings"** (⚙️ шестерёнка)
2. Выберите **"API"**
3. Скопируйте и сохраните:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public** key (длинный ключ)

---

## 🚀 Шаг 2: Запуск проекта локально

### 2.1. Создание проекта React
```bash
# Создать проект
npx create-react-app nobilis-academy
cd nobilis-academy

# Установить зависимости
npm install @supabase/supabase-js
npm install lucide-react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2.2. Настройка Tailwind CSS
Откройте `tailwind.config.js` и замените содержимое на:
```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'nobilis': {
          green: '#1a3a32',
          'green-light': '#2d5a4a',
          gold: '#c9a227',
          'gold-light': '#e8c547',
        }
      }
    },
  },
  plugins: [],
}
```

Добавьте в `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.3. Создание файла окружения
Создайте файл `.env` в корне проекта:
```
REACT_APP_SUPABASE_URL=https://ваш-проект.supabase.co
REACT_APP_SUPABASE_ANON_KEY=ваш-anon-ключ
```

### 2.4. Структура проекта
Скопируйте файлы из этого архива в папку `src/`:
```
src/
├── lib/
│   ├── supabase.js    (конфигурация)
│   └── api.js         (API функции)
├── App.js             (главный компонент - см. ниже)
└── index.css          (стили)
```

### 2.5. Запуск
```bash
npm start
```
Откроется http://localhost:3000

---

## 🚀 Шаг 3: Создание первого куратора

После запуска нужно создать первого пользователя-куратора:

### Вариант 1: Через Supabase Dashboard
1. В Supabase откройте **"Authentication"** → **"Users"**
2. Нажмите **"Add user"** → **"Create new user"**
3. Заполните:
   - Email: `curator@nobilis.edu`
   - Password: `Curator2024!`
   - Auto Confirm User: ✅
4. Нажмите **"Create user"**
5. Скопируйте UUID созданного пользователя

6. Откройте **"SQL Editor"** и выполните:
```sql
-- Обновить профиль куратора
UPDATE public.profiles 
SET role = 'curator', name = 'Куратор Мария', login = 'curator'
WHERE id = 'UUID-КОТОРЫЙ-СКОПИРОВАЛИ';
```

### Вариант 2: Через SQL
```sql
-- Создать пользователя напрямую (только для тестирования!)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'curator@nobilis.edu',
  crypt('Curator2024!', gen_salt('bf')),
  NOW(),
  '{"role": "curator", "name": "Куратор Мария", "login": "curator"}'::jsonb
);
```

---

## 🚀 Шаг 4: Деплой на Vercel (бесплатно)

### 4.1. Загрузка на GitHub
1. Создайте репозиторий на GitHub
2. Загрузите код:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ваш-username/nobilis-academy.git
git push -u origin main
```

### 4.2. Деплой на Vercel
1. Зайдите на https://vercel.com
2. Нажмите **"Add New Project"**
3. Импортируйте репозиторий из GitHub
4. В **Environment Variables** добавьте:
   - `REACT_APP_SUPABASE_URL` = ваш URL
   - `REACT_APP_SUPABASE_ANON_KEY` = ваш ключ
5. Нажмите **"Deploy"**

Через 2-3 минуты получите ссылку вида: `https://nobilis-academy.vercel.app`

---

## 📱 Шаг 5: Установка на iPhone (как приложение)

1. Откройте ссылку Vercel в Safari на iPhone
2. Нажмите кнопку **"Поделиться"** (квадрат со стрелкой)
3. Прокрутите вниз и нажмите **"На экран «Домой»"**
4. Назовите приложение "Nobilis Academy"
5. Нажмите **"Добавить"**

Теперь на главном экране появится иконка приложения!

---

## 🔐 Учётные данные для входа

### Куратор (после создания):
- **Email**: `curator@nobilis.edu`
- **Пароль**: `Curator2024!`

### Ученики и преподаватели:
Создаются куратором через интерфейс. При создании автоматически генерируются логин и пароль.

---

## ❓ Частые проблемы

### "Invalid API key"
- Проверьте, что ключи в `.env` файле правильные
- Перезапустите `npm start` после изменения `.env`

### "Permission denied"
- Проверьте RLS политики в Supabase
- Убедитесь, что пользователь авторизован

### Данные не сохраняются
- Проверьте консоль браузера (F12) на ошибки
- Проверьте логи в Supabase Dashboard → Logs

### Файлы не загружаются
- Проверьте, что bucket "documents" создан
- Проверьте политики Storage в Supabase

---

## 📞 Техническая поддержка

Если возникли проблемы:
1. Проверьте консоль браузера (F12 → Console)
2. Проверьте Supabase Logs (Dashboard → Logs)
3. Убедитесь, что все переменные окружения настроены

---

## 🔄 Обновление приложения

При изменении кода:
```bash
git add .
git commit -m "Update"
git push
```

Vercel автоматически задеплоит новую версию за 1-2 минуты.
