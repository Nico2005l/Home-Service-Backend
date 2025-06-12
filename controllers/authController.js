const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const { nombre, apellido, email, telefono, dni, password, ubicacion , fechanacimiento} = req.body;
  const hash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (nombre, apellido, email, telefono, dni, password, ubicacion, fechanacimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, email, telefono, dni, hash, ubicacion, fechanacimiento],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nombre, email });
    }
  );
};

exports.login = (req, res) => { 
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

    res.json({ token, role: user.role });
  });
};

exports.getProfile = (req, res) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  // Verificar el token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });

    const userId = decoded.id;
    db.get(
      `SELECT nombre, apellido, email, telefono, dni FROM users WHERE id = ?`,
      [userId],
      (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'Usuario no encontrado' });
       res.json({
      user: {
        id: user.id,
        name: user.nombre + ' ' + user.apellido,
        email: user.email,
        birthdate: user.fechanacimiento || null,
        location: user.ubicacion || null,
        phone: user.telefono,
        dni: user.dni,
        role: user.role
      },
      token
    });
      }
    );
  });
};

exports.editProfile = (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });

    const userId = decoded.id;
    const { nombre, apellido, telefono } = req.body;

    db.run(
      `UPDATE users SET nombre = ?, apellido = ?, telefono = ? WHERE id = ?`,
      [nombre, apellido, telefono, userId],
      function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Perfil actualizado correctamente' });
      }
    );
  });
};
