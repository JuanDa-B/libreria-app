# Instrucciones para configurar y ejecutar el proyecto

## Instalación de dependencias

1. **Instalar dependencias del servidor (en la carpeta raíz del proyecto)**:
   ```
   cd libreria-app
   npm install
   npm install concurrently nodemon --save-dev
   ```

2. **Instalar dependencias del cliente**:
   ```
   cd client
   npm install
   npm install react-router-bootstrap --save
   ```

## Configuración de archivos

Si tienes problemas con los archivos creados, asegúrate de que el contenido de cada uno sea el correcto:

- **server.js**: Contiene la configuración del servidor Express y las rutas API
- **db.js**: Configuración de la conexión a PostgreSQL
- **client/src/App.js**: Componente principal de React
- **client/src/App.css**: Estilos de la aplicación
- **client/src/services/api.js**: Servicios de conexión al backend

## Ejecución del proyecto

1. **Ejecutar solo el servidor**:
   ```
   cd libreria-app
   npm run server
   ```

2. **Ejecutar solo el cliente**:
   ```
   cd libreria-app
   npm run client
   ```

3. **Ejecutar servidor y cliente concurrentemente**:
   ```
   cd libreria-app
   npm run dev
   ```

## Solución a problemas comunes

Si tienes problemas al ejecutar la aplicación, aquí hay una guía paso a paso para solucionarlos:

### 1. Solución completa (versión simplificada)

Si prefieres una solución rápida y sencilla, puedes simplificar la aplicación eliminando React Router:

1. **Edita src/App.js** para remover el enrutamiento y simplificar la estructura.
2. **Edita src/index.js** para usar `ReactDOM.render()` en lugar de `ReactDOM.createRoot()`.
3. **Cambia la versión de react-scripts** a 4.0.3 en el archivo package.json:
   ```
   "react-scripts": "4.0.3",
   ```
4. **Reinstala las dependencias**:
   ```
   cd client
   npm install
   ```

### 2. Solución por pasos (versión detallada)

Si prefieres mantener la estructura original con enrutamiento, sigue estos pasos:

1. **Actualizar a versiones estables de React y dependencias**:
   ```
   cd client
   npm install react@18.2.0 react-dom@18.2.0 react-router-dom@6.14.0 --save
   ```

2. **Cambiar a una versión anterior y más estable de react-scripts**:
   ```
   cd client
   npm install react-scripts@4.0.3 --save
   ```

3. **Crear manualmente el archivo .env en la carpeta client** con el siguiente contenido:
   ```
   SKIP_PREFLIGHT_CHECK=true
   DANGEROUSLY_DISABLE_HOST_CHECK=true
   PORT=3000
   HOST=localhost
   ```

4. **Configurar el proxy manualmente** creando un archivo src/setupProxy.js:
   ```javascript
   const { createProxyMiddleware } = require('http-proxy-middleware');
   
   module.exports = function(app) {
     app.use(
       '/api',
       createProxyMiddleware({
         target: 'http://localhost:5000',
         changeOrigin: true,
       })
     );
   };
   ```

5. **Instalar http-proxy-middleware**:
   ```
   cd client
   npm install http-proxy-middleware --save
   ```

6. **Simplificar el archivo index.js** para usar la API de renderizado anterior:
   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom';
   import 'bootstrap/dist/css/bootstrap.min.css';
   import './index.css';
   import App from './App';
   
   ReactDOM.render(<App />, document.getElementById('root'));
   ```

7. **Reiniciar todo el proceso de desarrollo**:
   ```
   cd ..
   npm run dev
   ```

### 3. Solución para proyectos nuevos

Si decides crear un nuevo proyecto desde cero:

1. **Crear una nueva aplicación React**:
   ```
   npx create-react-app client --use-npm
   ```

2. **Instalar dependencias necesarias**:
   ```
   cd client
   npm install bootstrap react-bootstrap axios
   ```

3. **Configurar el proxy en package.json**:
   ```json
   "proxy": "http://localhost:5000"
   ```

## Despliegue en Firebase

1. **Instalar Firebase CLI**:
   ```
   npm install -g firebase-tools
   ```

2. **Iniciar sesión en Firebase**:
   ```
   firebase login
   ```

3. **Inicializar proyecto Firebase**:
   ```
   firebase init
   ```
   - Selecciona "Hosting"
   - Selecciona "Use an existing project" o crea uno nuevo
   - Directorio público: client/build
   - Configura como SPA: y
   - No sobrescribas index.html: n

4. **Construir la aplicación React**:
   ```
   npm run build
   ```

5. **Desplegar a Firebase**:
   ```
   npm run deploy
   ``` 