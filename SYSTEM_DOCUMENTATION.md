# AgentCRM - Повна Документація Системи

## Огляд Системи

AgentCRM - це мобільний CRM додаток для управління клієнтами, замовленнями, зустрічами, завданнями та маркетинговими кампаніями. Розроблено на React Native з використанням Expo Router та Supabase.

---

## Технологічний Стек

### Frontend
- **React Native** 0.81.4 - Основний фреймворк
- **Expo** 54.0.10 - Платформа розробки
- **Expo Router** 6.0.8 - Файлова навігація
- **TypeScript** 5.9.2 - Типізація
- **Zustand** 5.0.8 - Управління станом
- **twrnc** 4.10.1 - Tailwind CSS стилі
- **i18next** 25.6.0 - Інтернаціоналізація (UK/EN)
- **dayjs** 1.11.19 - Робота з датами
- **react-native-maps** 1.26.18 - Карти
- **lucide-react-native** 0.544.0 - Іконки

### Backend
- **Supabase** 2.58.0 - Backend as a Service
  - PostgreSQL база даних
  - Аутентифікація
  - Real-time subscriptions
  - Storage для файлів
  - Row Level Security (RLS)

### Додаткові Бібліотеки
- **expo-camera** - Робота з камерою
- **expo-location** - Геолокація
- **expo-notifications** - Push сповіщення
- **expo-image-picker** - Вибір зображень
- **react-native-qrcode-svg** - QR коди
- **@react-native-async-storage/async-storage** - Локальне сховище
- **@react-native-community/netinfo** - Стан мережі

---

## Архітектура Проекту

```
project/
├── app/                          # Екрани та навігація (Expo Router)
│   ├── (tabs)/                   # Головні таби
│   ├── auth/                     # Аутентифікація
│   ├── campaigns/                # Кампанії
│   ├── catalog/                  # Каталог
│   ├── clients/                  # Клієнти
│   ├── integrations/             # Інтеграції
│   ├── map/                      # Карти
│   ├── marketing/                # Маркетинг
│   ├── meetings/                 # Зустрічі
│   ├── orders/                   # Замовлення
│   ├── profile/                  # Профіль
│   ├── requests/                 # Запити
│   ├── reviews/                  # Відгуки
│   ├── settings/                 # Налаштування
│   └── tasks/                    # Завдання
├── components/                   # Переосновні компоненти
├── hooks/                        # Custom hooks
├── lib/                          # Утиліти та конфігурація
├── locales/                      # Переклади (UK/EN)
├── services/                     # Бізнес-логіка та API
├── store/                        # Zustand stores (стан додатку)
├── types/                        # TypeScript типи
└── supabase/migrations/          # Міграції бази даних
```

---

## Структура Навігації

### 1. Головна Навігація (Tab Navigation)

#### Tab Bar (10 основних розділів):
1. **Dashboard (index)** - Головна панель
2. **Analytics** - Аналітика та KPI
3. **Clients** - Управління клієнтами
4. **Orders** - Управління замовленнями
5. **Tasks** - Завдання
6. **Meetings** - Зустрічі та календар
7. **Campaigns** - Маркетингові кампанії
8. **Catalog** - Каталог товарів/послуг
9. **Team** - Команда та співробітники
10. **More** - Додаткові опції

---

## Детальний Опис Розділів та Екранів

### 1. DASHBOARD (Головна Панель)
**Шлях:** `/` або `/(tabs)/index`

**Компоненти:**
- KPI картки (виручка, замовлення, клієнти, завдання)
- Швидкі дії (Quick Actions)
- Останні замовлення (Recent Orders)
- AI інсайти та рекомендації

**Навігація з екрану:**
- → `/kpi` - Детальна аналітика KPI
- → `/orders/create` - Створити замовлення
- → `/clients/create` - Додати клієнта
- → `/meetings/create` - Запланувати зустріч
- → `/tasks/new` - Нове завдання
- → `/orders/[id]` - Деталі замовлення

**Дані з БД:**
- `orders` - Статистика замовлень
- `clients` - Кількість клієнтів
- `tasks` - Активні завдання
- `meetings` - Майбутні зустрічі

---

### 2. ANALYTICS (Аналітика)
**Шлях:** `/(tabs)/analytics`

