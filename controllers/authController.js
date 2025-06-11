const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const { nombre, apellido, email, telefono, dni, password, birthdate, location } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (nombre, apellido, email, telefono, dni, password, birthdate, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, email, telefono, dni, hash, birthdate, location],
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
    res.json({
      user: {
        id: user.id,
        name: user.nombre + ' ' + user.apellido,
        email: user.email,
        birthdate: user.birthdate || null,
        location: user.location || null,
        phone: user.telefono,
        dni: user.dni,
        role: user.role
      },
      token
    });
  });
};
