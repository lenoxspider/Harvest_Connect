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
    is_verified BOOLEAN DEFAULT FALSE
);

create table refresh_tokens(
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token VARCHAR(255),
    expires_at TIMESTAMP
);

--Payment & Transactions Service--
create TYPE transaction_type AS ENUM ('PRODUCE', 'TRANSPORT', 'STORAGE', 'SUBSCRIPTION', 'PREMIUM_LISTING');

create table transactions(
    id UUID PRIMARY KEY,
    reference_id VARCHAR(255) UNIQUE,
    payer_id UUID,
    payee_id UUID,
    amount DECIMAL,
    commission DECIMAL,
    net_amount DECIMAL,
    transaction_type transaction_type
);