**Підсторінки:**
- `/kpi` - Детальна KPI панель

**Компоненти:**
- LineChart - Динаміка продажів
- BarChart - Порівняння категорій
- KPICard - Ключові метрики
- AdvancedFilters - Фільтри по датах, категоріях
- AIInsights - AI аналіз та прогнози

**Метрики:**
- Загальна виручка (revenue)
- Кількість замовлень (orders_count)
- Середній чек (average_order)
- Активні клієнти (active_clients)
- Конверсія (conversion_rate)
- Виконані завдання (completed_tasks)
- ROI кампаній
- Динаміка по періодах

**Дані з БД:**
- `orders` + `order_items` - Фінансова аналітика
- `clients` - Клієнтська база
- `tasks` - Продуктивність
- `campaigns` - Ефективність маркетингу
- `meetings` - Активність команди

---

### 3. CLIENTS (Клієнти)
**Шлях:** `/(tabs)/clients`

**Екрани:**
- `/clients` - Список клієнтів
- `/clients/create` - Створити клієнта
- `/clients/[id]` - Профіль клієнта
- `/clients/edit/[id]` - Редагувати клієнта
- `/map/clients` - Клієнти на карті

**Функціонал:**
- CRUD операції з клієнтами
- Сегментація (active, inactive, vip)
- Фільтрація та пошук
- Історія замовлень клієнта
- Завдання та зустрічі клієнта
- Відгуки клієнта
- Геолокація на карті
- Теги та категорії

**Навігація:**
- Клієнт → Замовлення → Деталі замовлення
- Клієнт → Зустріч → Деталі зустрічі
- Клієнт → Завдання → Деталі завдання
- Клієнт → Карта → Локація клієнта

**Дані з БД:**
- `clients` - Основна інформація
- `orders` (client_id) - Замовлення клієнта
- `tasks` (client_id) - Завдання клієнта
- `meetings` (client_id) - Зустрічі клієнта
- `reviews` (client_id) - Відгуки

---

### 4. ORDERS (Замовлення)
**Шлях:** `/(tabs)/orders`

**Екрани:**
- `/orders` - Список замовлень
- `/orders/create` - Створити замовлення
- `/orders/[id]` - Деталі замовлення
- `/orders/edit/[id]` - Редагувати замовлення

**Функціонал:**
- CRUD замовлень
- Статуси: pending, confirmed, in_progress, completed, cancelled
- Кошик з товарами (order_items)
- Розрахунок сум (items, tax, delivery, total)
- Прив'язка до клієнта
- Платежі та транзакції
- Історія змін статусів
- Експорт в PDF

**Навігація:**
- Замовлення → Клієнт → Профіль клієнта
- Замовлення → Товари → Каталог
- Замовлення → Платіж → Деталі транзакції

**Дані з БД:**
- `orders` - Головна таблиця
- `order_items` - Позиції замовлення
- `clients` - Інформація клієнта
- `catalog_items` - Товари
- `payments` - Платежі

---

### 5. TASKS (Завдання)
**Шлях:** `/(tabs)/tasks`

**Екрани:**
- `/tasks` - Список завдань
- `/tasks/new` - Нове завдання
- `/tasks/[id]` - Деталі завдання

**Функціонал:**
- CRUD завдань
- Статуси: todo, in_progress, done
- Пріоритети: low, medium, high
- Призначення виконавців (assigned_to)
- Дедлайни та нагадування
- Прив'язка до клієнтів/замовлень
- Підзавдання (subtasks)
- Коментарі та файли

**Навігація:**
- Завдання → Клієнт → Профіль
- Завдання → Замовлення → Деталі
- Завдання → Виконавець → Профіль члена команди

**Дані з БД:**
- `tasks` - Завдання
- `clients` - Зв'язок з клієнтами
- `orders` - Зв'язок з замовленнями
- `team_members` - Виконавці

---

### 6. MEETINGS (Зустрічі та Календар)
**Шлях:** `/(tabs)/meetings`

**Екрани:**
- `/meetings` - Календар зустрічей
- `/meetings/create` - Створити зустріч
- `/meetings/[id]` - Деталі зустрічі
- `/meetings/edit/[id]` - Редагувати зустріч
- `/map/meetings` - Зустрічі на карті

