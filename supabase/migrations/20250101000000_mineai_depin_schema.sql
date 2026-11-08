CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    xp_points BIGINT DEFAULT 0 CHECK (xp_points >= 0),
    level INT DEFAULT 1 CHECK (level >= 1),
    daily_streak INT DEFAULT 0 CHECK (daily_streak >= 0),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.depin_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    node_identifier VARCHAR(64) UNIQUE NOT NULL,
    device_name VARCHAR(128) NOT NULL,
    ip_address INET NOT NULL,
    cpu_utilization NUMERIC(5, 2) DEFAULT 0.0 CHECK (cpu_utilization BETWEEN 0 AND 100),
    gpu_utilization NUMERIC(5, 2) DEFAULT 0.0 CHECK (gpu_utilization BETWEEN 0 AND 100),
    hashrate_mhs NUMERIC(10, 2) DEFAULT 0.0 CHECK (hashrate_mhs >= 0),
    temperature_celsius NUMERIC(5, 2) DEFAULT 45.0,
    status VARCHAR(20) DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'HEALING', 'THROTTLED')),
    uptime_seconds BIGINT DEFAULT 0 CHECK (uptime_seconds >= 0),
    country_code VARCHAR(3) DEFAULT 'SA',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.telemetry_snapshots (
    id BIGSERIAL PRIMARY KEY,
    node_id UUID REFERENCES public.depin_nodes(id) ON DELETE CASCADE,
    hashrate_recorded NUMERIC(10, 2) NOT NULL,
    cpu_temp NUMERIC(5, 2),
    gpu_temp NUMERIC(5, 2),
    system_load NUMERIC(5, 2),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.financial_ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_balance NUMERIC(18, 8) DEFAULT 0.00000000 CHECK (token_balance >= 0),
    pending_payout NUMERIC(18, 8) DEFAULT 0.00000000 CHECK (pending_payout >= 0),
    settled_payout_fiat NUMERIC(18, 2) DEFAULT 0.00 CHECK (settled_payout_fiat >= 0),
    currency_fiat VARCHAR(4) DEFAULT 'SAR' CHECK (currency_fiat IN ('SAR', 'AED', 'USD', 'EUR')),
    last_settlement_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    payout_method VARCHAR(20) NOT NULL CHECK (payout_method IN ('IBAN', 'CARD_P2P', 'CRYPTO_WALLET')),
    destination_target TEXT NOT NULL,
    token_amount NUMERIC(18, 8) NOT NULL CHECK (token_amount > 0),
    fiat_equivalent NUMERIC(18, 2) NOT NULL CHECK (fiat_equivalent > 0),
    currency VARCHAR(4) NOT NULL,
    execution_status VARCHAR(20) DEFAULT 'PENDING' CHECK (execution_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    compliance_strix_hash TEXT NOT NULL,
    transaction_tx_reference TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.dropship_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(64) UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    category VARCHAR(32) NOT NULL,
    cost_price_usd NUMERIC(10, 2) NOT NULL,
    retail_price_usd NUMERIC(10, 2) NOT NULL,
    hashrate_capacity_mhs NUMERIC(10, 2) NOT NULL,
    power_consumption_watts INT NOT NULL,
    supplier_api_endpoint TEXT NOT NULL,
    supplier_sku VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dropship_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.dropship_products(id) ON DELETE RESTRICT,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    total_amount_fiat NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(4) NOT NULL,
    shipping_full_name TEXT NOT NULL,
    shipping_address_line TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    shipping_phone VARCHAR(32) NOT NULL,
    supplier_order_id TEXT,
    order_status VARCHAR(24) DEFAULT 'ORDER_PLACED' CHECK (order_status IN ('ORDER_PLACED', 'TRANSMITTED_TO_FACTORY', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_identity VARCHAR(32) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    execution_report_ar TEXT NOT NULL,
    execution_report_en TEXT NOT NULL,
    security_clearance VARCHAR(16) DEFAULT 'STRIX_PASSED',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_depin_nodes_owner ON public.depin_nodes(owner_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_node_id ON public.telemetry_snapshots(node_id);
CREATE INDEX IF NOT EXISTS idx_payout_user ON public.payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_dropship_user ON public.dropship_orders(user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depin_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dropship_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dropship_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products viewable" ON public.dropship_products FOR SELECT USING (is_active = true);
CREATE POLICY "Public agents viewable" ON public.agent_audit_logs FOR SELECT USING (true);
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users read own nodes" ON public.depin_nodes FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users read own payouts" ON public.payout_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payouts" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own orders" ON public.dropship_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON public.dropship_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_node_telemetry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_depin_nodes
    BEFORE UPDATE ON public.depin_nodes
    FOR EACH ROW EXECUTE FUNCTION public.handle_node_telemetry_timestamp();

CREATE TRIGGER trg_update_financial_ledgers
    BEFORE UPDATE ON public.financial_ledgers
    FOR EACH ROW EXECUTE FUNCTION public.handle_node_telemetry_timestamp();