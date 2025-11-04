/*
  # Fix Catalog Structure

  1. Schema Changes
    - Add `color` column to `categories` table
    - Add `category_id` column to `providers` table (UUID reference)
    - Remove old `category` text column from `providers`
    - Add indexes for better query performance

  2. Data Migration
    - No data loss (tables are empty)

  3. Security
    - Maintain existing RLS policies
    - Ensure anonymous users can view categories and providers
*/

-- Add color column to categories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'color'
  ) THEN
    ALTER TABLE categories ADD COLUMN color TEXT DEFAULT '#0284c7';
  END IF;
END $$;

-- Add category_id to providers if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE providers ADD COLUMN category_id UUID REFERENCES categories(id);
  END IF;
END $$;

-- Drop old category text column if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'category' AND data_type = 'text'
  ) THEN
    ALTER TABLE providers DROP COLUMN category;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON providers(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Update RLS policies for providers to allow anonymous viewing
DROP POLICY IF EXISTS "Anyone can view providers" ON providers;
CREATE POLICY "Anyone can view providers"
  ON providers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert demo categories
INSERT INTO categories (id, name, name_uk, icon, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Repair Services', 'Ремонтні послуги', 'Wrench', '#0284c7'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Home Services', 'Домашні послуги', 'Home', '#059669'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Auto Services', 'Авто послуги', 'Car', '#dc2626'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Beauty Services', 'Краса та догляд', 'Scissors', '#d946ef'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Renovation', 'Ремонт житла', 'Paintbrush', '#f59e0b'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Photography', 'Фотопослуги', 'Camera', '#8b5cf6')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_uk = EXCLUDED.name_uk,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Insert demo providers
INSERT INTO providers (id, name, category_id, rating, reviews_count, description, phone, email, address, latitude, longitude) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Майстер Сервіс',
    '550e8400-e29b-41d4-a716-446655440001',
    4.8,
    127,
    'Професійний ремонт побутової техніки. Швидко, якісно, з гарантією.',
    '+380501234567',
    'master@service.ua',
    'вул. Хрещатик, 1, Київ',
    50.4501,
    30.5234
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'Домашній Помічник',
    '550e8400-e29b-41d4-a716-446655440002',
    4.9,
    203,
    'Клінінг, прибирання, домашні послуги будь-якої складності.',
    '+380502345678',
    'home@helper.ua',
    'вул. Лесі Українки, 15, Київ',
    50.4401,
    30.5334
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'Авто Експерт',
    '550e8400-e29b-41d4-a716-446655440003',
    4.7,
    89,
    'Ремонт та обслуговування автомобілів. Діагностика, ТО, кузовний ремонт.',
    '+380503456789',
    'auto@expert.ua',
    'вул. Велика Васильківська, 23, Київ',
    50.4301,
    30.5134
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    'Краса та Стиль',
    '550e8400-e29b-41d4-a716-446655440004',
    5.0,
    312,
    'Перукарські послуги, манікюр, педикюр, косметологія.',
    '+380504567890',
    'beauty@style.ua',
    'вул. Саксаганського, 7, Київ',
    50.4401,
    30.5234
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    'Ремонт Плюс',
    '550e8400-e29b-41d4-a716-446655440005',
    4.6,
    156,
    'Повний цикл ремонтних робіт: від косметичного до капітального ремонту.',
    '+380505678901',
    'remont@plus.ua',
    'вул. Горького, 45, Київ',
    50.4501,
    30.5434
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    'Фото Студія Pro',
    '550e8400-e29b-41d4-a716-446655440006',
    4.9,
    178,
    'Професійна фотозйомка: портрети, весілля, корпоративи, предметна зйомка.',
    '+380506789012',
    'photo@pro.ua',
    'вул. Прорізна, 12, Київ',
    50.4451,
    30.5184
  ),
  (
    '660e8400-e29b-41d4-a716-446655440007',
    'Електрик 24/7',
    '550e8400-e29b-41d4-a716-446655440001',
    4.7,
    94,
    'Електромонтажні роботи, ремонт електропроводки, встановлення світильників.',
    '+380507890123',
    'electric@247.ua',
    'вул. Шевченка, 33, Київ',
    50.4551,
    30.5284
  ),
  (
    '660e8400-e29b-41d4-a716-446655440008',
    'Сантехнік Експрес',
    '550e8400-e29b-41d4-a716-446655440002',
    4.8,
    142,
    'Сантехнічні роботи будь-якої складності. Цілодобово.',
    '+380508901234',
    'plumber@express.ua',
    'вул. Толстого, 19, Київ',
    50.4351,
    30.5384
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;