**Функціонал:**
- Календар (день, тиждень, місяць)
- CRUD зустрічей
- Періодичні зустрічі (recurring)
- Учасники (клієнти, члени команди)
- Геолокація зустрічі
- Нагадування
- Статуси: scheduled, completed, cancelled
- Синхронізація з Google/Apple календарем

**Типи періодичності:**
- daily, weekly, monthly, yearly

**Навігація:**
- Зустріч → Клієнт → Профіль
- Зустріч → Карта → Локація
- Зустріч → Учасники → Профілі команди

**Дані з БД:**
- `meetings` - Зустрічі
- `meeting_participants` - Учасники
- `clients` - Клієнти
- `team_members` - Члени команди

---

### 7. CAMPAIGNS (Маркетингові Кампанії)
**Шлях:** `/(tabs)/campaigns`

**Екрани:**
- `/campaigns` - Список кампаній
- `/campaigns/new` - Нова кампанія
- `/campaigns/[id]` - Деталі кампанії
- `/marketing/banners` - Банери

**Функціонал:**
- CRUD кампаній
- Типи: email, sms, social, banner, event
- Статуси: draft, active, paused, completed
- Цільова аудиторія
- Метрики (impressions, clicks, conversions)
- ROI розрахунок
- A/B тестування
- Шаблони повідомлень

**Навігація:**
- Кампанія → Аналітика → Метрики
- Кампанія → Клієнти → Цільова аудиторія

**Дані з БД:**
- `campaigns` - Кампанії
- `marketing_banners` - Банери
- `clients` - Цільова аудиторія

---

### 8. CATALOG (Каталог)
**Шлях:** `/(tabs)/catalog`

**Екрани:**
- `/catalog` - Категорії каталогу
- `/catalog/[category]` - Товари категорії

**Категорії:**
- Будівельні послуги
- Ремонтні роботи
- Оздоблення
- Сантехніка
- Електрика
- Дизайн
- Консультації
- Інше

**Функціонал:**
- Перегляд товарів/послуг
- Фільтрація по категоріях
- Пошук
- Ціни та наявність
- Фото та опис
- Додавання в замовлення

**Дані з БД:**
- `catalog_items` - Товари/послуги
- `catalog_categories` - Категорії

---

### 9. TEAM (Команда)
**Шлях:** `/(tabs)/team`

**Функціонал:**
- Список членів команди
- Ролі: owner, admin, manager, member
- Права доступу
- Статистика продуктивності
- Завдання члена команди
- Зустрічі члена команди
- Контакти

**Дані з БД:**
- `team_members` - Члени команди
- `users` - Користувачі системи
- `tasks` (assigned_to) - Завдання
- `meetings` - Зустрічі

---

### 10. MORE (Додатково)
**Шлях:** `/(tabs)/more`

**Підрозділи:**

#### Profile (Профіль)
- `/profile` - Мій профіль
- `/profile/edit` - Редагувати профіль
- `/profile/qr` - QR код профілю
- `/profile/subscription` - Підписка
- `/profile/notifications` - Налаштування сповіщень
- `/profile/provider/[id]` - Профіль постачальника

#### Settings (Налаштування)
- `/settings` - Головні налаштування
- `/settings/about` - Про додаток
- `/settings/help` - Допомога
- `/settings/reports` - Звіти
- `/settings/audit` - Журнал аудиту

#### Integrations (Інтеграції)
- `/integrations/calendar` - Календар (Google, Apple)
- `/integrations/email` - Email інтеграція
- `/integrations/payments` - Платіжні системи

#### Marketing
- `/marketing` - Маркетингові інструменти
- `/marketing/banners` - Управління банерами

#### Reviews (Відгуки)
- `/reviews/list` - Список відгуків
- `/reviews/create` - Залишити відгук

#### Other
- `/onboarding` - Онбординг для нових користувачів
- `/search` - Глобальний пошук

---

## База Даних Supabase

### Таблиці (30 таблиць)

