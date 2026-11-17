import fs from 'fs';

let code = fs.readFileSync('migration_stock_history.sql', 'utf8');

// Replace the trigger logic
const newTrigger = `CREATE OR REPLACE FUNCTION public.handle_stock_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.inventory 
        SET stock = stock + NEW.qty_added, hpp = NEW.hpp
        WHERE id = NEW.inventory_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

// Find and replace the old trigger function
code = code.replace(/CREATE OR REPLACE FUNCTION public\.handle_stock_update\(\)[\s\S]*?\$\$ LANGUAGE plpgsql SECURITY DEFINER;/g, newTrigger);

fs.writeFileSync('migration_stock_history.sql', code);
console.log("Trigger simplified!");
