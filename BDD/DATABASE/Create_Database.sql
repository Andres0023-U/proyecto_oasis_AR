
-- =============================================
-- 01. CREATE USER
-- =============================================
-- Se crea un usuario administrador para la base de datos
CREATE USER oasis_admin WITH PASSWORD 'Oasis.2025!!';

-- =============================================
-- 02. CREATE DATABASE
-- =============================================
CREATE DATABASE oasis_pool_db WITH 
    ENCODING='UTF8' 
    LC_COLLATE='es_CO.UTF-8' 
    LC_CTYPE='es_CO.UTF-8' 
    TEMPLATE=TEMPLATE0
    OWNER = oasis_admin;

-- =============================================
-- 03. GRANT PRIVILEGES
-- =============================================
GRANT ALL PRIVILEGES ON DATABASE oasis_pool_db TO oasis_admin;

-- CONECTARSE A LA BD ANTES DE EJECUTAR LO SIGUIENTE
-- \c oasis_pool_db

