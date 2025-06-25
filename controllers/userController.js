const db = require('../db/database');

const getAllUsers = (req, res) => {
  db.all('SELECT id, nombre, apellido, email FROM users', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener usuarios:', err.message);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    // Formatea nombre y apellido juntos
    const users = rows.map(user => ({
      id: user.id,
      name: `${user.nombre} ${user.apellido}`,
      email: user.email
    }));

    res.json(users);
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
