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