-- 1. Tabla de roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabla de permisos
CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabla intermedia: roles_permisos
CREATE TABLE roles_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id),
    FOREIGN KEY (id_permiso) REFERENCES permisos(id)
);

-- 4. Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id)
);

-- 5. Tabla de órdenes de envío
CREATE TABLE ordenes_envio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    estado_actual VARCHAR(50) DEFAULT 'en_espera',
    fecha_entrega TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- 6. Tabla de paquetes
CREATE TABLE paquetes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_envio INT NOT NULL,
    tipo_envio ENUM('mensajeria', 'paqueteria') NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    largo DECIMAL(10,2) NOT NULL,
    ancho DECIMAL(10,2) NOT NULL,
    alto DECIMAL(10,2) NOT NULL,
    tipo_producto VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_orden_envio) REFERENCES ordenes_envio(id)
);

-- 7. Tabla de direcciones de destino
CREATE TABLE direcciones_destino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_envio INT NOT NULL,
    calle VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    codigo_postal VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_orden_envio) REFERENCES ordenes_envio(id)
);

-- 8. Catálogo de estados de envío
CREATE TABLE estados_envio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Historial de estados por orden
CREATE TABLE historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_envio INT NOT NULL,
    id_estado_envio INT NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (id_orden_envio) REFERENCES ordenes_envio(id),
    FOREIGN KEY (id_estado_envio) REFERENCES estados_envio(id)
);

-- 10. Tabla de rutas
CREATE TABLE rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_ruta VARCHAR(100) NOT NULL,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    distancia_km DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. Tabla de vehículos
CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('moto', 'minivan', 'camion') NOT NULL,
    placa VARCHAR(6) NOT NULL UNIQUE,
    capacidad_maxima DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 12. Tabla de transportistas (usuarios con vehículo)
CREATE TABLE transportistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT NOT NULL,
    id_usuario INT NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- 13. Tabla de asignaciones de envío
CREATE TABLE asignaciones_envio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_envio INT NOT NULL,
    id_ruta INT NOT NULL,
    id_transportista INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_orden_envio) REFERENCES ordenes_envio(id),
    FOREIGN KEY (id_ruta) REFERENCES rutas(id),
    FOREIGN KEY (id_transportista) REFERENCES transportistas(id)
);

-- Insertar roles por defecto
INSERT INTO roles (nombre) VALUES ('usuario'), ('transportista'), ('admin');

-- Insertar estados por defecto
INSERT INTO estados_envio (nombre_estado)
VALUES ('en_espera'), ('en_transito'), ('entregado');

-- Insertar vehiculos por defecto
INSERT INTO vehiculos (tipo, placa, capacidad_maxima)
VALUES ('moto', 'ABC123', 150.00);
INSERT INTO vehiculos (tipo, placa, capacidad_maxima)
VALUES ('minivan', 'XYZ789', 750.00);
INSERT INTO vehiculos (tipo, placa, capacidad_maxima)
VALUES ('camion', 'TRK456', 5000.00);

