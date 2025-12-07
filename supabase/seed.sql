-- Litigaton
DO $$
DECLARE
    cat_id uuid;
BEGIN
    INSERT INTO category (name, field) VALUES ('Litigation', 'Law') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO services (name, category_id) VALUES
    ('Civil Litigation', cat_id),
    ('Criminal Litigation', cat_id),
    ('Arbitration', cat_id),
    ('Consumer Disputes', cat_id),
    ('Labour & Employment', cat_id)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Corporate
DO $$
DECLARE
    cat_id uuid;
BEGIN
    INSERT INTO category (name, field) VALUES ('Corporate', 'Law') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO services (name, category_id) VALUES
    ('M&A', cat_id),
    ('Private Equity', cat_id),
    ('General Corporate', cat_id),
    ('Contracts', cat_id),
    ('Compliance', cat_id)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Tax
DO $$
DECLARE
    cat_id uuid;
BEGIN
    INSERT INTO category (name, field) VALUES ('Tax', 'Law') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO services (name, category_id) VALUES
    ('Direct Tax', cat_id),
    ('Indirect Tax (GST)', cat_id),
    ('Transfer Pricing', cat_id),
    ('Tax Litigation', cat_id)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Intellectual Property
DO $$
DECLARE
    cat_id uuid;
BEGIN
    INSERT INTO category (name, field) VALUES ('Intellectual Property', 'Law') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO services (name, category_id) VALUES
    ('Trademarks', cat_id),
    ('Patents', cat_id),
    ('Copyright', cat_id),
    ('Designs', cat_id)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Real Estate
DO $$
DECLARE
    cat_id uuid;
BEGIN
    INSERT INTO category (name, field) VALUES ('Real Estate', 'Law') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
    INSERT INTO services (name, category_id) VALUES
    ('Property Due Diligence', cat_id),
    ('Title Verification', cat_id),
    ('Leases & Licenses', cat_id),
    ('RERA', cat_id)
    ON CONFLICT (name) DO NOTHING;
END $$;
