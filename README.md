# Sistema de Logística de Envíos

Backend para un sistema de logística de envíos desarrollado en Node.js con Express y TypeScript, siguiendo los principios de Clean Architecture.

## Tecnologías Utilizadas

- **Framework**: Express
- **Lenguaje**: TypeScript
- **Base de datos**: MySQL
- **Caching**: Redis
- **Autenticación y Seguridad**: JWT
- **Arquitectura**: Clean Architecture
- **Documentación**: Swagger

## Requisitos previos

- Node.js >= 14.x
- MySQL >= 8.0
- Redis (opcional para el caching)

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:

```bash
npm install
```

3. Crear la base de datos en MySQL utilizando el esquema proporcionado en `schema.sql`
4. Configurar el archivo `.env` con tus credenciales:

```
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=delivery_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=jwt_example
JWT_EXPIRES_IN=24h
```

## Ejecución

Para desarrollo:

```bash
npm run dev
```

Para producción:

```bash
npm run build
npm start
```

## Acceso a la API

- API: `http://localhost:3000/api/v1`
- Documentación Swagger: `http://localhost:3000/api-docs`

## Estructura del Proyecto

El proyecto sigue los principios de Clean Architecture:

```
src/
├── core/                  # Capa central que contiene la lógica de negocio
│   ├── entities/          # Entidades del dominio
│   ├── useCases/          # Casos de uso de la aplicación
│   └── repositories/      # Interfaces de repositorios
├── adapters/              # Adaptadores que conectan el núcleo con los frameworks
│   ├── controllers/       # Controladores
│   └── repositories/      # Implementaciones de repositorios
└── frameworks/            # Frameworks y herramientas (Express, MySQL, Redis, etc.)
    ├── database/          # Configuración de bases de datos
    ├── security/          # Configuración de seguridad (JWT, bcrypt)
    └── web/               # Configuración del framework web (Express)
        ├── middlewares/   # Middlewares de Express
        └── routes/        # Rutas de la API
```

## Endpoints

### Autenticación

- `POST /api/v1/auth/register` - Registrar nuevo usuario
- `POST /api/v1/auth/login` - Iniciar sesión

### Próximas implementaciones

- Gestión de órdenes de envío
- Rastreo de paquetes
- Optimización de rutas
- Asignación de transportistas 