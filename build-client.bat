@echo off
echo Compilando cliente React con configuración legacy OpenSSL...
cd client
set NODE_OPTIONS=--openssl-legacy-provider
npm run build
echo Compilación completada.
cd ..
