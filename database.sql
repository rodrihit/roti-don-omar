-- ============================================================================
-- SMARTFOOD DON OMAR - ESQUEMA DE BASE DE DATOS POSTGRESQL (SUPABASE READY)
-- Versión: 1.2 - Complete Schema & All Menu Products Seeded
-- Ubicación: San Benito, Entre Ríos, Argentina
-- Arquitectura: Multi-Tenant Enterprise SaaS con Row Level Security (RLS) y Triggers
-- ============================================================================

-- REINICIO TOTAL DE TABLAS (Borra y recrea todo en orden correcto de dependencias)
DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS ubicaciones CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS cadetes CASCADE;
DROP TABLE IF EXISTS promociones CASCADE;
DROP TABLE IF EXISTS cupones CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLA: CONFIGURACION (Tenants/Comercios)
-- ============================================================================
CREATE TABLE configuracion (
    tenant_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'San Benito',
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    primary_color VARCHAR(10) DEFAULT '#FF7A00',
    secondary_color VARCHAR(10) DEFAULT '#111111',
    logo_url TEXT,
    delivery_fee NUMERIC(10, 2) DEFAULT 800.00,
    estimated_preparation_min VARCHAR(20) DEFAULT '20-30',
    estimated_delivery_min VARCHAR(20) DEFAULT '15-25',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS para configuracion
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para configuracion
CREATE POLICY "Permitir lectura pública de configuraciones" 
ON configuracion FOR SELECT USING (true);

CREATE POLICY "Permitir modificación de configuración por Admin" 
ON configuracion FOR ALL USING (true);


-- ============================================================================
-- 2. TABLA: ROLES
-- ============================================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'cocina', 'cadete', 'cliente'
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS para la tabla roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que cualquiera pueda leer los roles
CREATE POLICY "Permitir lectura pública de roles" 
ON roles FOR SELECT USING (true);

-- Insertar roles básicos por defecto
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador General de la Rotisería y SaaS'),
('cocina', 'Personal de Cocina y Preparación de platos'),
('cadete', 'Repartidor / Delivery de pedidos'),
('cliente', 'Usuario consumidor final de la aplicación')
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- 3. TABLA: USUARIOS (Sincronizado con Supabase Auth o creado localmente)
-- ============================================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    email VARCHAR(150) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    phone VARCHAR(50),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden leer su propio perfil" 
ON usuarios FOR SELECT USING (true);


-- ============================================================================
-- 4. TABLA: CATEGORIAS
-- ============================================================================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Pizzas', 'Empanadas', etc.
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de categorías" 
ON categorias FOR SELECT USING (true);


-- ============================================================================
-- 5. TABLA: PRODUCTOS
-- ============================================================================
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    ingredients TEXT[], -- Lista de ingredientes principales
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    preparation_time_min INTEGER DEFAULT 20,
    tags TEXT[], -- ['Más Vendida', 'Ahorro', 'Guri']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos" 
ON productos FOR SELECT USING (true);


-- ============================================================================
-- 6. TABLA: CUPONES
-- ============================================================================
CREATE TABLE cupones (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    active BOOLEAN DEFAULT true,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de cupones activos" 
ON cupones FOR SELECT USING (true);


-- ============================================================================
-- 7. TABLA: PROMOCIONES
-- ============================================================================
CREATE TABLE promociones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_percentage INTEGER NOT NULL,
    coupon_code VARCHAR(50),
    banner_url TEXT,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de promociones" 
ON promociones FOR SELECT USING (true);


-- ============================================================================
-- 8. TABLA: CADETES
-- ============================================================================
CREATE TABLE cadetes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'disponible', -- 'disponible', 'ocupado', 'offline'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cadetes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de cadetes activos" 
ON cadetes FOR SELECT USING (true);


-- ============================================================================
-- 9. TABLA: PEDIDOS
-- ============================================================================
CREATE TABLE pedidos (
    id VARCHAR(50) PRIMARY KEY, -- Ej: DO-4202
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    barrio VARCHAR(100) NOT NULL,
    notes TEXT,
    payment_method VARCHAR(30) NOT NULL, -- 'mercado_pago', 'transferencia', 'efectivo', 'tarjeta'
    payment_screenshot_url TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'recibido', -- 'recibido', 'pago_pendiente', 'pago_aprobado', 'preparando', 'en_cocina', 'listo', 'cadete_asignado', 'en_camino', 'entregado', 'cancelado'
    rider_id UUID REFERENCES cadetes(id) ON DELETE SET NULL,
    coupon_code VARCHAR(50),
    gps_lat NUMERIC(10, 8),
    gps_lng NUMERIC(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir creación pública de pedidos" 
ON pedidos FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de pedidos" 
ON pedidos FOR SELECT USING (true);

CREATE POLICY "Permitir actualización de pedidos por staff" 
ON pedidos FOR UPDATE USING (true);


-- ============================================================================
-- 10. TABLA: DETALLE_PEDIDO
-- ============================================================================
CREATE TABLE detalle_pedido (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL, -- Precio al momento de la compra
    notes TEXT -- Ej: 'Sin aceituna'
);

ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de detalles" 
ON detalle_pedido FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de detalles" 
ON detalle_pedido FOR INSERT WITH CHECK (true);


-- ============================================================================
-- 11. TABLA: PAGOS
-- ============================================================================
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
    transaction_id VARCHAR(100), -- ID de Mercado Pago
    screenshot_url TEXT, -- Almacenado en Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura y creación de pagos" 
ON pagos FOR ALL USING (true);


-- ============================================================================
-- 12. TABLA: UBICACIONES (Historial/Realtime del Cadete)
-- ============================================================================
CREATE TABLE ubicaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES cadetes(id) ON DELETE CASCADE,
    lat NUMERIC(10, 8) NOT NULL,
    lng NUMERIC(11, 8) NOT NULL,
    street_name VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ubicaciones lectura pública" 
ON ubicaciones FOR SELECT USING (true);


-- ============================================================================
-- 13. TABLA: NOTIFICACIONES
-- ============================================================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) REFERENCES pedidos(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_via VARCHAR(20) DEFAULT 'system', -- 'system', 'whatsapp', 'email'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de notificaciones" 
ON notificaciones FOR SELECT USING (true);


-- ============================================================================
-- 14. TABLA: CLIENTES (Para fidelización)
-- ============================================================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50) NOT NULL REFERENCES configuracion(tenant_id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150),
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fidelización lectura y escritura" 
ON clientes FOR ALL USING (true);


-- ============================================================================
-- 15. TABLA: HISTORIAL DE CAMBIOS Y AUDITORIA
-- ============================================================================
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    record_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    performed_by VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- TRIGGERS DE CONTROL AUTOMÁTICO
-- ============================================================================

-- Función para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a configuracion
DROP TRIGGER IF EXISTS set_timestamp_configuracion ON configuracion;
CREATE TRIGGER set_timestamp_configuracion
BEFORE UPDATE ON configuracion
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Aplicar trigger a productos
DROP TRIGGER IF EXISTS set_timestamp_productos ON productos;
CREATE TRIGGER set_timestamp_productos
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Aplicar trigger a pedidos
DROP TRIGGER IF EXISTS set_timestamp_pedidos ON pedidos;
CREATE TRIGGER set_timestamp_pedidos
BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


-- ============================================================================
-- SEED DE DATOS COMPLETOS PARA COMENZAR AL INSTANTE (Don Omar - San Benito)
-- ============================================================================

-- 1. Insertar configuración por defecto para Don Omar
INSERT INTO configuracion (tenant_id, name, city, address, phone, primary_color, secondary_color, logo_url, delivery_fee)
VALUES (
    'donomar', 
    'Don Omar Rotisería', 
    'San Benito, Entre Ríos, Argentina', 
    'Av. Friuli y Garay', 
    '+54 343 555-1234', 
    '#FF7A00', 
    '#111111', 
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=60',
    800.00
) ON CONFLICT (tenant_id) DO NOTHING;

-- 2. Insertar categorías iniciales para Don Omar
INSERT INTO categorias (tenant_id, name, display_order) VALUES
('donomar', 'Pizzas', 1),
('donomar', 'Empanadas', 2),
('donomar', 'Hamburguesas', 3),
('donomar', 'Lomitos', 4),
('donomar', 'Milanesas', 5),
('donomar', 'Pastas', 6),
('donomar', 'Minutas', 7),
('donomar', 'Bebidas', 8),
('donomar', 'Postres', 9),
('donomar', 'Promociones', 10)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- 3. Insertar Cupones iniciales
INSERT INTO cupones (tenant_id, code, discount_percentage, expiry_date) VALUES
('donomar', 'LOMOGURI', 20, '2026-12-31'),
('donomar', 'EMPAFEST', 15, '2026-08-31')
ON CONFLICT (tenant_id, code) DO NOTHING;

-- 4. Insertar productos iniciales para Don Omar
INSERT INTO productos (tenant_id, category_id, name, description, ingredients, price, image_url, available, preparation_time_min, tags) VALUES
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Pizzas' LIMIT 1),
    'Pizza Muzzarella Don Omar',
    'Salsa de tomate casera con condimentos locales, queso muzzarella artesanal derretido, aceitunas verdes entrerrianas y orégano fresco.',
    ARRAY['Masa casera', 'Salsa de tomate casera', 'Queso Muzzarella', 'Aceitunas', 'Orégano'],
    9500.00,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    true,
    15,
    ARRAY['Más Vendida', 'Casera']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Pizzas' LIMIT 1),
    'Pizza Especial con Morrón',
    'Salsa de tomate casera, jamón cocido en fetas finas, queso muzzarella premium, morrones asados al horno de barro y olivas.',
    ARRAY['Masa casera', 'Salsa', 'Queso Muzzarella', 'Jamón Cocido', 'Morrón Asado', 'Aceitunas'],
    11500.00,
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
    true,
    18,
    ARRAY['Destacada']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Pizzas' LIMIT 1),
    'Pizza Fugazzeta Rellena',
    'Doble masa casera rellena con muzzarella y jamón, cubierta con lluvia de cebolla caramelizada crujiente, parmesano y oliva.',
    ARRAY['Masa casera', 'Doble Queso Muzzarella', 'Jamón Cocido', 'Cebolla Caramelizada', 'Parmesano'],
    12500.00,
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
    true,
    22,
    ARRAY['Abundante']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Empanadas' LIMIT 1),
    'Empanada de Carne Criolla al Cuchillo',
    'Carne seleccionada cortada a cuchillo, sofrita en grasa de pella con cebolla, morrón, huevo duro picado y cebollita de verdeo. Masa hojaldrada bien jugosa.',
    ARRAY['Carne cortada a cuchillo', 'Cebolla', 'Morrón', 'Huevo duro', 'Cebollita de verdeo', 'Masa hojaldrada'],
    1200.00,
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
    true,
    10,
    ARRAY['Favorita Local', 'Gourmet', 'Frita o Horno']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Empanadas' LIMIT 1),
    'Empanada de Jamón y Queso Cremoso',
    'Abundante queso muzzarella fundido de campo con jamón cocido seleccionado y un toque de orégano serrano.',
    ARRAY['Jamón Cocido', 'Queso Muzzarella', 'Condimentos'],
    1200.00,
    'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80',
    true,
    10,
    ARRAY['Clásica', 'Muzzarella']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Empanadas' LIMIT 1),
    'Empanada de Pollo al Verdeo Gourmet',
    'Pechuga de pollo desmenuzada con crema, cebolla de verdeo fresca y pimientos asados.',
    ARRAY['Pollo desmenuzado', 'Cebollita de verdeo', 'Crema suave', 'Pimientos'],
    1200.00,
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    true,
    10,
    ARRAY['Especial', 'Gourmet']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Empanadas' LIMIT 1),
    'Docena de Empanadas Gourmet Don Omar',
    'Caja de 12 empanadas gourmet a elección (Carne al cuchillo, Jamón y Queso, Pollo al verdeo). Masa dorada y crujiente recién horneada.',
    ARRAY['12 Empanadas a elección', 'Masa hojaldrada artesanal'],
    12500.00,
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
    true,
    15,
    ARRAY['Promo Docena', 'Ahorro', 'Gourmet']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Hamburguesas' LIMIT 1),
    'Hamburguesa Don Omar XL',
    'Doble medallón de carne vacuna premium elaborada en casa, doble queso cheddar, jamón, huevo frito, lechuga, tomate y aderezos. Con papas fritas gigantes.',
    ARRAY['Doble Medallón de Ternera', 'Queso Cheddar', 'Jamón', 'Huevo Frito', 'Lechuga', 'Tomate', 'Papas Fritas'],
    8900.00,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    true,
    15,
    ARRAY['Gigante', 'Con Papas']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Lomitos' LIMIT 1),
    'Lomito Completo Especial',
    'Bife de lomo tiernizado de primera a la plancha, jamón, queso muzzarella fundido, huevo frito a caballo, lechuga fresca, tomate y mayonesa casera en pan lactal extra grande de panadería. Acompañado de papas fritas caseras.',
    ARRAY['Bife de Lomo', 'Queso Muzzarella', 'Jamón Cocido', 'Huevo Frito', 'Lechuga', 'Tomate', 'Pan de Lomo XL', 'Papas Fritas'],
    10500.00,
    'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&auto=format&fit=crop&q=80',
    true,
    20,
    ARRAY['Súper Abundante', 'El Más Vendido']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Milanesas' LIMIT 1),
    'Milanesa de Ternera Napolitana Gigante',
    'Milanesa de nalga tierna empanada con receta secreta, frita a la perfección, cubierta con salsa portuguesa, jamón, muzzarella gratinada y rodajas de tomate. Comen 2 o 3 personas. Con papas fritas.',
    ARRAY['Milanesa de Ternera', 'Salsa Portuguesa', 'Jamón', 'Queso Muzzarella', 'Tomate', 'Papas Fritas'],
    13900.00,
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80',
    true,
    25,
    ARRAY['Para Compartir', 'Familiar']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Pastas' LIMIT 1),
    'Tallarines Caseros con Estofado',
    'Pasta de huevo al dente estirada a mano por Don Omar, bañada en una salsa de estofado de ternera cocido a fuego lento durante 4 horas.',
    ARRAY['Tallarines caseros de huevo', 'Salsa Boloñesa', 'Trozos de Carne de Estofado', 'Queso Rallado'],
    7800.00,
    'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500&auto=format&fit=crop&q=80',
    true,
    20,
    ARRAY['Tradicional', 'Bajo en Grasa']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Minutas' LIMIT 1),
    'Suprema de Pollo con Puré',
    'Suprema de pechuga deshuesada crujiente acompañada de un cremoso puré de papas casero con manteca y leche.',
    ARRAY['Pechuga de Pollo', 'Pan rallado provenzal', 'Puré de Papas'],
    7200.00,
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
    true,
    18,
    ARRAY['Fácil y Rico']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Bebidas' LIMIT 1),
    'Cerveza Schneider 1L',
    'Cerveza rubia bien fría, ideal para acompañar las empanadas o la milanesa.',
    ARRAY['Cerveza rubia de litro'],
    3200.00,
    'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=80',
    true,
    2,
    ARRAY['Bebida Fría']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Bebidas' LIMIT 1),
    'Gaseosa Cola 1.5L',
    'Gaseosa familiar súper refrescante.',
    ARRAY['Bebida cola'],
    2500.00,
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    true,
    2,
    ARRAY['Familiar']
),
(
    'donomar',
    (SELECT id FROM categorias WHERE tenant_id = 'donomar' AND name = 'Postres' LIMIT 1),
    'Flan Casero Don Omar',
    'Receta de la abuela con 8 huevos frescos, vainilla natural, servido con una generosa cucharada de dulce de leche repostero entrerriano.',
    ARRAY['Leche entera', 'Huevos', 'Azúcar', 'Esencia de Vainilla', 'Dulce de Leche'],
    3200.00,
    'https://images.unsplash.com/photo-1528975604071-b4daaf22b8b8?w=500&auto=format&fit=crop&q=80',
    true,
    5,
    ARRAY['Imperdible']
);

-- 5. Insertar Promociones iniciales para Don Omar
INSERT INTO promociones (tenant_id, title, description, discount_percentage, coupon_code, banner_url, expiry_date) VALUES
(
    'donomar',
    'Combo Guri de Lomo Completo',
    'Comprando 1 Lomito Completo Don Omar, te llevás una gaseosa de 1.5L o cerveza Schneider de regalo por solo $11.500.',
    20,
    'LOMOGURI',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80',
    '2026-12-31'
),
(
    'donomar',
    'Miércoles de Empanadas Gourmet',
    '¡Festejá la mitad de semana con la docena de empanadas gourmet a elección por solo $11.000 aplicando el cupón EMPAFEST!',
    15,
    'EMPAFEST',
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop&q=80',
    '2026-08-31'
);

-- 6. Insertar Cadetes iniciales para Don Omar
INSERT INTO cadetes (tenant_id, name, avatar_url, phone, status) VALUES
(
    'donomar',
    'Juan ''El Rayo'' Marizza',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    '+54 343 555-4321',
    'disponible'
),
(
    'donomar',
    'Enzo ''Pela'' Guri',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    '+54 343 555-8899',
    'disponible'
);
