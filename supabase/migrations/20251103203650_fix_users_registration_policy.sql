/*
  # Виправлення політик реєстрації користувачів

  ## Зміни
  
  1. Видаляємо старі обмежувальні політики для таблиці users
  2. Додаємо нові політики, які дозволяють:
     - INSERT під час реєстрації (навіть для неавторизованих)
     - SELECT/UPDATE тільки для власного профілю
     - DELETE заборонено для всіх
  
  ## Безпека
  
  - Користувачі можуть створювати свій профіль під час реєстрації
  - Користувачі можуть читати і оновлювати тільки свій профіль
  - Видалення профілю заборонено
*/

-- Видаляємо старі політики для users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Дозволяємо INSERT під час реєстрації (для auth.users які щойно створені)
CREATE POLICY "Enable insert for authentication"
  ON users FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

-- Дозволяємо читати тільки свій профіль
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Дозволяємо оновлювати тільки свій профіль
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Забороняємо видалення
CREATE POLICY "Disable delete for all users"
  ON users FOR DELETE
  TO authenticated
  USING (false);