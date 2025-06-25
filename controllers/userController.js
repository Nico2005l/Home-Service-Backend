const db = require('../db/database');

// Obtener todos los usuarios
const getAllUsers = (req, res) => {
  db.all('SELECT id, name, email, role FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(rows);
  });
};

// Eliminar un usuario por ID
const deleteUser = (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado' });
  });
};

module.exports = { getAllUsers, deleteUser };
