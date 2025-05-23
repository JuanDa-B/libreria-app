const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://libreriapp.web.app', 'https://libreriapp.firebaseapp.com'] 
    : 'http://localhost:3000',
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); // Para poder parsear JSON en el cuerpo de las peticiones

// Si estamos en producción, servir archivos estáticos de la carpeta client/build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// =========== RUTAS API ============

// Obtener todos los libros
app.get('/api/libros', async (req, res) => {
  try {
    const allBooks = await pool.query('SELECT * FROM libros');
    res.json(allBooks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los libros' });
  }
});

// Obtener un libro por ID
app.get('/api/libros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await pool.query('SELECT * FROM libros WHERE id = $1', [id]);
    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json(book.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el libro' });
  }
});

// Actualizar un libro
app.put('/api/libros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, anio, categoria, precio, id_proveedor } = req.body;
    const updatedBook = await pool.query(
      'UPDATE libros SET titulo = $1, autor = $2, anio = $3, categoria = $4, precio = $5, id_proveedor = $6 WHERE id = $7 RETURNING *',
      [titulo, autor, anio, categoria, precio, id_proveedor, id]
    );
    if (updatedBook.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json(updatedBook.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el libro' });
  }
});

// Eliminar un libro
app.delete('/api/libros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Primero verificar si hay ventas asociadas
    const ventasAsociadas = await pool.query('SELECT id FROM ventas WHERE id_libro = $1', [id]);
    if (ventasAsociadas.rows.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el libro porque tiene ventas asociadas' });
    }
    // Eliminar del inventario primero (por la restricción de clave foránea)
    await pool.query('DELETE FROM inventario WHERE id_libro = $1', [id]);
    // Ahora eliminar el libro
    const result = await pool.query('DELETE FROM libros WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json({ message: 'Libro eliminado con éxito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar el libro' });
  }
});

// Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const allClients = await pool.query('SELECT * FROM clientes');
    res.json(allClients.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

// Obtener un cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (client.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(client.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
});

// Crear un nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    const newClient = await pool.query(
      'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES($1, $2, $3, $4) RETURNING *',
      [nombre, email, telefono, direccion]
    );
    res.json(newClient.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
});

// Actualizar un cliente
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;
    const updatedClient = await pool.query(
      'UPDATE clientes SET nombre = $1, email = $2, telefono = $3, direccion = $4 WHERE id = $5 RETURNING *',
      [nombre, email, telefono, direccion, id]
    );
    if (updatedClient.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(updatedClient.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
});

// Eliminar un cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar si el cliente tiene ventas asociadas
    const ventasAsociadas = await pool.query('SELECT id FROM ventas WHERE id_cliente = $1', [id]);
    if (ventasAsociadas.rows.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el cliente porque tiene ventas asociadas' });
    }
    // Eliminar el cliente
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado con éxito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

