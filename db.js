const { Pool } = require('pg');
require('dotenv').config();

// Configuración para conectar a la base de datos PostgreSQL
// La URL de conexión debe configurarse como variable de entorno
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: No se encontró la variable de entorno DATABASE_URL');
  console.error('Por favor configura esta variable en tu entorno o archivo .env');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Necesario para algunas configuraciones cloud
  }
});

// Comprobar la conexión
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error al conectar a PostgreSQL:', err);
  } else {
    console.log('Conexión a PostgreSQL establecida correctamente');
    done();
  }
});

module.exports = pool; 