#### 1. **users** - Користувачі системи
```sql
- id (uuid, PK)
- email (text, unique)
- full_name (text)
- avatar_url (text)
- phone (text)
- role (enum: owner, admin, manager, member)
- org_id (uuid, FK → organizations, nullable)
- settings (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 2. **organizations** - Організації
```sql
- id (uuid, PK)
- name (text)
- subscription_tier (enum: free, basic, pro, enterprise)
- subscription_expires_at (timestamptz)
- created_at (timestamptz)
- settings (jsonb)
```

#### 3. **clients** - Клієнти
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- name (text)
- email (text)
- phone (text)
- address (text)
- latitude (numeric)
- longitude (numeric)
- status (enum: active, inactive, vip)
- tags (text[])
- notes (text)
- avatar_url (text)
- created_by (uuid, FK → users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 4. **orders** - Замовлення
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- client_id (uuid, FK → clients)
- order_number (text, unique)
- status (enum: pending, confirmed, in_progress, completed, cancelled)
- items_total (numeric, default 0)
- tax_amount (numeric, default 0)
- delivery_fee (numeric, default 0)
- total_amount (numeric, default 0)
- notes (text)
- created_by (uuid, FK → users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 5. **order_items** - Позиції замовлення
```sql
- id (uuid, PK)
- order_id (uuid, FK → orders)
- catalog_item_id (uuid, FK → catalog_items)
- name (text)
- quantity (numeric)
- price (numeric)
- total (numeric)
- notes (text)
```

#### 6. **catalog_categories** - Категорії каталогу
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- name (text)
- name_en (text)
- description (text)
- icon (text)
- sort_order (integer)
- created_at (timestamptz)
```

