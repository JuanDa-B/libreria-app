# Librería Gestión

Aplicación web para gestionar una librería. Frontend desarrollado con React y backend con Node.js/Express, conectando a una base de datos PostgreSQL en Neon.

## Características

- Gestión de libros: añadir, editar, visualizar libros
- Gestión de clientes
- Control de ventas
- Gestión de inventario
- Autenticación y autorización para empleados
- Reportes y estadísticas

## Tecnologías utilizadas

- **Frontend**: React, React Bootstrap, React Router
- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL (Neon)
- **Despliegue**: Firebase Hosting

## Requisitos previos

- Node.js (v14 o superior)
- npm (v6 o superior)
- Cuenta en Firebase para despliegue (opcional)

## Instalación

1. Clonar este repositorio:
   ```
   git clone [URL-del-repo]
   cd libreria-app
   ```

2. Instalar dependencias del servidor:
   ```
   npm install
   ```

3. Configurar el cliente React:
   ```
   node setup-client.js
   ```
   
4. Instalar las dependencias del cliente (opcional, si el paso anterior no lo hizo):
   ```
   cd client
   npm install
   cd ..
   ```

5. Copiar el archivo `.env.example` a `.env` y configurar las variables de entorno.

## Ejecución en desarrollo

1. Iniciar servidor y cliente concurrentemente:
   ```
   npm run dev
   ```

2. El servidor se ejecutará en `http://localhost:5000` y el cliente en `http://localhost:3000`.

## Despliegue en Firebase

1. Instalar Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Iniciar sesión en Firebase:
   ```
   firebase login
   ```

3. Inicializar proyecto Firebase (si no está inicializado):
   ```
   firebase init
   ```

4. Construir aplicación React:
   ```
   npm run build
   ```

5. Desplegar a Firebase:
   ```
   npm run deploy
   ```

## Estructuración del código

- `/client` - Frontend React
  - `/src/components` - Componentes reutilizables
  - `/src/pages` - Páginas/vistas principales
  - `/src/context` - Contextos de React para estado global
  - `/src/assets` - Imágenes, iconos, etc.
- `/server` - Backend Express (futuras expansiones)
  - `/controllers` - Controladores de rutas
  - `/routes` - Definiciones de rutas API
  - `/models` - Modelos de datos
  - `/config` - Configuraciones
- Archivos en raíz:
  - `server.js` - Punto de entrada del servidor
  - `db.js` - Configuración de la base de datos

## Autor

Juan David Beltran 