-- Create one database per microservice (idempotent-ish for a clean volume).
-- Note: This runs only on first container init (fresh `postgres_data` volume).

CREATE DATABASE auth_db;
CREATE DATABASE produce_db;
CREATE DATABASE transport_db;
CREATE DATABASE storage_db;
CREATE DATABASE payment_db;
CREATE DATABASE notification_db;
CREATE DATABASE kyc_db;

