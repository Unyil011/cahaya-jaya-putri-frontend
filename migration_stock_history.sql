
-- Create stock_updates table
CREATE TABLE IF NOT EXISTS public.stock_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

-- Create stock_update_items table
CREATE TABLE IF NOT EXISTS public.stock_update_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID REFERENCES public.stock_updates(id) ON DELETE CASCADE,
    inventory_id INTEGER REFERENCES public.inventory(id) ON DELETE CASCADE,
    qty_added INTEGER NOT NULL,
    hpp NUMERIC NOT NULL
);

-- Enable RLS
ALTER TABLE public.stock_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_update_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all on stock_updates" ON public.stock_updates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all on stock_update_items" ON public.stock_update_items FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_stock_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.inventory 
        SET stock = stock + NEW.qty_added, hpp = NEW.hpp
        WHERE id = NEW.inventory_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.inventory 
        SET stock = stock - OLD.qty_added
        WHERE id = OLD.inventory_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.inventory 
        SET stock = stock - OLD.qty_added + NEW.qty_added, hpp = NEW.hpp
        WHERE id = NEW.inventory_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_stock_update ON public.stock_update_items;
CREATE TRIGGER on_stock_update
    AFTER INSERT OR UPDATE OR DELETE ON public.stock_update_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_stock_update();
