-- ============================================================
-- סכימת מסד נתונים לאתר "געגע בקרקס המשוגע"
-- להרצה: Supabase Dashboard -> SQL Editor -> הדבקה והרצה
-- ============================================================

-- הרחבה ליצירת UUID
create extension if not exists "pgcrypto";

-- ---------- טבלת מוצרים ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  price numeric not null default 0,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- טבלת הזמנות (חנות) ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  product_name text not null,
  buyer_name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  status text not null default 'new', -- new / confirmed / shipped / done / cancelled
  created_at timestamptz default now()
);

-- ---------- טבלת הגרלות ----------
create table if not exists raffles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  product_name text not null,
  image_url text,
  description text,
  active boolean not null default true,
  winner_entry_id uuid,
  created_at timestamptz default now()
);

-- ---------- טבלת נרשמים להגרלה ----------
create table if not exists raffle_entries (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid references raffles(id) not null,
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz default now()
);

-- ---------- טבלת פניות הופעות / ימי הולדת ----------
create table if not exists event_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('performance','birthday')),
  full_name text not null,
  phone text not null,
  email text,
  city text,
  event_date date,
  kid_age text,
  details text,
  status text not null default 'new', -- new / contacted / confirmed / done / cancelled
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table products enable row level security;
alter table orders enable row level security;
alter table raffles enable row level security;
alter table raffle_entries enable row level security;
alter table event_requests enable row level security;

-- מוצרים והגרלות: קריאה פתוחה לכולם (כדי שהאתר הציבורי יציג אותם)
create policy "public can read products" on products
  for select using (true);

create policy "public can read raffles" on raffles
  for select using (true);

-- הזמנות: כל אחד יכול ליצור הזמנה, רק מנהל מחובר יכול לקרוא/לעדכן
create policy "public can insert orders" on orders
  for insert with check (true);

create policy "admin can read orders" on orders
  for select using (auth.role() = 'authenticated');

create policy "admin can update orders" on orders
  for update using (auth.role() = 'authenticated');

-- נרשמים להגרלה: כל אחד יכול להירשם, רק מנהל יכול לקרוא
create policy "public can insert raffle entries" on raffle_entries
  for insert with check (true);

create policy "admin can read raffle entries" on raffle_entries
  for select using (auth.role() = 'authenticated');

-- מנהל יכול לעדכן הגרלה (למשל לבחור זוכה)
create policy "admin can update raffles" on raffles
  for update using (auth.role() = 'authenticated');

-- פניות הופעות/ימי הולדת: כל אחד יכול לשלוח, רק מנהל יכול לקרוא/לעדכן
create policy "public can insert event requests" on event_requests
  for insert with check (true);

create policy "admin can read event requests" on event_requests
  for select using (auth.role() = 'authenticated');

create policy "admin can update event requests" on event_requests
  for update using (auth.role() = 'authenticated');

-- ============================================================
-- נתוני דוגמה: 4 מוצרים + הגרלה אחת פעילה
-- (אפשר לערוך/להחליף תמונות מאוחר יותר דרך Table Editor ב-Supabase)
-- ============================================================
insert into products (slug, name, description, price, image_url, sort_order) values
  ('bubat-gege', 'בובת געגע', 'בובת פלאש רכה של געגע הברווז, כוכב הקרקס המשוגע. מתאימה מגיל 3+.', 79, 'https://placehold.co/600x600/E8A33D/241C15?text=בובת+געגע', 1),
  ('hultsat-gege', 'חולצת געגע', 'חולצת כותנה עם ההדפס הרשמי של געגע. מידות ילדים S-XL.', 59, 'https://placehold.co/600x600/1B4B4A/FFFDF8?text=חולצת+געגע', 2),
  ('kova-lion', 'כובע ליצן געגע', 'כובע ליצן צבעוני בהשראת התלבושת של געגע. חד מידה, מתאים לכל הגילאים.', 39, 'https://placehold.co/600x600/D64545/FFFDF8?text=כובע+ליצן', 3),
  ('puzzle-kirkus', 'פאזל קרקס געגע', 'פאזל 48 חלקים עם דמויות הקרקס המשוגע. משחק ולמידה יחד.', 45, 'https://placehold.co/600x600/241C15/FFFDF8?text=פאזל+קרקס', 4)
on conflict (slug) do nothing;

insert into raffles (title, product_name, image_url, description, active) values
  ('הגרלת בובת געגע', 'בובת געגע', 'https://placehold.co/600x600/E8A33D/241C15?text=הגרלה', 'הירשמו להגרלה וזכו בבובת געגע מקורית, בגודל מיוחד שלא נמכר בחנות!', true)
on conflict do nothing;

-- ============================================================
-- הערה: כדי ליצור משתמש מנהל -
-- Supabase Dashboard -> Authentication -> Users -> Add user
-- (הזינו אימייל וסיסמה - זה יהיה חשבון הכניסה ל-admin.html)
-- ============================================================