// Obtener todas las ventas
app.get('/api/ventas', async (req, res) => {
  try {
    const allSales = await pool.query('SELECT * FROM ventas');
    res.json(allSales.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

// Obtener una venta por ID
app.get('/api/ventas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
    if (sale.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    res.json(sale.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
});

// Crear una nueva venta
app.post('/api/ventas', async (req, res) => {
  try {
    const { id_cliente, id_libro, id_empleado, fecha_compra, cantidad } = req.body;

    // Verificar que haya suficiente stock
    const inventario = await pool.query(
      'SELECT stock FROM inventario WHERE id_libro = $1',
      [id_libro]
    );

    if (inventario.rows.length === 0 || inventario.rows[0].stock < cantidad) {
      return res.status(400).json({ error: 'No hay suficiente stock disponible' });
    }

    // Crear la venta
    const newSale = await pool.query(
      'INSERT INTO ventas (id_cliente, id_libro, id_empleado, fecha_compra, cantidad) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [id_cliente, id_libro, id_empleado, fecha_compra, cantidad]
    );

    // Actualizar el inventario
    await pool.query(
      'UPDATE inventario SET stock = stock - $1, ultima_actualizacion = $2 WHERE id_libro = $3',
      [cantidad, fecha_compra, id_libro]
    );

    res.json(newSale.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear la venta' });
  }
});

// Actualizar una venta
app.put('/api/ventas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_cliente, id_libro, id_empleado, fecha_compra, cantidad } = req.body;

    // Obtener la cantidad anterior para ajustar el inventario
    const ventaActual = await pool.query('SELECT cantidad, id_libro FROM ventas WHERE id = $1', [id]);
    if (ventaActual.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const cantidadAnterior = ventaActual.rows[0].cantidad;
    const libroAnterior = ventaActual.rows[0].id_libro;

    // Si el libro cambió o aumentó la cantidad, verificar el stock
    if (id_libro !== libroAnterior || cantidad > cantidadAnterior) {
      const inventario = await pool.query(
        'SELECT stock FROM inventario WHERE id_libro = $1',
        [id_libro]
      );

      const diferencia = id_libro === libroAnterior ? cantidad - cantidadAnterior : cantidad;
      
      if (inventario.rows.length === 0 || inventario.rows[0].stock < diferencia) {
        return res.status(400).json({ error: 'No hay suficiente stock disponible' });
      }
    }

    // Actualizar la venta
    const updatedSale = await pool.query(
      'UPDATE ventas SET id_cliente = $1, id_libro = $2, id_empleado = $3, fecha_compra = $4, cantidad = $5 WHERE id = $6 RETURNING *',
      [id_cliente, id_libro, id_empleado, fecha_compra, cantidad, id]
    );

    // Ajustar el inventario
    if (id_libro === libroAnterior) {
      // Mismo libro, ajustar diferencia
      const diferencia = cantidad - cantidadAnterior;
      await pool.query(
        'UPDATE inventario SET stock = stock - $1, ultima_actualizacion = $2 WHERE id_libro = $3',
        [diferencia, fecha_compra, id_libro]
      );
    } else {
      // Diferente libro, revertir uno y actualizar el otro
      await pool.query(
        'UPDATE inventario SET stock = stock + $1, ultima_actualizacion = $2 WHERE id_libro = $3',
        [cantidadAnterior, fecha_compra, libroAnterior]
      );
      await pool.query(
        'UPDATE inventario SET stock = stock - $1, ultima_actualizacion = $2 WHERE id_libro = $3',
        [cantidad, fecha_compra, id_libro]
      );
    }

    res.json(updatedSale.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar la venta' });
  }
});

// Eliminar una venta
app.delete('/api/ventas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener la información de la venta antes de eliminarla para ajustar el inventario
    const venta = await pool.query('SELECT id_libro, cantidad FROM ventas WHERE id = $1', [id]);
    if (venta.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    const { id_libro, cantidad } = venta.rows[0];
    
    // Eliminar la venta
    const result = await pool.query('DELETE FROM ventas WHERE id = $1 RETURNING *', [id]);
    
    // Restaurar el inventario
    await pool.query(
      'UPDATE inventario SET stock = stock + $1, ultima_actualizacion = NOW() WHERE id_libro = $2',
      [cantidad, id_libro]
    );
    
    res.json({ message: 'Venta eliminada con éxito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
});

// ========== RUTAS PARA INVENTARIO ==========

// Obtener todo el inventario
app.get('/api/inventario', async (req, res) => {
  try {
    const allInventory = await pool.query('SELECT * FROM inventario');
    res.json(allInventory.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

// Obtener un item de inventario por ID
app.get('/api/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inventoryItem = await pool.query('SELECT * FROM inventario WHERE id = $1', [id]);
    if (inventoryItem.rows.length === 0) {
      return res.status(404).json({ error: 'Item de inventario no encontrado' });
    }
    res.json(inventoryItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el item de inventario' });
  }
});

// Actualizar un item de inventario
app.put('/api/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, ultima_actualizacion } = req.body;
    const updatedInventory = await pool.query(
      'UPDATE inventario SET stock = $1, ultima_actualizacion = $2 WHERE id = $3 RETURNING *',
      [stock, ultima_actualizacion, id]
    );
    if (updatedInventory.rows.length === 0) {
      return res.status(404).json({ error: 'Item de inventario no encontrado' });
    }
    res.json(updatedInventory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el inventario' });
  }
});

// ========== RUTAS PARA PROVEEDORES ==========

// Obtener todos los proveedores
app.get('/api/proveedores', async (req, res) => {
  try {
    const allProviders = await pool.query('SELECT * FROM proveedores');
    res.json(allProviders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los proveedores' });
  }
});

// Obtener un proveedor por ID
app.get('/api/proveedores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await pool.query('SELECT * FROM proveedores WHERE id = $1', [id]);
    if (provider.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(provider.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el proveedor' });
  }
});

// Crear un nuevo proveedor
app.post('/api/proveedores', async (req, res) => {
  try {
    const { nombre, contacto, telefono, email } = req.body;
    const newProvider = await pool.query(
      'INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES($1, $2, $3, $4) RETURNING *',
      [nombre, contacto, telefono, email]
    );
    res.json(newProvider.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear el proveedor' });
  }
});

// Actualizar un proveedor
app.put('/api/proveedores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, contacto, telefono, email } = req.body;
    const updatedProvider = await pool.query(
      'UPDATE proveedores SET nombre = $1, contacto = $2, telefono = $3, email = $4 WHERE id = $5 RETURNING *',
      [nombre, contacto, telefono, email, id]
    );
    if (updatedProvider.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(updatedProvider.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el proveedor' });
  }
});

// Eliminar un proveedor
app.delete('/api/proveedores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si hay libros que usan este proveedor
    const librosAsociados = await pool.query('SELECT id FROM libros WHERE id_proveedor = $1', [id]);
    if (librosAsociados.rows.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el proveedor porque tiene libros asociados' });
    }
    
    const result = await pool.query('DELETE FROM proveedores WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json({ message: 'Proveedor eliminado con éxito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar el proveedor' });
  }
});

// ========== RUTAS PARA EMPLEADOS ==========

// Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const allEmployees = await pool.query('SELECT * FROM empleados');
    res.json(allEmployees.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los empleados' });
  }
});

// Obtener un empleado por ID
app.get('/api/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
    if (employee.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(employee.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el empleado' });
  }
});

// Crear un nuevo empleado
app.post('/api/empleados', async (req, res) => {
  try {
    const { nombre, cargo, email, fecha_ingreso } = req.body;
    const newEmployee = await pool.query(
      'INSERT INTO empleados (nombre, cargo, email, fecha_ingreso) VALUES($1, $2, $3, $4) RETURNING *',
      [nombre, cargo, email, fecha_ingreso]
    );
    res.json(newEmployee.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear el empleado' });
  }
});

// Actualizar un empleado
app.put('/api/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cargo, email, fecha_ingreso } = req.body;
    const updatedEmployee = await pool.query(
      'UPDATE empleados SET nombre = $1, cargo = $2, email = $3, fecha_ingreso = $4 WHERE id = $5 RETURNING *',
      [nombre, cargo, email, fecha_ingreso, id]
    );
    if (updatedEmployee.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(updatedEmployee.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
});

// Eliminar un empleado
app.delete('/api/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si hay ventas asociadas a este empleado
    const ventasAsociadas = await pool.query('SELECT id FROM ventas WHERE id_empleado = $1', [id]);
    if (ventasAsociadas.rows.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el empleado porque tiene ventas asociadas' });
    }
    
    const result = await pool.query('DELETE FROM empleados WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ message: 'Empleado eliminado con éxito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
});

// Crear un libro
app.post('/api/libros', async (req, res) => {
  try {
    const { titulo, autor, anio, categoria, precio, id_proveedor } = req.body;
    const newBook = await pool.query(
      'INSERT INTO libros (titulo, autor, anio, categoria, precio, id_proveedor) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, autor, anio, categoria, precio, id_proveedor]
    );
    res.json(newBook.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear el libro' });
  }
});

// Para cualquier otra ruta en producción, devolver la app React
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
}); 