# Aplicación de Registro y Login con Node.js

Sistema de autenticación para empresas desarrollado con Node.js, Express y MySQL.

## Características

- Registro de empresas
- Inicio de sesión seguro
- Validación de formularios
- Almacenamiento seguro de contraseñas con bcrypt
- Animaciones CSS en los formularios
- Diseño moderno y responsive

## Estructura del Proyecto

```
proyecto/
├── src/                    # Código fuente principal
│   ├── config/             # Configuraciones (base de datos, entorno, etc.)
│   ├── controllers/        # Controladores de rutas
│   ├── middlewares/        # Middlewares personalizados
│   ├── models/             # Modelos de datos
│   ├── routes/             # Definición de rutas
│   ├── services/           # Lógica de negocio
│   ├── utils/              # Funciones utilitarias
│   └── app.js              # Configuración de la aplicación
├── public/                 # Archivos estáticos (CSS, imágenes, JS frontend)
├── views/                  # Plantillas de vistas (EJS)
├── .env                    # Variables de entorno (no subir a Git)
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos ignorados por Git
├── package.json            # Dependencias y scripts
└── README.md               # Documentación del proyecto
```

## Requisitos Previos

- Node.js (v14.x o superior)
- MySQL (v5.7 o superior)

## Instalación

1. Clonar el repositorio
   ```
   git clone https://github.com/tuusuario/tu-proyecto.git
   cd tu-proyecto
   ```

2. Instalar dependencias
   ```
   npm install
   ```

3. Configurar variables de entorno
   ```
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus propias configuraciones.

4. Crear la base de datos
   ```sql
   CREATE DATABASE IF NOT EXISTS mi_app;
   USE mi_app;
   
   -- Tabla de Empresas
   CREATE TABLE empresa (
       id INT AUTO_INCREMENT PRIMARY KEY,
       nombre VARCHAR(100) NOT NULL,
       correo VARCHAR(100) NOT NULL UNIQUE,
       contrasena VARCHAR(255) NOT NULL,
       creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. Iniciar el servidor
   ```
   npm run dev
   ```

## Uso

- Accede a la aplicación en `http://localhost:3000`
- Regístrate como nueva empresa
- Inicia sesión con tus credenciales

## Desarrollo

Para ejecutar en modo desarrollo con recarga automática:
```
npm run dev
```

## Licencia

Este proyecto está bajo la Licencia MIT.