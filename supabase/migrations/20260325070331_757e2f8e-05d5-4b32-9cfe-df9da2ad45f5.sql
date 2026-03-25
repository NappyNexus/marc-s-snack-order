
-- Menu items table
CREATE TABLE public.menu_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Otros Snacks',
  image text,
  stock integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read menu items"
  ON public.menu_items FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can insert menu items"
  ON public.menu_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update menu items"
  ON public.menu_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete menu items"
  ON public.menu_items FOR DELETE TO anon, authenticated USING (true);

-- Seed default menu data
INSERT INTO public.menu_items (id, name, price, category, image, sort_order) VALUES
  ('pb-1', 'Pastelito de Pollo', 60, 'Pastelitos Básicos', NULL, 1),
  ('pb-2', 'Pastelito de Res', 60, 'Pastelitos Básicos', NULL, 2),
  ('pb-3', 'Pastelito de Queso Amarillo', 60, 'Pastelitos Básicos', NULL, 3),
  ('pb-4', 'Pastelito de Queso Crema', 60, 'Pastelitos Básicos', NULL, 4),
  ('pc-1', 'Pastelito Parrillero', 60, 'Pastelitos de la Casa', NULL, 5),
  ('pc-2', 'Pastelito 4 Quesos', 60, 'Pastelitos de la Casa', NULL, 6),
  ('pc-3', 'Pastelito Pollo, Queso y Maíz', 60, 'Pastelitos de la Casa', NULL, 7),
  ('pc-4', 'Pastelito Queso y Salsa Pizza', 60, 'Pastelitos de la Casa', NULL, 8),
  ('pe-1', 'Pastelito Pechuga Horneada', 65, 'Pastelitos Especiales', NULL, 9),
  ('pe-2', 'Pastelito Croque', 65, 'Pastelitos Especiales', NULL, 10),
  ('ps-1', 'Pastelito Pollo Italiano', 70, 'Pastelitos Super Especiales', NULL, 11),
  ('ps-2', 'Pastelito El Dorado', 70, 'Pastelitos Super Especiales', NULL, 12),
  ('o-1', 'Croquetas', 60, 'Otros Snacks', NULL, 13),
  ('o-2', 'Quipe de Res', 70, 'Otros Snacks', NULL, 14),
  ('o-3', 'Quipe de Pollo', 70, 'Otros Snacks', NULL, 15);

-- Settings table for WhatsApp, bank accounts, admin password
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON public.app_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can upsert settings"
  ON public.app_settings FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update settings"
  ON public.app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
