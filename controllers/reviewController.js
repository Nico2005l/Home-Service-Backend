const db = require('../db/database');

exports.create = (req, res) => {
  const { user_id, service_id, rating, comment } = req.body;
  if (!user_id || !service_id || !rating) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  db.run(
    `INSERT INTO reviews (user_id, service_id, rating, comment) VALUES (?, ?, ?, ?)`,
    [user_id, service_id, rating, comment],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
};

exports.getByService = (req, res) => {
  const serviceId = req.params.serviceId;
  db.all(`SELECT * FROM reviews WHERE service_id = ?`, [serviceId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};