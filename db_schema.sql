--Authentication & User Management Service--
create TYPE user_role AS ENUM ('FARMER', 'BUYER', 'TRANSPORTER', 'STORAGE_OWNER');

create table users(
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role user_role,
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT now(),
    is_verified BOOLEAN FALSE
);

create table refresh_tokens(
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token VARCHAR(255),
    expires_at TIMESTAMP
);
--Produce Marketplace Service--
create type order_status as enum ('PENDING', 'CONFIRMED', 'PAID', 'DELIVERED', 'CANCELLED');

create table produce_listings(
    id UUID PRIMARY KEY,
    farmer_id UUID,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    quantity_kg DECIMAL,
    price_per_kg DECIMAL,
    location VARCHAR(255),
    latitude DECIMAL,
    longitude DECIMAL,
    is_available BOOLEAN,
    is_premium BOOLEAN,
    images TEXT[],
    created_at TIMESTAMP,
    expires_at TIMESTAMP
);

create table produce_orders(
    id UUID PRIMARY KEY,
    listing_id UUID REFERENCES produce_listings(id),
    buyer_id UUID,
    quantity_kg DECIMAL,
    total_price DECIMAL,
    status order_status,
    created_at TIMESTAMP
);
create type escrow_status_enum as enum ('HELD', 'RELEASED', 'REFUNDED');
create type payout_status_enum as enum ('PENDING', 'SUCCESSFUL', 'FAILED');

create table escrow_holds(
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES produce_orders(id),
    transaction_id UUID,
    amount DECIMAL,
    status escrow_status_enum DEFAULT 'HELD',
    release_condition VARCHAR(255),
    created_at TIMESTAMP DEFAULT now()
);

create table escrow_payouts(
    id UUID PRIMARY KEY,
    escrow_hold_id UUID REFERENCES escrow_holds(id) ON DELETE CASCADE,
    recipient_id UUID,
    amount DECIMAL,
    payment_method VARCHAR(50),
    account_number VARCHAR(100),
    status payout_status_enum DEFAULT 'PENDING',
    initiated_at TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP
);

