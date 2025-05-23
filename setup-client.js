const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Crear directorio del cliente si no existe
if (!fs.existsSync(path.join(__dirname, 'client'))) {
  console.log('Creando aplicación React...');
  execSync('npx create-react-app client', { stdio: 'inherit' });
}

// Instalar dependencias adicionales
console.log('Instalando dependencias del cliente...');
execSync('cd client && npm install axios react-router-dom react-bootstrap bootstrap @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons', { stdio: 'inherit' });

// Crear archivo de configuración de proxy
const proxyConfig = {
  "proxy": "http://localhost:5000"
};

fs.writeFileSync(
  path.join(__dirname, 'client', 'package.json'),
  JSON.stringify({
    ...JSON.parse(fs.readFileSync(path.join(__dirname, 'client', 'package.json'))),
    ...proxyConfig
  }, null, 2)
);

console.log('Configuración del cliente completada. Ahora puedes iniciar el desarrollo con "npm run dev"'); 