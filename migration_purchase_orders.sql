-- Script SQL untuk membuat tabel Surat Pesanan di Supabase
-- Jalankan script ini di Supabase > SQL Editor agar riwayat surat pesanan otomatis sinkron antara Laptop dan HP!

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Berikan izin akses untuk pengguna yang sudah login
DROP POLICY IF EXISTS "Allow all on purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow all on purchase_order_items" ON public.purchase_order_items;

CREATE POLICY "Allow all on purchase_orders" ON public.purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all on purchase_order_items" ON public.purchase_order_items FOR ALL USING (auth.role() = 'authenticated');