#### 7. **catalog_items** - Товари/послуги
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- category_id (uuid, FK → catalog_categories)
- name (text)
- name_en (text)
- description (text)
- price (numeric)
- unit (text)
- image_url (text)
- is_active (boolean, default true)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 8. **tasks** - Завдання
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- title (text)
- description (text)
- status (enum: todo, in_progress, done)
- priority (enum: low, medium, high)
- due_date (timestamptz)
- client_id (uuid, FK → clients, nullable)
- order_id (uuid, FK → orders, nullable)
- assigned_to (uuid, FK → users, nullable)
- created_by (uuid, FK → users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 9. **meetings** - Зустрічі
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- title (text)
- description (text)
- start_time (timestamptz)
- end_time (timestamptz)
- location (text)
- latitude (numeric)
- longitude (numeric)
- client_id (uuid, FK → clients, nullable)
- status (enum: scheduled, completed, cancelled)
- created_by (uuid, FK → users)
- is_recurring (boolean, default false)
- recurrence_rule (jsonb, nullable)
- parent_meeting_id (uuid, FK → meetings, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 10. **meeting_participants** - Учасники зустрічей
```sql
- id (uuid, PK)
- meeting_id (uuid, FK → meetings)
- user_id (uuid, FK → users, nullable)
- client_id (uuid, FK → clients, nullable)
- response (enum: accepted, declined, tentative, nullable)
```

#### 11. **campaigns** - Маркетингові кампанії
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- name (text)
- type (enum: email, sms, social, banner, event)
- status (enum: draft, active, paused, completed)
- start_date (timestamptz)
- end_date (timestamptz)
- budget (numeric)
- spent (numeric, default 0)
- target_audience (jsonb)
- metrics (jsonb)
- created_by (uuid, FK → users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 12. **marketing_banners** - Банери
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- title (text)
- description (text)
- image_url (text)
- link_url (text)
- is_active (boolean, default true)
- start_date (timestamptz)
- end_date (timestamptz)
- impressions (integer, default 0)
- clicks (integer, default 0)
- created_at (timestamptz)
```

#### 13. **team_members** - Члени команди
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations)
- user_id (uuid, FK → users)
- role (enum: owner, admin, manager, member)
- permissions (jsonb)
- joined_at (timestamptz)
```

#### 14. **payments** - Платежі
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- order_id (uuid, FK → orders, nullable)
- amount (numeric)
- currency (text, default 'UAH')
- status (enum: pending, completed, failed, refunded)
- payment_method (enum: cash, card, transfer, other)
- transaction_id (text)
- metadata (jsonb)
- created_at (timestamptz)
```

#### 15. **subscriptions** - Підписки
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations)
- tier (enum: free, basic, pro, enterprise)
- status (enum: active, cancelled, expired)
- start_date (timestamptz)
- end_date (timestamptz)
- auto_renew (boolean, default true)
- created_at (timestamptz)
```

#### 16. **reviews** - Відгуки
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- client_id (uuid, FK → clients, nullable)
- order_id (uuid, FK → orders, nullable)
- rating (integer, check 1-5)
- comment (text)
- is_public (boolean, default true)
- created_at (timestamptz)
```

#### 17. **audit_logs** - Журнал аудиту
```sql
- id (uuid, PK)
- org_id (uuid, FK → organizations, nullable)
- user_id (uuid, FK → users, nullable)
- action (text)
- entity_type (text)
- entity_id (uuid, nullable)
- changes (jsonb)
- ip_address (text)
- user_agent (text)
- created_at (timestamptz)
```

#### 18-30. Додаткові таблиці
- **notifications** - Сповіщення
- **files** - Файли та документи
- **comments** - Коментарі
- **tags** - Теги
- **integrations** - Налаштування інтеграцій
- **webhooks** - Вебхуки
- **api_keys** - API ключі
- **templates** - Шаблони
- **reports** - Звіти
- **activity_log** - Журнал активності
- **settings** - Налаштування системи
- **providers** - Постачальники
- **inventory** - Складський облік

---

## Storage Buckets (4 bucket)

### 1. **avatars**
- Аватари користувачів та клієнтів
- Формати: jpg, png, webp
- Max size: 2MB
- Public read access

### 2. **documents**
- PDF файли, контракти, звіти
- Формати: pdf, doc, docx
- Max size: 10MB
- Private access (RLS)

### 3. **images**
- Зображення товарів, банерів
- Формати: jpg, png, webp
- Max size: 5MB
- Public read access

### 4. **attachments**
- Вкладення до завдань, зустрічей
- Формати: all
- Max size: 20MB
- Private access (RLS)

---

## Row Level Security (RLS) Політики

### Принципи безпеки:
1. **Все закрито за замовчуванням** - після enable RLS таблиця повністю заблокована
2. **Мінімальні права** - кожна політика надає тільки необхідний доступ
3. **Обов'язкова автентифікація** - всі політики перевіряють `auth.uid()`
4. **Перевірка належності** - доступ лише до даних своєї організації

### Типові політики для кожної таблиці:

#### SELECT політики
```sql
CREATE POLICY "Users can view own org data"
  ON table_name FOR SELECT
  TO authenticated
  USING (org_id IN (
    SELECT org_id FROM team_members
    WHERE user_id = auth.uid()
  ));
```

#### INSERT політики
```sql
CREATE POLICY "Users can create data"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM team_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );
```

#### UPDATE політики
```sql
CREATE POLICY "Users can update own org data"
  ON table_name FOR UPDATE
  TO authenticated
  USING (org_id IN (
    SELECT org_id FROM team_members
    WHERE user_id = auth.uid()
  ))
  WITH CHECK (org_id IN (
    SELECT org_id FROM team_members
    WHERE user_id = auth.uid()
  ));
```

#### DELETE політики
```sql
CREATE POLICY "Admins can delete data"
  ON table_name FOR DELETE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

### Спеціальні політики:

#### Anonymous доступ (для демо)
```sql
CREATE POLICY "Allow anonymous read access"
  ON table_name FOR SELECT
  TO anon
  USING (org_id IS NULL);
```

#### Реєстрація користувачів
```sql
CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
```

---

## Zustand Stores (Управління Станом)

### 1. **authStore** - Аутентифікація
- user, session
- login(), logout(), register()
- checkAuth(), refreshSession()

### 2. **appStore** - Стан додатку
- theme (light/dark)
- language (uk/en)
- isOnline, isLoading
- setTheme(), setLanguage()

### 3. **clientsStore** - Клієнти
- clients[], selectedClient
- fetchClients(), createClient()
- updateClient(), deleteClient()
- filterClients(), searchClients()

### 4. **ordersStore** - Замовлення
- orders[], selectedOrder
- fetchOrders(), createOrder()
- updateOrder(), deleteOrder()
- calculateTotals()

### 5. **tasksStore** - Завдання
- tasks[], selectedTask
- fetchTasks(), createTask()
- updateTask(), deleteTask()
- filterByStatus(), filterByPriority()

### 6. **meetingsStore** - Зустрічі
- meetings[], selectedMeeting
- fetchMeetings(), createMeeting()
- updateMeeting(), deleteMeeting()
- getRecurringMeetings()

### 7. **campaignsStore** - Кампанії
- campaigns[], selectedCampaign
- fetchCampaigns(), createCampaign()
- updateCampaign(), deleteCampaign()
- calculateROI()

### 8. **analyticsStore** - Аналітика
- kpis, charts, filters
- fetchAnalytics()
- calculateMetrics()
- generateReports()

### 9. **dashboardStore** - Дашборд
- recentOrders, upcomingMeetings
- quickStats, aiInsights
- fetchDashboardData()

### 10. **teamStore** - Команда
- members[], selectedMember
- fetchTeam(), inviteMember()
- updateMember(), removeMember()

### 11. **marketingStore** - Маркетинг
- banners[], campaigns[]
- fetchBanners(), createBanner()
- trackImpression(), trackClick()

### 12. **subscriptionStore** - Підписки
- currentSubscription
- fetchSubscription()
- upgrade(), cancel()

### 13. **reviewsStore** - Відгуки
- reviews[]
- fetchReviews(), createReview()

### 14. **providersStore** - Постачальники
- providers[]
- fetchProviders()

---

## Services (Бізнес-логіка)

### 1. **authService.ts**
- signIn(), signUp(), signOut()
- resetPassword(), updateProfile()
- checkSession()

### 2. **notificationService.ts**
- requestPermissions()
- scheduleNotification()
- sendPushNotification()
- handleNotificationReceived()

### 3. **offlineService.ts**
- syncData()
- queueOperation()
- retryFailedOperations()

### 4. **realtimeService.ts**
- subscribeToChannel()
- handleRealtimeUpdate()
- broadcastChange()

### 5. **imageService.ts**
- pickImage()
- takePhoto()
- uploadImage()
- resizeImage()

### 6. **exportService.ts**
- exportToCSV()
- exportToExcel()
- shareFile()

### 7. **pdfService.ts**
- generateOrderPDF()
- generateReportPDF()

---

## Інтеграції

### 1. **Google Calendar**
- OAuth автентифікація
- Синхронізація зустрічей
- Двостороння синхронізація
- Endpoint: `/integrations/calendar`

### 2. **Apple Calendar**
- EventKit інтеграція
- Локальна синхронізація
- Endpoint: `/integrations/calendar`

### 3. **Email**
- SMTP конфігурація
- Відправка email кампаній
- Шаблони листів
- Endpoint: `/integrations/email`

### 4. **Payments**
- Stripe/LiqPay інтеграція
- Обробка платежів
- Webhook handlers
- Endpoint: `/integrations/payments`

### 5. **Maps**
- Google Maps / Apple Maps
- Geocoding
- Маршрути
- Локації клієнтів та зустрічей

### 6. **Push Notifications**
- Expo Push Notifications
- FCM (Firebase Cloud Messaging)
- Device tokens management

---

## Міграції Бази Даних (15 файлів)

### 1. `20251102001639_create_initial_schema.sql`
Початкова схема з основними таблицями

### 2. `20251102215622_add_recurring_events.sql`
Додано підтримку періодичних зустрічей

### 3. `20251102230000_add_banners_table.sql`
Таблиця маркетингових банерів

### 4. `20251103000000_add_payments_tables.sql`
Система платежів та транзакцій

### 5. `20251103120000_add_subscriptions.sql`
Таблиця підписок організацій

### 6. `20251103130000_enhance_reviews.sql`
Покращена система відгуків

### 7. `20251103134005_complete_agentcrm_schema.sql`
Завершення повної схеми

### 8. `20251103140000_create_storage_buckets.sql`
Storage buckets для файлів

### 9. `20251103150000_add_audit_log.sql`
Журнал аудиту дій

### 10. `20251103203650_fix_users_registration_policy.sql`
Виправлення політики реєстрації

### 11. `20251103230000_add_anonymous_access.sql`
Анонімний доступ для демо

### 12. `20251103231000_make_org_id_nullable.sql`
org_id nullable для демо даних

### 13. `20251104003126_fix_catalog_structure.sql`
Виправлення структури каталогу

### 14. `20251104004423_add_demo_orders_simple.sql`
Спрощені демо замовлення

### 15. `20251104005723_add_demo_data_complete.sql`
**Повний набір демо даних:**
- 10 клієнтів (7 active, 2 inactive, 1 vip)
- 38 замовлень за 6 місяців (різні статуси)
- 15 завдань (різні пріоритети та статуси)
- 8 зустрічей (майбутні та минулі)
- 5 маркетингових кампаній
- 3 банери
- 8 категорій каталогу
- 24 товари/послуги
- Реалістичні дати та суми
- Зв'язки між сутностями

---

## Особливості Реалізації

### 1. Інтернаціоналізація (i18n)
- Українська та англійська мови
- Файли: `/locales/uk.json`, `/locales/en.json`
- Переклади для всіх UI елементів
- Зміна мови в реальному часі

### 2. Теми (Dark/Light Mode)
- Підтримка світлої та темної теми
- Автоматична адаптація
- Збереження налаштувань

### 3. Offline Mode
- Локальне кешування даних
- Черга операцій
- Автоматична синхронізація

### 4. Real-time
- Підписки на зміни даних
- Live оновлення
- Broadcast подій

### 5. Geolocation
- Локації клієнтів
- Маршрути до зустрічей
- Карти з маркерами

### 6. QR Codes
- QR код профілю
- Сканування QR

### 7. Camera
- Фото для товарів
- Аватари
- Документи

### 8. Notifications
- Push сповіщення
- Локальні нагадування
- Нагадування про зустрічі та завдання

### 9. Export/Import
- CSV, Excel, PDF
- Звіти
- Дані клієнтів та замовлень

---

## Безпека

### 1. Аутентифікація
- Email/Password через Supabase Auth
- JWT токени
- Refresh tokens

### 2. Авторизація
- RLS на всіх таблицях
- Перевірка org_id
- Перевірка ролей

### 3. Валідація
- Client-side валідація
- Server-side валідація (RLS)
- Type safety (TypeScript)

### 4. Захист даних
- HTTPS only
- Шифрування паролів
- Безпечне зберігання токенів

---

## Performance

### 1. Оптимізація запитів
- Індекси на ключових полях
- Eager loading зв'язків
- Pagination

### 2. Кешування
- React Query / SWR
- AsyncStorage
- Offline caching

### 3. Lazy Loading
- Динамічні імпорти
- Віртуальні списки
- Image lazy loading

---

## Тестування

### 1. Unit Tests
- Stores
- Utils
- Services

### 2. Integration Tests
- API calls
- Database operations

### 3. E2E Tests
- Critical user flows
- Auth flow
- Order creation

---

## Deployment

### 1. Web
- Vite build
- Static hosting
- CDN

### 2. Mobile
- Expo build
- App Store / Google Play
- OTA updates

### 3. Database
- Supabase hosted
- Automatic backups
- Point-in-time recovery

---

## Майбутні Функції

1. **AI Features**
   - Автоматичні рекомендації
   - Прогнозування продажів
   - Чат-бот підтримка

2. **Advanced Analytics**
   - Когортний аналіз
   - Воронка продажів
   - Lifetime Value

3. **Automation**
   - Автоматичні email
   - Workflow automation
   - Trigger-based actions

4. **Integrations**
   - 1C інтеграція
   - Monobank API
   - Nova Poshta API
   - Telegram Bot

5. **Mobile Features**
   - Biometric auth
   - Apple Pay / Google Pay
   - Widget support

---

## Технічні Вимоги

### Frontend
- Node.js >= 18
- React Native >= 0.81
- Expo SDK >= 54
- TypeScript >= 5.9

### Backend
- Supabase account
- PostgreSQL >= 15
- Storage bucket access

### Середовище
- `.env` файл з Supabase credentials
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

---

## Команди Розробки

```bash
# Запуск dev server
npm run dev

# Type checking
npm run typecheck

# Lint
npm run lint

# Build web
npm run build:web
```

---

## Ліцензія та Підтримка

- Версія: 1.0.0
- Розробник: AgentCRM Team
- Репозиторій: https://github.com/13721fff-svg/agentCRMv1
- Ліцензія: Private

---

**Документ створено:** 2025-11-04
**Версія:** 1.0
**Статус:** Production Ready
