const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'data.db'), (err) => {
  if (err) {
    console.error('Error abriendo la base de datos:', err.message);
  } else {
    console.log('Conectado a SQLite');

    // Crear tabla de usuarios si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )
    `, (err) => {
      if (err) {
        console.error('Error al crear la tabla de usuarios:', err.message);
      } else {
        console.log('Tabla de usuarios verificada o creada correctamente');
      }
    });
  }
});

module.exports = db;
