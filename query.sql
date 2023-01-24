v-------------------------------------------------------------------------------------------------------------------------Jual-------------------------------------------------------------------------------------------------------------------------v

CREATE OR REPLACE FUNCTION update_penjualan() RETURNS TRIGGER AS $set_penjualan$
    DECLARE
    stok_lama INTEGER;
    sum_harga NUMERIC;
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            --update stok
            SELECT stok_varian INTO stok_lama FROM varian WHERE id_varian = NEW.id_varian;
            UPDATE varian SET stok_varian = stok_lama - NEW.qty WHERE id_varian = NEW.id_varian;

        ELSIF (TG_OP = 'UPDATE') THEN
            --update stok
            SELECT stok_varian INTO stok_lama FROM varian WHERE id_varian = NEW.id_varian;
            UPDATE varian SET stok_varian = stok_lama + OLD.qty - NEW.qty WHERE id_varian = NEW.id_varian;
            
        ELSIF (TG_OP = 'DELETE') THEN
            --update stok
            SELECT stok_varian INTO stok_lama FROM varian WHERE id_varian = OLD.id_varian;
            UPDATE varian SET stok_varian = stok_lama + OLD.qty WHERE id_varian = OLD.id_varian;

        END IF;
        -- update penjualan
        SELECT sum(total_harga_detail_jual) INTO sum_harga FROM penjualan_detail WHERE no_invoice = NEW.no_invoice;
        UPDATE penjualan SET total_harga_jual = sum_harga WHERE no_invoice = NEW.no_invoice;

        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$set_penjualan$ LANGUAGE plpgsql;

CREATE TRIGGER set_penjualan
AFTER INSERT OR UPDATE OR DELETE ON penjualan_detail
    FOR EACH ROW EXECUTE FUNCTION update_penjualan();



-- update total harga
CREATE OR REPLACE FUNCTION update_harga() RETURNS TRIGGER AS $set_total_harga$
    DECLARE
        harga_jual_barang NUMERIC;
    BEGIN
        SELECT harga_jual_varian INTO harga_jual_barang FROM varian WHERE id_varian = NEW.id_varian;
        NEW.harga_detail_jual := harga_jual_barang;
        NEW.total_harga_detail_jual := NEW.qty * harga_jual_barang;
        RETURN NEW;
    END;
$set_total_harga$ LANGUAGE plpgsql;

CREATE TRIGGER set_total_harga
BEFORE INSERT OR UPDATE ON penjualan_detail
    FOR EACH ROW EXECUTE FUNCTION update_harga();

v-------------------------------------------------------------------------------------------------------------------------Beli-------------------------------------------------------------------------------------------------------------------------v

CREATE OR REPLACE FUNCTION update_pembelian() RETURNS TRIGGER AS $set_pembelian$
    DECLARE
    stok_lama INTEGER;
    sum_harga NUMERIC;
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            --update stok
            SELECT stok_varian INTO stok_lama FROM varian WHERE id_varian = NEW.id_varian;
            UPDATE varian SET stok_varian = stok_lama + NEW.qty WHERE id_varian = NEW.id_varian;

        ELSIF (TG_OP = 'UPDATE') THEN
            --update stok
            SELECT stok_varian INTO stok_lama FROM varian WHERE id_varian = NEW.id_varian;
            UPDATE varian SET stok_varian = stok_lama - OLD.qty + NEW.qty WHERE id_varian = NEW.id_varian;
            
        ELSIF (TG_OP = 'DELETE') THEN
            --update stok
            SELECT stok_varian INTO stok_lama FROM varian WHERE id_varian = OLD.id_varian;
            UPDATE varian SET stok_varian = stok_lama - OLD.qty WHERE id_varian = OLD.id_varian;

        END IF;
        -- update pembelian
        SELECT sum(total_harga_detail_beli) INTO sum_harga FROM pembelian_detail WHERE no_invoice = NEW.no_invoice;
        UPDATE pembelian SET total_harga_beli = sum_harga WHERE no_invoice = NEW.no_invoice;

        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$set_pembelian$ LANGUAGE plpgsql;

CREATE TRIGGER set_pembelian
AFTER INSERT OR UPDATE OR DELETE ON pembelian_detail
    FOR EACH ROW EXECUTE FUNCTION update_pembelian();



-- update total harga2
CREATE OR REPLACE FUNCTION update_harga2() RETURNS TRIGGER AS $set_total_harga2$
    DECLARE
        harga_beli_barang NUMERIC;
    BEGIN
        SELECT harga_beli_varian INTO harga_beli_barang FROM varian WHERE id_varian = NEW.id_varian;
        NEW.harga_detail_beli := harga_beli_barang;
        NEW.total_harga_detail_beli := NEW.qty * harga_beli_barang;
        RETURN NEW;
    END;
$set_total_harga2$ LANGUAGE plpgsql;

CREATE TRIGGER set_total_harga2
BEFORE INSERT OR UPDATE ON pembelian_detail
    FOR EACH ROW EXECUTE FUNCTION update_harga2();
